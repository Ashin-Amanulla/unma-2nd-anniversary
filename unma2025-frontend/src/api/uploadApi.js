import axios from "./axios";

/**
 * Upload API Service
 * Handles file upload related API calls
 */
const uploadApi = {
    /**
     * Upload a single file to S3
     * @param {File} file - File to upload
     * @param {Function} onProgress - Progress callback function
     * @returns {Promise} - Promise with uploaded file data
     */
    uploadSingle: async (file, onProgress) => {
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
            return {
                success: true,
                data: {
                    url: response.data.fileUrl,
                },
            };
        } catch (error) {
            console.error("❌ Upload failed:", error);
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
                throw { message: "Failed to upload file" };
            }
        }
    },
};

export default uploadApi;
