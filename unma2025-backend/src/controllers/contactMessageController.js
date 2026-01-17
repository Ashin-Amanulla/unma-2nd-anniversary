import ContactMessage from "../models/contactMessage.js";
import { validateObjectId } from "../utils/validation.js";
import {
  sendContactConfirmationEmail,
  sendContactResponseEmail,
} from "../templates/email/all-templates.js";

// Send a new contact message
export const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, category, priority } =
      req.body;

    // Get additional metadata
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
      category: category || "general-inquiry",
      priority: priority || "medium",
      source: "website-contact-form",
      ipAddress,
      userAgent,
    });

    // Send confirmation email to the user
    try {
      await sendContactConfirmationEmail(contactMessage);
    } catch (emailError) {
      console.error(
        "Failed to send contact confirmation email:",
        emailError.message
      );
      // Continue with the response even if email fails
    }

    res.status(201).json({
      success: true,
      data: contactMessage,
      message:
        "Your message has been sent successfully. We'll get back to you soon!",
    });
  } catch (error) {
    console.error("Error sending contact message:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all contact messages (with filters and pagination) - Admin only
export const getMessages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Search across multiple fields
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const messages = await ContactMessage.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single contact message - Admin only
export const getMessage = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid message ID",
      });
    }

    const message = await ContactMessage.findById(req.params.id).populate(
      "responseData.respondedBy",
      "name email"
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error fetching contact message:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update message status - Admin only
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid message ID",
      });
    }

    const validStatuses = [
      "new",
      "read",
      "in-progress",
      "responded",
      "resolved",
      "spam",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
      message: `Message status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Respond to a contact message - Admin only
export const respondToMessage = async (req, res) => {
  try {
    const { responseMessage, responseMethod = "email" } = req.body;

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid message ID",
      });
    }

    if (!responseMessage || !responseMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: "Response message is required",
      });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Update message with response data
    message.responseData = {
      respondedBy: req.user._id,
      responseDate: new Date(),
      responseMessage: responseMessage.trim(),
      responseMethod,
    };
    message.status = "responded";

    await message.save();

    // Send response email to the user
    try {
      await sendContactResponseEmail(message, responseMessage.trim());
    } catch (emailError) {
      console.error("Failed to send response email:", emailError.message);
      // Log error but don't fail the response
    }

    // Populate the respondedBy field for the response
    await message.populate("responseData.respondedBy", "name email");

    res.status(200).json({
      success: true,
      data: message,
      message: "Response sent successfully",
    });
  } catch (error) {
    console.error("Error responding to message:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Add admin note to message - Admin only
export const addNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid message ID",
      });
    }

    if (!note || !note.trim()) {
      return res.status(400).json({
        success: false,
        error: "Note is required",
      });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    await message.addAdminNote(note.trim(), req.user._id);

    // Populate admin notes for response
    await message.populate("adminNotes.addedBy", "name email");

    res.status(200).json({
      success: true,
      data: message,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get message statistics - Admin only
export const getMessageStats = async (req, res) => {
  try {
    const stats = await ContactMessage.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ["$status", "read"] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          responded: {
            $sum: { $cond: [{ $eq: ["$status", "responded"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          spam: { $sum: { $cond: [{ $eq: ["$status", "spam"] }, 1, 0] } },
        },
      },
    ]);

    const categoryStats = await ContactMessage.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const priorityStats = await ContactMessage.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          total: 0,
          new: 0,
          read: 0,
          inProgress: 0,
          responded: 0,
          resolved: 0,
          spam: 0,
        },
        byCategory: categoryStats,
        byPriority: priorityStats,
      },
    });
  } catch (error) {
    console.error("Error fetching message stats:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get unread messages count - Admin only
export const getUnreadCount = async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({ status: "new" });

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Bulk update message status - Admin only
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { messageIds, status } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message IDs array is required",
      });
    }

    const validStatuses = [
      "new",
      "read",
      "in-progress",
      "responded",
      "resolved",
      "spam",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Validate all IDs
    for (const id of messageIds) {
      if (!validateObjectId(id)) {
        return res.status(400).json({
          success: false,
          error: `Invalid message ID: ${id}`,
        });
      }
    }

    const result = await ContactMessage.updateMany(
      { _id: { $in: messageIds } },
      { $set: { status } }
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      message: `${result.modifiedCount} messages updated to ${status}`,
    });
  } catch (error) {
    console.error("Error bulk updating messages:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
