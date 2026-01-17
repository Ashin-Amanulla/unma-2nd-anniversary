import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FormField, OtpInput, CaptchaVerification } from "./FormComponents";
import AttendeeCounter from "./AttendeeCounter";
import registrationsApi from "../../api/registrationsApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../../styles/phone-input.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  jnvSchools,
  indianStatesOptions,
  KERALA_DISTRICTS,
} from "../../assets/data";
import { usePayment } from "../../hooks/usePayment";
import { useNavigate } from "react-router-dom";
import FinancialDifficultyDialog from "./FinancialDifficultyDialog";

// Initialize countries data
countries.registerLocale(enLocale);

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const QuickRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [registrationId, setRegistrationId] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showFinancialDifficultyDialog, setShowFinancialDifficultyDialog] =
    useState(false);
  const { isPaymentProcessing, initiatePayment } = usePayment();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      // Personal Details
      name: "",
      email: "",
      contactNumber: "",
      whatsappNumber: "",
      school: "",
      customSchoolName: "",
      yearOfPassing: "",
      country: "IN",
      stateUT: "Kerala",
      district: null,
      bloodGroup: "",
      verificationQuizPassed: false,

      // Event Attendance
      isAttending: true,
      attendees: {
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
      },
      eventParticipation: [],
      participationDetails: "",

      // Financial
      willContribute: true,
      contributionAmount: 0,
      proposedAmount: 0,
      paymentStatus: "pending",
      registrationStatus: "complete",
    },
  });

  const watchedValues = watch();

  // Calculate payment amount based on attendees (same logic as AlumniRegistrationForm)
  useEffect(() => {
    if (watchedValues.isAttending && watchedValues.attendees) {
      const attendees = watchedValues.attendees;
      const yearOfPassing = parseInt(watchedValues.yearOfPassing);
      const isRecentGraduate = yearOfPassing >= 2022 && yearOfPassing <= 2025;

      const adultCount =
        (attendees?.adults?.veg || 0) + (attendees?.adults?.nonVeg || 0);
      const teenCount =
        (attendees?.teens?.veg || 0) + (attendees?.teens?.nonVeg || 0);
      const childCount =
        (attendees?.children?.veg || 0) + (attendees?.children?.nonVeg || 0);

      // Calculate total expense based on recent graduate status
      const totalExpense = isRecentGraduate
        ? (adultCount - 1) * 500 + 350 + teenCount * 350 + childCount * 350
        : adultCount * 500 + teenCount * 350 + childCount * 350;

      setValue("proposedAmount", totalExpense);
      setValue("contributionAmount", totalExpense);
    }
  }, [
    watchedValues.isAttending,
    watchedValues.attendees,
    watchedValues.yearOfPassing,
    setValue,
  ]);

  // Handle OTP verification
  const handleEmailVerification = (verified, token, regId) => {
    if (verified) {
      setEmailVerified(true);
      setVerificationToken(token);
      if (regId) setRegistrationId(regId);
      toast.success("Email verified successfully!");
    }
  };

  // Handle submission as financial difficulty without payment
  const handleFinancialDifficultySubmission = async () => {
    try {
      setIsSubmitting(true);

      // Get form data from watched values
      const formData = watchedValues;
      const contributionAmount = formData.contributionAmount || 0;

      // Prepare registration data for financial difficulty case
      const registrationData = {
        ...formData,
        registrationType: "Alumni",
        emailVerified: true,
        formDataStructured: {
          verification: {
            emailVerified: true,
            email: formData.email,
            contactNumber: formData.contactNumber,
          },
          personalInfo: {
            name: formData.name,
            email: formData.email,
            contactNumber: formData.contactNumber,
            whatsappNumber: formData.whatsappNumber,
            school: formData.school,
            customSchoolName: formData.customSchoolName,
            yearOfPassing: formData.yearOfPassing,
            country: formData.country,
            stateUT: formData.stateUT,
            district: formData.district,
            bloodGroup: formData.bloodGroup,
          },
          eventAttendance: {
            isAttending: formData.isAttending,
            attendees: formData.attendees,
            eventParticipation: formData.eventParticipation,
            participationDetails: formData.participationDetails,
          },
          financial: {
            willContribute: formData.willContribute,
            contributionAmount: contributionAmount,
            proposedAmount: formData.proposedAmount,
            paymentStatus: "financial-difficulty",
            paymentId: null,
            registrationStatus: "incomplete",
          },
        },
        formSubmissionComplete: true,
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        currentStep: 3,
        paymentStatus: "financial-difficulty",
        registrationStatus: "incomplete",
      };

      // Send to backend
      const registrationResponse = await registrationsApi.tempQuickRegistration(
        registrationData
      );
      console.log(registrationResponse.data);
      let registrationId = registrationResponse.data._id;

      // Complete the registration with financial difficulty status
      const payload = {
        paymentStatus: "financial-difficulty",
        paymentId: null,
        paymentDetails: JSON.stringify({
          type: "financial-difficulty",
          amount: contributionAmount,
          timestamp: new Date().toISOString(),
        }),
        formDataStructured: registrationData.formDataStructured,
        formSubmissionComplete: true,
        step1Complete: true,
        step2Complete: true,
        step3Complete: true,
        currentStep: 3,
      };

      const finalResponse = await registrationsApi.createQuickRegistration(
        payload,
        registrationId
      );
      console.log(finalResponse);

      if (finalResponse.status === "success") {
        toast.info(
          "Registration submitted with financial assistance request. Our team will review your case."
        );

        // Navigate to pending registration page
        navigate("/registration-pending", {
          state: {
            school: formData.school,
            name: formData.name,
            email: formData.email,
            contactNumber: formData.contactNumber,
            paymentStatus: "financial-difficulty",
            contributionAmount: contributionAmount,
          },
        });
      }
    } catch (error) {
      console.error("Financial difficulty submission error:", error);
      toast.error("Registration submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment and submission
  const handlePaymentAndSubmit = async () => {
    if (!emailVerified) {
      toast.error("Please complete all verifications before submitting");
      return;
    }

    // Get form data from watched values
    const formData = watchedValues;

    // Validate form data
    // const { validateQuickRegistration } = await import(
    //   "../../zod-form-validators/quickRegistrationForm"
    // );
    // const validationResult = validateQuickRegistration(formData);

    // if (!validationResult.success) {
    //   toast.error("Please fix all validation errors before submitting" + validationResult.errors);
    //   console.error("Validation errors:", validationResult.errors);
    //   return;
    // }

    // Check if payment amount is valid
    const contributionAmount = formData.contributionAmount || 0;
    if (contributionAmount <= 0) {
      toast.error("Please enter a contribution amount (minimum ₹1)");
      return;
    }

    // Check if amount meets minimum requirement
    if (contributionAmount < formData.proposedAmount) {
      // Show financial difficulty dialog instead of proceeding with payment
      setShowFinancialDifficultyDialog(true);
      return;
    }

    //temperory save registration data
    const registrationData = {
      ...formData,
      registrationType: "Alumni",
      emailVerified: true,
      formDataStructured: {
        verification: {
          emailVerified: true,
          email: formData.email,
          contactNumber: formData.contactNumber,
        },
        personalInfo: {
          name: formData.name,
          email: formData.email,
          contactNumber: formData.contactNumber,
          whatsappNumber: formData.whatsappNumber,
          school: formData.school,
          customSchoolName: formData.customSchoolName,
          yearOfPassing: formData.yearOfPassing,
          country: formData.country,
          stateUT: formData.stateUT,
          district: formData.district,
          bloodGroup: formData.bloodGroup,
        },
        eventAttendance: {
          isAttending: formData.isAttending,
          attendees: formData.attendees,
          eventParticipation: formData.eventParticipation,
          participationDetails: formData.participationDetails,
        },
        financial: {
          willContribute: formData.willContribute,
          contributionAmount: formData.contributionAmount,
          proposedAmount: formData.proposedAmount,
          paymentStatus: "pending",
          paymentId: null,
          registrationStatus: "incomplete",
        },
      },
      formSubmissionComplete: false,
      step1Complete: false,
      step2Complete: false,
      step3Complete: false,
      currentStep: 1,
    };
    //send backend
    const registrationResponse = await registrationsApi.tempQuickRegistration(
      registrationData
    );
    console.log(registrationResponse.data);
    let registrationId = registrationResponse.data._id;

    try {
      // Initiate payment with Razorpay
      await initiatePayment({
        amount: contributionAmount,
        name: formData.name,
        email: formData.email,
        contact: formData.contactNumber,
        currency: "INR",
        notes: {
          registrationType: "Quick Alumni",
          isAttending: formData.isAttending ? "Yes" : "No",
        },
        onSuccess: async (paymentResponse) => {
          // Process payment confirmation and submit registration
          console.log(paymentResponse);
          try {
            setIsSubmitting(true);

            // Determine payment status based on contribution amount
            const paymentStatus =
              contributionAmount >= formData.proposedAmount
                ? "Completed"
                : "financial-difficulty";

            const payload = {
              paymentStatus: paymentStatus,
              paymentId: paymentResponse.razorpay_payment_id,
              paymentDetails: JSON.stringify(paymentResponse),
              formDataStructured: {
                verification: {
                  emailVerified: true,
                  email: formData.email,
                  contactNumber: formData.contactNumber,
                },
                personalInfo: {
                  name: formData.name,
                  email: formData.email,
                  contactNumber: formData.contactNumber,
                  whatsappNumber: formData.whatsappNumber,
                  school: formData.school,
                  customSchoolName: formData.customSchoolName,
                  yearOfPassing: formData.yearOfPassing,
                  country: formData.country,
                  stateUT: formData.stateUT,
                  district: formData.district,
                  bloodGroup: formData.bloodGroup,
                },
                eventAttendance: {
                  isAttending: formData.isAttending,
                  attendees: formData.attendees,
                  eventParticipation: formData.eventParticipation,
                  participationDetails: formData.participationDetails,
                },

                financial: {
                  contributionAmount: formData.contributionAmount,
                  proposedAmount: formData.proposedAmount,
                  paymentStatus: paymentStatus,
                  paymentId: paymentResponse.razorpay_payment_id,
                  registrationStatus:
                    contributionAmount >= formData.proposedAmount
                      ? "complete"
                      : "incomplete",
                },
              },
              formSubmissionComplete: true,
              step1Complete: true,
              step2Complete: true,
              step3Complete: true,
              currentStep: 3,
            };

            const registrationResponse =
              await registrationsApi.createQuickRegistration(
                payload,
                registrationId
              );
            console.log(registrationResponse);

            if (registrationResponse.status === "success") {
              if (paymentStatus === "Completed") {
                toast.success(
                  "🎉 Payment successful and registration completed!"
                );

                // Navigate to payment success page with registration data
                navigate("/registration-success?type=quick-alumni", {
                  state: {
                    registrationData: {
                      name: formData.name,
                      email: formData.email,
                      contactNumber: formData.contactNumber,
                      contributionAmount: formData.contributionAmount,
                      paymentStatus: paymentStatus,
                      paymentId: paymentResponse.razorpay_payment_id,
                    },
                  },
                });
              } else {
                toast.info(
                  "Registration submitted with financial assistance request. Our team will review your case."
                );

                // Navigate to pending registration page for financial difficulty cases
                navigate("/registration-pending", {
                  state: {
                    school: formData.school,
                    name: formData.name,
                    email: formData.email,
                    contactNumber: formData.contactNumber,
                    paymentStatus: paymentStatus,
                    contributionAmount: formData.contributionAmount,
                  },
                });
              }
            }
          } catch (error) {
            console.error("Registration submission error:", error);
            toast.error(
              "Payment successful but registration failed. Please contact support."
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          toast.error("Payment failed. Please try again.");
        },
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  // Handle form submission (kept for compatibility)
  const onSubmit = async (data) => {
    // This function is no longer used but kept for compatibility
    await handlePaymentAndSubmit();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Quick Registration
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Complete your registration in just a few minutes
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
              Personal Details
            </h2>

            {/* Special schools information box */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <FormField
                label="Full Name"
                name="name"
                type="text"
                control={control}
                errors={errors}
                required
                placeholder="Enter your full name"
              />

              <FormField
                label="Email Address"
                name="email"
                type="email"
                control={control}
                errors={errors}
                required
                placeholder="Enter your email"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number (WhatsApp)
                </label>
                <PhoneInput
                  country={"in"}
                  value={watch("contactNumber")}
                  onChange={(value) => setValue("contactNumber", value)}
                  placeholder="Enter contact number"
                  preferredCountries={["in", "ae", "us", "gb"]}
                  inputClass={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  containerClass="w-full"
                  dropdownClass="bg-white border border-gray-300 rounded-lg shadow-lg"
                  buttonClass="bg-gray-50 border-gray-300 rounded-l-lg hover:bg-gray-100"
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  enableLongNumbers={true}
                  countryCodeEditable={false}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number (if different from WhatsApp)
                </label>
                <PhoneInput
                  country={"in"}
                  value={watch("whatsappNumber")}
                  onChange={(value) => setValue("whatsappNumber", value)}
                  placeholder="Enter contact number"
                  preferredCountries={["in", "ae", "us", "gb"]}
                  inputClass={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.whatsappNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  containerClass="w-full"
                  dropdownClass="bg-white border border-gray-300 rounded-lg shadow-lg"
                  buttonClass="bg-gray-50 border-gray-300 rounded-l-lg hover:bg-gray-100"
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  enableLongNumbers={true}
                  countryCodeEditable={false}
                />
                {errors.whatsappNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.whatsappNumber.message}
                  </p>
                )}
              </div>

              <FormField
                label="Blood Group (for emergencies)"
                name="bloodGroup"
                type="select"
                control={control}
                errors={errors}
                required
                options={[
                  { value: "A+", label: "A+" },
                  { value: "A-", label: "A-" },
                  { value: "B+", label: "B+" },
                  { value: "B-", label: "B-" },
                  { value: "AB+", label: "AB+" },
                  { value: "AB-", label: "AB-" },
                  { value: "O+", label: "O+" },
                  { value: "O-", label: "O-" },
                  { value: "Others", label: "Others" },
                ]}
                placeholder="Select blood group"
              />

              <FormField
                label="JNV"
                name="school"
                type="select"
                control={control}
                errors={errors}
                required
                options={jnvSchools}
                placeholder="Select your JNV"
              />

              {watch("school") === "JNV Other" && (
                <FormField
                  label="Please specify your JNV's District, State"
                  name="customSchoolName"
                  type="text"
                  control={control}
                  errors={errors}
                  required
                  placeholder="Enter your JNV's District, State"
                />
              )}

              <FormField
                label="Year of Passing 12th grade"
                name="yearOfPassing"
                type="select"
                control={control}
                errors={errors}
                required
                options={Array.from({ length: 2026 - 1993 }, (_, i) => {
                  const year = 1993 + i;
                  return { value: year.toString(), label: year.toString() };
                })}
                placeholder="Select year of passing"
              />

              <FormField
                label="Current country of residence"
                name="country"
                type="select"
                control={control}
                errors={errors}
                required
                options={countryOptions}
                onChange={(selectedOption) => {
                  const countryValue = selectedOption?.value || "";
                  setValue("country", countryValue);
                  if (countryValue !== "IN") {
                    setValue("stateUT", null);
                    setValue("district", null);
                  }
                }}
                placeholder="Type to search countries..."
                isSearchable={true}
                isClearable={false}
                filterOption={(option, inputValue) => {
                  if (!inputValue) return true;
                  const searchText = inputValue.toLowerCase();
                  const label = option.label.toLowerCase();
                  const value = option.value.toLowerCase();
                  return (
                    label.startsWith(searchText) ||
                    label.includes(searchText) ||
                    value.startsWith(searchText)
                  );
                }}
                menuPlacement="auto"
                maxMenuHeight={200}
                noOptionsMessage={({ inputValue }) =>
                  inputValue
                    ? `No countries found matching "${inputValue}"`
                    : "No countries available"
                }
              />

              {watch("country") === "IN" && (
                <FormField
                  label="Current State/UT of residence"
                  name="stateUT"
                  type="select"
                  control={control}
                  errors={errors}
                  required
                  options={indianStatesOptions}
                  placeholder="Type to search states/UTs..."
                  isSearchable={true}
                  isClearable={false}
                  filterOption={(option, inputValue) => {
                    if (!inputValue) return true;
                    const searchText = inputValue.toLowerCase();
                    const label = option.label.toLowerCase();
                    const value = option.value.toLowerCase();
                    return (
                      label.startsWith(searchText) ||
                      label.includes(searchText) ||
                      value.startsWith(searchText)
                    );
                  }}
                  menuPlacement="auto"
                  maxMenuHeight={200}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue
                      ? `No states/UTs found matching "${inputValue}"`
                      : "No states/UTs available"
                  }
                  onChange={(value) => {
                    setValue("stateUT", value);
                    if (value !== "Kerala") {
                      setValue("district", null);
                    }
                  }}
                />
              )}

              {watch("stateUT") === "Kerala" && watch("country") === "IN" && (
                <FormField
                  label="Current District of residence"
                  name="district"
                  type="select"
                  control={control}
                  errors={errors}
                  required
                  options={KERALA_DISTRICTS}
                  placeholder="Type to search districts..."
                  isSearchable={true}
                  isClearable={false}
                  filterOption={(option, inputValue) => {
                    if (!inputValue) return true;
                    const searchText = inputValue.toLowerCase();
                    const label = option.label.toLowerCase();
                    const value = option.value.toLowerCase();
                    return (
                      label.startsWith(searchText) ||
                      label.includes(searchText) ||
                      value.startsWith(searchText)
                    );
                  }}
                  menuPlacement="auto"
                  maxMenuHeight={200}
                  noOptionsMessage={({ inputValue }) =>
                    inputValue
                      ? `No districts found matching "${inputValue}"`
                      : "No districts available"
                  }
                />
              )}
            </div>

            {/* Email OTP Verification */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <OtpInput
                onVerify={handleEmailVerification}
                email={watchedValues.email}
                phone={watchedValues.contactNumber}
                isEnabled={
                  !!watchedValues.email && !!watchedValues.contactNumber
                }
                isVerified={emailVerified}
              />
            </div>
          </motion.div>

          {/* Event Attendance Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
              Event Attendance
            </h2>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Controller
                  name="isAttending"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="isAttending"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  )}
                />
                <label
                  htmlFor="isAttending"
                  className="text-base font-medium text-gray-700"
                >
                  I will be attending the event
                </label>
              </div>

              {watchedValues.isAttending && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-3">
                      Number of Attendees
                    </h4>
                    <AttendeeCounter
                      values={watchedValues.attendees}
                      onChange={(newAttendees) =>
                        setValue("attendees", newAttendees)
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      label="Event Participation"
                      name="eventParticipation"
                      type="multiselect"
                      control={control}
                      errors={errors}
                      options={[
                        {
                          value: "Cultural Program",
                          label: "Cultural Program",
                        },
                        { value: "Sports Event", label: "Sports Event" },
                        { value: "Workshop", label: "Workshop" },
                        { value: "Seminar", label: "Seminar" },
                        { value: "Networking", label: "Networking" },
                        { value: "Other", label: "Other" },
                      ]}
                      placeholder="Select participation areas"
                    />

                    <FormField
                      label="Participation Details"
                      name="participationDetails"
                      type="textarea"
                      control={control}
                      errors={errors}
                      placeholder="Provide additional details about your participation"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-3">
              Payment Details
            </h2>

            <div className="space-y-6">
              {/* Payment Information Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Payment Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Payment is mandatory for registration. The amount is
                        calculated based on your attendance and age groups.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculated Amount Display */}
              {watchedValues.isAttending &&
                watchedValues.proposedAmount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      Calculated Payment Amount
                    </h4>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex justify-between">
                        <span>Adults (₹500 each):</span>
                        <span>
                          ₹
                          {(watchedValues.attendees?.adults?.veg || 0) +
                            (watchedValues.attendees?.adults?.nonVeg || 0)}{" "}
                          × 500 = ₹
                          {((watchedValues.attendees?.adults?.veg || 0) +
                            (watchedValues.attendees?.adults?.nonVeg || 0)) *
                            500}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Teens (₹350 each):</span>
                        <span>
                          ₹
                          {(watchedValues.attendees?.teens?.veg || 0) +
                            (watchedValues.attendees?.teens?.nonVeg || 0)}{" "}
                          × 350 = ₹
                          {((watchedValues.attendees?.teens?.veg || 0) +
                            (watchedValues.attendees?.teens?.nonVeg || 0)) *
                            350}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Children (₹350 each):</span>
                        <span>
                          ₹
                          {(watchedValues.attendees?.children?.veg || 0) +
                            (watchedValues.attendees?.children?.nonVeg ||
                              0)}{" "}
                          × 350 = ₹
                          {((watchedValues.attendees?.children?.veg || 0) +
                            (watchedValues.attendees?.children?.nonVeg || 0)) *
                            350}
                        </span>
                      </div>
                      {watchedValues.yearOfPassing &&
                        parseInt(watchedValues.yearOfPassing) >= 2022 &&
                        parseInt(watchedValues.yearOfPassing) <= 2025 && (
                          <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-100 rounded">
                            Recent graduate discount applied (2022-2025 batches)
                          </div>
                        )}
                      <div className="border-t border-green-300 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span>₹{watchedValues.proposedAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <FormField
                label="Contribution Amount (₹)"
                name="contributionAmount"
                type="number"
                control={control}
                errors={errors}
                required
                min={1}
                value={watchedValues.contributionAmount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setValue("contributionAmount", value);
                }}
                placeholder="Enter contribution amount"
                helperText={`Suggested amount: ₹${
                  watchedValues.proposedAmount || 0
                } (any amount accepted)`}
              />

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  Payment Process
                </h4>
                <p className="text-sm text-green-700">
                  Payment will be processed immediately when you click "Pay &
                  Submit Registration". You'll be redirected to Razorpay payment
                  gateway to complete your payment securely.
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-700">
                    <strong>Financial Assistance:</strong> If you cannot afford
                    the full amount, you can contribute what you can. Your case
                    will be reviewed for additional support.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="pt-4"
          >
            <button
              type="button"
              onClick={handlePaymentAndSubmit}
              disabled={isSubmitting || !emailVerified || isPaymentProcessing}
              className={`w-full py-4 px-6 text-lg font-semibold rounded-lg transition-all duration-200 ${
                isSubmitting || !emailVerified || isPaymentProcessing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Submitting Registration...</span>
                </div>
              ) : isPaymentProcessing ? (
                <div className="flex items-center justify-center space-x-3">
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <svg
                    className="-ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Pay & Submit Registration</span>
                </div>
              )}
            </button>

            {!emailVerified && (
              <p className="text-sm text-red-600 text-center mt-3">
                Please complete all verifications before submitting
              </p>
            )}
          </motion.div>
        </form>

        {/* Financial Difficulty Dialog */}
        <FinancialDifficultyDialog
          isOpen={showFinancialDifficultyDialog}
          onClose={() => setShowFinancialDifficultyDialog(false)}
          totalExpense={watchedValues.proposedAmount || 0}
          contributionAmount={watchedValues.contributionAmount || 0}
          userSchool={watchedValues.school || "your school"}
          onConfirm={async () => {
            setShowFinancialDifficultyDialog(false);
            await handleFinancialDifficultySubmission();
          }}
          onAddMoreAmount={() => {
            setShowFinancialDifficultyDialog(false);
            // Focus back on contribution amount field
            const contributionField =
              document.getElementsByName("contributionAmount")[0];
            if (contributionField) {
              contributionField.focus();
              contributionField.select();
            }
          }}
        />
      </div>
    </div>
  );
};

export default QuickRegistration;
