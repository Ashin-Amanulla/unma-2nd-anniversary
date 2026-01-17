import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { CheckCircleIcon, HomeIcon } from "@heroicons/react/24/outline";

const RepublicDayEventSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const registrationData = location.state?.registrationData;

  // Redirect if no registration data
  useEffect(() => {
    if (!registrationData) {
      navigate("/republic-day-event");
    }
  }, [registrationData, navigate]);

  if (!registrationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Registration Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for registering for the UNMA 2nd Anniversary & 77th Republic Day
            Celebration
          </p>
        </div>

        {/* Registration Details */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Registration Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="text-gray-800">{registrationData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Email:</span>
              <span className="text-gray-800">{registrationData.email}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Next Steps</h2>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                A confirmation email will be sent to your registered email address
                shortly.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Please ensure your payment details are updated if you haven't paid
                yet.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                We look forward to seeing you on 26th January 2026 at T. K.
                Ramakrishnan Samskarika Kendram, Ernakulam.
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/program"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center"
          >
            View Event Details
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors duration-200 text-center flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RepublicDayEventSuccess;
