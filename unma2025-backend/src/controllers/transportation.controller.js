import Registration from "../models/Registration.js";
import { logUserActivity } from "../middleware/userLogger.js";

// Helper function to calculate distance between two pincodes (simplified)
const calculateDistance = (pincode1, pincode2) => {
  // This is a simplified distance calculation
  // In production, you'd use proper geocoding APIs
  if (!pincode1 || !pincode2) return 999;
  const diff = Math.abs(parseInt(pincode1) - parseInt(pincode2));
  return Math.floor(diff / 1000); // Simplified distance in km
};

// Helper function to check if two dates are the same
const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1).toDateString() === new Date(date2).toDateString();
};

// Get transportation statistics
export const getTransportationStats = async (req, res) => {
  try {
    const { search, modeOfTransport, district, state, date, maxDistance } =
      req.query;
    const user = req.user || req.admin;

    // Build base match query
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
    };
    console.log("matchQuery", matchQuery);

    // Add filters
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        {
          "formDataStructured.personalInfo.school": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "formDataStructured.transportation.startingLocation": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "formDataStructured.transportation.nearestLandmark": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (modeOfTransport && modeOfTransport !== "all") {
      matchQuery["formDataStructured.transportation.modeOfTransport"] =
        modeOfTransport;
    }

    if (district && district !== "all") {
      matchQuery["formDataStructured.transportation.pinDistrict"] = district;
    }

    if (state && state !== "all") {
      matchQuery["formDataStructured.transportation.pinState"] = state;
    }

    if (date) {
      matchQuery["formDataStructured.transportation.travelDate"] = date;
    }

    // Get transportation stats using aggregation
    const stats = await Registration.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$formDataStructured.transportation.modeOfTransport",
          count: { $sum: 1 },
          totalCapacity: {
            $sum: {
              $cond: [
                {
                  $gt: [
                    "$formDataStructured.transportation.vehicleCapacity",
                    0,
                  ],
                },
                "$formDataStructured.transportation.vehicleCapacity",
                0,
              ],
            },
          },
          totalSeekers: {
            $sum: {
              $cond: [
                { $gt: ["$formDataStructured.transportation.groupSize", 0] },
                "$formDataStructured.transportation.groupSize",
                0,
              ],
            },
          },
          needParking: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$formDataStructured.transportation.needParking",
                    "yes",
                  ],
                },
                1,
                0,
              ],
            },
          },
          ridesharingAvailable: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$formDataStructured.transportation.readyForRideShare",
                    "yes",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Process stats into readable format
    const processedStats = {
      vehicleProviders: { count: 0, totalCapacity: 0, needParking: 0 },
      rideSeekers: { count: 0, totalNeeded: 0 },
      ridesharingAvailable: { count: 0, totalCapacity: 0 },
      modeBreakdown: {},
      totalTravellers: 0,
    };

    stats.forEach((stat) => {
      const mode = stat._id || "unknown";
      processedStats.modeBreakdown[mode] = {
        count: stat.count,
        totalCapacity: stat.totalCapacity,
        totalSeekers: stat.totalSeekers,
        needParking: stat.needParking,
        ridesharingAvailable: stat.ridesharingAvailable,
      };

      processedStats.totalTravellers += stat.count;

      // Vehicle providers (those with vehicles offering rides)
      if (["car", "bus", "two-wheeler"].includes(mode)) {
        processedStats.vehicleProviders.count += stat.ridesharingAvailable;
        processedStats.vehicleProviders.totalCapacity += stat.totalCapacity;
        processedStats.vehicleProviders.needParking += stat.needParking;
      }

      // Ride seekers (those looking for transport)
      if (mode === "looking-for-transport") {
        processedStats.rideSeekers.count += stat.count;
        processedStats.rideSeekers.totalNeeded += stat.totalSeekers;
      }

      // Ridesharing available
      if (stat.ridesharingAvailable > 0) {
        processedStats.ridesharingAvailable.count += stat.ridesharingAvailable;
        processedStats.ridesharingAvailable.totalCapacity += stat.totalCapacity;
      }
    });

    res.json(processedStats);
  } catch (error) {
    console.error("Error fetching transportation stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get vehicle providers (people offering rides)
export const getVehicleProviders = async (req, res) => {
  try {
    const {
      search,
      modeOfTransport,
      district,
      state,
      date,
      page = 1,
      limit = 20,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;

    const user = req.user || req.admin;

    // Build match query for vehicle providers
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
      "formDataStructured.transportation.readyForRideShare": "yes",
      "formDataStructured.transportation.vehicleCapacity": { $gt: 0 },
    };

    // Add filters
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        {
          "formDataStructured.personalInfo.school": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "formDataStructured.transportation.startingLocation": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (modeOfTransport && modeOfTransport !== "all") {
      matchQuery["formDataStructured.transportation.modeOfTransport"] =
        modeOfTransport;
    }

    if (district && district !== "all") {
      matchQuery["formDataStructured.transportation.pinDistrict"] = district;
    }

    if (state && state !== "all") {
      matchQuery["formDataStructured.transportation.pinState"] = state;
    }

    if (date) {
      matchQuery["formDataStructured.transportation.travelDate"] = date;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get total count
    const totalCount = await Registration.countDocuments(matchQuery);

    // Get paginated results
    const providers = await Registration.find(matchQuery)
      .select({
        name: 1,
        email: 1,
        contactNumber: 1,
        "formDataStructured.personalInfo.school": 1,
        "formDataStructured.personalInfo.whatsappNumber": 1,
        "formDataStructured.transportation": 1,
        registrationDate: 1,
      })
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Process results
    const processedProviders = providers.map((provider) => ({
      id: provider._id,
      name: provider.name,
      email: provider.email,
      contactNumber: provider.contactNumber,
      whatsappNumber: provider.formDataStructured?.personalInfo?.whatsappNumber,
      school: provider.formDataStructured?.personalInfo?.school,
      transportation: provider.formDataStructured?.transportation,
      registrationDate: provider.registrationDate,
    }));

    res.json({
      providers: processedProviders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching vehicle providers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get ride seekers (people looking for rides)
export const getRideSeekers = async (req, res) => {
  try {
    const {
      search,
      district,
      state,
      date,
      page = 1,
      limit = 20,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;

    const user = req.user || req.admin;

    // Build match query for ride seekers
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
      "formDataStructured.transportation.modeOfTransport":
        "looking-for-transport",
    };

    // Add filters
    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        {
          "formDataStructured.personalInfo.school": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "formDataStructured.transportation.startingLocation": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (district && district !== "all") {
      matchQuery["formDataStructured.transportation.pinDistrict"] = district;
    }

    if (state && state !== "all") {
      matchQuery["formDataStructured.transportation.pinState"] = state;
    }

    if (date) {
      matchQuery["formDataStructured.transportation.travelDate"] = date;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get total count
    const totalCount = await Registration.countDocuments(matchQuery);

    // Get paginated results
    const seekers = await Registration.find(matchQuery)
      .select({
        name: 1,
        email: 1,
        contactNumber: 1,
        "formDataStructured.personalInfo.school": 1,
        "formDataStructured.personalInfo.whatsappNumber": 1,
        "formDataStructured.transportation": 1,
        registrationDate: 1,
      })
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Process results
    const processedSeekers = seekers.map((seeker) => ({
      id: seeker._id,
      name: seeker.name,
      email: seeker.email,
      contactNumber: seeker.contactNumber,
      whatsappNumber: seeker.formDataStructured?.personalInfo?.whatsappNumber,
      school: seeker.formDataStructured?.personalInfo?.school,
      transportation: seeker.formDataStructured?.transportation,
      registrationDate: seeker.registrationDate,
    }));

    res.json({
      seekers: processedSeekers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ride seekers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Find compatible rides (match providers with seekers)
export const findCompatibleRides = async (req, res) => {
  try {
    const {
      seekerId,
      maxDistance = 50,
      sameDateOnly = true,
      modeOfTransport,
    } = req.query;

    const user = req.user || req.admin;

    if (!seekerId) {
      return res.status(400).json({ message: "Seeker ID is required" });
    }

    // Get seeker details
    const seeker = await Registration.findById(seekerId);
    if (!seeker || !seeker.formDataStructured?.transportation?.isTravelling) {
      return res
        .status(404)
        .json({ message: "Seeker not found or not travelling" });
    }

    const seekerTransport = seeker.formDataStructured.transportation;

    // Build match query for compatible providers - start with basic requirements
    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
      _id: { $ne: seekerId }, // Exclude the seeker themselves
    };

    // Check if we have any travelling users first
    const basicTravellers = await Registration.countDocuments(matchQuery);
    console.log(
      `Basic travelling users (excluding seeker): ${basicTravellers}`
    );

    // Now add provider-specific requirements
    matchQuery["formDataStructured.transportation.readyForRideShare"] = "yes";
    matchQuery["formDataStructured.transportation.vehicleCapacity"] = {
      $gt: 0,
    };

    console.log(
      "Seeker transport details:",
      JSON.stringify(seekerTransport, null, 2)
    );
    console.log(
      "Initial provider match query:",
      JSON.stringify(matchQuery, null, 2)
    );

    // Check count without date filter first
    const providersWithoutDateFilter = await Registration.countDocuments(
      matchQuery
    );
    console.log(`Providers without date filter: ${providersWithoutDateFilter}`);

    // Filter by date if required
    if (sameDateOnly && seekerTransport.travelDate) {
      matchQuery["formDataStructured.transportation.travelDate"] =
        seekerTransport.travelDate;
      console.log("Adding date filter:", seekerTransport.travelDate);
    } else if (sameDateOnly) {
      console.log("Same date only requested but seeker has no travel date");
    }

    // Filter by mode of transport if specified
    if (modeOfTransport && modeOfTransport !== "all") {
      matchQuery["formDataStructured.transportation.modeOfTransport"] =
        modeOfTransport;
      console.log("Adding mode filter:", modeOfTransport);
    }

    console.log(
      "Final provider match query:",
      JSON.stringify(matchQuery, null, 2)
    );

    // Get potential providers
    const providers = await Registration.find(matchQuery).select({
      name: 1,
      email: 1,
      contactNumber: 1,
      "formDataStructured.personalInfo.school": 1,
      "formDataStructured.personalInfo.whatsappNumber": 1,
      "formDataStructured.transportation": 1,
      registrationDate: 1,
    });

    console.log(`Found ${providers.length} potential providers`);
    if (providers.length > 0) {
      console.log(
        "First provider sample:",
        JSON.stringify(providers[0].formDataStructured?.transportation, null, 2)
      );
    }

    // Let's also check what providers exist without the strict filtering
    const allProviders = await Registration.find({
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
      _id: { $ne: seekerId },
    }).select({
      name: 1,
      "formDataStructured.transportation": 1,
    });

    console.log(
      `Total travelling users (excluding seeker): ${allProviders.length}`
    );
    const withRideshare = allProviders.filter(
      (p) => p.formDataStructured?.transportation?.readyForRideShare === "yes"
    );
    console.log(`Users ready for rideshare: ${withRideshare.length}`);
    const withCapacity = withRideshare.filter(
      (p) => p.formDataStructured?.transportation?.vehicleCapacity > 0
    );
    console.log(`Users with vehicle capacity > 0: ${withCapacity.length}`);

    // If no strict providers found, try with relaxed requirements
    if (providers.length === 0) {
      console.log("No strict providers found, trying relaxed requirements...");

      // Try without rideshare requirement (just people with vehicles)
      const relaxedQuery = {
        registrationType: "Alumni",
        "formDataStructured.transportation.isTravelling": true,
        "formDataStructured.transportation.vehicleCapacity": { $gt: 0 },
        _id: { $ne: seekerId },
      };

      const relaxedProviders = await Registration.find(relaxedQuery).select({
        name: 1,
        email: 1,
        contactNumber: 1,
        "formDataStructured.personalInfo.school": 1,
        "formDataStructured.personalInfo.whatsappNumber": 1,
        "formDataStructured.transportation": 1,
        registrationDate: 1,
      });

      console.log(
        `Found ${relaxedProviders.length} relaxed providers (with vehicles but may not have rideshare enabled)`
      );

      if (relaxedProviders.length > 0) {
        console.log("Sample relaxed provider:", {
          name: relaxedProviders[0].name,
          readyForRideShare:
            relaxedProviders[0].formDataStructured?.transportation
              ?.readyForRideShare,
          vehicleCapacity:
            relaxedProviders[0].formDataStructured?.transportation
              ?.vehicleCapacity,
          modeOfTransport:
            relaxedProviders[0].formDataStructured?.transportation
              ?.modeOfTransport,
        });
      }
    }

    // Calculate compatibility and distance for each provider
    const compatibleRides = providers
      .map((provider) => {
        const providerTransport = provider.formDataStructured.transportation;

        // Calculate distance between pincodes
        const distance = calculateDistance(
          seekerTransport.startPincode,
          providerTransport.startPincode
        );

        // Calculate compatibility score
        let compatibilityScore = 100;

        // Distance factor (closer is better)
        if (distance > maxDistance) return null; // Skip if too far
        compatibilityScore -= distance;

        // Same date bonus
        if (
          isSameDate(seekerTransport.travelDate, providerTransport.travelDate)
        ) {
          compatibilityScore += 20;
        }

        // Same district bonus
        if (seekerTransport.pinDistrict === providerTransport.pinDistrict) {
          compatibilityScore += 15;
        }

        // Same state bonus
        if (seekerTransport.pinState === providerTransport.pinState) {
          compatibilityScore += 10;
        }

        // Vehicle capacity consideration
        const availableSeats = providerTransport.vehicleCapacity - 1; // Minus driver
        if (availableSeats >= (seekerTransport.groupSize || 1)) {
          compatibilityScore += 25;
        } else {
          compatibilityScore -= 10; // Partial accommodation penalty
        }

        return {
          id: provider._id,
          name: provider.name,
          email: provider.email,
          contactNumber: provider.contactNumber,
          whatsappNumber:
            provider.formDataStructured?.personalInfo?.whatsappNumber,
          school: provider.formDataStructured?.personalInfo?.school,
          transportation: providerTransport,
          distance,
          compatibilityScore: Math.max(0, compatibilityScore),
          availableSeats,
          canAccommodateFullGroup:
            availableSeats >= (seekerTransport.groupSize || 1),
        };
      })
      .filter((ride) => ride !== null) // Remove incompatible rides
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore) // Sort by compatibility
      .slice(0, 20); // Limit to top 20 matches

    console.log(`Compatible rides found: ${compatibleRides.length}`);
    if (compatibleRides.length > 0) {
      console.log(
        "Top compatible ride:",
        JSON.stringify(
          {
            name: compatibleRides[0].name,
            distance: compatibleRides[0].distance,
            score: compatibleRides[0].compatibilityScore,
            transport: compatibleRides[0].transportation,
          },
          null,
          2
        )
      );
    }

    res.json({
      seeker: {
        id: seeker._id,
        name: seeker.name,
        transportation: seekerTransport,
      },
      compatibleRides,
      totalMatches: compatibleRides.length,
    });
  } catch (error) {
    console.error("Error finding compatible rides:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all unique districts for filtering
export const getTransportationDistricts = async (req, res) => {
  try {
    const user = req.user || req.admin;

    const districts = await Registration.distinct(
      "formDataStructured.transportation.pinDistrict",
      {
        registrationType: "Alumni",
        "formDataStructured.transportation.isTravelling": true,
        "formDataStructured.transportation.pinDistrict": { $ne: "" },
      }
    );

    res.json(districts.filter(Boolean).sort());
  } catch (error) {
    console.error("Error fetching transportation districts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all unique states for filtering
export const getTransportationStates = async (req, res) => {
  try {
    const user = req.user || req.admin;

    const states = await Registration.distinct(
      "formDataStructured.transportation.pinState",
      {
        registrationType: "Alumni",
        "formDataStructured.transportation.isTravelling": true,
        "formDataStructured.transportation.pinState": { $ne: "" },
      }
    );

    res.json(states.filter(Boolean).sort());
  } catch (error) {
    console.error("Error fetching transportation states:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get proximity groups (people travelling from nearby areas)
export const getProximityGroups = async (req, res) => {
  try {
    const { maxDistance = 25, minGroupSize = 2 } = req.query;
    const user = req.user || req.admin;

    // Get all travellers with pincode data
    const travellers = await Registration.find({
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
      "formDataStructured.transportation.startPincode": { $ne: "" },
    }).select({
      name: 1,
      email: 1,
      contactNumber: 1,
      "formDataStructured.personalInfo.school": 1,
      "formDataStructured.personalInfo.whatsappNumber": 1,
      "formDataStructured.transportation": 1,
    });

    // Group by proximity
    const groups = {};

    travellers.forEach((traveller) => {
      const pincode = traveller.formDataStructured.transportation.startPincode;
      const pincodeBase = pincode.substring(0, 3); // First 3 digits for broad area grouping

      if (!groups[pincodeBase]) {
        groups[pincodeBase] = [];
      }

      groups[pincodeBase].push({
        id: traveller._id,
        name: traveller.name,
        email: traveller.email,
        contactNumber: traveller.contactNumber,
        whatsappNumber:
          traveller.formDataStructured?.personalInfo?.whatsappNumber,
        school: traveller.formDataStructured?.personalInfo?.school,
        transportation: traveller.formDataStructured.transportation,
      });
    });

    // Filter groups by minimum size and process
    const processedGroups = Object.entries(groups)
      .filter(([_, members]) => members.length >= minGroupSize)
      .map(([pincodeBase, members]) => {
        // Calculate group statistics
        const vehicleProviders = members.filter(
          (m) =>
            m.transportation.readyForRideShare === "yes" &&
            m.transportation.vehicleCapacity > 0
        );

        const rideSeekers = members.filter(
          (m) => m.transportation.modeOfTransport === "looking-for-transport"
        );

        const totalCapacity = vehicleProviders.reduce(
          (sum, p) => sum + (p.transportation.vehicleCapacity || 0),
          0
        );

        const totalSeekers = rideSeekers.reduce(
          (sum, s) => sum + (s.transportation.groupSize || 1),
          0
        );

        // Get common travel dates
        const travelDates = members
          .map((m) => m.transportation.travelDate)
          .filter(Boolean);
        const commonDates = [...new Set(travelDates)]
          .map((date) => ({
            date,
            count: travelDates.filter((d) => d === date).length,
          }))
          .sort((a, b) => b.count - a.count);

        return {
          pincodeBase,
          areaName:
            members[0].transportation.pinDistrict || `Area ${pincodeBase}`,
          memberCount: members.length,
          vehicleProviders: vehicleProviders.length,
          rideSeekers: rideSeekers.length,
          totalCapacity,
          totalSeekers,
          canSelfSustain: totalCapacity >= totalSeekers,
          commonDates: commonDates.slice(0, 3), // Top 3 common dates
          members,
        };
      })
      .sort((a, b) => b.memberCount - a.memberCount);

    res.json({
      groups: processedGroups,
      totalGroups: processedGroups.length,
      summary: {
        totalTravellers: travellers.length,
        totalGroupedTravellers: processedGroups.reduce(
          (sum, g) => sum + g.memberCount,
          0
        ),
        selfSustainableGroups: processedGroups.filter((g) => g.canSelfSustain)
          .length,
      },
    });
  } catch (error) {
    console.error("Error fetching proximity groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Debug transportation data
export const debugTransportationData = async (req, res) => {
  try {
    const user = req.user || req.admin;

    // Get all travellers
    const allTravellers = await Registration.find({
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
    }).select({
      name: 1,
      "formDataStructured.transportation": 1,
    });

    console.log(`Total travellers: ${allTravellers.length}`);

    // Analyze the data
    const analysis = {
      totalTravellers: allTravellers.length,
      withRideshareYes: 0,
      withRideshareNo: 0,
      withVehicleCapacity: 0,
      withoutVehicleCapacity: 0,
      modeBreakdown: {},
      dateBreakdown: {},
      locationBreakdown: {},
      sample: [],
    };

    allTravellers.forEach((traveller) => {
      const transport = traveller.formDataStructured?.transportation;

      if (transport?.readyForRideShare === "yes") {
        analysis.withRideshareYes++;
      } else {
        analysis.withRideshareNo++;
      }

      if (transport?.vehicleCapacity > 0) {
        analysis.withVehicleCapacity++;
      } else {
        analysis.withoutVehicleCapacity++;
      }

      // Mode breakdown
      const mode = transport?.modeOfTransport || "unknown";
      analysis.modeBreakdown[mode] = (analysis.modeBreakdown[mode] || 0) + 1;

      // Date breakdown
      const date = transport?.travelDate || "no-date";
      analysis.dateBreakdown[date] = (analysis.dateBreakdown[date] || 0) + 1;

      // Location breakdown
      const location = transport?.pinDistrict || "no-location";
      analysis.locationBreakdown[location] =
        (analysis.locationBreakdown[location] || 0) + 1;

      // Add to sample if it has rideshare and capacity
      if (
        transport?.readyForRideShare === "yes" &&
        transport?.vehicleCapacity > 0 &&
        analysis.sample.length < 5
      ) {
        analysis.sample.push({
          name: traveller.name,
          transport: transport,
        });
      }
    });

    res.json(analysis);
  } catch (error) {
    console.error("Error debugging transportation data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export transportation data to CSV
export const exportTransportationData = async (req, res) => {
  try {
    const { type = "all" } = req.query;
    const user = req.user || req.admin;

    let matchQuery = {
      registrationType: "Alumni",
      "formDataStructured.transportation.isTravelling": true,
    };

    // Filter by type
    if (type === "providers") {
      matchQuery["formDataStructured.transportation.readyForRideShare"] = "yes";
      matchQuery["formDataStructured.transportation.vehicleCapacity"] = {
        $gt: 0,
      };
    } else if (type === "seekers") {
      matchQuery["formDataStructured.transportation.modeOfTransport"] =
        "looking-for-transport";
    }

    const travellers = await Registration.find(matchQuery).select({
      name: 1,
      email: 1,
      contactNumber: 1,
      "formDataStructured.personalInfo": 1,
      "formDataStructured.transportation": 1,
      registrationDate: 1,
    });

    // Convert to CSV format
    const csvHeaders = [
      "Name",
      "Email",
      "Contact Number",
      "WhatsApp Number",
      "School",
      "Mode of Transport",
      "Starting Location",
      "Pincode",
      "District",
      "State",
      "Travel Date",
      "Travel Time",
      "Vehicle Capacity",
      "Group Size",
      "Ready for Rideshare",
      "Need Parking",
      "Special Requirements",
      "Registration Date",
    ];

    const csvData = travellers.map((traveller) => {
      const transport = traveller.formDataStructured.transportation || {};
      const personalInfo = traveller.formDataStructured.personalInfo || {};

      return [
        traveller.name || "",
        traveller.email || "",
        traveller.contactNumber || "",
        personalInfo.whatsappNumber || "",
        personalInfo.school || "",
        transport.modeOfTransport || "",
        transport.startingLocation || "",
        transport.startPincode || "",
        transport.pinDistrict || "",
        transport.pinState || "",
        transport.travelDate || "",
        transport.travelTime || "",
        transport.vehicleCapacity || "",
        transport.groupSize || "",
        transport.readyForRideShare || "",
        transport.needParking || "",
        transport.travelSpecialRequirements || "",
        traveller.registrationDate
          ? new Date(traveller.registrationDate).toISOString().split("T")[0]
          : "",
      ];
    });

    // Create CSV content
    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="transportation_${type}_${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting transportation data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
