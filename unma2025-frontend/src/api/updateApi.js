import api from "./axios";

const updateApi = {
    /**
     * Get all published updates (Public)
     * @param {Object} params - Query parameters (category, limit)
     */
    getUpdates: async (params = {}) => {
        try {
            const response = await api.get("/updates", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch updates" };
        }
    },

    /**
     * Get all updates including unpublished (Admin)
     */
    getAllUpdatesAdmin: async () => {
        try {
            const response = await api.get("/updates/admin/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch updates" };
        }
    },

    /**
     * Get update item by ID
     * @param {string} id - Update ID
     */
    getUpdateById: async (id) => {
        try {
            const response = await api.get(`/updates/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch update item" };
        }
    },

    /**
     * Create new update item (Admin)
     * @param {Object} data - Update data
     */
    createUpdate: async (data) => {
        try {
            const response = await api.post("/updates", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create update" };
        }
    },

    /**
     * Update update item (Admin)
     * @param {string} id - Update ID
     * @param {Object} data - Update data
     */
    updateUpdate: async (id, data) => {
        try {
            const response = await api.put(`/updates/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update update" };
        }
    },

    /**
     * Delete update item (Admin)
     * @param {string} id - Update ID
     */
    deleteUpdate: async (id) => {
        try {
            const response = await api.delete(`/updates/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete update" };
        }
    },

    /**
     * Toggle publish status (Admin)
     * @param {string} id - Update ID
     */
    togglePublish: async (id) => {
        try {
            const response = await api.patch(`/updates/${id}/toggle-publish`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to toggle publish status" };
        }
    },
};

export default updateApi;
