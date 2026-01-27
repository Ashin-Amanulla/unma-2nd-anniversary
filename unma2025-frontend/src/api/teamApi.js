import api from "./axios";

const teamApi = {
    /**
     * Get all team members (Public - active only)
     * @param {Object} params - Query parameters (category)
     */
    getTeamMembers: async (params = {}) => {
        try {
            const response = await api.get("/team", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch team members" };
        }
    },

    /**
     * Get team member by ID
     * @param {string} id - Team member ID
     */
    getTeamMember: async (id) => {
        try {
            const response = await api.get(`/team/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch team member" };
        }
    },

    /**
     * Create new team member (Admin)
     * @param {Object} data - Team member data
     */
    createTeamMember: async (data) => {
        try {
            const response = await api.post("/team", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create team member" };
        }
    },

    /**
     * Update team member (Admin)
     * @param {string} id - Team member ID
     * @param {Object} data - Team member data
     */
    updateTeamMember: async (id, data) => {
        try {
            const response = await api.put(`/team/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update team member" };
        }
    },

    /**
     * Delete team member (Admin)
     * @param {string} id - Team member ID
     */
    deleteTeamMember: async (id) => {
        try {
            const response = await api.delete(`/team/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete team member" };
        }
    },
};

export default teamApi;
