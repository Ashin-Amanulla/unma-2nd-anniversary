import api from "./axios";

const documentRequestApi = {
  /**
   * Submit document request
   * @param {Object} data - Request data (name, email, contact, jnvSchool, message, documentType)
   */
  submitRequest: async (data) => {
    try {
      const response = await api.post("/document-request", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to submit document request" };
    }
  },
};

export default documentRequestApi;
