import { sendRegistrationConfirmationEmail } from "../templates/email/all-templates.js";
import { logger } from "../utils/logger.js";

/**
 * Test wrapper function to use the actual email templates with optional sending
 */
const testEmailTemplate = async (registration, sendActualEmail = false) => {
  console.log(`\n=== EMAIL TEST: ${registration.name} ===`);
  console.log(`Email: ${registration.email}`);
  console.log(`Payment Status: ${registration.paymentStatus}`);
  console.log(
    `Financial Payment Status: ${
      registration.formDataStructured?.financial?.paymentStatus || "N/A"
    }`
  );

  if (sendActualEmail) {
    try {
      console.log(`\n📧 Sending actual email to ${registration.email}...`);

      const result = await sendRegistrationConfirmationEmail(registration);

      console.log(`✅ Email sent successfully to ${registration.email}`);
      console.log(`📧 Subject: ${result.subject}`);
      console.log(`🏷️  Type: ${result.emailType}`);

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to send email to ${registration.email}:`,
        error.message
      );
      logger.error(`Failed to send test email: ${error.message}`);
      throw error;
    }
  } else {
    console.log(
      `\n📄 Email template would be generated (not sent - use sendActualEmail=true to send)`
    );
    console.log(
      `\nTo send this email, use: await sendRegistrationConfirmationEmail(registration)`
    );
  }

  console.log(`\n=== END EMAIL TEST ===\n`);
};

/**
 * Test 1: Payment Completed Scenario
 */
export const testPaymentCompletedEmail = async (sendActualEmail = false) => {
  console.log("🧪 Testing Payment Completed Email...");

  const sampleRegistration = {
    _id: "674d1a2b3c4e5f6789012345",
    name: "Rajesh Kumar",
    email: "ashin.jnv@gmail.com",
    contactNumber: "+91-9876543210",
    paymentStatus: "Completed",
    paymentId: "TXN-1703097234567-8901",
    contributionAmount: 2500,
    formDataStructured: {
      personalInfo: {
        name: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        contactNumber: "+91-9876543210",
        whatsappNumber: "+91-9876543210",
        school: "JNV Palakkad",
        yearOfPassing: 2010,
      },
      eventAttendance: {
        isAttending: true,
        attendees: {
          adults: { veg: 2, nonVeg: 1 },
          teens: { veg: 1, nonVeg: 0 },
          children: { veg: 0, nonVeg: 0 },
          toddlers: { veg: 0, nonVeg: 0 },
        },
      },
      sponsorship: {
        isInterested: true,
        sponsorshipType: "Gold Sponsor",
        companyName: "Tech Solutions Pvt Ltd",
        contactPerson: "Rajesh Kumar",
      },
      financial: {
        paymentStatus: "Completed",
        paymentMethod: "UPI",
        contributionAmount: 2500,
      },
    },
  };

  await testEmailTemplate(sampleRegistration, sendActualEmail);
};

/**
 * Test 2: Financial Difficulty Scenario
 */
export const testFinancialDifficultyEmail = async (sendActualEmail = false) => {
  console.log("🧪 Testing Financial Difficulty Email...");

  const sampleRegistration = {
    _id: "674d1a2b3c4e5f6789012346",
    name: "Priya Sharma",
    email: "ashin.jnv@gmail.com",
    contactNumber: "+91-9876543211",
    paymentStatus: "Pending",
    formDataStructured: {
      personalInfo: {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        contactNumber: "+91-9876543211",
        whatsappNumber: "+91-9876543211",
        school: "JNV Thrissur",
        yearOfPassing: 2015,
      },
      eventAttendance: {
        isAttending: true,
        attendees: {
          adults: { veg: 1, nonVeg: 0 },
          teens: { veg: 0, nonVeg: 0 },
          children: { veg: 1, nonVeg: 0 },
          toddlers: { veg: 0, nonVeg: 0 },
        },
      },
      sponsorship: {
        isInterested: false,
      },
      financial: {
        paymentStatus: "financial difficulty",
        contributionAmount: 0,
      },
    },
  };

  await testEmailTemplate(sampleRegistration, sendActualEmail);
};

/**
 * Test 3: Foreign Transaction Scenario
 */
export const testForeignTransactionEmail = async (sendActualEmail = false) => {
  console.log("🧪 Testing Foreign Transaction Email...");

  const sampleRegistration = {
    _id: "674d1a2b3c4e5f6789012347",
    name: "John Smith",
    email: "ashin.jnv@gmail.com",
    contactNumber: "+1-555-123-4567",
    paymentStatus: "Pending",
    formDataStructured: {
      personalInfo: {
        name: "John Smith",
        email: "john.smith@example.com",
        contactNumber: "+1-555-123-4567",
        whatsappNumber: "+1-555-123-4567",
        school: "JNV Delhi",
        yearOfPassing: 2008,
      },
      eventAttendance: {
        isAttending: true,
        attendees: {
          adults: { veg: 1, nonVeg: 1 },
          teens: { veg: 0, nonVeg: 0 },
          children: { veg: 0, nonVeg: 0 },
          toddlers: { veg: 0, nonVeg: 0 },
        },
      },
      sponsorship: {
        isInterested: false,
      },
      financial: {
        paymentStatus: "foreign transaction",
        contributionAmount: 5000,
      },
    },
  };

  await testEmailTemplate(sampleRegistration, sendActualEmail);
};

/**
 * Test 4: Default/Pending Payment Scenario
 */
export const testPendingPaymentEmail = async (sendActualEmail = false) => {
  console.log("🧪 Testing Pending Payment Email...");

  const sampleRegistration = {
    _id: "674d1a2b3c4e5f6789012348",
    name: "Anita Patel",
    email: "ashin.jnv@gmail.com",
    contactNumber: "+91-9876543212",
    paymentStatus: "Pending",
    formDataStructured: {
      personalInfo: {
        name: "Anita Patel",
        email: "anita.patel@example.com",
        contactNumber: "+91-9876543212",
        whatsappNumber: "+91-9876543212",
        school: "JNV Ahmedabad",
        yearOfPassing: 2012,
      },
      eventAttendance: {
        isAttending: false,
      },
      sponsorship: {
        isInterested: false,
      },
      financial: {
        paymentStatus: "Pending",
        contributionAmount: 1500,
      },
    },
  };

  await testEmailTemplate(sampleRegistration, sendActualEmail);
};

/**
 * Run all tests
 */
export const runAllEmailTests = async (sendActualEmail = false) => {
  console.log("🚀 Starting Email Template Tests...\n");

  if (sendActualEmail) {
    console.log("📧 SENDING ACTUAL EMAILS - Check your inbox!\n");
  } else {
    console.log("📄 PREVIEW MODE - No emails will be sent\n");
  }

  try {
    await testPaymentCompletedEmail(sendActualEmail);
    await testFinancialDifficultyEmail(sendActualEmail);
    await testForeignTransactionEmail(sendActualEmail);
    await testPendingPaymentEmail(sendActualEmail);

    console.log("✅ All email tests completed successfully!");

    if (sendActualEmail) {
      console.log("📬 Check your email inbox for the test emails!");
    }
  } catch (error) {
    console.error("❌ Error running email tests:", error);
  }
};

/**
 * Send test emails to specified email address
 */
export const sendTestEmailsTo = async (emailAddress, testType = "all") => {
  console.log(`📧 Sending test emails to: ${emailAddress}\n`);

  try {
    switch (testType.toLowerCase()) {
      case "completed":
      case "payment":
        console.log("🧪 Sending Payment Completed Email...");
        const completedReg = {
          _id: "674d1a2b3c4e5f6789012345",
          name: "Rajesh Kumar",
          email: emailAddress,
          contactNumber: "+91-9876543210",
          paymentStatus: "Completed",
          paymentId: "TXN-1703097234567-8901",
          contributionAmount: 2500,
          formDataStructured: {
            personalInfo: {
              name: "Rajesh Kumar",
              email: emailAddress,
              contactNumber: "+91-9876543210",
              whatsappNumber: "+91-9876543210",
              school: "JNV Palakkad",
              yearOfPassing: 2010,
            },
            eventAttendance: {
              isAttending: true,
              attendees: {
                adults: { veg: 2, nonVeg: 1 },
                teens: { veg: 1, nonVeg: 0 },
                children: { veg: 0, nonVeg: 0 },
                toddlers: { veg: 0, nonVeg: 0 },
              },
            },
            sponsorship: {
              isInterested: true,
              sponsorshipType: "Gold Sponsor",
              companyName: "Tech Solutions Pvt Ltd",
              contactPerson: "Rajesh Kumar",
            },
            financial: {
              paymentStatus: "Completed",
              paymentMethod: "UPI",
              contributionAmount: 2500,
            },
          },
        };
        await testEmailTemplate(completedReg, true);
        break;

      case "financial":
      case "difficulty":
        console.log("🧪 Sending Financial Difficulty Email...");
        const financialReg = {
          _id: "674d1a2b3c4e5f6789012346",
          name: "Priya Sharma",
          email: emailAddress,
          contactNumber: "+91-9876543211",
          paymentStatus: "Pending",
          formDataStructured: {
            personalInfo: {
              name: "Priya Sharma",
              email: emailAddress,
              contactNumber: "+91-9876543211",
              whatsappNumber: "+91-9876543211",
              school: "JNV Thrissur",
              yearOfPassing: 2015,
            },
            eventAttendance: {
              isAttending: true,
              attendees: {
                adults: { veg: 1, nonVeg: 0 },
                teens: { veg: 0, nonVeg: 0 },
                children: { veg: 1, nonVeg: 0 },
                toddlers: { veg: 0, nonVeg: 0 },
              },
            },
            sponsorship: {
              isInterested: false,
            },
            financial: {
              paymentStatus: "financial difficulty",
              contributionAmount: 0,
            },
          },
        };
        await testEmailTemplate(financialReg, true);
        break;

      case "foreign":
      case "international":
        console.log("🧪 Sending Foreign Transaction Email...");
        const foreignReg = {
          _id: "674d1a2b3c4e5f6789012347",
          name: "John Smith",
          email: emailAddress,
          contactNumber: "+1-555-123-4567",
          paymentStatus: "Pending",
          formDataStructured: {
            personalInfo: {
              name: "John Smith",
              email: emailAddress,
              contactNumber: "+1-555-123-4567",
              whatsappNumber: "+1-555-123-4567",
              school: "JNV Delhi",
              yearOfPassing: 2008,
            },
            eventAttendance: {
              isAttending: true,
              attendees: {
                adults: { veg: 1, nonVeg: 1 },
                teens: { veg: 0, nonVeg: 0 },
                children: { veg: 0, nonVeg: 0 },
                toddlers: { veg: 0, nonVeg: 0 },
              },
            },
            sponsorship: {
              isInterested: false,
            },
            financial: {
              paymentStatus: "foreign transaction",
              contributionAmount: 5000,
            },
          },
        };
        await testEmailTemplate(foreignReg, true);
        break;

      case "pending":
        console.log("🧪 Sending Pending Payment Email...");
        const pendingReg = {
          _id: "674d1a2b3c4e5f6789012348",
          name: "Anita Patel",
          email: emailAddress,
          contactNumber: "+91-9876543212",
          paymentStatus: "Pending",
          formDataStructured: {
            personalInfo: {
              name: "Anita Patel",
              email: emailAddress,
              contactNumber: "+91-9876543212",
              whatsappNumber: "+91-9876543212",
              school: "JNV Ahmedabad",
              yearOfPassing: 2012,
            },
            eventAttendance: {
              isAttending: false,
            },
            sponsorship: {
              isInterested: false,
            },
            financial: {
              paymentStatus: "Pending",
              contributionAmount: 1500,
            },
          },
        };
        await testEmailTemplate(pendingReg, true);
        break;

      case "all":
      default:
        await runAllEmailTests(true);
        break;
    }

    console.log(`\n✅ Test emails sent successfully to ${emailAddress}!`);
    console.log("📬 Check your inbox for the emails.");
  } catch (error) {
    console.error(`❌ Failed to send test emails to ${emailAddress}:`, error);
  }
};

// If running this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllEmailTests();
}
