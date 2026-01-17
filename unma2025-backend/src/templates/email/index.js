import { sendEmail } from "../../utils/communication.js";
import { logger } from "../../utils/logger.js";

/**
 * Email template configurations and helper functions
 */

/**
 * Get attendee counts from registration data
 */
const getAttendeeCounts = (registration) => {
  const attendanceData = registration.formDataStructured?.eventAttendance || {};
  const attendees = attendanceData.attendees || {};

  let counts = {
    adults: { veg: 0, nonVeg: 0 },
    teen: { veg: 0, nonVeg: 0 },
    child: { veg: 0, nonVeg: 0 },
    toddler: { veg: 0, nonVeg: 0 },
  };

  // Check if attendees is already in counts format (object with veg/nonVeg counts)
  if (attendees && typeof attendees === "object" && !Array.isArray(attendees)) {
    // Map the frontend format to our email template format
    counts = {
      adults: attendees.adults || { veg: 0, nonVeg: 0 },
      teen: attendees.teens || { veg: 0, nonVeg: 0 },
      child: attendees.children || { veg: 0, nonVeg: 0 },
      toddler: attendees.toddlers || { veg: 0, nonVeg: 0 },
    };
  } else if (Array.isArray(attendees)) {
    // Legacy format - calculate counts from array
    attendees.forEach((attendee) => {
      const ageGroup = attendee.ageGroup || "adults";
      const foodPreference = attendee.foodPreference || "veg";

      if (counts[ageGroup] && counts[ageGroup][foodPreference] !== undefined) {
        counts[ageGroup][foodPreference]++;
      }
    });
  }

  return counts;
};

/**
 * Get email configuration based on payment status
 */
const getEmailConfig = (registration) => {
  const paymentStatus = registration.paymentStatus;
  const financialPaymentStatus =
    registration.formDataStructured?.financial?.paymentStatus;

  if (financialPaymentStatus === "Completed") {
    return {
      subject: "UNMA Summit 2025 - Registration Confirmed & Payment Received",
      title: "Registration Confirmed - Payment Successful",
      greeting:
        "<strong>Congratulations!</strong> You have successfully registered for UNMA Summit 2025 and your payment has been processed. Kindly find below the registration and event details.",
      type: "completed",
    };
  } else if (financialPaymentStatus === "financial-difficulty") {
    return {
      subject: "UNMA Summit 2025 - Registration is Under Review",
      title: "Registration is Under Review - Under Special Consideration ",
      greeting:
        "<strong>Thank you for your interest to attend UNMA Summit 2025.</strong> Please note that your registration is under review. In order to confirm your registration, kindly communicate your financial difficulty with your JNV alumni association leadership / your board of trustees / your batch representatives. Your leadership will coordinate with organising team to complete registration.<p>As you are genuinely facing financial difficulty, kindly reach out to your JNV Alumni Association Leadership or Board of Trustees or Batch Representative who can help complete your registration.</p> <p>Your alumni leadership/ your batch representative might be busy, hence kindly follow up until you get the registration confirmation.</p>",
      type: "financial_difficulty",
    };
  } else if (financialPaymentStatus === "foreign-transaction") {
    return {
      subject:
        "UNMA Summit 2025 - Registration is Under Review (International Payment Under Review)",
      title: "Registration is Under Review - International Payment Under Review",
      greeting:
        "<strong>Welcome to UNMA Summit 2025!</strong> Your registration has not been confirmed. Our team will contact you soon with international payment confirmation. Kindly find below the registration and event details.",
      type: "foreign_transaction",
    };
  } else {
    return {
      subject:
        "UNMA Summit 2025 - Registration is Under Review (Payment Under Review)",
      title: "Registration is Under Review - Payment Under Review",
      greeting:
        "<strong>Thank you for registering!</strong> Your registration for UNMA Summit 2025 has not been confirmed. You can complete the payment at your convenience. Kindly find below the registration and event details.",
      type: "pending",
    };
  }
};

/**
 * Generate payment details section based on status
 */
const getPaymentDetailsSection = (registration) => {
  const paymentStatus = registration.paymentStatus;
  const financialPaymentStatus =
    registration.formDataStructured?.financial?.paymentStatus;

  if (financialPaymentStatus === "Completed") {
    return `
    <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="info-grid">
            <div class="info-label">Payment Status:</div>
            <div class="info-value" style="color: #28a745; font-weight: bold;">Completed ✅</div>
            <div class="info-label">Transaction ID:</div>
            <div class="info-value">${registration.formDataStructured?.financial?.paymentId || "N/A"
      }</div>
            <div class="info-label">Contribution Amount:</div>
            <div class="info-value">₹${registration.formDataStructured?.financial?.contributionAmount ||
      0
      }</div>
            <div class="info-label">Payment Method:</div>
            <div class="info-value">${registration.formDataStructured?.financial?.paymentMethod ||
      "Online"
      }</div>
        </div>
        <div class="highlight" style="background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;">
            🎉 Thank you for your contribution! Your payment has been successfully processed.
        </div>
    </div>`;
  } else if (financialPaymentStatus === "financial-difficulty") {
    return `
    <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="info-grid">
            <div class="info-label">Payment Status:</div>
            <div class="info-value" style="color: #ffc107; font-weight: bold;">Financial Difficulty Acknowledged 🤝</div>
            <div class="info-label">Contribution Amount:</div>
            <div class="info-value">₹0</div>
            <div class="info-label">Registration Status:</div>
            <div class="info-value" style="color: #dc3545; font-weight: bold;">Under Review</div>
        </div>
        <div class="note" style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404;">
            <strong>Special Consideration:</strong> We understand your financial situation. 
            However, you need to coordinate with your alumni leadership to complete the registration process.
        </div>
        <div class="highlight" style="background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;">
            ⚠️ Registration pending - Need Alumni leadership coordination
        </div>
    </div>`;
  } else if (financialPaymentStatus === "foreign-transaction") {
    return `
    <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="info-grid">
            <div class="info-label">Payment Status:</div>
            <div class="info-value" style="color: #17a2b8; font-weight: bold;">Foreign Transaction Pending 🌍</div>
            <div class="info-label">Contribution Amount:</div>
            <div class="info-value">${(() => {
        try {
          const paymentDetails =
            typeof registration.formDataStructured?.financial
              ?.paymentDetails === "string"
              ? JSON.parse(
                registration.formDataStructured.financial.paymentDetails
              )
              : registration.formDataStructured?.financial
                ?.paymentDetails;

          const currency = paymentDetails?.currency || "Unknown Currency";
          const amount = paymentDetails?.amount || "TBD";
          return `${currency} ${amount}`;
        } catch (error) {
          return "Unknown Currency TBD";
        }
      })()}</div>
            <div class="info-label">Payment Method:</div>
            <div class="info-value">International Transfer</div>
            <div class="info-label">Registration Status:</div>
            <div class="info-value" style="color: #dc3545; font-weight: bold;">Under Review</div>
        </div>
        <div class="note" style="background-color: #e2f3ff; border: 1px solid #bee5eb; color: #0c5460;">
            <strong>International Payment Notice:</strong> 
            <br>• Our team will contact you within 2-3 business days
            <br>• Your registration is under review, but will be confirmed once payment is confirmed by the team     
            <br>• For immediate assistance, contact us at summit2025@unma.in
        </div>
        <div class="highlight" style="background-color: #e7f3ff; color: #2c5aa0; border: 1px solid #bee5eb;">
            🌟 Thank you for your international participation! We'll facilitate your payment process.
        </div>
    </div>`;
  } else {
    // Default case for pending or other statuses
    return `
    <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="info-grid">
            <div class="info-label">Payment Status:</div>
            <div class="info-value" style="color: #ffc107; font-weight: bold;">Pending</div>
            <div class="info-label">Contribution Amount:</div>
            <div class="info-value">₹${registration.formDataStructured?.financial?.contributionAmount ||
      0
      }</div>
            <div class="info-label">Registration Status:</div>
            <div class="info-value" style="color: #dc3545; font-weight: bold;">Under Review</div>
        </div>
        <div class="note" style="background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404;">
            <strong>Payment Pending:</strong> Your registration will be confirmed once payment is completed. 
            You can complete the payment at your convenience or contact us at summit2025@unma.in for assistance.
        </div>
    </div>`;
  }
};

/**
 * Send registration confirmation email based on payment status
 */
export { sendIssueConfirmationEmail, sendIssueClosedEmail } from './issue-confirmation.js';

export const sendRegistrationConfirmationEmail = async (registration) => {
  try {
    const emailConfig = getEmailConfig(registration);
    const counts = getAttendeeCounts(registration);
    const sponsorshipData = registration.formDataStructured?.sponsorship || {};
    const paymentDetailsSection = getPaymentDetailsSection(registration);
    const isStaff = registration.registrationType === "Staff";

    // Generate email template
    const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UNMA Summit 2025 - Registration Confirmation</title>
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
            .schedule-item {
                margin-bottom: 8px;
                padding: 8px;
                background: white;
                border-radius: 4px;
                border-left: 3px solid #28a745;
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
            .attendee-counts {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            .count-card {
                background: white;
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                border: 2px solid #e9ecef;
            }
            .count-title {
                font-weight: bold;
                color: #2c5aa0;
                margin-bottom: 10px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e9ecef;
                color: #666;
            }
            .note {
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
                .attendee-counts {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">UNMA</div>
                <div class="title">${emailConfig.title}</div>
            </div>
            
            <div class="greeting">
                Dear ${registration.name},
            </div>
            
            <p>${emailConfig.greeting}</p>

           
            
            
            <div class="section">
                <div class="section-title">Event Details</div>
                <div class="info-grid">
                    <div class="info-label">Venue:<span class="info-value">CIAL Trade Fair and Exhibition Center, Nedumbassery, Kochi, Kerala</span>  </div>
                    
                    <div class="info-label">Date & Time:<span class="info-value">30 Aug 2025, 09:00 AM to 8:00 PM</span>  </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Program Schedule</div>
                <p style="font-style: italic; color: #666; margin-bottom: 15px;">*Tentative Schedule (Based on BOT Meeting)</p>
                <div class="schedule-item"><strong>9:00 AM - 10:00 AM:</strong> Registration & Networking</div>
                <div class="schedule-item"><strong>10:00 AM - 12:00 PM:</strong> Public Function</div>
                <div class="schedule-item"><strong>12:00 PM - 12:30 PM:</strong> Group Photo</div>
                <div class="schedule-item"><strong>12:30 PM - 1:00 PM:</strong> Networking, Visit Stalls</div>
                <div class="schedule-item"><strong>1:00 PM - 2:00 PM:</strong> Lunch Break</div>
                <div class="schedule-item"><strong>2:00 PM - 5:30 PM:</strong> Cultural Programs</div>
                <div class="schedule-item"><strong>5:30 PM - 6:00 PM:</strong> Tea & Networking</div>
                <div class="schedule-item"><strong>6:00 PM - 8:00 PM:</strong> Live Entertainment</div>
                <div class="schedule-item"><strong>8:00 PM:</strong> Closing</div>
            </div>
            
            <div class="section">
                <div class="section-title">Your Personal Information</div>
                <div class="info-grid">
                    <div class="info-label">Full Name:<span class="info-value">${registration.name
      }</span>  </div>
                    <div class="info-label">Email:<span class="info-value">${registration.email
      }</span>  </div>
                    <div class="info-label">Contact Number:<span class="info-value">${registration.whatsappNumber
      }</span>  </div>
                    <div class="info-label">WhatsApp:<span class="info-value">${registration.formDataStructured?.personalInfo
        ?.contactNumber || registration.whatsappNumber
      }</span>  </div>
                    ${!isStaff ? `
                     <div class="info-label">School:<span class="info-value">${registration.formDataStructured?.personalInfo?.school
        }</span>  </div>
                   
                  
                      <div class="info-label">Year of Passing:<span class="info-value">${registration.formDataStructured?.personalInfo
          ?.yearOfPassing
        }</span>  </div>
                       `: ``}
                </div>
            </div>
            
            ${registration.formDataStructured?.eventAttendance?.isAttending
        ? `
            <div class="section">
                <div class="section-title">Event Attendance Details</div>
                <div class="attendee-counts">
                    <div class="count-card">
                        <div class="count-title">Adults</div>
                        <div>Veg: ${counts.adults.veg} | Non-Veg: ${counts.adults.nonVeg}</div>
                    </div>
                    <div class="count-card">
                        <div class="count-title">12-18 Years</div>
                        <div>Veg: ${counts.teen.veg} | Non-Veg: ${counts.teen.nonVeg}</div>
                    </div>
                    <div class="count-card">
                        <div class="count-title">6-12 Years</div>
                        <div>Veg: ${counts.child.veg} | Non-Veg: ${counts.child.nonVeg}</div>
                    </div>
                    <div class="count-card">
                        <div class="count-title">2-5 Years</div>
                        <div>Veg: ${counts.toddler.veg} | Non-Veg: ${counts.toddler.nonVeg}</div>
                    </div>
                </div>
            </div>
            `
        : '<div class="highlight">You have indicated that you will not be attending the event.</div>'
      }
            
            ${sponsorshipData.isInterested
        ? `
            <div class="section">
                <div class="section-title">Sponsorship Details</div>
                <div class="info-grid">
                    <div class="info-label">Sponsorship Interest:<span class="info-value">Yes</span>  </div>
                    <div class="info-label">Sponsorship Type:<span class="info-value">${sponsorshipData.sponsorshipType || "Not specified"
        }</span>  </div>
                    <div class="info-label">Company/Organization:<span class="info-value">${sponsorshipData.companyName || "Not specified"
        }</span>  </div>
                    ${sponsorshipData.contactPerson
          ? `
                    <div class="info-label">Contact Person:<span class="info-value">${sponsorshipData.contactPerson}</span>  </div>
                    `
          : ""
        }
                </div>
            </div>
            `
        : ""
      }
            
            ${paymentDetailsSection}
            
          
            <div class="highlight">
                Thank you for your interest in UNMA Summit 2025!
            </div>
            
            <div class="footer">
                <p><strong>TEAM UNMA</strong></p>
                <p>Summit2025@unma.in</p>
                <p style="font-size: 12px; color: #999;">This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send the email
    await sendEmail(registration.email, emailConfig.subject, emailTemplate);

    logger.info(
      `Registration confirmation email sent to ${registration.email} - Type: ${emailConfig.type}`
    );

    return {
      success: true,
      emailType: emailConfig.type,
      subject: emailConfig.subject,
      recipient: registration.email,
    };
  } catch (error) {
    logger.error(
      `Failed to send registration confirmation email: ${error.message}`
    );
    throw error;
  }
};
