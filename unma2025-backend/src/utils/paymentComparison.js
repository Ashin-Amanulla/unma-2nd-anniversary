import XLSX from "xlsx";
import Registration from "../models/Registration.js";
import { fetchAndCacheAllPayments } from "../routes/payment.js";

/**
 * Safely convert timestamp to ISO string
 */
function safeTimeToISO(timestamp) {
  try {
    if (!timestamp || isNaN(timestamp)) {
      return "N/A";
    }
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toISOString();
  } catch (error) {
    console.warn("Invalid timestamp:", timestamp);
    return "N/A";
  }
}

/**
 * Safely convert amount from paise to rupees
 */
function safeAmountToRupees(amount) {
  try {
    if (!amount || isNaN(amount)) {
      return 0;
    }
    return Math.round((amount / 100) * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.warn("Invalid amount:", amount);
    return 0;
  }
}

/**
 * Compare Razorpay payment history with registration records
 * and generate Excel report with three sheets
 */
export async function comparePaymentsAndRegistrations() {
  try {
    // Fetch all payments from Razorpay
    const allPayments = await fetchAndCacheAllPayments();
    if (!allPayments || !Array.isArray(allPayments)) {
      throw new Error(
        "Failed to fetch payments from Razorpay or invalid data format"
      );
    }

    // Fetch all registrations from database
    const allRegistrations = await Registration.find({}).lean();
    if (!allRegistrations || !Array.isArray(allRegistrations)) {
      throw new Error(
        "Failed to fetch registrations from database or invalid data format"
      );
    }

    // Create lookup maps for efficient searching
    const registrationByEmail = new Map();
    const registrationByPhone = new Map();

    allRegistrations.forEach((reg) => {
      if (reg.email) {
        registrationByEmail.set(reg.email.toLowerCase(), reg);
      }
      if (reg.contactNumber) {
        registrationByPhone.set(reg.contactNumber, reg);
      }
    });

    // Result sets for the three scenarios
    const capturedNotRegistered = [];
    const capturedPendingInRegistration = [];
    const refundedButCompletedRegistration = [];

    // Process each payment
    allPayments.forEach((payment) => {
      // Skip invalid payment records
      if (!payment || !payment.id) {
        console.warn("Skipping invalid payment record:", payment);
        return;
      }

      const paymentEmail = payment.email?.toLowerCase();
      const paymentPhone = payment.contact;

      // Find matching registration by email or phone
      let matchingRegistration = null;
      if (paymentEmail) {
        matchingRegistration = registrationByEmail.get(paymentEmail);
      }
      if (!matchingRegistration && paymentPhone) {
        matchingRegistration = registrationByPhone.get(paymentPhone);
      }

      // Scenario 1: Captured payments with no registration found
      if (payment.status === "captured" && !matchingRegistration) {
        capturedNotRegistered.push({
          paymentId: payment.id,
          orderId: payment.order_id,
          email: payment.email || "N/A",
          phone: payment.contact || "N/A",
          amount: safeAmountToRupees(payment.amount),
          currency: payment.currency,
          paymentDate: safeTimeToISO(payment.created_at),
          method: payment.method,
          status: payment.status,
          description: payment.description || "N/A",
        });
      }

      // Scenario 2: Captured payments with pending registration
      if (
        payment.status === "captured" &&
        matchingRegistration &&
        matchingRegistration.paymentStatus === "pending"
      ) {
        capturedPendingInRegistration.push({
          paymentId: payment.id,
          orderId: payment.order_id,
          paymentEmail: payment.email || "N/A",
          paymentPhone: payment.contact || "N/A",
          paymentAmount: safeAmountToRupees(payment.amount),
          paymentCurrency: payment.currency,
          paymentDate: safeTimeToISO(payment.created_at),
          paymentMethod: payment.method,
          paymentStatus: payment.status,
          registrationId: matchingRegistration._id,
          registrationName: matchingRegistration.name,
          registrationEmail: matchingRegistration.email,
          registrationPhone: matchingRegistration.contactNumber,
          registrationStatus: matchingRegistration.paymentStatus,
          school:
            matchingRegistration.formDataStructured?.personalInfo?.school ||
            "N/A",
          contributionAmount:
            matchingRegistration.formDataStructured?.financial
              ?.contributionAmount || 0,
          formComplete: matchingRegistration.formSubmissionComplete,
          registrationDate: matchingRegistration.registrationDate,
        });
      }

      // Scenario 3: Refunded payments with completed registration
      if (
        payment.status === "refunded" &&
        matchingRegistration &&
        matchingRegistration.paymentStatus === "Completed"
      ) {
        refundedButCompletedRegistration.push({
          paymentId: payment.id,
          orderId: payment.order_id,
          paymentEmail: payment.email || "N/A",
          paymentPhone: payment.contact || "N/A",
          refundAmount: safeAmountToRupees(payment.amount),
          paymentCurrency: payment.currency,
          paymentDate: safeTimeToISO(payment.created_at),
          refundDate: safeTimeToISO(payment.refund_status?.refunded_at),
          paymentMethod: payment.method,
          paymentStatus: payment.status,
          registrationId: matchingRegistration._id,
          registrationName: matchingRegistration.name,
          school:
            matchingRegistration.formDataStructured?.personalInfo?.school ||
            "N/A",
          registrationEmail: matchingRegistration.email,
          registrationPhone: matchingRegistration.contactNumber,
          registrationStatus: matchingRegistration.paymentStatus,
          contributionAmount:
            matchingRegistration.formDataStructured?.financial
              ?.contributionAmount || 0,
          formComplete: matchingRegistration.formSubmissionComplete,
          registrationDate: matchingRegistration.registrationDate,
        });
      }
    });

    return {
      capturedNotRegistered,
      capturedPendingInRegistration,
      refundedButCompletedRegistration,
      summary: {
        totalPayments: allPayments.length,
        totalRegistrations: allRegistrations.length,
        capturedNotRegisteredCount: capturedNotRegistered.length,
        capturedPendingCount: capturedPendingInRegistration.length,
        refundedCompletedCount: refundedButCompletedRegistration.length,
      },
    };
  } catch (error) {
    console.error("Error in payment comparison:", error);
    throw error;
  }
}

/**
 * Generate Excel file with the comparison results
 */
export function generateExcelReport(comparisonData) {
  try {
    // Validate input data
    if (!comparisonData || typeof comparisonData !== "object") {
      throw new Error("Invalid comparison data provided");
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Captured payments not found in registrations
    const sheet1Data = (comparisonData.capturedNotRegistered || []).map(
      (item) => ({
        "Payment ID": item.paymentId,
        "Order ID": item.orderId,
        Email: item.email,
        Phone: item.phone,
        "Amount (₹)": item.amount,
        Currency: item.currency,
        "Payment Date": item.paymentDate,
        Method: item.method,
        Status: item.status,
        Description: item.description,
      })
    );

    const sheet1 = XLSX.utils.json_to_sheet(sheet1Data);
    XLSX.utils.book_append_sheet(workbook, sheet1, "Captured_Not_Registered");

    // Sheet 2: Captured payments with pending registrations
    const sheet2Data = (comparisonData.capturedPendingInRegistration || []).map(
      (item) => ({
        "Payment ID": item.paymentId,
        "Order ID": item.orderId,
        "Payment Email": item.paymentEmail,
        "Payment Phone": item.paymentPhone,
        "Payment Amount (₹)": item.paymentAmount,
        "Payment Date": item.paymentDate,
        "Payment Method": item.paymentMethod,
        "Payment Status": item.paymentStatus,
        "Registration ID": item.registrationId,
        "Registration Name": item.registrationName,
        "Registration Email": item.registrationEmail,
        "Registration Phone": item.registrationPhone,
        School: item.school,
        "Registration Status": item.registrationStatus,
        "Contribution Amount (₹)": item.contributionAmount,
        "Form Complete": item.formComplete,
        "Registration Date": item.registrationDate,
      })
    );

    const sheet2 = XLSX.utils.json_to_sheet(sheet2Data);
    XLSX.utils.book_append_sheet(workbook, sheet2, "Captured_Pending_In_Reg");

    // Sheet 3: Refunded payments with completed registrations
    const sheet3Data = (
      comparisonData.refundedButCompletedRegistration || []
    ).map((item) => ({
      "Payment ID": item.paymentId,
      "Order ID": item.orderId,
      "Payment Email": item.paymentEmail,
      "Payment Phone": item.paymentPhone,
      "Refund Amount (₹)": item.refundAmount,
      "Payment Date": item.paymentDate,
      "Refund Date": item.refundDate,
      "Payment Method": item.paymentMethod,
      "Payment Status": item.paymentStatus,
      "Registration ID": item.registrationId,
      "Registration Name": item.registrationName,
      "Registration Email": item.registrationEmail,
      "Registration Phone": item.registrationPhone,
      School: item.school,
      "Registration Status": item.registrationStatus,
      "Contribution Amount (₹)": item.contributionAmount,
      "Form Complete": item.formComplete,
      "Registration Date": item.registrationDate,
    }));

    const sheet3 = XLSX.utils.json_to_sheet(sheet3Data);
    XLSX.utils.book_append_sheet(
      workbook,
      sheet3,
      "Refunded_But_Completed_Reg"
    );

    // Add summary sheet
    const summaryData = [
      { Metric: "Total Payments", Count: comparisonData.summary.totalPayments },
      {
        Metric: "Total Registrations",
        Count: comparisonData.summary.totalRegistrations,
      },
      {
        Metric: "Captured Not Registered",
        Count: comparisonData.summary.capturedNotRegisteredCount,
      },
      {
        Metric: "Captured Pending Registration",
        Count: comparisonData.summary.capturedPendingCount,
      },
      {
        Metric: "Refunded But Completed Registration",
        Count: comparisonData.summary.refundedCompletedCount,
      },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return buffer;
  } catch (error) {
    console.error("Error generating Excel report:", error);
    throw error;
  }
}

/**
 * Main function to perform comparison and generate Excel report
 */
export async function generatePaymentComparisonReport() {
  try {
    console.log("Starting payment comparison analysis...");

    // Perform the comparison
    const comparisonData = await comparePaymentsAndRegistrations();

    console.log("Comparison completed. Summary:", comparisonData.summary);

    // Generate Excel report
    const excelBuffer = generateExcelReport(comparisonData);

    console.log("Excel report generated successfully");

    return {
      buffer: excelBuffer,
      summary: comparisonData.summary,
      filename: `payment-comparison-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`,
    };
  } catch (error) {
    console.error("Error in generatePaymentComparisonReport:", error);
    throw error;
  }
}
