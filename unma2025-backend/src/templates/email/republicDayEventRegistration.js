import { sendEmail } from "../../utils/communication.js";
import { logger } from "../../utils/logger.js";

/**
 * Send Republic Day Event registration confirmation email
 */
export const sendRepublicDayEventRegistrationEmail = async (registration) => {
    try {
        // Format payment date if available
        const formatPaymentDate = (date) => {
            if (!date) return "Not provided";
            try {
                const paymentDate = new Date(date);
                return paymentDate.toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
            } catch (error) {
                return "Not provided";
            }
        };

        // Format registration date
        const registrationDate = new Date(registration.registrationDate || Date.now());
        const formattedRegDate = registrationDate.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UNMA Republic Day Event - Registration Confirmation</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 700px;
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
                border-bottom: 3px solid #FF6B35;
                padding-bottom: 20px;
                margin-bottom: 30px;
                background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 10px 10px 0 0;
                margin: -30px -30px 30px -30px;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .title {
                font-size: 24px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            .subtitle {
                font-size: 16px;
                opacity: 0.95;
            }
            .success-box {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border: 2px solid #28a745;
                color: #155724;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin: 20px 0;
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
                border-left: 4px solid #FF6B35;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                color: #FF6B35;
                margin-bottom: 15px;
                text-transform: uppercase;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 12px;
                margin-bottom: 10px;
            }
            .info-label {
                font-weight: bold;
                color: #555;
            }
            .info-value {
                color: #333;
            }
            .event-details {
                background: linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%);
                border: 2px solid #FF6B35;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .event-item {
                margin: 12px 0;
                padding: 10px;
                background: white;
                border-radius: 5px;
                border-left: 3px solid #FF6B35;
            }
            .event-item strong {
                color: #FF6B35;
            }
            .participation-badges {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            .badge {
                background: #FF6B35;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
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
            .highlight {
                background: linear-gradient(135deg, #fff5f0 0%, #ffe8e0 100%);
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                font-weight: bold;
                color: #FF6B35;
                margin: 20px 0;
                border: 2px solid #FF6B35;
            }
            @media (max-width: 600px) {
                .info-grid {
                    grid-template-columns: 1fr;
                }
                .participation-badges {
                    flex-direction: column;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🇮🇳 UNMA</div>
                <div class="title">Registration Confirmed!</div>
                <div class="subtitle">UNMA 2nd Anniversary & 77th Republic Day Celebration</div>
            </div>
            
            <div class="success-box">
                ✅ Welcome! Your registration has been successfully submitted.
            </div>
            
            <div class="greeting">
                Dear <strong>${registration.name}</strong>,
            </div>
            
            <p>We are thrilled to confirm your registration for the <strong>UNMA 2nd Anniversary & 77th Republic Day Celebration</strong>! 🎉</p>
            
            <p>Thank you for being part of this special occasion. We look forward to celebrating together and creating wonderful memories.</p>
            
            <div class="section">
                <div class="section-title">📅 Event Details</div>
                <div class="event-details">
                    <div class="event-item">
                        <strong>Event:</strong> UNMA 2nd Anniversary & 77th Republic Day Celebration
                    </div>
                    <div class="event-item">
                        <strong>Date:</strong> Sunday, January 26, 2026
                    </div>
                    <div class="event-item">
                        <strong>Time:</strong> 8:30 AM - 6:30 PM
                    </div>
                    <div class="event-item">
                        <strong>Venue:</strong> T. K. Ramakrishnan Samskarika Kendram, Near Boat Jetty, Ernakulam
                        <br>
                        <a href="https://maps.app.goo.gl/NUWZEvhBqacPNdR77" target="_blank" style="color: #FF6B35; text-decoration: none; font-weight: 600; margin-top: 5px; display: inline-block;">
                            📍 Get Directions on Google Maps
                        </a>
                    </div>
                    <div class="event-item" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #FF6B35;">
                        <strong>📍 Special Highlight:</strong> UNMA Blood Donation Drive (8:30 AM - 5:30 PM) in collaboration with Kerala Police Officers Association and Indian Medical Association
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">👤 Your Registration Information</div>
                <div class="info-grid">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">${registration.name}</div>
                    <div class="info-label">Email:</div>
                    <div class="info-value">${registration.email}</div>
                    <div class="info-label">Phone Number:</div>
                    <div class="info-value">${registration.phoneNumber}</div>
                    <div class="info-label">JNV School:</div>
                    <div class="info-value">${registration.jnvSchool}${registration.jnvOther ? ` (${registration.jnvOther})` : ""}</div>
                    ${registration.batchYear ? `
                    <div class="info-label">Batch Year:</div>
                    <div class="info-value">${registration.batchYear}</div>
                    ` : ""}
                    <div class="info-label">Food Preference:</div>
                    <div class="info-value">${registration.foodChoice}</div>
                    ${registration.familyMembersCount ? `
                    <div class="info-label">Family Members/Friends:</div>
                    <div class="info-value">${registration.familyMembersCount} ${registration.familyMembersCount === 1 ? "person" : "people"}</div>
                    ` : ""}
                    <div class="info-label">Registration Date:</div>
                    <div class="info-value">${formattedRegDate}</div>
                </div>
            </div>
            
            ${(registration.participateBloodDonation ||
                registration.participateNationalSong ||
                registration.joinBoatRide ||
                registration.readyToVolunteer) ? `
            <div class="section">
                <div class="section-title">🎯 Your Participation</div>
                <div class="participation-badges">
                    ${registration.participateBloodDonation ? '<span class="badge">🩸 Blood Donation</span>' : ''}
                    ${registration.participateNationalSong ? '<span class="badge">🎵 National Song</span>' : ''}
                    ${registration.joinBoatRide ? '<span class="badge">🚤 Boat Ride</span>' : ''}
                    ${registration.readyToVolunteer ? '<span class="badge">🤝 Volunteer</span>' : ''}
                </div>
            </div>
            ` : ""}
            
            ${registration.interestedInSponsorship ? `
            <div class="section">
                <div class="section-title">💼 Sponsorship Interest</div>
                <p>Thank you for your interest in sponsoring the event! Our team will contact you soon with more details.</p>
            </div>
            ` : ""}
            
            ${registration.paymentMethod ? `
            <div class="section">
                <div class="section-title">💳 Payment Information</div>
                <div class="info-grid">
                    <div class="info-label">Payment Method:</div>
                    <div class="info-value">${registration.paymentMethod}</div>
                    ${registration.transactionId ? `
                    <div class="info-label">Transaction ID:</div>
                    <div class="info-value">${registration.transactionId}</div>
                    ` : ""}
                    ${registration.amountPaid ? `
                    <div class="info-label">Amount Paid:</div>
                    <div class="info-value">₹${registration.amountPaid}</div>
                    ` : ""}
                    ${registration.paymentDate ? `
                    <div class="info-label">Payment Date:</div>
                    <div class="info-value">${formatPaymentDate(registration.paymentDate)}</div>
                    ` : ""}
                </div>
            </div>
            ` : ""}
            
            <div class="highlight">
                🎊 We're excited to have you join us for this celebration! More details about the venue and schedule will be shared soon.
            </div>
            
            <div class="note">
                <strong>📝 Important Notes:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Please keep this email for your records</li>
                    <li>You will receive further updates about the event via email</li>
                    <li>If you have any questions, please contact us at the email below</li>
                </ul>
            </div>
            
            <div class="footer">
                <p><strong>TEAM UNMA</strong></p>
                <p>United Navodayan Malayalee Association</p>
                <p style="margin-top: 10px;">
                    <a href="mailto:info@unma.in" style="color: #FF6B35; text-decoration: none;">info@unma.in</a>
                </p>
                <p style="font-size: 12px; color: #999; margin-top: 15px;">
                    This is an automated confirmation email. Please do not reply to this email.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

        await sendEmail(
            registration.email,
            "UNMA Republic Day Event - Registration Confirmed! 🎉",
            emailTemplate
        );

        logger.info(
            `Republic Day Event registration confirmation email sent to ${registration.email}`
        );

        return {
            success: true,
            recipient: registration.email,
            subject: "UNMA Republic Day Event - Registration Confirmed! 🎉",
        };
    } catch (error) {
        logger.error(
            `Failed to send Republic Day Event registration email: ${error.message}`
        );
        throw error;
    }
};
