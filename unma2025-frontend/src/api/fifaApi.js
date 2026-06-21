import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const fifaAxios = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

fifaAxios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

const unwrap = (response) => response.data?.data ?? response.data;

const fifaApi = {
  getCampaign: async () => {
    const response = await fifaAxios.get("/fifa/campaign");
    return unwrap(response);
  },
  getLeaderboard: async () => {
    const response = await fifaAxios.get("/fifa/leaderboard");
    return unwrap(response);
  },
  join: async (data) => {
    const response = await fifaAxios.post("/fifa/join", data);
    return response.data;
  },
  resend: async (data) => {
    const response = await fifaAxios.post("/fifa/resend", data);
    return response.data;
  },
  verify: async (data) => {
    const response = await fifaAxios.post("/fifa/verify", data);
    return unwrap(response);
  },
  updateSchool: async (data) => {
    const response = await fifaAxios.patch("/fifa/school", data);
    return unwrap(response);
  },
  getMyPredictions: async (data) => {
    const response = await fifaAxios.post("/fifa/predictions", data);
    return unwrap(response);
  },
  predict: async (data) => {
    const response = await fifaAxios.post("/fifa/predict", data);
    return unwrap(response);
  },
  getSlotPredictions: async (slotId) => {
    const response = await fifaAxios.get(`/fifa/slots/${slotId}/predictions`);
    return unwrap(response);
  },
};

export default fifaApi;
