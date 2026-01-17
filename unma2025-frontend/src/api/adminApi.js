import axios from "./axios";

/**
 * Admin API Service
 * Handles admin dashboard related API calls
 */
const adminApi = {
  /**
   * Get dashboard statistics
   * @returns {Promise} - Promise with dashboard stats
   */
  getDashboardStats: async () => {
    try {
      const response = await axios.get("/admin/dashboard-stats");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch dashboard data" }
      );
    }
  },

  /**
   * Get registration statistics
   * @returns {Promise} - Promise with registration stats
   */
  getRegistrationStats: async () => {
    try {
      const response = await axios.get("/admin/registration-stats");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch registration stats",
        }
      );
    }
  },

  /**
   * Get daily registrations data for chart
   * @param {number} days - Number of days to fetch (default: 30)
   * @returns {Promise} - Promise with daily registration data
   */
  getDailyRegistrations: async (days = 30) => {
    try {
      const response = await axios.get(
        `/admin/daily-registrations?days=${days}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch daily registrations",
        }
      );
    }
  },

  getAllRegistrations: async (queryParams = "") => {
    try {
      const url = queryParams
        ? `/registrations?${queryParams}`
        : "/registrations";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch registrations" }
      );
    }
  },

  getRegistrationById: async (id) => {
    try {
      const response = await axios.get(`/registrations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch registration" };
    }
  },

  //   deleteRegistration: async (id) => {
  //     try {
  //       const response = await axios.delete(`/registrations/${id}`);
  //       return response.data;
  //     } catch (error) {
  //       throw (
  //         error.response?.data || { message: "Failed to delete registration" }
  //       );
  //     }
  //   },

  updateRegistrationAdmin: async (registrationId, payload) => {
    try {
      const response = await axios.put(
        `/registrations/adminEdit/${registrationId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update registration" };
    }
  },

  // exportRegistrations: async (filters = {}) => {
  //     try {
  //         const response = await axios.get('/admin/registrations/export', {
  //             params: filters,
  //             responseType: 'blob'
  //         });
  //         return response.data;
  //     } catch (error) {
  //         throw error.response?.data || { message: 'Failed to export registrations' };
  //     }
  // },

  /**
   * Get admin settings
   * @returns {Promise} - Promise with admin settings
   */
  getSettings: async () => {
    try {
      const response = await axios.get("/admin/settings");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch settings" };
    }
  },

  /**
   * Update admin settings
   * @param {Object} data - Updated settings data
   * @returns {Promise} - Promise with updated settings
   */
  updateSettings: async (data) => {
    try {
      const response = await axios.put("/admin/settings", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update settings" };
    }
  },

  /**
   * Admin login
   * @param {Object} credentials - Login credentials
   * @returns {Promise} - Promise with login result
   */
  login: async (credentials) => {
    try {
      const response = await axios.post("/admin/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  getAnalytics: async () => {
    try {
      const response = await axios.get("/admin/analytics");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch analytics" };
    }
  },

  getDistrictAnalytics: async () => {
    try {
      const response = await axios.get("/admin/analytics/district");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch district analytics",
        }
      );
    }
  },

  getPaymentAnalytics: async () => {
    try {
      const response = await axios.get("/admin/analytics/payment");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch payment analytics" }
      );
    }
  },

  /**
   * Get Razorpay payments by school
   * @param {string} school - Optional school name to filter by
   * @returns {Promise} - Promise with Razorpay payment data by school
   */
  getRazorpayPaymentsBySchool: async (school = "") => {
    try {
      const url = school
        ? `/admin/analytics/razorpay-payments?school=${encodeURIComponent(school)}`
        : "/admin/analytics/razorpay-payments";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch Razorpay payments by school" }
      );
    }
  },

  /**
   * Get sub-admins list
   * @returns {Promise} - Promise with sub-admins data
   */
  getSubAdmins: async () => {
    try {
      const response = await axios.get("/admin/sub-admins");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch sub-admins" };
    }
  },

  /**
   * Create sub-admin
   * @param {Object} data - Sub-admin data
   * @returns {Promise} - Promise with created sub-admin
   */
  createSubAdmin: async (data) => {
    try {
      const response = await axios.post("/admin/sub-admins", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create sub-admin" };
    }
  },

  /**
   * Update sub-admin
   * @param {string} id - Sub-admin ID
   * @param {Object} data - Updated sub-admin data
   * @returns {Promise} - Promise with updated sub-admin
   */
  updateSubAdmin: async (id, data) => {
    try {
      const response = await axios.put(`/admin/sub-admins/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update sub-admin" };
    }
  },

  /**
   * Get available schools
   * @returns {Promise} - Promise with schools list
   */
  getAvailableSchools: async () => {
    try {
      const response = await axios.get("/admin/schools");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch schools" };
    }
  },

  /**
   * Export all registrations data
   * @returns {Promise} - Promise with all registrations data for export
   */
  exportAllRegistrations: async () => {
    try {
      const response = await axios.get("/admin/analytics/export");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to export registrations" };
    }
  },
};

export default adminApi;
