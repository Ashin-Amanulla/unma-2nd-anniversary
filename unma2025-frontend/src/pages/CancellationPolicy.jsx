import React from "react";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const CancellationPolicy = () => {
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
                Cancellation Policy
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Learn about our cancellation procedures and policies for the
                UNMA 2026 reunion and related services.
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
                  1. Overview
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This cancellation policy applies to all services related to
                  the UNMA 2026 reunion, including event registration,
                  accommodation bookings, transportation services, and any
                  additional services offered through our platform.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-medium">
                    ⚠️ Important: Cancellations must be requested in writing via
                    email to info@unma.in. Phone or verbal cancellations
                    will not be accepted.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Event Registration Cancellation
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Cancellation Timeline
                </h3>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Cancellation Period
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Refund Amount
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Processing Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          30+ days before event
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          90% refund
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          7-10 business days
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          15-29 days before event
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          75% refund
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          7-10 business days
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          7-14 days before event
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          50% refund
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          5-7 business days
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          Less than 7 days
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          No refund
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          N/A
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Required Information for Cancellation
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Full name as registered</li>
                  <li>Registration confirmation number</li>
                  <li>Email address used for registration</li>
                  <li>Reason for cancellation</li>
                  <li>Preferred refund method</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Accommodation Cancellation
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Accommodation cancellations are subject to both our policies
                  and the individual hotel's cancellation terms:
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Standard Accommodation
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    <strong>15+ days before check-in:</strong> Full refund minus
                    booking fees
                  </li>
                  <li>
                    <strong>7-14 days before check-in:</strong> 50% refund
                  </li>
                  <li>
                    <strong>3-6 days before check-in:</strong> 25% refund
                  </li>
                  <li>
                    <strong>Less than 3 days:</strong> No refund
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Premium/Special Accommodations
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Stricter cancellation terms may apply</li>
                  <li>Some bookings may be non-refundable</li>
                  <li>
                    Individual property policies will be clearly stated at
                    booking
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Transportation Cancellation
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Bus Transportation
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    <strong>48+ hours before departure:</strong> 100% refund
                  </li>
                  <li>
                    <strong>24-47 hours before departure:</strong> 75% refund
                  </li>
                  <li>
                    <strong>12-23 hours before departure:</strong> 50% refund
                  </li>
                  <li>
                    <strong>Less than 12 hours:</strong> No refund
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Special Transportation Services
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    Airport transfers: 24-hour cancellation notice required
                  </li>
                  <li>Private vehicles: Subject to vendor-specific policies</li>
                  <li>Group transportation: Minimum 72-hour notice required</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Partial Cancellations
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may cancel specific services while maintaining others:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Accommodation Only:</strong> Follow accommodation
                    cancellation terms
                  </li>
                  <li>
                    <strong>Transportation Only:</strong> Follow transportation
                    cancellation terms
                  </li>
                  <li>
                    <strong>Additional Services:</strong> Individual service
                    cancellation policies apply
                  </li>
                  <li>
                    <strong>Meal Preferences:</strong> Must be cancelled 7 days
                    before event
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Emergency Cancellations
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We understand that emergencies can occur. The following
                  circumstances may qualify for special consideration:
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Medical Emergencies
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    Serious illness or injury of participant or immediate family
                    member
                  </li>
                  <li>
                    Requires medical certificate from licensed practitioner
                  </li>
                  <li>
                    May qualify for up to 90% refund regardless of timeline
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Force Majeure Events
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Natural disasters affecting travel</li>
                  <li>Government travel restrictions</li>
                  <li>Transportation strikes or shutdowns</li>
                  <li>Family bereavement</li>
                </ul>

                <p className="text-gray-700 leading-relaxed">
                  <em>
                    Emergency cancellations require proper documentation and are
                    subject to review by the organizing committee.
                  </em>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Event Cancellation by Organizers
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In the event that UNMA 2026 organizing committee needs to
                  cancel the event:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Full Event Cancellation:</strong> 100% refund of all
                    payments
                  </li>
                  <li>
                    <strong>Partial Services Cancellation:</strong> Refund for
                    affected services only
                  </li>
                  <li>
                    <strong>Postponement:</strong> Option to transfer
                    registration or receive full refund
                  </li>
                  <li>
                    <strong>Notification:</strong> At least 30 days advance
                    notice when possible
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. How to Cancel
                </h2>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Step-by-Step Cancellation Process
                </h3>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Send an email to info@unma.in</li>
                  <li>
                    Use subject line: "CANCELLATION REQUEST - [Your Registration
                    Number]"
                  </li>
                  <li>Include all required information (see section 2)</li>
                  <li>Attach supporting documents if applicable</li>
                  <li>
                    Wait for confirmation email (within 2-3 business days)
                  </li>
                  <li>Follow up if no response within 5 business days</li>
                </ol>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  What Happens After Cancellation
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Immediate email confirmation of cancellation request</li>
                  <li>Review of eligibility within 3-5 business days</li>
                  <li>
                    Refund processing (if applicable) within stated timelines
                  </li>
                  <li>Final confirmation when refund is processed</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. No-Show Policy
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Failure to attend the event or use booked services without
                  prior cancellation:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Event Registration:</strong> No refund for no-shows
                  </li>
                  <li>
                    <strong>Accommodation:</strong> Full charges apply, no
                    refund
                  </li>
                  <li>
                    <strong>Transportation:</strong> No refund for unused seats
                  </li>
                  <li>
                    <strong>Meals:</strong> Charged as per final headcount
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Modification vs. Cancellation
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Before cancelling, consider if modification might meet your
                  needs:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Date Changes:</strong> Subject to availability,
                    modification fees may apply
                  </li>
                  <li>
                    <strong>Service Upgrades/Downgrades:</strong> Difference in
                    cost will be charged/refunded
                  </li>
                  <li>
                    <strong>Name Changes:</strong> Limited changes allowed with
                    proper documentation
                  </li>
                  <li>
                    <strong>Transfer to Another Person:</strong> See our
                    transfer policy
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Contact Information
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 font-semibold mb-2">
                    Cancellation Support
                  </p>
                  <p className="text-blue-800">
                    Email: info@unma.in
                    <br />
                    Subject: CANCELLATION REQUEST - [Your Registration Number]
                    <br />
                    Response Time: 2-3 business days
                    <br />
                    Website:{" "}
                    <a
                      href="/"
                      className="text-primary hover:text-primary-dark"
                    >
                      summit2025.unma.in
                    </a>
                  </p>
                </div>

                <p className="text-gray-600 mt-4 text-sm">
                  For urgent cancellation requests (within 48 hours of the
                  event), please mark your email as "URGENT" and follow up with
                  a phone call if contact information is provided.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
