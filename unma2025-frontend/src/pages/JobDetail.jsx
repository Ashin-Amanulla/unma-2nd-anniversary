import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ArrowLeftIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  DocumentIcon,
  AcademicCapIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  XMarkIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import jobApi from "../api/jobApi";
import Loading from "../components/ui/Loading";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPosterModal, setShowPosterModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const data = await jobApi.getJobById(id);
        setJob(data.data);
        // SEO Title Update
        document.title = `${data.data.title} at ${data.data.company} | UNMA Careers`;
      } catch (err) {
        setError("Failed to load job details. The job may no longer be available.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
    
    // Cleanup title on unmount
    return () => {
        document.title = "UNMA 2026";
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
             <BriefcaseIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h3>
          <p className="text-gray-500 mb-6">{error || "The link you followed may be broken or the job has been removed."}</p>
          <Link
            to="/careers"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <Link
          to="/careers"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to all jobs
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-gray-100">
             <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="h-24 w-24 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 flex-shrink-0">
                  {job.image ? (
                    <img src={job.image} alt={job.company} className="h-full w-full object-cover" />
                  ) : (
                    <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                   <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                     <div>
                       <h1 className="text-3xl font-bold text-gray-900 text-wrap mb-2">{job.title}</h1>
                       <div className="text-xl text-primary font-medium mb-4">{job.company}</div>
                     </div>
                     <div className="flex flex-col gap-2 min-w-40">
                       {job.applicationUrl && (
                         <a
                           href={job.applicationUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-dark shadow-sm transition-all transform hover:-translate-y-0.5"
                         >
                           Apply Now
                         </a>
                       )}
                     </div>
                   </div>

                   <div className="flex flex-wrap gap-3 mt-2">
                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                       job.type === "Full-time"
                         ? "bg-blue-100 text-blue-800"
                         : job.type === "Part-time"
                         ? "bg-green-100 text-green-800"
                         : job.type === "Internship"
                         ? "bg-purple-100 text-purple-800"
                         : job.type === "Apprenticeship"
                         ? "bg-orange-100 text-orange-800"
                         : job.type === "Trainee"
                         ? "bg-pink-100 text-pink-800"
                         : "bg-gray-100 text-gray-800"
                     }`}>
                        <BriefcaseIcon className="w-4 h-4 mr-2" />
                        {job.type}
                     </span>
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {job.location || "Remote"}
                     </span>
                     {job.salary && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                          {job.salary}
                        </span>
                     )}
                     {job.qualification && job.qualification !== "Any" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          <AcademicCapIcon className="w-4 h-4 mr-2" />
                          {job.qualification}
                        </span>
                     )}
                     {job.ageLimit?.minAge && job.ageLimit?.maxAge && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          Age: {job.ageLimit.minAge}-{job.ageLimit.maxAge} years
                        </span>
                     )}
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                     </span>
                   </div>
                </div>
             </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">
            {/* Main Info */}
            <div className="p-6 md:p-8 lg:col-span-2 space-y-8">
               <section>
                 <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                 <p className="whitespace-pre-line text-gray-600 leading-relaxed text-lg">
                   {job.description}
                 </p>
               </section>

               {job.requirements?.length > 0 && (
                 <section>
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                   <ul className="space-y-3">
                     {job.requirements.map((req, idx) => (
                       <li key={idx} className="flex items-start text-gray-600">
                         <span className="mr-3 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                         <span>{req}</span>
                       </li>
                     ))}
                   </ul>
                 </section>
               )}

               {job.responsibilities?.length > 0 && (
                 <section>
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                   <ul className="space-y-3">
                     {job.responsibilities.map((res, idx) => (
                       <li key={idx} className="flex items-start text-gray-600">
                         <span className="mr-3 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                         <span>{res}</span>
                       </li>
                     ))}
                   </ul>
                 </section>
               )}

               {job.careerGrowth && (
                 <section>
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Career Growth & Promotions</h2>
                   <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                     {job.careerGrowth}
                   </p>
                 </section>
               )}
            </div>

            {/* Sidebar info */}
            <div className="bg-gray-50/50 p-6 md:p-8 space-y-6">
              {/* Eligibility Section */}
              {(job.ageLimit?.minAge || job.ageLimit?.maxAge || job.qualification) && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                    <AcademicCapIcon className="w-5 h-5 mr-2 text-primary" />
                    Eligibility
                  </h3>
                  <div className="space-y-3">
                    {job.ageLimit?.minAge && job.ageLimit?.maxAge && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-1">Age Limit</p>
                        <p className="text-gray-900 font-semibold">
                          {job.ageLimit.minAge} - {job.ageLimit.maxAge} years
                        </p>
                      </div>
                    )}
                    {job.qualification && job.qualification !== "Any" && (
                      <div className="bg-white p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-1">Educational Qualification</p>
                        <p className="text-gray-900 font-semibold">{job.qualification}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selection Process */}
              {job.selectionCriteria && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Selection Process</h3>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {job.selectionCriteria}
                    </span>
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {(job.notificationPdf || job.poster) && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                    <DocumentIcon className="w-5 h-5 mr-2 text-primary" />
                    Documents
                  </h3>
                  <div className="space-y-3">
                    {job.notificationPdf && (
                      <a
                        href={job.notificationPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors border-2 border-primary/20 hover:border-primary/40"
                      >
                        <div className="flex items-center">
                          <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <DocumentArrowDownIcon className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Notification PDF</p>
                            <p className="text-xs text-gray-500">Download official notification</p>
                          </div>
                        </div>
                        <DocumentArrowDownIcon className="w-5 h-5 text-primary" />
                      </a>
                    )}
                    {job.poster && (
                      <button
                        onClick={() => setShowPosterModal(true)}
                        className="w-full flex items-center justify-between bg-white p-4 rounded-lg hover:bg-gray-50 transition-colors border-2 border-primary/20 hover:border-primary/40"
                      >
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <PhotoIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">View Poster</p>
                            <p className="text-xs text-gray-500">Click to view full poster</p>
                          </div>
                        </div>
                        <PhotoIcon className="w-5 h-5 text-primary" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Deadline */}
              {job.deadline && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Application</h3>
                  <div className="flex items-start bg-white p-4 rounded-lg">
                    <div className="bg-red-100 p-2 rounded-lg mr-4">
                      <CalendarIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Application Deadline</p>
                      <p className="text-gray-900 font-semibold">{new Date(job.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Details */}
              {(job.contactPerson || job.contactPhone || job.applicationEmail) && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Contact Details</h3>
                  <div className="bg-white p-4 rounded-lg space-y-3">
                    {job.contactPerson && (
                      <div className="flex items-center text-gray-700">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span>{job.contactPerson}</span>
                      </div>
                    )}
                    {job.contactPhone && (
                      <div className="flex items-center">
                        <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <a href={`tel:${job.contactPhone}`} className="text-primary hover:underline font-medium">
                          {job.contactPhone}
                        </a>
                      </div>
                    )}
                    {job.applicationEmail && (
                      <div className="flex items-center">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <a href={`mailto:${job.applicationEmail}`} className="text-primary hover:underline font-medium break-all">
                          {job.applicationEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Section - Noticeable at bottom */}
          <div className="p-4 md:p-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <button
              onClick={() => {
                const jobUrl = window.location.href;
                const message = `*JOB OPPORTUNITY*\n\n` +
                  `*${job.title}*\n` +
                  `Company: ${job.company}\n` +
                  `Location: ${job.location || 'Remote'}\n` +
                  `Type: ${job.type}\n` +
                  (job.salary ? `Salary: ${job.salary}\n` : '') +
                  (job.qualification && job.qualification !== 'Any' ? `Qualification: ${job.qualification}\n` : '') +
                  (job.deadline ? `Apply by: ${new Date(job.deadline).toLocaleDateString()}\n` : '') +
                  `\nView Details: ${jobUrl}\n\n` +
                  `For more job opportunities, visit:\nhttps://unma.in/careers`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <ShareIcon className="w-5 h-5" />
              <span>Share on WhatsApp</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Poster Modal */}
      {showPosterModal && job.poster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setShowPosterModal(false)}
        >
          <div className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
            <img
              src={job.poster}
              alt="Job Poster"
              className="w-full h-auto max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
