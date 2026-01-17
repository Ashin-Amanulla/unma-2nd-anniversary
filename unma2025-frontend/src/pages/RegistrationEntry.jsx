import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  School,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Users,
  CheckCircle,
  Save,
  UserCheck,
  ArrowLeft,
  AlertCircle,
  Search,
} from "lucide-react";
import EntryAttendeeCounter from "../components/registration/EntryAttendeeCounter";
import { useAdmin } from "../hooks/useAdmin";

const RegistrationEntry = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const registrationId = searchParams.get('registrationId');
  const navigate = useNavigate();
  const { user } = useAdmin();

  const [registration, setRegistration] = useState(null);
  const [attendees, setAttendees] = useState({
    adults: { veg: 0, nonVeg: 0 },
    teens: { veg: 0, nonVeg: 0 },
    children: { veg: 0, nonVeg: 0 },
    toddlers: { veg: 0, nonVeg: 0 },
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (registrationId) {
      fetchRegistrationData(registrationId);
    } else {
      // Reset state when no registrationId
      setRegistration(null);
      setAttendees({
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
      });
    }
  }, [registrationId]);

  const fetchRegistrationData = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken"); // Fixed: use adminToken
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/registration-desk/entry/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch registration data");
      }

      setRegistration(data.data);
      setAttendees(data.data.attendees);
    } catch (error) {
      console.error("Error fetching registration:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/registration-desk/entry/${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log(data.data);
      if (!response.status ) {
        throw new Error(data.message || "Search failed");
      }

      if (data) {  //if data is found, update URL with the registration ID
        // If found, update URL with the registration ID
        const foundRegistration = data.data;
        console.log('foundRegistration',foundRegistration);
        setSearchParams({ registrationId: foundRegistration.serialNumber });
      } else {
        setError("No registration found with that name or ID");
      }
    } catch (error) {
      console.error("Error searching:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAttendees = async () => {
    if (!registrationId) return;
    
    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/registration-desk/attendees/${registrationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attendees }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save attendee count");
      }

      setSuccess("Attendee count saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving attendees:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkEntered = async () => {
    if (!registrationId) return;
    
    try {
      setMarking(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/registration-desk/enter/${registrationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark as entered");
      }

      setRegistration((prev) => ({
        ...prev,
        markedEntered: true,
        enteredAt: data.data.enteredAt,
        enteredBy: data.data.enteredBy,
      }));

      setSuccess("Registration marked as entered successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error marking as entered:", error);
      setError(error.message);
    } finally {
      setMarking(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTotalAttendees = () => {
    return Object.values(attendees).reduce(
      (total, group) => total + (group.veg || 0) + (group.nonVeg || 0),
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Registration Entry
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Logged in as: {user?.username || "Admin"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

      

        {/* Content based on whether registration is selected */}
        {!registrationId ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search for a Registration
            </h3>
            <p className="text-gray-500">
              Enter a name, email, phone number, or registration ID to get started.
            </p>
          </div>
        ) : registration ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Registration Details */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Registration Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {registration?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {registration?.serialNumber || registration?._id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {registration?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {registration?.contactNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <School className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {registration?.school}
                      </p>
                      <p className="text-xs text-gray-500">
                        Batch: {registration?.yearOfPassing}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          registration?.paymentStatus
                        )}`}
                      >
                        {registration?.paymentStatus || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {registration?.markedEntered && (
                    <div className="flex items-start space-x-3">
                      <UserCheck className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          Entered
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(registration.enteredAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          By: {registration.enteredBy}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Attendee Counter */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Attendee Count
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Total: {calculateTotalAttendees()}
                    </span>
                  </div>
                </div>

                <EntryAttendeeCounter
                  values={attendees}
                  onChange={setAttendees}
                  disabled={registration?.markedEntered}
                />

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSaveAttendees}
                    disabled={saving || registration?.markedEntered}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      registration?.markedEntered
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={handleMarkEntered}
                    disabled={marking || registration?.markedEntered}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      registration?.markedEntered
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {marking ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    {marking
                      ? "Marking..."
                      : registration?.markedEntered
                      ? "Already Entered"
                      : "Mark as Entered"}
                  </button>
                </div>

                {registration?.markedEntered && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ This registration has been marked as entered and cannot
                      be modified.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading registration details...</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Registration Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              The registration you're looking for could not be found.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setSearchQuery('');
                setError(null);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Search Again
            </button>
          </div>
        )}

        {/* Search Bar - Always visible */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search Registration
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name, email, phone, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          
          {/* Clear search button */}
          {registrationId && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSearchParams({});
                  setSearchQuery('');
                  setError(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear search and start over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationEntry;