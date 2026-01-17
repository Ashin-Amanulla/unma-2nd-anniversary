import axios from "axios";

// Create a separate axios instance for public event registration without admin redirect
const eventRegistrationAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
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
   * Create new event registration
   * @param {Object} payload - Registration data
   * @returns {Promise} API response
   */
  createRegistration: async (payload) => {
    try {
      const response = await eventRegistrationAxios.post(
        `/v1/republic-day-event/register`,
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
};

export default republicDayEventApi;
