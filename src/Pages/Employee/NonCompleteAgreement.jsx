import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Target,
  Send,
  Calendar,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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

const NonCompleteAgreement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [employeeSignature, setEmployeeSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [errors, setErrors] = useState({});
  const [savedSignatureUrl, setSavedSignatureUrl] = useState("");
  const [companyRepSignature, setCompanyRepSignature] = useState("");
  const [companyRepName, setCompanyRepName] = useState("");
  const baseURL = import.meta.env.VITE__BASEURL;

  // Helper to build normalized full URL
  const buildFullUrl = (relativePath) => {
    if (!relativePath) return "";
    const base = (baseURL || "").replace(/\/+$/, "");
    const rel = relativePath.replace(/^\/+/, "");
    return `${base}/${rel}`;
  };

  // Form data for the agreement fields
  const [formData, setFormData] = useState({
    day: "",
    month: "",
    year: "20__",
    employeeName: "",
    employeeAddress: "",
    employeePosition: "",
    companyRepSignature: "",
    companyRepName: "",
    employeeSignature: "",
    employeeSignatureName: "", // Employee name in signature section
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    initializeForm();
  }, []);

  // Listen for form status updates from other components
  useEffect(() => {
    const handleFormStatusUpdate = () => {
      // Re-calculate progress when other forms are updated
      initializeForm();
    };

    window.addEventListener("formStatusUpdated", handleFormStatusUpdate);

    return () => {
      window.removeEventListener("formStatusUpdated", handleFormStatusUpdate);
    };
  }, []);

  // Load saved signature and form data
  const loadSignatureAndDate = async () => {
    try {
      console.log("Loading signature and form data for non-compete agreement");
      const response = await axios.get(
        `${baseURL}/onboarding/get-non-compete-agreement/${applicationId}`,
        { withCredentials: true }
      );

      console.log("Non-compete agreement response:", response.data);

      if (response.data?.nonCompeteAgreement) {
        const agreementData = response.data.nonCompeteAgreement;

        // Load form data
        if (agreementData.day)
          setFormData((prev) => ({ ...prev, day: agreementData.day }));
        if (agreementData.month)
          setFormData((prev) => ({ ...prev, month: agreementData.month }));
        if (agreementData.year)
          setFormData((prev) => ({ ...prev, year: agreementData.year }));
        if (agreementData.employeeName)
          setFormData((prev) => ({
            ...prev,
            employeeName: agreementData.employeeName,
          }));
        if (agreementData.employeeAddress)
          setFormData((prev) => ({
            ...prev,
            employeeAddress: agreementData.employeeAddress,
          }));
        if (agreementData.employeePosition)
          setFormData((prev) => ({
            ...prev,
            employeePosition: agreementData.employeePosition,
          }));

        // Load signature
        if (agreementData.employeeSignature) {
          console.log(
            "Loading saved signature:",
            agreementData.employeeSignature
          );
          setEmployeeSignature(agreementData.employeeSignature);
        }
        if (agreementData.employeeDate) {
          console.log("Loading saved date:", agreementData.employeeDate);
          // Format date to YYYY-MM-DD for date input
          const dateObj = new Date(agreementData.employeeDate);
          const formattedDate = dateObj.toISOString().split("T")[0];
          setSignatureDate(formattedDate);
        }
        // Load employee signature name
        if (agreementData.employeeSignatureName) {
          setFormData((prev) => ({
            ...prev,
            employeeSignatureName: agreementData.employeeSignatureName,
          }));
        }

        // Load company representative data only if it exists
        if (
          agreementData.companyRepSignature &&
          agreementData.companyRepSignature.trim()
        ) {
          setCompanyRepSignature(agreementData.companyRepSignature);
        } else {
          setCompanyRepSignature("");
        }
        if (
          agreementData.companyRepName &&
          agreementData.companyRepName.trim()
        ) {
          setCompanyRepName(agreementData.companyRepName);
        } else {
          setCompanyRepName("");
        }
      } else {
        // No saved data, set today's date as default
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);
        setSignatureDate(todayDate);
      }
    } catch (error) {
      console.error("Error loading signature and form data:", error);
      // Set today's date as default if there's an error
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setSignatureDate(todayDate);
    }
  };

  useEffect(() => {
    if (applicationId && employeeId) {
      loadSignatureAndDate();
    }
  }, [applicationId, employeeId]);

  // Function to use saved signature from PersonalDetails
  const useSavedSignature = async () => {
    try {
      const userToken = Cookies.get("session");
      const decodedToken = userToken && jwtDecode(userToken);
      const user = decodedToken?.user;

      if (user && user.signatureImage) {
        // Check if it's already a full URL or just a relative path
        let signaturePath = user.signatureImage;
        if (signaturePath.startsWith("http")) {
          // It's already a full URL, use it directly
          setEmployeeSignature(signaturePath);
        } else {
          // It's a relative path, ensure it doesn't start with slash for SignaturePad
          if (signaturePath.startsWith("/")) {
            signaturePath = signaturePath.substring(1);
          }
          setEmployeeSignature(signaturePath);
        }
        toast.success("Saved signature loaded successfully!");
      } else {
        toast.error(
          "No saved signature found in your profile. Please add one in Personal Details first."
        );
      }
    } catch (error) {
      console.error("Error loading saved signature:", error);
      toast.error("Failed to load saved signature");
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
      // Try to get signature from JWT token first
      if (user?.signatureImage) {
        setSavedSignatureUrl(buildFullUrl(user.signatureImage));
      } else {
        // If not in JWT, try to fetch from backend
        try {
          const profileResponse = await axios.get(
            `${baseURL}/onboarding/get-employee-profile/${user._id}`,
            { withCredentials: true }
          );
          if (profileResponse.data?.employee?.signatureImage) {
            setSavedSignatureUrl(
              buildFullUrl(profileResponse.data.employee.signatureImage)
            );
          }
        } catch (profileError) {
          console.warn("Could not load signature from profile:", profileError);
        }
      }

      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        const appId = appResponse.data.data.application._id;
        setApplicationId(appId);

        // Calculate progress
        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

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

          const isCompleted =
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key);

          return isCompleted;
        }).length;

        const percentage = Math.round(
          (completedForms / FORM_KEYS.length) * 100
        );

        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
      }

      const templateResponse = await axios.get(
        `${baseURL}/onboarding/get-non-compete-template`,
        { withCredentials: true }
      );

      if (templateResponse.data?.template) {
        setTemplate(templateResponse.data.template);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

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
          {/* Status Banner */}
          {!loading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                employeeSignature
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {employeeSignature ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {employeeSignature ? (
                    <p className="text-base font-semibold text-green-800">
                      ✅ Progress Updated - Form Completed Successfully
                    </p>
                  ) : (
                    <p className="text-base font-semibold text-red-800">
                      ⚠️ Not filled yet - Sign the document to complete your
                      progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Non-Compete Agreement
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review and fill out the Non-Compete Agreement form and sign
              digitally
            </p>
          </div>

          <div className="space-y-6">
            {/* Instructions Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    📋 Instructions
                  </h3>
                  <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>Review the Non-Compete Agreement form below</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>
                        Fill in the required fields (date, employee name,
                        address, position)
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        3.
                      </span>
                      <span>
                        Sign digitally using the signature pad in the agreement
                        template
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        4.
                      </span>
                      <span>Click Save & Next to confirm</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Step 1: Non-Compete Agreement Form
              </h2>
              <div className="max-w-4xl mx-auto bg-white p-3 sm:p-6 md:p-12 font-serif text-xs sm:text-sm leading-relaxed border border-gray-200 rounded-lg">
                {/* Page 1 */}
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-center text-sm sm:text-base font-bold mb-4 sm:mb-8 border-b border-gray-400 pb-2">
                    NON-COMPETE AGREEMENT
                  </h1>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 text-[10px] sm:text-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1 sm:gap-0">
                      <span className="mr-0 sm:mr-2">
                        This Non-Compete (the "Agreement") is made as of this
                      </span>
                      <input
                        type="text"
                        value={formData.day}
                        onChange={(e) => handleChange("day", e.target.value)}
                        className="border-0 border-b border-black w-8 text-center focus:outline-none focus:border-b-2 bg-transparent"
                      />
                      <span className="mx-1">day of</span>
                      <input
                        type="text"
                        value={formData.month}
                        onChange={(e) => handleChange("month", e.target.value)}
                        className="border-0 border-b border-black w-20 text-center focus:outline-none focus:border-b-2 bg-transparent"
                      />
                      <span>,</span>
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="border-0 border-b border-black w-16 text-center mx-1 focus:outline-none focus:border-b-2 bg-transparent"
                      />
                      <span>(the "Effective Date")</span>
                    </div>

                    <p>
                      by and between Pacific Health Systems LLC ("Company"),
                      located at 303 Corporate Center Dr., Suite 325,
                      Stockbridge, GA 30281, and
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1 sm:gap-0">
                      <input
                        type="text"
                        value={formData.employeeName}
                        onChange={(e) =>
                          handleChange("employeeName", e.target.value)
                        }
                        className="border-0 border-b border-black w-full sm:w-48 focus:outline-none focus:border-b-2 bg-transparent"
                      />
                      <span className="mx-0 sm:mx-2">
                        ("Employee"), residing at
                      </span>
                    </div>

                    <input
                      type="text"
                      value={formData.employeeAddress}
                      onChange={(e) =>
                        handleChange("employeeAddress", e.target.value)
                      }
                      className="border-0 border-b border-black w-full focus:outline-none focus:border-b-2 bg-transparent"
                    />

                    <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1 sm:gap-0">
                      <span className="mr-0 sm:mr-2">
                        Employee will be serving as
                      </span>
                      <input
                        type="text"
                        value={formData.employeePosition}
                        onChange={(e) =>
                          handleChange("employeePosition", e.target.value)
                        }
                        className="border-0 border-b border-black w-full sm:w-40 focus:outline-none focus:border-b-2 bg-transparent"
                      />
                      <span>.</span>
                    </div>

                    <p>
                      Employee may have access to or may generate or otherwise
                      come into contact with proprietary and/or confidential
                      information of the Company or the Company's clients. The
                      Company wishes to enter into a non-compete agreement in
                      the event Employee terminates his or her employment. In
                      consideration of the promises and mutual covenants herein,
                      the parties agree as follows:
                    </p>
                  </div>

                  <h3 className="font-bold text-blue-700 mb-2">
                    1. Employee Covenants.
                  </h3>

                  <p className="mb-4">
                    In consideration of offer of employment or continued
                    employment with the Company, Employee covenants that during
                    their employment with the Company and for a period of two
                    (2) years or the longest period of time allowed by state
                    law, whichever is shorter, after said employment is ended
                    for any reason, including but not limited to the termination
                    of their employment due to inadequate performance or
                    resignation:
                  </p>

                  <div className="ml-4 sm:ml-8 mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                    <div className="flex">
                      <span className="mr-4">a.</span>
                      <p>
                        Employee shall not induce, directly or indirectly, any
                        other employees of the Company to terminate their
                        employment.
                      </p>
                    </div>
                    <div className="flex">
                      <span className="mr-4">b.</span>
                      <p>
                        Employee shall not solicit the business of any client of
                        the Company.
                      </p>
                    </div>
                    <div className="flex">
                      <span className="mr-4">c.</span>
                      <p>
                        Employee shall not offer same or similar services to a
                        client that they previously served during employment.
                      </p>
                    </div>
                    <div className="flex">
                      <span className="mr-4">d.</span>
                      <p>
                        Employee shall not induce, directly or indirectly, any
                        client of the Company to transfer services to another
                        agency.
                      </p>
                    </div>
                  </div>

                  <h3 className="font-bold text-blue-700 mb-2">
                    2. Confidentiality Agreement.
                  </h3>

                  <p className="mb-6">
                    Employee shall not, without written consent, share or use
                    any information relating to the Company that has not been
                    previously publicly released including but not limited to
                    patient charts, trade secrets, proprietary and confidential
                    information, research, designs, financial data, customer and
                    employee records, and marketing plans.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">
                    3. Injunctive Relief.
                  </h3>

                  <p className="mb-6">
                    Employee acknowledges that disclosure of any confidential
                    information or breach of any of the noncompetitive covenants
                    will cause irreparable harm to the Company. Injunctive
                    relief is agreed to be an appropriate remedy.
                  </p>

                  <div className="text-xs text-gray-600 border-t border-gray-300 pt-2 mt-8">
                    1 | Page
                  </div>
                </div>

                {/* Page 2 */}
                <div className="mt-12">
                  <h3 className="font-bold text-blue-700 mb-2">
                    4. Binding Effect.
                  </h3>

                  <p className="mb-6">
                    This Agreement is binding upon the parties and their legal
                    representatives, successors, and permitted assigns.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">
                    5. Severability.
                  </h3>

                  <p className="mb-6">
                    If any provision is deemed invalid, the remainder shall
                    still be enforceable.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">
                    6. Governing Law.
                  </h3>

                  <p className="mb-6">
                    This Agreement shall be governed by the laws of the State of
                    Georgia.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">
                    7. Dispute Resolution.
                  </h3>

                  <p className="mb-6">
                    Disputes shall be brought only in Georgia courts. All
                    parties waive the right to trial by jury to the maximum
                    extent permitted by law.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">8. Headings.</h3>

                  <p className="mb-6">
                    Section headings are for convenience only and do not affect
                    interpretation.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">
                    9. Entire Agreement.
                  </h3>

                  <p className="mb-6">
                    This document contains the full agreement and supersedes
                    prior oral or written agreements.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">
                    10. Amendment.
                  </h3>

                  <p className="mb-6">
                    This Agreement can only be amended in writing signed by both
                    parties.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">11. Notices.</h3>

                  <p className="mb-6">
                    All notices must be in writing and delivered to the parties'
                    last known addresses.
                  </p>

                  <h3 className="font-bold text-blue-700 mb-2">12. Waiver.</h3>

                  <p className="mb-8">
                    Waiver of any provision must be in writing and does not
                    waive any other rights.
                  </p>

                  <p className="mb-12">
                    IN WITNESS WHEREOF, this Agreement has been executed as of
                    the date first above written.
                  </p>

                  {/* Signature Section */}
                  <div className="space-y-8 sm:space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                      <div>
                        <div className="border-b border-black mb-2 h-8 sm:h-12 flex items-end pb-1">
                          {companyRepSignature ? (
                            <p
                              className="text-lg"
                              style={{
                                fontFamily: "'Great Vibes', cursive",
                                fontSize: "28px",
                                fontWeight: "400",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {companyRepSignature}
                            </p>
                          ) : (
                            <span className="text-gray-400 italic">
                              Not provided yet
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs">
                          Company Representative Signature
                        </p>
                      </div>
                      <div>
                        <div className="border-b border-black mb-2 h-8 sm:h-12 flex items-center px-2">
                          {companyRepName ? (
                            <span className="text-sm">{companyRepName}</span>
                          ) : (
                            <span className="text-gray-400 italic">
                              Not provided yet
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs">
                          Company Representative Name and Title
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
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
                          onChange={(e) =>
                            handleSignatureChange(e.target.value)
                          }
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

                  <div className="text-xs text-gray-600 border-t border-gray-300 pt-2 mt-16">
                    2 | Page
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
                📝 Current: Non-Compete Agreement
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/employee/service-delivery-policies")
                  }
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

                    setIsSaving(true);
                    try {
                      const userToken = Cookies.get("session");
                      const decodedToken = userToken && jwtDecode(userToken);
                      const user = decodedToken?.user;

                      if (!user?._id) {
                        toast.error("Session expired. Please login again.");
                        navigate("/login");
                        return;
                      }

                      console.log(
                        "Saving non-compete agreement with signature:",
                        {
                          employeeSignature,
                        }
                      );

                      const response = await axios.post(
                        `${baseURL}/onboarding/save-non-compete-agreement`,
                        {
                          applicationId,
                          employeeId: user._id,
                          formData: {
                            day: formData.day
                              ? parseInt(formData.day) || null
                              : null,
                            month: formData.month || "",
                            year: formData.year
                              ? parseInt(formData.year) || null
                              : null,
                            employeeName: formData.employeeName,
                            employeeAddress: formData.employeeAddress,
                            employeePosition: formData.employeePosition,
                            employeeSignature: employeeSignature || "",
                            employeeDate: signatureDate || null,
                            employeeSignatureName:
                              formData.employeeSignatureName || "",
                          },
                          status: "completed",
                        },
                        { withCredentials: true }
                      );

                      console.log("Save response:", response.data);

                      if (response.data) {
                        toast.success(
                          "Non-Compete Agreement completed successfully!"
                        );
                        window.dispatchEvent(new Event("formStatusUpdated"));

                        // Re-fetch application data to update progress
                        try {
                          // Add a small delay to ensure backend has processed the save
                          setTimeout(async () => {
                            const appResponse = await axios.get(
                              `${baseURL}/onboarding/get-application/${user._id}`,
                              { withCredentials: true }
                            );

                            if (appResponse.data?.data?.application) {
                              const backendData = appResponse.data.data;
                              const forms = backendData.forms || {};
                              const completedFormsArray =
                                backendData.application?.completedForms || [];
                              const completedSet = new Set(completedFormsArray);

                              const updatedCompletedForms = FORM_KEYS.filter(
                                (key) => {
                                  let form = forms[key];

                                  // Handle job description - check all variants
                                  if (key === "jobDescriptionPCA") {
                                    form =
                                      forms.jobDescriptionPCA ||
                                      forms.jobDescriptionCNA ||
                                      forms.jobDescriptionLPN ||
                                      forms.jobDescriptionRN;
                                  }

                                  const isCompleted =
                                    form?.status === "submitted" ||
                                    form?.status === "completed" ||
                                    form?.status === "under_review" ||
                                    form?.status === "approved" ||
                                    completedSet.has(key);

                                  return isCompleted;
                                }
                              ).length;

                              const updatedPercentage = Math.round(
                                (updatedCompletedForms / FORM_KEYS.length) * 100
                              );

                              setOverallProgress(updatedPercentage);
                              setCompletedFormsCount(updatedCompletedForms);
                            }
                          }, 500); // 500ms delay to ensure backend processing is complete
                        } catch (progressError) {
                          console.warn(
                            "Could not update progress:",
                            progressError
                          );
                        }

                        setTimeout(() => {
                          navigate("/employee/emergency-contact");
                        }, 1500);
                      }
                    } catch (error) {
                      console.error(
                        "Error saving non-compete agreement:",
                        error
                      );
                      toast.error("Failed to save form");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
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
};

export default NonCompleteAgreement;
