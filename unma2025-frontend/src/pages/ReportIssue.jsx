import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ScrollLink from "../components/ui/ScrollLink";
import { Link } from "react-router-dom";
import issuesApi from "../api/issueApi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const ReportIssue = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  // Handle file upload to S3
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await issuesApi.uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadedFile(response.fileUrl);

      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file. Please try again.");
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = () => {
    setUploadedFile(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = {
        title: data.category, // Using category as title for now
        category: data.category,
        priority: "Medium",
        description: data.description,
        reportedBy: {
          name: data.name || "Anonymous",
          email: data.email,
          phone: data.phone || "",
        },
        attachments: uploadedFile || null,
      };

      // Call API with JSON data
      const response = await issuesApi.create(formData);

      if (response.success) {
        toast.success(
          "Issue reported successfully. We will investigate and resolve it as soon as possible."
        );
        reset();
        setUploadedFile(null);
      } else {
        toast.error(
          "An error occurred while submitting your report. Please try again later."
        );
      }
    } catch (error) {
      toast.error(
        "An error occurred while submitting your report. Please try again later."
      );
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Report an Issue
            </h1>
            <p className="text-white/90 text-lg">
              Let us know about any problems you encounter with the registration
              process or website.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Issue Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type
                </label>
                <select
                  {...register("category", {
                    required: "Please select an issue type",
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select issue type</option>
                  <option value="Registration">Registration Issues</option>
                  <option value="Payment">Payment Problems</option>
                  <option value="Technical">Technical Issues</option>
                  <option value="Content">Content/Information Issues</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Description
                </label>
                <textarea
                  {...register("description", {
                    required: "Please describe the issue",
                    minLength: {
                      value: 20,
                      message: "Please provide more details about the issue",
                    },
                  })}
                  placeholder="Please describe the issue in detail, including steps to reproduce if applicable"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              {/* name  */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* phone number  */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      country={"in"}
                      value={value}
                      onChange={onChange}
                      placeholder="Enter your phone number"
                      preferredCountries={["in", "ae", "us", "gb"]}
                      inputClass="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                      containerClass="w-full"
                      dropdownClass="bg-white border border-gray-300 rounded-lg shadow-lg"
                      buttonClass="bg-gray-50 border-gray-300 rounded-l-lg hover:bg-gray-100"
                    />
                  )}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachment (Optional)
                </label>

                
                  <div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Supported formats: Images, PDF, DOC, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
               

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {uploadProgress}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploading file...
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Submitting Report...
                  </span>
                ) : (
                  "Submit Issue Report"
                )}
              </motion.button>
            </form>

            {/* Additional Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Additional Information
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Our support team will review your issue report and notify you by
                email with the resolution as soon as possible.
              </p>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Common Solutions
            </h3>
            <p className="text-gray-600">
              For payment issues, please ensure your browser is updated and try
              clearing your cache.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
