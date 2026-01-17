import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { useSubmitFeedback, useCheckFeedbackStatus } from "../hooks";
import useRegistration from "../hooks/useRegistration";
import { toast } from "react-toastify";

const StarRating = ({
  rating,
  setRating,
  label,
  required = false,
  comment = "",
  setComment = null,
  commentLabel = "Comments",
}) => {
  const [hover, setHover] = useState(0);

  const isCommentRequired = rating > 0 && rating <= 3;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            {star <= (hover || rating) ? (
              <StarIcon className="w-8 h-8 text-yellow-400" />
            ) : (
              <StarIconOutline className="w-8 h-8 text-gray-300" />
            )}
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && `${rating} out of 5`}
        </span>
      </div>

      {/* Comments field - shown for all ratings, required for 3 and below */}
      {setComment && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {commentLabel}{" "}
            {isCommentRequired && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className={`w-full px-3 py-2 rounded-lg border ${
              isCommentRequired && !comment.trim()
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:ring-2 focus:border-transparent transition-all`}
            placeholder={
              isCommentRequired
                ? "Please provide feedback for this rating..."
                : "Optional feedback..."
            }
          />
          {isCommentRequired && !comment.trim() && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <XCircleIcon className="w-4 h-4" />
              Comments are required for ratings 3 and below
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Feedback = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { mutate: submitFeedback, isPending, isSuccess } = useSubmitFeedback();
  const { fetchUserById } = useRegistration();

  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const [email, setEmail] = useState("");
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    overallSatisfaction: 0,
    overallSatisfactionComment: "",
    mostEnjoyedAspect: "",
    organizationRating: 0,
    organizationRatingComment: "",
    sessionUsefulness: 0,
    sessionUsefulnessComment: "",
    favoriteSpeakerSession: "",
    wouldRecommend: "",
    improvementSuggestions: "",
    accommodationRating: 0,
    accommodationFeedback: "",
    transportationRating: 0,
    transportationFeedback: "",
    foodQualityRating: 0,
    foodQualityRatingComment: "",
    networkingOpportunitiesRating: 0,
    networkingOpportunitiesRatingComment: "",
    venueQualityRating: 0,
    venueQualityRatingComment: "",
    audioVisualRating: 0,
    audioVisualRatingComment: "",
    eventScheduleRating: 0,
    eventScheduleRatingComment: "",
    registrationProcessRating: 0,
    registrationProcessRatingComment: "",
    communicationRating: 0,
    communicationRatingComment: "",
    favoriteHighlight: "",
    comparedToExpectations: "",
    wouldAttendFuture: "",
    topAreaForImprovement: "",
    futureSessionSuggestions: "",
    additionalComments: "",
  });

  const [usedServices, setUsedServices] = useState({
    accommodation: false,
    transportation: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!id) {
        setUserError("No user ID provided");
        setIsLoadingUser(false);
        return;
      }

      try {
        setIsLoadingUser(true);
        const response = await fetchUserById(id);

        if (response.status === "success" && response.data) {
          // The registration is nested under response.data.registration
          const user = response.data.registration || response.data;
          setUserData(user);

          console.log("Fetched user data:", user);

          // Auto-populate form data
          setFormData((prev) => ({
            ...prev,
            name:
              user.name || user.formDataStructured?.personalInfo?.name || "",
            email:
              user.email || user.formDataStructured?.personalInfo?.email || "",
            phone:
              user.contactNumber ||
              user.formDataStructured?.personalInfo?.contactNumber ||
              "",
            school:
              user.formDataStructured?.personalInfo?.school ||
              user.formDataStructured?.personalInfo?.customSchoolName ||
              "",
          }));

          // Check if user has already submitted feedback
          if (user.email) {
            checkStatus(user.email);
          }
        } else {
          setUserError("User not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserError(error.message || "Failed to load user data");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check if email has already submitted feedback
  const checkStatus = async (emailToCheck) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/feedback/check-status?email=${encodeURIComponent(emailToCheck)}`
      );
      const data = await response.json();
      if (data.hasSubmitted) {
        setAlreadySubmitted(true);
      }
      setHasCheckedStatus(true);
    } catch (error) {
      console.error("Error checking feedback status:", error);
      setHasCheckedStatus(true);
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !hasCheckedStatus) {
      checkStatus(formData.email);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    validateField(fieldName);
  };

  const validateField = (fieldName) => {
    let error = "";

    switch (fieldName) {
      case "name":
        if (!formData.name || formData.name.trim().length < 2) {
          error = "Please enter your full name (at least 2 characters)";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
          error = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
          error = "Please enter a valid email address";
        }
        break;
      case "overallSatisfaction":
        if (formData.overallSatisfaction === 0) {
          error = "Please rate your overall satisfaction";
        } else if (
          formData.overallSatisfaction > 0 &&
          formData.overallSatisfaction <= 3 &&
          !formData.overallSatisfactionComment.trim()
        ) {
          error = "Comments are required for ratings 3 and below";
        }
        break;
      case "mostEnjoyedAspect":
        if (
          !formData.mostEnjoyedAspect ||
          formData.mostEnjoyedAspect.trim().length < 10
        ) {
          error = "Please share what you enjoyed most (at least 10 characters)";
        }
        break;
      case "organizationRating":
        if (formData.organizationRating === 0) {
          error = "Please rate the organization";
        } else if (
          formData.organizationRating > 0 &&
          formData.organizationRating <= 3 &&
          !formData.organizationRatingComment.trim()
        ) {
          error = "Comments are required for ratings 3 and below";
        }
        break;
      case "sessionUsefulness":
        if (formData.sessionUsefulness === 0) {
          error = "Please rate the session usefulness";
        } else if (
          formData.sessionUsefulness > 0 &&
          formData.sessionUsefulness <= 3 &&
          !formData.sessionUsefulnessComment.trim()
        ) {
          error = "Comments are required for ratings 3 and below";
        }
        break;
      case "favoriteSpeakerSession":
        if (
          !formData.favoriteSpeakerSession ||
          formData.favoriteSpeakerSession.trim().length < 5
        ) {
          error =
            "Please share your favorite speaker/session (at least 5 characters)";
        }
        break;
      case "wouldRecommend":
        if (!formData.wouldRecommend) {
          error = "Please select an option";
        }
        break;
      case "improvementSuggestions":
        if (
          !formData.improvementSuggestions ||
          formData.improvementSuggestions.trim().length < 10
        ) {
          error = "Please share your suggestions (at least 10 characters)";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error === "";
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "email",
      "overallSatisfaction",
      "mostEnjoyedAspect",
      "organizationRating",
      "sessionUsefulness",
      "favoriteSpeakerSession",
      "wouldRecommend",
      "improvementSuggestions",
    ];

    const newErrors = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      const valid = validateField(field);
      if (!valid) {
        isValid = false;
        setTouched((prev) => ({
          ...prev,
          [field]: true,
        }));
      }
    });

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that we have user data (email validation)
    if (!userData || !formData.email) {
      toast.error(
        "Invalid user session. Please access this feedback form through the provided link."
      );
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors and fill in all required fields");
      // Scroll to first error
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (alreadySubmitted) {
      toast.error("You have already submitted feedback");
      return;
    }

    // Clean up the data - remove optional fields if not used
    const cleanedData = { ...formData };
    if (!usedServices.accommodation) {
      delete cleanedData.accommodationRating;
      delete cleanedData.accommodationFeedback;
    }
    if (!usedServices.transportation) {
      delete cleanedData.transportationRating;
      delete cleanedData.transportationFeedback;
    }

    submitFeedback(cleanedData, {
      onSuccess: () => {
        toast.success("Thank you for your feedback!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to submit feedback"
        );
      },
    });
  };

  useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSuccess]);

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">
            Please wait while we load your information.
          </p>
        </motion.div>
      </div>
    );
  }

  // Already submitted state
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            You have already submitted your feedback for UNMA Summit 2025. We
            truly appreciate your input!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We truly appreciate
            you taking the time to share your thoughts about UNMA Summit 2025.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              UNMA Summit 2025 Feedback Survey
            </h1>
            <p className="text-lg text-gray-600">
              Help us make future events even better! Your feedback is valuable
              to us.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Information
            </h2>
            {userData && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Welcome, {formData.name}!</strong> Your information
                  has been pre-filled from our records.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Your email address"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email is pre-filled and cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School/Institution (Optional)
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Your school/institution"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Overall Experience */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Section 1: Overall Experience
            </h2>
            <div className="space-y-6">
              <div>
                <StarRating
                  rating={formData.overallSatisfaction}
                  setRating={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      overallSatisfaction: value,
                    }));
                    if (errors.overallSatisfaction) {
                      setErrors((prev) => ({
                        ...prev,
                        overallSatisfaction: "",
                      }));
                    }
                    setTouched((prev) => ({
                      ...prev,
                      overallSatisfaction: true,
                    }));
                  }}
                  label="How happy were you with the event overall?"
                  required
                  comment={formData.overallSatisfactionComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      overallSatisfactionComment: value,
                    }))
                  }
                  commentLabel="Overall Experience Comments"
                />
                {touched.overallSatisfaction && errors.overallSatisfaction && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircleIcon className="w-4 h-4" />
                    {errors.overallSatisfaction}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you enjoy the most?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="mostEnjoyedAspect"
                  value={formData.mostEnjoyedAspect}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("mostEnjoyedAspect")}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched.mostEnjoyedAspect && errors.mostEnjoyedAspect
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Share what you enjoyed most about the event..."
                />
                {touched.mostEnjoyedAspect && errors.mostEnjoyedAspect && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircleIcon className="w-4 h-4" />
                    {errors.mostEnjoyedAspect}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Organisation */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Section 2: Organisation
            </h2>
            <div>
              <StarRating
                rating={formData.organizationRating}
                setRating={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    organizationRating: value,
                  }));
                  if (errors.organizationRating) {
                    setErrors((prev) => ({
                      ...prev,
                      organizationRating: "",
                    }));
                  }
                  setTouched((prev) => ({
                    ...prev,
                    organizationRating: true,
                  }));
                }}
                label="How was the event set-up (registration, venue, timing)?"
                required
                comment={formData.organizationRatingComment}
                setComment={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    organizationRatingComment: value,
                  }))
                }
                commentLabel="Organization Comments"
              />
              {touched.organizationRating && errors.organizationRating && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircleIcon className="w-4 h-4" />
                  {errors.organizationRating}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Sessions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Section 3: Sessions
            </h2>
            <div className="space-y-6">
              <div>
                <StarRating
                  rating={formData.sessionUsefulness}
                  setRating={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      sessionUsefulness: value,
                    }));
                    if (errors.sessionUsefulness) {
                      setErrors((prev) => ({
                        ...prev,
                        sessionUsefulness: "",
                      }));
                    }
                    setTouched((prev) => ({
                      ...prev,
                      sessionUsefulness: true,
                    }));
                  }}
                  label="Were the sessions useful for you?"
                  required
                  comment={formData.sessionUsefulnessComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      sessionUsefulnessComment: value,
                    }))
                  }
                  commentLabel="Session Usefulness Comments"
                />
                {touched.sessionUsefulness && errors.sessionUsefulness && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircleIcon className="w-4 h-4" />
                    {errors.sessionUsefulness}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which session or speaker did you like best?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="favoriteSpeakerSession"
                  value={formData.favoriteSpeakerSession}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("favoriteSpeakerSession")}
                  required
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched.favoriteSpeakerSession &&
                    errors.favoriteSpeakerSession
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Tell us about your favorite session or speaker..."
                />
                {touched.favoriteSpeakerSession &&
                  errors.favoriteSpeakerSession && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      {errors.favoriteSpeakerSession}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Section 4: Looking Ahead */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Section 4: Looking Ahead
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Would you come again or tell others to join?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Yes", "No", "Maybe"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          wouldRecommend: option,
                        }));
                        if (errors.wouldRecommend) {
                          setErrors((prev) => ({
                            ...prev,
                            wouldRecommend: "",
                          }));
                        }
                        setTouched((prev) => ({
                          ...prev,
                          wouldRecommend: true,
                        }));
                      }}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        formData.wouldRecommend === option
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {touched.wouldRecommend && errors.wouldRecommend && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <XCircleIcon className="w-4 h-4" />
                    {errors.wouldRecommend}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any ideas to make it better?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="improvementSuggestions"
                  value={formData.improvementSuggestions}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("improvementSuggestions")}
                  required
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    touched.improvementSuggestions &&
                    errors.improvementSuggestions
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Share your suggestions for improvement..."
                />
                {touched.improvementSuggestions &&
                  errors.improvementSuggestions && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <XCircleIcon className="w-4 h-4" />
                      {errors.improvementSuggestions}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Section 5: Additional Feedback (Optional) */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Section 5: Additional Feedback (Optional)
            </h2>
            <div className="space-y-6">
              {/* Accommodation */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="usedAccommodation"
                    checked={usedServices.accommodation}
                    onChange={(e) =>
                      setUsedServices((prev) => ({
                        ...prev,
                        accommodation: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="usedAccommodation"
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    I used accommodation services
                  </label>
                </div>
                {usedServices.accommodation && (
                  <div className="space-y-4 ml-8">
                    <StarRating
                      rating={formData.accommodationRating}
                      setRating={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          accommodationRating: value,
                        }))
                      }
                      label="Rate your accommodation experience"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accommodation Feedback
                      </label>
                      <textarea
                        name="accommodationFeedback"
                        value={formData.accommodationFeedback}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Any specific feedback about accommodation..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Transportation */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="usedTransportation"
                    checked={usedServices.transportation}
                    onChange={(e) =>
                      setUsedServices((prev) => ({
                        ...prev,
                        transportation: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="usedTransportation"
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    I used transportation services
                  </label>
                </div>
                {usedServices.transportation && (
                  <div className="space-y-4 ml-8">
                    <StarRating
                      rating={formData.transportationRating}
                      setRating={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          transportationRating: value,
                        }))
                      }
                      label="Rate your transportation experience"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transportation Feedback
                      </label>
                      <textarea
                        name="transportationFeedback"
                        value={formData.transportationFeedback}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Any specific feedback about transportation..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Other Ratings */}
              <div className="border-t pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rate Your Experience
                </h3>

                <StarRating
                  rating={formData.foodQualityRating}
                  setRating={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      foodQualityRating: value,
                    }))
                  }
                  label="How was the food quality?"
                  comment={formData.foodQualityRatingComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      foodQualityRatingComment: value,
                    }))
                  }
                  commentLabel="Food Quality Comments"
                />

                <StarRating
                  rating={formData.venueQualityRating}
                  setRating={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      venueQualityRating: value,
                    }))
                  }
                  label="How was the venue and facilities?"
                  comment={formData.venueQualityRatingComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      venueQualityRatingComment: value,
                    }))
                  }
                  commentLabel="Venue Quality Comments"
                />

                <StarRating
                  rating={formData.audioVisualRating}
                  setRating={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      audioVisualRating: value,
                    }))
                  }
                  label="How was the audio/visual equipment quality?"
                  comment={formData.audioVisualRatingComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      audioVisualRatingComment: value,
                    }))
                  }
                  commentLabel="Audio/Visual Comments"
                />

                <StarRating
                  rating={formData.eventScheduleRating}
                  setRating={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventScheduleRating: value,
                    }))
                  }
                  label="How was the event schedule and timing?"
                  comment={formData.eventScheduleRatingComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      eventScheduleRatingComment: value,
                    }))
                  }
                  commentLabel="Event Schedule Comments"
                />

                <StarRating
                  rating={formData.registrationProcessRating}
                  setRating={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      registrationProcessRating: value,
                    }))
                  }
                  label="How was the registration process?"
                  comment={formData.registrationProcessRatingComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      registrationProcessRatingComment: value,
                    }))
                  }
                  commentLabel="Registration Process Comments"
                />

                <StarRating
                  rating={formData.communicationRating}
                  setRating={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      communicationRating: value,
                    }))
                  }
                  label="How was the communication before the event?"
                  comment={formData.communicationRatingComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      communicationRatingComment: value,
                    }))
                  }
                  commentLabel="Communication Comments"
                />

                <StarRating
                  rating={formData.networkingOpportunitiesRating}
                  setRating={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      networkingOpportunitiesRating: value,
                    }))
                  }
                  label="How were the networking opportunities?"
                  comment={formData.networkingOpportunitiesRatingComment}
                  setComment={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      networkingOpportunitiesRatingComment: value,
                    }))
                  }
                  commentLabel="Networking Comments"
                />
              </div>

              {/* Additional Questions */}
              <div className="border-t pt-6 space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Questions
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What was your favorite moment or highlight?
                  </label>
                  <textarea
                    name="favoriteHighlight"
                    value={formData.favoriteHighlight}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Share your favorite moment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How did the event compare to your expectations?
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["Exceeded", "Met", "Below"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            comparedToExpectations: option,
                          }))
                        }
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          formData.comparedToExpectations === option
                            ? "bg-blue-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option === "Exceeded"
                          ? "Exceeded Expectations"
                          : option === "Met"
                          ? "Met Expectations"
                          : "Below Expectations"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Would you attend future UNMA events?
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["Definitely", "Probably", "Not Sure", "Probably Not"].map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              wouldAttendFuture: option,
                            }))
                          }
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            formData.wouldAttendFuture === option
                              ? "bg-blue-600 text-white shadow-lg scale-105"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What's the top area that needs improvement?
                  </label>
                  <textarea
                    name="topAreaForImprovement"
                    value={formData.topAreaForImprovement}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="What should we improve most?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What topics/sessions would you like to see in future events?
                  </label>
                  <textarea
                    name="futureSessionSuggestions"
                    value={formData.futureSessionSuggestions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Suggest topics for future sessions..."
                  />
                </div>
              </div>

              {/* Additional Comments */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any Additional Comments?
                </label>
                <textarea
                  name="additionalComments"
                  value={formData.additionalComments}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Anything else you'd like to share with us..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              type="submit"
              disabled={isPending || alreadySubmitted}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
                isPending || alreadySubmitted
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              }`}
            >
              {isPending ? "Submitting..." : "Submit Feedback"}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              All fields marked with <span className="text-red-500">*</span> are
              required
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Feedback;
