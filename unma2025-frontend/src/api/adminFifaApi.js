import api from "./axios";

const unwrap = (response) => response.data?.data ?? response.data;

const adminFifaApi = {
  getCampaign: async () => {
    const response = await api.get("/fifa/campaign");
    return unwrap(response);
  },
  createCampaign: async (data) => {
    const response = await api.post("/fifa/admin/campaign", data);
    return unwrap(response);
  },
  updateCampaign: async (id, data) => {
    const response = await api.put(`/fifa/admin/campaign/${id}`, data);
    return unwrap(response);
  },
  getSlots: async () => {
    const response = await api.get("/fifa/admin/slots");
    return unwrap(response);
  },
  createSlot: async (data) => {
    const response = await api.post("/fifa/admin/slots", data);
    return unwrap(response);
  },
  updateSlot: async (id, data) => {
    const response = await api.put(`/fifa/admin/slots/${id}`, data);
    return unwrap(response);
  },
  deleteSlot: async (id) => {
    const response = await api.delete(`/fifa/admin/slots/${id}`);
    return unwrap(response);
  },
  getMatches: async (params) => {
    const response = await api.get("/fifa/admin/matches", { params });
    return unwrap(response);
  },
  createMatch: async (data) => {
    const response = await api.post("/fifa/admin/matches", data);
    return unwrap(response);
  },
  updateMatch: async (id, data) => {
    const response = await api.put(`/fifa/admin/matches/${id}`, data);
    return unwrap(response);
  },
  deleteMatch: async (id) => {
    const response = await api.delete(`/fifa/admin/matches/${id}`);
    return unwrap(response);
  },
  enterResult: async (id, data) => {
    const response = await api.put(`/fifa/admin/matches/${id}/result`, data);
    return unwrap(response);
  },
  regradeMatch: async (id) => {
    const response = await api.post(`/fifa/admin/matches/${id}/regrade`);
    return unwrap(response);
  },
  getGradingQueue: async () => {
    const response = await api.get("/fifa/admin/grading/queue");
    return unwrap(response);
  },
  getSlotGrading: async (slotId) => {
    const response = await api.get(`/fifa/admin/grading/slot/${slotId}`);
    return unwrap(response);
  },
  gradeAnswer: async (predictionId, answerId, data) => {
    const response = await api.put(
      `/fifa/admin/grading/${predictionId}/${answerId}`,
      data
    );
    return unwrap(response);
  },
  getParticipants: async () => {
    const response = await api.get("/fifa/admin/participants");
    return unwrap(response);
  },
  updateParticipantPoints: async (id, data) => {
    const response = await api.patch(`/fifa/admin/participants/${id}/points`, data);
    return unwrap(response);
  },
  deleteParticipant: async (id) => {
    const response = await api.delete(`/fifa/admin/participants/${id}`);
    return unwrap(response);
  },
  getChatMessages: async () => {
    const response = await api.get("/fifa/chat/messages");
    return unwrap(response);
  },
  deleteChatMessage: async (id) => {
    const response = await api.delete(`/fifa/admin/chat/messages/${id}`);
    return unwrap(response);
  },
};

export default adminFifaApi;
