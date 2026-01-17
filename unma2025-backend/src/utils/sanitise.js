/**
 * Data sanitization utility for registration form data
 * Clears unwanted fields based on conditional logic and user selections
 */

/**
 * Sanitize personal information based on country and state selections
 * @param {Object} personalInfo - Personal information object
 * @returns {Object} - Sanitized personal information
 */
const sanitizePersonalInfo = (personalInfo) => {
  if (!personalInfo) return personalInfo;

  const sanitized = { ...personalInfo };

  // If country is not India, clear Indian-specific fields
  if (sanitized.country !== "IN") {
    sanitized.stateUT = "";
    sanitized.district = "";
  } else {
    // If state is not Kerala, clear Kerala-specific fields
    if (sanitized.stateUT !== "Kerala") {
      sanitized.district = "";
    }
  }

  return sanitized;
};

/**
 * Sanitize event attendance based on attendance decision
 * @param {Object} eventAttendance - Event attendance object
 * @returns {Object} - Sanitized event attendance
 */
const sanitizeEventAttendance = (eventAttendance) => {
  if (!eventAttendance) return eventAttendance;

  const sanitized = { ...eventAttendance };

  // If not attending, clear attendance-related fields
  if (!sanitized.isAttending) {
    sanitized.attendees = {
      adults: { veg: 0, nonVeg: 0 },
      teens: { veg: 0, nonVeg: 0 },
      children: { veg: 0, nonVeg: 0 },
      toddlers: { veg: 0, nonVeg: 0 },
    };
    sanitized.eventParticipation = [];
    sanitized.participationDetails = "";
  }

  return sanitized;
};

/**
 * Sanitize sponsorship based on interest selections
 * @param {Object} sponsorship - Sponsorship object
 * @returns {Object} - Sanitized sponsorship
 */
const sanitizeSponsorship = (sponsorship) => {
  if (!sponsorship) return sponsorship;

  const sanitized = { ...sponsorship };

  // If not interested in sponsorship, clear sponsorship fields
  if (!sanitized.interestedInSponsorship) {
    sanitized.sponsorshipTier = "";
    sanitized.sponsorshipDetails = "";
  }

  return sanitized;
};

/**
 * Sanitize transportation based on travel decisions
 * @param {Object} transportation - Transportation object
 * @returns {Object} - Sanitized transportation
 */
const sanitizeTransportation = (transportation) => {
  if (!transportation) return transportation;

  const sanitized = { ...transportation };

  // If not traveling, clear all transportation fields
  if (!sanitized.isTravelling) {
    return {
      isTravelling: false,
      travelConsistsTwoSegments: "",
      connectWithNavodayansFirstSegment: "",
      firstSegmentStartingLocation: "",
      firstSegmentTravelDate: "",
      startingLocation: "",
      startPincode: "",
      pinDistrict: "",
      pinState: "",
      pinTaluk: "",
      nearestLandmark: "",
      travelDate: "",
      travelTime: "",
      modeOfTransport: "",
      needParking: "",
      connectWithNavodayans: "",
      readyForRideShare: "",
      vehicleCapacity: 1,
      groupSize: 1,
      travelSpecialRequirements: "",
    };
  }

  // If not two-segment travel, clear first segment fields
  if (sanitized.travelConsistsTwoSegments !== "yes") {
    sanitized.connectWithNavodayansFirstSegment = "";
    sanitized.firstSegmentStartingLocation = "";
    sanitized.firstSegmentTravelDate = "";
  }

  // Mode of transport specific sanitization
  if (!["car", "two-wheeler", "bus"].includes(sanitized.modeOfTransport)) {
    sanitized.needParking = "";
    sanitized.readyForRideShare = "";
    sanitized.vehicleCapacity = 0;
    sanitized.connectWithNavodayans = "";
  }

  if (sanitized.modeOfTransport !== "looking-for-transport") {
    sanitized.groupSize = 1;
  }

  if (sanitized.connectWithNavodayans !== "yes") {
    sanitized.readyForRideShare = "";
    sanitized.vehicleCapacity = 0;
  }

  if (sanitized.readyForRideShare !== "yes") {
    sanitized.vehicleCapacity = 0;
  }

  return sanitized;
};

/**
 * Sanitize accommodation based on planning decisions
 * @param {Object} accommodation - Accommodation object
 * @returns {Object} - Sanitized accommodation
 */
const sanitizeAccommodation = (accommodation) => {
  if (!accommodation) return accommodation;

  const sanitized = { ...accommodation };

  // If not planning accommodation, clear all accommodation fields
  if (!sanitized.planAccommodation) {
    return {
      planAccommodation: false,
      accommodation: "",
      accommodationGender: "",
      accommodationNeeded: { male: 0, female: 0, other: 0 },
      accommodationPincode: "",
      accommodationDistrict: "",
      accommodationState: "",
      accommodationTaluk: "",
      accommodationLandmark: "",
      accommodationSubPostOffice: "",
      accommodationArea: "",
      accommodationCapacity: 0,
      accommodationLocation: "",
      accommodationRemarks: "",
      hotelRequirements: {
        adults: 0,
        childrenAbove11: 0,
        children5to11: 0,
        checkInDate: "",
        checkOutDate: "",
        roomPreference: "",
        specialRequests: "",
      },
    };
  }

  // Clear fields based on accommodation type
  switch (sanitized.accommodation) {
    case "not-required":
      // Clear all accommodation-specific fields
      sanitized.accommodationGender = "";
      sanitized.accommodationNeeded = { male: 0, female: 0, other: 0 };
      sanitized.accommodationPincode = "";
      sanitized.accommodationDistrict = "";
      sanitized.accommodationState = "";
      sanitized.accommodationTaluk = "";
      sanitized.accommodationLandmark = "";
      sanitized.accommodationSubPostOffice = "";
      sanitized.accommodationArea = "";
      sanitized.accommodationCapacity = 0;
      sanitized.accommodationLocation = "";
      sanitized.hotelRequirements = {
        adults: 0,
        childrenAbove11: 0,
        children5to11: 0,
        checkInDate: "",
        checkOutDate: "",
        roomPreference: "",
        specialRequests: "",
      };
      break;

    case "provide":
      // Clear need and hotel fields
      sanitized.accommodationNeeded = { male: 0, female: 0, other: 0 };
      sanitized.hotelRequirements = {
        adults: 0,
        childrenAbove11: 0,
        children5to11: 0,
        checkInDate: "",
        checkOutDate: "",
        roomPreference: "",
        specialRequests: "",
      };
      break;

    case "need":
      // Clear provide and hotel fields
      sanitized.accommodationGender = "";
      sanitized.accommodationPincode = "";
      sanitized.accommodationDistrict = "";
      sanitized.accommodationState = "";
      sanitized.accommodationTaluk = "";
      sanitized.accommodationLandmark = "";
      sanitized.accommodationSubPostOffice = "";
      sanitized.accommodationArea = "";
      sanitized.accommodationCapacity = 0;
      sanitized.accommodationLocation = "";
      sanitized.hotelRequirements = {
        adults: 0,
        childrenAbove11: 0,
        children5to11: 0,
        checkInDate: "",
        checkOutDate: "",
        roomPreference: "",
        specialRequests: "",
      };
      break;

    case "discount-hotel":
      // Clear provide and need fields
      sanitized.accommodationGender = "";
      sanitized.accommodationNeeded = { male: 0, female: 0, other: 0 };
      sanitized.accommodationPincode = "";
      sanitized.accommodationDistrict = "";
      sanitized.accommodationState = "";
      sanitized.accommodationTaluk = "";
      sanitized.accommodationLandmark = "";
      sanitized.accommodationSubPostOffice = "";
      sanitized.accommodationArea = "";
      sanitized.accommodationCapacity = 0;
      sanitized.accommodationLocation = "";
      break;

    default:
      // Clear all accommodation-specific fields for unknown types
      sanitized.accommodationGender = "";
      sanitized.accommodationNeeded = { male: 0, female: 0, other: 0 };
      sanitized.accommodationPincode = "";
      sanitized.accommodationDistrict = "";
      sanitized.accommodationState = "";
      sanitized.accommodationTaluk = "";
      sanitized.accommodationLandmark = "";
      sanitized.accommodationSubPostOffice = "";
      sanitized.accommodationArea = "";
      sanitized.accommodationCapacity = 0;
      sanitized.accommodationLocation = "";
      sanitized.hotelRequirements = {
        adults: 0,
        childrenAbove11: 0,
        children5to11: 0,
        checkInDate: "",
        checkOutDate: "",
        roomPreference: "",
        specialRequests: "",
      };
  }

  return sanitized;
};

/**
 * Sanitize optional fields based on selections
 * @param {Object} optional - Optional fields object
 * @returns {Object} - Sanitized optional fields
 */
const sanitizeOptional = (optional) => {
  if (!optional) return optional;

  const sanitized = { ...optional };

  // If not interested in t-shirt, clear t-shirt sizes
  if (sanitized.tshirtInterest !== "yes") {
    sanitized.tshirtSizes = {
      XS: 0,
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL: 0,
    };
  }

  return sanitized;
};

/**
 * Sanitize professional information
 * @param {Object} professional - Professional information object
 * @returns {Object} - Sanitized professional information
 */
const sanitizeProfessional = (professional) => {
  if (!professional) return professional;

  const sanitized = { ...professional };

  // If profession is empty or only "Student", clear business details
  if (
    !sanitized.profession ||
    sanitized.profession.length === 0 ||
    (sanitized.profession.length === 1 && sanitized.profession[0] === "Student")
  ) {
    sanitized.businessDetails = "";
    sanitized.professionalDetails = "";
  } else if (
    Array.isArray(sanitized.profession) &&
    !sanitized.profession.includes("Business Owner/Entrepreneur")
  ) {
    sanitized.businessDetails = "";
  }

  return sanitized;
};

/**
 * Sanitize financial information
 * @param {Object} financial - Financial information object
 * @returns {Object} - Sanitized financial information
 */
const sanitizeFinancial = (financial) => {
  if (!financial) return financial;

  const sanitized = { ...financial };

  if (sanitized.paymentStatus === "financial-difficulty") {
    sanitized.contributionAmount = 0;
    sanitized.proposedAmount = 0;

  }

  return sanitized;
};

/**
 * Main sanitization function that processes all form data sections
 * @param {Object} formDataStructured - Complete form data object
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formDataStructured) => {
  if (!formDataStructured) return formDataStructured;

  const sanitized = { ...formDataStructured };

  // Sanitize each section
  if (sanitized.personalInfo) {
    sanitized.personalInfo = sanitizePersonalInfo(sanitized.personalInfo);
  }

  if (sanitized.professional) {
    sanitized.professional = sanitizeProfessional(sanitized.professional);
  }

  if (sanitized.eventAttendance) {
    sanitized.eventAttendance = sanitizeEventAttendance(
      sanitized.eventAttendance
    );
  }

  if (sanitized.sponsorship) {
    sanitized.sponsorship = sanitizeSponsorship(sanitized.sponsorship);
  }

  if (sanitized.transportation) {
    sanitized.transportation = sanitizeTransportation(sanitized.transportation);
  }

  if (sanitized.accommodation) {
    sanitized.accommodation = sanitizeAccommodation(sanitized.accommodation);
  }

  if (sanitized.optional) {
    sanitized.optional = sanitizeOptional(sanitized.optional);
  }

  if (sanitized.financial) {
    sanitized.financial = sanitizeFinancial(sanitized.financial);
  }

  return sanitized;
};

/**
 * Sanitize step-specific data based on step number
 * @param {number} step - Current step number
 * @param {Object} stepData - Step data to sanitize
 * @returns {Object} - Sanitized step data
 */
export const sanitizeStepData = (step, stepData) => {
  if (!stepData || !stepData.formDataStructured) return stepData;

  const sanitized = { ...stepData };

  // Apply full sanitization
  sanitized.formDataStructured = sanitizeFormData(sanitized.formDataStructured);

  return sanitized;
};

/**
 * Deep clean empty strings and null values
 * @param {Object} obj - Object to clean
 * @returns {Object} - Cleaned object
 */
export const deepCleanEmptyValues = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj
      .map(deepCleanEmptyValues)
      .filter((item) => item !== null && item !== undefined);
  }

  if (typeof obj === "object") {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = deepCleanEmptyValues(value);

      // Keep the value if it's not an empty string, null, or undefined
      if (
        cleanedValue !== "" &&
        cleanedValue !== null &&
        cleanedValue !== undefined
      ) {
        // For objects, only keep if they have at least one non-empty property
        if (typeof cleanedValue === "object" && !Array.isArray(cleanedValue)) {
          if (Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }

  return obj;
};

// Export individual sanitization functions for specific use cases
export {
  sanitizePersonalInfo,
  sanitizeEventAttendance,
  sanitizeSponsorship,
  sanitizeTransportation,
  sanitizeAccommodation,
  sanitizeOptional,
  sanitizeProfessional,
  sanitizeFinancial,
};
