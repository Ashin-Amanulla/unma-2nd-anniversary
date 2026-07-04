import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const unwrap = (response) => response.data?.data ?? response.data;

const fifaBracketApi = {
  getContest: async () => {
    const response = await client.get("/fifa-bracket/contest");
    return unwrap(response);
  },
  check: async (data) => {
    const response = await client.post("/fifa-bracket/check", data);
    return unwrap(response);
  },
  enter: async (data) => {
    const response = await client.post("/fifa-bracket/enter", data);
    return response.data;
  },
  getBoard: async (params) => {
    const response = await client.get("/fifa-bracket/board", { params });
    return unwrap(response);
  },
  getEntry: async (id) => {
    const response = await client.get(`/fifa-bracket/entries/${id}`);
    return unwrap(response);
  },
};

export default fifaBracketApi;
