import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    graded: {
      type: Boolean,
      default: false,
    },
    gradedManually: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const predictionSchema = new mongoose.Schema(
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
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaMatch",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaParticipant",
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    scored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

predictionSchema.index({ match: 1, participant: 1 }, { unique: true });
predictionSchema.index({ campaign: 1, participant: 1 });

const FifaPrediction = mongoose.model("FifaPrediction", predictionSchema);

export default FifaPrediction;
