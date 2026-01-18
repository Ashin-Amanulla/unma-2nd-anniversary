import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import jobApi from "../api/jobApi";
import Loading from "../components/ui/Loading";

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "All",
    search: "",
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
      const data = await jobApi.getActiveJobs({
        page: pagination.page,
        limit: pagination.limit,
        type: filters.type === "All" ? "" : filters.type,
        search: filters.search,
      });
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
      window.scrollTo(0, 0);
    }
  };

  const navigate = useNavigate();

  // Job Card Component
  const JobCard = ({ job }) => (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/careers/${job._id}`)}
    >
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
              {job.image ? (
                <img
                  src={job.image}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BuildingOfficeIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 font-medium">{job.company}</p>
            </div>
          </div>
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
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
            {job.location || "Remote"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyRupeeIcon className="w-4 h-4 mr-2 text-gray-400" />
            {job.salary || "Not Disclosed"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {job.description}
        </p>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        {job.deadline && (
          <span className="text-xs text-red-500 font-medium">
            Apply by {new Date(job.deadline).toLocaleDateString()}
          </span>
        )}
        <button
          className="ml-auto text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          View Details →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Available Opportunities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore active career opportunities, internships, and job openings.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.type === type
                        ? "bg-primary text-white shadow-md transform scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

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
