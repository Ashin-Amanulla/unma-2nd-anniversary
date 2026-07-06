import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      trim: true,
      maxlength: 512,
    },
    visitorId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    ipHash: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
      maxlength: 512,
    },
  },
  {
    timestamps: true,
  }
);

pageViewSchema.index({ path: 1, createdAt: -1 });
pageViewSchema.index({ path: 1, visitorId: 1 });
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

const PageView = mongoose.model("PageView", pageViewSchema);

export default PageView;
