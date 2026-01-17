// Export all email template functions from this module
export { sendRegistrationConfirmationEmail } from "./index.js";
export { sendPaymentConfirmationEmail } from "./payment-confirmation.js";
export { sendIssueConfirmationEmail } from "./issue-confirmation.js";
export {
  sendContactMessageEmail,
  sendContactConfirmationEmail,
  sendContactResponseEmail,
} from "./contact-message.js";
export { sendRepublicDayEventRegistrationEmail } from "./republicDayEventRegistration.js";

// You can add more email templates here in the future:
// export { sendWelcomeEmail } from "./welcome.js";
// export { sendReminderEmail } from "./reminder.js";
// export { sendNotificationEmail } from "./notification.js";
