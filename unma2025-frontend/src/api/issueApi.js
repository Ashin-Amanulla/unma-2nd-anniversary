import axios from "./axios";

/**
 * Issues API Service
 * Handles issue report related API calls
 */
const issuesApi = {
  /**
   * Create a new issue report
   * @param {Object} issueData - Data for the issue report
   * @returns {Promise} - Promise with issue report data
   */
  create: async (issueData) => {
    try {
      const response = await axios.post("/issues", issueData);
      return response.data;
    } catch (error) {
      console.error("Issue API error:", error);
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Issue creation failed" };
      }
    }
  },

  /**
   * Get all issue reports with optional query parameters
   * @param {string} queryParams - URL query parameters for filtering
   * @returns {Promise} - Promise with issue reports data
   */
  getAllIssues: async (queryParams = "") => {
    try {
      const url = queryParams ? `/issues?${queryParams}` : "/issues";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch issues" };
    }
  },

  /**
   * Get issue report by ID
   * @param {string} id - Issue ID
   * @returns {Promise} - Promise with issue report data
   */
  getIssueById: async (id) => {
    try {
      const response = await axios.get(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch issue" };
    }
  },

  /**
   * Update an existing issue report
   * @param {string} id - Issue ID
   * @param {Object} updatedIssueData - Updated data for the issue
   * @returns {Promise} - Promise with updated issue data
   */
  updateIssue: async (id, updatedIssueData) => {
    try {
      const response = await axios.put(`/issues/${id}`, updatedIssueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update issue" };
    }
  },

  /**
   * Update issue status specifically
   * @param {string} id - Issue ID
   * @param {string} status - New status
   * @returns {Promise} - Promise with updated issue data
   */
  updateStatus: async (id, status) => {
    try {
      const response = await axios.patch(`/issues/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to update issue status" }
      );
    }
  },

  /**
   * Delete an issue report by ID
   * @param {string} id - Issue ID
   * @returns {Promise} - Promise with result of the deletion
   */
  deleteIssue: async (id) => {
    try {
      const response = await axios.delete(`/issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete issue" };
    }
  },

  /**
   * Upload file to S3
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} - Promise with uploaded file data
   */
  uploadFile: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      console.log("✅ Upload successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Upload failed:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error config:", error.config?.url);

      if (error.response?.data) {
        throw {
          message:
            error.response.data.error ||
            error.response.data.message ||
            "Upload failed",
          details: error.response.data,
        };
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Failed to upload file" };
      }
    }
  },
};

export default issuesApi;
