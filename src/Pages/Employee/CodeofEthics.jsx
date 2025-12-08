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

export default function CodeOfEthics() {
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
  const baseURL = import.meta.env.VITE__BASEURL;

  const shouldCountForm = (key, empType) => {
    if (key === "w4Form") return empType === "W-2";
    if (key === "w9Form") return empType === "1099";
    return true;
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (!user?._id) {
        console.error("User not found in token");
        return;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

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
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
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

      setEmployeeId(user._id);

      // Get application
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
    }
  };

  // Load saved signature and date
  const loadSignatureAndDate = async () => {
    try {
      console.log("Loading signature and date for code of ethics");
      const response = await axios.get(
        `${baseURL}/onboarding/get-code-of-ethics/${applicationId}`,
        { withCredentials: true }
      );

      console.log("Code of ethics response:", response.data);

      if (response.data?.codeOfEthics) {
        const codeOfEthicsData = response.data.codeOfEthics;
        if (codeOfEthicsData.signature) {
          console.log("Loading saved signature:", codeOfEthicsData.signature);
          setEmployeeSignature(codeOfEthicsData.signature);
        }
        if (codeOfEthicsData.date) {
          console.log("Loading saved date:", codeOfEthicsData.date);
          // Format date to YYYY-MM-DD for date input
          const dateObj = new Date(codeOfEthicsData.date);
          const formattedDate = dateObj.toISOString().split("T")[0];
          setSignatureDate(formattedDate);
        }
        if (codeOfEthicsData.status) {
          setFormStatus(codeOfEthicsData.status);
        }
        if (codeOfEthicsData.hrFeedback) {
          setHrFeedback(codeOfEthicsData.hrFeedback);
        }
      } else {
        // No saved data, set today's date as default
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);
        setSignatureDate(todayDate);
      }
    } catch (error) {
      console.error("Error loading signature and date:", error);
      // Set today's date as default if there's an error
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setSignatureDate(todayDate);
    }
  };

  useEffect(() => {
    fetchProgressData();
    initializeForm();
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
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Code of Ethics
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review the Code of Ethics document
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
                      <span>Carefully review the Code of Ethics below</span>
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
              <div className="max-w-4xl w-full px-3 sm:px-6 md:px-12 py-4 sm:py-8">
                {/* Header with Logo */}
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <img
                    src="https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png"
                    alt="Pacific Health Systems Logo"
                    className="h-16 sm:h-20"
                  />
                </div>

                {/* Title */}
                <h1 className="text-center text-sm sm:text-base font-bold mb-3 sm:mb-4 underline">
                  CODE OF ETHICS
                </h1>

                {/* Ethics List */}
                <div className="space-y-2 text-xs sm:text-[13px] leading-normal">
                  <div className="flex">
                    <span className="mr-3 shrink-0">1.</span>
                    <p>
                      PHS employees will not use the client's car for personal
                      reasons.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">2.</span>
                    <p>
                      Employees will not consume the client's food or beverages,
                      nor will they eat inside the client's home without
                      permission.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">3.</span>
                    <p>
                      Employees will not use the client's telephone for personal
                      calls.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">4.</span>
                    <p>
                      Employees will not discuss political, religious beliefs,
                      or personal problems with the client.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">5.</span>
                    <p>
                      Employees will not accept gifts or financial gratuities
                      (tips) from the client or client's representative.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">6.</span>
                    <p>
                      Employees will not loan money or other items to the client
                      and/or client representative.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">7.</span>
                    <p>
                      Employees will not sell gifts, food, or other items to or
                      for the client.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">8.</span>
                    <p>
                      Employees will not purchase any items for the client
                      unless directed in the client care plan.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">9.</span>
                    <p>
                      Employees will not bring other visitors to client's home
                      (children, friends, relatives, etc...).
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">10.</span>
                    <p>
                      Employees will not smoke in or around the client's home
                      with or without permission.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">11.</span>
                    <p>
                      Employees will not report to duty under the influence of
                      alcohol or drugs.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">12.</span>
                    <p>
                      Employees will not sleep in the client's house unless
                      ordered in service care plan.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">13.</span>
                    <p>
                      Employees will not remain in the client's home after
                      services have been rendered and completed.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">14.</span>
                    <p>
                      Employees will not falsify client's records/timesheets.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">15.</span>
                    <p>
                      Employees must report any unusual changes or events with
                      client during work hours.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">16.</span>
                    <p>
                      Employees must not breach clients' and or primary care
                      giver's privacy and confidentiality of information and
                      records against HIPPA regulations.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">17.</span>
                    <p>
                      Employees must not assume control of the financial or
                      personal affairs, or both, of the client or his/her
                      estate, including power of attorney or guardianship.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">18.</span>
                    <p>
                      Employees must not be committing any act of abuse, neglect
                      or exploitation.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">19.</span>
                    <p>
                      Employees will wear, have badge visible and adhere to the
                      dress code of appropriate scrubs for PHS.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">20.</span>
                    <p>
                      Employees will attend all mandatory quarterly meetings.
                    </p>
                  </div>

                  <div className="flex">
                    <span className="mr-3 shrink-0">21.</span>
                    <p>
                      Employees will notify the office if they are unable to
                      report to work for their assigned schedule, at least 2
                      hours before the start of the shift. If it's an emergency
                      (A written doctor's excuse will be needed to make this an
                      excused absence). Employees will provide at least a 2weeks
                      notice to request and schedule time off.
                    </p>
                  </div>
                </div>

                {/* Agreement Text */}
                <div className="mt-4 sm:mt-6 text-xs sm:text-[13px] leading-normal">
                  <p>
                    By signing my name below, I agree and promise that while in
                    the employment of Pacific Health Systems, I will abide by
                    the Code of Ethics established for Pacific Health Systems. I
                    understand that failure to abide by the code of ethics will
                    result in disciplinary action and may result in termination
                    of my employment with PHS.
                  </p>
                </div>

                {/* Signature Section */}
                <div className="mt-6 sm:mt-10">
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
                📝 Current: Code of Ethics
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate("/employee/job-description-pca")}
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
                        // Validate signature and date
                        const newErrors = {};
                        if (!employeeSignature || !employeeSignature.trim()) {
                          newErrors.signature =
                            "Digital signature is required.";
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

                        setIsSaving(true);
                        try {
                          const saveData = {
                            applicationId,
                            employeeId,
                            formData: {
                              signature: employeeSignature,
                              date: signatureDate,
                            },
                            status: "completed",
                          };

                          await axios.post(
                            `${baseURL}/onboarding/save-code-of-ethics`,
                            saveData,
                            { withCredentials: true }
                          );

                          toast.success("Code of Ethics signed successfully!");
                          navigate("/employee/service-delivery-policies");
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
    </Layout>
  );
}
