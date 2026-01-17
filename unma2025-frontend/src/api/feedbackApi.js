import axios from "./axios";

const BASE_URL = "/feedback";

// Submit feedback
export const submitFeedback = async (feedbackData) => {
  const response = await axios.post(`${BASE_URL}/submit`, feedbackData);
  return response.data;
};

// Check if user has already submitted feedback
export const checkFeedbackStatus = async (email) => {
  const response = await axios.get(`${BASE_URL}/check-status`, {
    params: { email },
  });
  return response.data;
};

// Admin: Get all feedback
export const getAllFeedback = async (params) => {
  const response = await axios.get(`${BASE_URL}/all`, { params });
  return response.data;
};

// Admin: Get feedback statistics
export const getFeedbackStats = async () => {
  const response = await axios.get(`${BASE_URL}/stats`);
  return response.data;
};

// Admin: Get feedback by ID
export const getFeedbackById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

// Admin: Export all feedback
export const exportFeedback = async () => {
  const response = await axios.get(`${BASE_URL}/export`);
  return response.data;
};
