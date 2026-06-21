import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

campaignSchema.statics.resolveActiveCampaign = async function resolveActiveCampaign() {
  return (
    (await this.findOne({ status: "active" }).sort({ createdAt: -1 })) ||
    (await this.findOne().sort({ createdAt: -1 }))
  );
};

const FifaCampaign = mongoose.model("FifaCampaign", campaignSchema);

export default FifaCampaign;
