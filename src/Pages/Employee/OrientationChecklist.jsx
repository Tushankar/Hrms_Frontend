import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, FileText, Target, RotateCcw } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

const OrientationChecklist = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [formData, setFormData] = useState({
    policies: false,
    duties: false,
    emergencies: false,
    tbExposure: false,
    clientRights: false,
    complaints: false,
    documentation: false,
    handbook: false,
    applicantSignature: "",
    signatureDate: "",
  });

  const [applicationId, setApplicationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [hrFeedback, setHrFeedback] = useState(null);
  const [formStatus, setFormStatus] = useState("draft");

  const baseURL =
    import.meta.env.VITE__BASEURL || "https://api-hrms-backend.kyptronix.us";

  useEffect(() => {
    initializeForm();
    fetchProgressData();
  }, []);

  // Set today's date as default if signatureDate is empty
  useEffect(() => {
    if (!formData.signatureDate && !loading) {
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setFormData((prev) => ({ ...prev, signatureDate: todayDate }));
    }
  }, [loading, formData.signatureDate]);

  const fetchProgressData = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (response.data?.data?.application) {
        const forms = response.data.data.forms;
        setApplicationStatus(forms);

        const formKeys = [
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

        const completedForms = formKeys.filter((key) => {
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

        const progressPercentage = Math.round(
          (completedForms / formKeys.length) * 100
        );
        setOverallProgress(progressPercentage);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const initializeForm = async () => {
    try {
      setLoading(true);
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

        // Load existing form data if it exists
        if (response.data.data.forms.orientationChecklist) {
          const existingData = response.data.data.forms.orientationChecklist;
          setFormData({
            ...formData,
            ...existingData,
            // Handle signature and date data properly
            applicantSignature: existingData.applicantSignature || "",
            signatureDate: existingData.signatureDate
              ? new Date(existingData.signatureDate).toISOString().slice(0, 10)
              : "",
          });
          setFormStatus(existingData.status || "draft");
          setHrFeedback(existingData.hrFeedback || null);
        } else {
          // No saved data, set today's date
          const today = new Date();
          const todayDate = today.toISOString().slice(0, 10);
          setFormData((prev) => ({ ...prev, signatureDate: todayDate }));
        }
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

      // Prepare form data with signature and date (HR-only fields removed)
      const submissionData = {
        applicationId,
        employeeId: user._id,
        formData: {
          ...formData,
          // Ensure signature and date are included
          applicantSignature: formData.applicantSignature || "",
          signatureDate: formData.signatureDate || "",
        },
        status,
      };

      const response = await axios.post(
        `${baseURL}/onboarding/save-orientation-checklist`,
        submissionData,
        { headers, withCredentials: true }
      );

      if (response.data) {
        const message =
          status === "draft"
            ? "Orientation Checklist draft saved successfully!"
            : "Orientation Checklist submitted successfully!";
        toast.success(message, {
          duration: 4000,
          position: "top-right",
        });

        // Dispatch event after successful save to update sidebar
        window.dispatchEvent(new Event("formStatusUpdated"));

        // Give sidebar time to refresh before navigating
        setTimeout(() => {
          navigate("/employee/task-management");
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const getMissingFields = () => {
    const missing = [];

    // Check all required checkboxes
    const checkboxFields = [
      { key: "policies", label: "Policies and Procedures" },
      { key: "duties", label: "Assigned Duties and Responsibilities" },
      { key: "emergencies", label: "Client Emergencies Reporting" },
      { key: "tbExposure", label: "TB Exposure Reporting" },
      { key: "clientRights", label: "Client Rights" },
      { key: "complaints", label: "Complaints and Incidents Procedures" },
      { key: "documentation", label: "Daily Documentation Requirements" },
      { key: "handbook", label: "Employee Handbook" },
    ];

    checkboxFields.forEach(({ key, label }) => {
      if (!formData[key]) {
        missing.push(label);
      }
    });

    // Check signature
    if (!formData.applicantSignature || !formData.applicantSignature.trim()) {
      missing.push("Employee Signature");
    }

    return missing;
  };

  const handleSaveDraft = () => {
    saveForm("draft");
  };

  const handleSubmit = () => {
    const missingFields = getMissingFields();

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Explicitly prevent form submission when validation fails
      return false;
    }

    // Only proceed with saving if all validations pass
    const hasSignature =
      formData.applicantSignature && formData.applicantSignature.trim();

    const allChecked = [
      formData.policies,
      formData.duties,
      formData.emergencies,
      formData.tbExposure,
      formData.clientRights,
      formData.complaints,
      formData.documentation,
      formData.handbook,
    ].every(Boolean);

    const status = hasSignature && allChecked ? "submitted" : "draft";
    saveForm(status);
  };

  const statements = [
    {
      key: "policies",
      text: "I have read and understand the policies and procedures regarding scope of services and the types of clients served",
      highlight: "bg-gradient-to-r from-blue-50 to-indigo-50",
    },
    {
      key: "duties",
      text: "I have read and understand my assigned duties and responsibilities",
      highlight: "bg-gradient-to-r from-amber-50 to-yellow-50",
    },
    {
      key: "emergencies",
      text: "I understand to report client emergencies, problems and/or progress to supervisory nurse",
      highlight: "bg-gradient-to-r from-sky-50 to-blue-50",
    },
    {
      key: "tbExposure",
      text: "I understand that I must report suspected exposure to TB to the agency",
      highlight: "bg-gradient-to-r from-emerald-50 to-green-50",
    },
    {
      key: "clientRights",
      text: "I have read and understand the client rights",
      highlight: "bg-gradient-to-r from-orange-50 to-amber-50",
    },
    {
      key: "complaints",
      text: "I have read procedures regarding handling of complaints, medical emergencies and other incidents",
      highlight: "bg-gradient-to-r from-purple-50 to-violet-50",
    },
    {
      key: "documentation",
      text: "I have read and understand the required daily documentation of activities as client is being served",
      highlight: "bg-gradient-to-r from-teal-50 to-emerald-50",
    },
    {
      key: "handbook",
      text: "I have received a copy of the Pacific Health Systems Employee Handbook",
      highlight: "bg-gradient-to-r from-indigo-50 to-blue-50",
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />

      {/* HR Feedback Section */}
      <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

      {/* Add Southampton Script font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />

      {/* Back Button - Outside main container for consistent positioning */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 pt-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span>Back to Tasks</span>
        </button>
      </div>

      {/* Main Content Container with sidebar layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="flex gap-6">
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
              {saving && (
                <div className="mt-4">
                  <RotateCcw className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
            <div className="w-full max-w-[150%] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header with Logo */}
              <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white text-center py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-9">
                <div className="flex flex-col lg:flex-row items-center justify-center mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row items-center">
                    {/* Logo Circle */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mb-3 sm:mb-0 sm:mr-3 md:mr-4 relative overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700"></div>
                      <div className="relative z-10">
                        {/* Stylized waves/mountains */}
                        <svg
                          width="24"
                          height="14"
                          viewBox="0 0 40 24"
                          className="text-white sm:w-8 sm:h-5 md:w-10 md:h-6"
                        >
                          <path
                            d="M2 20 L8 14 L14 18 L20 12 L26 16 L32 10 L38 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M2 22 L8 16 L14 20 L20 14 L26 18 L32 12 L38 16"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.7"
                          />
                        </svg>
                        {/* Triangular elements */}
                        <div className="absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-0 h-0 border-l-2 sm:border-l-3 border-r-2 sm:border-r-3 border-b-3 sm:border-b-4 border-transparent border-b-white opacity-90"></div>
                          <div className="w-0 h-0 border-l-1 sm:border-l-2 border-r-1 sm:border-r-2 border-b-2 sm:border-b-3 border-transparent border-b-white opacity-70 ml-0.5 sm:ml-1 -mt-0.5 sm:-mt-1"></div>
                        </div>
                      </div>
                    </div>

                    {/* Company Name */}
                    <div className="text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row items-center">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white mr-0 sm:mr-2">
                          PACIFIC
                        </span>
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-red-200">
                          HEALTH
                        </span>
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-white ml-0 sm:ml-2">
                          SYSTEMS
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-blue-100 font-medium tracking-wider mt-1">
                        PRIVATE HOMECARE SERVICES
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wide leading-tight">
                  DOCUMENTATION OF ORIENTATION
                </h2>
              </div>

              {/* Document Content */}
              <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-12">
                {/* Introduction */}
                <div className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed text-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <p className="font-medium text-[#1F3A93]">
                    After attending the Pacific Health Systems Services
                    orientation, please initial the following statements and
                    sign below:
                  </p>
                </div>

                {/* Policy Statements */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 sm:space-y-6">
                    {statements.map((statement, index) => (
                      <div
                        key={statement.key}
                        className="flex items-start gap-3 sm:gap-4"
                      >
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id={statement.key}
                            checked={formData[statement.key]}
                            onChange={() => handleCheckboxChange(statement.key)}
                            className="w-5 h-5 sm:w-6 sm:h-6 border-2 rounded-md border-[#1F3A93]/30 text-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:ring-offset-2 cursor-pointer hover:border-[#1F3A93]/50 checked:bg-[#1F3A93] checked:border-[#1F3A93] transition-all duration-300 flex-shrink-0"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <span className="bg-[#1F3A93] text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-1">
                              {index + 1}
                            </span>
                            <label
                              htmlFor={statement.key}
                              className={`block text-sm sm:text-base p-3 sm:p-4 md:p-5 rounded-xl leading-relaxed text-gray-700 cursor-pointer ${statement.highlight} border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300`}
                            >
                              {statement.text}
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Signature Section - Updated with Text Input and Date */}
                  <div className="mt-12 sm:mt-16 bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-lg">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1F3A93] mb-4 sm:mb-6 text-center">
                      Electronic Signatures
                    </h3>
                    <div className="space-y-6 sm:space-y-8">
                      <div className="grid grid-cols-1 lg gap-6 sm:gap-8">
                        {/* Employee Signature Section */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
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
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                                style={{
                                  fontFamily: "'Great Vibes', cursive",
                                  fontSize: "28px",
                                  letterSpacing: "0.5px",
                                }}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Your signature will appear in Great Vibes font
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
                                  handleInputChange(
                                    "signatureDate",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Agency Representative Signature is HR-only and will appear in HR notes; removed from employee form */}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar in Form Footer */}
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
                      📝 Current: Orientation Checklist
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="bg-white px-3 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 rounded-b-2xl border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center mb-6 sm:mb-8">
                        <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">
                          Review Orientation Documentation
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                          Review all information above before submitting
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/employee/orientation-presentation`)
                          }
                          className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto py-3 sm:py-4 px-4 sm:px-6 bg-white border-2 border-[#1F3A93] text-[#1F3A93] font-semibold rounded-xl hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20 active:bg-[#E8EDFF] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base md:text-lg"
                        >
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span>Previous Form</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/employee/task-management")}
                          className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500/20 active:from-red-700 active:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base md:text-lg"
                        >
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          <span>Exit Application</span>
                        </button>

                        {(() => {
                          const hasHrNotes =
                            hrFeedback &&
                            (hrFeedback.generalNotes ||
                              hrFeedback.personalInfoNotes ||
                              hrFeedback.professionalExperienceNotes ||
                              hrFeedback.emergencyContactNotes ||
                              hrFeedback.backgroundCheckNotes ||
                              hrFeedback.cprCertificateNotes ||
                              hrFeedback.drivingLicenseNotes ||
                              hrFeedback.professionalCertificatesNotes ||
                              hrFeedback.tbSymptomScreenNotes ||
                              hrFeedback.orientationNotes ||
                              hrFeedback.w4FormNotes ||
                              hrFeedback.w9FormNotes ||
                              hrFeedback.i9FormNotes ||
                              hrFeedback.directDepositNotes ||
                              hrFeedback.codeOfEthicsNotes ||
                              hrFeedback.serviceDeliveryPoliciesNotes ||
                              hrFeedback.nonCompeteAgreementNotes ||
                              hrFeedback.misconductStatementNotes);
                          const isSubmitted =
                            formStatus === "submitted" && !hasHrNotes;

                          return (
                            <button
                              type="button"
                              onClick={handleSubmit}
                              disabled={saving || isSubmitted}
                              className={`flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto py-3 sm:py-4 px-4 sm:px-6 text-white font-bold tracking-wide rounded-xl focus:ring-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base md:text-lg ${
                                isSubmitted
                                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                                  : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] disabled:from-gray-400 disabled:to-gray-500"
                              }`}
                              title={
                                isSubmitted ? "Waiting for HR feedback" : ""
                              }
                            >
                              {saving ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                  <span>
                                    {isSubmitted
                                      ? "Awaiting HR Feedback"
                                      : "Save & Next"}
                                  </span>
                                </>
                              )}
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

        {/* Toast Configuration */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "white",
              color: "#1F3A93",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "white",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "white",
              },
            },
          }}
        />
      </div>
    </Layout>
  );
};

export default OrientationChecklist;
