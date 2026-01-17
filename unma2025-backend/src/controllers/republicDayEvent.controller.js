import EventRegistration from "../models/EventRegistration.js";
import { logger } from "../utils/logger.js";
import { sendRepublicDayEventRegistrationEmail } from "../templates/email/republicDayEventRegistration.js";

/**
 * Create new Republic Day Event registration
 * Public endpoint - no authentication required
 */
export const createRegistration = async (req, res) => {
  try {
    const registrationData = req.body;

    // Check for duplicate registration by email or phone number
    const existingRegistration = await EventRegistration.findOne({
      $or: [
        { email: registrationData.email.toLowerCase() },
        { phoneNumber: registrationData.phoneNumber },
      ],
    });

    if (existingRegistration) {
      return res.status(400).json({
        status: "error",
        message: "A registration with this email or phone number already exists",
      });
    }

    // Create new registration
    const registration = new EventRegistration({
      ...registrationData,
      email: registrationData.email.toLowerCase(),
    });

    await registration.save();

    logger.info(
      `Republic Day Event registration created: ${registration.email} - ${registration.name}`
    );

    // Send confirmation email (don't fail the request if email fails)
    try {
      await sendRepublicDayEventRegistrationEmail(registration);
      logger.info(
        `Confirmation email sent successfully to ${registration.email}`
      );
    } catch (emailError) {
      // Log email error but don't fail the registration
      logger.error(
        `Failed to send confirmation email to ${registration.email}:`,
        emailError
      );
    }

    res.status(201).json({
      status: "success",
      message: "Registration submitted successfully",
      data: {
        id: registration._id,
        name: registration.name,
        email: registration.email,
      },
    });
  } catch (error) {
    logger.error("Error creating Republic Day Event registration:", error);

    // Handle duplicate key error (in case unique index is violated)
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "A registration with this email or phone number already exists",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to submit registration",
      error: error.message,
    });
  }
};

/**
 * Get all registrations (Admin only)
 * Supports pagination, filtering, and sorting
 */
export const getAllRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "registrationDate",
      sortOrder = "desc",
      search,
      jnvSchool,
      foodChoice,
      paymentMethod,
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by JNV School
    if (jnvSchool) {
      query.jnvSchool = jnvSchool;
    }

    // Filter by food choice
    if (foodChoice) {
      query.foodChoice = foodChoice;
    }

    // Filter by payment method
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const registrations = await EventRegistration.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await EventRegistration.countDocuments(query);

    res.status(200).json({
      status: "success",
      data: registrations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error fetching Republic Day Event registrations:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch registrations",
      error: error.message,
    });
  }
};

/**
 * Get registration by ID (Admin only)
 */
export const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await EventRegistration.findById(id).lean();

    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: registration,
    });
  } catch (error) {
    logger.error("Error fetching Republic Day Event registration:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch registration",
      error: error.message,
    });
  }
};

/**
 * Get registration statistics (Admin only)
 */
export const getRegistrationStats = async (req, res) => {
  try {
    const stats = await EventRegistration.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          vegCount: {
            $sum: { $cond: [{ $eq: ["$foodChoice", "Veg"] }, 1, 0] },
          },
          nonVegCount: {
            $sum: { $cond: [{ $eq: ["$foodChoice", "Non-Veg"] }, 1, 0] },
          },
          bloodDonationCount: {
            $sum: {
              $cond: [{ $eq: ["$participateBloodDonation", true] }, 1, 0],
            },
          },
          nationalSongCount: {
            $sum: {
              $cond: [{ $eq: ["$participateNationalSong", true] }, 1, 0],
            },
          },
          boatRideCount: {
            $sum: { $cond: [{ $eq: ["$joinBoatRide", true] }, 1, 0] },
          },
          volunteerCount: {
            $sum: { $cond: [{ $eq: ["$readyToVolunteer", true] }, 1, 0] },
          },
          totalAmountPaid: { $sum: "$amountPaid" },
          avgAmountPaid: { $avg: "$amountPaid" },
        },
      },
    ]);

    // Get registrations by JNV School
    const registrationsByJNV = await EventRegistration.aggregate([
      {
        $group: {
          _id: "$jnvSchool",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Get payment method distribution
    const paymentMethodDistribution = await EventRegistration.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        ...(stats[0] || {
          totalRegistrations: 0,
          vegCount: 0,
          nonVegCount: 0,
          bloodDonationCount: 0,
          nationalSongCount: 0,
          boatRideCount: 0,
          volunteerCount: 0,
          totalAmountPaid: 0,
          avgAmountPaid: 0,
        }),
        registrationsByJNV,
        paymentMethodDistribution,
      },
    });
  } catch (error) {
    logger.error(
      "Error fetching Republic Day Event registration stats:",
      error
    );
    res.status(500).json({
      status: "error",
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};
