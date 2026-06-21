import { sendEmail } from "../../utils/email.js";
import { logger } from "../../utils/logger.js";

export const sendFifaCodeEmail = async ({ name, email, code }) => {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your UNMA FIFA Prediction Code</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0f7f4; }
        .container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a472a 0%, #2d6a4f 100%); color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .code-box { background: #f0f7f4; border: 2px dashed #d4af37; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-family: monospace; font-size: 32px; letter-spacing: 4px; color: #1a472a; font-weight: bold; }
        .btn { display: inline-block; background: #d4af37; color: #1a472a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚽ UNMA FIFA Prediction Contest</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Welcome to the UNMA FIFA World Cup Prediction Contest! Here is your personal access code:</p>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <p>Enter this code along with your email at the link below to submit your predictions:</p>
          <p style="text-align: center;">
            <a href="${frontendUrl}/fifa/play" class="btn">Start Predicting</a>
          </p>
          <p>Your code works for the whole tournament — save this email!</p>
        </div>
        <div class="footer">
          <p>If you did not request this, you can ignore this email.</p>
          <p>United Navodayan Malayalee Association (UNMA)</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "⚽ Your UNMA FIFA Prediction Code",
      html,
    });
    logger.info(`FIFA code email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send FIFA code email to ${email}: ${error.message}`);
    throw error;
  }
};
