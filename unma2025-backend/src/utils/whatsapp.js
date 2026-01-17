import axios from "axios";
import {
  WHATSAPP_PHONE_NUMBER_ID,
  FLUXCHAT_API_KEY,
  WHATSAPP_API_TOKEN,
} from "../config/config.js";
import FormData from "form-data";

const META_TOKEN = WHATSAPP_API_TOKEN;

export const sendWhatsAppOtp = async (phoneNumber, otp) => {
  const API_URL = `https://fluxchat.io/api/v2/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const requestBody = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "unma_phone_verification",
      language: {
        code: "en_US",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
      ],
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${FLUXCHAT_API_KEY}`,
  };

  try {
    const response = await axios.post(API_URL, requestBody, { headers });
    console.log("whatsapp message sent successfully");
    return response.data;
  } catch (error) {
    console.error(
      "Error sending WhatsApp OTP:",
      error.response?.data || error.message
    );
    throw new Error("Failed to send WhatsApp message");
  }
};

/**
 * Send WhatsApp message with attachment (for notifications)
 */
export const sendWhatsAppMessage = async (
  phoneNumber,
  qrBuffer,
  { name, district, batch, attendees, registrationId }
) => {
  // ✅ Step 1: Generate QR Code in memory
  // const qrBuffer = await QRCode.toBuffer(`${registrationId}`, {
  //   errorCorrectionLevel: "H",
  //   type: "png",
  //   width: 300,
  // });

  // ✅ Step 2: Upload QR image to Meta Graph API
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "image/png");
  form.append("file", qrBuffer, {
    filename: "qrcode.png",
    contentType: "image/png",
  });

  let mediaId;
  try {
    const uploadRes = await axios.post(
      `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/media`,
      form,
      {
        headers: {
          Authorization: `Bearer ${META_TOKEN}`,
          ...form.getHeaders(),
        },
      }
    );
    mediaId = uploadRes.data.id;
    console.log("✅ Uploaded QR, media_id:", mediaId);
  } catch (error) {
    console.error("❌ Upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload QR image to WhatsApp");
  }
console.log(mediaId,name,district,batch,attendees,registrationId);
  // ✅ Step 3: Send template with media_id
  const requestBody = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: "unma_receipt", // must match approved template name
      language: { code: "en_US" },
      components: [
     
        {
          type: "body",
          parameters: [
            { type: "text", text: String(name) },
            { type: "text", text: String(district) },
            { type: "text", text: String(batch) },
            { type: "text", text: String(attendees) },
            { type: "text", text: String(registrationId) },
          ],
          },   {
          type: "header",
          parameters: [{ type: "image", image: { id: mediaId } }],
        },
      ],
    },
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${META_TOKEN}`,
        },
      }
    );
    console.log("✅ Template sent successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Send failed:", error.response?.data || error.message);
    throw new Error("Failed to send WhatsApp template");
  }
};
