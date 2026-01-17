import { sendEmail } from "../../utils/communication.js";
import { logger } from "../../utils/logger.js";

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (
  registration,
  transactionId,
  amount
) => {
  try {
    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UNMA Summit 2025 - Payment Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
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
                border-bottom: 3px solid #28a745;
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
                color: #28a745;
                margin-bottom: 10px;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .success-box {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                margin: 20px 0;
            }
            .section {
                margin-bottom: 25px;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #28a745;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #28a745;
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
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #28a745;
                text-align: center;
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
                background-color: #e7f3ff;
                border: 1px solid #bee5eb;
                color: #0c5460;
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
                <div class="title">Payment Confirmation</div>
            </div>
            
            <div class="greeting">
                Dear ${registration.name},
            </div>
            
            <div class="success-box">
                ✅ Payment Successful!
            </div>
            
            <p>Thank you for your contribution to UNMA Summit 2025. Your payment has been processed successfully.</p>
            
            <div class="amount">
                Amount Paid: ₹${amount}
            </div>
            
            <div class="section">
                <div class="section-title">Payment Details</div>
                <div class="info-grid">
                    <div class="info-label">Transaction ID:</div>
                    <div class="info-value">${transactionId}</div>
                    <div class="info-label">Payment Date:</div>
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
                    <div class="info-label">Amount:</div>
                    <div class="info-value">₹${amount}</div>
                    <div class="info-label">Status:</div>
                    <div class="info-value" style="color: #28a745; font-weight: bold;">Completed</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Your Information</div>
                <div class="info-grid">
                    <div class="info-label">Name:</div>
                    <div class="info-value">${registration.name}</div>
                    <div class="info-label">Email:</div>
                    <div class="info-value">${registration.email}</div>
                    <div class="info-label">Contact:</div>
                    <div class="info-value">${registration.contactNumber}</div>
                </div>
            </div>
            
            <div class="note">
                <strong>Note:</strong> Please keep this email for your records. This serves as your payment receipt for UNMA Summit 2025.
            </div>
            
            <p>If you have any questions regarding your payment, please contact us at summit2025@unma.in</p>
            
            <div class="footer">
                <p><strong>TEAM UNMA</strong></p>
                <p>summit2025@unma.in</p>
                <p style="font-size: 12px; color: #999;">This is an automated payment confirmation email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    await sendEmail(
      registration.email,
      "UNMA Summit 2025 - Payment Confirmation",
      emailTemplate
    );

    logger.info(
      `Payment confirmation email sent to ${registration.email} for transaction ${transactionId}`
    );

    return {
      success: true,
      recipient: registration.email,
      transactionId: transactionId,
      amount: amount,
    };
  } catch (error) {
    logger.error(`Failed to send payment confirmation email: ${error.message}`);
    throw error;
  }
};
