import axios from "./axios";



const accommodationApi = {
  // Get accommodation statistics
  getStats: async (params = {}) => {
    try {
      const response = await axios.get("/accommodation/stats", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching accommodation stats:", error);
      throw error;
    }
  },

  // Get accommodation providers
  getProviders: async (params = {}) => {
    try {
      const response = await axios.get("/accommodation/providers", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching accommodation providers:", error);
      throw error;
    }
  },

  // Get accommodation seekers
  getSeekers: async (params = {}) => {
    try {
      const response = await axios.get("/accommodation/seekers", { params });
      return response.data; 
    } catch (error) {
      console.error("Error fetching accommodation seekers:", error);
      throw error;
    }
  },

  // Get hotel requests
  getHotelRequests: async (params = {}) => {
    try {
      const response = await axios.get("/accommodation/hotels", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching hotel requests:", error);
      throw error;
    }
  },

  // Find compatible providers for a seeker
  findCompatibleProviders: async (seekerId) => {
    try {
      const response = await axios.get(
        `/accommodation/seekers/${seekerId}/compatible`
      );
      return response.data;
    } catch (error) {
      console.error("Error finding compatible providers:", error);
      throw error;
    }
  },

  // Get accommodation districts
  getDistricts: async () => {
    try {
      const response = await axios.get("/accommodation/districts");
      return response.data;
    } catch (error) {
      console.error("Error fetching accommodation districts:", error);
      throw error;
    }
  },

  // Export accommodation data
  exportData: async (type = "all") => {
    try {
      const response = await axios.get("/accommodation/export", {
        params: { type },
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting accommodation data:", error);
      throw error;
    }
  },

  // Get schools for filtering (from registrations API)
  getSchools: async () => {
    try {
      const response = await axios.get("/registrations/schools");
      return response.data;
    } catch (error) {
      console.error("Error fetching schools:", error);
      throw error;
    }
  },
};

export default accommodationApi;
