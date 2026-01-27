import api from "./axios";

const activityApi = {
    /**
     * Get all published activities (Public)
     * @param {Object} params - Query parameters (category, status, limit)
     */
    getActivities: async (params = {}) => {
        try {
            const response = await api.get("/activities", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch activities" };
        }
    },

    /**
     * Get all activities including unpublished (Admin)
     */
    getAllActivitiesAdmin: async () => {
        try {
            const response = await api.get("/activities/admin/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch activities" };
        }
    },

    /**
     * Get activity by ID
     * @param {string} id - Activity ID
     */
    getActivityById: async (id) => {
        try {
            const response = await api.get(`/activities/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch activity" };
        }
    },

    /**
     * Create new activity (Admin)
     * @param {Object} data - Activity data
     */
    createActivity: async (data) => {
        try {
            const response = await api.post("/activities", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create activity" };
        }
    },

    /**
     * Update activity (Admin)
     * @param {string} id - Activity ID
     * @param {Object} data - Activity data
     */
    updateActivity: async (id, data) => {
        try {
            const response = await api.put(`/activities/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update activity" };
        }
    },

    /**
     * Delete activity (Admin)
     * @param {string} id - Activity ID
     */
    deleteActivity: async (id) => {
        try {
            const response = await api.delete(`/activities/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete activity" };
        }
    },

    /**
     * Toggle publish status (Admin)
     * @param {string} id - Activity ID
     */
    togglePublish: async (id) => {
        try {
            const response = await api.patch(`/activities/${id}/toggle-publish`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to toggle publish status" };
        }
    },
};

export default activityApi;
