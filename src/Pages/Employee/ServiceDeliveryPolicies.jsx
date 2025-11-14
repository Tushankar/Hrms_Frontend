import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Target, RotateCcw } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";

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

export default function ServiceDeliveryPolicies() {
  const navigate = useNavigate();
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [employeeSignature, setEmployeeSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [policyInitials, setPolicyInitials] = useState({
    policy1: "",
    policy2: "",
    policy3: "",
    policy4: "",
    policy5: "",
  });
  const baseURL = import.meta.env.VITE__BASEURL;

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

        const completedForms = FORM_KEYS.filter((key) => {
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
            form?.status === "approved"
          );
        }).length;

        const percentage = Math.round(
          (completedForms / FORM_KEYS.length) * 100
        );
        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
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

  useEffect(() => {
    const init = async () => {
      await initializeForm();
      fetchProgressData();
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

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Service Delivery Policy
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review the Service Delivery Policy document
            </p>
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
                {/* Header with Logo */}
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <img
                    src="https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png"
                    alt="Pacific Health Systems Logo"
                    className="h-16 sm:h-20"
                  />
                </div>

                {/* Title */}
                <h1 className="text-center text-sm sm:text-base font-bold mb-4 sm:mb-6 underline">
                  Service Delivery Policies
                </h1>

                {/* Introduction Text */}
                <div className="text-xs sm:text-[13px] leading-normal mb-4 sm:mb-6">
                  <p>
                    At the Pacific Health Systems orientation forum, employees
                    where told of the significances of rendering quality service
                    to our clients. Please initial the following statements and
                    sign below:
                  </p>
                </div>

                {/* Policy Statements */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Statement 1 - Magenta highlight */}
                  <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy1}
                      onChange={(e) =>
                        setPolicyInitials((prev) => ({
                          ...prev,
                          policy1: e.target.value,
                        }))
                      }
                      className="w-16 mt-0 sm:mt-3 shrink-0 text-center text-xs sm:text-sm bg-transparent outline-none italic"
                      placeholder="Initials"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-xs sm:text-[13px] leading-normal">
                      <span className="bg-[#E91E8C]">
                        I am aware of the agency policy of NO "EXU Login, NO
                        pay"
                      </span>
                      <span className="bg-[#E91E8C]">
                        . I understand that I have to complete my hours detail
                        for the previous Date within 6 days and payroll week by
                        11:00am on Monday
                      </span>
                      <span className="bg-[#E91E8C]">
                        {" "}
                        of the Payroll week and send in the copies of the
                        Progress Notes by email to{" "}
                      </span>
                      <span className="bg-[#9400D3] text-white">
                        office@pacifichealthsystems.com
                      </span>
                      <span className="bg-[#E91E8C]">
                        {" "}
                        or by dropping them at the office.
                      </span>
                    </div>
                  </div>

                  {/* Statement 2 - Yellow highlight */}
                  <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy2}
                      onChange={(e) =>
                        setPolicyInitials((prev) => ({
                          ...prev,
                          policy2: e.target.value,
                        }))
                      }
                      className="w-16 mt-0 sm:mt-3 shrink-0 text-center text-xs sm:text-sm bg-transparent outline-none italic"
                      placeholder="Initials"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-xs sm:text-[13px] leading-normal">
                      <span className="bg-yellow-300">
                        I understand that NO CALL, NO SHOW results in immediate
                        termination
                      </span>
                    </div>
                  </div>

                  {/* Statement 3 - Cyan highlight */}
                  <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy3}
                      onChange={(e) =>
                        setPolicyInitials((prev) => ({
                          ...prev,
                          policy3: e.target.value,
                        }))
                      }
                      className="w-16 mt-0 sm:mt-3 shrink-0 text-center text-xs sm:text-sm bg-transparent outline-none italic"
                      placeholder="Initials"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-xs sm:text-[13px] leading-normal">
                      <span className="bg-cyan-400">
                        Should there be a need to attend to non-business or
                        family matters during my scheduled hours, I understand
                        that{" "}
                      </span>
                      <span className="bg-cyan-400">
                        I have to let the Administration or my supervisor know
                        my intentions of my plans to be off-duty as early as
                        possible
                      </span>
                      <span className="bg-cyan-400">.</span>
                    </div>
                  </div>

                  {/* Statement 4 */}
                  <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy4}
                      onChange={(e) =>
                        setPolicyInitials((prev) => ({
                          ...prev,
                          policy4: e.target.value,
                        }))
                      }
                      className="w-16 mt-0 sm:mt-3 shrink-0 text-center text-xs sm:text-sm bg-transparent outline-none italic"
                      placeholder="Initials"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-xs sm:text-[13px] leading-normal">
                      I understand that it is against agency policy to borrow
                      money from my client or tell my client about my personal
                      challenges.
                    </div>
                  </div>

                  {/* Statement 5 */}
                  <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy5}
                      onChange={(e) =>
                        setPolicyInitials((prev) => ({
                          ...prev,
                          policy5: e.target.value,
                        }))
                      }
                      className="w-16 mt-0 sm:mt-3 shrink-0 text-center text-xs sm:text-sm bg-transparent outline-none italic"
                      placeholder="Initials"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-xs sm:text-[13px] leading-normal">
                      I understand that services are performed at client's home
                      and I must seek agency approval before driving the client
                      on Doctor's appointments, grocery shopping, purchase
                      medication etc.
                    </div>
                  </div>
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
                    {completedFormsCount}/20
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

                <button
                  type="button"
                  onClick={async () => {
                    // Validate signature and date
                    const newErrors = {};
                    if (!employeeSignature || !employeeSignature.trim()) {
                      newErrors.signature = "Digital signature is required.";
                    }
                    if (!signatureDate) {
                      newErrors.date = "Date is required.";
                    }

                    setErrors(newErrors);
                    if (Object.keys(newErrors).length > 0) {
                      toast.error(
                        "Please provide your signature and date before proceeding."
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

                      console.log("Saving service delivery policy:", saveData);

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
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <RotateCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span className="text-sm sm:text-base">
                    {isSaving ? "Saving..." : "Save & Next"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
}
