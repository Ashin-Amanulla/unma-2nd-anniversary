import React, { useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/authStore";

import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";

// Import TanStack Query hooks
import { useIssues, useUpdateIssueStatus } from "../../hooks";

const Issues = () => {
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
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { isSuperAdmin } = useAuthStore();

  // Use TanStack Query hooks
  const {
    data: issuesResponse,
    isLoading: loading,
    error,
  } = useIssues({
    ...filters,
    ...pagination,
  });

  const updateStatusMutation = useUpdateIssueStatus();

  // Extract data from response
  const issues = issuesResponse?.data || [];
  const paginationData = issuesResponse?.pagination || {
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
    Open: "bg-blue-100 text-blue-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    Resolved: "bg-green-100 text-green-800",
    Closed: "bg-gray-100 text-gray-800",
  };

  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-orange-100 text-orange-800",
    Critical: "bg-red-100 text-red-800",
  };

  const categoryColors = {
    Technical: "bg-purple-100 text-purple-800",
    Content: "bg-blue-100 text-blue-800",
    Payment: "bg-green-100 text-green-800",
    Registration: "bg-indigo-100 text-indigo-800",
    Other: "bg-gray-100 text-gray-800",
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

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setShowModal(true);
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    updateStatusMutation.mutate({ id: issueId, status: newStatus });
    setShowModal(false);
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
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Issues Management
              </h1>
              <p className="text-gray-600">
                Track and resolve user-reported issues
              </p>
            </div>
          </div>
          <div className="bg-orange-100 px-4 py-2 rounded-lg">
            <span className="text-orange-800 font-semibold">
              {paginationData.total} Total Issues
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
              placeholder="Search issues..."
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
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Content">Content</option>
            <option value="Payment">Payment</option>
            <option value="Registration">Registration</option>
            <option value="Other">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporter
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
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No issues found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No issues match your current filters.
                    </p>
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {issue.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {issue.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {issue.reportedBy?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {issue.reportedBy?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          categoryColors[issue.category] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {issue.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          priorityColors[issue.priority] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[issue.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(issue.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleViewIssue(issue)}
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

      {/* Issue Detail Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Issue Details
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
                <h4 className="text-sm font-medium text-gray-500">Title</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedIssue.title}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Description
                </h4>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedIssue.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Category
                  </h4>
                  <span
                    className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      categoryColors[selectedIssue.category]
                    }`}
                  >
                    {selectedIssue.category}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Priority
                  </h4>
                  <span
                    className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      priorityColors[selectedIssue.priority]
                    }`}
                  >
                    {selectedIssue.priority}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Reporter</h4>
                <div className="mt-1 text-sm text-gray-900">
                  <p>
                    <strong>Name:</strong> {selectedIssue.reportedBy?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedIssue.reportedBy?.email}
                  </p>
                  {selectedIssue.reportedBy?.phone && (
                    <p>
                      <strong>Phone:</strong> {selectedIssue.reportedBy?.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Current Status
                </h4>
                <span
                  className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    statusColors[selectedIssue.status]
                  }`}
                >
                  {selectedIssue.status}
                </span>
              </div>

              {selectedIssue.attachments && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Attachments
                  </h4>
                  <a
                    href={selectedIssue.attachments}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Attachment
                  </a>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                {selectedIssue.status !== "Resolved" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedIssue._id, "Resolved")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedIssue.status !== "In Progress" &&
                  selectedIssue.status !== "Resolved" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedIssue._id, "In Progress")
                      }
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      Mark In Progress
                    </button>
                  )}
                {selectedIssue.status !== "Closed" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedIssue._id, "Closed")
                    }
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close Issue
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

export default Issues;
