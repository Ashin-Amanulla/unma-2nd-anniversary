import { useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";

import {
  ChatBubbleLeftEllipsisIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon,
  EnvelopeIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Import TanStack Query hooks
import {
  useContactMessages,
  useUpdateMessageStatus,
  useRespondToMessage,
} from "../../hooks";

const ContactMessages = () => {
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState("");

  const { isSuperAdmin } = useAuthStore();

  // Use TanStack Query hooks
  const {
    data: messagesResponse,
    isLoading: loading,
    error,
  } = useContactMessages({
    ...filters,
    ...pagination,
  });

  const updateStatusMutation = useUpdateMessageStatus();
  const respondToMessageMutation = useRespondToMessage();

  // Extract data from response
  const messages = messagesResponse?.data || [];
  const paginationData = messagesResponse?.pagination || {
    total: 0,
    pages: 0,
    page: pagination.page,
    limit: pagination.limit,
  };

  // Only super admin can access settings
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Only super administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    read: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-orange-100 text-orange-800",
    responded: "bg-green-100 text-green-800",
    resolved: "bg-green-100 text-green-800",
    spam: "bg-red-100 text-red-800",
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const categoryColors = {
    "general-inquiry": "bg-blue-100 text-blue-800",
    "technical-support": "bg-purple-100 text-purple-800",
    "summit-related": "bg-indigo-100 text-indigo-800",
    "registration-help": "bg-green-100 text-green-800",
    "payment-issue": "bg-yellow-100 text-yellow-800",
    sponsorship: "bg-pink-100 text-pink-800",
    complaint: "bg-red-100 text-red-800",
    suggestion: "bg-teal-100 text-teal-800",
    other: "bg-gray-100 text-gray-800",
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    setResponse("");

    // Mark as read if it's new
    if (message.status === "new") {
      handleStatusUpdate(message._id, "read");
    }
  };

  const handleStatusUpdate = async (messageId, newStatus) => {
    updateStatusMutation.mutate({ id: messageId, status: newStatus });

    // Update selected message if it's the same one
    if (selectedMessage && selectedMessage._id === messageId) {
      setSelectedMessage({ ...selectedMessage, status: newStatus });
    }
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    respondToMessageMutation.mutate(
      {
        id: selectedMessage._id,
        responseMessage: response,
        responseMethod: "email",
      },
      {
        onSuccess: () => {
          setResponse("");
          setShowModal(false);
        },
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCategoryLabel = (category) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Contact Messages
              </h1>
              <p className="text-gray-600">
                Manage and respond to user inquiries
              </p>
            </div>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg">
            <span className="text-blue-800 font-semibold">
              {paginationData.total} Total Messages
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary focus:border-transparent"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="in-progress">In Progress</option>
            <option value="responded">Responded</option>
            <option value="resolved">Resolved</option>
            <option value="spam">Spam</option>
          </select>

          {/* Category Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="general-inquiry">General Inquiry</option>
            <option value="technical-support">Technical Support</option>
            <option value="summit-related">Summit Related</option>
            <option value="registration-help">Registration Help</option>
            <option value="payment-issue">Payment Issue</option>
            <option value="sponsorship">Sponsorship</option>
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject & Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <ChatBubbleLeftEllipsisIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No messages found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No messages match your current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                messages.map((message) => (
                  <tr
                    key={message._id}
                    className={`hover:bg-gray-50 ${
                      message.status === "new" ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {message.subject}
                        </div>
                        <div className="flex items-center mt-1">
                          <UserCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">
                            {message.name}
                          </span>
                          {message.email && (
                            <>
                              <EnvelopeIcon className="h-4 w-4 text-gray-400 ml-2 mr-1" />
                              <span className="text-sm text-gray-500 truncate max-w-xs">
                                {message.email}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          categoryColors[message.category] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formatCategoryLabel(message.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          priorityColors[message.priority] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.priority.charAt(0).toUpperCase() +
                          message.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[message.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.status.charAt(0).toUpperCase() +
                          message.status.slice(1).replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(message.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginationData.pages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(paginationData.page - 1)}
                  disabled={paginationData.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(paginationData.page + 1)}
                  disabled={paginationData.page === paginationData.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(paginationData.page - 1) * paginationData.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        paginationData.page * paginationData.limit,
                        paginationData.total
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{paginationData.total}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(paginationData.page - 1)}
                      disabled={paginationData.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(paginationData.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          paginationData.page === i + 1
                            ? "z-10 bg-primary border-primary text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(paginationData.page + 1)}
                      disabled={paginationData.page === paginationData.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Message Details
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
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
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Subject</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedMessage.subject}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Message</h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Sender Information
                  </h4>
                  <div className="mt-1 text-sm text-gray-900 space-y-1">
                    <p>
                      <strong>Name:</strong> {selectedMessage.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedMessage.email}
                    </p>
                    {selectedMessage.phone && (
                      <p>
                        <strong>Phone:</strong> {selectedMessage.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Message Details
                  </h4>
                  <div className="mt-1 text-sm text-gray-900 space-y-1">
                    <p>
                      <strong>Category:</strong>{" "}
                      {formatCategoryLabel(selectedMessage.category)}
                    </p>
                    <p>
                      <strong>Priority:</strong>{" "}
                      {selectedMessage.priority.charAt(0).toUpperCase() +
                        selectedMessage.priority.slice(1)}
                    </p>
                    <p>
                      <strong>Source:</strong> {selectedMessage.source}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Current Status
                </h4>
                <span
                  className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    statusColors[selectedMessage.status]
                  }`}
                >
                  {selectedMessage.status.charAt(0).toUpperCase() +
                    selectedMessage.status.slice(1).replace("-", " ")}
                </span>
              </div>

              {/* Response Section */}
              {selectedMessage.status !== "responded" &&
                selectedMessage.status !== "resolved" &&
                selectedMessage.status !== "spam" && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Send Response
                    </h4>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={handleSendResponse}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Send Response
                      </button>
                    </div>
                  </div>
                )}

              {/* Status Update Buttons */}
              <div className="flex space-x-2 pt-4 border-t">
                {selectedMessage.status !== "in-progress" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedMessage._id, "in-progress")
                    }
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Mark In Progress
                  </button>
                )}
                {selectedMessage.status !== "resolved" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedMessage._id, "resolved")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedMessage.status !== "spam" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedMessage._id, "spam")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Mark as Spam
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
