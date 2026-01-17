import { logger } from "../utils/logger.js";
import Registration from "../models/Registration.js";
import Transaction from "../models/Transaction.js";
import OtpVerification from "../models/OtpVerification.js";
import { generateOTP, sendSMS, sendEmail } from "../utils/communication.js";
import { formatDate } from "../utils/helpers.js";
import { Parser } from "json2csv";
import mongoose from "mongoose";
import crypto from "crypto";
import moment from "moment-timezone";
import { sendWhatsAppOtp } from "../utils/whatsapp.js";
import {
  sendRegistrationConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendContactMessageEmail,
} from "../templates/email/all-templates.js";
import { sanitizeStepData, sanitizeFormData } from "../utils/sanitise.js";
import ContactMessage from "../models/contactMessage.js";
import { getSchoolFilter } from "../utils/schoolFilter.js";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

/**
 * Find duplicate registrations and export to Excel
 */
export const findDuplicateRegistrations = async (req, res) => {
  try {
    // Debug: Check total registrations first
    const totalCount = await Registration.countDocuments();
    console.log(`Total registrations found: ${totalCount}`);

    // Find duplicates by email
    const duplicatesByEmail = await Registration.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          registrations: { $push: "$$ROOT" },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Find duplicates by contactNumber
    const duplicatesByContact = await Registration.aggregate([
      {
        $group: {
          _id: "$contactNumber",
          count: { $sum: 1 },
          registrations: { $push: "$$ROOT" },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Find duplicates by whatsappNumber (only where whatsappNumber exists)
    const duplicatesByWhatsApp = await Registration.aggregate([
      {
        $match: {
          $or: [
            { whatsappNumber: { $exists: true, $ne: null, $ne: "" } },
            {
              "formDataStructured.personalInfo.whatsappNumber": {
                $exists: true,
                $ne: null,
                $ne: "",
              },
            },
          ],
        },
      },
      {
        $addFields: {
          whatsappNumber: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$whatsappNumber", null] },
                  { $ne: ["$whatsappNumber", ""] },
                ],
              },
              then: "$whatsappNumber",
              else: "$formDataStructured.personalInfo.whatsappNumber",
            },
          },
        },
      },
      {
        $group: {
          _id: "$whatsappNumber",
          count: { $sum: 1 },
          registrations: { $push: "$$ROOT" },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Debug logging
    console.log(`Email duplicates found: ${duplicatesByEmail.length} groups`);
    console.log(
      `Contact duplicates found: ${duplicatesByContact.length} groups`
    );
    console.log(
      `WhatsApp duplicates found: ${duplicatesByWhatsApp.length} groups`
    );

    // If debug mode, return JSON instead of Excel
    const { debug } = req.query;
    if (debug === "true") {
      return res.json({
        status: "success",
        totalRegistrations: totalCount,
        duplicates: {
          byEmail: {
            groups: duplicatesByEmail.length,
            details: duplicatesByEmail.map((group) => ({
              email: group._id,
              count: group.count,
              registrationIds: group.registrations.map((r) => r._id),
            })),
          },
          byContact: {
            groups: duplicatesByContact.length,
            details: duplicatesByContact.map((group) => ({
              contactNumber: group._id,
              count: group.count,
              registrationIds: group.registrations.map((r) => r._id),
            })),
          },
          byWhatsApp: {
            groups: duplicatesByWhatsApp.length,
            details: duplicatesByWhatsApp.map((group) => ({
              whatsappNumber: group._id,
              count: group.count,
              registrationIds: group.registrations.map((r) => r._id),
            })),
          },
        },
      });
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Duplicates by Email
    const emailDuplicatesFlat = [];
    duplicatesByEmail.forEach((group) => {
      group.registrations.forEach((reg, index) => {
        emailDuplicatesFlat.push({
          "Duplicate Type": "Email",
          "Duplicate Value": group._id,
          "Total Count": group.count,
          "Entry #": index + 1,
          "Registration ID": reg._id.toString(),
          Name: reg.name || "",
          Email: reg.email || "",
          "Contact Number": reg.contactNumber || "",
          "WhatsApp Number":
            reg.whatsappNumber ||
            reg.formDataStructured?.personalInfo?.whatsappNumber ||
            "",
          "Registration Type": reg.registrationType || "",
          School: reg.formDataStructured?.personalInfo?.school || "",
          "Year of Passing":
            reg.formDataStructured?.personalInfo?.yearOfPassing || "",
          Country: reg.formDataStructured?.personalInfo?.country || "",
          "Registration Date": reg.registrationDate
            ? new Date(reg.registrationDate).toISOString().split("T")[0]
            : "",
          "Form Complete": reg.formSubmissionComplete || false,
          "Payment Status": reg.paymentStatus || "",
          "Contribution Amount":
            reg.formDataStructured?.financial?.contributionAmount || 0,
          "Is Attending":
            reg.formDataStructured?.eventAttendance?.isAttending || false,
          "Last Updated": reg.lastUpdated
            ? new Date(reg.lastUpdated).toISOString().split("T")[0]
            : "",
        });
      });
    });

    // Sheet 2: Duplicates by Contact Number
    const contactDuplicatesFlat = [];
    duplicatesByContact.forEach((group) => {
      group.registrations.forEach((reg, index) => {
        contactDuplicatesFlat.push({
          "Duplicate Type": "Contact Number",
          "Duplicate Value": group._id,
          "Total Count": group.count,
          "Entry #": index + 1,
          "Registration ID": reg._id.toString(),
          Name: reg.name || "",
          Email: reg.email || "",
          "Contact Number": reg.contactNumber || "",
          "WhatsApp Number":
            reg.whatsappNumber ||
            reg.formDataStructured?.personalInfo?.whatsappNumber ||
            "",
          "Registration Type": reg.registrationType || "",
          School: reg.formDataStructured?.personalInfo?.school || "",
          "Year of Passing":
            reg.formDataStructured?.personalInfo?.yearOfPassing || "",
          Country: reg.formDataStructured?.personalInfo?.country || "",
          "Registration Date": reg.registrationDate
            ? new Date(reg.registrationDate).toISOString().split("T")[0]
            : "",
          "Form Complete": reg.formSubmissionComplete || false,
          "Payment Status": reg.paymentStatus || "",
          "Contribution Amount":
            reg.formDataStructured?.financial?.contributionAmount || 0,
          "Is Attending":
            reg.formDataStructured?.eventAttendance?.isAttending || false,
          "Last Updated": reg.lastUpdated
            ? new Date(reg.lastUpdated).toISOString().split("T")[0]
            : "",
        });
      });
    });

    // Sheet 3: Duplicates by WhatsApp Number
    const whatsappDuplicatesFlat = [];
    duplicatesByWhatsApp.forEach((group) => {
      group.registrations.forEach((reg, index) => {
        whatsappDuplicatesFlat.push({
          "Duplicate Type": "WhatsApp Number",
          "Duplicate Value": group._id,
          "Total Count": group.count,
          "Entry #": index + 1,
          "Registration ID": reg._id.toString(),
          Name: reg.name || "",
          Email: reg.email || "",
          "Contact Number": reg.contactNumber || "",
          "WhatsApp Number":
            reg.whatsappNumber ||
            reg.formDataStructured?.personalInfo?.whatsappNumber ||
            "",
          "Registration Type": reg.registrationType || "",
          School: reg.formDataStructured?.personalInfo?.school || "",
          "Year of Passing":
            reg.formDataStructured?.personalInfo?.yearOfPassing || "",
          Country: reg.formDataStructured?.personalInfo?.country || "",
          "Registration Date": reg.registrationDate
            ? new Date(reg.registrationDate).toISOString().split("T")[0]
            : "",
          "Form Complete": reg.formSubmissionComplete || false,
          "Payment Status": reg.paymentStatus || "",
          "Contribution Amount":
            reg.formDataStructured?.financial?.contributionAmount || 0,
          "Is Attending":
            reg.formDataStructured?.eventAttendance?.isAttending || false,
          "Last Updated": reg.lastUpdated
            ? new Date(reg.lastUpdated).toISOString().split("T")[0]
            : "",
        });
      });
    });

    // Summary sheet
    const summaryData = [
      {
        "Duplicate Type": "Email",
        "Groups Found": duplicatesByEmail.length,
        "Total Duplicate Records": emailDuplicatesFlat.length,
      },
      {
        "Duplicate Type": "Contact Number",
        "Groups Found": duplicatesByContact.length,
        "Total Duplicate Records": contactDuplicatesFlat.length,
      },
      {
        "Duplicate Type": "WhatsApp Number",
        "Groups Found": duplicatesByWhatsApp.length,
        "Total Duplicate Records": whatsappDuplicatesFlat.length,
      },
    ];

    // Create worksheets
    const emailSheet = XLSX.utils.json_to_sheet(emailDuplicatesFlat);
    const contactSheet = XLSX.utils.json_to_sheet(contactDuplicatesFlat);
    const whatsappSheet = XLSX.utils.json_to_sheet(whatsappDuplicatesFlat);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, emailSheet, "Email Duplicates");
    XLSX.utils.book_append_sheet(workbook, contactSheet, "Contact Duplicates");
    XLSX.utils.book_append_sheet(
      workbook,
      whatsappSheet,
      "WhatsApp Duplicates"
    );

    // Generate Excel buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers for file download
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `duplicate-registrations-${timestamp}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    // Send the buffer
    res.send(buffer);

    logger.info(`Duplicate registrations report generated: ${filename}`);
  } catch (error) {
    logger.error(`Error finding duplicate registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get all registrations with filtering, searching, and pagination
 */
export const getAllRegistrations = async (req, res) => {
  try {
    const { admin } = req; // Get current admin from auth middleware
    const {
      page = 1,
      limit = 10,
      registrationType,
      formSubmissionComplete,
      isAttending,
      paymentStatus,
      school,
      search,
      sortBy = "registrationDate",
      sortOrder = "desc",
      fromDate,
      toDate,
    } = req.query;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    // Build query filters
    let query = { ...schoolFilter };

    // Add filters - only if values are provided and not empty strings
    if (registrationType && registrationType.trim() !== "") {
      query.registrationType = registrationType;
    }

    if (formSubmissionComplete && formSubmissionComplete.trim() !== "") {
      query.formSubmissionComplete = formSubmissionComplete === "true";
    }

    if (isAttending && isAttending.trim() !== "") {
      query["formDataStructured.eventAttendance.isAttending"] =
        isAttending === "true";
    }

    if (school && school.trim() !== "") {
      // If user has limited access and tries to filter by a school they don't have access to
      if (
        admin.role !== "super_admin" &&
        !admin.permissions?.canViewAllSchools
      ) {
        if (!admin.assignedSchools || !admin.assignedSchools.includes(school)) {
          return res.status(403).json({
            status: "error",
            message:
              "Access denied: You can only view registrations from your assigned schools",
          });
        }
      }
      query["formDataStructured.personalInfo.school"] = school;
    }

    if (paymentStatus && paymentStatus.trim() !== "") {
      console.log("paymentStatus", paymentStatus);

      if (paymentStatus === "complete") {
        query["paymentStatus"] = "Completed";
      } else if (paymentStatus === "incomplete") {
        query["paymentStatus"] = "pending";
        query["formSubmissionComplete"] = false;
      } else if (paymentStatus === "review") {
        query["paymentStatus"] = "pending";
        query["formSubmissionComplete"] = true;
      }
    }

    // Add date range filter
    if (fromDate || toDate) {
      query.registrationDate = {};
      if (fromDate) {
        // Convert fromDate to IST start of day and then to UTC
        const istFromDate = moment
          .tz(fromDate, "Asia/Kolkata")
          .startOf("day")
          .utc()
          .toDate();
        query.registrationDate.$gte = istFromDate;
      }
      if (toDate) {
        // Convert toDate to IST end of day and then to UTC
        const istToDate = moment
          .tz(toDate, "Asia/Kolkata")
          .endOf("day")
          .utc()
          .toDate();
        query.registrationDate.$lte = istToDate;
      }
    }

    // Add search filter (search by name, email, or contact number) - only if search term is provided
    if (search && search.trim() !== "") {
      // Use $and to combine existing query conditions with search conditions
      // This ensures school filters are respected during search
      const searchConditions = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { contactNumber: { $regex: search.trim(), $options: "i" } },
      ];

      // If query already has conditions, wrap them in $and with search
      if (Object.keys(query).length > 0) {
        const existingConditions = { ...query };
        query = {
          $and: [existingConditions, { $or: searchConditions }],
        };
      } else {
        // If no existing conditions, just use $or for search
        query.$or = searchConditions;
      }
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const registrations = await Registration.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRegistrations = await Registration.countDocuments(query);
    const totalPages = Math.ceil(totalRegistrations / limit);

    const response = {
      status: "success",
      results: registrations.length,
      totalRegistrations,
      totalPages,
      currentPage: parseInt(page),
      data: registrations,
    };

    // Return results
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error getting registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get registrations by type
 */
export const getRegistrationsByType = async (req, res) => {
  try {
    const { admin } = req; // Get current admin from auth middleware
    const { type } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;

    // Validate registration type
    if (!["Alumni", "Staff", "Other"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration type",
      });
    }

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    // Build query for specific type
    const query = {
      ...schoolFilter,
      registrationType: type,
    };

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const registrations = await Registration.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRegistrations = await Registration.countDocuments(query);
    const totalPages = Math.ceil(totalRegistrations / limit);

    // Return results
    res.status(200).json({
      status: "success",
      results: registrations.length,
      totalRegistrations,
      totalPages,
      currentPage: parseInt(page),
      data: registrations,
    });
  } catch (error) {
    logger.error(
      `Error getting ${req.params.type} registrations: ${error.message}`
    );
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get registration by ID
 */
export const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Find registration
    const registration = await Registration.findById(id);

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Get related transactions if any
    const transactions = await Transaction.find({ registrationId: id });

    // Return registration with transactions
    res.status(200).json({
      status: "success",
      data: {
        registration,
        transactions,
      },
    });
  } catch (error) {
    logger.error(`Error getting registration: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Update registration
 */
export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Update registration
    const updateData = req.body;
    console.log("updateData-before", updateData);
    const isExistingRegistration = await Registration.findById(id);

    // Add metadata
    updateData.lastUpdated = new Date();
    updateData.lastUpdatedBy = req.user ? req.user.email : "system";
    //add contribution amount
    updateData.formDataStructured.financial.contributionAmount +=
      isExistingRegistration.formDataStructured.financial.contributionAmount;
    //add payment details
    updateData.formDataStructured.financial.paymentHistory =
      isExistingRegistration.formDataStructured.financial.paymentHistory.push(
        updateData.formDataStructured.financial.paymentDetails
      );
    //add payment remarks
    if (updateData.formDataStructured.financial.paymentStatus === "Completed") {
      updateData.paymentStatus = "Completed";
      updateData.formSubmissionComplete = true;
      updateData.currentStep = 8;
    } else {
      updateData.paymentStatus = "pending";
      updateData.formSubmissionComplete = false;
    }

    console.log("updateData-after", updateData);
    // Update registration
    const registration = await Registration.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Return updated registration
    res.status(200).json({
      status: "success",
      message: "Registration updated successfully",
      data: registration,
    });
  } catch (error) {
    logger.error(`Error updating registration: ${error.message}`);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Delete registration
 */
export const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Find and delete registration
    const registration = await Registration.findByIdAndDelete(id);

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Delete related transactions
    await Transaction.deleteMany({ registrationId: id });

    // Return success message
    res.status(200).json({
      status: "success",
      message: "Registration and related transactions deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting registration: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Send OTP for verification
 */
export const sendOtp = async (req, res) => {
  try {
    const { email, contactNumber, update } = req.body;
    console.log("update", update);

    // Validate required fields
    if (update == false) {
      if (!email || !contactNumber) {
        return res.status(400).json({
          status: "error",
          message: "Email and contact number are required",
        });
      }
    } else {
      if (!email && !contactNumber) {
        return res.status(400).json({
          status: "error",
          message: "Email or contact number is required",
        });
      }
    }

    // check if email or contact number is already registered
    const existingRegistration = await Registration.findOne({
      $or: [{ email }, { contactNumber }],
    });
    if (
      update == false &&
      existingRegistration &&
      existingRegistration.formSubmissionComplete === true
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "Your registration was successful, should you need to modify your registration data, kindly wait for the release for update form.",
      });
    }

    if (update == true && !existingRegistration) {
      return res.status(400).json({
        status: "error",
        message: "No registration found with this email or contact number",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Check if an OTP verification exists for this email/phone
    let otpVerification = await OtpVerification.findOne({
      $or: [{ email }, { contactNumber }],
    });

    if (otpVerification) {
      // Update existing OTP verification
      otpVerification.otp = otp;
      otpVerification.createdAt = new Date();
      otpVerification.verified = false;
      otpVerification.attempts = 0;
      otpVerification.ipAddress = ipAddress;
      otpVerification.userAgent = userAgent;
      await otpVerification.save();
    } else {
      // Create new OTP verification entry
      otpVerification = await OtpVerification.create({
        email,
        contactNumber,
        otp,
        ipAddress,
        userAgent,
      });
    }

    await Promise.all([
      console.log("sending email", email, contactNumber),
      console.log("sending whatsapp", contactNumber, otp),
      email &&
      sendEmail(
        email,
        "OTP Verification for UNMA 2026 Registration",
        `Your OTP for UNMA 2026 registration is ${otp}. It will expire in 5 minutes.f`
      ),
      contactNumber && sendWhatsAppOtp(contactNumber, otp),
    ]);

    logger.info(`OTP sent to ${email} and ${contactNumber}`);

    // Return success message (include OTP in non-production environments)
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
      otpId: otpVerification._id,
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    logger.error(`Error sending OTP: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, contactNumber, otp, update } = req.body;
    // Validate required fields
    if (update == false) {
      if (!email || !contactNumber || !otp) {
        return res.status(400).json({
          status: "error",
          message: "Email, contact number and OTP are required",
        });
      }
    }
    // Find OTP verification by email or phone
    const otpVerification = await OtpVerification.findOne({
      $or: [{ email }, { contactNumber }],
    });

    // Check if OTP verification exists
    if (!otpVerification) {
      return res.status(404).json({
        status: "error",
        message: "No OTP verification found with this email or contact number",
      });
    }

    // Check if OTP is expired
    const now = new Date();
    if (otpVerification.createdAt.getTime() + 60 * 60 * 1000 < now.getTime()) {
      return res.status(400).json({
        status: "error",
        message: "OTP has expired",
      });
    }

    // Increment attempt counter
    otpVerification.attempts += 1;

    // Check if max attempts reached
    if (otpVerification.attempts > 5) {
      await otpVerification.deleteOne(); // Remove the OTP entry
      return res.status(400).json({
        status: "error",
        message: "Maximum attempts exceeded. Please request a new OTP.",
      });
    }

    // Check if OTP matches
    if (otpVerification.otp !== otp) {
      await otpVerification.save(); // Save the updated attempts
      return res.status(401).json({
        status: "error",
        message: `Invalid OTP. ${5 - otpVerification.attempts
          } attempts remaining.`,
      });
    }

    // Mark as verified
    otpVerification.verified = true;
    otpVerification.verifiedAt = now;
    await otpVerification.save();

    logger.info(`OTP verified successfully for ${email}`);

    // Check if a registration already exists for this user
    let registration = await Registration.findOne({
      $or: [{ email }, { contactNumber }],
    });

    // Generate a verification token for the frontend
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Return success message with appropriate data
    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      verified: true,
      verificationToken,
      existingRegistration: registration ? true : false,
      registrationId: registration ? registration._id : null,
    });
  } catch (error) {
    logger.error(`Error verifying OTP: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Process payment for registration
 */
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      paymentMethod,
      paymentGatewayResponse,
      isAnonymous = false,
      purpose = "registration",
      notes,
    } = req.body;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Find registration
    const registration = await Registration.findById(id);

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId,
      registrationId: id,
      name: registration.name,
      email: registration.email,
      contactNumber: registration.contactNumber,
      amount,
      paymentMethod,
      paymentGatewayResponse,
      status: "completed",
      purpose,
      isAnonymous,
      notes,
      completedAt: new Date(),
    });

    // Update registration payment status
    registration.paymentStatus = "Completed";
    registration.paymentId = transactionId;
    registration.paymentDetails = JSON.stringify(paymentGatewayResponse);
    registration.willContribute = true;
    registration.contributionAmount = amount;
    registration.lastUpdated = new Date();

    await registration.save();

    logger.info(
      `Payment processed successfully: ${transactionId} for registration ${id}`
    );

    // Send payment confirmation email (not registration confirmation)
    if (registration && !isAnonymous) {
      try {
        await sendPaymentConfirmationEmail(registration, transactionId, amount);
        logger.info(
          `Payment confirmation email sent to ${registration.email} after transaction registration`
        );
      } catch (emailError) {
        logger.error(
          `Failed to send payment confirmation email: ${emailError.message}`
        );
        // Don't fail the transaction registration if email fails
      }
    }

    // Return success response
    res.status(200).json({
      status: "success",
      message: "Payment processed successfully",
      data: {
        transactionId,
        registrationId: id,
        amount,
        status: "completed",
        completedAt: transaction.completedAt,
        paymentEmailSent: !isAnonymous && !!registration,
      },
    });
  } catch (error) {
    logger.error(`Error processing payment: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get registration statistics
 */
export const getRegistrationStats = async (req, res) => {
  try {
    // Get counts by registration type
    const [totalRegistrations, typeStats, attendanceStats, paymentStats] =
      await Promise.all([
        // Total count
        Registration.countDocuments(),

        // Count by type
        Registration.aggregate([
          { $group: { _id: "$registrationType", count: { $sum: 1 } } },
        ]),

        // Count by attendance
        Registration.aggregate([
          { $group: { _id: "$isAttending", count: { $sum: 1 } } },
        ]),

        // Payment statistics
        Registration.aggregate([
          {
            $group: {
              _id: "$paymentStatus",
              count: { $sum: 1 },
              totalAmount: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "Completed"] },
                    "$contributionAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]),
      ]);

    // Transform stats for easier consumption
    const formattedTypeStats = typeStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const formattedAttendanceStats = attendanceStats.reduce(
      (acc, curr) => {
        acc[curr._id ? "attending" : "notAttending"] = curr.count;
        return acc;
      },
      { attending: 0, notAttending: 0 }
    );

    const formattedPaymentStats = paymentStats.reduce(
      (acc, curr) => {
        acc.counts[curr._id || "Pending"] = curr.count;
        if (curr._id === "Completed") {
          acc.totalAmountCollected = curr.totalAmount;
        }
        return acc;
      },
      { counts: {}, totalAmountCollected: 0 }
    );

    // Return statistics
    res.status(200).json({
      status: "success",
      data: {
        totalRegistrations,
        byType: formattedTypeStats,
        byAttendance: formattedAttendanceStats,
        payments: formattedPaymentStats,
      },
    });
  } catch (error) {
    logger.error(`Error getting registration statistics: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Save registration steps
 * Handle multi-step form saving with partial validation
 */
export const saveRegistrationStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step, stepData, verificationToken } = req.body;

    // Validate step number
    if (!step || isNaN(step) || step < 1 || step > 8) {
      return res.status(400).json({
        status: "error",
        message: "Invalid step number",
      });
    }

    // Validate step data
    if (!stepData) {
      return res.status(400).json({
        status: "error",
        message: "No data provided for this step",
      });
    }

    // Sanitize the step data using our utility function
    const sanitizedStepData = sanitizeStepData(step, stepData);
    const { formDataStructured, ...rootLevelData } = sanitizedStepData;

    // Create a cleaned data object with only necessary root fields
    const cleanedData = {
      lastUpdated: new Date(),
      [`step${step}Complete`]: true,
    };

    const emailExists = await Registration.findOne({
      email: formDataStructured.personalInfo.email,
    });

    // Add metadata and essential fields that need to be at root level for queries and indexing
    if (step === 1 && !emailExists) {
      if (formDataStructured?.personalInfo) {
        cleanedData.name = formDataStructured.personalInfo.name;
        cleanedData.email = formDataStructured.personalInfo.email;
        cleanedData.contactNumber =
          formDataStructured.personalInfo.contactNumber;
        cleanedData.country = formDataStructured.personalInfo.country;

        cleanedData.school = formDataStructured.personalInfo.school;
        cleanedData.customSchoolName = formDataStructured.customSchoolName;
        cleanedData.yearOfPassing =
          formDataStructured.personalInfo.yearOfPassing;
      }

      if (formDataStructured?.verification) {
        cleanedData.emailVerified =
          formDataStructured.verification.emailVerified;
        cleanedData.captchaVerified =
          formDataStructured.verification.captchaVerified;
        cleanedData.verificationQuizPassed =
          formDataStructured.verification.quizPassed;
      }
    } else if (step === 3 && formDataStructured?.eventAttendance) {
      cleanedData.isAttending = formDataStructured.eventAttendance.isAttending;
      cleanedData.attendees = formDataStructured.eventAttendance.attendees;
    } else if (step === 8 && formDataStructured?.financial) {
      cleanedData.willContribute = formDataStructured.financial.willContribute;
      cleanedData.contributionAmount =
        formDataStructured.financial.contributionAmount;
      cleanedData.formSubmissionComplete = true;
    }

    // If ID is provided, update existing registration
    if (emailExists) {
      // Get existing registration
      const existingRegistration = await Registration.findOne({
        email: formDataStructured.personalInfo.email,
      });

      // Check if registration exists
      if (!existingRegistration) {
        return res.status(404).json({
          status: "error",
          message: "Registration not found",
        });
      }

      // Handle formDataStructured merge correctly
      if (formDataStructured) {
        if (!existingRegistration.formDataStructured) {
          cleanedData.formDataStructured = formDataStructured;
        } else {
          const existingStructured =
            existingRegistration.formDataStructured.toObject();

          // Deep merge the formDataStructured objects by section
          cleanedData.formDataStructured = {
            verification: {
              ...existingStructured.verification,
              ...formDataStructured.verification,
            },
            personalInfo: {
              ...existingStructured.personalInfo,
              ...formDataStructured.personalInfo,
            },
            professional: {
              ...existingStructured.professional,
              ...formDataStructured.professional,
            },
            eventAttendance: {
              ...existingStructured.eventAttendance,
              ...formDataStructured.eventAttendance,
            },
            sponsorship: {
              ...existingStructured.sponsorship,
              ...formDataStructured.sponsorship,
            },
            transportation: {
              ...existingStructured.transportation,
              ...formDataStructured.transportation,
            },
            accommodation: {
              ...existingStructured.accommodation,
              ...formDataStructured.accommodation,
            },
            optional: {
              ...existingStructured.optional,
              ...formDataStructured.optional,
            },
            financial: {
              ...existingStructured.financial,
              ...formDataStructured.financial,
            },
          };

          // Apply sanitization to the merged data
          cleanedData.formDataStructured = sanitizeFormData(
            cleanedData.formDataStructured
          );
        }
      }

      // Set current step
      cleanedData.currentStep = step;

      // Update registration with cleaned data
      const updatedRegistration = await Registration.findByIdAndUpdate(
        existingRegistration._id,
        { $set: cleanedData },
        { new: true, runValidators: true }
      );

      // Send registration confirmation email when registration is completed (step 8)
      if (step === 8 && updatedRegistration.formSubmissionComplete) {
        try {
          await sendRegistrationConfirmationEmail(updatedRegistration);
          logger.info(
            `Registration confirmation email sent to ${updatedRegistration.email} for completed registration ${updatedRegistration._id}`
          );
        } catch (emailError) {
          logger.error(
            `Failed to send registration confirmation email: ${emailError.message}`
          );
          // Don't fail the registration completion if email fails
        }
      }

      // Return updated registration
      return res.status(200).json({
        status: "success",
        message: `Step ${step} saved successfully`,
        data: {
          registrationId: updatedRegistration._id,
          currentStep: step,
          isComplete: updatedRegistration.formSubmissionComplete || false,
          confirmationEmailSent:
            step === 8 && updatedRegistration.formSubmissionComplete,
        },
      });
    }
    // Create new registration (first step)
    else {
      // Verify that the first step has required fields
      if (step === 1) {
        if (
          !formDataStructured?.personalInfo?.email ||
          !formDataStructured?.personalInfo?.contactNumber
        ) {
          return res.status(400).json({
            status: "error",
            message: "Email and contact number are required for the first step",
          });
        }

        // Verify OTP verification exists
        const otpVerification = await OtpVerification.findOne({
          email: formDataStructured.personalInfo.email,
          contactNumber: formDataStructured.personalInfo.contactNumber,
          verified: true,
        });

        if (!otpVerification) {
          return res.status(401).json({
            status: "error",
            message: "OTP verification required before creating registration",
          });
        }

        // Add required fields with default values to satisfy schema requirements
        const registrationData = {
          ...cleanedData,
          registrationType:
            formDataStructured.personalInfo.registrationType || "Alumni",
          name: formDataStructured.personalInfo.name,
          email: formDataStructured.personalInfo.email,
          contactNumber: formDataStructured.personalInfo.contactNumber,
          country: formDataStructured.personalInfo.country,
          school: formDataStructured.personalInfo.school,
          customSchoolName: formDataStructured.customSchoolName,
          yearOfPassing: formDataStructured.personalInfo.yearOfPassing,
          emailVerified: true, // Already verified through OTP
          isAttending: false, // Default
          willContribute: false, // Default
          registrationDate: new Date(),
          currentStep: 1,
          formDataStructured,
        };

        // Create new registration
        const newRegistration = await Registration.create(registrationData);

        // Auto-assign serial number to the new registration
        let assignedSerial = null;
        try {
          assignedSerial = await autoAssignSerialNumber(newRegistration._id);
          if (assignedSerial) {
            logger.info(
              `Auto-assigned serial number ${assignedSerial} to new registration ${newRegistration._id}`
            );
          }
        } catch (serialError) {
          logger.warn(
            `Failed to auto-assign serial number to new registration ${newRegistration._id}: ${serialError.message}`
          );
          // Don't fail the registration creation if serial number assignment fails
        }

        // Return new registration
        return res.status(201).json({
          status: "success",
          message: "Registration created and first step saved successfully",
          data: {
            registrationId: newRegistration._id,
            currentStep: step,
            isComplete: false,
            serialNumber: assignedSerial,
          },
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "Cannot create registration starting from step other than 1",
        });
      }
    }
  } catch (error) {
    logger.error(`Error saving registration step: ${error.message}`);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message:
          "A registration with this email or contact number already exists",
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateRegistrationPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, paymentAmount, paymentMethod } =
      req.body;

    const existingRegistration = await Registration.findById(id);
    const existingPaymentHistory =
      existingRegistration.formDataStructured.financial.paymentHistory;

    let updatedData = {
      paymentStatus,
      step8Complete: true,
      formSubmissionComplete: true,
      currentStep: 8,
      "formDataStructured.financial.paymentStatus": paymentStatus,
      "formDataStructured.financial.paymentId": transactionId,
      "formDataStructured.financial.contributionAmount": paymentAmount,
      "formDataStructured.financial.willContribute": false,
      "formDataStructured.financial.paymentDetails": paymentMethod,
      "formDataStructured.financial.paymentHistory": [
        ...existingPaymentHistory,
        {
          amount: paymentAmount,
          date: new Date(),
          paymentMethod: `${paymentMethod}-Initial`,
          transactionId: transactionId,
        },
      ],
    };

    const registration = await Registration.findByIdAndUpdate(
      id,
      {
        $set: updatedData,
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Registration payment updated successfully",
      data: registration,
    });
  } catch (error) {
    logger.error(`Error updating registration step: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

//add more amount
export const addMoreAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, transactionId, paymentMethod } = req.body;

    const existingRegistration = await Registration.findById(id);
    const existingPaymentHistory =
      existingRegistration.formDataStructured.financial.paymentHistory;
    const existingContributionAmount =
      existingRegistration.formDataStructured.financial.contributionAmount;
    const totalAmount = Number(amount) + Number(existingContributionAmount);

    let updatedData = {
      "formDataStructured.financial.contributionAmount": totalAmount,
      "formDataStructured.financial.paymentHistory": [
        ...existingPaymentHistory,
        {
          amount: amount,
          date: new Date(),
          paymentMethod: `${paymentMethod}-Additional`,
          transactionId: transactionId,
        },
      ],
    };
    const registration = await Registration.findByIdAndUpdate(
      id,
      {
        $set: updatedData,
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Amount added successfully",
      data: registration,
    });
  } catch (error) {
    logger.error(`Error adding more amount: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

//contact page
export const sendMessage = async (req, res) => {
  try {
    const { email, subject, message, name } = req.body;

    // Validate required fields
    if (!email || !subject || !message) {
      return res.status(400).json({
        status: "error",
        message: "Email, subject, and message are required",
      });
    }

    // Parse the message to extract structured data
    const parseContactMessage = (messageString) => {
      try {
        const lines = messageString
          .split("\n")
          .filter((line) => line.trim() !== "");

        let parsedData = {
          name: null,
          email: null,
          phone: null,
          message: null,
        };

        let messageStartIndex = -1;

        // Parse each line to extract fields
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.startsWith("Name:")) {
            parsedData.name = line.replace("Name:", "").trim();
          } else if (line.startsWith("Email:")) {
            parsedData.email = line.replace("Email:", "").trim();
          } else if (line.startsWith("Phone:")) {
            parsedData.phone = line.replace("Phone:", "").trim();
          } else if (line === "Message:") {
            messageStartIndex = i + 1;
            break;
          }
        }

        // Extract the actual message content
        if (messageStartIndex >= 0 && messageStartIndex < lines.length) {
          parsedData.message = lines.slice(messageStartIndex).join("\n").trim();
        }

        return parsedData;
      } catch (error) {
        logger.error(`Error parsing contact message: ${error.message}`);
        return {
          name: null,
          email: null,
          phone: null,
          message: messageString, // fallback to original message
        };
      }
    };

    const parsedMessage = parseContactMessage(message);

    // Save the message to the database with parsed information
    const contactMessage = new ContactMessage({
      name: parsedMessage.name || name || null,
      email: parsedMessage.email || email,
      phone: parsedMessage.phone || null,
      subject: subject,
      message: parsedMessage.message || message,
      originalMessage: message, // Keep the original formatted message
      status: "new",
    });

    // Save to database
    await contactMessage.save();

    await sendContactMessageEmail({
      email,
      subject,
      message,
      name: name || null, // Optional name field
    });

    logger.info(
      `Contact message saved to database with ID: ${contactMessage._id}`
    );

    res.status(200).json({
      status: "success",
      message: "Message sent successfully",
      messageId: contactMessage._id,
    });
  } catch (error) {
    logger.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const transactionRegister = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const {
      amount,
      name,
      email,
      contact,
      paymentMethod,
      paymentGatewayResponse,
      isAnonymous = false,
      purpose = "registration",
      notes,
    } = req.body;

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;
    const transaction = await Transaction.create(
      [
        {
          amount,
          transactionId: transactionId,
          registrationId: id,
          name,
          email,
          contactNumber: contact,
          paymentMethod,
          paymentGatewayResponse,
          isAnonymous,
          status: "completed",
          purpose,
          notes,
        },
      ],
      { session }
    );

    if (purpose === "registration") {
      const registration = await Registration.findByIdAndUpdate(
        id,
        {
          $set: {
            paymentStatus: "Completed",
            paymentId: transactionId,
            contributionAmount: amount,
            willContribute: true,
            lastUpdated: new Date(),
          },
        },
        { new: true, session }
      );

      if (!registration) {
        throw new Error("Registration not found");
      }

      await session.commitTransaction();

      // Send payment confirmation email (not registration confirmation)
      if (registration && !isAnonymous) {
        try {
          await sendPaymentConfirmationEmail(
            registration,
            transactionId,
            amount
          );
          logger.info(
            `Payment confirmation email sent to ${registration.email} after transaction registration`
          );
        } catch (emailError) {
          logger.error(
            `Failed to send payment confirmation email: ${emailError.message}`
          );
          // Don't fail the transaction registration if email fails
        }
      }
    }
    await session.commitTransaction();
    if (!transaction || transaction.length === 0) {
      throw new Error("Transaction creation failed");
    }
    res.status(200).json({
      status: "success",
      message: "Transaction registered successfully",
      data: {
        transactionId,
        registrationId: id,
        amount,
        status: "completed",
      },
    });
  } catch (error) {
    logger.error(`Error registering transaction: ${error.message}`);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

/**
 * Get registration by email or contact number (for alumni updates)
 */
export const getRegistrationByContact = async (req, res) => {
  try {
    const { email, contactNumber } = req.body;
    console.log(email, contactNumber);

    if (!email && !contactNumber) {
      return res.status(400).json({
        status: "error",
        message: "Email or contact number is required",
      });
    }

    let query = {};
    if (email) {
      query.email = email;
    } else if (contactNumber) {
      query.contactNumber = contactNumber;
    }

    // Only allow Alumni registrations for updates
    query.registrationType = "Alumni";

    const registration = await Registration.findOne(query).select("-__v");

    if (!registration) {
      return res.status(404).json({
        status: "error",
        message:
          "No alumni registration found with the provided contact information",
      });
    }

    // Return the registration data
    res.status(200).json({
      status: "success",
      data: registration,
    });
  } catch (error) {
    logger.error("Error fetching registration by contact:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch registration data",
    });
  }
};

export const staffRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const { step, stepData, verificationToken } = req.body;
    // Validate step number
    if (!step || isNaN(step) || step < 1 || step > 7) {
      return res.status(400).json({
        status: "error",
        message: "Invalid step number",
      });
    }

    // Validate step data
    if (!stepData) {
      return res.status(400).json({
        status: "error",
        message: "No data provided for this step",
      });
    }

    // Validate verification token
    if (!verificationToken) {
      return res.status(400).json({
        status: "error",
        message: "Verification token is required",
      });
    }
    const emailExists = await Registration.findOne({
      email: stepData.formDataStructured?.personalInfo?.email,
    });
    let cleanedData = {};
    let registration = null;
    if (step === 1 && !emailExists) {
      if (stepData.formDataStructured?.personalInfo) {
        cleanedData.registrationType = "Staff";
        cleanedData.email = stepData.formDataStructured?.personalInfo?.email;
        cleanedData.contactNumber =
          stepData.formDataStructured?.personalInfo?.contactNumber;
        cleanedData.whatsappNumber =
          stepData.formDataStructured?.personalInfo?.whatsappNumber;
        cleanedData.emailVerified = true;

        cleanedData.formSubmissionComplete = false;
        cleanedData.name = stepData.formDataStructured?.personalInfo?.name;
        cleanedData.formDataStructured = stepData.formDataStructured;
      }
      const newStaffRegistration = await Registration.create(cleanedData);

      // Auto-assign serial number to the new staff registration
      let assignedSerial = null;
      try {
        assignedSerial = await autoAssignSerialNumber(newStaffRegistration._id);
        if (assignedSerial) {
          logger.info(
            `Auto-assigned serial number ${assignedSerial} to new staff registration ${newStaffRegistration._id}`
          );
        }
      } catch (serialError) {
        logger.warn(
          `Failed to auto-assign serial number to new staff registration ${newStaffRegistration._id}: ${serialError.message}`
        );
        // Don't fail the registration creation if serial number assignment fails
      }

      res.status(200).json({
        status: "success",
        message: "Staff registration created successfully",
        data: {
          ...cleanedData,
          _id: newStaffRegistration._id,
          serialNumber: assignedSerial,
        },
      });
    } else {
      registration = await Registration.findByIdAndUpdate(
        emailExists._id,
        {
          $set: stepData,
        },
        { new: true }
      );
    }

    // Send registration confirmation email when registration is completed (step 8)
    if (step === 7 && registration.formSubmissionComplete) {
      try {
        await sendRegistrationConfirmationEmail(registration);
        logger.info(
          `Registration confirmation email sent to ${registration.email} for completed registration ${registration._id}`
        );
      } catch (emailError) {
        logger.error(
          `Failed to send registration confirmation email: ${emailError.message}`
        );
        // Don't fail the registration completion if email fails
      }
    }

    res.status(200).json({
      status: "success",
      message: "Staff registration updated successfully",
      data: registration,
    });
  } catch (error) {
    logger.error(`Error staff registration: ${error.message}`);
  }
};

//quick registration
export const createQuickRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    if (registration) {
      // Auto-assign serial number if not already assigned
      if (!registration.serialNumber || registration.serialNumber === 0) {
        try {
          const assignedSerial = await autoAssignSerialNumber(registration._id);
          if (assignedSerial) {
            logger.info(
              `Auto-assigned serial number ${assignedSerial} to quick registration ${registration._id}`
            );
            // Update the registration object with the new serial number
            registration.serialNumber = assignedSerial;
          }
        } catch (serialError) {
          logger.warn(
            `Failed to auto-assign serial number to quick registration ${registration._id}: ${serialError.message}`
          );
        }
      }

      await sendRegistrationConfirmationEmail(registration);
      logger.info(
        `Registration confirmation email sent to ${registration.email} for quick registration ${registration._id}`
      );
    }
    console.log(registration);

    // Only create transaction if payment was actually made (not for financial difficulty)
    const paymentStatus =
      registration.formDataStructured?.financial?.paymentStatus;
    if (
      paymentStatus !== "financial-difficulty" &&
      registration.paymentDetails
    ) {
      //create transaction
      const transaction = await Transaction.create({
        transactionId: uuidv4(),
        name: registration.name,
        email: registration.email,
        contactNumber: registration.contactNumber,
        registrationId: registration._id,
        amount: registration.formDataStructured.financial.contributionAmount,
        status: "completed",
        paymentMethod: "razorpay",
        purpose: "registration",
        isAnonymous: false,
        paymentGatewayResponse: JSON.stringify(registration.paymentDetails),
      });

      logger.info(
        `Transaction created for quick registration: ${transaction.transactionId} for registration ${registration._id}`
      );
    } else if (paymentStatus === "financial-difficulty") {
      logger.info(
        `Quick registration ${registration._id} marked as financial difficulty - no transaction created`
      );
    }

    res.status(200).json({
      status: "success",
      message: "Quick registration created successfully",
      data: registration,
    });
  } catch (error) {
    logger.error(`Error creating quick registration: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

//temp quick registration
export const tempQuickRegistration = async (req, res) => {
  try {
    console.log(req.body);
    const { email, contactNumber } = req.body;
    const registration = await Registration.create(req.body);

    // Auto-assign serial number to the new temp registration
    let assignedSerial = null;
    try {
      assignedSerial = await autoAssignSerialNumber(registration._id);
      if (assignedSerial) {
        logger.info(
          `Auto-assigned serial number ${assignedSerial} to temp quick registration ${registration._id}`
        );
      }
    } catch (serialError) {
      logger.warn(
        `Failed to auto-assign serial number to temp quick registration ${registration._id}: ${serialError.message}`
      );
      // Don't fail the registration creation if serial number assignment fails
    }

    res.status(200).json({
      status: "success",
      message: "Temp quick registration created successfully",
      data: {
        ...registration.toObject(),
        serialNumber: assignedSerial,
      },
    });
  } catch (error) {
    logger.error(`Error creating temp quick registration: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Delete duplicate email registrations based on payment status priority
 * Priority: Completed > Pending > Financial-difficulty
 * Rules:
 * 1. If Completed + Pending → Delete Pending
 * 2. If Completed + Financial-difficulty → Delete Financial-difficulty
 * 3. If 2 Pending → Delete oldest one
 * 4. If 2 Financial-difficulty → Delete oldest one
 */
export const deleteDuplicatePendingRegistrations = async (req, res) => {
  try {
    const { dryRun = false } = req.query;

    // Find all duplicate registrations by email
    const duplicatesByEmail = await Registration.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          registrations: { $push: "$$ROOT" },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ]);

    let deletedCount = 0;
    let keptCount = 0;
    const deletionLog = [];

    for (const group of duplicatesByEmail) {
      const { _id: email, registrations } = group;

      // Categorize registrations by payment status
      const completed = registrations.filter(
        (reg) => reg.paymentStatus === "Completed"
      );
      const pending = registrations.filter(
        (reg) => reg.paymentStatus === "pending"
      );
      const financialDifficulty = registrations.filter(
        (reg) => reg.paymentStatus === "financial-difficulty"
      );
      const others = registrations.filter(
        (reg) =>
          !["Completed", "pending", "financial-difficulty"].includes(
            reg.paymentStatus
          )
      );

      const toDelete = [];
      const toKeep = [];
      let reason = "";

      // Rule 1: If Completed exists, keep all Completed, delete Pending and Financial-difficulty
      if (completed.length > 0) {
        toKeep.push(...completed);
        toDelete.push(...pending);
        toDelete.push(...financialDifficulty);
        toDelete.push(...others);

        if (
          pending.length > 0 ||
          financialDifficulty.length > 0 ||
          others.length > 0
        ) {
          reason = `Keep ${completed.length} completed, delete ${pending.length} pending + ${financialDifficulty.length} financial-difficulty + ${others.length} others`;
        }
      }
      // Rule 2: If no Completed but multiple Pending exist, keep newest Pending
      else if (pending.length > 1) {
        // Sort pending by registration date (newest first)
        const sortedPending = [...pending].sort(
          (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
        );

        toKeep.push(sortedPending[0]); // Keep newest pending
        toDelete.push(...sortedPending.slice(1)); // Delete older pending
        toKeep.push(...financialDifficulty); // Keep financial-difficulty
        toKeep.push(...others); // Keep others

        reason = `Keep newest pending (${sortedPending[0].registrationDate?.toLocaleDateString()}), delete ${sortedPending.length - 1
          } older pending`;
      }
      // Rule 3: If no Completed, 1 or 0 Pending, but multiple Financial-difficulty, keep newest Financial-difficulty
      else if (financialDifficulty.length > 1) {
        // Sort financial-difficulty by registration date (newest first)
        const sortedFinancial = [...financialDifficulty].sort(
          (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
        );

        toKeep.push(...pending); // Keep all pending
        toKeep.push(sortedFinancial[0]); // Keep newest financial-difficulty
        toDelete.push(...sortedFinancial.slice(1)); // Delete older financial-difficulty
        toKeep.push(...others); // Keep others

        reason = `Keep newest financial-difficulty, delete ${sortedFinancial.length - 1
          } older financial-difficulty`;
      }
      // Rule 4: Handle other status duplicates - keep newest
      else if (others.length > 1) {
        const sortedOthers = [...others].sort(
          (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
        );

        toKeep.push(...completed);
        toKeep.push(...pending);
        toKeep.push(...financialDifficulty);
        toKeep.push(sortedOthers[0]); // Keep newest other
        toDelete.push(...sortedOthers.slice(1)); // Delete older others

        reason = `Keep newest registration with status '${sortedOthers[0].paymentStatus
          }', delete ${sortedOthers.length - 1} older`;
      }

      // If nothing to delete, skip this email
      if (toDelete.length === 0) {
        logger.info(
          `No duplicates to delete for email: ${email} - all registrations have different appropriate statuses`
        );
        continue;
      }

      const groupLog = {
        email,
        totalDuplicates: registrations.length,
        reason,
        statusBreakdown: {
          completed: completed.length,
          pending: pending.length,
          financialDifficulty: financialDifficulty.length,
          others: others.length,
        },
        kept: toKeep.map((reg) => ({
          id: reg._id.toString(),
          registrationDate: reg.registrationDate,
          name: reg.name,
          paymentStatus: reg.paymentStatus,
          formComplete: reg.formSubmissionComplete,
        })),
        deleted: [],
      };

      for (const regToDelete of toDelete) {
        groupLog.deleted.push({
          id: regToDelete._id.toString(),
          registrationDate: regToDelete.registrationDate,
          name: regToDelete.name,
          paymentStatus: regToDelete.paymentStatus,
          formComplete: regToDelete.formSubmissionComplete,
        });

        if (!dryRun) {
          // Also delete related OTP verifications and transactions
          await Promise.all([
            Registration.findByIdAndDelete(regToDelete._id),
            OtpVerification.deleteMany({
              $or: [
                { email: regToDelete.email },
                { contactNumber: regToDelete.contactNumber },
              ],
            }),
            Transaction.deleteMany({
              registrationId: regToDelete._id.toString(),
            }),
          ]);

          logger.info(
            `Deleted duplicate registration: ${regToDelete._id} (${regToDelete.paymentStatus}) for email: ${email} - ${reason}`
          );
        }

        deletedCount++;
      }

      keptCount += toKeep.length;
      deletionLog.push(groupLog);
    }

    // Log summary
    const summary = {
      totalEmailGroups: duplicatesByEmail.length,
      emailGroupsProcessed: deletionLog.length,
      registrationsKept: keptCount,
      registrationsDeleted: deletedCount,
      dryRun,
    };

    logger.info(`Smart duplicate deletion summary: ${JSON.stringify(summary)}`);

    res.status(200).json({
      status: "success",
      message: dryRun
        ? `Dry run completed: ${deletedCount} duplicate registrations would be deleted using smart priority logic`
        : `Successfully deleted ${deletedCount} duplicate registrations using smart priority logic`,
      data: {
        summary,
        deletionLog,
      },
    });
  } catch (error) {
    logger.error(`Error deleting duplicate registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const addNumberToregistration = async (req, res) => {
  try {
    // Find the highest existing serial number to determine the next available number
    const highestSerial = await Registration.findOne({}, { serialNumber: 1 })
      .sort({ serialNumber: -1 })
      .limit(1);

    let nextSerialNumber = 1;
    if (
      highestSerial &&
      highestSerial.serialNumber &&
      highestSerial.serialNumber > 0
    ) {
      nextSerialNumber = highestSerial.serialNumber + 1;
    }

    // Find all registrations that don't have a serial number
    const registrationsWithoutSerial = await Registration.find({
      $or: [
        { serialNumber: { $exists: false } },
        { serialNumber: null },
        { serialNumber: 0 },
      ],
    }).sort({ registrationDate: 1 }); // Sort by registration date to maintain order

    if (registrationsWithoutSerial.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "All registrations already have serial numbers assigned.",
        summary: {
          totalRegistrations: await Registration.countDocuments(),
          registrationsWithSerial: await Registration.countDocuments({
            serialNumber: { $exists: true, $ne: null, $ne: 0 },
          }),
          newlyAdded: 0,
          nextAvailableSerial: nextSerialNumber,
        },
      });
    }

    let updatedCount = 0;
    const updatedRegistrations = [];
    const errors = [];

    for (const registration of registrationsWithoutSerial) {
      try {
        // Add the next available serial number
        registration.serialNumber = nextSerialNumber;
        await registration.save();

        updatedRegistrations.push({
          id: registration._id,
          name: registration.name,
          email: registration.email,
          serialNumber: nextSerialNumber,
          registrationDate: registration.registrationDate,
        });

        nextSerialNumber++;
        updatedCount++;
      } catch (saveError) {
        // If there's a duplicate key error, try the next number
        if (saveError.code === 11000) {
          logger.warn(
            `Duplicate serial number ${nextSerialNumber} for ${registration.email}, trying next number`
          );
          nextSerialNumber++;
          // Try again with the next number
          try {
            registration.serialNumber = nextSerialNumber;
            await registration.save();

            updatedRegistrations.push({
              id: registration._id,
              name: registration.name,
              email: registration.email,
              serialNumber: nextSerialNumber,
              registrationDate: registration.registrationDate,
            });

            nextSerialNumber++;
            updatedCount++;
          } catch (retryError) {
            errors.push({
              email: registration.email,
              error: retryError.message,
            });
          }
        } else {
          errors.push({
            email: registration.email,
            error: saveError.message,
          });
        }
      }
    }

    // Get summary of all registrations with serial numbers
    const totalWithSerial = await Registration.countDocuments({
      serialNumber: { $exists: true, $ne: null, $ne: 0 },
    });

    const response = {
      status: "success",
      message: `Serial numbers added successfully. ${updatedCount} registrations updated.`,
      summary: {
        totalRegistrations: await Registration.countDocuments(),
        registrationsWithSerial: totalWithSerial,
        newlyAdded: updatedCount,
        nextAvailableSerial: nextSerialNumber,
      },
      updatedRegistrations: updatedRegistrations,
    };

    if (errors.length > 0) {
      response.warnings = `${errors.length} registrations had errors during serial number assignment`;
      response.errors = errors;
    }

    res.status(200).json(response);

    logger.info(
      `Serial numbers added to ${updatedCount} registrations. Next available serial: ${nextSerialNumber}`
    );
  } catch (error) {
    logger.error(
      `Error adding serial numbers to registrations: ${error.message}`
    );
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get serial number status for all registrations
 */
export const getSerialNumberStatus = async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const withSerial = await Registration.countDocuments({
      serialNumber: { $exists: true, $ne: null, $ne: 0 },
    });
    const withoutSerial = totalRegistrations - withSerial;

    // Get the highest and lowest serial numbers
    const highestSerial = await Registration.findOne({}, { serialNumber: 1 })
      .sort({ serialNumber: -1 })
      .limit(1);

    const lowestSerial = await Registration.findOne({}, { serialNumber: 1 })
      .sort({ serialNumber: 1 })
      .limit(1);

    // Check for any gaps in serial numbers
    const allSerials = await Registration.find(
      {
        serialNumber: { $exists: true, $ne: null, $ne: 0 },
      },
      { serialNumber: 1 }
    ).sort({ serialNumber: 1 });

    let gaps = [];
    if (allSerials.length > 1) {
      for (let i = 0; i < allSerials.length - 1; i++) {
        const current = allSerials[i].serialNumber;
        const next = allSerials[i + 1].serialNumber;
        if (next - current > 1) {
          gaps.push({ from: current + 1, to: next - 1 });
        }
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          totalRegistrations,
          withSerial,
          withoutSerial,
          nextAvailableSerial: highestSerial
            ? highestSerial.serialNumber + 1
            : 1,
        },
        serialNumberRange: {
          lowest: lowestSerial ? lowestSerial.serialNumber : null,
          highest: highestSerial ? highestSerial.serialNumber : null,
        },
        gaps: gaps.length > 0 ? gaps : "No gaps found",
      },
    });
  } catch (error) {
    logger.error(`Error getting serial number status: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Auto-assign serial number to a new registration
 * This function is called automatically when a new registration is created
 */
export const autoAssignSerialNumber = async (registrationId) => {
  try {
    // Find the registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      logger.warn(
        `Registration ${registrationId} not found for serial number assignment`
      );
      return null;
    }

    // Check if registration already has a serial number
    if (registration.serialNumber && registration.serialNumber > 0) {
      logger.info(
        `Registration ${registrationId} already has serial number: ${registration.serialNumber}`
      );
      return registration.serialNumber;
    }

    // Find the highest existing serial number
    const highestSerial = await Registration.findOne(
      { serialNumber: { $exists: true, $ne: null, $ne: 0 } },
      { serialNumber: 1 }
    )
      .sort({ serialNumber: -1 })
      .limit(1);

    let nextSerialNumber = 1;
    if (highestSerial && highestSerial.serialNumber > 0) {
      nextSerialNumber = highestSerial.serialNumber + 1;
    }

    // Assign the serial number
    registration.serialNumber = nextSerialNumber;
    await registration.save();

    logger.info(
      `Auto-assigned serial number ${nextSerialNumber} to registration ${registrationId} (${registration.email})`
    );

    return nextSerialNumber;
  } catch (error) {
    logger.error(
      `Error auto-assigning serial number to registration ${registrationId}: ${error.message}`
    );

    // If there's a duplicate key error, try the next number
    if (error.code === 11000) {
      try {
        // Find the next available serial number
        const highestSerial = await Registration.findOne(
          { serialNumber: { $exists: true, $ne: null, $ne: 0 } },
          { serialNumber: 1 }
        )
          .sort({ serialNumber: -1 })
          .limit(1);

        let nextSerialNumber = 1;
        if (highestSerial && highestSerial.serialNumber > 0) {
          nextSerialNumber = highestSerial.serialNumber + 1;
        }

        // Try to assign the next available number
        const registration = await Registration.findById(registrationId);
        if (registration) {
          registration.serialNumber = nextSerialNumber;
          await registration.save();

          logger.info(
            `Auto-assigned alternative serial number ${nextSerialNumber} to registration ${registrationId} after duplicate key error`
          );
          return nextSerialNumber;
        }
      } catch (retryError) {
        logger.error(
          `Failed to assign alternative serial number to registration ${registrationId}: ${retryError.message}`
        );
      }
    }

    return null;
  }
};

/**
 * API endpoint to manually assign serial number to a registration
 */
export const assignSerialNumberToRegistration = async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        status: "error",
        message: "Registration ID is required",
      });
    }

    const assignedSerial = await autoAssignSerialNumber(registrationId);

    if (assignedSerial) {
      res.status(200).json({
        status: "success",
        message: "Serial number assigned successfully",
        data: {
          registrationId,
          serialNumber: assignedSerial,
        },
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Failed to assign serial number to registration",
      });
    }
  } catch (error) {
    logger.error(`Error in assignSerialNumberToRegistration: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Bulk auto-assign serial numbers to all registrations without serial numbers
 * This is useful for existing registrations that don't have serial numbers
 */
export const bulkAutoAssignSerialNumbers = async (req, res) => {
  try {
    // Find all registrations without serial numbers
    const registrationsWithoutSerial = await Registration.find({
      $or: [
        { serialNumber: { $exists: false } },
        { serialNumber: null },
        { serialNumber: 0 },
      ],
    }).sort({ registrationDate: 1 });

    if (registrationsWithoutSerial.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "All registrations already have serial numbers assigned.",
        summary: {
          totalRegistrations: await Registration.countDocuments(),
          registrationsWithSerial: await Registration.countDocuments({
            serialNumber: { $exists: true, $ne: null, $ne: 0 },
          }),
          newlyAdded: 0,
        },
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const registration of registrationsWithoutSerial) {
      try {
        const assignedSerial = await autoAssignSerialNumber(registration._id);
        if (assignedSerial) {
          successCount++;
          results.push({
            id: registration._id,
            email: registration.email,
            name: registration.name,
            serialNumber: assignedSerial,
            status: "success",
          });
        } else {
          errorCount++;
          results.push({
            id: registration._id,
            email: registration.email,
            name: registration.name,
            status: "error",
            error: "Failed to assign serial number",
          });
        }
      } catch (error) {
        errorCount++;
        results.push({
          id: registration._id,
          email: registration.email,
          name: registration.name,
          status: "error",
          error: error.message,
        });
      }
    }

    res.status(200).json({
      status: "success",
      message: `Bulk serial number assignment completed. ${successCount} successful, ${errorCount} failed.`,
      summary: {
        totalProcessed: registrationsWithoutSerial.length,
        successful: successCount,
        failed: errorCount,
      },
      results: results,
    });

    logger.info(
      `Bulk serial number assignment completed: ${successCount} successful, ${errorCount} failed`
    );
  } catch (error) {
    logger.error(`Error in bulk auto-assign serial numbers: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
