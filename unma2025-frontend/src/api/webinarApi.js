import api from "./axios";

const webinarApi = {
  /** Published webinars only (public) */
  getWebinars: async () => {
    try {
      const response = await api.get("/webinars");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch webinars" };
    }
  },

  /** Single published webinar by id */
  getWebinarById: async (id) => {
    try {
      const response = await api.get(`/webinars/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch webinar" };
    }
  },

  /** Featured/latest published webinar for banner & popup */
  getRecentWebinar: async () => {
    try {
      const response = await api.get("/webinars/recent");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch webinar" };
    }
  },

  /** Admin: all webinars including drafts */
  getAllWebinarsAdmin: async () => {
    try {
      const response = await api.get("/webinars/admin/all");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch webinars" };
    }
  },

  createWebinar: async (data) => {
    try {
      const response = await api.post("/webinars", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create webinar" };
    }
  },

  updateWebinar: async (id, data) => {
    try {
      const response = await api.put(`/webinars/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update webinar" };
    }
  },

  deleteWebinar: async (id) => {
    try {
      const response = await api.delete(`/webinars/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete webinar" };
    }
  },

  togglePublish: async (id) => {
    try {
      const response = await api.patch(`/webinars/${id}/toggle-publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to toggle publish status" };
    }
  },
};

export default webinarApi;
