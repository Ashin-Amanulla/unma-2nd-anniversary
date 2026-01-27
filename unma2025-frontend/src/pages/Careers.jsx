import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ClockIcon,
  DocumentIcon,
  AcademicCapIcon,
  XMarkIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import jobApi from "../api/jobApi";
import Loading from "../components/ui/Loading";
import RangeSlider from "../components/ui/RangeSlider";

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    type: "All",
    search: "",
    qualification: "All",
    selectionCriteria: "All",
    ageRange: { min: 18, max: 60 },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const jobTypes = [
    "All",
    "Full-time",
    "Part-time",
    "Internship",
    "Contract",
    "Freelance",
  ];

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type === "All" ? "" : filters.type,
        search: filters.search,
        qualification: filters.qualification === "All" || filters.qualification === "Any" ? "" : filters.qualification,
        selectionCriteria: filters.selectionCriteria === "All" ? "" : filters.selectionCriteria,
        minAge: filters.ageRange.min,
        maxAge: filters.ageRange.max,
      };
      const data = await jobApi.getActiveJobs(params);
      setJobs(data.data);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to load jobs. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleTypeChange = (type) => {
    setFilters({ ...filters, type });
    setPagination({ ...pagination, page: 1 });
  };

  const handleAgeRangeChange = (ageRange) => {
    setFilters({ ...filters, ageRange });
    setPagination({ ...pagination, page: 1 });
  };

  const handleQualificationChange = (e) => {
    setFilters({ ...filters, qualification: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSelectionCriteriaChange = (criteria) => {
    setFilters({ ...filters, selectionCriteria: criteria });
    setPagination({ ...pagination, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      type: "All",
      search: "",
      qualification: "All",
      selectionCriteria: "All",
      ageRange: { min: 18, max: 60 },
    });
    setPagination({ ...pagination, page: 1 });
  };

  const hasActiveFilters = () => {
    return (
      filters.type !== "All" ||
      filters.search !== "" ||
      filters.qualification !== "All" ||
      filters.selectionCriteria !== "All" ||
      filters.ageRange.min !== 18 ||
      filters.ageRange.max !== 60
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
      window.scrollTo(0, 0);
    }
  };

  const navigate = useNavigate();

  // Job Card Component - Full Width Horizontal Layout
  const JobCard = ({ job }) => (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group"
      onClick={() => navigate(`/careers/${job._id}`)}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Left Section: Logo and Basic Info */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-xl bg-gray-50 flex items-center justify-center border-2 border-gray-200 overflow-hidden group-hover:border-primary transition-colors">
              {job.image ? (
                <img
                  src={job.image}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BuildingOfficeIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
          </div>

          {/* Middle Section: Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-base text-gray-600 font-medium mb-3">{job.company}</p>
                
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      job.type === "Full-time"
                        ? "bg-blue-100 text-blue-700"
                        : job.type === "Part-time"
                        ? "bg-green-100 text-green-700"
                        : job.type === "Internship"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.type}
                  </span>
                  {job.qualification && job.qualification !== "Any" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <AcademicCapIcon className="w-3 h-3 mr-1" />
                      {job.qualification}
                    </span>
                  )}
                  {job.ageLimit?.minAge && job.ageLimit?.maxAge && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      Age: {job.ageLimit.minAge}-{job.ageLimit.maxAge} yrs
                    </span>
                  )}
                  {job.notificationPdf && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                      <DocumentIcon className="w-3 h-3" />
                      PDF Available
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Bottom Section: Details and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{job.location || "Remote"}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center">
                    <CurrencyRupeeIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{job.salary}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                {job.deadline && (
                  <div className="flex items-center text-red-600 font-medium">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <button
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 group-hover:scale-105 transform transition-transform"
              >
                View Details
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Available Opportunities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore active career opportunities, internships, and job openings.
          </p>
        </div>

        {/* Search Bar - Above sidebar and content */}
        <div className="mb-6 max-w-4xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white shadow-sm"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-6 relative">
          {/* Collapsible Sidebar */}
          <aside
            className={`${
              sidebarOpen
                ? "w-80 lg:w-80 translate-x-0"
                : "w-0 lg:w-0 -translate-x-full lg:translate-x-0"
            } transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] z-50 lg:z-auto`}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6 h-full overflow-y-auto lg:sticky lg:top-24">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-primary" />
                  Filters
                  {hasActiveFilters() && (
                    <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                      {[
                        filters.type !== "All" ? 1 : 0,
                        filters.search ? 1 : 0,
                        filters.qualification !== "All" ? 1 : 0,
                        filters.selectionCriteria !== "All" ? 1 : 0,
                        filters.ageRange.min !== 18 || filters.ageRange.max !== 60 ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close sidebar"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-500 lg:hidden" />
                  <XMarkIcon className="w-5 h-5 text-gray-500 hidden lg:block" />
                </button>
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeChange(type)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.type === type
                          ? "bg-primary text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range: {filters.ageRange.min} - {filters.ageRange.max} years
                </label>
                <RangeSlider
                  min={18}
                  max={60}
                  value={filters.ageRange}
                  onChange={handleAgeRangeChange}
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Educational Qualification</label>
                <select
                  value={filters.qualification}
                  onChange={handleQualificationChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                >
                  <option value="All">All Qualifications</option>
                  <option value="10th Pass">10th Pass</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              {/* Selection Criteria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selection Criteria</label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Written Exam", "Interview", "Both", "Degree Marks", "Walk-in", "Online Assessment"].map((criteria) => (
                    <button
                      key={criteria}
                      onClick={() => handleSelectionCriteriaChange(criteria)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.selectionCriteria === criteria
                          ? "bg-primary text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {criteria}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters() && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Toggle Sidebar Button - Mobile */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 z-30 bg-primary text-white p-3 rounded-r-lg shadow-lg hover:bg-primary-dark transition-colors lg:hidden"
              aria-label="Open filters"
            >
              <FunnelIcon className="w-5 h-5" />
              {hasActiveFilters() && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {[
                    filters.type !== "All" ? 1 : 0,
                    filters.search ? 1 : 0,
                    filters.qualification !== "All" ? 1 : 0,
                    filters.selectionCriteria !== "All" ? 1 : 0,
                    filters.ageRange.min !== 18 || filters.ageRange.max !== 60 ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          )}

          {/* Toggle Sidebar Button - Desktop */}
          {!sidebarOpen && (
            <div className="hidden lg:flex flex-col items-start gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                aria-label="Open filters"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              {hasActiveFilters() && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{[
                    filters.type !== "All" ? 1 : 0,
                    filters.search ? 1 : 0,
                    filters.qualification !== "All" ? 1 : 0,
                    filters.selectionCriteria !== "All" ? 1 : 0,
                    filters.ageRange.min !== 18 || filters.ageRange.max !== 60 ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}</span> active filter(s)
                </div>
              )}
            </div>
          )}

          {/* Main Content Area */}
          <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-0" : "lg:ml-0"}`}>
                {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loading />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-12 bg-white rounded-xl shadow-sm">
                <p>{error}</p>
                <button
                  onClick={fetchJobs}
                  className="mt-4 text-primary hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters to find what you're looking
                  for.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      pagination.page === page
                        ? "bg-primary text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Careers;
