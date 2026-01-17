import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import ScrollLink from "../components/ui/ScrollLink";

const RegistrationPendingSuccess = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get("type");
  const { registrationData } = location.state || {};
  console.log(type);

  useEffect(() => {
    // Trigger confetti animation (less intense for pending status)
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 30;

      confetti({
        particleCount,
        startVelocity: 20,
        spread: 360,
        origin: {
          x: randomInRange(0.2, 0.8),
          y: Math.random() - 0.2,
        },
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12 text-center">
            <div className="text-5xl mb-4 flex justify-center gap-4">
              <span>📋</span>
              <span>⏳</span>
              <span>📧</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Thank You, {registrationData?.name || "Navodayan"}!
            </h1>
            <p className="text-orange-100 text-lg">
              Your form has been submitted successfully
            </p>
          </div>

          {/* Main Content */}
          <div className="px-8 py-10 space-y-8">
            {/* Registration Status */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>📝</span> Registration Status
              </h2>
              <div className="bg-orange-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-medium text-center text-orange-900">
                  Registration Pending Verification
                </p>
                <div className="text-center space-y-2">
                  <p className="text-orange-800">
                    Your registration is currently pending payment verification.
                  </p>
                  <p className="text-orange-700 text-sm">
                    We will confirm your registration once we receive and verify
                    your payment details.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details Submission */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>💰</span> Payment Verification Required
              </h2>
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800 mb-2">
                      Action Required: Send Payment Receipt
                    </h3>
                    <div className="space-y-3">
                      <p className="text-red-700">
                        Please email your international payment receipt to
                        complete your registration.
                      </p>

                      {registrationData?.contributionAmount && (
                        <div className="bg-white rounded p-3 border border-red-200">
                          <p className="text-sm text-gray-600 mb-1">
                            Payment Details Submitted:
                          </p>
                          <p className="font-medium text-red-800">
                            Amount:{" "}
                            {registrationData.paymentDetails
                              ? (() => {
                                  try {
                                    const details = JSON.parse(
                                      registrationData.paymentDetails
                                    );
                                    return `${details.currency} ${registrationData.contributionAmount}`;
                                  } catch {
                                    return `₹${registrationData.contributionAmount}`;
                                  }
                                })()
                              : `₹${registrationData.contributionAmount}`}
                          </p>
                        </div>
                      )}

                      <div className="bg-white rounded p-4 border border-red-200">
                        <h4 className="font-medium text-red-800 mb-2">
                          Email Instructions:
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                          <li>
                            Send your payment receipt/confirmation to:{" "}
                            <strong>payment@unma.in</strong>
                          </li>
                          <li>
                            Include your full name:{" "}
                            <strong>
                              {registrationData?.name || "Your Name"}
                            </strong>
                          </li>
                          <li>
                            Include your email:{" "}
                            <strong>
                              {registrationData?.email || "Your Email"}
                            </strong>
                          </li>
                          <li>
                            Mention "International Payment - UNMA Meet 2025" in
                            subject line
                          </li>
                          <li>
                            Attach clear photos/screenshots of your bank
                            transfer receipt
                          </li>
                        </ul>
                      </div>

                      <div className="flex justify-center">
                        <a
                          href={`mailto:payment@unma.in?subject=International Payment - UNMA Meet 2025 - ${
                            registrationData?.name || "Registration"
                          }&body=Dear UNMA Team,%0D%0A%0D%0APlease find attached my international payment receipt for UNMA Meet 2025 registration.%0D%0A%0D%0ARegistration Details:%0D%0AName: ${
                            registrationData?.name || ""
                          }%0D%0AEmail: ${
                            registrationData?.email || ""
                          }%0D%0APhone: ${
                            registrationData?.contactNumber || ""
                          }%0D%0A%0D%0AThank you.%0D%0A%0D%0ABest regards,%0D%0A${
                            registrationData?.name || ""
                          }`}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
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
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Send Payment Email Now
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Details */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>📍</span> Venue Details
              </h2>
              <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                <p className="text-lg font-medium text-blue-900">
                  CIAL Convention Center
                </p>
                <p className="text-gray-600">
                  Cochin International Airport Limited
                  <br />
                  Airport Road, Nedumbassery
                  <br />
                  Kochi, Kerala - 683111
                </p>
                <a
                  href="https://maps.google.com/?q=CIAL+Convention+Center"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span>🗺️</span>
                  <span className="ml-1 underline">View on Google Maps</span>
                </a>
              </div>
            </div>

            {/* What to Expect */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>🌈</span> What to Expect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="font-medium text-green-800 mb-2">
                    🤝 Networking Opportunities
                  </p>
                  <p className="text-green-600">
                    Connect with fellow Navodayans from various batches and
                    fields
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-medium text-purple-800 mb-2">
                    🎭 Cultural Programs
                  </p>
                  <p className="text-purple-600">
                    Enjoy amazing performances and participate in activities
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="font-medium text-yellow-800 mb-2">
                    🍽️ Delicious Food
                  </p>
                  <p className="text-yellow-600">
                    Savor a variety of cuisines prepared just for you
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="font-medium text-red-800 mb-2">
                    💝 Memorable Moments
                  </p>
                  <p className="text-red-600">
                    Create lasting memories with your JNV family
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>📝</span> What Happens Next?
              </h2>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">1️⃣</span>
                  <span>
                    <strong>Email your payment receipt</strong> to
                    payment@unma.in (most important!)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">2️⃣</span>
                  <span>
                    Our team will <strong>verify your payment</strong> within
                    24-48 hours
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">3️⃣</span>
                  <span>
                    You'll receive a <strong>confirmation email</strong> once
                    verified
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">4️⃣</span>
                  <span>
                    Join our <strong>WhatsApp group</strong> for event updates
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">5️⃣</span>
                  <span>
                    Follow our <strong>social media</strong> for latest news
                  </span>
                </li>
              </ul>
            </div>

            {/* Need Help Section */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span>🤔</span> Need Help?
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Have questions about your payment or registration? We're here
                  to help!
                </p>
                <div className="flex flex-wrap gap-4">
                  <ScrollLink
                    to="/report-issue"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    🐛 Report an Issue
                  </ScrollLink>
                  <a
                    href="mailto:info@unma.in"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    ✉️ Email Support
                  </a>
                  <a
                    href="mailto:payment@unma.in"
                    className="inline-flex items-center px-4 py-2 border border-orange-600 rounded-md text-orange-600 hover:bg-orange-50"
                  >
                    💰 Payment Support
                  </a>
                  <ScrollLink
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    🏠 Return Home
                  </ScrollLink>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Reminder
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your registration will remain <strong>pending</strong>{" "}
                      until we receive your payment receipt. Please ensure you
                      email the receipt to <strong>payment@unma.in</strong> to
                      complete your registration process.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fun Quote */}
            <div className="text-center mt-8 pt-8 border-t border-gray-200">
              <p className="text-lg text-gray-600 italic">
                "Distance means nothing when friendship means everything! 🌍💙"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPendingSuccess;
