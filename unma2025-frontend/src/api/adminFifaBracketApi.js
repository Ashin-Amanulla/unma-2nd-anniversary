import api from "./axios";

const unwrap = (response) => response.data?.data ?? response.data;

const adminFifaBracketApi = {
  getContest: async () => {
    const response = await api.get("/fifa-bracket/admin/contest");
    return unwrap(response);
  },
  createContest: async (data) => {
    const response = await api.post("/fifa-bracket/admin/contest", data);
    return unwrap(response);
  },
  updateContest: async (id, data) => {
    const response = await api.put(`/fifa-bracket/admin/contest/${id}`, data);
    return unwrap(response);
  },
  setupQF: async (data) => {
    const response = await api.put("/fifa-bracket/admin/qf", data);
    return unwrap(response);
  },
  enterResult: async (matchId, data) => {
    const response = await api.put(`/fifa-bracket/admin/matches/${matchId}/result`, data);
    return unwrap(response);
  },
  publishRound: async (data) => {
    const response = await api.post("/fifa-bracket/admin/publish", data);
    return unwrap(response);
  },
  getEntries: async () => {
    const response = await api.get("/fifa-bracket/admin/entries");
    return unwrap(response);
  },
  deleteEntry: async (id) => {
    const response = await api.delete(`/fifa-bracket/admin/entries/${id}`);
    return unwrap(response);
  },
};

export default adminFifaBracketApi;
