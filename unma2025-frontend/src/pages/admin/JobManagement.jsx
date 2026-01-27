import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import jobApi from "../../api/jobApi";
import Loading from "../../components/ui/Loading";
import { toast } from "react-hot-toast";

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    isActive: undefined, // undefined = all, true = active, false = inactive
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);

  // Form Initial State
  const initialFormState = {
    title: "",
    company: "",
    description: "",
    type: "Full-time",
    location: "",
    salary: "",
    image: "",
    applicationUrl: "",
    applicationEmail: "",
    deadline: "",
    requirements: "", // Managed as string in form, array in backend
    responsibilities: "", // Managed as string in form, array in backend
    contactPerson: "",
    contactPhone: "",
    ageLimit: {
      minAge: "",
      maxAge: "",
    },
    qualification: "Any",
    careerGrowth: "",
    selectionCriteria: "Other",
    notificationPdf: "",
    poster: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobApi.getAllJobs({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        isActive: filters.isActive,
      });
      setJobs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await jobApi.getJobStats();
      setStats(data.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const openModal = (job = null) => {
    if (job) {
      setCurrentJob(job);
      setFormData({
        ...job,
        requirements: job.requirements?.join("\n") || "",
        responsibilities: job.responsibilities?.join("\n") || "",
        deadline: job.deadline ? job.deadline.split("T")[0] : "",
        ageLimit: {
          minAge: job.ageLimit?.minAge || "",
          maxAge: job.ageLimit?.maxAge || "",
        },
        qualification: job.qualification || "Any",
        careerGrowth: job.careerGrowth || "",
        selectionCriteria: job.selectionCriteria || "Other",
        notificationPdf: job.notificationPdf || "",
        poster: job.poster || "",
      });
      setImagePreview(job.image || null);
      setPdfPreview(job.notificationPdf || null);
      setPosterPreview(job.poster || null);
    } else {
      setCurrentJob(null);
      setFormData(initialFormState);
      setImagePreview(null);
      setPdfPreview(null);
      setPosterPreview(null);
    }
    setImageFile(null);
    setPdfFile(null);
    setPosterFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setPdfPreview(file.name);
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let imageUrl = formData.image;
      let pdfUrl = formData.notificationPdf;
      let posterUrl = formData.poster;

      // Upload image if new file selected
      if (imageFile) {
        const uploadResponse = await jobApi.uploadJobImage(imageFile);
        imageUrl = uploadResponse.fileUrl;
      }

      // Upload PDF if new file selected
      if (pdfFile) {
        const uploadResponse = await jobApi.uploadJobPdf(pdfFile);
        pdfUrl = uploadResponse.fileUrl;
      }

      // Upload poster if new file selected
      if (posterFile) {
        const uploadResponse = await jobApi.uploadJobImage(posterFile);
        posterUrl = uploadResponse.fileUrl;
      }

      const payload = {
        ...formData,
        image: imageUrl,
        notificationPdf: pdfUrl,
        poster: posterUrl,
        ageLimit: {
          minAge: formData.ageLimit.minAge ? Number(formData.ageLimit.minAge) : null,
          maxAge: formData.ageLimit.maxAge ? Number(formData.ageLimit.maxAge) : null,
        },
        requirements: formData.requirements
          .split("\n")
          .filter((item) => item.trim() !== ""),
        responsibilities: formData.responsibilities
          .split("\n")
          .filter((item) => item.trim() !== ""),
      };

      if (currentJob) {
        await jobApi.updateJob(currentJob._id, payload);
        toast.success("Job updated successfully");
      } else {
        await jobApi.createJob(payload);
        toast.success("Job created successfully");
      }

      closeModal();
      fetchJobs();
      fetchStats();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await jobApi.deleteJob(id);
        toast.success("Job deleted successfully");
        fetchJobs();
        fetchStats();
      } catch (err) {
        toast.error(err.message || "Failed to delete job");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await jobApi.toggleJobStatus(id);
      toast.success("Job status updated");
      fetchJobs();
      fetchStats();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage career opportunities and job listings
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Post New Job
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              Total Jobs
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalJobs}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <div className="text-green-600 text-sm font-medium uppercase tracking-wider">
              Active Listings
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.activeJobs}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-gray-300">
            <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              Inactive/Closed
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {stats.inactiveJobs}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.isActive === undefined ? "all" : filters.isActive}
              onChange={(e) => {
                const val = e.target.value;
                setFilters({
                  ...filters,
                  isActive:
                    val === "all" ? undefined : val === "true" ? true : false,
                });
                setPagination({ ...pagination, page: 1 });
              }}
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job / Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No jobs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {job.image ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={job.image}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-500">
                                  {job.company.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {job.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {job.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {job.qualification || "Any"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {job.selectionCriteria || "Other"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.location || "Remote"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            job.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleToggleStatus(job._id)}
                          className={`text-gray-400 hover:text-gray-900 mx-2 ${
                             job.isActive ? "hover:text-amber-600" : "hover:text-green-600"
                          }`}
                          title={job.isActive ? "Deactivate" : "Activate"}
                        >
                          {job.isActive ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => openModal(job)}
                          className="text-blue-600 hover:text-blue-900 mx-2"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="text-red-600 hover:text-red-900 mx-2"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {/* Simplistic pagination */}
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() =>
                          setPagination({ ...pagination, page: page })
                        }
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === page
                            ? "z-10 bg-primary border-primary text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5 pb-2 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentJob ? "Edit Job" : "Post New Job"}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Apprenticeship">Apprenticeship</option>
                        <option value="Trainee">Trainee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Remote, Bangalore"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="e.g. ₹5,00,000 - ₹8,00,000 PA"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Requirements (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="- React.js experience&#10;- 3+ years coding"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Responsibilities (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.responsibilities}
                        onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Person (Optional)</label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Number (Optional)</label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Application URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.applicationUrl}
                        onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Application Email (Optional)</label>
                      <input
                        type="email"
                        value={formData.applicationEmail}
                        onChange={(e) => setFormData({ ...formData, applicationEmail: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Eligibility Section */}
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <AcademicCapIcon className="w-5 h-5 mr-2 text-primary" />
                      Eligibility & Selection Criteria
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Age</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.ageLimit.minAge}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ageLimit: { ...formData.ageLimit, minAge: e.target.value },
                            })
                          }
                          placeholder="e.g. 18"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Maximum Age</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.ageLimit.maxAge}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ageLimit: { ...formData.ageLimit, maxAge: e.target.value },
                            })
                          }
                          placeholder="e.g. 35"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Educational Qualification *</label>
                        <select
                          value={formData.qualification}
                          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="Any">Any</option>
                          <option value="10th Pass">10th Pass</option>
                          <option value="12th Pass">12th Pass</option>
                          <option value="Diploma">Diploma</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Post Graduate">Post Graduate</option>
                          <option value="PhD">PhD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Selection Criteria *</label>
                        <select
                          value={formData.selectionCriteria}
                          onChange={(e) => setFormData({ ...formData, selectionCriteria: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="Written Exam">Written Exam</option>
                          <option value="Interview">Interview</option>
                          <option value="Both">Both</option>
                          <option value="Degree Marks">Degree Marks</option>
                          <option value="Walk-in">Walk-in</option>
                          <option value="Online Assessment">Online Assessment</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Career Growth / Promotions</label>
                      <textarea
                        rows={3}
                        value={formData.careerGrowth}
                        onChange={(e) => setFormData({ ...formData, careerGrowth: e.target.value })}
                        placeholder="Describe career growth opportunities, promotion paths, etc."
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <DocumentIcon className="w-5 h-5 mr-2 text-primary" />
                      Documents & Media
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Company Logo / Image</label>
                        <div className="mt-1 flex flex-col space-y-2">
                          <div className="h-20 w-full rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <PhotoIcon className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notification PDF</label>
                        <div className="mt-1 flex flex-col space-y-2">
                          <div className="h-20 w-full rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                            {pdfPreview ? (
                              <div className="text-center p-2">
                                <DocumentIcon className="h-8 w-8 text-red-500 mx-auto mb-1" />
                                <p className="text-xs text-gray-600 truncate">{pdfPreview}</p>
                              </div>
                            ) : formData.notificationPdf ? (
                              <a
                                href={formData.notificationPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-center p-2 hover:bg-gray-100 rounded"
                              >
                                <DocumentIcon className="h-8 w-8 text-red-500 mx-auto mb-1" />
                                <p className="text-xs text-primary">View PDF</p>
                              </a>
                            ) : (
                              <DocumentIcon className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfChange}
                            className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Poster (Optional)</label>
                        <div className="mt-1 flex flex-col space-y-2">
                          <div className="h-20 w-full rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50">
                            {posterPreview ? (
                              <img src={posterPreview} alt="Poster Preview" className="h-full w-full object-cover" />
                            ) : formData.poster ? (
                              <img src={formData.poster} alt="Poster" className="h-full w-full object-cover" />
                            ) : (
                              <PhotoIcon className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePosterChange}
                            className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse -mx-6 -mb-4 mt-6">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {formLoading ? "Saving..." : "Save Job"}
                    </button>
                    <button
                      type="button"
                      disabled={formLoading}
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
