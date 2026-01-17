import axios from "./axios";
import { toast } from "react-toastify";

const userLogsApi = {
  getUserLogs: async (queryParams) => {
    try {
      const response = await axios.get(`/admin/user-logs?${queryParams}`);
      return response;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch user logs" };
    }
  },
  getUserLogsStats: async () => {
    try {
      const response = await axios.get("/admin/user-logs/stats");
      return response;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch user logs stats" }
      );
    }
  },
  getUserLogById: async (id) => {
    try {
      const response = await axios.get(`/admin/user-logs/${id}`);
      return response;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch user log by id" }
      );
    }
  },
  getUserActivityTimeline: async (userId) => {
    try {
      const response = await axios.get(
        `/admin/user-logs/user/${userId}/timeline`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to fetch user activity timeline",
        }
      );
    }
  },
  exportUserLogs: async (queryParams) => {
    try {
      const response = await axios.get(
        `/admin/user-logs/export?${queryParams}`,
        {
          responseType: "blob",
        }
      );
      return response;
    } catch (error) {
      throw error.response?.data || { message: "Failed to export user logs" };
    }
  },
  cleanupUserLogs: async () => {
    try {
      const response = await axios.delete("/admin/user-logs/cleanup");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to cleanup user logs" };
    }
  },
};

export default userLogsApi;
