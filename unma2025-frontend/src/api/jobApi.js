import api from "./axios";

const jobApi = {
    /**
     * Get all active jobs (Public)
     * @param {Object} params - Query parameters (page, limit, type, search, qualification, selectionCriteria, minAge, maxAge)
     */
    getActiveJobs: async (params = {}) => {
        try {
            const response = await api.get("/jobs", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch jobs" };
        }
    },

    /**
     * Get job by ID (Public)
     * @param {string} id - Job ID
     */
    getJobById: async (id) => {
        try {
            const response = await api.get(`/jobs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch job details" };
        }
    },

    /**
     * Get all jobs (Admin)
     * @param {Object} params - Query parameters (page, limit, type, search, isActive, qualification, selectionCriteria, minAge, maxAge)
     */
    getAllJobs: async (params = {}) => {
        try {
            const response = await api.get("/jobs/admin/all", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch jobs" };
        }
    },

    /**
     * Get job statistics (Admin)
     */
    getJobStats: async () => {
        try {
            const response = await api.get("/jobs/admin/stats");
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch job stats" };
        }
    },

    /**
     * Create new job (Admin)
     * @param {Object} data - Job data
     */
    createJob: async (data) => {
        try {
            const response = await api.post("/jobs", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to create job" };
        }
    },

    /**
     * Update job (Admin)
     * @param {string} id - Job ID
     * @param {Object} data - Job data
     */
    updateJob: async (id, data) => {
        try {
            const response = await api.put(`/jobs/${id}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to update job" };
        }
    },

    /**
     * Delete job (Admin)
     * @param {string} id - Job ID
     */
    deleteJob: async (id) => {
        try {
            const response = await api.delete(`/jobs/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to delete job" };
        }
    },

    /**
     * Toggle job status (Admin)
     * @param {string} id - Job ID
     */
    toggleJobStatus: async (id) => {
        try {
            const response = await api.patch(`/jobs/${id}/toggle`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to toggle job status" };
        }
    },

    /**
     * Upload job image
     * @param {File} file - Image file
     */
    uploadJobImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post("/upload/single", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to upload image" };
        }
    },

    /**
     * Upload job PDF (notification PDF)
     * @param {File} file - PDF file
     */
    uploadJobPdf: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post("/upload/single", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to upload PDF" };
        }
    },

    /**
     * Submit public job for approval (Public - no auth required)
     * @param {Object} data - Job data with submitter info
     */
    submitPublicJob: async (data) => {
        try {
            const response = await api.post("/jobs/public/submit", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to submit job" };
        }
    },

    /**
     * Get pending jobs (Admin)
     * @param {Object} params - Query parameters (page, limit)
     */
    getPendingJobs: async (params = {}) => {
        try {
            const response = await api.get("/jobs/admin/pending", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to fetch pending jobs" };
        }
    },

    /**
     * Approve a job (Admin)
     * @param {string} id - Job ID
     */
    approveJob: async (id) => {
        try {
            const response = await api.patch(`/jobs/${id}/approve`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to approve job" };
        }
    },

    /**
     * Reject a job (Admin)
     * @param {string} id - Job ID
     * @param {string} reason - Rejection reason
     */
    rejectJob: async (id, reason) => {
        try {
            const response = await api.patch(`/jobs/${id}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: "Failed to reject job" };
        }
    },
};

export default jobApi;
