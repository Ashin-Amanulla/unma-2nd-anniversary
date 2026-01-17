import Registration from "../models/Registration.js";
import { logger } from "../utils/logger.js";

/**
 * Get registration details for entry page
 */
export const getRegistrationForEntry = async (req, res) => {
  try {
    const { registrationId } = req.params;
    console.log(registrationId);

    const registration = await Registration.findOne({serialNumber: registrationId});

    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Extract relevant data for entry page
    const entryData = {
      _id: registration._id,
      serialNumber: registration.serialNumber,
      name: registration.name || registration.formDataStructured?.personalInfo?.name,
      email: registration.email || registration.formDataStructured?.personalInfo?.email,
      contactNumber: registration.contactNumber || registration.formDataStructured?.personalInfo?.contactNumber,
      school: registration.formDataStructured?.personalInfo?.school || registration.formDataStructured?.personalInfo?.customSchoolName,
      yearOfPassing: registration.formDataStructured?.personalInfo?.yearOfPassing,
      registrationType: registration.registrationType,
      paymentStatus: registration.paymentStatus || registration.formDataStructured?.financial?.paymentStatus,
      isAttending: registration.formDataStructured?.eventAttendance?.isAttending,
      attendees: registration.formDataStructured?.eventAttendance?.attendees || {
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
      },
      markedEntered: registration.markedEntered,
      enteredAt: registration.enteredAt,
      enteredBy: registration.enteredBy,
      registrationDate: registration.registrationDate,
    };

    return res.status(200).json({
      status: "success",
      data: entryData,
    });
  } catch (error) {
    logger.error("Error fetching registration for entry:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch registration details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update attendee count for registration
 */
export const updateAttendeeCount = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { attendees } = req.body;
    const adminId = req.user?.id;

    if (!attendees) {
      return res.status(400).json({
        status: "error",
        message: "Attendees data is required",
      });
    }

    // Validate attendees structure
    const requiredGroups = ['adults', 'teens', 'children', 'toddlers'];
    for (const group of requiredGroups) {
      if (!attendees[group] || typeof attendees[group] !== 'object') {
        return res.status(400).json({
          status: "error",
          message: `Invalid attendees data: ${group} is required`,
        });
      }

      if (typeof attendees[group].veg !== 'number' || typeof attendees[group].nonVeg !== 'number') {
        return res.status(400).json({
          status: "error",
          message: `Invalid attendees data: ${group} must have veg and nonVeg counts`,
        });
      }

      if (attendees[group].veg < 0 || attendees[group].nonVeg < 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid attendees data: ${group} counts cannot be negative`,
        });
      }
    }

    const registration = await Registration.findOne({serialNumber: registrationId});

    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Update attendees count
    await Registration.findOneAndUpdate({serialNumber: registrationId}, {
      $set: {
        "formDataStructured.eventAttendance.attendees": attendees,
        lastUpdated: new Date(),
        lastUpdatedBy: adminId || 'registration-desk',
      },
    });

    logger.info(`Attendee count updated for registration ${registrationId} by ${adminId}`);

    return res.status(200).json({
      status: "success",
      message: "Attendee count updated successfully",
      data: { attendees },
    });
  } catch (error) {
    logger.error("Error updating attendee count:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update attendee count",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Mark registration as entered
 */
export const markAsEntered = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const adminId = req.user?.id;

    const registration = await Registration.findOne({serialNumber: registrationId});

    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    if (registration.markedEntered) {
      return res.status(400).json({
        status: "error",
        message: "Registration already marked as entered",
        data: {
          enteredAt: registration.enteredAt,
          enteredBy: registration.enteredBy,
        },
      });
    }

    // Mark as entered
    await Registration.findOneAndUpdate({serialNumber: registrationId}, {
      $set: {
        markedEntered: true,
        enteredAt: new Date(),
        enteredBy: adminId || 'registration-desk',
        lastUpdated: new Date(),
        lastUpdatedBy: adminId || 'registration-desk',
      },
    });

    logger.info(`Registration ${registrationId} marked as entered by ${adminId}`);

    return res.status(200).json({
      status: "success",
      message: "Registration marked as entered successfully",
      data: {
        markedEntered: true,
        enteredAt: new Date(),
        enteredBy: adminId || 'registration-desk',
      },
    });
  } catch (error) {
    logger.error("Error marking registration as entered:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to mark registration as entered",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get registration desk statistics
 */
export const getRegistrationDeskStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total paid and attending registrations
      Registration.countDocuments({
        $and: [
          {
            $or: [
              { paymentStatus: "Completed" },
              { "formDataStructured.financial.paymentStatus": "Completed" },
            ],
          },
          { "formDataStructured.eventAttendance.isAttending": true },
        ],
      }),

      // Total entered registrations
      Registration.countDocuments({ markedEntered: true }),

      // Total entries today
      Registration.countDocuments({
        markedEntered: true,
        enteredAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),

      // Total attendees count for entered registrations
      Registration.aggregate([
        { $match: { markedEntered: true } },
        {
          $project: {
            totalAttendees: {
              $add: [
                { $add: ["$formDataStructured.eventAttendance.attendees.adults.veg", "$formDataStructured.eventAttendance.attendees.adults.nonVeg"] },
                { $add: ["$formDataStructured.eventAttendance.attendees.teens.veg", "$formDataStructured.eventAttendance.attendees.teens.nonVeg"] },
                { $add: ["$formDataStructured.eventAttendance.attendees.children.veg", "$formDataStructured.eventAttendance.attendees.children.nonVeg"] },
                { $add: ["$formDataStructured.eventAttendance.attendees.toddlers.veg", "$formDataStructured.eventAttendance.attendees.toddlers.nonVeg"] },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAttendees: { $sum: "$totalAttendees" },
          },
        },
      ]),
    ]);

    const registrationDeskStats = {
      totalEligibleRegistrations: stats[0],
      totalEnteredRegistrations: stats[1],
      todayEntries: stats[2],
      totalAttendeesEntered: stats[3]?.[0]?.totalAttendees || 0,
      pendingEntries: stats[0] - stats[1],
      entryPercentage: stats[0] > 0 ? ((stats[1] / stats[0]) * 100).toFixed(1) : 0,
      lastUpdated: new Date().toISOString(),
    };

    return res.status(200).json({
      status: "success",
      data: registrationDeskStats,
    });
  } catch (error) {
    logger.error("Error fetching registration desk stats:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch registration desk statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};