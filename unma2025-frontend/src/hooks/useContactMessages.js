import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import contactMessagesApi from "../api/contactMessagesApi";
import { toast } from "react-toastify";

// Query keys
export const contactMessagesKeys = {
  all: ["contact-messages"],
  lists: () => [...contactMessagesKeys.all, "list"],
  list: (filters) => [...contactMessagesKeys.lists(), filters],
  details: () => [...contactMessagesKeys.all, "detail"],
  detail: (id) => [...contactMessagesKeys.details(), id],
  stats: () => [...contactMessagesKeys.all, "stats"],
  unreadCount: () => [...contactMessagesKeys.all, "unread-count"],
};

// Hook to get paginated contact messages
export const useContactMessages = (filters = {}) => {
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
    queryKey: contactMessagesKeys.list({
      page,
      limit,
      status,
      category,
      priority,
      search,
    }),
    queryFn: () => contactMessagesApi.getAllMessages(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Hook to get a single contact message
export const useContactMessage = (id) => {
  return useQuery({
    queryKey: contactMessagesKeys.detail(id),
    queryFn: () => contactMessagesApi.getMessageById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to get contact messages stats
export const useContactMessagesStats = () => {
  return useQuery({
    queryKey: contactMessagesKeys.stats(),
    queryFn: contactMessagesApi.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

// Hook to get unread messages count
export const useUnreadMessagesCount = () => {
  return useQuery({
    queryKey: contactMessagesKeys.unreadCount(),
    queryFn: contactMessagesApi.getUnreadCount,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

// Hook to update message status
export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => contactMessagesApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      toast.success("Message status updated successfully");

      // Invalidate and refetch messages list
      queryClient.invalidateQueries({ queryKey: contactMessagesKeys.lists() });

      // Update the specific message in cache if it exists
      queryClient.setQueryData(
        contactMessagesKeys.detail(variables.id),
        (oldData) =>
          oldData
            ? {
                ...oldData,
                data: { ...oldData.data, status: variables.status },
              }
            : oldData
      );

      // Update unread count
      queryClient.invalidateQueries({
        queryKey: contactMessagesKeys.unreadCount(),
      });
    },
    onError: (error) => {
      console.error("Error updating message status:", error);
      toast.error(error.message || "Failed to update message status");
    },
  });
};

// Hook to respond to a message
export const useRespondToMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, responseMessage, responseMethod = "email" }) =>
      contactMessagesApi.respondToMessage(id, responseMessage, responseMethod),
    onSuccess: (data, variables) => {
      toast.success("Response sent successfully");

      // Invalidate and refetch messages list
      queryClient.invalidateQueries({ queryKey: contactMessagesKeys.lists() });

      // Update the specific message in cache
      queryClient.setQueryData(
        contactMessagesKeys.detail(variables.id),
        (oldData) =>
          oldData
            ? { ...oldData, data: { ...oldData.data, status: "responded" } }
            : oldData
      );
    },
    onError: (error) => {
      console.error("Error sending response:", error);
      toast.error(error.message || "Failed to send response");
    },
  });
};

// Hook to add admin note
export const useAddMessageNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }) => contactMessagesApi.addNote(id, note),
    onSuccess: (data, variables) => {
      toast.success("Note added successfully");

      // Invalidate and refetch the specific message
      queryClient.invalidateQueries({
        queryKey: contactMessagesKeys.detail(variables.id),
      });

      // Optionally invalidate the list to show updated notes count
      queryClient.invalidateQueries({ queryKey: contactMessagesKeys.lists() });
    },
    onError: (error) => {
      console.error("Error adding note:", error);
      toast.error(error.message || "Failed to add note");
    },
  });
};

// Hook to bulk update message status
export const useBulkUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageIds, status }) =>
      contactMessagesApi.bulkUpdateStatus(messageIds, status),
    onSuccess: () => {
      toast.success("Messages updated successfully");

      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: contactMessagesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: contactMessagesKeys.unreadCount(),
      });
      queryClient.invalidateQueries({ queryKey: contactMessagesKeys.stats() });
    },
    onError: (error) => {
      console.error("Error bulk updating messages:", error);
      toast.error(error.message || "Failed to update messages");
    },
  });
};

// Hook to send a new contact message (for public use)
export const useSendContactMessage = () => {
  return useMutation({
    mutationFn: (messageData) => contactMessagesApi.sendMessage(messageData),
    onSuccess: () => {
      toast.success("Message sent successfully! We will get back to you soon.");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    },
  });
};
