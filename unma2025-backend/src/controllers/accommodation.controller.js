import Registration from "../models/Registration.js";
import { logger } from "../utils/logger.js";

/**
 * Get accommodation overview statistics
 */
export const getAccommodationStats = async (req, res) => {
  try {
    const { school } = req.query;

    // Use req.user since that's what the middleware sets
    const user = req.user || req.admin;

    // Build match query based on user permissions
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.accommodation.planAccommodation": true,
    };

    // Apply school filter if provided

    const stats = await Registration.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$formDataStructured.accommodation.accommodation",
          count: { $sum: 1 },
          totalCapacity: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$formDataStructured.accommodation.accommodation",
                    "provide",
                  ],
                },
                "$formDataStructured.accommodation.accommodationCapacity",
                0,
              ],
            },
          },
          totalNeeded: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$formDataStructured.accommodation.accommodation",
                    "need",
                  ],
                },
                {
                  $add: [
                    "$formDataStructured.accommodation.accommodationNeeded.male",
                    "$formDataStructured.accommodation.accommodationNeeded.female",
                    "$formDataStructured.accommodation.accommodationNeeded.other",
                  ],
                },
                0,
              ],
            },
          },
        },
      },
    ]);

    // Process stats
    const processedStats = {
      providers: stats.find((s) => s._id === "provide") || {
        count: 0,
        totalCapacity: 0,
      },
      seekers: stats.find((s) => s._id === "need") || {
        count: 0,
        totalNeeded: 0,
      },
      hotelRequests: stats.find((s) => s._id === "discount-hotel") || {
        count: 0,
      },
      notRequired: stats.find((s) => s._id === "not-required") || { count: 0 },
    };

    res.status(200).json({
      status: "success",
      data: processedStats,
    });
  } catch (error) {
    logger.error("Error fetching accommodation stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch accommodation statistics",
    });
  }
};

/**
 * Get accommodation providers
 */
export const getAccommodationProviders = async (req, res) => {
  try {
    const {
      search,
      gender,
      district,
      school,
      page = 1,
      limit = 20,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;
    const user = req.user || req.admin;

    // Build match query
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.accommodation.planAccommodation": true,
      "formDataStructured.accommodation.accommodation": "provide",
    };

    if (gender && gender !== "all") {
      matchQuery["formDataStructured.accommodation.accommodationGender"] =
        gender;
    }

    if (district && district !== "all") {
      matchQuery["formDataStructured.accommodation.accommodationDistrict"] =
        district;
    }

    // Build aggregation pipeline
    const pipeline = [{ $match: matchQuery }];

    // Add search if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "formDataStructured.personalInfo.name": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.personalInfo.email": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.personalInfo.school": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.accommodation.accommodationLocation": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.accommodation.accommodationDistrict": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    // Add projection to format response
    pipeline.push({
      $project: {
        _id: 1,
        registrationDate: 1,
        name: "$formDataStructured.personalInfo.name",
        email: "$formDataStructured.personalInfo.email",
        contactNumber: "$formDataStructured.personalInfo.contactNumber",
        whatsappNumber: "$formDataStructured.personalInfo.whatsappNumber",
        school: "$formDataStructured.personalInfo.school",
        yearOfPassing: "$formDataStructured.personalInfo.yearOfPassing",
        district: "$formDataStructured.personalInfo.district",
        stateUT: "$formDataStructured.personalInfo.stateUT",
        country: "$formDataStructured.personalInfo.country",
        capacity: "$formDataStructured.accommodation.accommodationCapacity",
        gender: "$formDataStructured.accommodation.accommodationGender",
        location: "$formDataStructured.accommodation.accommodationLocation",
        pincode: "$formDataStructured.accommodation.accommodationPincode",
        accommodationDistrict:
          "$formDataStructured.accommodation.accommodationDistrict",
        accommodationState:
          "$formDataStructured.accommodation.accommodationState",
        landmark: "$formDataStructured.accommodation.accommodationLandmark",
        remarks: "$formDataStructured.accommodation.accommodationRemarks",
        accommodationArea:
          "$formDataStructured.accommodation.accommodationArea",
        subPostOffice:
          "$formDataStructured.accommodation.accommodationSubPostOffice",
      },
    });

    // Add sorting
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    pipeline.push({ $sort: { [sortBy]: sortDirection } });

    // Execute aggregation with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [providers, totalCount] = await Promise.all([
      Registration.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: parseInt(limit) },
      ]),
      Registration.aggregate([...pipeline, { $count: "total" }]),
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        providers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching accommodation providers:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch accommodation providers",
    });
  }
};

/**
 * Get accommodation seekers
 */
export const getAccommodationSeekers = async (req, res) => {
  try {
    const {
      search,
      gender,
      district,
      school,
      page = 1,
      limit = 20,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;
    const user = req.user || req.admin;

    // Build match query
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.accommodation.planAccommodation": true,
      "formDataStructured.accommodation.accommodation": "need",
    };

    // Build aggregation pipeline
    const pipeline = [{ $match: matchQuery }];

    // Add gender filter for seekers (check if they need specific gender accommodation)
    if (gender && gender !== "all") {
      const genderField =
        gender === "male-only"
          ? "male"
          : gender === "female-only"
          ? "female"
          : "other";
      pipeline.push({
        $match: {
          [`formDataStructured.accommodation.accommodationNeeded.${genderField}`]:
            { $gt: 0 },
        },
      });
    }

    // Add search if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "formDataStructured.personalInfo.name": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.personalInfo.email": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.personalInfo.school": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    // Add projection to format response
    pipeline.push({
      $project: {
        _id: 1,
        registrationDate: 1,
        name: "$formDataStructured.personalInfo.name",
        email: "$formDataStructured.personalInfo.email",
        contactNumber: "$formDataStructured.personalInfo.contactNumber",
        whatsappNumber: "$formDataStructured.personalInfo.whatsappNumber",
        school: "$formDataStructured.personalInfo.school",
        yearOfPassing: "$formDataStructured.personalInfo.yearOfPassing",
        district: "$formDataStructured.personalInfo.district",
        stateUT: "$formDataStructured.personalInfo.stateUT",
        country: "$formDataStructured.personalInfo.country",
        needed: "$formDataStructured.accommodation.accommodationNeeded",
        totalNeeded: {
          $add: [
            "$formDataStructured.accommodation.accommodationNeeded.male",
            "$formDataStructured.accommodation.accommodationNeeded.female",
            "$formDataStructured.accommodation.accommodationNeeded.other",
          ],
        },
      },
    });

    // Add sorting
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    pipeline.push({ $sort: { [sortBy]: sortDirection } });

    // Execute aggregation with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [seekers, totalCount] = await Promise.all([
      Registration.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: parseInt(limit) },
      ]),
      Registration.aggregate([...pipeline, { $count: "total" }]),
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        seekers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching accommodation seekers:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch accommodation seekers",
    });
  }
};

/**
 * Get hotel requests
 */
export const getHotelRequests = async (req, res) => {
  try {
    const {
      search,
      school,
      page = 1,
      limit = 20,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;
    const user = req.user || req.admin;

    // Build match query
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.accommodation.planAccommodation": true,
      "formDataStructured.accommodation.accommodation": "discount-hotel",
    };

    // Build aggregation pipeline
    const pipeline = [{ $match: matchQuery }];

    // Add search if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "formDataStructured.personalInfo.name": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.personalInfo.email": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "formDataStructured.personalInfo.school": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    // Add projection to format response
    pipeline.push({
      $project: {
        _id: 1,
        registrationDate: 1,
        name: "$formDataStructured.personalInfo.name",
        email: "$formDataStructured.personalInfo.email",
        contactNumber: "$formDataStructured.personalInfo.contactNumber",
        whatsappNumber: "$formDataStructured.personalInfo.whatsappNumber",
        school: "$formDataStructured.personalInfo.school",
        yearOfPassing: "$formDataStructured.personalInfo.yearOfPassing",
        district: "$formDataStructured.personalInfo.district",
        stateUT: "$formDataStructured.personalInfo.stateUT",
        country: "$formDataStructured.personalInfo.country",
        hotelRequirements:
          "$formDataStructured.accommodation.hotelRequirements",
        checkInDate:
          "$formDataStructured.accommodation.hotelRequirements.checkInDate",
        checkOutDate:
          "$formDataStructured.accommodation.hotelRequirements.checkOutDate",
        adults: "$formDataStructured.accommodation.hotelRequirements.adults",
        children: {
          $add: [
            "$formDataStructured.accommodation.hotelRequirements.childrenAbove11",
            "$formDataStructured.accommodation.hotelRequirements.children5to11",
          ],
        },
        roomPreference:
          "$formDataStructured.accommodation.hotelRequirements.roomPreference",
        specialRequests:
          "$formDataStructured.accommodation.hotelRequirements.specialRequests",
      },
    });

    // Add sorting
    const sortDirection = sortOrder === "desc" ? -1 : 1;
    pipeline.push({ $sort: { [sortBy]: sortDirection } });

    // Execute aggregation with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [hotelRequests, totalCount] = await Promise.all([
      Registration.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: parseInt(limit) },
      ]),
      Registration.aggregate([...pipeline, { $count: "total" }]),
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        hotelRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching hotel requests:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch hotel requests",
    });
  }
};

/**
 * Find compatible providers for a seeker
 */
export const findCompatibleProviders = async (req, res) => {
  try {
    const { seekerId } = req.params;
    const user = req.user || req.admin;

    // Get seeker details
    const seeker = await Registration.findById(seekerId);
    if (
      !seeker ||
      seeker.formDataStructured?.accommodation?.accommodation !== "need"
    ) {
      return res.status(404).json({
        status: "error",
        message: "Seeker not found",
      });
    }

    const seekerNeeds =
      seeker.formDataStructured.accommodation.accommodationNeeded;
    const totalNeeded =
      seekerNeeds.male + seekerNeeds.female + seekerNeeds.other;

    // Build match query for providers
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.accommodation.planAccommodation": true,
      "formDataStructured.accommodation.accommodation": "provide",
      "formDataStructured.accommodation.accommodationCapacity": {
        $gte: totalNeeded,
      },
    };

    // Find providers
    const providers = await Registration.aggregate([
      { $match: matchQuery },
      {
        $project: {
          _id: 1,
          name: "$formDataStructured.personalInfo.name",
          email: "$formDataStructured.personalInfo.email",
          contactNumber: "$formDataStructured.personalInfo.contactNumber",
          school: "$formDataStructured.personalInfo.school",
          yearOfPassing: "$formDataStructured.personalInfo.yearOfPassing",
          capacity: "$formDataStructured.accommodation.accommodationCapacity",
          gender: "$formDataStructured.accommodation.accommodationGender",
          location: "$formDataStructured.accommodation.accommodationLocation",
          accommodationDistrict:
            "$formDataStructured.accommodation.accommodationDistrict",
          landmark: "$formDataStructured.accommodation.accommodationLandmark",
          remarks: "$formDataStructured.accommodation.accommodationRemarks",
        },
      },
    ]);

    // Filter by gender compatibility
    const compatibleProviders = providers.filter((provider) => {
      const genderMatch =
        provider.gender === "anyone" ||
        (provider.gender === "male-only" &&
          seekerNeeds.male > 0 &&
          seekerNeeds.female === 0) ||
        (provider.gender === "female-only" &&
          seekerNeeds.female > 0 &&
          seekerNeeds.male === 0);

      return genderMatch;
    });

    res.status(200).json({
      status: "success",
      data: {
        seeker: {
          id: seeker._id,
          name: seeker.formDataStructured.personalInfo.name,
          needed: seekerNeeds,
          totalNeeded,
        },
        compatibleProviders,
      },
    });
  } catch (error) {
    logger.error("Error finding compatible providers:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to find compatible providers",
    });
  }
};

/**
 * Get accommodation districts for filtering
 */
export const getAccommodationDistricts = async (req, res) => {
  try {
    const user = req.user || req.admin;

    // Build match query
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.accommodation.planAccommodation": true,
    };

    const districts = await Registration.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$formDataStructured.accommodation.accommodationDistrict",
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: null, $ne: "" } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: districts.map((d) => ({ district: d._id, count: d.count })),
    });
  } catch (error) {
    logger.error("Error fetching accommodation districts:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch accommodation districts",
    });
  }
};

/**
 * Export accommodation data to CSV
 */
/**
 * Debug method to test different query patterns
 */
export const debugAccommodationData = async (req, res) => {
  try {
    // Test various possible data structures
    const tests = [
      // Original structure
      {
        name: "formDataStructured.accommodation.planAccommodation",
        query: {
          registrationType: "Alumni",
          "formDataStructured.accommodation.planAccommodation": true,
        },
      },
      // Alternative structures
      {
        name: "accommodation.planAccommodation",
        query: {
          registrationType: "Alumni",
          "accommodation.planAccommodation": true,
        },
      },
      {
        name: "formData.accommodation.planAccommodation",
        query: {
          registrationType: "Alumni",
          "formData.accommodation.planAccommodation": true,
        },
      },
      // Check if planAccommodation is string "true"
      {
        name: "planAccommodation as string 'true'",
        query: {
          registrationType: "Alumni",
          "formDataStructured.accommodation.planAccommodation": "true",
        },
      },
    ];

    const results = {};
    for (const test of tests) {
      const count = await Registration.countDocuments(test.query);
      results[test.name] = count;
    }

    res.json({ status: "success", data: results });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const exportAccommodationData = async (req, res) => {
  try {
    const { type = "all" } = req.query; // all, providers, seekers, hotels
    const user = req.user || req.admin;

    // Build base match query
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.accommodation.planAccommodation": true,
    };

    // Apply type filter
    if (type !== "all") {
      const typeMap = {
        providers: "provide",
        seekers: "need",
        hotels: "discount-hotel",
      };
      matchQuery["formDataStructured.accommodation.accommodation"] =
        typeMap[type];
    }

    const accommodationData = await Registration.aggregate([
      { $match: matchQuery },
      {
        $project: {
          name: "$formDataStructured.personalInfo.name",
          email: "$formDataStructured.personalInfo.email",
          contactNumber: "$formDataStructured.personalInfo.contactNumber",
          school: "$formDataStructured.personalInfo.school",
          yearOfPassing: "$formDataStructured.personalInfo.yearOfPassing",
          accommodationType: "$formDataStructured.accommodation.accommodation",
          capacity: "$formDataStructured.accommodation.accommodationCapacity",
          gender: "$formDataStructured.accommodation.accommodationGender",
          location: "$formDataStructured.accommodation.accommodationLocation",
          district: "$formDataStructured.accommodation.accommodationDistrict",
          neededMale:
            "$formDataStructured.accommodation.accommodationNeeded.male",
          neededFemale:
            "$formDataStructured.accommodation.accommodationNeeded.female",
          neededOther:
            "$formDataStructured.accommodation.accommodationNeeded.other",
          hotelAdults:
            "$formDataStructured.accommodation.hotelRequirements.adults",
          hotelChildren: {
            $add: [
              "$formDataStructured.accommodation.hotelRequirements.childrenAbove11",
              "$formDataStructured.accommodation.hotelRequirements.children5to11",
            ],
          },
          checkInDate:
            "$formDataStructured.accommodation.hotelRequirements.checkInDate",
          checkOutDate:
            "$formDataStructured.accommodation.hotelRequirements.checkOutDate",
          registrationDate: 1,
        },
      },
      { $sort: { registrationDate: -1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: accommodationData,
    });
  } catch (error) {
    logger.error("Error exporting accommodation data:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to export accommodation data",
    });
  }
};
