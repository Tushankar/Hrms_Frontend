import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Target, RotateCcw } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
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
  "w4Form",
  "w9Form",
  "directDeposit",
];

export default function ServiceDeliveryPolicies() {
  const navigate = useNavigate();
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [totalForms, setTotalForms] = useState(20);
  const [employmentType, setEmploymentType] = useState(null);
  const [employeeSignature, setEmployeeSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);
  const [policyInitials, setPolicyInitials] = useState({
    policy1: "",
    policy2: "",
    policy3: "",
    policy4: "",
    policy5: "",
  });
  const [policyContent, setPolicyContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [lastContentFetch, setLastContentFetch] = useState(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  const shouldCountForm = (key, empType) => {
    if (key === "w4Form") return empType === "W-2";
    if (key === "w9Form") return empType === "1099";
    return true;
  };

  // Auto-refresh policy content every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPolicyContent();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (!user?._id) {
        console.error("User not found in token for progress data");
        return;
      }

      console.log("Fetching progress data for user:", user._id);

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      console.log("Progress data response:", response.data);

      if (response.data?.data) {
        const backendData = response.data.data;
        const forms = backendData.forms || {};

        const currentEmploymentType =
          backendData.application.employmentType || "";
        setEmploymentType(currentEmploymentType);
        const filteredKeys = FORM_KEYS.filter((key) =>
          shouldCountForm(key, currentEmploymentType)
        );

        const completedForms = filteredKeys.filter((key) => {
          let form = forms[key];

          // Handle job description - check all variants
          if (key === "jobDescriptionPCA") {
            form =
              forms.jobDescriptionPCA ||
              forms.jobDescriptionCNA ||
              forms.jobDescriptionLPN ||
              forms.jobDescriptionRN;
          }

          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            (key === "employmentType" && currentEmploymentType)
          );
        }).length;

        const totalFormsCount = filteredKeys.length;
        const percentage = Math.round((completedForms / totalFormsCount) * 100);
        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
        setTotalForms(totalFormsCount);
        console.log("Progress updated:", { completedForms, percentage });
      }
    } catch (error) {
      console.error("Error fetching progress:", error.message);
    }
  };

  const initializeForm = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (!user?._id) {
        console.error("User not found in token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      console.log("Initializing form for user:", user._id);
      setEmployeeId(user._id);

      // Get application
      try {
        const appResponse = await axios.get(
          `${baseURL}/onboarding/get-application/${user._id}`,
          { withCredentials: true }
        );

        console.log("Application response:", appResponse.data);

        if (appResponse.data?.data?.application) {
          setApplicationId(appResponse.data.data.application._id);
          console.log(
            "Application ID set:",
            appResponse.data.data.application._id
          );
        }
      } catch (fetchError) {
        console.error("Error fetching application:", fetchError.message);
        toast.error("Failed to load application data: " + fetchError.message);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to initialize form: " + error.message);
    }
  };

  // Load saved signature and date
  const loadSignatureAndDate = async () => {
    try {
      console.log(
        "Loading signature and date for service delivery policy with applicationId:",
        applicationId
      );

      if (!applicationId) {
        console.warn("Application ID not set, cannot load signature and date");
        // Set today's date as default
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);
        setSignatureDate(todayDate);
        return;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/get-service-delivery-policy/${applicationId}`,
        { withCredentials: true }
      );

      console.log("Service delivery policy response:", response.data);

      if (response.data?.serviceDeliveryPolicy) {
        const policyData = response.data.serviceDeliveryPolicy;
        if (policyData.employeeSignature) {
          console.log("Loading saved signature:", policyData.employeeSignature);
          setEmployeeSignature(policyData.employeeSignature);
        }
        if (policyData.employeeSignatureDate) {
          console.log("Loading saved date:", policyData.employeeSignatureDate);
          // Format date to YYYY-MM-DD for date input
          const dateObj = new Date(policyData.employeeSignatureDate);
          const formattedDate = dateObj.toISOString().split("T")[0];
          setSignatureDate(formattedDate);
        }
        if (policyData.policyInitials) {
          console.log(
            "Loading saved policy initials:",
            policyData.policyInitials
          );
          setPolicyInitials(policyData.policyInitials);
        }
        if (policyData.status) {
          setFormStatus(policyData.status);
        }
        if (policyData.hrFeedback) {
          setHrFeedback(policyData.hrFeedback);
        }
      } else {
        // No saved data, set today's date as default
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);
        setSignatureDate(todayDate);
      }
    } catch (error) {
      console.error("Error loading signature and date:", error.message);
      // Set today's date as default if there's an error
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setSignatureDate(todayDate);
    }
  };

  // Fetch policy content from backend (admin-managed)
  const fetchPolicyContent = async () => {
    try {
      setContentLoading(true);
      console.log("Fetching policy content from backend...");

      const response = await axios.get(
        `${baseURL}/onboarding/get-service-delivery-policy-content`,
        { withCredentials: true }
      );

      console.log("Policy content response:", response.data);

      if (response.data?.content) {
        console.log(
          "Policy content updated with new data:",
          response.data.content
        );
        setPolicyContent(response.data.content);
        setLastContentFetch(new Date());
      } else {
        console.warn("No content in response, using previous data");
      }
    } catch (error) {
      console.error("Error fetching policy content:", error);
      toast.error("Failed to load latest policy content");
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeForm();
      fetchProgressData();
      await fetchPolicyContent();
    };
    init();
  }, []);

  useEffect(() => {
    if (applicationId && employeeId) {
      loadSignatureAndDate();
    }
  }, [applicationId, employeeId]);

  // Ensure today's date is set if signatureDate is still empty after loading
  useEffect(() => {
    if (!signatureDate) {
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setSignatureDate(todayDate);
    }
  }, []);

  const handleSignatureChange = (value) => {
    setEmployeeSignature(value);
    if (errors.signature) {
      setErrors((prev) => ({ ...prev, signature: null }));
    }
  };

  return (
    <Layout>
      <Navbar />
      {/* Add cursive signature fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* HR Feedback Section */}
        <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Service Delivery Policy
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Review the Service Delivery Policy document
              </p>
              {lastContentFetch && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {lastContentFetch.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                console.log("Manual refresh clicked");
                fetchPolicyContent();
              }}
              disabled={contentLoading}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh to get latest policy content"
            >
              <RotateCcw
                className={`w-5 h-5 ${contentLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="space-y-6">
            {/* Instructions Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    📋 Instructions
                  </h3>
                  <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>
                        Carefully review the Service Delivery Policy below
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>Click Save & Next to proceed</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="max-w-3xl w-full px-3 sm:px-6 md:px-12 py-4 sm:py-8">
                {/* Logo - Use fetched or default */}
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <img
                    src={
                      policyContent?.logoUrl ||
                      "https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png"
                    }
                    alt={policyContent?.companyName || "Pacific Health Systems"}
                    className="h-16 sm:h-20"
                    onError={(e) => {
                      e.target.src =
                        "https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png";
                    }}
                  />
                </div>

                {/* Company Name - Display fetched value */}
                {policyContent?.companyName && (
                  <div className="text-center mb-2 text-sm sm:text-base font-semibold text-gray-800">
                    {policyContent.companyName}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-center text-sm sm:text-base font-bold mb-4 sm:mb-6 underline">
                  {policyContent?.policyTitle || "Service Delivery Policies"}
                </h1>

                {/* Introduction Text */}
                <div className="text-xs sm:text-[13px] leading-normal mb-4 sm:mb-6">
                  <p>
                    {policyContent?.introductionText ||
                      "At the Pacific Health Systems orientation forum, employees where told of the significances of rendering quality service to our clients. Please initial the following statements and sign below:"}
                  </p>
                </div>

                {/* Policy Statements - Dynamic from Backend */}
                <div className="space-y-4 sm:space-y-6">
                  {policyContent && policyContent.policyStatements
                    ? Object.keys(policyContent.policyStatements).map((key) => {
                        const policy = policyContent.policyStatements[key];
                        const initialKey = key; // e.g., "policy1"

                        return (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3"
                          >
                            <input
                              type="text"
                              value={policyInitials[initialKey] || ""}
                              onChange={(e) =>
                                setPolicyInitials((prev) => ({
                                  ...prev,
                                  [initialKey]: e.target.value,
                                }))
                              }
                              className={`w-16 mt-0 sm:mt-3 shrink-0 text-center text-xs sm:text-sm bg-transparent outline-none italic border-b-2 ${
                                errors[initialKey]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Initials"
                              style={{ fontStyle: "italic" }}
                            />
                            <div className="text-xs sm:text-[13px] leading-normal">
                              <span>{policy.text}</span>
                            </div>
                            {errors[initialKey] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[initialKey]}
                              </p>
                            )}
                          </div>
                        );
                      })
                    : null}
                </div>

                {/* Signature Section */}
                <div className="mt-8 sm:mt-16">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                    Employee Signature
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="employeeSignature"
                      >
                        Type Your Signature *
                      </label>
                      <input
                        id="employeeSignature"
                        type="text"
                        value={employeeSignature}
                        onChange={(e) => handleSignatureChange(e.target.value)}
                        placeholder="Type your full name as signature"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.signature
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        style={{
                          fontFamily: "'Great Vibes', cursive",
                          fontSize: "28px",
                          fontWeight: "400",
                          letterSpacing: "0.5px",
                        }}
                      />
                      {errors.signature && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.signature}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Your signature will appear in Great Vibes cursive font
                      </p>
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-2"
                        htmlFor="signatureDate"
                      >
                        Date Signed *
                        <span className="text-xs text-gray-500 block">
                          (Defaults to today, can be overridden)
                        </span>
                      </label>
                      <input
                        id="signatureDate"
                        type="date"
                        value={signatureDate}
                        onChange={(e) => setSignatureDate(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.date ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.date && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
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
                📝 Current: Service Delivery Policy
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate("/employee/code-of-ethics")}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 inline mr-2" />
                  Previous Form
                </button>

                <div className="w-full sm:w-auto flex justify-center">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/task-management")}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    Exit Application
                  </button>
                </div>

                {(() => {
                  // Check if form has HR notes
                  const hasHrNotes =
                    hrFeedback &&
                    Object.keys(hrFeedback).length > 0 &&
                    (hrFeedback.comment ||
                      hrFeedback.notes ||
                      hrFeedback.feedback ||
                      hrFeedback.note ||
                      hrFeedback.companyRepSignature ||
                      hrFeedback.companyRepresentativeSignature ||
                      hrFeedback.notarySignature ||
                      hrFeedback.agencySignature ||
                      hrFeedback.clientSignature ||
                      Object.keys(hrFeedback).some(
                        (key) =>
                          hrFeedback[key] &&
                          typeof hrFeedback[key] === "string" &&
                          hrFeedback[key].trim().length > 0
                      ));

                  // Check if form is locked (submitted and no HR notes)
                  const isLocked = formStatus === "submitted" && !hasHrNotes;

                  return (
                    <button
                      type="button"
                      onClick={async () => {
                        // Validate signature, date, and initials
                        const newErrors = {};
                        if (!employeeSignature || !employeeSignature.trim()) {
                          newErrors.signature =
                            "Digital signature is required.";
                        }
                        if (!signatureDate) {
                          newErrors.date = "Date is required.";
                        }

                        // Check all policy initials are filled
                        if (
                          !policyInitials.policy1 ||
                          !policyInitials.policy1.trim()
                        ) {
                          newErrors.policy1 = "Initials required for Policy 1";
                        }
                        if (
                          !policyInitials.policy2 ||
                          !policyInitials.policy2.trim()
                        ) {
                          newErrors.policy2 = "Initials required for Policy 2";
                        }
                        if (
                          !policyInitials.policy3 ||
                          !policyInitials.policy3.trim()
                        ) {
                          newErrors.policy3 = "Initials required for Policy 3";
                        }
                        if (
                          !policyInitials.policy4 ||
                          !policyInitials.policy4.trim()
                        ) {
                          newErrors.policy4 = "Initials required for Policy 4";
                        }
                        if (
                          !policyInitials.policy5 ||
                          !policyInitials.policy5.trim()
                        ) {
                          newErrors.policy5 = "Initials required for Policy 5";
                        }

                        setErrors(newErrors);
                        if (Object.keys(newErrors).length > 0) {
                          toast.error(
                            "Please initial all policies and provide your signature and date before proceeding."
                          );
                          return;
                        }

                        // Check if applicationId and employeeId are set
                        if (!applicationId || !employeeId) {
                          toast.error(
                            "Form data not loaded. Please refresh and try again."
                          );
                          console.error("Missing applicationId or employeeId", {
                            applicationId,
                            employeeId,
                          });
                          return;
                        }

                        setIsSaving(true);
                        try {
                          const saveData = {
                            applicationId,
                            employeeId,
                            formData: {
                              employeeSignature: employeeSignature,
                              employeeDate: signatureDate,
                              policyInitials: policyInitials,
                            },
                            status: "completed",
                          };

                          console.log(
                            "Saving service delivery policy:",
                            saveData
                          );

                          await axios.post(
                            `${baseURL}/onboarding/save-service-delivery-policy`,
                            saveData,
                            { withCredentials: true }
                          );

                          toast.success(
                            "Service Delivery Policy signed successfully!"
                          );
                          navigate("/employee/non-compete-agreement");
                        } catch (error) {
                          console.error("Error saving signature:", error);
                          toast.error(
                            "Failed to save signature. Please try again."
                          );
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving || isLocked}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base ${
                        isSaving || isLocked
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                          : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                      }`}
                      title={
                        isLocked
                          ? "Form is submitted. HR notes are required to make changes."
                          : "Save and proceed to next form"
                      }
                    >
                      {isSaving ? (
                        <RotateCcw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span>
                        {isSaving
                          ? "Saving..."
                          : formStatus === "submitted" && isLocked
                          ? "Awaiting HR Feedback"
                          : "Save & Next"}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
}
