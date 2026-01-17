import Feedback from "../models/Feedback.js";
import { logger } from "../utils/logger.js";

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
    };

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    logger.info(`Feedback submitted successfully by ${feedbackData.email}`);

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      data: feedback,
    });
  } catch (error) {
    logger.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
};

// Get all feedback (Admin only)
export const getAllFeedback = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "submittedAt",
      sortOrder = "desc",
      minRating,
      maxRating,
      wouldRecommend,
      search,
    } = req.query;

    const query = {};

    // Filter by rating
    if (minRating || maxRating) {
      query.overallSatisfaction = {};
      if (minRating) query.overallSatisfaction.$gte = Number(minRating);
      if (maxRating) query.overallSatisfaction.$lte = Number(maxRating);
    }

    // Filter by recommendation
    if (wouldRecommend) {
      query.wouldRecommend = wouldRecommend;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { school: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const feedback = await Feedback.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("registrationId", "name email phone school")
      .lean();

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// Get feedback statistics (Admin only)
export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          avgOverallSatisfaction: { $avg: "$overallSatisfaction" },
          avgOrganizationRating: { $avg: "$organizationRating" },
          avgSessionUsefulness: { $avg: "$sessionUsefulness" },
          avgAccommodationRating: { $avg: "$accommodationRating" },
          avgTransportationRating: { $avg: "$transportationRating" },
          avgFoodQualityRating: { $avg: "$foodQualityRating" },
          avgNetworkingRating: { $avg: "$networkingOpportunitiesRating" },
          avgVenueQualityRating: { $avg: "$venueQualityRating" },
          avgAudioVisualRating: { $avg: "$audioVisualRating" },
          avgEventScheduleRating: { $avg: "$eventScheduleRating" },
          avgRegistrationProcessRating: { $avg: "$registrationProcessRating" },
          avgCommunicationRating: { $avg: "$communicationRating" },
          wouldRecommendYes: {
            $sum: { $cond: [{ $eq: ["$wouldRecommend", "Yes"] }, 1, 0] },
          },
          wouldRecommendNo: {
            $sum: { $cond: [{ $eq: ["$wouldRecommend", "No"] }, 1, 0] },
          },
          wouldRecommendMaybe: {
            $sum: { $cond: [{ $eq: ["$wouldRecommend", "Maybe"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get rating distribution for overall satisfaction
    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$overallSatisfaction",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {},
        ratingDistribution,
      },
    });
  } catch (error) {
    logger.error("Error fetching feedback stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback statistics",
      error: error.message,
    });
  }
};

// Get feedback by ID (Admin only)
export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id).populate(
      "registrationId",
      "name email phone school"
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error("Error fetching feedback by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
};

// Check if user has already submitted feedback
export const checkFeedbackStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingFeedback = await Feedback.findOne({
      email: email.toLowerCase(),
    });

    res.status(200).json({
      success: true,
      hasSubmitted: !!existingFeedback,
      submittedAt: existingFeedback?.submittedAt,
    });
  } catch (error) {
    logger.error("Error checking feedback status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check feedback status",
      error: error.message,
    });
  }
};

// Export feedback data (Admin only)
export const exportFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({})
      .sort({ submittedAt: -1 })
      .populate("registrationId", "name email phone school")
      .lean();

    res.status(200).json({
      success: true,
      data: feedback,
      count: feedback.length,
    });
  } catch (error) {
    logger.error("Error exporting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export feedback",
      error: error.message,
    });
  }
};
