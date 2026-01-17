import express from "express";
import razorpayInstance from "../utils/razorpay.js";
import crypto from "crypto";
import { generatePaymentComparisonReport } from "../utils/paymentComparison.js";

const router = express.Router();
import { encryptData } from "../utils/federalPayment.js";
import {
  PAYMENT_GATEWAY_API_KEY,
  PAYMENT_GATEWAY_ENCRYPTION_KEY,
  PAYMENT_GATEWAY_SALT,
  PAYMENT_GATEWAY_BASE_URL,
} from "../config/config.js";

// Endpoint to create an order
router.post("/create-order", async (req, res) => {
  const { amount, currency, name, email, contact, notes } = req.body;

  try {
    const options = {
      amount: amount * 100, // Convert amount to smallest currency unit
      currency: currency || "INR",
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating RazorPay order");
  }
});

router.post("/verify-payment", async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  try {
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error verifying RazorPay payment");
  }
});

//new payment gateway

router.post("/redirect-flow/create-order", async (req, res) => {
  try {
    const { amount, name, email, phone, currency } = req.body;

    const payload = {
      api_key: PAYMENT_GATEWAY_API_KEY,
      order_id: `UNMA_${Date.now()}`,
      amount: amount.toString(),
      currency,
      name,
      email,
      phone,
      description: "Anonymous Contribution",
      country: "IND",
      city: "Bangalore",
      zip_code: "560001",
      return_url: "https://yourdomain.com/payment/success",
      return_url_failure: "https://yourdomain.com/payment/failure",
      hash: "dummy-hash", // temporarily added, real hash to be added after encryption
    };

    // Replace hash later after encryption
    const hashString = `${PAYMENT_GATEWAY_SALT}|${PAYMENT_GATEWAY_API_KEY}|${payload.order_id}|${payload.amount}|${currency}`;
    const hash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex")
      .toUpperCase();
    payload.hash = hash;

    const { encrypted_data, iv } = encryptData(
      payload,
      PAYMENT_GATEWAY_ENCRYPTION_KEY
    );

    res.json({
      pg_api_url: PAYMENT_GATEWAY_BASE_URL,
      api_key: PAYMENT_GATEWAY_API_KEY,
      encrypted_data,
      iv,
    });
  } catch (err) {
    console.error("Redirect Flow Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//fetch payment history
// Option 1: In-Memory Cache (Simple but lost on server restart)
// Export the cache so it can be accessed from other modules
export let paymentCache = {
  data: null,
  lastUpdated: null,
  isLoading: false,
};

const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

// Function to fetch all payments and cache them
export async function fetchAndCacheAllPayments() {
  if (paymentCache.isLoading) {
    // If already loading, wait for it to complete
    while (paymentCache.isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return paymentCache.data;
  }

  paymentCache.isLoading = true;

  try {
    console.log("Fetching all payments from Razorpay...");
    let allPayments = [];
    let skip = 0;
    const batchSize = 100;
    let hasMore = true;

    while (hasMore) {
      const payments = await razorpayInstance.payments.all({
        count: batchSize,
        skip: skip,
      });

      if (!payments.items || payments.items.length === 0) {
        hasMore = false;
        break;
      }

      allPayments = [...allPayments, ...payments.items];
      skip += batchSize;

      // If we got less than requested, we've reached the end
      if (payments.items.length < batchSize) {
        hasMore = false;
      }

      console.log(`Fetched ${allPayments.length} payments so far...`);
    }

    paymentCache.data = allPayments;
    paymentCache.lastUpdated = Date.now();
    console.log(`Cached ${allPayments.length} total payments`);

    return allPayments;
  } finally {
    paymentCache.isLoading = false;
  }
}

// Check if cache is valid
export function isCacheValid() {
  return (
    paymentCache.data &&
    paymentCache.lastUpdated &&
    Date.now() - paymentCache.lastUpdated < CACHE_DURATION
  );
}

router.get("/payment-history/:searchTerm", async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { page = 1, limit = 50, forceRefresh = false } = req.query;

    const isEmail = searchTerm.includes("@");

    // Get payments from cache or fetch fresh data
    let allPayments;
    if (forceRefresh === "true" || !isCacheValid()) {
      console.log(
        "Cache invalid or force refresh requested, fetching fresh data..."
      );
      allPayments = await fetchAndCacheAllPayments();
    } else {
      console.log("Using cached payment data");
      allPayments = paymentCache.data;
    }

    // Filter payments based on search term
    const filteredPayments = allPayments.filter((payment) => {
      if (isEmail) {
        return (
          payment.email &&
          payment.email.toLowerCase() === searchTerm.toLowerCase()
        );
      } else {
        return payment.contact && payment.contact.includes(searchTerm);
      }
    });

    // Apply pagination to filtered results
    const startIndex = (page - 1) * limit;
    const paginatedResults = filteredPayments.slice(
      startIndex,
      startIndex + parseInt(limit)
    );

    res.status(200).json({
      count: paginatedResults.length,
      total: filteredPayments.length,
      items: paginatedResults,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: filteredPayments.length > page * limit,
      searchTerm: searchTerm,
      searchType: isEmail ? "email" : "contact",
      cacheInfo: {
        cached: isCacheValid(),
        lastUpdated: paymentCache.lastUpdated,
        totalCachedPayments: allPayments.length,
      },
    });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
});

// Endpoint to generate payment comparison report
router.get("/comparison-report",  async (req, res) => {
  try {
    console.log("Generating payment comparison report...");

    const reportData = await generatePaymentComparisonReport();

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${reportData.filename}"`
    );
    res.setHeader("Content-Length", reportData.buffer.length);

    // Send the Excel file
    res.send(reportData.buffer);

    console.log(
      "Payment comparison report sent successfully. Summary:",
      reportData.summary
    );
  } catch (error) {
    console.error("Error generating payment comparison report:", error);
    res.status(500).json({
      message: "Failed to generate payment comparison report",
      error: error.message,
    });
  }
});

// Endpoint to get payment comparison summary (without downloading file)
router.get("/comparison-summary",  async (req, res) => {
  try {
    console.log("Generating payment comparison summary...");

    const reportData = await generatePaymentComparisonReport();

    res.status(200).json({
      success: true,
      summary: reportData.summary,
      message: "Payment comparison completed successfully",
    });
  } catch (error) {
    console.error("Error generating payment comparison summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate payment comparison summary",
      error: error.message,
    });
  }
});

export default router;
