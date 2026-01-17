import { sendEmail } from "../../utils/communication.js";
import { logger } from "../../utils/logger.js";

/**
 * Send issue confirmation email to the user who reported the issue
 */
const sendIssueConfirmationEmail = async (issueData) => {
    try {
        const { title, category, priority, description, reportedBy, _id } =
            issueData;

        const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UNMA - Issue Reported Successfully</title>
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
            .priority-high {
                color: #dc3545;
                font-weight: bold;
            }
            .priority-medium {
                color: #ffc107;
                font-weight: bold;
            }
            .priority-low {
                color: #28a745;
                font-weight: bold;
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
            .description-box {
                background: white;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #e9ecef;
                margin-top: 10px;
                font-style: italic;
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
                <div class="title">Issue Reported Successfully</div>
            </div>
            
            <div class="greeting">
                Dear ${reportedBy.name || reportedBy.email},
            </div>
            
            <p><strong>Thank you for reporting an issue!</strong> Your concern has been successfully submitted and our team will review it shortly. Below are the details of your reported issue:</p>
            
            <div class="section">
                <div class="section-title">Issue Details</div>
                <div class="info-grid">
                    <div class="info-label">Issue ID:</div>
                    <div class="info-value">#${_id}</div>
                    <div class="info-label">Title:</div>
                    <div class="info-value">${title}</div>
                    <div class="info-label">Category:</div>
                    <div class="info-value">${category}</div>
                    <div class="info-label">Priority:</div>
                    <div class="info-value priority-${priority.toLowerCase()}">${priority.toUpperCase()}</div>
                    <div class="info-label">Status:</div>
                    <div class="info-value" style="color: #ffc107; font-weight: bold;">Open</div>
                    <div class="info-label">Reported Date:</div>
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
                
                ${description
                ? `
                <div style="margin-top: 15px;">
                    <div class="info-label">Description:</div>
                    <div class="description-box">${description}</div>
                </div>
                `
                : ""
            }
            </div>
            
            <div class="section">
                <div class="section-title">Reporter Information</div>
                <div class="info-grid">
                    <div class="info-label">Name:</div>
                    <div class="info-value">${reportedBy.name || "Not provided"
            }</div>
                    <div class="info-label">Email:</div>
                    <div class="info-value">${reportedBy.email}</div>
                    <div class="info-label">Contact:</div>
                    <div class="info-value">${reportedBy.phone || "Not provided"
            }</div>
                </div>
            </div>
            
            <div class="note">
                <strong>What happens next?</strong>
                <br>• Our technical team will review your issue within 24-48 hours
                <br>• You will receive updates via email on the progress
                <br>• For urgent issues, you can contact us at info@unma.in
                <br>• Please save your Issue ID (#${_id}) for future reference
            </div>
            
            <div class="highlight">
                🎯 Issue ID: #${_id} - Keep this for your records!
            </div>
            
            <div class="footer">
                <p><strong>TEAM UNMA</strong></p>
                <p>Technical Support Team</p>
                <p>info@unma.in</p>
                <p style="font-size: 12px; color: #999;">This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

        // Send the email
        await sendEmail(
            reportedBy.email,
            "UNMA - Issue Reported Successfully",
            emailTemplate
        );

        logger.info(
            `Issue confirmation email sent to ${reportedBy.email} for issue #${_id}`
        );

        return {
            success: true,
            issueId: _id,
            recipient: reportedBy.email,
        };
    } catch (error) {
        logger.error(`Failed to send issue confirmation email: ${error.message}`);
        throw error;
    }
};


const sendIssueClosedEmail = async (issueData) => {
    try {
        const { title, category, priority, description, reportedBy, _id } =
            issueData;

        const emailTemplate = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>UNMA - Issue Closed</title>
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">UNMA</div>
                    <div class="title">Issue Closed</div>
                </div>
                <div class="greeting">
                    Dear ${reportedBy.name || reportedBy.email},
                </div>
                <p><strong>Your issue has been closed.</strong> Thank you for your patience and understanding.</p>
                <p>If you have any further questions or need assistance, please feel free to contact us at info@unma.in</p>
                <p>Best regards,</p>
                <p>TEAM UNMA</p>
            </div>
        </body>
        </html>

        `

        await sendEmail(
            reportedBy.email,
            "UNMA - Issue Closed",
            emailTemplate
        );

        logger.info(
            `Issue closed email sent to ${reportedBy.email} for issue #${_id}`
        );

        return {
            success: true,
            issueId: _id,
            recipient: reportedBy.email,
        };

    } catch (error) {
        logger.error(`Failed to send issue closed email: ${error.message}`);
        throw error;
    }
}

export {
    sendIssueConfirmationEmail,
    sendIssueClosedEmail
};