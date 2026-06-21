import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FifaCampaign",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Slot title is required"],
      trim: true,
    },
    slotDate: {
      type: Date,
    },
    closesAt: {
      type: Date,
      required: [true, "Closing time is required"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
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

slotSchema.index({ campaign: 1, order: 1 });

const FifaSlot = mongoose.model("FifaSlot", slotSchema);

export default FifaSlot;
