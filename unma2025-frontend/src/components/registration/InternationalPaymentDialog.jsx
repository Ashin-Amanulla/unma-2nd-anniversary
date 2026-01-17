import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£" },
  { value: "AED", label: "AED - UAE Dirham", symbol: "د.إ" },
  { value: "SAR", label: "SAR - Saudi Riyal", symbol: "﷼" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$" },
  { value: "SGD", label: "SGD - Singapore Dollar", symbol: "S$" },
  { value: "QAR", label: "QAR - Qatari Riyal", symbol: "﷼" },
  { value: "OMR", label: "OMR - Omani Rial", symbol: "﷼" },
  { value: "KWD", label: "KWD - Kuwaiti Dinar", symbol: "د.ك" },
  { value: "BHD", label: "BHD - Bahraini Dinar", symbol: ".د.ب" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥" },
  { value: "CHF", label: "CHF - Swiss Franc", symbol: "₣" },
  { value: "OTHER", label: "Other Currency", symbol: "" },
];

const InternationalPaymentDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    currency: "",
    otherCurrency: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Please enter a valid payment amount";
    }

    if (!formData.currency) {
      newErrors.currency = "Please select a currency";
    }

    if (formData.currency === "OTHER" && !formData.otherCurrency.trim()) {
      newErrors.otherCurrency = "Please specify the currency";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      amount: parseFloat(formData.amount),
      currency:
        formData.currency === "OTHER"
          ? formData.otherCurrency
          : formData.currency,
    };

    onSubmit(paymentData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ amount: "", currency: "", otherCurrency: "" });
      setErrors({});
      onClose();
    }
  };

  const selectedCurrency = CURRENCY_OPTIONS.find(
    (c) => c.value === formData.currency
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg transform rounded-lg bg-white p-6 shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                International Payment Details
              </h3>
              {!isSubmitting && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Before proceeding:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • Make sure you have already transferred the amount to the
                      NRE account
                    </li>
                    <li>
                      • Keep your payment receipt ready to email to
                      payment@unma.in
                    </li>
                    <li>• Enter the exact amount you transferred</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }));
                    if (errors.currency) {
                      setErrors((prev) => ({ ...prev, currency: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.currency ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select currency</option>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                )}
              </div>

              {/* Other Currency Input */}
              {formData.currency === "OTHER" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Currency *
                  </label>
                  <input
                    type="text"
                    value={formData.otherCurrency}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        otherCurrency: e.target.value,
                      }));
                      if (errors.otherCurrency) {
                        setErrors((prev) => ({ ...prev, otherCurrency: "" }));
                      }
                    }}
                    placeholder="e.g., MYR, THB, etc."
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.otherCurrency
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.otherCurrency && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.otherCurrency}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">
                      {selectedCurrency?.symbol || formData.otherCurrency || ""}
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }));
                      if (errors.amount) {
                        setErrors((prev) => ({ ...prev, amount: "" }));
                      }
                    }}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.amount ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg
                        className="-ml-1 mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Submit Registration
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Final reminder */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start">
                <svg
                  className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> After submitting, please email
                  your payment receipt to{" "}
                  <span className="font-medium">payment@unma.in</span> with your
                  name and registration details.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default InternationalPaymentDialog;
