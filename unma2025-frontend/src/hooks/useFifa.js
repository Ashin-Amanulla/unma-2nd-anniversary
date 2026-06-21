import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fifaApi from "../api/fifaApi";
import adminFifaApi from "../api/adminFifaApi";

export const fifaKeys = {
  campaign: ["fifa", "campaign"],
  leaderboard: ["fifa", "leaderboard"],
  predictions: (email) => ["fifa", "predictions", email],
  slotPredictions: (slotId) => ["fifa", "slotPredictions", slotId],
  adminSlots: ["fifa", "admin", "slots"],
  adminMatches: (slotId) => ["fifa", "admin", "matches", slotId ?? "all"],
  adminParticipants: ["fifa", "admin", "participants"],
  adminSlotGrading: (slotId) => ["fifa", "admin", "grading", slotId],
  adminGradingQueue: ["fifa", "admin", "gradingQueue"],
};

const STALE_TIME = 2 * 60 * 1000;

export const useFifaCampaign = () =>
  useQuery({
    queryKey: fifaKeys.campaign,
    queryFn: () => fifaApi.getCampaign(),
    staleTime: STALE_TIME,
  });

export const useFifaLeaderboard = () =>
  useQuery({
    queryKey: fifaKeys.leaderboard,
    queryFn: () => fifaApi.getLeaderboard(),
    staleTime: STALE_TIME,
  });

export const useAdminFifaSlots = () =>
  useQuery({
    queryKey: fifaKeys.adminSlots,
    queryFn: () => adminFifaApi.getSlots(),
  });

export const useAdminFifaMatches = (slotId) =>
  useQuery({
    queryKey: fifaKeys.adminMatches(slotId),
    queryFn: () =>
      adminFifaApi.getMatches(slotId && slotId !== "all" ? { slotId } : {}),
    enabled: !!slotId,
  });

export const useAdminFifaParticipants = () =>
  useQuery({
    queryKey: fifaKeys.adminParticipants,
    queryFn: () => adminFifaApi.getParticipants(),
  });

export const useAdminFifaSlotGrading = (slotId) =>
  useQuery({
    queryKey: fifaKeys.adminSlotGrading(slotId),
    queryFn: () => adminFifaApi.getSlotGrading(slotId),
    enabled: !!slotId,
  });

export const useInvalidateFifa = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["fifa"] });
  };
};

export const useFifaJoin = () =>
  useMutation({ mutationFn: (data) => fifaApi.join(data) });

export const useFifaVerify = () =>
  useMutation({ mutationFn: (data) => fifaApi.verify(data) });

export const useFifaResend = () =>
  useMutation({ mutationFn: (data) => fifaApi.resend(data) });

export const useFifaPredict = () =>
  useMutation({ mutationFn: (data) => fifaApi.predict(data) });
