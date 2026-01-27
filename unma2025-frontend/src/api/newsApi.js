import api from "./axios";

const newsApi = {
    /**
     * Get all published news (Public)
     * @param {Object} params - Query parameters (category, limit)
     */
    getNews: async (params = {}) => {
        try {
            const response = await api.get("/news", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch news" };
        }
    },

    /**
     * Get all news including unpublished (Admin)
     */
    getAllNewsAdmin: async () => {
        try {
            const response = await api.get("/news/admin/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch news" };
        }
    },

    /**
     * Get news item by ID
     * @param {string} id - News ID
     */
    getNewsById: async (id) => {
        try {
            const response = await api.get(`/news/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch news item" };
        }
    },

    /**
     * Create new news item (Admin)
     * @param {Object} data - News data
     */
    createNews: async (data) => {
        try {
            const response = await api.post("/news", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create news" };
        }
    },

    /**
     * Update news item (Admin)
     * @param {string} id - News ID
     * @param {Object} data - News data
     */
    updateNews: async (id, data) => {
        try {
            const response = await api.put(`/news/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update news" };
        }
    },

    /**
     * Delete news item (Admin)
     * @param {string} id - News ID
     */
    deleteNews: async (id) => {
        try {
            const response = await api.delete(`/news/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete news" };
        }
    },

    /**
     * Toggle publish status (Admin)
     * @param {string} id - News ID
     */
    togglePublish: async (id) => {
        try {
            const response = await api.patch(`/news/${id}/toggle-publish`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to toggle publish status" };
        }
    },
};

export default newsApi;
