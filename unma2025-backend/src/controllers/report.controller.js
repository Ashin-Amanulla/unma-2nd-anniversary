import Registration from "../models/Registration.js";
import { fetchAndCacheAllPayments, isCacheValid } from "../routes/payment.js";
import { logger } from "../utils/logger.js";

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
 * Match Razorpay payments with registrations and aggregate data
 */
async function aggregatePaymentData() {
    try {
        // Fetch all payments from Razorpay (cached)
        let allPayments = await fetchAndCacheAllPayments();
        if (!allPayments || !Array.isArray(allPayments)) {
            throw new Error("Failed to fetch payments from Razorpay");
        }

        // Fetch all registrations from database
        const allRegistrations = await Registration.find({}).lean();
        if (!allRegistrations || !Array.isArray(allRegistrations)) {
            throw new Error("Failed to fetch registrations from database");
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

        // Initialize aggregation structures
        const schoolStats = {};
        const batchStats = {};

        // Process each payment
        allPayments.forEach((payment) => {
            // Only consider captured payments
            if (payment.status !== "captured") {
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

            // If no registration found, skip this payment
            if (!matchingRegistration) {
                return;
            }

            // Extract school and batch information
            const school =
                matchingRegistration.formDataStructured?.personalInfo?.school ||
                "Unknown School";
            const yearOfPassing =
                matchingRegistration.formDataStructured?.personalInfo?.yearOfPassing ||
                "Unknown Batch";
            const amountInRupees = safeAmountToRupees(payment.amount);

            // Aggregate by school
            if (!schoolStats[school]) {
                schoolStats[school] = {
                    school: school,
                    totalRegistrations: 0,
                    totalAmount: 0,
                    capturedPaymentsCount: 0,
                    payments: [],
                };
            }

            schoolStats[school].totalRegistrations += 1;
            schoolStats[school].totalAmount += amountInRupees;
            schoolStats[school].capturedPaymentsCount += 1;
            schoolStats[school].payments.push({
                paymentId: payment.id,
                email: payment.email,
                name: matchingRegistration.name,
                amount: amountInRupees,
                batch: yearOfPassing,
            });

            // Aggregate by school + batch
            const batchKey = `${school}|||${yearOfPassing}`;
            if (!batchStats[batchKey]) {
                batchStats[batchKey] = {
                    school: school,
                    batchYear: yearOfPassing,
                    registrationsCount: 0,
                    amountCollected: 0,
                    capturedPaymentsCount: 0,
                    payments: [],
                };
            }

            batchStats[batchKey].registrationsCount += 1;
            batchStats[batchKey].amountCollected += amountInRupees;
            batchStats[batchKey].capturedPaymentsCount += 1;
            batchStats[batchKey].payments.push({
                paymentId: payment.id,
                email: payment.email,
                name: matchingRegistration.name,
                amount: amountInRupees,
            });
        });

        return {
            schoolStats,
            batchStats,
            summary: {
                totalSchools: Object.keys(schoolStats).length,
                totalBatches: Object.keys(batchStats).length,
                totalAmount: Object.values(schoolStats).reduce(
                    (sum, s) => sum + s.totalAmount,
                    0
                ),
                totalPayments: Object.values(schoolStats).reduce(
                    (sum, s) => sum + s.capturedPaymentsCount,
                    0
                ),
            },
        };
    } catch (error) {
        logger.error("Error in aggregatePaymentData:", error);
        throw error;
    }
}

/**
 * Get school-wise payment report (JSON)
 */
export const getSchoolWiseReport = async (req, res) => {
    try {
        logger.info("Generating school-wise payment report...");

        const { schoolStats, summary } = await aggregatePaymentData();

        // Convert to array and sort by total amount (descending)
        const schoolStatsArray = Object.values(schoolStats).sort(
            (a, b) => b.totalAmount - a.totalAmount
        );

        res.status(200).json({
            status: "success",
            data: {
                schools: schoolStatsArray,
                summary: summary,
                cacheInfo: {
                    cached: isCacheValid(),
                    lastUpdated: new Date().toISOString(),
                },
            },
        });
    } catch (error) {
        logger.error("Error in getSchoolWiseReport:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to generate school-wise report",
            error: error.message,
        });
    }
};

/**
 * Get batch-wise payment report (JSON)
 */
export const getBatchWiseReport = async (req, res) => {
    try {
        logger.info("Generating batch-wise payment report...");

        const { batchStats, summary } = await aggregatePaymentData();

        // Convert to array and sort by school, then by batch year
        const batchStatsArray = Object.values(batchStats).sort((a, b) => {
            if (a.school !== b.school) {
                return a.school.localeCompare(b.school);
            }
            // Sort batches in descending order (newest first)
            return String(b.batchYear).localeCompare(String(a.batchYear));
        });

        res.status(200).json({
            status: "success",
            data: {
                batches: batchStatsArray,
                summary: summary,
                cacheInfo: {
                    cached: isCacheValid(),
                    lastUpdated: new Date().toISOString(),
                },
            },
        });
    } catch (error) {
        logger.error("Error in getBatchWiseReport:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to generate batch-wise report",
            error: error.message,
        });
    }
};

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data, headers) {
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(","));

    // Add data rows
    data.forEach((row) => {
        const values = headers.map((header) => {
            const value = row[header] || "";
            // Escape values containing commas or quotes
            if (String(value).includes(",") || String(value).includes('"')) {
                return `"${String(value).replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
}

/**
 * Export school-wise report as CSV
 */
export const exportSchoolWiseCSV = async (req, res) => {
    try {
        logger.info("Exporting school-wise payment report as CSV...");

        const { schoolStats } = await aggregatePaymentData();

        // Convert to array and sort by total amount (descending)
        const schoolStatsArray = Object.values(schoolStats)
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .map((s) => ({
                School: s.school,
                "Total Registrations": s.totalRegistrations,
                "Total Amount Collected (₹)": s.totalAmount.toFixed(2),
                "Captured Payments Count": s.capturedPaymentsCount,
            }));

        // Generate CSV
        const csv = convertToCSV(schoolStatsArray, [
            "School",
            "Total Registrations",
            "Total Amount Collected (₹)",
            "Captured Payments Count",
        ]);

        // Set headers for file download
        const filename = `school-wise-report-${new Date().toISOString().split("T")[0]
            }.csv`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        // Send CSV
        res.send(csv);

        logger.info("School-wise CSV report exported successfully");
    } catch (error) {
        logger.error("Error in exportSchoolWiseCSV:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to export school-wise CSV report",
            error: error.message,
        });
    }
};

/**
 * Export batch-wise report as CSV
 */
export const exportBatchWiseCSV = async (req, res) => {
    try {
        logger.info("Exporting batch-wise payment report as CSV...");

        const { batchStats } = await aggregatePaymentData();

        // Convert to array and sort by school, then by batch year
        const batchStatsArray = Object.values(batchStats)
            .sort((a, b) => {
                if (a.school !== b.school) {
                    return a.school.localeCompare(b.school);
                }
                return String(b.batchYear).localeCompare(String(a.batchYear));
            })
            .map((b) => ({
                School: b.school,
                "Batch Year": b.batchYear,
                "Registrations Count": b.registrationsCount,
                "Amount Collected (₹)": b.amountCollected.toFixed(2),
                "Captured Payments Count": b.capturedPaymentsCount,
            }));

        // Generate CSV
        const csv = convertToCSV(batchStatsArray, [
            "School",
            "Batch Year",
            "Registrations Count",
            "Amount Collected (₹)",
            "Captured Payments Count",
        ]);

        // Set headers for file download
        const filename = `batch-wise-report-${new Date().toISOString().split("T")[0]
            }.csv`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        // Send CSV
        res.send(csv);

        logger.info("Batch-wise CSV report exported successfully");
    } catch (error) {
        logger.error("Error in exportBatchWiseCSV:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to export batch-wise CSV report",
            error: error.message,
        });
    }
};

/**
 * Safely convert timestamp to readable date string
 */
function safeTimeToDateString(timestamp) {
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
 * Export full Razorpay transaction history as CSV with registration details
 */
export const exportFullRazorpayHistoryCSV = async (req, res) => {
    try {
        logger.info("Exporting full Razorpay transaction history as CSV...");

        // Fetch ALL payments from Razorpay (cached) - regardless of status
        let allPayments = await fetchAndCacheAllPayments();
        if (!allPayments || !Array.isArray(allPayments)) {
            throw new Error("Failed to fetch payments from Razorpay");
        }

        // Fetch all registrations from database
        const allRegistrations = await Registration.find({}).lean();
        if (!allRegistrations || !Array.isArray(allRegistrations)) {
            throw new Error("Failed to fetch registrations from database");
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

        // Process each payment and match with registration
        const transactionData = allPayments.map((payment) => {
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

            // Extract registration details if found
            let registrantName = "Not Found";
            let email = payment.email || "N/A";
            let phone = payment.contact || "N/A";
            let school = "Not Found";
            let batchYear = "Not Found";
            let registrationStatus = "Not Found";
            let matchStatus = "No Registration Found";

            if (matchingRegistration) {
                matchStatus = "Matched";
                registrantName = matchingRegistration.name || "Not Found";
                email = matchingRegistration.email || payment.email || "N/A";
                phone =
                    matchingRegistration.contactNumber || payment.contact || "N/A";
                school =
                    matchingRegistration.formDataStructured?.personalInfo?.school ||
                    "Not Found";
                batchYear =
                    matchingRegistration.formDataStructured?.personalInfo
                        ?.yearOfPassing || "Not Found";
                registrationStatus = matchingRegistration.paymentStatus || "Not Found";
            }

            return {
                "Payment ID": payment.id || "N/A",
                "Order ID": payment.order_id || "N/A",
                "Payment Amount (₹)": safeAmountToRupees(payment.amount).toFixed(2),
                Currency: payment.currency || "N/A",
                "Payment Method": payment.method || "N/A",
                "Payment Status": payment.status || "N/A",
                "Payment Date": safeTimeToDateString(payment.created_at),
                "Registrant Name": registrantName,
                Email: email,
                Phone: phone,
                School: school,
                "Batch Year": batchYear,
                "Registration Status": registrationStatus,
                "Match Status": matchStatus,
            };
        });

        // Sort by payment date (newest first)
        transactionData.sort((a, b) => {
            const dateA = new Date(a["Payment Date"]);
            const dateB = new Date(b["Payment Date"]);
            return dateB - dateA; // Descending order
        });

        // Generate CSV
        const csv = convertToCSV(transactionData, [
            "Payment ID",
            "Order ID",
            "Payment Amount (₹)",
            "Currency",
            "Payment Method",
            "Payment Status",
            "Payment Date",
            "Registrant Name",
            "Email",
            "Phone",
            "School",
            "Batch Year",
            "Registration Status",
            "Match Status",
        ]);

        // Set headers for file download
        const filename = `razorpay-full-history-${new Date().toISOString().split("T")[0]
            }.csv`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        // Send CSV
        res.send(csv);

        logger.info(
            `Full Razorpay history CSV exported successfully. Total transactions: ${allPayments.length}`
        );
    } catch (error) {
        logger.error("Error in exportFullRazorpayHistoryCSV:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to export full Razorpay history CSV",
            error: error.message,
        });
    }
};

