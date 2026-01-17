import { sendEmail } from "../../utils/communication.js";
import { logger } from "../../utils/logger.js";

/**
 * Parse contact message string to extract individual fields
 */
const parseContactMessage = (messageString) => {
  try {
    const lines = messageString
      .split("\n")
      .filter((line) => line.trim() !== "");

    let parsedData = {
      name: null,
      email: null,
      phone: null,
      message: null,
    };

    let messageStartIndex = -1;

    // Parse each line to extract fields
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("Name:")) {
        parsedData.name = line.replace("Name:", "").trim();
      } else if (line.startsWith("Email:")) {
        parsedData.email = line.replace("Email:", "").trim();
      } else if (line.startsWith("Phone:")) {
        parsedData.phone = line.replace("Phone:", "").trim();
      } else if (line === "Message:") {
        messageStartIndex = i + 1;
        break;
      }
    }

    // Extract the actual message content
    if (messageStartIndex >= 0 && messageStartIndex < lines.length) {
      parsedData.message = lines.slice(messageStartIndex).join("\n").trim();
    }

    return parsedData;
  } catch (error) {
    logger.error(`Error parsing contact message: ${error.message}`);
    return {
      name: null,
      email: null,
      phone: null,
      message: messageString, // fallback to original message
    };
  }
};

/**
 * Send contact message response email
 */
export const sendContactMessageEmail = async (contactData) => {
  try {
    const { email, subject, message, name } = contactData;

    // Parse the message string to extract individual fields
    const parsedMessage = parseContactMessage(message);

    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UNMA - Message Received</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2c5aa0;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .section {
                margin-bottom: 25px;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #2c5aa0;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 15px;
                text-transform: uppercase;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 10px;
                margin-bottom: 10px;
            }
            .info-label {
                font-weight: bold;
                color: #555;
            }
            .info-value {
                color: #333;
            }
            .message-box {
                background: white;
                padding: 20px;
                border-radius: 5px;
                border: 1px solid #e9ecef;
                margin-top: 15px;
                font-style: italic;
                border-left: 4px solid #28a745;
            }
            .highlight {
                background-color: #e7f3ff;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
                color: #2c5aa0;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e9ecef;
                color: #666;
            }
            .note {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .response-timeline {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            @media (max-width: 600px) {
                .info-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">UNMA</div>
                <div class="title">Message Received - Thank You!</div>
            </div>
            
            <div class="greeting">
                Dear ${parsedMessage.name || name || "Valued Contact"},
            </div>
            
            <p><strong>Thank you for reaching out to us!</strong> We have successfully received your message and our team will review it shortly. Below are the details of your submitted message:</p>
            
            <div class="section">
                <div class="section-title">Message Details</div>
                <div class="info-grid">
                    <div class="info-label">From:</div>
                    <div class="info-value">${
                      parsedMessage.name || name || "Not provided"
                    }</div>
                    <div class="info-label">Email:</div>
                    <div class="info-value">${
                      parsedMessage.email || email || "Not provided"
                    }</div>
                    <div class="info-label">Phone:</div>
                    <div class="info-value">${
                      parsedMessage.phone || "Not provided"
                    }</div>
                    <div class="info-label">Received Date:</div>
                    <div class="info-value">${new Date().toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}</div>
                </div>
                
                <div style="margin-top: 15px;">
                    <div class="info-label">Your Message:</div>
                    <div class="message-box">${
                      parsedMessage.message || message
                    }</div>
                </div>
            </div>
            
            <div class="response-timeline">
                <strong>⏱️ Response Timeline:</strong>
                <br>• <strong>General Inquiries:</strong> We typically respond within 24-48 hours
                <br>• <strong>Technical Issues:</strong> Our team will respond within 12-24 hours
                <br>• <strong>Urgent Matters:</strong> For immediate assistance, call our support line
                <br>• <strong>Summit Related:</strong> Event-specific queries are prioritized during event season
            </div>
            
            <div class="note">
                <strong>What happens next?</strong>
                <br>• Our team will review your message carefully
                <br>• You will receive a personalized response to your email address
                <br>• For complex queries, we may schedule a call or video meeting
                <br>• Please check your spam folder if you don't see our response
            </div>
            
            <div class="section">
                <div class="section-title">Quick Contact Information</div>
                <div class="info-grid">
                    <div class="info-label">Primary Email:</div>
                    <div class="info-value">summit2025@unma.in</div>
                    <div class="info-label">Website:</div>
                    <div class="info-value">www.unma.in</div>
                    <div class="info-label">Response Hours:</div>
                    <div class="info-value">Monday - Friday, 9:00 AM - 6:00 PM IST</div>
                    <div class="info-label">Emergency Contact:</div>
                    <div class="info-value">For urgent matters during UNMA Summit 2025</div>
                </div>
            </div>
            
            <div class="highlight">
                📧 Your message has been logged and assigned for review - Thank you for contacting UNMA!
            </div>
            
            <div class="footer">
                <p><strong>TEAM UNMA</strong></p>
                <p>United Navodaya Alumni</p>
                <p>summit2025@unma.in | www.unma.in</p>
                <p style="font-size: 12px; color: #999;">This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send the email to the parsed email address (prioritize parsed email over original)
    const recipientEmail = parsedMessage.email || email;

    await sendEmail(
      recipientEmail,
      `UNMA - Message Received: ${subject}`,
      emailTemplate
    );

    logger.info(`Contact message confirmation email sent to ${recipientEmail}`);

    return {
      success: true,
      recipient: recipientEmail,
      subject: subject,
    };
  } catch (error) {
    logger.error(
      `Failed to send contact message confirmation email: ${error.message}`
    );
    throw error;
  }
};

/**
 * Send contact confirmation email to user
 */
export const sendContactConfirmationEmail = async (contactMessage) => {
  try {
    const { name, email, subject, message, category, priority, createdAt } =
      contactMessage;

    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UNMA - Message Received</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2c5aa0;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .section {
                margin-bottom: 25px;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #2c5aa0;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 15px;
                text-transform: uppercase;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 10px;
                margin-bottom: 10px;
            }
            .info-label {
                font-weight: bold;
                color: #555;
            }
            .info-value {
                color: #333;
            }
            .message-box {
                background: white;
                padding: 20px;
                border-radius: 5px;
                border: 1px solid #e9ecef;
                margin-top: 15px;
                font-style: italic;
                border-left: 4px solid #28a745;
            }
            .highlight {
                background-color: #e7f3ff;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
                color: #2c5aa0;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e9ecef;
                color: #666;
            }
            .note {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .response-timeline {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            @media (max-width: 600px) {
                .info-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">UNMA</div>
                <div class="title">Message Received - Thank You!</div>
            </div>
            
            <div class="greeting">
                Dear ${name || "Valued Contact"},
            </div>
            
            <p><strong>Thank you for reaching out to us!</strong> We have successfully received your message and our team will review it shortly. Below are the details of your submitted message:</p>
            
            <div class="section">
                <div class="section-title">Message Details</div>
                <div class="info-grid">
                    <div class="info-label">Subject:</div>
                    <div class="info-value">${subject}</div>
                    <div class="info-label">Category:</div>
                    <div class="info-value">${category}</div>
                    <div class="info-label">Priority:</div>
                    <div class="info-value">${priority}</div>
                    <div class="info-label">Received Date:</div>
                    <div class="info-value">${new Date(
                      createdAt
                    ).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</div>
                </div>
                
                <div style="margin-top: 15px;">
                    <div class="info-label">Your Message:</div>
                    <div class="message-box">${message}</div>
                </div>
            </div>
            
            <div class="response-timeline">
                <strong>⏱️ Response Timeline:</strong>
                <br>• <strong>General Inquiries:</strong> We typically respond within 24-48 hours
                <br>• <strong>Technical Issues:</strong> Our team will respond within 12-24 hours
                <br>• <strong>Urgent Matters:</strong> For immediate assistance, call our support line
                <br>• <strong>Summit Related:</strong> Event-specific queries are prioritized during event season
            </div>
            
            <div class="note">
                <strong>What happens next?</strong>
                <br>• Our team will review your message carefully
                <br>• You will receive a personalized response to your email address
                <br>• For complex queries, we may schedule a call or video meeting
                <br>• Please check your spam folder if you don't see our response
            </div>
            
            <div class="section">
                <div class="section-title">Quick Contact Information</div>
                <div class="info-grid">
                    <div class="info-label">Primary Email:</div>
                    <div class="info-value">summit2025@unma.in</div>
                    <div class="info-label">Website:</div>
                    <div class="info-value">www.unma.in</div>
                    <div class="info-label">Response Hours:</div>
                    <div class="info-value">Monday - Friday, 9:00 AM - 6:00 PM IST</div>
                </div>
            </div>
            
            <div class="highlight">
                📧 Your message has been logged and assigned for review - Thank you for contacting UNMA!
            </div>
            
            <div class="footer">
                <p><strong>TEAM UNMA</strong></p>
                <p>United Navodaya Alumni</p>
                <p>summit2025@unma.in | www.unma.in</p>
                <p style="font-size: 12px; color: #999;">This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail(
      email,
      `UNMA - Message Received: ${subject}`,
      emailTemplate
    );

    logger.info(`Contact confirmation email sent to ${email}`);

    return {
      success: true,
      recipient: email,
      subject: subject,
    };
  } catch (error) {
    logger.error(`Failed to send contact confirmation email: ${error.message}`);
    throw error;
  }
};

/**
 * Send response email to user
 */
export const sendContactResponseEmail = async (
  contactMessage,
  responseMessage
) => {
  try {
    const { name, email, subject } = contactMessage;

    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UNMA - Response to Your Message</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #2c5aa0;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .response-box {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #2c5aa0;
                margin: 20px 0;
            }
            .response-title {
                font-size: 18px;
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 15px;
            }
            .response-content {
                background: white;
                padding: 20px;
                border-radius: 5px;
                border: 1px solid #e9ecef;
                white-space: pre-wrap;
                line-height: 1.6;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e9ecef;
                color: #666;
            }
            .note {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">UNMA</div>
                <div class="title">Response to Your Message</div>
            </div>
            
            <div class="greeting">
                Dear ${name || "Valued Contact"},
            </div>
            
            <p>Thank you for contacting UNMA. We have reviewed your message regarding "<strong>${subject}</strong>" and have a response for you:</p>
            
            <div class="response-box">
                <div class="response-title">Our Response:</div>
                <div class="response-content">${responseMessage}</div>
            </div>
            
            <div class="note">
                <strong>Need further assistance?</strong>
                <br>• Feel free to reply to this email if you have follow-up questions
                <br>• Visit our website at www.unma.in for more information
                <br>• Contact us at summit2025@unma.in for additional support
            </div>
            
            <p>We appreciate your interest in UNMA and look forward to continuing our conversation.</p>
            
            <div class="footer">
                <p><strong>TEAM UNMA</strong></p>
                <p>United Navodaya Alumni</p>
                <p>summit2025@unma.in | www.unma.in</p>
                <p style="font-size: 12px; color: #999;">You can reply to this email to continue the conversation.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail(email, `UNMA - Re: ${subject}`, emailTemplate);

    logger.info(`Contact response email sent to ${email}`);

    return {
      success: true,
      recipient: email,
      subject: `Re: ${subject}`,
    };
  } catch (error) {
    logger.error(`Failed to send contact response email: ${error.message}`);
    throw error;
  }
};
