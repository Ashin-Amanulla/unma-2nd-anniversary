import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import jobApi from "../../api/jobApi";
import Loading from "../../components/ui/Loading";
import { toast } from "react-hot-toast";

const PendingJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      const data = await jobApi.getPendingJobs({
        page: pagination.page,
        limit: pagination.limit,
      });
      setJobs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message || "Failed to fetch pending jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handleApprove = async (jobId) => {
    if (!window.confirm("Are you sure you want to approve this job?")) {
      return;
    }

    try {
      setApproving(true);
      await jobApi.approveJob(jobId);
      toast.success("Job approved successfully");
      fetchPendingJobs();
      if (selectedJob?._id === jobId) {
        setShowDetailModal(false);
        setSelectedJob(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve job");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedJob) return;

    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setRejecting(true);
      await jobApi.rejectJob(selectedJob._id, rejectReason);
      toast.success("Job rejected successfully");
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectReason("");
      setSelectedJob(null);
      fetchPendingJobs();
    } catch (err) {
      toast.error(err.message || "Failed to reject job");
    } finally {
      setRejecting(false);
    }
  };

  const openDetailModal = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const openRejectModal = (job) => {
    setSelectedJob(job);
    setShowRejectModal(true);
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };

  if (loading && jobs.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Jobs</h1>
        <p className="text-gray-600">Review and approve or reject job submissions</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Jobs</h3>
          <p className="text-gray-600">All jobs have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs
            .filter((job) => {
              if (!filters.search) return true;
              const search = filters.search.toLowerCase();
              return (
                job.title?.toLowerCase().includes(search) ||
                job.company?.toLowerCase().includes(search) ||
                job.submitterInfo?.name?.toLowerCase().includes(search) ||
                job.submitterInfo?.email?.toLowerCase().includes(search)
              );
            })
            .map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0">
                        {job.image ? (
                          <img src={job.image} alt={job.company} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-lg text-gray-600 mb-2">{job.company}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {job.type}
                          </span>
                          {job.location && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {job.location}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{job.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            <span>{job.submitterInfo?.name || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <EnvelopeIcon className="w-4 h-4" />
                            <span>{job.submitterInfo?.email || "N/A"}</span>
                          </div>
                          {job.submitterInfo?.phone && (
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{job.submitterInfo.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>Submitted {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:min-w-[200px]">
                    <button
                      onClick={() => openDetailModal(job)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleApprove(job._id)}
                      disabled={approving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {approving ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => openRejectModal(job)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md ${
                  pagination.page === page ? "bg-primary text-white" : "border hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {showDetailModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedJob(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Submitter Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Submitted By</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <p className="font-medium">{selectedJob.submitterInfo?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <p className="font-medium">{selectedJob.submitterInfo?.email || "N/A"}</p>
                  </div>
                  {selectedJob.submitterInfo?.phone && (
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedJob.submitterInfo.phone}</p>
                    </div>
                  )}
                  {selectedJob.submitterInfo?.organization && (
                    <div>
                      <span className="text-sm text-gray-600">Organization:</span>
                      <p className="font-medium">{selectedJob.submitterInfo.organization}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Details */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Job Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Title:</span>
                    <p className="text-lg">{selectedJob.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Company:</span>
                    <p className="text-lg">{selectedJob.company}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Type:</span>
                    <p className="text-lg">{selectedJob.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Location:</span>
                    <p className="text-lg">{selectedJob.location || "Not specified"}</p>
                  </div>
                  {selectedJob.salary && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Salary:</span>
                      <p className="text-lg">{selectedJob.salary}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Description:</span>
                    <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                  </div>
                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Requirements:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Responsibilities:</span>
                      <ul className="list-disc list-inside text-gray-600">
                        {selectedJob.responsibilities.map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedJob(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApprove(selectedJob._id)}
                  disabled={approving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {approving ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openRejectModal(selectedJob);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Reject Job</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Are you sure you want to reject <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedJob(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Reject Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingJobs;
