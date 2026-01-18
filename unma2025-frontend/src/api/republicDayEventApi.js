import axios from "axios";
import api from "./axios";

// Create a separate axios instance for public event registration without admin redirect
const eventRegistrationAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor without admin login redirect
eventRegistrationAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors without redirecting to admin login
    console.log("Event Registration API error intercepted:", error.response?.status);
    return Promise.reject(error);
  }
);

/**
 * Republic Day Event Registration API Service
 * Handles event registration related API calls
 */
const republicDayEventApi = {
  /**
   * Create new event registration (Public)
   * @param {Object} payload - Registration data
   * @returns {Promise} API response
   */
  createRegistration: async (payload) => {
    try {
      const response = await eventRegistrationAxios.post(
        `/republic-day-event/register`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Event Registration API error:", error);

      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Registration failed" };
      }
    }
  },

  /**
   * Get all event registrations (Admin only)
   * @param {Object} params - Query parameters (page, limit, search, filters)
   * @returns {Promise} API response with paginated registrations
   */
  getAllRegistrations: async (params = {}) => {
    try {
      const response = await api.get("/republic-day-event/registrations", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Get Event Registrations API error:", error);
      throw error.response?.data || { message: "Failed to fetch registrations" };
    }
  },

  /**
   * Get event registration by ID (Admin only)
   * @param {string} id - Registration ID
   * @returns {Promise} API response with registration details
   */
  getRegistrationById: async (id) => {
    try {
      const response = await api.get(`/republic-day-event/registrations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get Event Registration API error:", error);
      throw error.response?.data || { message: "Failed to fetch registration" };
    }
  },

  /**
   * Get event registration statistics (Admin only)
   * @returns {Promise} API response with statistics
   */
  getStats: async () => {
    try {
      const response = await api.get("/republic-day-event/stats");
      return response.data;
    } catch (error) {
      console.error("Get Event Stats API error:", error);
      throw error.response?.data || { message: "Failed to fetch statistics" };
    }
  },
};

export default republicDayEventApi;

