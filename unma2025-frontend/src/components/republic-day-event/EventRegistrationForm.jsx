import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FormField } from "../registration/FormComponents";
import { republicDayEventFormSchema } from "../../zod-form-validators/republicDayEventForm";
import republicDayEventApi from "../../api/republicDayEventApi";
import { jnvSchools } from "../../assets/data";
import idbiQR from "../../assets/upi/idbi.png";
import fedQR from "../../assets/upi/fed.png";

const EventRegistrationForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in YYYY-MM-DD format for default payment date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(republicDayEventFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      jnvSchool: "",
      jnvOther: "",
      batchYear: "",
      foodChoice: "",
      participateBloodDonation: false,
      participateNationalSong: false,
      joinBoatRide: false,
      readyToVolunteer: false,
      interestedInSponsorship: false,
      familyMembersCount: "",
      paymentMethod: "IDBI Bank",
      transactionId: "",
      amountPaid: "",
      paymentDate: getTodayDate(),
    },
  });

  const watchedJnvSchool = watch("jnvSchool");
  const watchedBoatRide = watch("joinBoatRide");
  const watchedPaymentMethod = watch("paymentMethod");

  // Handle validation errors and show toast notifications
  const onInvalid = (errors) => {
    // Get the first error message to show in toast
    const errorEntries = Object.entries(errors);
    
    if (errorEntries.length > 0) {
      const [, firstError] = errorEntries[0];
      const errorMessage = firstError?.message || "Please check the form for errors";
      toast.error(errorMessage);
    } else {
      toast.error("Please fill in all required fields correctly");
    }
  };

  const onSubmit = async (data) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert familyMembersCount properly - handle empty string, null, undefined, and 0
      let familyMembersCount = null;
      const familyCountValue = data.familyMembersCount;
      
      // Check if value exists and is not empty string
      if (familyCountValue !== "" && familyCountValue !== null && familyCountValue !== undefined) {
        // Convert to number - handle both string and number inputs
        const numValue = typeof familyCountValue === "string" 
          ? Number(familyCountValue.trim()) 
          : Number(familyCountValue);
        
        // Only set if it's a valid number (including 0)
        if (!isNaN(numValue) && numValue >= 0) {
          familyMembersCount = numValue;
        }
      }

      const submissionData = {
        ...data,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        familyMembersCount: familyMembersCount,
        // Ensure boolean values are explicitly set - use the actual values from form
        participateBloodDonation: data.participateBloodDonation ?? false,
        participateNationalSong: data.participateNationalSong ?? false,
        joinBoatRide: data.joinBoatRide ?? false,
        readyToVolunteer: data.readyToVolunteer ?? false,
        interestedInSponsorship: data.interestedInSponsorship ?? false,
      };

      if (data.jnvSchool !== "JNV Other") {
        submissionData.jnvOther = "";
      }

      const response = await republicDayEventApi.createRegistration(
        submissionData
      );

      if (response.status === "success") {
        toast.success("Registration submitted successfully!");
        navigate("/republic-day-event/success", {
          state: {
            registrationData: response.data,
          },
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.message ||
        error.errors?.[0] ||
        "Failed to submit registration. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 text-gray-800">
        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-4">
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
            placeholder="Enter your email address"
          />
        </div>

        <FormField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          control={control}
          errors={errors}
          required
          placeholder="Enter your 10-digit phone number"
        />

        {/* UNMA Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label="Your parent JNV"
            name="jnvSchool"
            type="select"
            control={control}
            errors={errors}
            required
            options={jnvSchools}
            placeholder="Select your JNV"
          />

          <FormField
            label="JNV Batch (Year of Passing 12th grade)"
            name="batchYear"
            type="select"
            control={control}
            errors={errors}
            options={Array.from({ length: 2025 - 1993 + 1 }, (_, i) => {
              const year = 1993 + i;
              return { value: year.toString(), label: year.toString() };
            })}
            placeholder="Select year"
          />
        </div>

        {watchedJnvSchool === "JNV Other" && (
          <FormField
            label="Please specify your JNV"
            name="jnvOther"
            type="text"
            control={control}
            errors={errors}
            required
            placeholder="Enter your JNV name"
          />
        )}

        {/* Food Choice */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Food Choice <span className="text-red-500">*</span>
          </label>
          <Controller
            name="foodChoice"
            control={control}
            render={({ field }) => (
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="Veg"
                    checked={field.value === "Veg"}
                    className="mr-2"
                  />
                  <span>Veg</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...field}
                    value="Non-Veg"
                    checked={field.value === "Non-Veg"}
                    className="mr-2"
                  />
                  <span>Non-Veg</span>
                </label>
              </div>
            )}
          />
          {errors.foodChoice && (
            <p className="mt-1 text-sm text-red-600">
              {errors.foodChoice.message}
            </p>
          )}
        </div>

        {/* Family Members Count */}
        <FormField
          label="Any family members/friends joining you for the event, if so please mention the count (excluding you) for making arrangements"
          name="familyMembersCount"
          type="number"
          control={control}
          errors={errors}
          min={0}
          placeholder="Enter number of family members/friends (0 if none)"
        />

        {/* Participation Options - Attractive Section */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Join the Celebration! 🎉
            </h3>
            <p className="text-gray-600 text-sm">
              Be a part of these exciting activities and make UNMA 2nd anniversary memorable
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-all hover:shadow-md">
              <Controller
                name="participateBloodDonation"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="participateBloodDonation"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="participateBloodDonation" className="ml-2 text-gray-700">
                      Be a Hero, Save Lives — <strong>I'll donate blood at the UNMA Blood Donation Drive</strong>
                    </label>
                  </div>
                )}
              />
              {errors.participateBloodDonation && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.participateBloodDonation.message}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-purple-100 hover:border-purple-300 transition-all hover:shadow-md">
              <Controller
                name="participateNationalSong"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="participateNationalSong"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="participateNationalSong" className="ml-2 text-gray-700">
                      Unite Through Music — <strong>Ready to practice and participate in the National Integration Song</strong>
                    </label>
                  </div>
                )}
              />
              {errors.participateNationalSong && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.participateNationalSong.message}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-pink-100 hover:border-pink-300 transition-all hover:shadow-md">
              <Controller
                name="joinBoatRide"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="joinBoatRide"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="joinBoatRide" className="ml-2 text-gray-700">
                      Experience the Thrill — <strong>Join the UNMA Family Boat Ride </strong> to Deepen Our Friendship
                    </label>
                  </div>
                )}
              />
              {errors.joinBoatRide && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.joinBoatRide.message}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-100 hover:border-green-300 transition-all hover:shadow-md">
              <Controller
                name="readyToVolunteer"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="readyToVolunteer"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="readyToVolunteer" className="ml-2 text-gray-700">
                      Count Me In — <strong>Happy to Volunteer!</strong>
                    </label>
                  </div>
                )}
              />
              {errors.readyToVolunteer && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.readyToVolunteer.message}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4 border border-yellow-100 hover:border-yellow-300 transition-all hover:shadow-md">
              <Controller
                name="interestedInSponsorship"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="interestedInSponsorship"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-5 w-5 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="interestedInSponsorship" className="ml-2 text-gray-700">
                      Interested for <strong>Sponsorship</strong>
                    </label>
                  </div>
                )}
              />
              {errors.interestedInSponsorship && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.interestedInSponsorship.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fees Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-md font-semibold mb-2 text-gray-800">
            Fees & Contribution
          </h3>
          <div className="space-y-1 text-sm text-gray-700 mb-3">
            <p>
              <span className="font-medium">Event Fee:</span> ₹200 per head
            </p>
            {watchedBoatRide && (
              <p>
                <span className="font-medium">Boat Ride Fee:</span> ₹100 per head
              </p>
            )}
            <p className="pt-2 border-t border-blue-300">
              <span className="font-bold text-red-600 text-lg">
                Total: ₹{watchedBoatRide ? 300 : 200} per head
              </span>
              <br />
              <span className="font-bold text-green-600 text-sm">Those who can afford to pay  may please contribute extra to ensure inclusivity.</span>
            </p>
          </div>
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Participants are expected to contribute responsibly.A lower amount is allowed only in exceptional circumstances
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Payment Information
          </h3>
          
          {/* Payment Method Selection - 2 columns in a row */}
          <div className="mb-6">
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Select Payment Method <span className="text-red-500">*</span>
            </label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-4 border-2 border-blue-500 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
                    <input
                      type="radio"
                      {...field}
                      value="IDBI Bank"
                      checked={field.value === "IDBI Bank"}
                      className="mr-3 w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-800">IDBI Bank</span>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      {...field}
                      value="Federal Bank"
                      checked={field.value === "Federal Bank"}
                      className="mr-3 w-4 h-4 text-blue-600"
                    />
                    <span className="font-medium text-gray-800">Federal Bank</span>
                  </label>
                </div>
              )}
            />
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* QR Code and Bank Details - Full Width */}
          <div className="mb-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
            {watchedPaymentMethod === "IDBI Bank" && (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    IDBI Bank Payment Details
                  </h4>
                  <div className="bg-white rounded-lg p-4 inline-block shadow-md">
                    <img
                      src={idbiQR}
                      alt="IDBI Bank QR Code"
                      className="w-80 h-56 mx-auto object-cover"
                    />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">Account Name:</span>
                    <span className="text-gray-800">United Navodayan Malayalee Association UNMA</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">Account No:</span>
                    <span className="text-gray-800 font-mono">0084104000299671</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">IFSC:</span>
                    <span className="text-gray-800 font-mono">IBKL0000084</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">UPI ID:</span>
                    <span className="text-gray-800 font-mono">unma@idbi</span>
                  </div>
                </div>
              </div>
            )}

            {watchedPaymentMethod === "Federal Bank" && (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Federal Bank Payment Details
                  </h4>
                  <div className="bg-white rounded-lg p-4 inline-block shadow-md">
                    <img
                      src={fedQR}
                      alt="Federal Bank QR Code"
                      className="w-80 h-56 mx-auto object-cover"
                    />
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">Account Name:</span>
                    <span className="text-gray-800">United Navodayan Malayalee Association</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">Account No:</span>
                    <span className="text-gray-800 font-mono">10290200017783</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">IFSC:</span>
                    <span className="text-gray-800 font-mono">FDRL0001029</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                    <span className="font-medium text-gray-600">UPI ID:</span>
                    <span className="text-gray-800 font-mono">unma4747@fbl</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Details - Full Width */}
          <div className="space-y-4">
            <FormField
              label="Transaction ID"
              name="transactionId"
              type="text"
              control={control}
              errors={errors}
              placeholder="Enter transaction ID "
            />

            <FormField
              label="Amount Paid (₹) - Enter lower amount if facing financial difficulty"
              name="amountPaid"
              type="number"
              control={control}
              errors={errors}
              required
              min={0}
              placeholder="Enter amount paid "
            />

            <FormField
              label="Date of Payment"
              name="paymentDate"
              type="date"
              control={control}
              errors={errors}
              placeholder="Select payment date"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventRegistrationForm;
