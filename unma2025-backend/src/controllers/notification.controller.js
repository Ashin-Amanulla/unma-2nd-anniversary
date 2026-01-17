import Registration from "../models/Registration.js";
import Notification from "../models/notification.js";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger.js";
import { sendEmail } from "../utils/email.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

/**
 * Generate notification QR code for registration desk
 */
export const generateNotificationQR = async (registrationData) => {
  try {
    // Create unique URL for registration desk entry
    const baseUrl = process.env.FRONTEND_URL || "https://summit2025.unma.in";
    const entryUrl = `${baseUrl}/admin/entry?registrationId=${registrationData.serialNumber}`;

    // Generate QR code with URL
    const qrCodeBuffer = await QRCode.toBuffer(entryUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error correction for important data
    });

    // Create notification data for response
    const notificationData = {
      id: registrationData.serialNumber || registrationData._id,
      entryUrl: entryUrl,
      registrationId: registrationData._id,
      name:
        registrationData.name ||
        registrationData.formDataStructured?.personalInfo?.name,
      school:
        registrationData.formDataStructured?.personalInfo?.school ||
        registrationData.formDataStructured?.personalInfo?.customSchoolName,
      batch: registrationData.formDataStructured?.personalInfo?.yearOfPassing,
      attendees: calculateTotalAttendees(registrationData),
      type: "UNMA_REGISTRATION_DESK",
      generated: new Date().toISOString(),
    };

    return {
      qrCode: qrCodeBuffer,
      data: notificationData,
    };
  } catch (error) {
    logger.error("Error generating notification QR:", error);
    throw error;
  }
};

/**
 * Calculate total number of attendees from registration data
 */
const calculateTotalAttendees = (registrationData) => {
  const attendees =
    registrationData.formDataStructured?.eventAttendance?.attendees || {};

  let total = 0;

  // Count adults
  if (attendees.adults) {
    total += (attendees.adults.veg || 0) + (attendees.adults.nonVeg || 0);
  }

  // Count teens
  if (attendees.teens) {
    total += (attendees.teens.veg || 0) + (attendees.teens.nonVeg || 0);
  }

  // Count children
  if (attendees.children) {
    total += (attendees.children.veg || 0) + (attendees.children.nonVeg || 0);
  }

  // Count toddlers
  if (attendees.toddlers) {
    total += (attendees.toddlers.veg || 0) + (attendees.toddlers.nonVeg || 0);
  }

  return total || 1; // At least 1 (the registrant themselves)
};

/**
 * Save notification record to database
 */
const saveNotificationRecord = async (
  registrationId,
  email,
  whatsapp,
  emailSent,
  whatsappSent,
  serialNumber
) => {
  try {
    const notificationData = {
      registrationId,
      email: email || "",
      whatsapp: whatsapp || "",
      emailSent: emailSent || false,
      emailSentAt: emailSent ? new Date() : null,
      whatsappSent: whatsappSent || false,
      whatsappSentAt: whatsappSent ? new Date() : null,
      serialNumber: serialNumber || "",
    };

    // Check if notification record already exists
    const existingNotification = await Notification.findOne({ registrationId });

    if (existingNotification) {
      // Update existing record
      await Notification.findByIdAndUpdate(existingNotification._id, {
        $set: notificationData,
      });
      logger.info(
        `Updated notification record for registration ${registrationId}`
      );
    } else {
      // Create new record
      const notification = new Notification(notificationData);
      await notification.save();
      logger.info(
        `Created notification record for registration ${registrationId}`
      );
    }
  } catch (error) {
    logger.error("Error saving notification record:", error);
    // Don't throw error to avoid disrupting the main notification flow
  }
};

/**
 * Send notification email to alumni
 */
export const sendAlumniNotificationEmail = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { sendEmail: shouldSendEmail = true, sendWhatsApp = true } = req.body;

    // Fetch registration data
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Validate required data
    const email =
      registration.email ||
      registration.formDataStructured?.personalInfo?.email;
    const phone =
      registration.contactNumber ||
      registration.formDataStructured?.personalInfo?.contactNumber;
    const whatsapp =
      registration.whatsappNumber ||
      registration.formDataStructured?.personalInfo?.whatsappNumber ||
      phone;

    if (!email && !phone) {
      return res.status(400).json({
        status: "error",
        message: "No email or phone number found for registration",
      });
    }

    // Generate QR code for notification
    const { qrCode, data: qrData } = await generateNotificationQR(registration);
    const results = [];
    let emailSent = false;
    let whatsappSent = false;

    // Send email notification
    if (shouldSendEmail && email) {
      try {
        const emailContent = generateEmailContent(registration, qrData);
        await sendEmail({
          to: email,
          subject: "UNMA Summit 2025 - Registration Confirmation & QR Code",
          html: emailContent,
          attachments: [
            {
              filename: `UNMA_QR_${qrData.id}.png`,
              content: qrCode,
              contentType: "image/png",
              disposition: "attachment",
              cid: `qr_code_${qrData.id}`, // Content ID for inline images
            },
            {
              filename: "UNMA_Summit_2025_Event_Details.pdf",
              content: fs.readFileSync(
                path.join(process.cwd(), "src", "doc", "unma-event-sch.pdf")
              ),
              contentType: "application/pdf",
              disposition: "attachment",
            },
          ],
        });

        emailSent = true;
        results.push({
          type: "email",
          status: "sent",
          recipient: email,
        });
      } catch (error) {
        logger.error("Error sending email:", error);
        results.push({
          type: "email",
          status: "failed",
          recipient: email,
          error: error.message,
        });
      }
    }

    // Send WhatsApp notification
    if (sendWhatsApp && whatsapp) {
      try {
        const bodyData = {
          name: registration.name,
          district: registration.formDataStructured?.personalInfo?.school,
          batch: registration.formDataStructured?.personalInfo?.yearOfPassing,
          attendees: calculateTotalAttendees(registration),
          registrationId: registration.serialNumber,
        };
        await sendWhatsAppMessage(whatsapp, qrCode, bodyData);
        whatsappSent = true;
        results.push({
          type: "whatsapp",
          status: "sent",
          recipient: whatsapp,
        });
      } catch (error) {
        logger.error("Error sending WhatsApp:", error);
        results.push({
          type: "whatsapp",
          status: "failed",
          recipient: whatsapp,
          error: error.message,
        });
      }
    }

    // Save notification record to database
    await saveNotificationRecord(
      registrationId,
      email,
      whatsapp,
      emailSent,
      whatsappSent,
      qrData.id
    );

    // Update registration with notification sent flag
    await Registration.findByIdAndUpdate(registrationId, {
      $set: {
        notificationSent: true,
        notificationSentAt: new Date(),
        qrData: qrData,
      },
    });

    logger.info(
      `Notifications sent for registration ${registrationId}:`,
      results
    );

    return res.status(200).json({
      status: "success",
      message: "Notifications sent successfully",
      data: {
        registrationId,
        qrData,
        results,
      },
    });
  } catch (error) {
    logger.error("Error sending alumni notification:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to send notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Bulk send notifications to multiple alumni
 */
export const bulkSendNotifications = async (req, res) => {
  try {
    const {
      registrationIds,
      sendEmail = true,
      sendWhatsApp = true,
    } = req.body;

    if (
      !registrationIds ||
      !Array.isArray(registrationIds) ||
      registrationIds.length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Array of registration IDs is required",
      });
    }

    // Limit bulk processing
    if (registrationIds.length > 100) {
      return res.status(400).json({
        status: "error",
        message: "Maximum 100 notifications can be sent at once",
      });
    }

    const results = [];
    const errors = [];

    for (const registrationId of registrationIds) {
      try {
        const registration = await Registration.findById(registrationId);
        if (!registration) {
          errors.push({
            registrationId,
            error: "Registration not found",
          });
          continue;
        }

        // Generate QR and send notifications
        const { qrCode, data: qrData } = await generateNotificationQR(
          registration
        );
        const notificationResults = [];
        let emailSent = false;
        let whatsappSent = false;

        // Email
        if (sendEmail && registration.email) {
          try {
            const emailContent = generateEmailContent(registration, qrData);
            await sendEmail({
              to: registration.email,
              subject: "UNMA Summit 2025 - Registration Confirmation & QR Code",
              html: emailContent,
              attachments: [
                {
                  filename: `UNMA_QR_${qrData.id}.png`,
                  content: qrCode,
                  contentType: "image/png",
                  disposition: "attachment",
                  cid: `qr_code_${qrData.id}`,
                },
              ],
            });
            emailSent = true;
            notificationResults.push({ type: "email", status: "sent" });
          } catch (error) {
            notificationResults.push({
              type: "email",
              status: "failed",
              error: error.message,
            });
          }
        }

        // WhatsApp
        if (sendWhatsApp && registration.contactNumber) {
          try {
            const whatsappMessage = generateWhatsAppMessage(
              registration,
              qrData
            );
            await sendWhatsAppMessage(
              registration.contactNumber,
              whatsappMessage,
              qrCode
            );
            whatsappSent = true;
            notificationResults.push({ type: "whatsapp", status: "sent" });
          } catch (error) {
            notificationResults.push({
              type: "whatsapp",
              status: "failed",
              error: error.message,
            });
          }
        }

        // Save notification record to database
        await saveNotificationRecord(
          registrationId,
          registration.email,
          registration.contactNumber,
          emailSent,
          whatsappSent,
          qrData.id
        );

        // Update registration
        await Registration.findByIdAndUpdate(registrationId, {
          $set: {
            notificationSent: true,
            notificationSentAt: new Date(),
            qrData: qrData,
          },
        });

        results.push({
          registrationId,
          name: registration.name,
          qrData,
          notifications: notificationResults,
        });
      } catch (error) {
        errors.push({
          registrationId,
          error: error.message,
        });
      }
    }

    logger.info(
      `Bulk notifications completed: ${results.length} successful, ${errors.length} failed`
    );

    return res.status(200).json({
      status: "success",
      message: `Sent notifications to ${results.length} alumni`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: registrationIds.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    logger.error("Error in bulk notification sending:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to send bulk notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Generate email content for alumni notification
 */
const generateEmailContent = (registration, qrData) => {
  const name =
    registration.name ||
    registration.formDataStructured?.personalInfo?.name ||
    "Dear Alumni";
  const school = qrData.school || "N/A";
  const batch = qrData.batch || "N/A";
  const attendees = qrData.attendees;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>UNMA Summit 2025 - Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .qr-section { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .disclaimer { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 UNMA Summit 2025</h1>
          <p>Registration Confirmation</p>
        </div>
        
        <div class="content">
          <h2>Dear ${name},</h2>
          
          <p>Congratulations! Your registration for the UNMA Summit 2025 has been confirmed. We're excited to see you at this momentous gathering of Navodaya alumni.</p>
          
          <div class="info-box">
            <h3>📋 Your Registration Details</h3>
            <ul>
              <li><strong>Full Name:</strong> ${name}</li>
              <li><strong>JNV District:</strong> ${school}</li>
              <li><strong>Batch:</strong> ${batch}</li>
              <li><strong>Number of Attendees:</strong> ${attendees}</li>
              <li><strong>Registration ID:</strong> ${qrData.id}</li>
            </ul>
          </div>
          
                     <div class="qr-section">
             <h3>📱 Your Registration QR Code</h3>
             <p><strong>IMPORTANT:</strong> Please save this QR code and bring it (either printed or on your phone) to the registration desk.</p>
             <div style="text-align: center; margin: 20px 0;">
               <img src="cid:qr_code_${qrData.id}" alt="Registration QR Code" style="max-width: 200px; height: auto; border: 2px solid #e5e7eb; border-radius: 8px;"/>
             </div>
             <p>The QR code is also attached to this email as <code>UNMA_QR_${qrData.id}.png</code> for easy saving.</p>
           </div>
          
          <div class="disclaimer">
            <h4>⚠️ Important Instructions</h4>
            <ul>
              <li>Present this QR code at the registration desk upon arrival</li>
              <li>Our team will scan the code to verify your registration</li>
              <li>You will receive your official ID card and attendee wrist bands</li>
              <li>Keep your ID safe as this contains your personal information as a contact.</li>
              <li>Lost ID cards cannot be replaced during the event</li>
            </ul>
          </div>
          
          <p>We look forward to welcoming you at the UNMA Summit 2025. This will be an unforgettable celebration of the Navodaya legacy!</p>
          
          <p><strong>Event Details:</strong><br>
          📅 Date: 30 August 2025<br>
          📍 Venue:  CIAL Trade Fair and Exhibition Center, Kochi<br>
          🕘 Registration starts: 8:30 AM</p>
        </div>
        
        <div class="footer">
          <p>UNMA Summit 2025 | United Navodayan Malayalee Association </p>
          <p>🌐 <a href="https://summit2025.unma.in " style="color: #60a5fa;">summit2025.unma.in</a> | 📧 Contact: info@unma.in</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate WhatsApp message for alumni notification
 */
const generateWhatsAppMessage = (registration, qrData) => {
  const name =
    registration.name ||
    registration.formDataStructured?.personalInfo?.name ||
    "Alumni";
  const school = qrData.school || "N/A";
  const batch = qrData.batch || "N/A";
  const attendees = qrData.attendees;

  return `🎉 *UNMA Summit 2025 - Registration Confirmed!*

Dear *${name}*,

Your registration has been confirmed! Here are your details:

📋 *Registration Details:*
• *Name:* ${name}
• *JNV District:* ${school}  
• *Batch:* ${batch}
• *Attendees:* ${attendees}
• *ID:* ${qrData.id}

📱 *QR Code Instructions:*
Your registration QR code is attached. Please:
✅ Save this QR code
✅ Bring it to registration desk (printed or on phone)
✅ Our team will scan to verify your registration
✅ Collect your ID card and wristbands

⚠️ *Important:*
• Keep your ID card safe throughout the event
• ID card contains your personal information
• Lost ID cards cannot be replaced

🎊 We're excited to see you at UNMA Summit 2025!

🌐 unma.in | 📧 info@unma.in`;
};

/**
 * Send notifications to all registered alumni (Tuesday evening batch job)
 */
export const sendTuesdayNotifications = async (req, res) => {
  try {
    const { dryRun = false } = req.query;

    // Find all confirmed registrations that haven't received notifications
    const registrations = await Registration.find({
      formSubmissionComplete: true,
      emailVerified: true,
      notificationSent: { $ne: true },
    }).select("_id name email contactNumber formDataStructured");

    if (registrations.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No registrations found for notification",
        data: { count: 0 },
      });
    }

    if (dryRun) {
      return res.status(200).json({
        status: "success",
        message: "Dry run completed",
        data: {
          count: registrations.length,
          registrations: registrations.map((r) => ({
            id: r._id,
            name: r.name,
            email: r.email,
          })),
        },
      });
    }

    // Process registrations in batches
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < registrations.length; i += batchSize) {
      batches.push(registrations.slice(i, i + batchSize));
    }

    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const batch of batches) {
      const batchIds = batch.map((r) => r._id);

      // Use existing bulk send function
      try {
        const bulkResult = await bulkSendNotifications(
          {
            body: {
              registrationIds: batchIds,
              sendEmail: true,
              sendWhatsApp: true,
            },
          },
          {
            status: () => ({ json: (data) => data }),
          }
        );

        totalSent += bulkResult.data.successful.length;
        totalFailed += bulkResult.data.failed.length;
        results.push(bulkResult.data);
      } catch (error) {
        logger.error("Error in batch processing:", error);
        totalFailed += batch.length;
      }
    }

    logger.info(
      `Tuesday notifications completed: ${totalSent} sent, ${totalFailed} failed`
    );

    return res.status(200).json({
      status: "success",
      message: `Tuesday notifications sent to ${totalSent} alumni`,
      data: {
        totalRegistrations: registrations.length,
        totalSent,
        totalFailed,
        batches: results.length,
      },
    });
  } catch (error) {
    logger.error("Error in Tuesday notifications:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to send Tuesday notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get notification history for a specific registration
 */
export const getNotificationHistory = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const notifications = await Notification.find({ registrationId })
      .populate("registrationId", "name email contactNumber serialNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      data: notifications,
    });
  } catch (error) {
    logger.error("Error fetching notification history:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch notification history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Bulk send notifications to paid registrations who haven't received notifications yet
 */
export const bulkSendNotificationsToPaidRegistrations = async (req, res) => {
  try {
    const { batchSize = 500 } = req.body;
    const adminId = req.user?.id;

    // Find registrations with completed payment and attending event
    const completedRegistrations = await Registration.find({
      $and: [
        {
          $or: [
            { paymentStatus: "Completed" },
            { "formDataStructured.financial.paymentStatus": "Completed" },
          ],
        },
        { "formDataStructured.eventAttendance.isAttending": true },
      ],
    });

    if (completedRegistrations.length === 0) {
      return res.status(404).json({
        status: "error",
        message:
          "No registrations found with completed payment status and attending event",
      });
    }

    // Check which registrations already have notification records
    const registrationIds = completedRegistrations.map((r) => r._id);
    const existingNotifications = await Notification.find({
      registrationId: { $in: registrationIds },
      $or: [
        { emailSent: true },
        { whatsappSent: true }
      ]
    }).select("registrationId");

    const existingNotificationMap = new Set(
      existingNotifications.map((notif) => notif.registrationId.toString())
    );

    // Filter to only include registrations without notification records
    const registrationsToProcess = completedRegistrations.filter(
      (reg) => !existingNotificationMap.has(reg._id.toString())
    );

    if (registrationsToProcess.length === 0) {
      return res.status(200).json({
        status: "success",
        message:
          "All paid and attending registrations already have notification records",
        data: {
          totalPaidAndAttendingRegistrations: completedRegistrations.length,
          alreadyProcessed: completedRegistrations.length,
          newlyProcessed: 0,
        },
      });
    }

    // Limit batch processing to prevent server overload
    const batchesToProcess = registrationsToProcess.slice(
      0,
      Math.min(batchSize, 500)
    );

    const results = [];
    const errors = [];

    // Process each registration
    for (const registration of batchesToProcess) {
      const startTime = Date.now();

      try {
        // Extract contact information
        const email =
          registration.email ||
          registration.formDataStructured?.personalInfo?.email;
        const phone =
          registration.contactNumber ||
          registration.formDataStructured?.personalInfo?.contactNumber;
        const whatsapp =
          registration.whatsappNumber ||
          registration.formDataStructured?.personalInfo?.whatsappNumber ||
          phone;

        if (!email && !whatsapp) {
          errors.push({
            registrationId: registration._id,
            name: registration.name,
            error: "No email or WhatsApp number found",
          });
          continue;
        }

        // Generate QR code for notification
        const { qrCode, data: qrData } = await generateNotificationQR(registration);
        let emailSent = false;
        let whatsappSent = false;
        const notificationResults = [];

        // Send email notification
        if (email) {
          try {
            const emailContent = generateEmailContent(registration, qrData);
            await sendEmail({
              to: email,
              subject: "UNMA Summit 2025 - Registration Confirmation & QR Code",
              html: emailContent,
              attachments: [
                {
                  filename: `UNMA_QR_${qrData.id}.png`,
                  content: qrCode,
                  contentType: "image/png",
                  disposition: "attachment",
                  cid: `qr_code_${qrData.id}`,
                },
                {
                  filename: "UNMA_Summit_2025_Event_Details.pdf",
                  content: fs.readFileSync(
                    path.join(process.cwd(), "src", "doc", "unma-event-sch.pdf")
                  ),
                  contentType: "application/pdf",
                  disposition: "attachment",
                },
              ],
            });
            emailSent = true;
            notificationResults.push({ type: "email", status: "sent", recipient: email });
          } catch (error) {
            logger.error("Error sending email:", error);
            notificationResults.push({
              type: "email",
              status: "failed",
              recipient: email,
              error: error.message,
            });
          }
        }

        // Send WhatsApp notification
        if (whatsapp) {
          try {
            const bodyData = {
              name: registration.name,
              district: registration.formDataStructured?.personalInfo?.school,
              batch: registration.formDataStructured?.personalInfo?.yearOfPassing,
              attendees: calculateTotalAttendees(registration),
              registrationId: registration.serialNumber,
            };
            await sendWhatsAppMessage(whatsapp, qrCode, bodyData);
            whatsappSent = true;
            notificationResults.push({ type: "whatsapp", status: "sent", recipient: whatsapp });
          } catch (error) {
            logger.error("Error sending WhatsApp:", error);
            notificationResults.push({
              type: "whatsapp",
              status: "failed",
              recipient: whatsapp,
              error: error.message,
            });
          }
        }

        // Save notification record to database
        await saveNotificationRecord(
          registration._id,
          email,
          whatsapp,
          emailSent,
          whatsappSent,
          qrData.id
        );

        // Update registration with notification sent flag
        await Registration.findByIdAndUpdate(registration._id, {
          $set: {
            notificationSent: true,
            notificationSentAt: new Date(),
            qrData: qrData,
          },
        });

        const duration = Date.now() - startTime;

        results.push({
          registrationId: registration._id,
          name: registration.name,
          email,
          whatsapp,
          notifications: notificationResults,
          duration,
          success: emailSent || whatsappSent,
        });
      } catch (error) {
        errors.push({
          registrationId: registration._id,
          name: registration.name,
          error: error.message,
        });
      }
    }

    logger.info(
      `Bulk notifications sent: ${results.length} successful, ${errors.length} failed`
    );

    return res.status(200).json({
      status: "success",
      message: `Sent notifications to ${results.length} paid and attending registrations`,
      data: {
        totalPaidAndAttendingRegistrations: completedRegistrations.length,
        alreadyProcessed: existingNotifications.length,
        newlyProcessed: batchesToProcess.length,
        successful: results,
        failed: errors,
        remaining: Math.max(
          0,
          registrationsToProcess.length - batchesToProcess.length
        ),
        summary: {
          total: batchesToProcess.length,
          successful: results.length,
          failed: errors.length,
          emailsSent: results.filter(r => r.notifications.some(n => n.type === 'email' && n.status === 'sent')).length,
          whatsappSent: results.filter(r => r.notifications.some(n => n.type === 'whatsapp' && n.status === 'sent')).length,
        },
      },
    });
  } catch (error) {
    logger.error(
      "Error sending bulk notifications to paid and attending registrations:",
      error
    );
    return res.status(500).json({
      status: "error",
      message:
        "Failed to send bulk notifications to paid and attending registrations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total notifications sent
      Notification.countDocuments(),

      // Email notifications sent
      Notification.countDocuments({ emailSent: true }),

      // WhatsApp notifications sent
      Notification.countDocuments({ whatsappSent: true }),

      // Both email and WhatsApp sent
      Notification.countDocuments({
        emailSent: true,
        whatsappSent: true,
      }),

      // Failed notifications (neither email nor WhatsApp sent)
      Notification.countDocuments({
        emailSent: false,
        whatsappSent: false,
      }),

      // Recent notifications (last 24 hours)
      Notification.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    // Get daily notification counts for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: 1 },
          emailSent: {
            $sum: { $cond: ["$emailSent", 1, 0] },
          },
          whatsappSent: {
            $sum: { $cond: ["$whatsappSent", 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const notificationStats = {
      summary: {
        totalNotifications: stats[0],
        emailsSent: stats[1],
        whatsappSent: stats[2],
        bothSent: stats[3],
        failed: stats[4],
        recentNotifications: stats[5],
      },
      dailyStats,
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({
      status: "success",
      data: notificationStats,
    });
  } catch (error) {
    logger.error("Error fetching notification stats:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch notification statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
