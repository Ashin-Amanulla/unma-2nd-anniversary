import React from "react";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
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
                Terms and Conditions
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Please read these terms and conditions carefully before using
                our services for the UNMA 2026 reunion.
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
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using the UNMA 2026 reunion registration
                  website, you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by
                  the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Event Registration
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    Registration is open to all Navodaya Vidyalaya alumni from
                    Kerala, Mahe, and Lakshadweep regions.
                  </li>
                  <li>
                    All information provided during registration must be
                    accurate and complete.
                  </li>
                  <li>
                    Registration fees are non-refundable except under specific
                    circumstances outlined in our refund policy.
                  </li>
                  <li>
                    The organizing committee reserves the right to verify alumni
                    credentials.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Payment Terms
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    All payments must be made through the official website
                    payment gateway.
                  </li>
                  <li>Payment confirmation will be sent via email and SMS.</li>
                  <li>
                    Any payment disputes must be reported within 7 days of the
                    transaction.
                  </li>
                  <li>
                    Group discounts and early bird offers are subject to terms
                    and validity periods.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Event Participation
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    Participants must follow the event code of conduct at all
                    times.
                  </li>
                  <li>
                    The organizing committee reserves the right to refuse entry
                    or remove participants for inappropriate behavior.
                  </li>
                  <li>
                    Photography and videography will take place during the
                    event. By attending, you consent to your image being used
                    for promotional purposes.
                  </li>
                  <li>
                    Participants are responsible for their personal belongings
                    during the event.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Accommodation and Transportation
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    Accommodation bookings are subject to availability and
                    additional terms.
                  </li>
                  <li>
                    Transportation services, if availed, are provided by
                    third-party vendors.
                  </li>
                  <li>
                    UNMA 2026 organizing committee is not liable for any issues
                    with accommodation or transportation services.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Liability and Disclaimers
                </h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>
                    The organizing committee shall not be liable for any
                    personal injury, loss, or damage during the event.
                  </li>
                  <li>
                    Participants attend the event at their own risk and
                    responsibility.
                  </li>
                  <li>
                    The committee is not responsible for any medical emergencies
                    or health issues that may arise.
                  </li>
                  <li>Travel insurance is recommended for all participants.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Data Protection
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We are committed to protecting your privacy. Personal
                  information collected during registration will be used solely
                  for event organization and communication purposes. Please
                  refer to our Privacy Policy for detailed information about
                  data handling.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Force Majeure
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The organizing committee shall not be held liable for any
                  failure to perform due to unforeseen circumstances or events
                  beyond our control, including but not limited to natural
                  disasters, government restrictions, or global pandemics.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Modifications
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These terms and conditions may be updated from time to time.
                  Participants will be notified of any significant changes via
                  email or website announcement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  For any questions regarding these terms and conditions, please
                  contact us at:
                  <br />
                  Email: info@unma.in
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

export default TermsAndConditions;
