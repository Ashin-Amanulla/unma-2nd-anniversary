import { createCanvas, loadImage, registerFont } from "canvas";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class IDCardGenerator {
  constructor() {
    this.templatePath = path.join(__dirname, "../qr-code/Frame 54.jpg");
    this.cardWidth = null; // Will be set dynamically from template
    this.cardHeight = null; // Will be set dynamically from template
    this.templateImage = null;
  }

  async loadTemplate() {
    try {
      if (!this.templateImage) {
        this.templateImage = await loadImage(this.templatePath);
        this.cardWidth = this.templateImage.width;
        this.cardHeight = this.templateImage.height;
      }
    } catch (error) {
      console.error("Error loading template:", error);
      throw new Error(`Template image not found at ${this.templatePath}`);
    }
  }

  calculateTextCoordinates() {
    // Calculate relative positions based on image dimensions
    // These percentages are approximated based on the template layout
    const coords = {
      name: {
        x: this.cardWidth * 0.15, // 15% from left
        y: this.cardHeight * 0.25, // 23% from top (inside name box)
        width: this.cardWidth * 0.7, // 70% of width
        fontSize: Math.floor(this.cardWidth * 0.045), // Dynamic font size
        fontColor: "#FFFFFF",
      },
      id: {
        x: this.cardWidth * 0.04, // 30% from left
        y: this.cardHeight * 0.81, // 62% from top (below "ID:" label)
        width: this.cardWidth * 0.35, // 35% of width
        fontSize: Math.floor(this.cardWidth * 0.028),
        fontColor: "#000000",
      },
      school: {
        x: this.cardWidth * 0.16, // 15% from left
        y: this.cardHeight * 0.345, // 72% from top (inside left bottom box)
        width: this.cardWidth * 0.35, // 35% of width
        fontSize: Math.floor(this.cardWidth * 0.030),
        fontColor: "#FFFFFF",
      },
      yearOfPassing: {
        x: this.cardWidth * 0.65, // 65% from left
        y: this.cardHeight * 0.345, // 72% from top (inside right bottom box)
        width: this.cardWidth * 0.25, // 25% of width
        fontSize: Math.floor(this.cardWidth * 0.035),
        fontColor: "#FFFFFF",
      },
      qrCode: {
        x: this.cardWidth * 0.10, // 30% from left (center the QR code)
        y: this.cardHeight * 0.41, // 42% from top (inside the QR box area)
        size: Math.floor(this.cardWidth * 0.45), // 40% of width
      },
    };

    return coords;
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Draw each line
    // Note: x should be the center position when textAlign is "center"
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i].trim(), x, y + i * lineHeight);
    }

    return lines.length;
  }

  async generateIDCard(registrationData) {
    try {
      // Load template first
      await this.loadTemplate();

      // Create canvas with template dimensions
      const canvas = createCanvas(this.cardWidth, this.cardHeight);
      const ctx = canvas.getContext("2d");

      // Draw template image as background
      ctx.drawImage(this.templateImage, 0, 0, this.cardWidth, this.cardHeight);

      // Calculate coordinates
      const coords = this.calculateTextCoordinates();

      // Draw registration details with dynamic positioning
      await this.drawRegistrationDetails(ctx, registrationData, coords);

      // Generate and draw QR code
      await this.drawQRCode(ctx, registrationData, coords.qrCode);

      return canvas.toBuffer("image/png");
    } catch (error) {
      console.error("Error generating ID card:", error);
      throw error;
    }
  }

  drawRegistrationDetails(ctx, data, coords) {
    // Extract data with fallbacks
    const name =
      data.name || data.formDataStructured?.personalInfo?.name || "N/A";
    const school =
      data.formDataStructured?.personalInfo?.school ||
      data.formDataStructured?.personalInfo?.customSchoolName ||
      "N/A";
    const yearOfPassing =
      data.formDataStructured?.personalInfo?.yearOfPassing || "N/A";
    const serialNumber = data.serialNumber || "N/A";

    // Set base text properties
    ctx.fillStyle = coords.name.fontColor; // Dark text color

    // 1. NAME FIELD - Draw inside the name input box (CENTER ALIGNED)
    ctx.font = `bold ${coords.name.fontSize}px Arial`;
    ctx.textAlign = "center"; // Center align for name
    const nameText = this.truncateText(ctx, name, coords.name.width);
    // Calculate center position: x + half of the width
    const nameCenterX = coords.name.x + coords.name.width / 2;
    ctx.fillText(nameText, nameCenterX, coords.name.y);

    // Reset text alignment to left for other fields
    // ctx.textAlign = "left";

    // 2. ID FIELD - Draw below "ID:" label
    ctx.font = `${coords.id.fontSize}px Arial`;
    ctx.fillStyle = coords.id.fontColor; // Dark text color
    ctx.textAlign = "center"; // Center align for school
    const idText = this.truncateText(
      ctx,
      `ID: ${serialNumber}`,
      coords.id.width
    );
    const idCenterX = coords.id.x + coords.id.width / 2;

    ctx.fillText(idText, idCenterX, coords.id.y);

    // 3. SCHOOL FIELD - Draw inside the left bottom box (CENTER ALIGNED)
    ctx.font = `${coords.school.fontSize}px Arial`;
    ctx.fillStyle = coords.school.fontColor; // Dark text color
    ctx.textAlign = "center"; // Center align for school
    const schoolText = this.truncateText(ctx, school, coords.school.width);
    // Calculate center position for school field
    const schoolCenterX = coords.school.x + coords.school.width / 2;
    this.wrapText(
      ctx,
      schoolText,
      schoolCenterX,
      coords.school.y,
      coords.school.width,
      coords.school.fontSize + 2
    );

    // 4. YEAR OF PASSOUT FIELD - Draw inside the right bottom box (CENTER ALIGNED)
    ctx.font = `${coords.yearOfPassing.fontSize}px Arial`;
    ctx.textAlign = "center"; // Center align for year
    const yearText = this.truncateText(
      ctx,
      yearOfPassing,
      coords.yearOfPassing.width
    );
    // Calculate center position for year field
    const yearCenterX = coords.yearOfPassing.x + coords.yearOfPassing.width / 2;
    ctx.fillText(yearText, yearCenterX, coords.yearOfPassing.y);
  }

  truncateText(ctx, text, maxWidth) {
    let truncated = text;
    while (
      ctx.measureText(truncated).width > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }
    if (truncated.length < text.length) {
      truncated = truncated.slice(0, -3) + "...";
    }
    return truncated;
  }

  generateVCard(data) {
    // Extract data with fallbacks
    const name =
      data.name || data.formDataStructured?.personalInfo?.name || "Unknown";
    const email =
      data.email || data.formDataStructured?.personalInfo?.email || "";
    const phone =
      data.contactNumber ||
      data.formDataStructured?.personalInfo?.contactNumber ||
      "";
    const profession =
      data.formDataStructured?.personalInfo?.profession || "";
    const whatsapp =
      data.whatsappNumber ||
      data.formDataStructured?.personalInfo?.whatsappNumber ||
      "";
    const school =
      data.formDataStructured?.personalInfo?.school ||
      data.formDataStructured?.personalInfo?.customSchoolName ||
      "";
    const yearOfPassing =
      data.formDataStructured?.personalInfo?.yearOfPassing || "";
    const registrationType = data.registrationType || "";
    const serialNumber = data.serialNumber || "";

    // Create combined note for better iPhone compatibility
    let noteContent = [];
    if (school) noteContent.push(`School: ${school}`);
    if (yearOfPassing) noteContent.push(`Year of Passing: ${yearOfPassing}`);
    if (registrationType) noteContent.push(`Registration: ${registrationType}`);
    if (serialNumber) noteContent.push(`Serial: ${serialNumber}`);
    if (profession) noteContent.push(`Profession: ${profession}`);

    const note = noteContent.length > 0 ? noteContent.join("\\n") : "";

    // Create vCard 3.0 format with better iPhone compatibility
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${name}`,
      `N:${name.split(" ").reverse().join(";")}`, // Last;First format
      email ? `EMAIL:${email}` : "",
      phone ? `TEL;TYPE=CELL:${phone}` : "",
      whatsapp && whatsapp !== phone ? `TEL;TYPE=HOME:${whatsapp}` : "",
      // Use ORG for school (will appear as Company on iPhone)
      school ? `ORG:${school}` : "",

      // Use TITLE for year/batch (will appear as Job Title on iPhone)  
      yearOfPassing ? `TITLE:${yearOfPassing} batch` : "",

      // Add NOTE field which is well-supported across platforms
      note ? `NOTE:${note}` : "",

      // Add URL
      "URL:https://summit2025.unma.in",

      // Optional: Add a category for grouping
      "CATEGORIES:Summit 2025,UNMA",

      "END:VCARD",
    ]
      .filter(
        (line) => line && !line.includes(":undefined") && !line.includes(": ") && line !== ":"
      )
      .join("\n");

    return vcard;
  }
  async drawQRCode(ctx, registrationData, qrCoords) {
    try {
      // Generate vCard data for QR code
      const vCardData = this.generateVCard(registrationData);

      const qrCodeBuffer = await QRCode.toBuffer(vCardData, {
        width: qrCoords.size,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M", // Medium error correction for vCard data
      });

      const qrImage = await loadImage(qrCodeBuffer);

      // Position QR code using dynamic coordinates
      const qrX = qrCoords.x;
      const qrY = qrCoords.y;
      const qrSize = qrCoords.size;

      // Draw QR code with subtle border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

      // Draw QR code
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    } catch (error) {
      console.error("Error generating vCard QR code:", error);
      // Fallback: draw placeholder
      const qrX = qrCoords.x;
      const qrY = qrCoords.y;
      const qrSize = qrCoords.size;

      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#6b7280";
      ctx.font = `${Math.floor(qrSize * 0.08)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("vCARD", qrX + qrSize / 2, qrY + qrSize / 2);
    }
  }

  // Save ID card to file system
  async saveIDCard(registrationData, filename = null) {
    try {
      const imageBuffer = await this.generateIDCard(registrationData);

      // Generate filename if not provided
      if (!filename) {
        const date = new Date().toISOString().split("T")[0];
        const safeName = (registrationData.name || "unknown").replace(
          /[^a-zA-Z0-9]/g,
          "_"
        );
        const id = registrationData._id || "no_id";
        filename = `${date}_${safeName}_${id}.png`;
      }

      const outputPath = path.join(
        __dirname,
        "../../generated-id-cards",
        filename
      );

      // Ensure directory exists
      const dirPath = path.dirname(outputPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Save file
      fs.writeFileSync(outputPath, imageBuffer);

      return {
        success: true,
        filename,
        path: outputPath,
      };
    } catch (error) {
      console.error("Error saving ID card:", error);
      throw error;
    }
  }

  async generatePDF(registrationData) {
    try {
      const puppeteer = await import("puppeteer");

      // Generate image first
      const imageBuffer = await this.generateIDCard(registrationData);
      const base64Image = imageBuffer.toString("base64");

      // Create HTML for PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>UNMA 2026 Registration ID Card</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: #f8f9fa;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .id-card-container {
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .id-card-image {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
            }
            .print-info {
              margin-top: 20px;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="id-card-container">
            <img src="data:image/png;base64,${base64Image}" alt="UNMA 2026 ID Card" class="id-card-image" />
            <div class="print-info">
              <p>UNMA 2026 Registration ID Card</p>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Launch browser and generate PDF
      const browser = await puppeteer.default.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(html);

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm",
        },
      });

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }
}

export default IDCardGenerator;
