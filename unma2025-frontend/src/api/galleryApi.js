import axios from "./axios";

/**
 * Gallery API Service
 * Handles gallery photo upload and listing related API calls
 */
const galleryApi = {
  /**
   * Get all gallery images from S3 bucket
   * @returns {Promise} - Promise with gallery images array
   */
  getImages: async () => {
    try {
      const response = await axios.get("/upload/gallery");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch gallery images:", error);
      if (error.response?.data) {
        throw {
          message:
            error.response.data.error ||
            error.response.data.message ||
            "Failed to fetch images",
          details: error.response.data,
        };
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Failed to fetch gallery images" };
      }
    }
  },

  /**
   * Upload photo to gallery (S3 bucket: unma folder)
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} - Promise with uploaded file data
   */
  uploadPhoto: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/upload/gallery", formData, {
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

      console.log("✅ Gallery upload successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Gallery upload failed:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);

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
        throw { message: "Failed to upload photo" };
      }
    }
  },
};

export default galleryApi;
