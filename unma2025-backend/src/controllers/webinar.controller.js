import mongoose from "mongoose";
import Webinar from "../models/Webinar.js";

// Public: published webinars
const getWebinars = async (req, res) => {
  try {
    const filter = { isPublished: true };

    const webinars = await Webinar.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: webinars,
    });
  } catch (error) {
    console.error("Error fetching webinars:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinars",
      error: error.message,
    });
  }
};

// Public: banner / popup webinar — featured published first (newest), else newest published
const getRecentWebinar = async (req, res) => {
  try {
    const featured = await Webinar.findOne({ isPublished: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .lean();

    if (featured) {
      return res.json({
        success: true,
        data: featured,
      });
    }

    const latest = await Webinar.findOne({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: latest || null,
    });
  } catch (error) {
    console.error("Error fetching recent webinar:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent webinar",
      error: error.message,
    });
  }
};

// Public single: published only
const getWebinar = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    const webinar = await Webinar.findOne({
      _id: req.params.id,
      isPublished: true,
    }).lean();

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    res.json({
      success: true,
      data: webinar,
    });
  } catch (error) {
    console.error("Error fetching webinar:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinar",
      error: error.message,
    });
  }
};

const getAllWebinarsAdmin = async (req, res) => {
  try {
    const webinars = await Webinar.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: webinars,
    });
  } catch (error) {
    console.error("Error fetching webinars (admin):", error);
    res.status(500).json({
      success: false,
      message: "Error fetching webinars",
      error: error.message,
    });
  }
};

const createWebinar = async (req, res) => {
  try {
    const {
      title,
      speaker,
      speakerRole,
      dateLabel,
      posterUrl,
      posterAlt,
      recordingUrl,
      registrationUrl,
      description,
      isPublished,
      isFeatured,
      order,
    } = req.body;

    const webinar = new Webinar({
      title,
      speaker: speaker || "",
      speakerRole: speakerRole || "",
      dateLabel: dateLabel || "",
      posterUrl: posterUrl || null,
      posterAlt: posterAlt || "",
      recordingUrl: recordingUrl || null,
      registrationUrl: registrationUrl || null,
      description: description || "",
      isPublished: Boolean(isPublished),
      isFeatured: Boolean(isFeatured),
      order: order !== undefined ? Number(order) : 0,
    });

    await webinar.save();

    res.status(201).json({
      success: true,
      message: "Webinar created successfully",
      data: webinar,
    });
  } catch (error) {
    console.error("Error creating webinar:", error);
    res.status(500).json({
      success: false,
      message: "Error creating webinar",
      error: error.message,
    });
  }
};

const updateWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    res.json({
      success: true,
      message: "Webinar updated successfully",
      data: webinar,
    });
  } catch (error) {
    console.error("Error updating webinar:", error);
    res.status(500).json({
      success: false,
      message: "Error updating webinar",
      error: error.message,
    });
  }
};

const deleteWebinar = async (req, res) => {
  try {
    const webinar = await Webinar.findByIdAndDelete(req.params.id);

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    res.json({
      success: true,
      message: "Webinar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting webinar:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting webinar",
      error: error.message,
    });
  }
};

const togglePublish = async (req, res) => {
  try {
    const webinar = await Webinar.findById(req.params.id);

    if (!webinar) {
      return res.status(404).json({
        success: false,
        message: "Webinar not found",
      });
    }

    webinar.isPublished = !webinar.isPublished;
    await webinar.save();

    res.json({
      success: true,
      message: `Webinar ${webinar.isPublished ? "published" : "unpublished"} successfully`,
      data: webinar,
    });
  } catch (error) {
    console.error("Error toggling webinar publish:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling publish status",
      error: error.message,
    });
  }
};

export {
  getWebinars,
  getRecentWebinar,
  getWebinar,
  getAllWebinarsAdmin,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  togglePublish,
};
