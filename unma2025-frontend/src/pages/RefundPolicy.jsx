import React from "react";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark">
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Refund Policy
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Understand our refund terms and conditions for the UNMA 2026
                reunion registration and services.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition duration-300 cursor-pointer"
                >
                  <HomeIcon className="w-5 h-5" />
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-md border border-gray-200"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">Last updated: January 2025</p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. General Refund Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The UNMA 2026 organizing committee understands that
                  circumstances may change. This refund policy outlines the
                  conditions under which refunds may be processed for event
                  registration, accommodation, and other services.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 font-medium">
                    ⚠️ Important: All refund requests must be submitted in
                    writing via email to summit2025@unma.in with supporting
                    documentation.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Event Registration Refunds
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Early Bird Registration
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    <strong>Before 30 days of event:</strong> 100% refund (minus
                    processing fees)
                  </li>
                  <li>
                    <strong>15-29 days before event:</strong> 75% refund
                  </li>
                  <li>
                    <strong>7-14 days before event:</strong> 50% refund
                  </li>
                  <li>
                    <strong>Less than 7 days before event:</strong> No refund
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Regular Registration
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    <strong>Before 21 days of event:</strong> 75% refund (minus
                    processing fees)
                  </li>
                  <li>
                    <strong>14-20 days before event:</strong> 50% refund
                  </li>
                  <li>
                    <strong>7-13 days before event:</strong> 25% refund
                  </li>
                  <li>
                    <strong>Less than 7 days before event:</strong> No refund
                  </li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800">
                    <strong>Processing Fees:</strong> A processing fee of ₹100
                    per transaction will be deducted from all refunds to cover
                    administrative and payment gateway charges.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Accommodation Refunds
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Accommodation bookings are subject to the terms and conditions
                  of the respective hotels and partners:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Before 15 days of check-in:</strong> 100% refund
                    (minus booking fees)
                  </li>
                  <li>
                    <strong>7-14 days before check-in:</strong> 50% refund
                  </li>
                  <li>
                    <strong>Less than 7 days before check-in:</strong> No refund
                  </li>
                  <li>
                    <strong>No-show:</strong> No refund
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  <em>
                    Note: Accommodation refunds are processed according to the
                    partner hotel's cancellation policy and may vary.
                  </em>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Transportation Refunds
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Bus Transportation:</strong> 100% refund if
                    cancelled 48 hours before departure
                  </li>
                  <li>
                    <strong>Special Transport Services:</strong> Refund subject
                    to third-party vendor policies
                  </li>
                  <li>
                    <strong>Last-minute cancellations:</strong> May incur
                    penalties as per vendor terms
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Medical Emergency Refunds
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We understand that medical emergencies are beyond anyone's
                  control. In case of medical emergencies, we offer special
                  consideration:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    Up to 90% refund may be provided with valid medical
                    documentation
                  </li>
                  <li>
                    Medical certificate from a registered practitioner is
                    required
                  </li>
                  <li>
                    Emergency must be for the registered participant or
                    immediate family member
                  </li>
                  <li>
                    Request must be submitted within 30 days of the incident
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Event Cancellation by Organizers
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In the unfortunate event that UNMA 2026 is cancelled by the
                  organizers due to circumstances beyond our control:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Full Refund:</strong> 100% refund of registration
                    fees (minus processing charges)
                  </li>
                  <li>
                    <strong>Alternative Arrangements:</strong> We will first
                    attempt to reschedule the event
                  </li>
                  <li>
                    <strong>Force Majeure:</strong> Refunds may be affected by
                    force majeure events (natural disasters, government
                    restrictions, etc.)
                  </li>
                  <li>
                    <strong>Third-party Services:</strong> Accommodation and
                    transportation refunds will be processed as per vendor
                    policies
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Refund Process
                </h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  How to Request a Refund
                </h3>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    Send an email to summit2025@unma.in with subject line
                    "Refund Request - [Your Registration ID]"
                  </li>
                  <li>
                    Include your full name, registration details, and reason for
                    refund
                  </li>
                  <li>Attach supporting documents (if applicable)</li>
                  <li>
                    Provide original payment details for refund processing
                  </li>
                </ol>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Processing Timeline
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Review Period:</strong> 5-7 business days to review
                    your request
                  </li>
                  <li>
                    <strong>Approval Notification:</strong> You will be notified
                    of the decision via email
                  </li>
                  <li>
                    <strong>Refund Processing:</strong> 7-14 business days to
                    process approved refunds
                  </li>
                  <li>
                    <strong>Bank Processing:</strong> Additional 3-5 business
                    days for funds to reflect in your account
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Non-Refundable Items
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The following items and services are non-refundable under any
                  circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Processing and convenience fees</li>
                  <li>Merchandise and souvenirs once shipped</li>
                  <li>
                    Special dietary arrangements (after menu finalization)
                  </li>
                  <li>Photography and videography services</li>
                  <li>Personalized items (name badges, certificates)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Transfer Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As an alternative to refunds, you may transfer your
                  registration to another eligible alumni:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    Transfer requests must be made at least 14 days before the
                    event
                  </li>
                  <li>Transfer fee of ₹500 applies</li>
                  <li>New participant must meet eligibility criteria</li>
                  <li>
                    All accommodation and service preferences will be
                    transferred as-is
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Disputes and Appeals
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you disagree with a refund decision:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    You may appeal the decision within 7 days of notification
                  </li>
                  <li>
                    Provide additional supporting documentation if available
                  </li>
                  <li>Appeals will be reviewed by the organizing committee</li>
                  <li>The committee's decision on appeals is final</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  For all refund-related queries and requests:
                  <br />
                  Email: summit2025@unma.in
                  <br />
                  Subject: Refund Query - [Your Name]
                  <br />
                  Website:{" "}
                  <a href="/" className="text-primary hover:text-primary-dark">
                    summit2025.unma.in
                  </a>
                  <br />
                  <br />
                  <em>
                    Please allow 2-3 business days for initial response to
                    refund inquiries.
                  </em>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
