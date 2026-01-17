import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import issuesApi from "../api/issueApi";
import { toast } from "react-toastify";

// Query keys
export const issuesKeys = {
  all: ["issues"],
  lists: () => [...issuesKeys.all, "list"],
  list: (filters) => [...issuesKeys.lists(), filters],
  details: () => [...issuesKeys.all, "detail"],
  detail: (id) => [...issuesKeys.details(), id],
};

// Hook to get paginated issues
export const useIssues = (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status = "",
    category = "",
    priority = "",
    search = "",
  } = filters;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status,
    category,
    priority,
    search,
  }).toString();

  return useQuery({
    queryKey: issuesKeys.list({
      page,
      limit,
      status,
      category,
      priority,
      search,
    }),
    queryFn: () => issuesApi.getAllIssues(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Hook to get a single issue
export const useIssue = (id) => {
  return useQuery({
    queryKey: issuesKeys.detail(id),
    queryFn: () => issuesApi.getIssueById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to create a new issue
export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueData) => issuesApi.create(issueData),
    onSuccess: () => {
      toast.success("Issue reported successfully! We will look into it.");

      // Invalidate and refetch issues list
      queryClient.invalidateQueries({ queryKey: issuesKeys.lists() });
    },
    onError: (error) => {
      console.error("Error creating issue:", error);
      toast.error(error.message || "Failed to create issue");
    },
  });
};

// Hook to update an issue
export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updatedData }) => issuesApi.updateIssue(id, updatedData),
    onSuccess: (data, variables) => {
      toast.success("Issue updated successfully");

      // Invalidate and refetch issues list
      queryClient.invalidateQueries({ queryKey: issuesKeys.lists() });

      // Update the specific issue in cache
      queryClient.setQueryData(issuesKeys.detail(variables.id), (oldData) =>
        oldData
          ? { ...oldData, data: { ...oldData.data, ...variables.updatedData } }
          : oldData
      );
    },
    onError: (error) => {
      console.error("Error updating issue:", error);
      toast.error(error.message || "Failed to update issue");
    },
  });
};

// Hook to update issue status specifically
export const useUpdateIssueStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => issuesApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      toast.success("Issue status updated successfully");

      // Invalidate and refetch issues list
      queryClient.invalidateQueries({ queryKey: issuesKeys.lists() });

      // Update the specific issue in cache
      queryClient.setQueryData(issuesKeys.detail(variables.id), (oldData) =>
        oldData
          ? { ...oldData, data: { ...oldData.data, status: variables.status } }
          : oldData
      );
    },
    onError: (error) => {
      console.error("Error updating issue status:", error);
      toast.error(error.message || "Failed to update issue status");
    },
  });
};

// Hook to delete an issue
export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => issuesApi.deleteIssue(id),
    onSuccess: (data, variables) => {
      toast.success("Issue deleted successfully");

      // Invalidate and refetch issues list
      queryClient.invalidateQueries({ queryKey: issuesKeys.lists() });

      // Remove the issue from cache
      queryClient.removeQueries({ queryKey: issuesKeys.detail(variables) });
    },
    onError: (error) => {
      console.error("Error deleting issue:", error);
      toast.error(error.message || "Failed to delete issue");
    },
  });
};

// Hook to upload file for issues
export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }) =>
      issuesApi.uploadFile(file, onProgress),
    onError: (error) => {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file");
    },
  });
};
