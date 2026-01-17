import axios from "./axios";


// Transportation statistics
export const getTransportationStats = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, value);
      }
    });

    const response = await axios.get(`/transportation/stats?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transportation stats:", error);
    throw error;
  }
};

// Vehicle providers (people offering rides)
export const getVehicleProviders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        params.append(key, value);
      }
    });

    const response = await axios.get(`/transportation/providers?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle providers:", error);
    throw error;
  }
};

// Ride seekers (people looking for rides)
export const getRideSeekers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        params.append(key, value);
      }
    });

    const response = await axios.get(`/transportation/seekers?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ride seekers:", error);
    throw error;
  }
};

// Find compatible rides for a seeker
export const findCompatibleRides = async (seekerId, options = {}) => {
  try {
    const params = new URLSearchParams({ seekerId });

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        params.append(key, value);
      }
    });

    const response = await axios.get(`/transportation/compatible-rides?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error finding compatible rides:", error);
    throw error;
  }
};

// Get proximity groups (people travelling from nearby areas)
export const getProximityGroups = async (options = {}) => {
  try {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    const response = await axios.get(`/transportation/proximity-groups?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching proximity groups:", error);
    throw error;
  }
};

// Get available districts
export const getTransportationDistricts = async () => {
  try {
    const response = await axios.get("/transportation/districts");
    return response.data;
  } catch (error) {
    console.error("Error fetching transportation districts:", error);
    throw error;
  }
};

// Get available states
export const getTransportationStates = async () => {
  try {
    const response = await axios.get("/transportation/states");
    return response.data;
  } catch (error) {
    console.error("Error fetching transportation states:", error);
    throw error;
  }
};

// Export transportation data
export const exportTransportationData = async (type = "all") => {
  try {
      const response = await axios.get(`/transportation/export?type=${type}`, {
      responseType: "blob",
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `transportation_${type}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error exporting transportation data:", error);
    throw error;
  }
};

// Helper function to contact via WhatsApp
export const contactViaWhatsApp = (phoneNumber, message = "") => {
  // Remove any non-digit characters and ensure it starts with country code
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const formattedNumber = cleanNumber.startsWith("91")
    ? cleanNumber
    : `91${cleanNumber}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};

// Helper function to generate default WhatsApp message for ride coordination
export const generateRideMessage = (
  seekerInfo,
  providerInfo,
  isSeeker = true
) => {
  if (isSeeker) {
    return `Hi ${providerInfo.name}, I saw your ride offer for ${
      providerInfo.transportation?.startingLocation || "the event"
    } on ${
      providerInfo.transportation?.travelDate || "the travel date"
    }. I'm looking for a ride from ${
      seekerInfo.transportation?.startingLocation || "nearby area"
    }. Could we coordinate? Thanks!`;
  } else {
    return `Hi ${seekerInfo.name}, I have a vehicle going from ${
      providerInfo.transportation?.startingLocation || "the area"
    } on ${
      providerInfo.transportation?.travelDate || "the travel date"
    } and noticed you're looking for a ride. I have ${
      providerInfo.transportation?.vehicleCapacity - 1 || "some"
    } seats available. Would you like to join? Thanks!`;
  }
};

export default {
  getTransportationStats,
  getVehicleProviders,
  getRideSeekers,
  findCompatibleRides,
  getProximityGroups,
  getTransportationDistricts,
  getTransportationStates,
  exportTransportationData,
  contactViaWhatsApp,
  generateRideMessage,
};
