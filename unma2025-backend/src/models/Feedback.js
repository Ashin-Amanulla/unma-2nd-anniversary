import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    // Participant Information
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    school: {
      type: String,
      trim: true,
    },

    // Section 1: Overall Experience
    overallSatisfaction: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    mostEnjoyedAspect: {
      type: String,
      required: true,
      trim: true,
    },

    // Section 2: Organisation
    organizationRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Section 3: Sessions
    sessionUsefulness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    favoriteSpeakerSession: {
      type: String,
      required: true,
      trim: true,
    },

    // Section 4: Looking Ahead
    wouldRecommend: {
      type: String,
      required: true,
      enum: ["Yes", "No", "Maybe"],
    },
    improvementSuggestions: {
      type: String,
      required: true,
      trim: true,
    },

    // Additional Ratings
    accommodationRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    accommodationFeedback: {
      type: String,
      trim: true,
    },
    transportationRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    transportationFeedback: {
      type: String,
      trim: true,
    },
    foodQualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    networkingOpportunitiesRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // New feedback questions
    venueQualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    audioVisualRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    eventScheduleRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    registrationProcessRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    favoriteHighlight: {
      type: String,
      trim: true,
    },
    comparedToExpectations: {
      type: String,
      enum: ["Exceeded", "Met", "Below"],
    },
    wouldAttendFuture: {
      type: String,
      enum: ["Definitely", "Probably", "Not Sure", "Probably Not"],
    },
    topAreaForImprovement: {
      type: String,
      trim: true,
    },
    futureSessionSuggestions: {
      type: String,
      trim: true,
    },

    // Additional Comments
    additionalComments: {
      type: String,
      trim: true,
    },

    // Metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ registrationId: 1 });
feedbackSchema.index({ submittedAt: -1 });
feedbackSchema.index({ overallSatisfaction: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
