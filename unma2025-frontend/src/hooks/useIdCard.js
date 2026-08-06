import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import idCardApi from "../api/idCardApi";

export const idCardKeys = {
  all: ["idCard"],
  stats: () => [...idCardKeys.all, "stats"],
  downloadable: (params) => [...idCardKeys.all, "downloadable", params],
  preview: (registrationId) => [...idCardKeys.all, "preview", registrationId],
};

export const useIdCardStats = () => {
  return useQuery({
    queryKey: idCardKeys.stats(),
    queryFn: idCardApi.getStats,
    staleTime: 60 * 1000,
  });
};

export const useDownloadableIdCards = (params = {}) => {
  return useQuery({
    queryKey: idCardKeys.downloadable(params),
    queryFn: () => idCardApi.getDownloadable(params),
    staleTime: 30 * 1000,
  });
};

export const useIdCardPreview = (registrationId, options = {}) => {
  return useQuery({
    queryKey: idCardKeys.preview(registrationId),
    queryFn: () => idCardApi.getPreview(registrationId),
    enabled: !!registrationId && (options.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
};

export const useDownloadIdCard = () => {
  return useMutation({
    mutationFn: ({ registrationId, format, name }) =>
      idCardApi.downloadCard(registrationId, format).then((response) => ({
        blob: response.data,
        format,
        name,
      })),
    onSuccess: ({ blob, format, name }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name || "id-card"}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("ID card downloaded");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to download ID card"
      );
    },
  });
};

export const useBulkDownloadIdCards = () => {
  return useMutation({
    mutationFn: (payload) => idCardApi.bulkDownload(payload),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `id-cards-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Bulk download started");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to bulk download ID cards"
      );
    },
  });
};

export const useGeneratePaidIdCards = () => {
  return useMutation({
    mutationFn: (batchSize) => idCardApi.generateForPaid(batchSize),
    onSuccess: (data) => {
      toast.success(data.message || "ID cards generated for paid registrations");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to generate ID cards"
      );
    },
  });
};
