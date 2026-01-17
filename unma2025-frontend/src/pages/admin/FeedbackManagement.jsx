import { useState } from "react";
import { motion } from "framer-motion";
import {
  StarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useGetAllFeedback,
  useGetFeedbackStats,
  useExportFeedback,
} from "../../hooks";
import { toast } from "react-toastify";

const StarDisplay = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-300" />
          )}
        </span>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
    </div>
  );
};

const FeedbackCard = ({ feedback, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {feedback.name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                feedback.wouldRecommend === "Yes"
                  ? "bg-green-100 text-green-700"
                  : feedback.wouldRecommend === "No"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {feedback.wouldRecommend === "Yes"
                ? "Would Recommend"
                : feedback.wouldRecommend === "No"
                ? "Would Not Recommend"
                : "Maybe"}
            </span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" />
              <span>{feedback.email}</span>
            </div>
            {feedback.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span>{feedback.phone}</span>
              </div>
            )}
            {feedback.school && (
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="w-4 h-4" />
                <span>{feedback.school}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {new Date(feedback.submittedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Ratings Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Overall</div>
          <StarDisplay rating={feedback.overallSatisfaction} />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Organization</div>
          <StarDisplay rating={feedback.organizationRating} />
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Sessions</div>
          <StarDisplay rating={feedback.sessionUsefulness} />
        </div>
        {feedback.foodQualityRating > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Food</div>
            <StarDisplay rating={feedback.foodQualityRating} />
          </div>
        )}
      </div>

      {/* Expandable Content */}
      <div className="border-t pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>

        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="mt-4 space-y-4"
          >
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Most Enjoyed Aspect
              </div>
              <p className="text-gray-600">{feedback.mostEnjoyedAspect}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Favorite Speaker/Session
              </div>
              <p className="text-gray-600">{feedback.favoriteSpeakerSession}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Improvement Suggestions
              </div>
              <p className="text-gray-600">{feedback.improvementSuggestions}</p>
            </div>

            {feedback.accommodationRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Accommodation Rating
                </div>
                <StarDisplay rating={feedback.accommodationRating} />
                {feedback.accommodationFeedback && (
                  <p className="text-gray-600 mt-2">
                    {feedback.accommodationFeedback}
                  </p>
                )}
              </div>
            )}

            {feedback.transportationRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Transportation Rating
                </div>
                <StarDisplay rating={feedback.transportationRating} />
                {feedback.transportationFeedback && (
                  <p className="text-gray-600 mt-2">
                    {feedback.transportationFeedback}
                  </p>
                )}
              </div>
            )}

            {feedback.networkingOpportunitiesRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Networking Opportunities
                </div>
                <StarDisplay rating={feedback.networkingOpportunitiesRating} />
              </div>
            )}

            {feedback.venueQualityRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Venue Quality
                </div>
                <StarDisplay rating={feedback.venueQualityRating} />
              </div>
            )}

            {feedback.audioVisualRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Audio/Visual Quality
                </div>
                <StarDisplay rating={feedback.audioVisualRating} />
              </div>
            )}

            {feedback.eventScheduleRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Event Schedule
                </div>
                <StarDisplay rating={feedback.eventScheduleRating} />
              </div>
            )}

            {feedback.registrationProcessRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Registration Process
                </div>
                <StarDisplay rating={feedback.registrationProcessRating} />
              </div>
            )}

            {feedback.communicationRating > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Communication
                </div>
                <StarDisplay rating={feedback.communicationRating} />
              </div>
            )}

            {feedback.favoriteHighlight && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Favorite Highlight
                </div>
                <p className="text-gray-600">{feedback.favoriteHighlight}</p>
              </div>
            )}

            {feedback.comparedToExpectations && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Compared to Expectations
                </div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    feedback.comparedToExpectations === "Exceeded"
                      ? "bg-green-100 text-green-700"
                      : feedback.comparedToExpectations === "Met"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {feedback.comparedToExpectations} Expectations
                </span>
              </div>
            )}

            {feedback.wouldAttendFuture && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Would Attend Future Events
                </div>
                <p className="text-gray-600">{feedback.wouldAttendFuture}</p>
              </div>
            )}

            {feedback.topAreaForImprovement && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Top Area for Improvement
                </div>
                <p className="text-gray-600">
                  {feedback.topAreaForImprovement}
                </p>
              </div>
            )}

            {feedback.futureSessionSuggestions && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Future Session Suggestions
                </div>
                <p className="text-gray-600">
                  {feedback.futureSessionSuggestions}
                </p>
              </div>
            )}

            {feedback.additionalComments && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Additional Comments
                </div>
                <p className="text-gray-600">{feedback.additionalComments}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm text-gray-500 mb-1">{title}</div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {subtitle && (
          <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
        )}
      </div>
      {Icon && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      )}
    </div>
  </div>
);

const FeedbackManagement = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: "submittedAt",
    sortOrder: "desc",
    minRating: "",
    maxRating: "",
    wouldRecommend: "",
    search: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: feedbackData, isLoading } = useGetAllFeedback(filters);
  const { data: statsData, isLoading: statsLoading } = useGetFeedbackStats();
  const { mutate: exportFeedback, isPending: isExporting } =
    useExportFeedback();

  const handleExport = () => {
    exportFeedback(undefined, {
      onSuccess: (data) => {
        // Convert to CSV
        if (data.data && data.data.length > 0) {
          const csvContent = convertToCSV(data.data);
          const blob = new Blob([csvContent], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `feedback-export-${new Date().toISOString()}.csv`;
          a.click();
          toast.success("Feedback exported successfully");
        } else {
          toast.error("No feedback data to export");
        }
      },
      onError: () => {
        toast.error("Failed to export feedback");
      },
    });
  };

  const convertToCSV = (data) => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "School",
      "Overall Satisfaction",
      "Organization Rating",
      "Session Usefulness",
      "Would Recommend",
      "Most Enjoyed",
      "Favorite Speaker/Session",
      "Improvement Suggestions",
      "Food Rating",
      "Networking Rating",
      "Venue Rating",
      "Audio/Visual Rating",
      "Event Schedule Rating",
      "Registration Process Rating",
      "Communication Rating",
      "Favorite Highlight",
      "Compared to Expectations",
      "Would Attend Future",
      "Top Area for Improvement",
      "Future Session Suggestions",
      "Submitted At",
    ];

    const rows = data.map((item) => [
      item.name,
      item.email,
      item.phone || "",
      item.school || "",
      item.overallSatisfaction,
      item.organizationRating,
      item.sessionUsefulness,
      item.wouldRecommend,
      `"${item.mostEnjoyedAspect.replace(/"/g, '""')}"`,
      `"${item.favoriteSpeakerSession.replace(/"/g, '""')}"`,
      `"${item.improvementSuggestions.replace(/"/g, '""')}"`,
      item.foodQualityRating || "",
      item.networkingOpportunitiesRating || "",
      item.venueQualityRating || "",
      item.audioVisualRating || "",
      item.eventScheduleRating || "",
      item.registrationProcessRating || "",
      item.communicationRating || "",
      item.favoriteHighlight
        ? `"${item.favoriteHighlight.replace(/"/g, '""')}"`
        : "",
      item.comparedToExpectations || "",
      item.wouldAttendFuture || "",
      item.topAreaForImprovement
        ? `"${item.topAreaForImprovement.replace(/"/g, '""')}"`
        : "",
      item.futureSessionSuggestions
        ? `"${item.futureSessionSuggestions.replace(/"/g, '""')}"`
        : "",
      new Date(item.submittedAt).toLocaleString(),
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const stats = statsData?.data?.summary || {};
  const avgRatings = {
    overall: stats.avgOverallSatisfaction?.toFixed(1) || "N/A",
    organization: stats.avgOrganizationRating?.toFixed(1) || "N/A",
    sessions: stats.avgSessionUsefulness?.toFixed(1) || "N/A",
    food: stats.avgFoodQualityRating?.toFixed(1) || "N/A",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Feedback Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and analyze participant feedback
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>

        {/* Statistics */}
        {!statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Feedback"
              value={stats.totalFeedback || 0}
              icon={UserIcon}
            />
            <StatCard
              title="Average Overall Rating"
              value={avgRatings.overall}
              subtitle="out of 5"
              icon={StarIconSolid}
            />
            <StatCard
              title="Would Recommend"
              value={`${Math.round(
                ((stats.wouldRecommendYes || 0) / (stats.totalFeedback || 1)) *
                  100
              )}%`}
              subtitle={`${stats.wouldRecommendYes || 0} respondents`}
              icon={ChartBarIcon}
            />
            <StatCard
              title="Organization Rating"
              value={avgRatings.organization}
              subtitle="out of 5"
              icon={ChartBarIcon}
            />
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value, page: 1 })
                  }
                  placeholder="Name, email, or school..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      minRating: e.target.value,
                      page: 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}+
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Would Recommend
                </label>
                <select
                  value={filters.wouldRecommend}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      wouldRecommend: e.target.value,
                      page: 1,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading feedback...</p>
          </div>
        ) : feedbackData?.data?.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No feedback submissions yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {feedbackData?.data?.map((feedback) => (
                <FeedbackCard key={feedback._id} feedback={feedback} />
              ))}
            </div>

            {/* Pagination */}
            {feedbackData?.pagination && feedbackData.pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                  Page {filters.page} of {feedbackData.pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  disabled={filters.page === feedbackData.pagination.pages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
