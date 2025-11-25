import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  ArrowLeft,
  Send,
  Save,
  RotateCcw,
  Target,
  Plus,
  Trash2,
  Briefcase,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import {
  getNextFormPath,
  getPreviousFormPath,
} from "../../utils/formNavigationSequence";

// FormInput component
const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = "",
  required = false,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
      required={required}
    />
  </div>
);

FormInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

// FormSelect component
const FormSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
  required = false,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
      required={required}
    >
      <option value="">Select...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

FormSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  required: PropTypes.bool,
};

// FormTextarea component
const FormTextarea = ({
  label,
  value,
  onChange,
  className = "",
  placeholder = "",
  required = false,
  rows = 4,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
      required={required}
    />
  </div>
);

FormTextarea.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
};

const ProfessionalExperience = () => {
  // Helper to format ISO date to yyyy-MM-dd
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState(0);
  const [formData, setFormData] = useState({
    // Military Service
    hasMilitaryService: null,
    militaryService: {
      branch: "",
      from: "",
      to: "",
      rankAtDischarge: "",
      typeOfDischarge: "",
      otherThanHonorable: "",
      mayContactSupervisor: "",
      reasonForLeaving: "",
    },

    // Documents
    resumePath: "",
    coverLetterPath: "",
    portfolioPath: "",

    // Status and HR Feedback
    status: "draft",
    hrFeedback: null,
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, []);

  const [completedFormsCount, setCompletedFormsCount] = useState(0);

  const getFormKeysForPosition = () => {
    return [
      "personalInformation",
      "professionalExperience",
      "workExperience",
      "references",
      "education",
      "legalDisclosures",
      "jobDescriptionPCA",
      "codeOfEthics",
      "serviceDeliveryPolicy",
      "nonCompeteAgreement",
      "misconductStatement",
      "orientationPresentation",
      "orientationChecklist",
      "backgroundCheck",
      "tbSymptomScreen",
      "emergencyContact",
      "i9Form",
      "w4Form",
      "w9Form",
      "directDeposit",
    ];
  };

  const fetchProgressData = async (userId) => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${userId}`,
        { withCredentials: true }
      );

      if (response.data?.data) {
        const backendData = response.data.data;
        setApplicationStatus(
          backendData.application?.applicationStatus || "draft"
        );

        const forms = backendData.forms || {};
        const completedSet = new Set(
          backendData.application?.completedForms || []
        );

        const formKeys = getFormKeysForPosition();

        const completedForms = formKeys.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key)
          );
        }).length;

        const totalForms = formKeys.length;
        const percentage = Math.round((completedForms / totalForms) * 100);

        setCompletedFormsCount(completedForms);
        setOverallProgress(percentage);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      let user;
      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error("Error parsing user cookie:", e);
        user = null;
      }

      if (!user || !user._id) {
        console.log("No user found, using test user for development");
        user = { _id: "67e0f8770c6feb6ba99d11d2" };
      }

      const token = sessionToken || accessToken;

      // Fetch progress data
      await fetchProgressData(user._id);

      // Get or create onboarding application
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        {
          headers,
          withCredentials: true,
        }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.application
      ) {
        setApplicationId(response.data.data.application._id);

        // Load existing professional experience data if it exists
        if (response.data.data.forms.professionalExperience) {
          const data = response.data.data.forms.professionalExperience;
          setFormData({
            hasMilitaryService:
              data.hasMilitaryService === true
                ? "YES"
                : data.hasMilitaryService === false
                ? "NO"
                : data.hasMilitaryService || null,
            militaryService: {
              branch: data.militaryService?.branch || "",
              from: formatDate(data.militaryService?.from),
              to: formatDate(data.militaryService?.to),
              rankAtDischarge: data.militaryService?.rankAtDischarge || "",
              typeOfDischarge: data.militaryService?.typeOfDischarge || "",
              otherThanHonorable:
                data.militaryService?.otherThanHonorable || "",
              mayContactSupervisor:
                data.militaryService?.mayContactSupervisor || "",
              reasonForLeaving: data.militaryService?.reasonForLeaving || "",
            },
            resumePath: data.resumePath || "",
            coverLetterPath: data.coverLetterPath || "",
            portfolioPath: data.portfolioPath || "",
            status: data.status || "draft",
            hrFeedback: data.hrFeedback,
          });
        }
      } else {
        console.error("Invalid response structure:", response.data);
        toast.error("Failed to initialize form - invalid response");
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMilitaryServiceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      militaryService: {
        ...prev.militaryService,
        [field]: value,
      },
    }));
  };

  const saveForm = async (status = "draft") => {
    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    setSaving(true);
    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-professional-experience`,
        {
          applicationId,
          employeeId: user._id,
          formData,
          status,
        },
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data) {
        const message =
          status === "draft"
            ? "Professional experience saved as draft"
            : "Professional experience completed successfully!";

        toast.success(message);

        // Refresh progress data after successful save
        await fetchProgressData(user._id);

        // Dispatch event to update sidebar after successful save
        window.dispatchEvent(new Event("formStatusUpdated"));
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(error.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Professional experience form now only contains military service
    // Mark as completed
    const status = "completed";
    await saveForm(status);

    // Wait a moment for the sidebar to update before navigating
    setTimeout(() => {
      const nextPath = getNextFormPath("/employee/professional-experience");
      navigate(nextPath);
    }, 500);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">
              Loading professional experience form...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <Navbar />

        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Vertical Progress Bar Sidebar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:block md:w-12 lg:w-16 flex-shrink-0">
              <div className="sticky top-6 flex flex-col items-center">
                <div className="w-3 lg:w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-3 lg:w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress}%` }}
                  ></div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-sm lg:text-lg font-bold text-blue-600">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Application Progress
                  </div>
                </div>

                {saving && (
                  <div className="mt-4">
                    <RotateCcw className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Form Content */}
            <div className="flex-1 max-h-screen md:max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              {/* Back Button */}
              <div className="mb-4 md:mb-6">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-3 md:px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base font-medium w-20 md:w-24"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                  Back
                </button>
              </div>

              {/* HR Feedback Section */}
              {/* Line 481 omitted */}
              <HRFeedback
                hrFeedback={formData.hrFeedback}
                formStatus={formData.status}
              />

              {/* Status Banner */}
              {!loading && (
                <div
                  className={`m-6 p-4 rounded-lg border ${
                    applicationStatus === "completed" ||
                    applicationStatus === "submitted" ||
                    applicationStatus === "under_review" ||
                    applicationStatus === "approved"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {applicationStatus === "completed" ||
                    applicationStatus === "submitted" ||
                    applicationStatus === "approved" ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : applicationStatus === "under_review" ? (
                      <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      {applicationStatus === "completed" ||
                      applicationStatus === "submitted" ? (
                        <div>
                          <p className="text-base font-semibold text-green-800">
                            ✅ Progress Updated - Form Completed Successfully
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            You cannot make any changes to the form until HR
                            provides their feedback.
                          </p>
                        </div>
                      ) : applicationStatus === "approved" ? (
                        <p className="text-base font-semibold text-green-800">
                          ✅ Form Approved
                        </p>
                      ) : applicationStatus === "under_review" ? (
                        <p className="text-base font-semibold text-blue-800">
                          📋 Form Under Review
                        </p>
                      ) : (
                        <p className="text-base font-semibold text-red-800">
                          ⚠️ Not filled yet - Complete this form to update your
                          progress
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Line 487 omitted */}

              {/* Main Form Container */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit}>
                  {/* Header Section */}
                  <div className="bg-[#1F3A93] text-white p-4 md:p-6">
                    <div className="text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                        <Briefcase className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3" />
                        <div>
                          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                            Military Service
                          </h1>
                          <p className="text-blue-100 text-sm md:text-base"></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-4 md:p-6 lg:p-8">
                    {/* Military Service Section */}
                    <div className="mb-6 md:mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Military Service
                      </h2>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Do you have military service experience?
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="YES"
                              checked={formData.hasMilitaryService === "YES"}
                              onChange={(e) =>
                                handleInputChange(
                                  "hasMilitaryService",
                                  e.target.value
                                )
                              }
                              className="mr-2 text-blue-600 focus:ring-blue-600"
                            />
                            YES
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="NO"
                              checked={formData.hasMilitaryService === "NO"}
                              onChange={(e) =>
                                handleInputChange(
                                  "hasMilitaryService",
                                  e.target.value
                                )
                              }
                              className="mr-2 text-blue-600 focus:ring-blue-600"
                            />
                            NO
                          </label>
                        </div>
                      </div>

                      {formData.hasMilitaryService === "YES" && (
                        <div className="border border-gray-200 rounded-lg p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                              label="Branch"
                              value={formData.militaryService.branch}
                              onChange={(value) =>
                                handleMilitaryServiceChange("branch", value)
                              }
                              placeholder="e.g., Army, Navy, Air Force, Marines, Coast Guard"
                            />
                            <FormInput
                              label="From"
                              value={formData.militaryService.from}
                              onChange={(value) =>
                                handleMilitaryServiceChange("from", value)
                              }
                              type="date"
                            />
                            <FormInput
                              label="To"
                              value={formData.militaryService.to}
                              onChange={(value) =>
                                handleMilitaryServiceChange("to", value)
                              }
                              type="date"
                            />
                            <FormInput
                              label="Rank at Discharge"
                              value={formData.militaryService.rankAtDischarge}
                              onChange={(value) =>
                                handleMilitaryServiceChange(
                                  "rankAtDischarge",
                                  value
                                )
                              }
                            />
                            <FormInput
                              label="Type of Discharge"
                              value={formData.militaryService.typeOfDischarge}
                              onChange={(value) =>
                                handleMilitaryServiceChange(
                                  "typeOfDischarge",
                                  value
                                )
                              }
                            />
                            <FormTextarea
                              label="If other than honorable, explain"
                              value={
                                formData.militaryService.otherThanHonorable
                              }
                              onChange={(value) =>
                                handleMilitaryServiceChange(
                                  "otherThanHonorable",
                                  value
                                )
                              }
                              rows={3}
                            />
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  May we contact your previous supervisor for a
                                  reference?
                                </label>
                                <div className="flex space-x-4">
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      value="YES"
                                      checked={
                                        formData.militaryService
                                          .mayContactSupervisor === "YES"
                                      }
                                      onChange={(e) =>
                                        handleMilitaryServiceChange(
                                          "mayContactSupervisor",
                                          e.target.value
                                        )
                                      }
                                      className="mr-2 text-blue-600 focus:ring-blue-600"
                                    />
                                    YES
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      value="NO"
                                      checked={
                                        formData.militaryService
                                          .mayContactSupervisor === "NO"
                                      }
                                      onChange={(e) =>
                                        handleMilitaryServiceChange(
                                          "mayContactSupervisor",
                                          e.target.value
                                        )
                                      }
                                      className="mr-2 text-blue-600 focus:ring-blue-600"
                                    />
                                    NO
                                  </label>
                                </div>
                              </div>
                            </div>
                            <FormTextarea
                              label="Reason for Leaving"
                              value={formData.militaryService.reasonForLeaving}
                              onChange={(value) =>
                                handleMilitaryServiceChange(
                                  "reasonForLeaving",
                                  value
                                )
                              }
                              rows={3}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar in Form Footer */}
                    <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                          <span className="text-xs md:text-sm font-semibold text-gray-700">
                            Application Progress
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-base md:text-lg font-bold text-blue-600">
                            {completedFormsCount}/
                            {getFormKeysForPosition("").length}
                          </div>
                          <div className="text-xs text-gray-600">
                            Forms Completed
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">
                            Overall Progress
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {overallProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${overallProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        💼 Current: Professional Experience
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Section */}
                  <div className="bg-[#F8FAFF] px-4 md:px-8 lg:px-12 py-6 md:py-8 mt-4 md:mt-6 border border-[#E8EDFF]">
                    <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3 md:gap-4">
                      {/* Left: Previous Form */}
                      <div className="w-full lg:w-auto order-3 lg:order-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              getPreviousFormPath(
                                "/employee/professional-experience"
                              )
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-2.5 md:py-3 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base"
                        >
                          <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="text-sm md:text-base">
                            Previous Form
                          </span>
                        </button>
                      </div>

                      {/* Center: Exit Application */}
                      <div className="w-full sm:w-auto flex justify-center lg:flex-1 order-2">
                        <button
                          type="button"
                          onClick={() => navigate("/employee/task-management")}
                          className="px-4 md:px-6 lg:px-8 py-2.5 md:py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base"
                        >
                          Exit Application
                        </button>
                      </div>

                      {/* Right: Save & Next */}
                      <div className="w-full lg:w-auto flex items-center justify-end gap-3 order-1 lg:order-3">
                        {(() => {
                          // Check if form has HR notes
                          const hasHrNotes =
                            formData.hrFeedback &&
                            Object.keys(formData.hrFeedback).length > 0 &&
                            (formData.hrFeedback.comment ||
                              formData.hrFeedback.notes ||
                              formData.hrFeedback.feedback ||
                              formData.hrFeedback.note ||
                              formData.hrFeedback.companyRepSignature ||
                              formData.hrFeedback
                                .companyRepresentativeSignature ||
                              formData.hrFeedback.notarySignature ||
                              formData.hrFeedback.agencySignature ||
                              formData.hrFeedback.clientSignature ||
                              Object.keys(formData.hrFeedback).some(
                                (key) =>
                                  formData.hrFeedback[key] &&
                                  typeof formData.hrFeedback[key] ===
                                    "string" &&
                                  formData.hrFeedback[key].trim().length > 0
                              ));

                          // Check if form is locked (submitted or completed, and no HR notes)
                          const isLocked =
                            (formData.status === "submitted" ||
                              formData.status === "completed") &&
                            !hasHrNotes;

                          return (
                            <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={saving || isLocked}
                              className={`inline-flex items-center justify-center gap-2 md:gap-3 w-full max-w-xs py-2.5 md:py-3 px-3 md:px-5 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm md:text-base ${
                                saving || isLocked
                                  ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                                  : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                              }`}
                              title={
                                isLocked
                                  ? "Form is submitted. HR notes are required to make changes."
                                  : "Save and proceed to next form"
                              }
                            >
                              {saving ? (
                                <RotateCcw className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-1 md:mr-2" />
                              ) : (
                                <Send className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                              )}
                              <span>
                                {saving
                                  ? "Submitting..."
                                  : isLocked
                                  ? "Awaiting HR Feedback"
                                  : "Save & Next"}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalExperience;
