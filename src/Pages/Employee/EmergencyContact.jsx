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

// FORM_KEYS should be defined outside the component to prevent re-creation on every render.
const FORM_KEYS = [
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

const EmergencyContact = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [overallProgress, setOverallProgress] = useState(0);

  // Consolidate loading and uploading states for simpler logic
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  // Form data for emergency contacts
  const [formData, setFormData] = useState({
    staffName: "",
    title: "",
    employeeName1: "",
    contactAddress1: "",
    phoneNumber1: "",
    employeeName2: "",
    contactAddress2: "",
    phoneNumber2: "",
    employeeName3: "",
    contactAddress3: "",
    phoneNumber3: "",
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  // Format phone number as +1 (XXX) XXX-XXXX
  const formatPhone = (value) => {
    // Remove +1 prefix if it exists, then remove all non-digit characters
    const withoutPrefix = value.replace(/^\+1\s*/, "");
    const cleaned = withoutPrefix.replace(/\D/g, "");

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);

    // Format as +1 (XXX) XXX-XXXX
    if (limited.length === 0) {
      return "";
    } else if (limited.length <= 3) {
      return `+1 (${limited}`;
    } else if (limited.length <= 6) {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(
        3,
        6
      )}-${limited.slice(6)}`;
    }
  };

  // useCallback to memoize the function and avoid re-creating it on each render.
  const fetchPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;
      if (!user?._id) {
        toast.error("User session not found. Please log in again.");
        return;
      }

      // Fetch application data
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      // Process application data
      const applicationData = appResponse.data?.data;
      if (applicationData?.application) {
        setApplicationId(applicationData.application._id);
        setApplicationStatus(
          applicationData.application.applicationStatus || "draft"
        );

        // Set existing submission data for this form
        const emergencyContactForm = applicationData.forms?.emergencyContact;
        if (emergencyContactForm) {
          setSubmission(emergencyContactForm);
          // Populate form with existing data
          setFormData({
            staffName: emergencyContactForm.staffName || "",
            title: emergencyContactForm.title || "",
            employeeName1: emergencyContactForm.employeeName1 || "",
            contactAddress1: emergencyContactForm.contactAddress1 || "",
            phoneNumber1: emergencyContactForm.phoneNumber1 || "",
            employeeName2: emergencyContactForm.employeeName2 || "",
            contactAddress2: emergencyContactForm.contactAddress2 || "",
            phoneNumber2: emergencyContactForm.phoneNumber2 || "",
            employeeName3: emergencyContactForm.employeeName3 || "",
            contactAddress3: emergencyContactForm.contactAddress3 || "",
            phoneNumber3: emergencyContactForm.phoneNumber3 || "",
          });
          // Load status and HR feedback
          if (emergencyContactForm.status) {
            setFormStatus(emergencyContactForm.status);
          }
          if (emergencyContactForm.hrFeedback) {
            setHrFeedback(emergencyContactForm.hrFeedback);
          }
        }

        // Calculate overall progress dynamically
        const { forms } = applicationData;
        const completedCount = FORM_KEYS.filter((key) => {
          let form = forms[key];
          if (key === "jobDescriptionPCA") {
            form =
              forms.jobDescriptionPCA ||
              forms.jobDescriptionCNA ||
              forms.jobDescriptionLPN ||
              forms.jobDescriptionRN;
          }
          return [
            "submitted",
            "completed",
            "under_review",
            "approved",
          ].includes(form?.status);
        }).length;

        const progress = Math.round((completedCount / FORM_KEYS.length) * 100);
        setOverallProgress(progress);
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
      toast.error(error.response?.data?.message || "Failed to load form data.");
    } finally {
      setIsLoading(false);
    }
  }, [baseURL]);

  // Handle input changes for form fields
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    // Apply phone formatting for phone number fields
    const formattedValue = name.includes("phoneNumber")
      ? formatPhone(value)
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  }, []);

  // Handle form submission
  const handleSaveForm = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setIsSaving(true);
      try {
        const userCookie = Cookies.get("user");
        const user = userCookie ? JSON.parse(userCookie) : null;
        if (!user?._id) {
          toast.error("User session not found. Please log in again.");
          return;
        }

        // Prepare payload with form data
        const payload = {
          applicationId,
          employeeId: user._id,
          formData,
          status: "submitted",
        };

        // Save emergency contact data to backend
        const response = await axios.post(
          `${baseURL}/onboarding/save-emergency-contact`,
          payload,
          { withCredentials: true }
        );

        if (response.data?.success) {
          setSubmission(formData);
          toast.success("Emergency contact information saved successfully!");

          // Dispatch event to update sidebar status
          window.dispatchEvent(
            new CustomEvent("formStatusUpdated", {
              detail: { form: "emergencyContact" },
            })
          );

          // Navigate to next form (Professional Certificates)
          setTimeout(() => {
            navigate("/employee/employee-details-upload");
          }, 1500);
        }
      } catch (error) {
        console.error("Error saving emergency contact:", error);
        toast.error(
          error.response?.data?.message || "Failed to save emergency contact."
        );
      } finally {
        setIsSaving(false);
      }
    },
    [applicationId, formData, baseURL, navigate]
  );

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleBack = () => {
    navigate("/employee/non-compete-agreement");
  };

  if (isLoading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RotateCcw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="h-full flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Container with sidebar layout */}
        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Vertical Progress Bar Sidebar */}
            <div className="w-16 flex-shrink-0 hidden md:block">
              <div className="sticky top-6 flex flex-col items-center">
                {/* Vertical Progress Bar */}
                <div className="w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress}%` }}
                  ></div>
                </div>

                {/* Percentage Text */}
                <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Application Progress
                  </div>
                </div>

                {/* Loading Indicator */}
                {isSaving && (
                  <div className="mt-4">
                    <RotateCcw className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Form Content with scroll */}
            <div className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              </div>

              {/* HR Feedback Section */}
              <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

              {/* Main Form Container */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Status Banner */}
                {!isLoading && (
                  <div
                    className={`m-6 p-4 rounded-lg border ${
                      submission ||
                      applicationStatus === "under_review" ||
                      applicationStatus === "approved"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {submission || applicationStatus === "approved" ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : applicationStatus === "under_review" ? (
                        <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      ) : (
                        <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        {submission ? (
                          <>
                            <p className="text-base font-semibold text-green-800">
                              ✅ Progress Updated - Form Completed Successfully
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                              You cannot make any changes to the form until HR
                              provides their feedback.
                            </p>
                          </>
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
                            ⚠️ Not filled yet - Complete this form to update
                            your progress
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Header Section */}
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <UserPlus className="w-8 h-8 mr-3" />
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                          EMERGENCY CONTACT INFORMATION
                        </h1>
                        <p className="text-blue-100"></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-6">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-2">
                        Complete Your Emergency Contact Information
                      </p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Enter your staff name and title</li>
                        <li>
                          Provide information for up to 3 emergency contacts
                        </li>
                        <li>
                          Ensure all contact details are accurate and complete
                        </li>
                        <li>Click Save Emergency Contact to submit</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <form
                  onSubmit={handleSaveForm}
                  className="p-6 md:p-8 space-y-6"
                >
                  {/* Staff Information Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      Staff Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Staff Name *
                        </label>
                        <input
                          type="text"
                          name="staffName"
                          value={formData.staffName}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title/Position *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter your job title"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact 1 */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Emergency Contact 1 *
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          name="employeeName1"
                          value={formData.employeeName1}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="contactAddress1"
                          value={formData.contactAddress1}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber1"
                          value={formData.phoneNumber1}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact 2 */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      Emergency Contact 2 (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          name="employeeName2"
                          value={formData.employeeName2}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="contactAddress2"
                          value={formData.contactAddress2}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber2"
                          value={formData.phoneNumber2}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact 3 */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Emergency Contact 3 (Optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          name="employeeName3"
                          value={formData.employeeName3}
                          onChange={handleInputChange}
                          placeholder="Full name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="contactAddress3"
                          value={formData.contactAddress3}
                          onChange={handleInputChange}
                          placeholder="Street address"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber3"
                          value={formData.phoneNumber3}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Important Notice
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>All fields marked with * are required</li>
                      <li>At least one emergency contact is required</li>
                      <li>Ensure contact details are current and accurate</li>
                      <li>
                        This information will be used in case of emergency
                      </li>
                    </ul>
                  </div>
                </form>

                {/* Progress Bar in Form Footer */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mx-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Application Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round((overallProgress / 100) * 20)}/20
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
                    📝 Current: Emergency Contact
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="bg-white px-6 py-8 rounded-b-2xl border-t border-gray-100">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        Ready to Continue?
                      </h4>
                      <p className="text-gray-600">
                        {submission
                          ? "Your Emergency Contact information has been saved. Click below to continue."
                          : "Complete your emergency contact information and save to proceed."}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/employee/non-compete-agreement")
                        }
                        className="flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-[#1F3A93] text-[#1F3A93] font-semibold rounded-xl hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Previous Form</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/employee/task-management")}
                        className="flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Exit Application</span>
                      </button>

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
                            type="submit"
                            disabled={isSaving || isSubmitted}
                            onClick={handleSaveForm}
                            className={`flex items-center justify-center gap-3 py-4 px-6 font-bold rounded-xl focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-300 shadow-lg hover:shadow-xl ${
                              isSaving || isSubmitted
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                                : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                            }`}
                            title={
                              isSubmitted
                                ? "Form is submitted. HR notes are required to make changes."
                                : "Save and proceed to next form"
                            }
                          >
                            {isSaving ? (
                              <>
                                <RotateCcw className="w-5 h-5 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {isSubmitted
                                    ? "Awaiting HR Feedback"
                                    : "Save & Next"}
                                </span>
                                <CheckCircle className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmergencyContact;
