import nodemailer from "nodemailer";
import { logger } from "./logger.js";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} from "../config/config.js";

// Create a transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// Send email function
export const sendEmail = async (data) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: EMAIL_FROM,
      to: data.to,
      subject: data.subject,
      html: data.html,
      attachments: data.attachments || [], // Add attachments support
    };

    // Log attachment details for debugging
    if (data.attachments && data.attachments.length > 0) {
      logger.info(
        `Email has ${data.attachments.length} attachments:`,
        data.attachments.map((att) => ({
          filename: att.filename,
          contentType: att.contentType,
          size: att.content ? `${att.content.length} bytes` : "unknown",
          disposition: att.disposition,
          cid: att.cid,
        }))
      );
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId} to ${data.to}`);
    return info;
  } catch (error) {
    logger.error("Error sending email:", error);
    throw error;
  }
};
