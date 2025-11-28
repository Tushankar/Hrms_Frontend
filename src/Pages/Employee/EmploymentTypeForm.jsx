import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Target,
  RotateCcw,
  Send,
  UserPlus,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";

const FORM_KEYS = [
  "employmentType",
  "personalInformation",
  "professionalExperience",
  "workExperience",
  "education",
  "references",
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

const shouldCountForm = (key, employmentType) => {
  if (key === "w4Form") return employmentType === "W-2";
  if (key === "w9Form") return employmentType === "1099";
  return true;
};

const EmploymentTypeForm = () => {
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [totalForms, setTotalForms] = useState(21);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  const [employmentType, setEmploymentType] = useState("");

  const [formsData, setFormsData] = useState({});
  const [completedSetData, setCompletedSetData] = useState(new Set());

  const baseURL = import.meta.env.VITE__BASEURL;

  const calculateProgress = useCallback(
    (empType) => {
      const filteredKeys = FORM_KEYS.filter((key) =>
        shouldCountForm(key, empType)
      );
      const completed = filteredKeys.filter((key) => {
        const form = formsData[key];
        return (
          form?.status === "submitted" ||
          form?.status === "completed" ||
          form?.status === "under_review" ||
          form?.status === "approved" ||
          completedSetData.has(key) ||
          (key === "employmentType" && empType)
        );
      }).length;
      const total = filteredKeys.length;
      setTotalForms(total);
      setCompletedFormsCount(completed);
      setOverallProgress(Math.round((completed / total) * 100));
    },
    [formsData, completedSetData]
  );

  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;
      if (!user?._id) {
        toast.error("User session not found. Please log in again.");
        navigate("/login");
        return;
      }

      // Get application data
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data) {
        const appData = appResponse.data.data;
        setApplicationId(appData.application._id);
        setApplicationStatus(appData.application.applicationStatus);

        // Calculate progress
        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        setFormsData(forms);
        setCompletedSetData(completedSet);

        const currentEmploymentType = appData.application.employmentType || "";
        setEmploymentType(currentEmploymentType);
        calculateProgress(currentEmploymentType);

        // Set employment type if exists
        if (appData.application.employmentType) {
          setEmploymentType(appData.application.employmentType);
          setFormStatus("completed");
        }
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
      toast.error("Failed to load page data.");
    } finally {
      setIsLoading(false);
    }
  }, [baseURL, navigate]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  useEffect(() => {
    calculateProgress(employmentType);
  }, [employmentType, calculateProgress]);

  const handleSaveForm = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!employmentType) {
        toast.error("Please select an employment type.");
        return;
      }
      setIsSaving(true);
      try {
        const payload = {
          employmentType,
        };

        const response = await axios.post(
          `${baseURL}/api/applications/${applicationId}/employment-type`,
          payload,
          { withCredentials: true }
        );

        if (response.data) {
          toast.success("Employment type saved successfully!");

          // Dispatch event to update sidebar status
          window.dispatchEvent(
            new CustomEvent("formStatusUpdated", {
              detail: { form: "employmentType" },
            })
          );

          // Refresh the page data to update progress
          await fetchPageData();

          // Navigate to next form based on type
          setTimeout(() => {
            if (employmentType === "W-2") {
              navigate("/employee/w4-form");
            } else {
              navigate("/employee/w9-form");
            }
          }, 1500);
        }
      } catch (error) {
        console.error("Error saving employment type:", error);
        toast.error(
          error.response?.data?.message || "Failed to save employment type."
        );
      } finally {
        setIsSaving(false);
      }
    },
    [applicationId, employmentType, baseURL, navigate]
  );

  if (isLoading) {
    return (
      <Layout>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/employee/dashboard")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Employment Type Selection
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Please select your preferred employment type
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Progress: {overallProgress}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
          {/* Status Banner */}
          {!isLoading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                employmentType
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {employmentType ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {employmentType ? (
                    <>
                      <p className="text-base font-semibold text-green-800">
                        ✅ Employment Type Selected - {employmentType}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        You cannot make any changes to the form until HR
                        provides their feedback.
                      </p>
                    </>
                  ) : (
                    <p className="text-base font-semibold text-red-800">
                      ⚠️ Not filled yet - Select your employment type to update
                      your progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}{" "}
          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select Employment Type
              </h2>
              <p className="text-gray-600 mb-6">
                Choose the type of employment you are seeking. This will
                determine which tax forms you need to complete.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="w2"
                    name="employmentType"
                    value="W-2"
                    checked={employmentType === "W-2"}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="w2"
                    className="ml-3 text-sm font-medium text-gray-900"
                  >
                    W-2 Employee - Traditional employee with payroll taxes
                    withheld
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="1099"
                    name="employmentType"
                    value="1099"
                    checked={employmentType === "1099"}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="1099"
                    className="ml-3 text-sm font-medium text-gray-900"
                  >
                    1099 Contractor - Independent contractor responsible for own
                    taxes
                  </label>
                </div>
              </div>
            </div>

            {/* HR Feedback */}
            {hrFeedback && (
              <HRFeedback
                feedback={hrFeedback}
                onUpdateFeedback={setHrFeedback}
                applicationId={applicationId}
                formType="employmentType"
              />
            )}

            {/* Application Progress Section */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Application Progress
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {completedFormsCount}/{totalForms}
                  </div>
                  <div className="text-xs text-gray-600">Forms Completed</div>
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
                📝 Current: Employment Type Selection
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate("/employee/dashboard")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveForm}
                  disabled={isSaving || !employmentType}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmploymentTypeForm;
