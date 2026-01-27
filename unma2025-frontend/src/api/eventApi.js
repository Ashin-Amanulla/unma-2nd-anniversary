import api from "./axios";

const eventApi = {
    /**
     * Get all published events (Public)
     * @param {Object} params - Query parameters (year, status, limit)
     */
    getEvents: async (params = {}) => {
        try {
            const response = await api.get("/events", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch events" };
        }
    },

    /**
     * Get all events including unpublished (Admin)
     */
    getAllEventsAdmin: async () => {
        try {
            const response = await api.get("/events/admin/all");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch events" };
        }
    },

    /**
     * Get event by ID
     * @param {string} id - Event ID
     */
    getEventById: async (id) => {
        try {
            const response = await api.get(`/events/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch event" };
        }
    },

    /**
     * Create new event (Admin)
     * @param {Object} data - Event data
     */
    createEvent: async (data) => {
        try {
            const response = await api.post("/events", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create event" };
        }
    },

    /**
     * Update event (Admin)
     * @param {string} id - Event ID
     * @param {Object} data - Event data
     */
    updateEvent: async (id, data) => {
        try {
            const response = await api.put(`/events/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update event" };
        }
    },

    /**
     * Delete event (Admin)
     * @param {string} id - Event ID
     */
    deleteEvent: async (id) => {
        try {
            const response = await api.delete(`/events/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete event" };
        }
    },

    /**
     * Toggle publish status (Admin)
     * @param {string} id - Event ID
     */
    togglePublish: async (id) => {
        try {
            const response = await api.patch(`/events/${id}/toggle-publish`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to toggle publish status" };
        }
    },
};

export default eventApi;
