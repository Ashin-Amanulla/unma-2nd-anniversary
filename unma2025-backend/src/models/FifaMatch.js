import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["winner", "score", "choice", "number", "text"],
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    options: {
      type: [String],
      default: undefined,
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    resultEntered: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const matchSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaSlot",
      required: true,
    },
    teamA: {
      type: String,
      required: [true, "Team A is required"],
      trim: true,
    },
    teamB: {
      type: String,
      required: [true, "Team B is required"],
      trim: true,
    },
    kickoffAt: {
      type: Date,
    },
    stage: {
      type: String,
      enum: ["group", "r16", "qf", "sf", "final"],
      default: "group",
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ slot: 1, order: 1 });
matchSchema.index({ campaign: 1 });

const FifaMatch = mongoose.model("FifaMatch", matchSchema);

export default FifaMatch;
