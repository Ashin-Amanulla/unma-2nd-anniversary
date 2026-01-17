import axios from "./axios";

/**
 * Contact Messages API Service
 * Handles contact message related API calls
 */
const contactMessagesApi = {

  sendMessage: async (messageData) => {
    try {
      const response = await axios.post(
        "/contact-messages/send-message",
        messageData
      );
      return response.data;
    } catch (error) {
      console.error("Contact message API error:", error);
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Message sending failed" };
      }
    }
  },

  /**
   * Get all contact messages with optional query parameters (admin only)
   * @param {string} queryParams - URL query parameters for filtering
   * @returns {Promise} - Promise with messages data
   */
  getAllMessages: async (queryParams = "") => {
    try {
      const url = queryParams
        ? `/contact-messages?${queryParams}`
        : "/contact-messages";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch messages" };
    }
  },

  /**
   * Get contact message by ID (admin only)
   * @param {string} id - Message ID
   * @returns {Promise} - Promise with message data
   */
  getMessageById: async (id) => {
    try {
      const response = await axios.get(`/contact-messages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch message" };
    }
  },

  /**
   * Update message status (admin only)
   * @param {string} id - Message ID
   * @param {string} status - New status
   * @returns {Promise} - Promise with updated message data
   */
  updateStatus: async (id, status) => {
    try {
      const response = await axios.put(`/contact-messages/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to update message status" }
      );
    }
  },

  /**
   * Respond to a contact message (admin only)
   * @param {string} id - Message ID
   * @param {string} responseMessage - Response message
   * @param {string} responseMethod - Response method (default: email)
   * @returns {Promise} - Promise with response data
   */
  respondToMessage: async (id, responseMessage, responseMethod = "email") => {
    try {
      const response = await axios.post(`/contact-messages/${id}/respond`, {
        responseMessage,
        responseMethod,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send response" };
    }
  },

  /**
   * Add admin note to message (admin only)
   * @param {string} id - Message ID
   * @param {string} note - Admin note
   * @returns {Promise} - Promise with updated message data
   */
  addNote: async (id, note) => {
    try {
      const response = await axios.post(`/contact-messages/${id}/notes`, {
        note,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to add note" };
    }
  },

  /**
   * Get message statistics (admin only)
   * @returns {Promise} - Promise with statistics data
   */
  getStats: async () => {
    try {
      const response = await axios.get("/contact-messages/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch stats" };
    }
  },

  /**
   * Get unread messages count (admin only)
   * @returns {Promise} - Promise with unread count data
   */
  getUnreadCount: async () => {
    try {
      const response = await axios.get("/contact-messages/unread-count");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch unread count" };
    }
  },

  /**
   * Bulk update message status (admin only)
   * @param {Array} messageIds - Array of message IDs
   * @param {string} status - New status
   * @returns {Promise} - Promise with bulk update result
   */
  bulkUpdateStatus: async (messageIds, status) => {
    try {
      const response = await axios.put("/contact-messages/bulk/status", {
        messageIds,
        status,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to bulk update status" };
    }
  },
};

export default contactMessagesApi;
