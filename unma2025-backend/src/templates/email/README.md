# Email Templates System

This directory contains all email templates used in the UNMA 2026 registration system. The templates are organized into separate modules for better maintainability and reusability.

## Directory Structure

```
templates/email/
├── index.js                 # Registration confirmation email templates
├── payment-confirmation.js  # Payment confirmation email template
├── all-templates.js         # Main export file for all templates
└── README.md               # This documentation
```

## Available Email Templates

### 1. Registration Confirmation Email (`sendRegistrationConfirmationEmail`)

**Location:** `index.js`  
**Purpose:** Sends different confirmation emails based on payment status

**Payment Status Scenarios:**

- **Completed Payment:** Green styling, celebration message, transaction details
- **Financial Difficulty:** Amber styling, instructions for alumni leadership coordination
- **Foreign Transaction:** Blue styling, international payment instructions
- **Pending Payment:** Yellow styling, payment completion instructions

**Usage:**

```javascript
import { sendRegistrationConfirmationEmail } from "../templates/email/all-templates.js";

// Send registration confirmation based on payment status
await sendRegistrationConfirmationEmail(registration);
```

**Email Content Includes:**

- Dynamic subject and title based on payment status
- Event details (venue, date, schedule)
- Personal information
- Attendance details (if attending)
- Sponsorship details (if interested)
- Payment-specific sections with different styling
- Important notes and contact information

### 2. Payment Confirmation Email (`sendPaymentConfirmationEmail`)

**Location:** `payment-confirmation.js`  
**Purpose:** Sends receipt confirmation when payment is processed

**Usage:**

```javascript
import { sendPaymentConfirmationEmail } from "../templates/email/all-templates.js";

// Send payment confirmation
await sendPaymentConfirmationEmail(registration, transactionId, amount);
```

**Email Content Includes:**

- Payment success confirmation
- Transaction details (ID, date, amount)
- User information
- Receipt notice

## Email Configuration Logic

### Registration Confirmation Email Types

1. **Payment Completed**

   - Subject: "UNMA Summit 2025 - Registration Confirmed & Payment Received"
   - Status: Confirmed ✅
   - Color: Green theme
   - Message: Celebratory confirmation

2. **Financial Difficulty**

   - Subject: "UNMA Summit 2025 - Registration Not Confirmed"
   - Status: Not Confirmed (Special Consideration)
   - Color: Amber theme
   - Message: Alumni leadership coordination required

3. **Foreign Transaction**

   - Subject: "UNMA Summit 2025 - Registration Not Confirmed (International Payment Pending)"
   - Status: Not Confirmed (International Processing)
   - Color: Blue theme
   - Message: Team will contact for payment options

4. **Pending Payment**
   - Subject: "UNMA Summit 2025 - Registration Not Confirmed (Payment Pending)"
   - Status: Not Confirmed
   - Color: Yellow theme
   - Message: Payment completion required

## How to Use in Controllers

### Import Templates

```javascript
import {
  sendRegistrationConfirmationEmail,
  sendPaymentConfirmationEmail,
} from "../templates/email/all-templates.js";
```

### Send Registration Confirmation

```javascript
// In your registration completion logic
if (step === 8 && registration.formSubmissionComplete) {
  try {
    await sendRegistrationConfirmationEmail(registration);
    logger.info(
      `Registration confirmation email sent to ${registration.email}`
    );
  } catch (emailError) {
    logger.error(
      `Failed to send registration confirmation email: ${emailError.message}`
    );
  }
}
```

### Send Payment Confirmation

```javascript
// In your payment processing logic
try {
  await sendPaymentConfirmationEmail(registration, transactionId, amount);
  logger.info(`Payment confirmation email sent to ${registration.email}`);
} catch (emailError) {
  logger.error(
    `Failed to send payment confirmation email: ${emailError.message}`
  );
}
```

## Data Structure Requirements

### Registration Object Structure

The registration object should contain:

```javascript
{
  _id: "registration_id",
  name: "User Name",
  email: "user@example.com",
  contactNumber: "+91-9876543210",
  paymentStatus: "Completed|Pending",
  paymentId: "transaction_id",
  contributionAmount: 2500,
  formDataStructured: {
    personalInfo: {
      whatsappNumber: "+91-9876543210",
      school: "JNV School Name",
      yearOfPassing: 2010
    },
    eventAttendance: {
      isAttending: true,
      attendees: {
        adults: { veg: 2, nonVeg: 1 },
        teens: { veg: 1, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 }
      }
    },
    sponsorship: {
      isInterested: true,
      sponsorshipType: "Gold Sponsor",
      companyName: "Company Name",
      contactPerson: "Contact Person"
    },
    financial: {
      paymentStatus: "Completed|financial difficulty|foreign transaction|Pending",
      paymentMethod: "UPI|Credit Card|etc",
      contributionAmount: 2500
    }
  }
}
```

## Adding New Email Templates

To add a new email template:

1. Create a new file in the `templates/email/` directory
2. Export your email function from the file
3. Add the export to `all-templates.js`
4. Update this README with documentation

Example:

```javascript
// templates/email/welcome.js
export const sendWelcomeEmail = async (user) => {
  // Your email template logic
};

// templates/email/all-templates.js
export { sendWelcomeEmail } from "./welcome.js";
```

## Error Handling

All email functions return a promise and include proper error handling:

```javascript
try {
  const result = await sendRegistrationConfirmationEmail(registration);
  console.log("Email sent successfully:", result);
} catch (error) {
  console.error("Email sending failed:", error);
  // Handle the error appropriately
}
```

## Email Styling

All emails use:

- Responsive design with mobile-first approach
- Consistent color scheme (UNMA brand colors)
- Clean, professional layout
- Grid-based information display
- Status-specific color coding

## Testing

Use the test files in `src/test/` to preview and test email templates:

- `email-templates-test.js` - Test functions
- `run-email-tests.js` - Command-line test runner

## Future Enhancements

Potential additions:

- OTP verification emails
- Event reminder emails
- Payment reminder emails
- Update confirmation emails
- Welcome emails for new registrations
