import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackApi } from "../api";

// Submit feedback
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbackData) => feedbackApi.submitFeedback(feedbackData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbackStats"] });
      queryClient.invalidateQueries({ queryKey: ["allFeedback"] });
    },
  });
};

// Check feedback status
export const useCheckFeedbackStatus = (email, options = {}) => {
  return useQuery({
    queryKey: ["feedbackStatus", email],
    queryFn: () => feedbackApi.checkFeedbackStatus(email),
    enabled: !!email,
    ...options,
  });
};

// Get all feedback (Admin)
export const useGetAllFeedback = (params, options = {}) => {
  return useQuery({
    queryKey: ["allFeedback", params],
    queryFn: () => feedbackApi.getAllFeedback(params),
    ...options,
  });
};

// Get feedback statistics (Admin)
export const useGetFeedbackStats = (options = {}) => {
  return useQuery({
    queryKey: ["feedbackStats"],
    queryFn: feedbackApi.getFeedbackStats,
    ...options,
  });
};

// Get feedback by ID (Admin)
export const useGetFeedbackById = (id, options = {}) => {
  return useQuery({
    queryKey: ["feedback", id],
    queryFn: () => feedbackApi.getFeedbackById(id),
    enabled: !!id,
    ...options,
  });
};

// Export feedback (Admin)
export const useExportFeedback = () => {
  return useMutation({
    mutationFn: feedbackApi.exportFeedback,
  });
};
