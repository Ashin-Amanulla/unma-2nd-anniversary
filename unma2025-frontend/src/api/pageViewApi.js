import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const pageViewApi = {
  record: async ({ path, visitorId }) => {
    await client.post("/page-views", { path, visitorId });
  },
};

export default pageViewApi;
