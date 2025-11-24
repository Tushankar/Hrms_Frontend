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
  Shield,
  CheckCircle,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";

// It's good practice to define constants that are used in calculations.
const FORM_KEYS = [
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

const LegalDisclosures = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State Management
  const [applicationId, setApplicationId] = useState(
    location.state?.applicationId || null
  );
  const [employeeId, setEmployeeId] = useState(
    location.state?.employeeId || null
  );
  const [pageLoading, setPageLoading] = useState(true); // Renamed for clarity: page load vs. action
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed for clarity
  const [errors, setErrors] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  // FIX: Dedicated state for HRFeedback component props
  const [hrFeedback, setHrFeedback] = useState(null);
  const [formStatus, setFormStatus] = useState(null);

  const [formData, setFormData] = useState({
    employmentAtWill: false,
    backgroundCheckConsent: false,
    drugTestingConsent: false,
    accuracyDeclaration: false,
    contactReferencesAuth: false,
    eeoStatement: false,
    dataPrivacyConsent: false,
    i9Acknowledgment: false,
    eSignatureAgreement: false,
    // Legal Questions
    usaCitizen: false,
    workedForCompanyBefore: false,
    workedForCompanyWhen: "",
    legallyAuthorizedToWorkUS: false,
    requiresVisaSponsorship: false,
    convictedOfFelony: false,
    convictionExplanation: "",
    applicantSignature: "",
    signatureDate: "",
  });

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
      navigate("/login"); // Redirect if token is bad
      return null;
    }
  };

  // REFACTORED & CONSOLIDATED INITIALIZATION LOGIC
  const initializeForm = async (userId) => {
    try {
      // FIX: Use a single, consistent token source (session cookie)
      const token = Cookies.get("session");
      if (!token) {
        toast.error("Authentication token not found. Please log in.");
        return;
      }

      // FIX: Single API call to fetch all necessary data
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data?.data) {
        const backendData = response.data.data;

        // Set Application ID
        if (backendData.application?._id) {
          setApplicationId(backendData.application._id);
        }

        // Populate form data
        const legalData = backendData.forms?.legalDisclosures;

        if (legalData) {
          setFormData({
            employmentAtWill: legalData.employmentAtWill || false,
            backgroundCheckConsent: legalData.backgroundCheckConsent || false,
            drugTestingConsent: legalData.drugTestingConsent || false,
            accuracyDeclaration: legalData.accuracyDeclaration || false,
            contactReferencesAuth: legalData.contactReferencesAuth || false,
            eeoStatement: legalData.eeoStatement || false,
            dataPrivacyConsent: legalData.dataPrivacyConsent || false,
            i9Acknowledgment: legalData.i9Acknowledgment || false,
            eSignatureAgreement: legalData.eSignatureAgreement || false,
            // Legal Questions
            usaCitizen: legalData.usaCitizen || false,
            workedForCompanyBefore: legalData.workedForCompanyBefore || false,
            workedForCompanyWhen: legalData.workedForCompanyWhen || "",
            legallyAuthorizedToWorkUS:
              legalData.legallyAuthorizedToWorkUS || false,
            requiresVisaSponsorship: legalData.requiresVisaSponsorship || false,
            convictedOfFelony: legalData.convictedOfFelony || false,
            convictionExplanation: legalData.convictionExplanation || "",
            applicantSignature: legalData.applicantSignature || "",
            signatureDate: legalData.signatureDate
              ? new Date(legalData.signatureDate).toISOString().slice(0, 10)
              : "",
          });

          setHrFeedback(legalData.hrFeedback);
          setFormStatus(legalData.status);
        } else {
          // No saved data, keep default empty values but set today's date
          const today = new Date();
          const todayDate = today.toISOString().slice(0, 10);
          setFormData((prev) => ({ ...prev, signatureDate: todayDate }));
        }

        // Calculate Overall Progress
        const forms = backendData.forms || {};
        const completedForms = FORM_KEYS.filter((key) => {
          const form = forms[key];
          return [
            "submitted",
            "completed",
            "under_review",
            "approved",
          ].includes(form?.status);
        }).length;

        const totalForms = FORM_KEYS.length;
        const percentage =
          totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
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
      setPageLoading(false); // Stop loading if no user ID
      toast.error("Could not identify employee. Please log in again.");
    }
  }, []);

  // Set today's date as default if signatureDate is empty
  useEffect(() => {
    if (!formData.signatureDate && !pageLoading) {
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setFormData((prev) => ({ ...prev, signatureDate: todayDate }));
    }
  }, [pageLoading, formData.signatureDate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async (statusOverride = null) => {
    // Validate signature
    const newErrors = {};
    if (!formData.applicantSignature || !formData.applicantSignature.trim())
      newErrors.applicantSignature = "Digital signature is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please provide your signature before submitting.");
      return;
    }

    if (!employeeId) {
      toast.error("Missing employee information. Cannot save.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = Cookies.get("session");

      // Auto-generate date when saving if not already set
      const finalSignatureDate =
        formData.signatureDate || new Date().toISOString().slice(0, 10);

      const payload = {
        employeeId,
        applicationId,
        applicantSignature: formData.applicantSignature,
        signatureDate: finalSignatureDate,
        status: "completed",
      };

      const response = await axios.post(
        `${baseURL}/onboarding/legal-disclosures/save`,
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

      // Update local state with the final date
      handleInputChange("signatureDate", finalSignatureDate);

      toast.success(`Legal disclosures completed successfully!`);
      window.dispatchEvent(new Event("formStatusUpdated"));

      setTimeout(() => {
        navigate("/employee/job-description-pca", {
          state: { applicationId: savedAppId, employeeId },
        });
      }, 100);
    } catch (error) {
      console.error("Error saving legal disclosures:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save data. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const disclosures = [];

  if (pageLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading Legal Disclosures Form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <Navbar />
        {/* Add cursive signature fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
          rel="stylesheet"
        />
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

              {/* FIX: Correct props being passed */}
              <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

              {/* Status Banner */}
              {!pageLoading && (
                <div
                  className={`m-6 p-4 rounded-lg border ${
                    formStatus === "completed" ||
                    formStatus === "submitted" ||
                    formStatus === "under_review" ||
                    formStatus === "approved"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {formStatus === "completed" ||
                    formStatus === "submitted" ||
                    formStatus === "approved" ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : formStatus === "under_review" ? (
                      <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      {formStatus === "completed" ||
                      formStatus === "submitted" ? (
                        <p className="text-base font-semibold text-green-800">
                          ✅ Progress Updated - Form Completed Successfully
                        </p>
                      ) : formStatus === "approved" ? (
                        <p className="text-base font-semibold text-green-800">
                          ✅ Form Approved
                        </p>
                      ) : formStatus === "under_review" ? (
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

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="flex items-center justify-center gap-3">
                    <Shield className="w-8 h-8 flex-shrink-0" />
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        Disclaimer & Signature
                      </h1>
                      <p className="text-blue-100"></p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  {/* Certification Statement */}
                  <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-amber-800 mb-2">
                          Important Certification
                        </h4>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          I certify that my answers are true and complete to the
                          best of my knowledge. If this application leads to
                          employment, I understand that false or misleading
                          information in my application or interview may result
                          in my release.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Applicant Signature
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
                          htmlFor="applicantSignature"
                        >
                          Type Your Signature *
                        </label>
                        <input
                          id="applicantSignature"
                          type="text"
                          value={formData.applicantSignature}
                          onChange={(e) => {
                            const newSignature = e.target.value;
                            handleInputChange(
                              "applicantSignature",
                              newSignature
                            );
                          }}
                          placeholder="Type your full name as signature"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.applicantSignature
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
                        {errors.applicantSignature && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.applicantSignature}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Your signature will appear in Great Vibes cursive font
                        </p>
                      </div>
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 mb-1"
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
                          value={formData.signatureDate}
                          onChange={(e) =>
                            handleInputChange("signatureDate", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.signatureDate
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.signatureDate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.signatureDate}
                          </p>
                        )}
                      </div>
                    </div>
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
                        {/* FIX: Removed hardcoded '23' */}
                        <div className="text-lg font-bold text-blue-600">
                          {Math.round(
                            (overallProgress / 100) * FORM_KEYS.length
                          )}
                          /{FORM_KEYS.length}
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
                        onClick={() => navigate("/employee/education")}
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

                        // Check if form is submitted (and no HR notes)
                        const isSubmitted =
                          formStatus === "submitted" && !hasHrNotes;

                        return (
                          <button
                            type="button"
                            onClick={() => handleSave()}
                            disabled={isSubmitting || isSubmitted}
                            className={`inline-flex items-center justify-center gap-3 w-full max-w-xs py-3 px-5 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base ${
                              isSubmitting || isSubmitted
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                                : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                            }`}
                            title={
                              isSubmitted
                                ? "Form is submitted. HR notes are required to make changes."
                                : "Save and proceed to next form"
                            }
                          >
                            {isSubmitting ? (
                              <RotateCcw className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                              <Send className="w-5 h-5 mr-2" />
                            )}
                            <span>
                              {isSubmitting
                                ? "Submitting..."
                                : isSubmitted
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
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalDisclosures;
