import axios from "./axios";

/**
 * Gallery API Service
 * Handles gallery photo upload and listing related API calls
 */
const galleryApi = {
  /**
   * Get all galleries (subfolders) from S3 bucket
   * @returns {Promise} - Promise with galleries array
   */
  getGalleries: async () => {
    try {
      const response = await axios.get("/upload/galleries");
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch galleries:", error);
      if (error.response?.data) {
        throw {
          message:
            error.response.data.error ||
            error.response.data.message ||
            "Failed to fetch galleries",
          details: error.response.data,
        };
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Failed to fetch galleries" };
      }
    }
  },

  /**
   * Get all gallery images from a specific folder in S3 bucket
   * @param {string} folder - Folder name (e.g., "summit-2025")
   * @returns {Promise} - Promise with gallery images array
   */
  getGalleryImages: async (folder) => {
    try {
      const response = await axios.get(`/upload/gallery/${folder}`);
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
   * Get all gallery images from S3 bucket (legacy method for backward compatibility)
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
   * @param {string} folder - Target folder name (e.g., "summit-2025")
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise} - Promise with uploaded file data
   */
  uploadPhoto: async (file, folder, onProgress) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (folder) {
        formData.append("folder", folder);
      }

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
