import axios from "./axios";

const idCardApi = {
  getStats: async () => {
    const response = await axios.get("/id-card/stats");
    return response.data;
  },

  getDownloadable: async (params = {}) => {
    const response = await axios.get("/id-card/downloadable", { params });
    return response.data;
  },

  getPreview: async (registrationId) => {
    const response = await axios.get(`/id-card/${registrationId}/preview`);
    return response.data;
  },

  downloadCard: async (registrationId, format = "png") => {
    const response = await axios.get(`/id-card/${registrationId}`, {
      params: { format },
      responseType: "blob",
    });
    return response;
  },

  bulkDownload: async (payload = {}) => {
    const response = await axios.post("/id-card/bulk-download", payload, {
      responseType: "blob",
    });
    return response;
  },

  generateForPaid: async (batchSize = 10) => {
    const response = await axios.post("/id-card/generate-paid", { batchSize });
    return response.data;
  },
};

export default idCardApi;
