import { otpInstance } from "./otpAxios";
import { toast } from "react-toastify";
import axios from "axios";

// Create a separate axios instance for registrations without admin redirect
const registrationAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add only basic response interceptor without admin login redirect
registrationAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors without redirecting to admin login
    console.log("Registration API error intercepted:", error.response?.status);
    return Promise.reject(error);
  }
);

/**
 * Registrations API Service
 * Handles event registration related API calls
 */
const registrationsApi = {
  create: async (registrationId, payload) => {
    try {
      const response = await registrationAxios.post(
        `/registrations/step/${registrationId || "new"}`,
        payload
      );

      return response.data;
    } catch (error) {
      console.error("Registration API error:", error);

      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { message: error.message };
      } else {
        throw { message: "Registration failed" };
      }
    }
  },

  submitWithoutPayment: async (registrationId, payload) => {
    try {
      const response = await registrationAxios.post(
        `/registrations/step/${registrationId || "new"}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to submit without payment" }
      );
    }
  },

  verifyOtp: async (email, phone, otp, update = false) => {
    try {
      const response = await otpInstance.post("/registrations/verify-otp", {
        email,
        contactNumber: phone,
        otp,
        update,
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return {
          status: "error",
          message:
            error.response.data.message || "Invalid OTP. Please try again.",
          verified: false,
        };
      }
      throw new Error(error.response?.data?.message || "Failed to verify OTP");
    }
  },

  processPayment: async (registrationId, paymentDetails) => {
    try {
      const response = await registrationAxios.post(
        `/registrations/${registrationId}/payment`,
        paymentDetails
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Payment processing failed" };
    }
  },

  sendOtp: async (email, contactNumber, update = false) => {
    try {
      const response = await registrationAxios.post("/registrations/send-otp", {
        email,
        contactNumber,
        update,
      });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      throw error.response?.data || { message: "Failed to send OTP" };
    }
  },

  transactionRegister: async (registrationId, payload) => {
    try {
      const response = await registrationAxios.post(
        `/registrations/transaction/${registrationId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to register transaction" }
      );
    }
  },

  getByContact: async (email, contactNumber) => {
    try {
      const response = await registrationAxios.post(
        "/registrations/get-by-contact",
        {
          email,
          contactNumber,
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch registration data" }
      );
    }
  },

  updateRegistration: async (registrationId, payload) => {
    try {
      const response = await registrationAxios.put(
        `/registrations/${registrationId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to update registration" }
      );
    }
  },

  addMoreAmount: async (registrationId, payload) => {
    try {
      const response = await registrationAxios.patch(
        `/registrations/${registrationId}/add-more-amount`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to add more amount" };
    }
  },
  staffRegistration: async (registrationId, payload) => {
    try {
      const response = await registrationAxios.post(
        `/registrations/staff/${registrationId || "new"}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to staff registration" };
    }
  },
  createQuickRegistration: async (payload, registrationId) => {
    try {
      const response = await registrationAxios.post(
        `/registrations/quick-registration/${registrationId}`,
        payload
      );
      console.log(response);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to create quick registration",
        }
      );
    }
  },
  tempQuickRegistration: async (payload) => {
    try {
      const response = await registrationAxios.post(
        "/registrations/temp-quick-registration",
        payload
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Failed to create quick registration",
        }
      );
    }
  },

  getById: async (id) => {
    try {
      const response = await registrationAxios.get(
        `/registrations/feedback/${id}`
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch registration data" }
      );
    }
  },
};

export default registrationsApi;
