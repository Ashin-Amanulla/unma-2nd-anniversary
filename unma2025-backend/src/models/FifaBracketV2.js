import mongoose from "mongoose";

/**
 * QF→Final bracket with score predictions (v2).
 * Stored in separate collections so legacy R16 bracket data is untouched.
 */
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
      enum: ["qf", "sf", "final", null],
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
      ref: "FifaBracketV2Contest",
      required: true,
    },
    stage: {
      type: String,
      enum: ["qf", "sf", "final"],
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
    scoreA: {
      type: Number,
      default: null,
    },
    scoreB: {
      type: Number,
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
      ref: "FifaBracketV2Contest",
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
    scores: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => new Map(),
    },
    status: {
      type: String,
      enum: ["active", "knocked_out", "champion"],
      default: "active",
    },
    knockedOutRound: {
      type: String,
      enum: ["qf", "sf", "final", null],
      default: null,
    },
    scoreAccuracyPoints: {
      type: Number,
      default: 0,
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

const FifaBracketV2Contest = mongoose.model(
  "FifaBracketV2Contest",
  contestSchema,
  "fifabracket_v2_contests"
);
const FifaBracketV2Match = mongoose.model(
  "FifaBracketV2Match",
  matchSchema,
  "fifabracket_v2_matches"
);
const FifaBracketV2Entry = mongoose.model(
  "FifaBracketV2Entry",
  entrySchema,
  "fifabracket_v2_entries"
);

export { FifaBracketV2Contest, FifaBracketV2Match, FifaBracketV2Entry };
