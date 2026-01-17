#!/usr/bin/env node

/**
 * Simple script to run email template tests
 * Usage: node src/test/run-email-tests.js [test-name] [--send] [--email=address]
 *
 * Available tests:
 * - completed: Test payment completed email
 * - financial: Test financial difficulty email
 * - foreign: Test foreign transaction email
 * - pending: Test pending payment email
 * - all: Run all tests (default)
 *
 * Options:
 * - --send: Send actual emails instead of just preview
 * - --email=address: Send to specific email address
 */

import {
  testPaymentCompletedEmail,
  testFinancialDifficultyEmail,
  testForeignTransactionEmail,
  testPendingPaymentEmail,
  runAllEmailTests,
  sendTestEmailsTo,
} from "./email-templates-test.js";

// Parse command line arguments
const args = process.argv.slice(2);
const testName = args.find((arg) => !arg.startsWith("--")) || "all";
const shouldSendEmail = args.includes("--send");
const emailArg = args.find((arg) => arg.startsWith("--email="));
const customEmail = emailArg ? emailArg.split("=")[1] : null;

async function runTest() {
  console.log("📧 UNMA Email Template Test Runner\n");

  try {
    // If custom email is provided, use the sendTestEmailsTo function
    if (customEmail) {
      await sendTestEmailsTo(customEmail, testName);
      return;
    }

    // Otherwise, run normal tests with optional email sending
    switch (testName.toLowerCase()) {
      case "completed":
      case "payment":
        await testPaymentCompletedEmail(shouldSendEmail);
        break;

      case "financial":
      case "difficulty":
        await testFinancialDifficultyEmail(shouldSendEmail);
        break;

      case "foreign":
      case "international":
        await testForeignTransactionEmail(shouldSendEmail);
        break;

      case "pending":
        await testPendingPaymentEmail(shouldSendEmail);
        break;

      case "all":
      default:
        await runAllEmailTests(shouldSendEmail);
        break;
    }
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
}

// Instructions
console.log(`
📋 Available Test Commands:

PREVIEW MODE (No emails sent):
   node src/test/run-email-tests.js completed    # Preview payment completed email
   node src/test/run-email-tests.js financial   # Preview financial difficulty email
   node src/test/run-email-tests.js foreign     # Preview foreign transaction email
   node src/test/run-email-tests.js pending     # Preview pending payment email
   node src/test/run-email-tests.js all         # Preview all emails (default)

SEND ACTUAL EMAILS:
   node src/test/run-email-tests.js completed --send           # Send payment completed email
   node src/test/run-email-tests.js financial --send           # Send financial difficulty email
   node src/test/run-email-tests.js foreign --send             # Send foreign transaction email
   node src/test/run-email-tests.js pending --send             # Send pending payment email
   node src/test/run-email-tests.js all --send                 # Send all test emails
   
SEND TO CUSTOM EMAIL:
   node src/test/run-email-tests.js completed --email=your@email.com   # Send specific test to custom email
   node src/test/run-email-tests.js all --email=your@email.com         # Send all tests to custom email

Running test: ${testName}${
  shouldSendEmail ? " (SENDING EMAILS)" : " (PREVIEW MODE)"
}${customEmail ? ` to ${customEmail}` : ""}
${"=".repeat(70)}
`);

runTest();
