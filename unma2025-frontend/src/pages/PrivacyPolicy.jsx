import React from "react";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
                Privacy Policy
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we
                collect, use, and protect your personal information.
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
                  1. Information We Collect
                </h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Personal Information
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you register for the UNMA 2026 reunion, we collect the
                  following personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>
                    Name and contact details (email, phone number, address)
                  </li>
                  <li>
                    Educational background (JNV school attended, batch year)
                  </li>
                  <li>Current professional information (optional)</li>
                  <li>Emergency contact information</li>
                  <li>Dietary preferences and accommodation requirements</li>
                  <li>
                    Payment information (processed securely through third-party
                    providers)
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on the website</li>
                  <li>Referring website information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use your personal information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Processing your event registration and payments</li>
                  <li>
                    Communicating event details, updates, and announcements
                  </li>
                  <li>Organizing accommodation and transportation services</li>
                  <li>Creating name badges and event materials</li>
                  <li>Facilitating networking and reconnection among alumni</li>
                  <li>Ensuring event security and safety</li>
                  <li>Improving our website and services</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Information Sharing
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information in the following
                  limited circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> With trusted third-party
                    vendors who assist in event organization (hotels,
                    transportation, catering)
                  </li>
                  <li>
                    <strong>Payment Processing:</strong> With secure payment
                    processors to handle transactions
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights and safety
                  </li>
                  <li>
                    <strong>Alumni Directory:</strong> Basic contact information
                    may be shared among participants for networking purposes
                    (with your consent)
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures
                  to protect your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Access controls and authentication measures</li>
                  <li>Regular security audits and updates</li>
                  <li>Staff training on data protection practices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Cookies and Tracking
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our website uses cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Remember your preferences and login status</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Improve website functionality and user experience</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookie settings through your browser
                  preferences.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Your Rights
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the following rights regarding your personal
                  information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal
                    information we hold about you
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information (subject to legal requirements)
                  </li>
                  <li>
                    <strong>Portability:</strong> Request your data in a
                    machine-readable format
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain types of
                    processing
                  </li>
                  <li>
                    <strong>Withdrawal:</strong> Withdraw consent for data
                    processing (where applicable)
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary
                  to fulfill the purposes for which it was collected, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                  <li>
                    Event registration and participation records: 3 years after
                    the event
                  </li>
                  <li>
                    Financial transaction records: 7 years for accounting
                    purposes
                  </li>
                  <li>Marketing communications: Until you unsubscribe</li>
                  <li>Website analytics data: 26 months</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Third-Party Links
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our website may contain links to third-party websites. This
                  privacy policy does not apply to those sites. We encourage you
                  to review the privacy policies of any third-party sites you
                  visit.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this privacy policy from time to time. We will
                  notify you of any material changes by posting the updated
                  policy on our website and sending an email notification to
                  registered users.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about this privacy policy or wish to
                  exercise your rights, please contact us at:
                  <br />
                  Email: summit2025@unma.in
                  <br />
                  Subject: Privacy Policy Inquiry
                  <br />
                  Website:{" "}
                  <a href="/" className="text-primary hover:text-primary-dark">
                    summit2025.unma.in
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
