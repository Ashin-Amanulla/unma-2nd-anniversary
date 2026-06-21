import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    jnvSchool: {
      type: String,
      required: [true, "JNV school is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    startingPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

participantSchema.index({ campaign: 1, email: 1 }, { unique: true });

const FifaParticipant = mongoose.model("FifaParticipant", participantSchema);

export default FifaParticipant;
