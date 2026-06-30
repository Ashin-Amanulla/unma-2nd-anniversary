import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
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
    // Snapshot of sender identity at send time so renaming/removing a
    // participant doesn't rewrite chat history.
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    jnvSchool: {
      type: String,
      trim: true,
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: 500,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ campaign: 1, createdAt: 1 });

const FifaChatMessage = mongoose.model("FifaChatMessage", chatMessageSchema);

export default FifaChatMessage;
