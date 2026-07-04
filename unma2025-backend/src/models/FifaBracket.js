import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Contest name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    entryClosesAt: {
      type: Date,
      required: [true, "Entry closing time is required"],
    },
    publishedRound: {
      type: String,
      enum: ["r16", "qf", "sf", "final", null],
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

const matchSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaBracketContest",
      required: true,
    },
    stage: {
      type: String,
      enum: ["r16", "qf", "sf", "final"],
      required: true,
    },
    bracketKey: {
      type: String,
      required: true,
      trim: true,
    },
    side: {
      type: String,
      enum: ["left", "right", "center"],
      required: true,
    },
    teamA: {
      type: String,
      trim: true,
      default: "",
    },
    teamB: {
      type: String,
      trim: true,
      default: "",
    },
    winner: {
      type: String,
      trim: true,
      default: null,
    },
    parentMatchKey: {
      type: String,
      trim: true,
      default: null,
    },
    feedsSlot: {
      type: String,
      enum: ["teamA", "teamB", null],
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

matchSchema.index({ contest: 1, bracketKey: 1 }, { unique: true });
matchSchema.index({ contest: 1, stage: 1, order: 1 });

const entrySchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaBracketContest",
      required: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaParticipant",
      required: true,
    },
    predictions: {
      type: Map,
      of: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "knocked_out", "champion"],
      default: "active",
    },
    knockedOutRound: {
      type: String,
      enum: ["r16", "qf", "sf", "final", null],
      default: null,
    },
    bracketPoints: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

entrySchema.index({ contest: 1, participant: 1 }, { unique: true });
entrySchema.index({ campaign: 1, participant: 1 }, { unique: true });
entrySchema.index({ contest: 1, status: 1 });

const FifaBracketContest = mongoose.model("FifaBracketContest", contestSchema);
const FifaBracketMatch = mongoose.model("FifaBracketMatch", matchSchema);
const FifaBracketEntry = mongoose.model("FifaBracketEntry", entrySchema);

export { FifaBracketContest, FifaBracketMatch, FifaBracketEntry };
