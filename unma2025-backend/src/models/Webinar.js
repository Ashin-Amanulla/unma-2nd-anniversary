import mongoose from "mongoose";

const webinarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    speaker: {
      type: String,
      trim: true,
      default: "",
    },
    speakerRole: {
      type: String,
      trim: true,
      default: "",
    },
    dateLabel: {
      type: String,
      trim: true,
      default: "",
    },
    posterUrl: {
      type: String,
      trim: true,
      default: null,
    },
    posterAlt: {
      type: String,
      trim: true,
      default: "",
    },
    recordingUrl: {
      type: String,
      trim: true,
      default: null,
    },
    registrationUrl: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

webinarSchema.index({ isPublished: 1, createdAt: -1 });
webinarSchema.index({ isFeatured: 1, isPublished: 1, createdAt: -1 });

const Webinar = mongoose.model("Webinar", webinarSchema);

export default Webinar;
