import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../styles/phone-input.css";
import "../styles/date-time-pickers.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import registrationsApi from "../api/registrationsApi";
import { AlumniUpdateSchema } from "../zod-form-validators/alumniUpdateForm";
import {
  FormSection,
  FormField,
  OtpInput,
  NavigationButtons,
  MobileProgressIndicator,
} from "../components/registration/FormComponents";
import StepIndicator from "../components/registration/StepIndicator";
import { jnvSchools, indianStatesOptions } from "../assets/data";
import {
  MENTORSHIP_OPTIONS,
  TRAINING_OPTIONS,
  SEMINAR_OPTIONS,
  TSHIRT_SIZES,
  DEFAULT_TSHIRT_SIZES,
  PROFESSION_OPTIONS,
  KERALA_DISTRICTS,
  EVENT_PARTICIPATION_OPTIONS,
} from "../assets/data";
import { getPincodeDetails } from "../api/pincodeApi";
import { useNavigate } from "react-router-dom";

// Initialize countries data
countries.registerLocale(enLocale);
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const AlumniUpdate = () => {
  const [step, setStep] = useState("login"); // login, verify, view
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [showEventContributionModal, setShowEventContributionModal] =
    useState(false);
  const [eventContributionAmount, setEventContributionAmount] = useState("");
  const formRef = useRef(null);
  const navigate = useNavigate();

  // Helper function to format complex values for display
  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "Not provided";
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.join(", ");
      }

      // Handle nested objects - recursively format them
      const formatted = Object.entries(value)
        .filter(([_, val]) => val !== null && val !== undefined && val !== "")
        .map(([key, val]) => {
          const formattedKey = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          // If the value is also an object, format it recursively
          if (typeof val === "object" && val !== null && !Array.isArray(val)) {
            const nestedFormatted = Object.entries(val)
              .filter(
                ([_, nestedVal]) =>
                  nestedVal !== null &&
                  nestedVal !== undefined &&
                  nestedVal !== ""
              )
              .map(([nestedKey, nestedVal]) => {
                const nestedFormattedKey = nestedKey
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());
                return `${nestedFormattedKey}: ${nestedVal}`;
              })
              .join(", ");
            return `${formattedKey}: ${nestedFormatted}`;
          }

          return `${formattedKey}: ${val}`;
        })
        .join(", ");

      return formatted || "Not provided";
    }

    return String(value);
  };

  // Helper function to check if a value should be displayed
  const shouldDisplayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return false;
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      // For objects, check if any nested values exist
      return Object.values(value).some((val) => {
        if (val === null || val === undefined || val === "") {
          return false;
        }
        if (typeof val === "object" && !Array.isArray(val)) {
          return Object.values(val).some(
            (nestedVal) =>
              nestedVal !== null && nestedVal !== undefined && nestedVal !== ""
          );
        }
        return true;
      });
    }

    return true;
  };

  // Calculate minimum fee based on registration and event attendance
  const calculateMinimumFee = (data) => {
    let totalAmount = 0;

    // Base registration fee
    totalAmount += 0; // Base fee

    // Event attendance fees - count attendees from nested structure
    if (data.eventAttendance && data.eventAttendance.attendees) {
      const attendees = data.eventAttendance.attendees;

      // Count adults (veg + nonVeg)
      if (attendees.adults) {
        const adultCount =
          (attendees.adults.veg || 0) + (attendees.adults.nonVeg || 0);
        totalAmount += adultCount * 500; // ₹500 per adult
      }

      // Count teens (veg + nonVeg)
      if (attendees.teens) {
        const teenCount =
          (attendees.teens.veg || 0) + (attendees.teens.nonVeg || 0);
        totalAmount += teenCount * 500; // ₹500 per teen
      }

      // Count children (veg + nonVeg)
      if (attendees.children) {
        const childrenCount =
          (attendees.children.veg || 0) + (attendees.children.nonVeg || 0);
        totalAmount += childrenCount * 300; // ₹300 per child
      }
      //school year above 2023, 150 rs flat discount
      if (data.yearOfPassing && data.yearOfPassing > 2023) {
        totalAmount -= 150;
      }

      // Toddlers are free (₹0)
      // if (attendees.toddlers) {
      //   const toddlerCount = (attendees.toddlers.veg || 0) + (attendees.toddlers.nonVeg || 0);
      //   totalAmount += toddlerCount * 0; // Free for toddlers
      // }
    }

    return totalAmount;
  };

  const handleSendOtp = async () => {
    if (!email && !contactNumber) {
      toast.error("Please enter either email or contact number");
      return;
    }

    setIsLoading(true);
    try {
      let res = await registrationsApi.sendOtp(email, contactNumber, true);
      console.log("res", res);
      setOtpSent(true);
      setStep("verify");
      toast.success("OTP sent successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    setIsLoading(true);
    try {
      const result = await registrationsApi.verifyOtp(
        email,
        contactNumber,
        otp,
        true
      );
      if (result.verified) {
        // Fetch registration data
        const response = await registrationsApi.getByContact(
          email,
          contactNumber
        );
        setRegistrationData(response.data);
        setStep("view");
        setEmailVerified(true);
        toast.success("OTP verified successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    console.log("handlePayment called");
    console.log(
      "registrationData.paymentStatus:",
      registrationData.paymentStatus
    );

    if (registrationData.paymentStatus === "Completed") {
      toast.info("Payment already completed!");
      return;
    }

    // Calculate minimum fee
    const data = registrationData.formDataStructured;
    const calculatedFee = calculateMinimumFee(data);
    console.log("calculatedFee:", calculatedFee);

    setCalculatedAmount(calculatedFee);
    setPaymentAmount(calculatedFee.toString());
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    console.log("paymentAmount", paymentAmount);
    setIsLoading(true);
    try {
      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentAmount * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "UNMA 2026",
        description: "Registration Payment",
        image: "/logo.png",
        handler: async function (response) {
          try {
            // Update registration with payment details
            await registrationsApi.updateRegistration(registrationData._id, {
              paymentStatus: "Completed",
              paymentAmount: paymentAmount,
              paymentMethod: "Razorpay",
              transactionId: response.razorpay_payment_id,
            });

            toast.success("Payment successful! Registration completed.");
            setShowPaymentModal(false);

            // Refresh registration data
            const updatedResponse = await registrationsApi.getByContact(
              email,
              contactNumber
            );
            setRegistrationData(updatedResponse.data);
          } catch (error) {
            toast.error("Failed to update registration after payment");
          }
        },
        prefill: {
          name: registrationData.formDataStructured?.personalInfo?.name || "",
          email:
            registrationData.formDataStructured?.personalInfo?.email || email,
          contact:
            registrationData.formDataStructured?.personalInfo?.contactNumber ||
            contactNumber,
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initialize payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventContribution = () => {
    // Open modal for additional event contribution
    setEventContributionAmount("");
    setShowEventContributionModal(true);
  };

  const handleEventContributionSubmit = async () => {
    if (!eventContributionAmount || eventContributionAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Razorpay for event contribution
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: eventContributionAmount * 100, // Razorpay expects amount in paise
        currency: "INR",
        name: "UNMA 2026",
        description: "Additional Event Contribution",
        image: "/logo.png",
        handler: async function (response) {
          try {
            // Update registration with additional contribution
            await registrationsApi.addMoreAmount(registrationData._id, {
              amount: eventContributionAmount,
              paymentMethod: "Razorpay",
              transactionId: response.razorpay_payment_id,
            });

            toast.success("Additional contribution successful!");
            setShowEventContributionModal(false);

            // Refresh registration data
            const updatedResponse = await registrationsApi.getByContact(
              email,
              contactNumber
            );
            setRegistrationData(updatedResponse.data);
          } catch (error) {
            toast.error("Failed to update registration after contribution");
          }
        },
        prefill: {
          name: registrationData.formDataStructured?.personalInfo?.name || "",
          email:
            registrationData.formDataStructured?.personalInfo?.email || email,
          contact:
            registrationData.formDataStructured?.personalInfo?.contactNumber ||
            contactNumber,
        },
        theme: {
          color: "#8B5CF6", // Purple theme for event contribution
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to initialize payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRaiseIssue = () => {
    // Navigate to issue page
    navigate("/report-issue", {
      state: { registrationId: registrationData._id },
    });
  };

  // Login step
  if (step === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
              Alumni Data Update
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Enter your email or contact number to access your registration
              data
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="text-center text-gray-500">OR</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <PhoneInput
                  country={"in"}
                  value={contactNumber}
                  onChange={(phone) => setContactNumber(phone)}
                  inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  containerClass="w-full"
                />
              </div>

              <button
                onClick={handleSendOtp}
                disabled={isLoading || (!email && !contactNumber)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Verify step
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
              Verify OTP
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Enter the OTP sent to your {email ? "email" : "phone"}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || !otp}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={() => setStep("login")}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // View registration data step
  if (step === "view" && registrationData) {
    const data = registrationData.formDataStructured;
    const isRegistrationComplete =
      registrationData.paymentStatus === "Completed" &&
      registrationData.formSubmissionComplete === true;
    const hasPaid = registrationData.paymentStatus === "Completed";

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-blue-800">
                Your Registration Details
              </h1>
              <button
                onClick={() => setStep("login")}
                className="text-blue-600 hover:text-blue-800"
              >
                Logout
              </button>
            </div>

            {/* Registration Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={`text-lg font-semibold ${
                      registrationData.paymentStatus === "Completed"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Registration Status:{" "}
                    {registrationData.paymentStatus === "Completed"
                      ? "Complete"
                      : "Incomplete"}
                  </h3>
                  <p className="text-gray-600">
                    Registration ID: {registrationData._id}
                  </p>
                </div>
                {/* <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isGeneratingPdf ? "Generating..." : "Download PDF"}
                </button> */}
              </div>
            </div>

            {/* Registration Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Personal Information */}
                  {data.personalInfo &&
                    Object.entries(data.personalInfo).map(([key, value]) => {
                      if (!shouldDisplayValue(value)) return null;
                      return (
                        <tr key={`personal-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Personal Information
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Professional Information */}
                  {data.professional &&
                    Object.entries(data.professional).map(([key, value]) => {
                      if (!shouldDisplayValue(value)) return null;
                      return (
                        <tr key={`professional-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Professional Information
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Event Attendance */}
                  {data.eventAttendance &&
                    Object.entries(data.eventAttendance).map(([key, value]) => {
                      if (!shouldDisplayValue(value)) return null;
                      return (
                        <tr key={`event-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Event Attendance
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Transportation */}
                  {data.transportation &&
                    Object.entries(data.transportation).map(([key, value]) => {
                      if (!shouldDisplayValue(value)) return null;
                      return (
                        <tr key={`transportation-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Transportation
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Accommodation */}
                  {data.accommodation &&
                    Object.entries(data.accommodation).map(([key, value]) => {
                      if (!shouldDisplayValue(value)) return null;
                      return (
                        <tr key={`accommodation-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Accommodation
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Optional Information */}
                  {data.optional &&
                    Object.entries(data.optional).map(([key, value]) => {
                      if (!shouldDisplayValue(value)) return null;
                      return (
                        <tr key={`optional-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Optional Information
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Sponsorship Information */}
                  {data.sponsorship &&
                    Object.entries(data.sponsorship).map(([key, value]) => {
                      if (!shouldDisplayValue(value)) return null;
                      return (
                        <tr key={`sponsorship-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Sponsorship Information
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Financial Information */}
                  {data.financial &&
                    Object.entries(data.financial).map(([key, value]) => {
                      if (
                        !shouldDisplayValue(value) ||
                        key === "willContribute"
                      )
                        return null;
                      return (
                        <tr key={`financial-${key}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Financial Information
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      );
                    })}

                  {/* Payment Information */}
                  {registrationData.paymentStatus && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Payment Information
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Payment Status
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {registrationData.paymentStatus}
                      </td>
                    </tr>
                  )}

                  {registrationData.paymentAmount && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Payment Information
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Payment Amount
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{registrationData.paymentAmount}
                      </td>
                    </tr>
                  )}

                  {registrationData.paymentMethod && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Payment Information
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Payment Method
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {registrationData.paymentMethod}
                      </td>
                    </tr>
                  )}

                  {registrationData.transactionId && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Payment Information
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Transaction ID
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {registrationData.transactionId}
                      </td>
                    </tr>
                  )}

                  {/* Additional Contribution Information */}
                  {registrationData.additionalContribution && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Additional Contributions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Total Additional Contribution
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{registrationData.additionalContribution}
                      </td>
                    </tr>
                  )}

                  {registrationData.lastContributionAmount && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Additional Contributions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Last Contribution Amount
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₹{registrationData.lastContributionAmount}
                      </td>
                    </tr>
                  )}

                  {registrationData.lastContributionTransactionId && (
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Additional Contributions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Last Contribution Transaction ID
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {registrationData.lastContributionTransactionId}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              {!isRegistrationComplete ? (
                <button
                  onClick={handlePayment}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                >
                  Pay & Complete Registration
                </button>
              ) : (
                <button
                  onClick={handleEventContribution}
                  className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 font-medium"
                >
                  Add More Event Contribution
                </button>
              )}

              <button
                onClick={handleRaiseIssue}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 font-medium"
              >
                Raise Issue
              </button>
            </div>
          </motion.div>
        </div>

        {/* Payment Modal - Rendered inside the main view */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Complete Payment
              </h2>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Calculated minimum fee based on your registration:
                </p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-lg font-semibold text-green-600">
                    ₹{calculatedAmount}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  min={calculatedAmount}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum amount: ₹{calculatedAmount}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={
                    isLoading ||
                    !paymentAmount ||
                    paymentAmount < calculatedAmount
                  }
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Contribution Modal */}
        {showEventContributionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Add Event Contribution
              </h2>
              <p className="text-gray-600 mb-4">
                Enter the amount you wish to contribute for the event.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Amount (₹)
                </label>
                <input
                  type="number"
                  value={eventContributionAmount}
                  onChange={(e) => setEventContributionAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter amount"
                  min={0}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEventContributionModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEventContributionSubmit}
                  disabled={
                    isLoading ||
                    !eventContributionAmount ||
                    eventContributionAmount <= 0
                  }
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Add Contribution"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AlumniUpdate;
