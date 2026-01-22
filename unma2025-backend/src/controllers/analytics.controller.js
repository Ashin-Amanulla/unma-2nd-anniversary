import Registration from "../models/Registration.js";
import { logger } from "../utils/logger.js";
import { getSchoolFilter } from "../utils/schoolFilter.js";
import Transaction from "../models/Transaction.js";
import moment from "moment-timezone";
import Admin from "../models/Admin.js";
import razorpayInstance from "../utils/razorpay.js";
import { getAccountBalance } from "./razorpayAPi.js";
import { fetchAndCacheAllPayments, paymentCache, isCacheValid } from "../routes/payment.js";

export const getAnalytics = async (req, res) => {
  try {
    // Get current admin from auth middleware
    const { admin } = req;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    // Build query with school filter + pending payment conditions
    const pendingPaymentQuery = {
      $and: [
        schoolFilter,
        {
          $or: [
            { paymentStatus: "pending" },
            { "formDataStructured.financial.paymentStatus": "pending" },
            {
              "formDataStructured.financial.paymentStatus":
                "financial-difficulty",
            },
            {
              "formDataStructured.financial.paymentStatus":
                "international-payment",
            },
            { paymentStatus: { $exists: false } },
            { paymentStatus: null },
            { paymentStatus: "" },
          ],
        },
      ],
    };

    // If schoolFilter is empty (super admin), simplify the query
    const finalPendingQuery =
      Object.keys(schoolFilter).length === 0
        ? pendingPaymentQuery.$and[1]
        : pendingPaymentQuery;

    // Get pending payments - people who will contribute but haven't paid yet
    const pendingPayments = await Registration.find(finalPendingQuery)
      .select(
        "name email contactNumber formDataStructured.personalInfo.district formDataStructured.financial.contributionAmount"
      )
      .limit(100);

    // Build query for accommodation needs
    const accommodationQuery = {
      $and: [
        schoolFilter,
        {
          $or: [
            // formDataStructured checks
            { "formDataStructured.accommodation.planAccommodation": true },
            {
              "formDataStructured.accommodation.accommodation": {
                $regex: /need|looking|required|hotel/i,
              },
            },
            {
              "formDataStructured.accommodation.accommodationNeeded.male": {
                $gt: 0,
              },
            },
            {
              "formDataStructured.accommodation.accommodationNeeded.female": {
                $gt: 0,
              },
            },
            {
              "formDataStructured.accommodation.accommodationNeeded.other": {
                $gt: 0,
              },
            },
            {
              "formDataStructured.accommodation.hotelRequirements.adults": {
                $gt: 0,
              },
            },
            {
              "formDataStructured.accommodation.accommodationCapacity": {
                $gt: 0,
              },
            },

            // Top-level field checks
            { accommodation: { $regex: /need|looking|required|hotel/i } },
            { accommodationCapacity: { $gt: 0 } },
            { planAccommodation: true },

            // Alumni form field checks
            {
              accommodation: { $in: ["need", "looking", "required", "hotel"] },
            },

            // Any indication of accommodation need
            { accommodationLocation: { $exists: true, $ne: "" } },
            { accommodationRemarks: { $exists: true, $ne: "" } },
          ],
        },
      ],
    };

    const finalAccommodationQuery =
      Object.keys(schoolFilter).length === 0
        ? accommodationQuery.$and[1]
        : accommodationQuery;

    // Get people needing accommodation - comprehensive check
    const needAccommodation = await Registration.find(finalAccommodationQuery)
      .select(
        "name email contactNumber formDataStructured.personalInfo.district district"
      )
      .limit(100);

    //razorpay balance
    //   let razorpayBalance = 0;
    // try {
    //    razorpayBalance = await getAccountBalance();
    // } catch (error) {
    //   console.log("error", error);
    // }
    // Build query for volunteers
    const volunteerQuery = {
      $and: [
        schoolFilter,
        {
          $or: [
            {
              "formDataStructured.eventAttendance.eventParticipation": {
                $in: ["volunteer", "Volunteer", "organizing", "Organizing"],
              },
            },
            {
              "formDataStructured.eventAttendance.eventParticipation":
                /volunteer/i,
            },
            {
              "formDataStructured.optional.mentorshipOptions": {
                $exists: true,
                $ne: [],
              },
            },
            {
              "formDataStructured.eventAttendance.eventParticipation":
                /mentor/i,
            },
          ],
        },
      ],
    };

    const finalVolunteerQuery =
      Object.keys(schoolFilter).length === 0
        ? volunteerQuery.$and[1]
        : volunteerQuery;

    // Get volunteers - people who want to volunteer
    const volunteers = await Registration.find(finalVolunteerQuery)
      .select(
        "name email contactNumber formDataStructured.personalInfo.yearOfPassing"
      )
      .limit(100);

    // Build query for ride share
    const rideShareQuery = {
      $and: [
        schoolFilter,
        {
          $or: [
            // formDataStructured checks
            { "formDataStructured.transportation.isTravelling": true },
            {
              "formDataStructured.transportation.connectWithNavodayans": {
                $regex: /yes/i,
              },
            },
            {
              "formDataStructured.transportation.readyForRideShare": {
                $regex: /yes/i,
              },
            },
            { "formDataStructured.transportation.vehicleCapacity": { $gt: 1 } },
            { "formDataStructured.transportation.groupSize": { $gt: 1 } },
            {
              "formDataStructured.transportation.modeOfTransport": {
                $regex: /car|carpool/i,
              },
            },

            // Top-level field checks
            {
              carPooling: {
                $in: ["Yes To Venue", "Yes From Venue", "Yes Both Ways"],
              },
            },
            { coShareSeats: { $gt: 1 } },
            { modeOfTravel: "Car" },
            { readyForRideShare: { $regex: /yes/i } },
            { rideShareCapacity: { $gt: 1 } },
            { wantRideShare: { $regex: /yes/i } },
            { rideShareGroupSize: { $gt: 1 } },

            // Any indication of ride sharing
            { modeOfTransport: { $regex: /car|carpool/i } },
            { travellingFrom: { $exists: true, $ne: "" } },
          ],
        },
      ],
    };

    const finalRideShareQuery =
      Object.keys(schoolFilter).length === 0
        ? rideShareQuery.$and[1]
        : rideShareQuery;

    // Get ride share - comprehensive check
    const rideShare = await Registration.find(finalRideShareQuery)
      .select(
        "name email contactNumber formDataStructured.personalInfo.district district"
      )
      .limit(100);

    // Build query for sponsors
    const sponsorQuery = {
      $and: [
        schoolFilter,
        {
          $or: [
            { "formDataStructured.sponsorship.interestedInSponsorship": true },
            { "formDataStructured.sponsorship.canReferSponsorship": true },
            {
              "formDataStructured.sponsorship.sponsorshipTier": {
                $exists: true,
                $ne: "",
              },
            },
            {
              "formDataStructured.sponsorship.sponsorshipDetails": {
                $exists: true,
                $ne: "",
              },
            },
            {
              "formDataStructured.financial.willContribute": true,
              "formDataStructured.financial.contributionAmount": { $gte: 5000 },
            },
          ],
        },
      ],
    };

    const finalSponsorQuery =
      Object.keys(schoolFilter).length === 0
        ? sponsorQuery.$and[1]
        : sponsorQuery;

    // Get sponsors - people interested in sponsorship
    const sponsors = await Registration.find(finalSponsorQuery)
      .select(
        "name email contactNumber formDataStructured.personalInfo.district"
      )
      .limit(100);

    // District-wise registrations
    const districtWise = await Registration.aggregate([
      {
        $match: {
          ...schoolFilter,
          "formDataStructured.personalInfo.district": {
            $exists: true,
            $ne: "",
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$formDataStructured.personalInfo.district",
          count: { $sum: 1 },
        },
      },
      { $project: { district: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const schoolWise = await Registration.aggregate([
      {
        $group: {
          _id: "$formDataStructured.personalInfo.school",
          count: { $sum: 1 },
          successfulRegistrations: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$formDataStructured.financial.paymentStatus",
                    "Completed",
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalAttendees: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$formDataStructured.eventAttendance.isAttending", true] },
                    { $eq: ["$formDataStructured.financial.paymentStatus", "Completed"] },
                  ],
                },
                {
                  $add: [
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.adults.veg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.adults.nonVeg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.teens.veg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.teens.nonVeg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.children.veg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.children.nonVeg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.toddlers.veg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.toddlers.nonVeg",
                        0,
                      ],
                    },
                  ],
                },
                0,
              ],
            },
          },
          toddlersCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$formDataStructured.eventAttendance.isAttending", true] },
                    { $eq: ["$formDataStructured.financial.paymentStatus", "Completed"] },
                  ],
                },
                {
                  $add: [
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.toddlers.veg",
                        0,
                      ],
                    },
                    {
                      $ifNull: [
                        "$formDataStructured.eventAttendance.attendees.toddlers.nonVeg",
                        0,
                      ],
                    },
                  ],
                },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          school: "$_id",
          count: 1,
          successfulRegistrations: 1,
          totalAttendees: 1,
          toddlersCount: 1,
          _id: 0,
        },
      },
      { $sort: { successfulRegistrations: -1 } },
    ]);


    // Registration type counts
    const registrationTypeCounts = await Registration.aggregate([
      {
        $match: schoolFilter,
      },
      {
        $group: {
          _id: "$registrationType",
          count: { $sum: 1 },
        },
      },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);

    // Format registration type counts for easier frontend consumption
    const registrationTypeCount = {
      alumni: 0,
      staff: 0,
      other: 0,
    };

    registrationTypeCounts.forEach((item) => {
      if (item.type === "Alumni") registrationTypeCount.alumni = item.count;
      if (item.type === "Staff") registrationTypeCount.staff = item.count;
      if (item.type === "Other") registrationTypeCount.other = item.count;
    });

    // Payment status counts - using our backend data structure
    const paymentStatusCounts = await Registration.aggregate([
      {
        $match: schoolFilter,
      },
      {
        $group: {
          _id: "$formDataStructured.financial.paymentStatus",
          count: { $sum: 1 },
        },
      },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]);

    const totalAmount = await Registration.aggregate([
      {
        $match: schoolFilter,
      },
      {
        $group: {
          _id: null,
          paymentStatus: {
            $first:
              "$formDataStructured.financial.paymentStatus" == "Completed",
          },
          totalAmount: {
            $sum: "$formDataStructured.financial.contributionAmount",
          },
        },
      },
    ]);

    // Format payment status counts for easier frontend consumption - only completed and financial difficulty
    const paymentStatusCount = {
      completed: 0,
      pending: 0, // This will represent financial difficulty cases
    };

    paymentStatusCounts.forEach((item) => {
      if (item.status === "Completed")
        paymentStatusCount.completed = item.count;
      if (item.status === "financial-difficulty") {
        paymentStatusCount.pending = item.count; // Using 'pending' field to store financial difficulty count
      }
    });

    // Format the response data to match frontend expectations
    const response = {
      pending_payment: pendingPayments.map((p) => ({
        _id: p._id,
        name: p.name,
        email: p.email,
        district:
          p.formDataStructured?.personalInfo?.district ||
          p.district ||
          "Not specified",
        phone: p.contactNumber,
        amountDue: p.formDataStructured?.financial?.contributionAmount || 0,
      })),
      need_accommodation: needAccommodation.map((a) => ({
        _id: a._id,
        name: a.name,
        email: a.email,
        district:
          a.formDataStructured?.personalInfo?.district ||
          a.district ||
          "Not specified",
        phone: a.contactNumber,
      })),
      volunteers: volunteers.map((v) => ({
        _id: v._id,
        name: v.name,
        email: v.email,
        batch:
          v.formDataStructured?.personalInfo?.yearOfPassing ||
          v.yearOfPassing ||
          "Not specified",
        phone: v.contactNumber,
      })),
      ride_share: rideShare.map((r) => ({
        _id: r._id,
        name: r.name,
        email: r.email,
        district:
          r.formDataStructured?.personalInfo?.district ||
          r.district ||
          "Not specified",
        phone: r.contactNumber,
      })),
      sponsors: sponsors.map((s) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        district:
          s.formDataStructured?.personalInfo?.district ||
          s.district ||
          "Not specified",
        phone: s.contactNumber,
      })),
      districtWise,
      schoolWise,
      registrationTypeCount,
      paymentStatusCount,
      totalAmount: totalAmount[0]?.totalAmount || 0,
    };

    logger.info(
      `Analytics data fetched successfully for admin: ${admin.email} (role: ${admin.role})`
    );
    res.status(200).json({
      status: "success",
      data: response,
    });
  } catch (error) {
    logger.error(`Error fetching analytics data: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Error fetching analytics data",
      error: error.message,
    });
  }
};

// Get detailed district-wise analytics
export const getDistrictAnalytics = async (req, res) => {
  try {
    const { admin } = req;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    const districtStats = await Registration.aggregate([
      {
        $match: {
          ...schoolFilter,
          "formDataStructured.personalInfo.district": {
            $exists: true,
            $ne: "",
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$formDataStructured.personalInfo.district",
          totalRegistrations: { $sum: 1 },
          alumniCount: {
            $sum: { $cond: [{ $eq: ["$registrationType", "Alumni"] }, 1, 0] },
          },
          staffCount: {
            $sum: { $cond: [{ $eq: ["$registrationType", "Staff"] }, 1, 0] },
          },
          attendingCount: {
            $sum: {
              $cond: ["$formDataStructured.eventAttendance.isAttending", 1, 0],
            },
          },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          district: "$_id",
          totalRegistrations: 1,
          alumniCount: 1,
          staffCount: 1,
          attendingCount: 1,
          paidCount: 1,
          _id: 0,
        },
      },
      { $sort: { totalRegistrations: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: districtStats,
    });
  } catch (error) {
    logger.error(`Error fetching district analytics: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Error fetching district analytics",
      error: error.message,
    });
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (req, res) => {
  try {
    const { admin } = req;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    const paymentStats = await Registration.aggregate([
      {
        $match: {
          ...schoolFilter,
          // Only include completed and financial difficulty payments
          "formDataStructured.financial.paymentStatus": {
            $in: ["Completed", "financial-difficulty"],
          },
        },
      },
      {
        $group: {
          _id: "$formDataStructured.financial.paymentStatus",
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $ifNull: ["$formDataStructured.financial.contributionAmount", 0],
            },
          },
          avgAmount: {
            $avg: {
              $ifNull: ["$formDataStructured.financial.contributionAmount", 0],
            },
          },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          totalAmount: 1,
          avgAmount: { $round: ["$avgAmount", 2] },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: paymentStats,
    });
  } catch (error) {
    logger.error(`Error fetching payment analytics: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Error fetching payment analytics",
      error: error.message,
    });
  }
};

// Get Razorpay payments by school
export const getRazorpayPaymentsBySchool = async (req, res) => {
  try {
    const { admin } = req;
    const { school } = req.query;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    // Get all registrations with emails for the specified school
    const query = { ...schoolFilter };
    if (school) {
      query["formDataStructured.personalInfo.school"] = school;
    }

    // Get all registrations for the school to match with Razorpay payments
    const registrations = await Registration.find(query)
      .select('email name formDataStructured.personalInfo.school')
      .lean();

    // Create a map of emails for quick lookup
    const emailMap = new Map();
    registrations.forEach(reg => {
      emailMap.set(reg.email.toLowerCase(), {
        name: reg.name,
        school: reg.formDataStructured?.personalInfo?.school || 'Unknown'
      });
    });

    // Fetch all payments from Razorpay (using cache if available)
    let allPayments;
    if (isCacheValid()) {
      allPayments = paymentCache.data;
    } else {
      allPayments = await fetchAndCacheAllPayments();
    }

    // Filter payments by matching emails from registrations
    const schoolPayments = allPayments.filter(payment => {
      // Check if payment has valid email and status is captured/authorized
      if (payment.email && (payment.status === 'captured' || payment.status === 'authorized')) {
        const lowerEmail = payment.email.toLowerCase();
        return emailMap.has(lowerEmail);
      }
      return false;
    });

    // Calculate total amount and organize by school
    const schoolStats = {};
    let totalAmount = 0;

    schoolPayments.forEach(payment => {
      const lowerEmail = payment.email.toLowerCase();
      const regInfo = emailMap.get(lowerEmail);
      const schoolName = regInfo?.school || 'Unknown School';
      const amountInRupees = payment.amount / 100; // Convert from paise to rupees

      totalAmount += amountInRupees;

      if (!schoolStats[schoolName]) {
        schoolStats[schoolName] = {
          school: schoolName,
          count: 0,
          totalAmount: 0,
          payments: []
        };
      }

      schoolStats[schoolName].count += 1;
      schoolStats[schoolName].totalAmount += amountInRupees;
      schoolStats[schoolName].payments.push({
        id: payment.id,
        email: payment.email,
        name: regInfo?.name || payment.notes?.name || 'Unknown',
        amount: amountInRupees,
        status: payment.status,
        paymentDate: new Date(payment.created_at * 1000).toISOString(),
        method: payment.method
      });
    });

    // Convert to array and sort by total amount
    const schoolStatsArray = Object.values(schoolStats).sort((a, b) =>
      b.totalAmount - a.totalAmount
    );

    res.status(200).json({
      status: "success",
      data: {
        totalAmount,
        totalPayments: schoolPayments.length,
        schoolStats: schoolStatsArray,
      }
    });
  } catch (error) {
    logger.error(`Error fetching Razorpay payments by school: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Error fetching Razorpay payments by school",
      error: error.message
    });
  }
};

//dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const { admin } = req;

    // Get today's start of day in IST timezone
    const todayStartIST = moment
      .tz("Asia/Kolkata")
      .startOf("day")
      .utc()
      .toDate();

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    const totalRegistrations = await Registration.countDocuments(schoolFilter);
    const totalAdmins = await Admin.countDocuments();

    // For super admin only - get all transactions, for school admin - filter by registrations
    let totalFundCollected = [{ total: 0 }];
    let todaysPayments = [{ total: 0 }];

    if (admin.role === "super_admin") {
      totalFundCollected = await Transaction.aggregate([
        { $match: {} },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      todaysPayments = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStartIST },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
    } else {
      // For school admin, get transactions only for their school registrations
      const schoolRegistrationIds = await Registration.find(
        schoolFilter
      ).distinct("_id");

      totalFundCollected = await Transaction.aggregate([
        {
          $match: {
            registrationId: {
              $in: schoolRegistrationIds.map((id) => id.toString()),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      todaysPayments = await Transaction.aggregate([
        {
          $match: {
            registrationId: {
              $in: schoolRegistrationIds.map((id) => id.toString()),
            },
            createdAt: { $gte: todayStartIST },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
    }

    const todaysRegistrations = await Registration.countDocuments({
      ...schoolFilter,
      registrationDate: { $gte: todayStartIST },
    });

    const successfulPayments = await Registration.countDocuments({
      ...schoolFilter,
      paymentStatus: "Completed",
    });

    const pendingPayments = await Registration.countDocuments({
      ...schoolFilter,
      paymentStatus: { $in: ["pending", "failed"] },
    });

    const totalAttendees = await Registration.aggregate([
      {
        $match: {
          ...schoolFilter,
          "formDataStructured.eventAttendance.isAttending": true,
          "paymentStatus": "Completed"
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: [
                "$formDataStructured.eventAttendance.attendees.adults.veg",
                "$formDataStructured.eventAttendance.attendees.adults.nonVeg",
                "$formDataStructured.eventAttendance.attendees.teens.veg",
                "$formDataStructured.eventAttendance.attendees.teens.nonVeg",
                "$formDataStructured.eventAttendance.attendees.children.veg",
                "$formDataStructured.eventAttendance.attendees.children.nonVeg",
                "$formDataStructured.eventAttendance.attendees.toddlers.veg",
                "$formDataStructured.eventAttendance.attendees.toddlers.nonVeg",
              ],
            },
          },
        },
      },
    ]);

    const stats = {
      totalRegistrations,
      totalAdmins: admin.role === "super_admin" ? totalAdmins : null, // Only show to super admin
      todaysRegistrations,
      totalAttendees: totalAttendees[0]?.total || 0,
      successfulPayments,
      pendingPayments,
      totalFundCollected: totalFundCollected[0]?.total || 0,
      todaysPayments: todaysPayments[0]?.total || 0,
    };

    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Error getting dashboard stats: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getRegistrationStats = async (req, res) => {
  try {
    const { admin } = req;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    // Get accurate total counts for registration stats
    const totalRegistrations = await Registration.countDocuments(schoolFilter);

    const completeRegistrations = await Registration.countDocuments({
      ...schoolFilter,
      paymentStatus: "Completed",
      formSubmissionComplete: true,
    });

    const paidRegistrations = await Registration.countDocuments({
      ...schoolFilter,
      paymentStatus: "Completed", // Note: capital C to match backend data
    });

    // Calculate total attendees across all registrations
    const totalAttendees = await Registration.aggregate([
      {
        $match: {
          ...schoolFilter,
          paymentStatus: "Completed",
          "formDataStructured.eventAttendance.isAttending": true,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $add: [
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.adults.veg",
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.adults.nonVeg",
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.teens.veg",
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.teens.nonVeg",
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.children.veg",
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.children.nonVeg",
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.toddlers.veg",
                    0,
                  ],
                },
                {
                  $ifNull: [
                    "$formDataStructured.eventAttendance.attendees.toddlers.nonVeg",
                    0,
                  ],
                },
              ],
            },
          },
        },
      },
    ]);

    const stats = {
      totalRegistrations,
      completeRegistrations,
      totalAttendees: totalAttendees[0]?.total || 0,
      paidRegistrations,
    };

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    logger.error(`Error getting registration stats: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getDailyRegistrations = async (req, res) => {
  try {
    const { admin } = req;
    const { days = 30 } = req.query;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    // Calculate the start date (30 days ago) in IST
    const startDate = moment
      .tz("Asia/Kolkata")
      .subtract(days, "days")
      .startOf("day")
      .utc()
      .toDate();
    const endDate = moment.tz("Asia/Kolkata").endOf("day").utc().toDate();

    // Aggregate registrations by day
    const dailyStats = await Registration.aggregate([
      {
        $match: {
          ...schoolFilter,
          registrationDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          // Convert UTC to IST for grouping
          registrationDateIST: {
            $dateAdd: {
              startDate: "$registrationDate",
              unit: "minute",
              amount: 330, // Add 5.5 hours to convert UTC to IST
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$registrationDateIST" },
            month: { $month: "$registrationDateIST" },
            day: { $dayOfMonth: "$registrationDateIST" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Create a complete array for all days (including days with 0 registrations)
    const dailyData = [];
    const currentDate = moment
      .tz("Asia/Kolkata")
      .subtract(days - 1, "days")
      .startOf("day");

    for (let i = 0; i < days; i++) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      const existing = dailyStats.find(
        (stat) =>
          stat._id.year === currentDate.year() &&
          stat._id.month === currentDate.month() + 1 &&
          stat._id.day === currentDate.date()
      );

      dailyData.push({
        date: dateStr,
        count: existing ? existing.count : 0,
        label: currentDate.format("MMM DD"),
      });

      currentDate.add(1, "day");
    }

    res.status(200).json({
      status: "success",
      data: {
        dailyRegistrations: dailyData,
        totalDays: days,
        totalRegistrations: dailyData.reduce((sum, day) => sum + day.count, 0),
      },
    });
  } catch (error) {
    logger.error(`Error getting daily registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const exportAllRegistrations = async (req, res) => {
  try {
    const { admin } = req;

    // Get school filter based on current admin
    const schoolFilter = getSchoolFilter(admin);

    // Get all registrations with school filter applied - include all fields
    const registrations = await Registration.find(schoolFilter)
      .sort({ registrationDate: -1 })
      .lean();

    // Format data for CSV export
    const exportData = registrations.map((registration) => {
      // Calculate total attendees
      const attendees =
        registration.formDataStructured?.eventAttendance?.attendees || {};
      const totalAttendees =
        (attendees.adults?.veg || 0) +
        (attendees.adults?.nonVeg || 0) +
        (attendees.teens?.veg || 0) +
        (attendees.teens?.nonVeg || 0) +
        (attendees.children?.veg || 0) +
        (attendees.children?.nonVeg || 0) +
        (attendees.toddlers?.veg || 0) +
        (attendees.toddlers?.nonVeg || 0);

      const toddlersCount =
        (attendees.toddlers?.veg || 0) + (attendees.toddlers?.nonVeg || 0);

      return {
        // Basic Information
        id: registration._id,
        serialNumber: registration.serialNumber || "",
        name: registration.name || "",
        email: registration.email || "",
        contactNumber: registration.contactNumber || "",
        whatsappNumber:
          registration.whatsappNumber ||
          registration.formDataStructured?.personalInfo?.whatsappNumber ||
          "",
        registrationType: registration.registrationType || "",

        // Personal Information
        school: registration.formDataStructured?.personalInfo?.school || "",
        customSchoolName:
          registration.formDataStructured?.personalInfo?.customSchoolName || "",
        yearOfPassing:
          registration.formDataStructured?.personalInfo?.yearOfPassing || "",
        district: registration.formDataStructured?.personalInfo?.district || "",
        stateUT: registration.formDataStructured?.personalInfo?.stateUT || "",
        country: registration.formDataStructured?.personalInfo?.country || "",
        bloodGroup:
          registration.formDataStructured?.personalInfo?.bloodGroup || "",

        // Staff Specific Fields (root level)
        schoolsWorked: registration.schoolsWorked || "",
        yearsOfWorking: registration.yearsOfWorking || "",
        currentPosition: registration.currentPosition || "",

        // Other Specific Fields
        purpose: registration.purpose || "",

        // Financial Information
        paymentStatus:
          registration.formDataStructured?.financial?.paymentStatus ||
          registration.paymentStatus ||
          "",
        contributionAmount:
          registration.formDataStructured?.financial?.contributionAmount || 0,
        proposedAmount:
          registration.formDataStructured?.financial?.proposedAmount || 0,
        willContribute: registration.formDataStructured?.financial
          ?.willContribute
          ? "Yes"
          : "No",
        paymentId: registration.formDataStructured?.financial?.paymentId || "",
        paymentRemarks:
          registration.formDataStructured?.financial?.paymentRemarks || "",

        // Form Status
        formComplete: registration.formSubmissionComplete ? "Yes" : "No",
        currentStep: registration.currentStep || 1,

        // Event Attendance
        isAttending: registration.formDataStructured?.eventAttendance
          ?.isAttending
          ? "Yes"
          : "No",
        totalAttendees: totalAttendees,
        toddlersCount: toddlersCount,
        adultsVeg: attendees.adults?.veg || 0,
        adultsNonVeg: attendees.adults?.nonVeg || 0,
        teensVeg: attendees.teens?.veg || 0,
        teensNonVeg: attendees.teens?.nonVeg || 0,
        childrenVeg: attendees.children?.veg || 0,
        childrenNonVeg: attendees.children?.nonVeg || 0,
        toddlersVeg: attendees.toddlers?.veg || 0,
        toddlersNonVeg: attendees.toddlers?.nonVeg || 0,

        // Event Participation
        eventParticipation: Array.isArray(
          registration.formDataStructured?.eventAttendance?.eventParticipation
        )
          ? registration.formDataStructured.eventAttendance.eventParticipation.join(
            "; "
          )
          : registration.formDataStructured?.eventAttendance
            ?.eventParticipation || "",
        participationDetails:
          registration.formDataStructured?.eventAttendance
            ?.participationDetails || "",

        // Professional Information
        profession: Array.isArray(
          registration.formDataStructured?.professional?.profession
        )
          ? registration.formDataStructured.professional.profession.join("; ")
          : registration.formDataStructured?.professional?.profession || "",
        professionalDetails:
          registration.formDataStructured?.professional?.professionalDetails ||
          "",
        areaOfExpertise:
          registration.formDataStructured?.professional?.areaOfExpertise || "",
        keySkills:
          registration.formDataStructured?.professional?.keySkills || "",
        yearsOfWorking:
          registration.formDataStructured?.professional?.yearsOfWorking ||
          registration.yearsOfWorking ||
          "",
        currentPosition:
          registration.formDataStructured?.professional?.currentPosition ||
          registration.currentPosition ||
          "",
        otherPosition:
          registration.formDataStructured?.professional?.otherPosition || "",
        schoolsWorked:
          registration.formDataStructured?.professional?.schoolsWorked ||
          registration.schoolsWorked ||
          "",
        subject:
          registration.formDataStructured?.professional?.subject || "",
        additionalDetails:
          registration.formDataStructured?.professional?.additionalDetails ||
          "",

        // Accommodation
        planAccommodation: registration.formDataStructured?.accommodation
          ?.planAccommodation
          ? "Yes"
          : "No",
        accommodation:
          registration.formDataStructured?.accommodation?.accommodation || "",
        accommodationCapacity:
          registration.formDataStructured?.accommodation
            ?.accommodationCapacity || 0,
        accommodationLocation:
          registration.formDataStructured?.accommodation
            ?.accommodationLocation || "",
        accommodationRemarks:
          registration.formDataStructured?.accommodation
            ?.accommodationRemarks || "",
        accommodationNeededMale:
          registration.formDataStructured?.accommodation?.accommodationNeeded
            ?.male || 0,
        accommodationNeededFemale:
          registration.formDataStructured?.accommodation?.accommodationNeeded
            ?.female || 0,
        accommodationNeededOther:
          registration.formDataStructured?.accommodation?.accommodationNeeded
            ?.other || 0,
        accommodationGender:
          registration.formDataStructured?.accommodation?.accommodationGender ||
          "",
        // Accommodation Pincode Fields
        accommodationPincode:
          registration.formDataStructured?.accommodation?.accommodationPincode ||
          "",
        accommodationDistrict:
          registration.formDataStructured?.accommodation
            ?.accommodationDistrict || "",
        accommodationState:
          registration.formDataStructured?.accommodation?.accommodationState ||
          "",
        accommodationTaluk:
          registration.formDataStructured?.accommodation?.accommodationTaluk ||
          "",
        accommodationLandmark:
          registration.formDataStructured?.accommodation
            ?.accommodationLandmark || "",
        accommodationSubPostOffice:
          registration.formDataStructured?.accommodation
            ?.accommodationSubPostOffice || "",
        accommodationArea:
          registration.formDataStructured?.accommodation?.accommodationArea ||
          "",

        // Hotel Requirements
        hotelAdults:
          registration.formDataStructured?.accommodation?.hotelRequirements
            ?.adults || 0,
        hotelChildrenAbove11:
          registration.formDataStructured?.accommodation?.hotelRequirements
            ?.childrenAbove11 || 0,
        hotelChildren5to11:
          registration.formDataStructured?.accommodation?.hotelRequirements
            ?.children5to11 || 0,
        hotelCheckInDate:
          registration.formDataStructured?.accommodation?.hotelRequirements
            ?.checkInDate || "",
        hotelCheckOutDate:
          registration.formDataStructured?.accommodation?.hotelRequirements
            ?.checkOutDate || "",
        hotelRoomPreference:
          registration.formDataStructured?.accommodation?.hotelRequirements
            ?.roomPreference || "",
        hotelSpecialRequests:
          registration.formDataStructured?.accommodation?.hotelRequirements
            ?.specialRequests || "",

        // Transportation
        isTravelling: registration.formDataStructured?.transportation
          ?.isTravelling
          ? "Yes"
          : "No",
        startingLocation:
          registration.formDataStructured?.transportation?.startingLocation ||
          "",
        travelDate:
          registration.formDataStructured?.transportation?.travelDate || "",
        travelTime:
          registration.formDataStructured?.transportation?.travelTime || "",
        modeOfTransport:
          registration.formDataStructured?.transportation?.modeOfTransport ||
          "",
        needParking:
          registration.formDataStructured?.transportation?.needParking || "",
        connectWithNavodayans:
          registration.formDataStructured?.transportation
            ?.connectWithNavodayans || "",
        readyForRideShare:
          registration.formDataStructured?.transportation?.readyForRideShare ||
          "",
        vehicleCapacity:
          registration.formDataStructured?.transportation?.vehicleCapacity || 0,
        groupSize:
          registration.formDataStructured?.transportation?.groupSize || 0,
        travelSpecialRequirements:
          registration.formDataStructured?.transportation
            ?.travelSpecialRequirements || "",
        // Transportation First Segment Fields
        travelConsistsTwoSegments:
          registration.formDataStructured?.transportation
            ?.travelConsistsTwoSegments || "",
        connectWithNavodayansFirstSegment:
          registration.formDataStructured?.transportation
            ?.connectWithNavodayansFirstSegment || "",
        firstSegmentStartingLocation:
          registration.formDataStructured?.transportation
            ?.firstSegmentStartingLocation || "",
        firstSegmentTravelDate:
          registration.formDataStructured?.transportation
            ?.firstSegmentTravelDate || "",
        // Transportation Pincode Fields
        startPincode:
          registration.formDataStructured?.transportation?.startPincode || "",
        pinDistrict:
          registration.formDataStructured?.transportation?.pinDistrict || "",
        pinState:
          registration.formDataStructured?.transportation?.pinState || "",
        pinTaluk:
          registration.formDataStructured?.transportation?.pinTaluk || "",
        subPostOffice:
          registration.formDataStructured?.transportation?.subPostOffice || "",
        originArea:
          registration.formDataStructured?.transportation?.originArea || "",
        nearestLandmark:
          registration.formDataStructured?.transportation?.nearestLandmark || "",

        // Sponsorship
        interestedInSponsorship: registration.formDataStructured?.sponsorship
          ?.interestedInSponsorship
          ? "Yes"
          : "No",
        canReferSponsorship: registration.formDataStructured?.sponsorship
          ?.canReferSponsorship
          ? "Yes"
          : "No",
        sponsorshipTier:
          registration.formDataStructured?.sponsorship?.sponsorshipTier || "",
        sponsorshipDetails:
          registration.formDataStructured?.sponsorship?.sponsorshipDetails ||
          "",

        // Optional Information
        spouseNavodayan:
          registration.formDataStructured?.optional?.spouseNavodayan || "",
        unmaFamilyGroups:
          registration.formDataStructured?.optional?.unmaFamilyGroups || "",
        mentorshipOptions: Array.isArray(
          registration.formDataStructured?.optional?.mentorshipOptions
        )
          ? registration.formDataStructured.optional.mentorshipOptions.join(
            "; "
          )
          : registration.formDataStructured?.optional?.mentorshipOptions || "",
        trainingOptions: Array.isArray(
          registration.formDataStructured?.optional?.trainingOptions
        )
          ? registration.formDataStructured.optional.trainingOptions.join("; ")
          : registration.formDataStructured?.optional?.trainingOptions || "",
        seminarOptions: Array.isArray(
          registration.formDataStructured?.optional?.seminarOptions
        )
          ? registration.formDataStructured.optional.seminarOptions.join("; ")
          : registration.formDataStructured?.optional?.seminarOptions || "",
        tshirtInterest:
          registration.formDataStructured?.optional?.tshirtInterest || "",

        // Entry Tracking
        markedEntered: registration.markedEntered ? "Yes" : "No",
        enteredAt: registration.enteredAt
          ? new Date(registration.enteredAt).toISOString().split("T")[0]
          : "",
        enteredBy: registration.enteredBy || "",

        // Metadata
        registrationDate: registration.registrationDate
          ? new Date(registration.registrationDate).toISOString().split("T")[0]
          : "",
        lastUpdated: registration.lastUpdated
          ? new Date(registration.lastUpdated).toISOString().split("T")[0]
          : "",
        emailVerified: registration.emailVerified ? "Yes" : "No",
        lastUpdatedBy: registration.lastUpdatedBy || "",
      };
    });

    logger.info(
      `All registrations export requested by admin: ${admin.email} (role: ${admin.role}). Exported ${exportData.length} records.`
    );

    res.status(200).json({
      status: "success",
      data: exportData,
      totalRecords: exportData.length,
      exportedBy: admin.email,
      exportedAt: new Date().toISOString(),
      adminRole: admin.role,
    });
  } catch (error) {
    logger.error(`Error exporting all registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Error exporting registrations data",
      error: error.message,
    });
  }
};
