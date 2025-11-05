import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Target,
  Briefcase,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";

const getFormKeysForPosition = (positionType) => {
  const baseFormKeys = [
    "personalInformation",
    "professionalExperience",
    "workExperience",
    "education",
    "references",
    "legalDisclosures",
    "positionType",
    "employmentApplication",
    "orientationPresentation",
    "w4Form",
    "w9Form",
    "i9Form",
    "emergencyContact",
    "directDeposit",
    "misconductStatement",
    "codeOfEthics",
    "serviceDeliveryPolicy",
    "nonCompeteAgreement",
    "backgroundCheck",
    "tbSymptomScreen",
    "orientationChecklist",
  ];

  // Add position-specific forms
  switch (positionType) {
    case "PCA":
      return [...baseFormKeys, "jobDescriptionPCA", "pcaTrainingQuestions"];
    case "CNA":
      return [...baseFormKeys, "jobDescriptionCNA"];
    case "LPN":
      return [...baseFormKeys, "jobDescriptionLPN"];
    case "RN":
      return [...baseFormKeys, "jobDescriptionRN"];
    default:
      return baseFormKeys;
  }
};

const PositionType = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicationId, setApplicationId] = useState(
    location.state?.applicationId || null
  );
  const [employeeId, setEmployeeId] = useState(
    location.state?.employeeId || null
  );
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [hrFeedback, setHrFeedback] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const [formData, setFormData] = useState({ positionAppliedFor: "" });
  const baseURL = import.meta.env.VITE__BASEURL;

  const getDecodedUser = () => {
    try {
      const session = Cookies.get("session");
      if (!session) return null;
      const base64Url = session.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload).user;
    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error("Session is invalid. Please log in again.");
      navigate("/login");
      return null;
    }
  };

  const initializeForm = async (userId) => {
    try {
      const token = Cookies.get("session");
      if (!token) {
        toast.error("Authentication token not found. Please log in.");
        return;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data?.data) {
        const backendData = response.data.data;

        if (backendData.application?._id) {
          setApplicationId(backendData.application._id);
        }

        const positionData = backendData.forms?.positionType;
        if (positionData) {
          setFormData({
            positionAppliedFor: positionData.positionAppliedFor || "",
          });
          setHrFeedback(positionData.hrFeedback);
          setFormStatus(positionData.status);
        }

        const forms = backendData.forms || {};
        const positionType =
          backendData.forms?.positionType?.positionAppliedFor || "";
        const relevantFormKeys = getFormKeysForPosition(positionType);

        const completedForms = relevantFormKeys.filter((key) => {
          const form = forms[key];
          return [
            "submitted",
            "completed",
            "under_review",
            "approved",
          ].includes(form?.status);
        }).length;

        const percentage =
          relevantFormKeys.length > 0
            ? Math.round((completedForms / relevantFormKeys.length) * 100)
            : 0;
        setOverallProgress(percentage);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to load form data. Please try again."
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const user = getDecodedUser();
    const currentEmployeeId = user?._id || user?.id;
    if (currentEmployeeId) {
      setEmployeeId(currentEmployeeId);
      initializeForm(currentEmployeeId);
    } else {
      setPageLoading(false);
      toast.error("Could not identify employee. Please log in again.");
    }
  }, []);

  const handleInputChange = (value) => {
    setFormData({ positionAppliedFor: value });
    if (errors.positionAppliedFor) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.positionAppliedFor.trim()) {
      newErrors.positionAppliedFor = "Position applied for is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status = "draft") => {
    if (status === "completed" && !validateForm()) {
      toast.error("Please complete all required fields before submitting.");
      return;
    }
    if (!employeeId) {
      toast.error("Missing employee information. Cannot save.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = Cookies.get("session");
      const payload = { ...formData, employeeId, applicationId, status };

      const response = await axios.post(
        `${baseURL}/onboarding/position-type/save`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const savedAppId = response.data.data?.applicationId || applicationId;
      setApplicationId(savedAppId);

      // Dispatch event to notify sidebar about position type change
      window.dispatchEvent(new CustomEvent("positionTypeSaved"));

      if (status === "completed") {
        toast.success(`Position type saved! Redirecting to dashboard...`);
        // Redirect to dashboard to see updated forms list
        setTimeout(() => {
          navigate("/employee/onboarding-dashboard", {
            state: { applicationId: savedAppId, employeeId },
          });
        }, 1500);
      } else {
        toast.success(`Form saved successfully as ${status}!`);
      }
    } catch (error) {
      console.error("Error saving position type:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save data. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading Position Type Form...</p>
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
            <aside className="w-16 flex-shrink-0 hidden md:block">
              <div className="sticky top-6 flex flex-col items-center">
                <div className="w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Application Progress
                  </div>
                </div>
              </div>
            </aside>

            {formData.positionAppliedFor === "PCA" && (
              <aside className="w-80 flex-shrink-0 hidden lg:block">
                <div className="sticky top-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
                    <h3 className="font-bold text-lg">PART 3</h3>
                    <p className="text-sm text-purple-100">
                      Position-Specific Forms
                    </p>
                  </div>
                  <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div
                      onClick={() =>
                        navigate(`/employee/job-description-pca`, {
                          state: { applicationId, employeeId },
                        })
                      }
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">
                          PCA Job Description
                        </span>
                      </div>
                    </div>
                    <div
                      onClick={() =>
                        navigate(`/employee/pca-training-questions`, {
                          state: { applicationId, employeeId },
                        })
                      }
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">
                          PCA Training Questions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            )}

            <main className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              <div className="mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="flex items-center justify-center gap-3">
                    <Briefcase className="w-8 h-8 flex-shrink-0" />
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        POSITION TYPE
                      </h1>
                      <p className="text-blue-100"></p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2"
                      htmlFor="positionAppliedFor"
                    >
                      Position Applied For *
                    </label>
                    <select
                      id="positionAppliedFor"
                      value={formData.positionAppliedFor}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.positionAppliedFor
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Position</option>
                      <option value="PCA">Personal Care Assistant (PCA)</option>
                      <option value="CNA">
                        Certified Nursing Assistant (CNA)
                      </option>
                      <option value="LPN">
                        Licensed Practical Nurse (LPN)
                      </option>
                      <option value="RN">Registered Nurse (RN)</option>
                    </select>
                    {errors.positionAppliedFor && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.positionAppliedFor}
                      </p>
                    )}

                    {formData.positionAppliedFor && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            {formData.positionAppliedFor === "PCA" &&
                              "✓ PCA Training Questions will be available in Part 3 after submission"}
                            {formData.positionAppliedFor === "CNA" &&
                              "✓ CNA Job Description will be available in Part 3 after submission"}
                            {formData.positionAppliedFor === "LPN" &&
                              "✓ LPN Job Description will be available in Part 3 after submission"}
                            {formData.positionAppliedFor === "RN" &&
                              "✓ RN Job Description will be available in Part 3 after submission"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Application Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {Math.round(
                            (overallProgress / 100) *
                              getFormKeysForPosition(
                                formData.positionAppliedFor
                              ).length
                          )}
                          /
                          {
                            getFormKeysForPosition(formData.positionAppliedFor)
                              .length
                          }
                        </div>
                        <div className="text-xs text-gray-600">
                          Forms Completed
                        </div>
                      </div>
                    </div>
                    <div>
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
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t">
                  <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-4">
                    <div className="w-full lg:w-auto">
                      <button
                        type="button"
                        onClick={() => navigate("/employee/legal-disclosures")}
                        className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-3 px-6 sm:px-8 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="text-sm sm:text-base">
                          Previous Form
                        </span>
                      </button>
                    </div>

                    <div className="w-full sm:w-auto flex justify-center lg:flex-1">
                      <button
                        type="button"
                        onClick={() => navigate("/employee/task-management")}
                        className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                      >
                        Exit Application
                      </button>
                    </div>

                    <div className="w-full lg:w-auto flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleSave("completed")}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-3 w-full max-w-xs py-3 px-5 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <RotateCcw className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <Send className="w-5 h-5 mr-2" />
                        )}
                        <span className="text-sm sm:text-base">
                          {isSubmitting ? "Submitting..." : "Save & Next"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PositionType;
