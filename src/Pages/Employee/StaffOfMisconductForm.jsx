import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Target,
  Send,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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

const StaffOfMisconductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [employeeId, setEmployeeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  const [employmentType, setEmploymentType] = useState(null);
  const [totalForms, setTotalForms] = useState(20); // default to 20
  const baseURL = import.meta.env.VITE__BASEURL;

  const shouldCountForm = (formKey) => {
    if (employmentType === "W-2 Employee") {
      return formKey !== "w9Form";
    } else if (employmentType === "1099 Contractor") {
      return formKey !== "w4Form";
    }
    return formKey !== "w9Form"; // default to W-2 if not set
  };

  // Form data for the misconduct statement fields
  const [formData, setFormData] = useState({
    staffTitle: "",
    companyName: "",
    employeeNameParagraph: "",
    employeeName: "",
    employmentPosition: "",
    signatureLine: "",
    dateField1: "",
    exhibitName: "",
    printName: "",
    signatureField: "",
    dateField2: "",
    notaryDay: "",
    notaryMonth: "",
    notaryYear: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignatureChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Helper function to build full URL
  const buildFullUrl = (relativePath) => {
    if (!relativePath) return "";
    const base = baseURL.replace(/\/$/, ""); // Remove trailing slash
    const path = relativePath.startsWith("/")
      ? relativePath
      : `/${relativePath}`;
    return `${base}${path}`;
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

  useEffect(() => {
    if (applicationId) {
      loadSignatureAndDate();
    }
  }, [applicationId]);

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
        setEmploymentType(appResponse.data.data.application.employmentType);

        // Calculate progress
        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const filteredKeys = FORM_KEYS.filter(shouldCountForm);
        setTotalForms(filteredKeys.length);

        const completedForms = filteredKeys.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key) ||
            (key === "employmentType" && appResponse.data.data.application.employmentType)
          );
        }).length;

        const percentage = Math.round(
          (completedForms / filteredKeys.length) * 100
        );

        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
      }

      // Get template
      const templateResponse = await axios.get(
        `${baseURL}/onboarding/misconduct-statement/get-template`,
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

  // Load saved form data
  const loadSignatureAndDate = async () => {
    if (!applicationId) return;

    try {
      console.log("Loading form data for misconduct statement");

      // First try to load from the specific misconduct statement endpoint
      let loadedFormData = null;
      try {
        const response = await axios.get(
          `${baseURL}/onboarding/misconduct-statement/get-misconduct-statement/${applicationId}`,
          { withCredentials: true }
        );

        console.log("Misconduct statement response:", response.data);

        if (response.data && response.data.formData) {
          loadedFormData = response.data.formData;
        }

        // Load status and HR feedback
        if (response.data && response.data.status) {
          setFormStatus(response.data.status);
        }
        if (response.data && response.data.hrFeedback) {
          setHrFeedback(response.data.hrFeedback);
        }
      } catch (specificError) {
        console.warn(
          "Could not load from specific endpoint:",
          specificError.message
        );
        // If specific endpoint fails, we'll try to load from get-application
      }

      // If no data from specific endpoint, try get-application endpoint
      if (!loadedFormData) {
        const userToken = Cookies.get("session");
        const decodedToken = userToken && jwtDecode(userToken);
        const user = decodedToken?.user;

        if (user?._id) {
          const appResponse = await axios.get(
            `${baseURL}/onboarding/get-application/${user._id}`,
            { withCredentials: true }
          );

          if (appResponse.data?.data?.forms?.misconductStatement) {
            loadedFormData = appResponse.data.data.forms.misconductStatement;
            console.log(
              "Loaded form data from get-application:",
              loadedFormData
            );

            // Load status and HR feedback from get-application
            if (loadedFormData.status) {
              setFormStatus(loadedFormData.status);
            }
            if (loadedFormData.hrFeedback) {
              setHrFeedback(loadedFormData.hrFeedback);
            }
          }
        }
      }

      // If we have form data, update state with all fields at once
      if (loadedFormData) {
        // Prepare the new form state
        const newFormData = {
          staffTitle: loadedFormData.staffTitle || "",
          companyName: loadedFormData.companyName || "",
          employeeNameParagraph: loadedFormData.employeeNameParagraph || "",
          employeeName: loadedFormData.employeeName || "",
          employmentPosition: loadedFormData.employmentPosition || "",
          signatureLine: loadedFormData.signatureLine || "",
          dateField1: loadedFormData.dateField1 || "",
          exhibitName: loadedFormData.exhibitName || "",
          printName: loadedFormData.printName || "",
          signatureField: loadedFormData.signatureField || "",
          dateField2: loadedFormData.dateField2 || "",
          notaryDay: loadedFormData.notaryDay || "",
          notaryMonth: loadedFormData.notaryMonth || "",
          notaryYear: loadedFormData.notaryYear || "",
        };

        // Set default dates if not provided
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);

        if (!newFormData.dateField1) {
          newFormData.dateField1 = todayDate;
        }
        if (!newFormData.dateField2) {
          newFormData.dateField2 = todayDate;
        }

        setFormData(newFormData);
        console.log("✅ Form data loaded successfully");
      } else {
        // No saved data - set default dates to today
        const today = new Date();
        const todayDate = today.toISOString().slice(0, 10);
        setFormData((prev) => ({
          ...prev,
          dateField1: todayDate,
          dateField2: todayDate,
        }));
        console.log("No saved form data found, using default dates");
      }
    } catch (error) {
      console.error("Error loading form data:", error);
      // On error, set default dates to today
      const today = new Date();
      const todayDate = today.toISOString().slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        dateField1: todayDate,
        dateField2: todayDate,
      }));
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

  return (
    <Layout>
      <Navbar />
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
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
          {/* Status Banner */}
          {!loading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                formData.signatureField
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {formData.signatureField ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {formData.signatureField ? (
                    <>
                      <p className="text-base font-semibold text-green-800">
                        ✅ Progress Updated - Form Completed Successfully
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        You cannot make any changes to the form until HR
                        provides their feedback.
                      </p>
                    </>
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
              Staff Misconduct Statement
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Sign the form and provide the date to acknowledge your
              understanding
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
                      <span>
                        Fill out the Staff Misconduct Statement form below
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>
                        Carefully read and complete all required fields
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        3.
                      </span>
                      <span>
                        Sign digitally using the signature pads in the form
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

            {/* Template Preview Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Step 1: Staff Misconduct Statement Form
              </h2>
              <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 my-4 sm:my-8">
                <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
                  {/* Header */}
                  <h1 className="text-left font-bold text-xs sm:text-sm mb-6 tracking-wide">
                    STAFF MISCONDUCT ABUSE STATEMENT FORM
                  </h1>

                  {/* Staff Title */}
                  <div className="mb-6">
                    <span className="text-xs sm:text-sm">
                      STAFF TITLE: 
                    </span>
                    <span
                      className="inline-block border-b border-black ml-1"
                      style={{ minHeight: "1.2em", width: "250px" }}
                    >
                      <input
                        type="text"
                        value={formData.staffTitle}
                        onChange={(e) =>
                          handleChange("staffTitle", e.target.value)
                        }
                        className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                      />
                    </span>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-3 mt-6">
                    <p>
                      I understand and acknowledge that I must comply with <u>Pacific Health Systems LLC</u>, Code of Conduct and Abuse or Misconduct program.
                    </p>

                    <p>
                      All laws, regulations, policies & procedure as well as any
                      other applicable state or local ordinances as it pertains
                      to the responsibilities of my position.
                    </p>

                    <p>
                      I understand that my failure to report any concerns
                      regarding possible violations of these laws, regulations,
                      and Policies may result in disciplinary action, up to and
                      including termination.
                    </p>

                    <p>
                      I{" "}
                      <span
                        className="inline-block border-b border-black"
                        style={{ minHeight: "1.2em", minWidth: "200px" }}
                      >
                        <input
                          type="text"
                          value={formData.employeeNameParagraph}
                          onChange={(e) =>
                            handleChange(
                              "employeeNameParagraph",
                              e.target.value
                            )
                          }
                          className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>{" "}
                      as an employee of <u>Pacific Health Systems LLC</u>, I hereby state that, I have never shown any misconduct
                      nor have a history of abuse and neglect of others.
                    </p>

                    <p>
                      I acknowledge that I have received and read the Misconduct
                      or abuse statement form and that I clearly understand it.
                    </p>
                  </div>

                  {/* Employee Information Fields */}
                  <div className="space-y-3 mt-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm">
                        Name of Employee (print):
                      </span>
                      <span
                        className="flex-1 border-b border-black"
                        style={{ minHeight: "1.2em" }}
                      >
                        <input
                          type="text"
                          value={formData.employeeName}
                          onChange={(e) =>
                            handleChange("employeeName", e.target.value)
                          }
                          className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm">
                        Employment Position:
                      </span>
                      <span
                        className="flex-1 border-b border-black"
                        style={{ minHeight: "1.2em" }}
                      >
                        <input
                          type="text"
                          value={formData.employmentPosition}
                          onChange={(e) =>
                            handleChange("employmentPosition", e.target.value)
                          }
                          className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>
                    </div>

                    {/* Signature and Date Row 1 */}
                    <div className="flex items-baseline gap-4">
                      <div className="flex items-baseline gap-1 flex-1">
                        <span className="text-xs sm:text-sm">Signature:</span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{ minHeight: "1.2em" }}
                        >
                          <input
                            type="text"
                            value={formData.signatureLine}
                            onChange={(e) =>
                              handleSignatureChange(
                                "signatureLine",
                                e.target.value
                              )
                            }
                            className="border-0 bg-transparent w-full px-1 focus:outline-none"
                            style={{
                              fontFamily: "'Great Vibes', cursive",
                              fontSize: "20px",
                              letterSpacing: "0.5px",
                            }}
                          />
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 flex-1">
                        <span className="text-xs sm:text-sm">Date:</span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{ minHeight: "1.2em" }}
                        >
                          <input
                            type="date"
                            value={formData.dateField1}
                            onChange={(e) =>
                              handleChange("dateField1", e.target.value)
                            }
                            className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Affidavit Section */}
                  <div className="space-y-3 mt-6">
                    <p className="mb-2">
                      Who having been first duly sworn depose and say
                    </p>
                    <div className="flex items-start gap-2">
                      <span
                        className="inline-block border-b border-black flex-1"
                        style={{ minHeight: "1.2em", maxWidth: "350px" }}
                      >
                        <input
                          type="text"
                          value={formData.exhibitName}
                          onChange={(e) =>
                            handleChange("exhibitName", e.target.value)
                          }
                          className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>
                      <span className="flex-1">
                        has never been shown to have exhibited
                      </span>
                    </div>
                    <p>
                      any violent or abusive behavior or intentional or grossly negligent misconduct.
                    </p>
                    <p>
                      Also have never been accused or convicted to have been
                      abused, neglected, sexually assaulted, exploited, or
                      deprived any person or to have subjected any person to
                      serious injury as a result of intentional or grossly
                      negligent misconduct as evidence by an oral or written
                      statement to this effect obtained at the time of
                      application.
                    </p>
                  </div>

                  {/* Witness Section */}
                  <div className="space-y-3 mt-6">
                    <div className="flex items-baseline gap-4">
                      <div className="flex items-baseline gap-1 flex-1">
                        <span className="text-xs sm:text-sm">Print Name:</span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{ minHeight: "1.2em" }}
                        >
                          <input
                            type="text"
                            value={formData.printName}
                            onChange={(e) =>
                              handleChange("printName", e.target.value)
                            }
                            className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                          />
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 flex-1">
                        <span className="text-xs sm:text-sm">Signature:</span>
                        <span
                          className="flex-1 border-b border-black"
                          style={{ minHeight: "1.2em" }}
                        >
                          <input
                            type="text"
                            value={formData.signatureField}
                            onChange={(e) =>
                              handleSignatureChange(
                                "signatureField",
                                e.target.value
                              )
                            }
                            className="border-0 bg-transparent w-full px-1 focus:outline-none"
                            style={{
                              fontFamily: "'Great Vibes', cursive",
                              fontSize: "20px",
                              letterSpacing: "0.5px",
                            }}
                          />
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-xs sm:text-sm">Date:</span>
                      <span
                        className="border-b border-black w-48"
                        style={{ minHeight: "1.2em" }}
                      >
                        <input
                          type="date"
                          value={formData.dateField2}
                          onChange={(e) =>
                            handleChange("dateField2", e.target.value)
                          }
                          className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>
                    </div>
                  </div>

                  {/* Notary Affidavit Section */}
                  <div className="space-y-2 mt-6">
                    <p className="font-bold italic text-xs sm:text-sm">
                      Notary Affidavit
                    </p>
                    <p className="text-xs sm:text-sm">State of: Georgia</p>

                    <p className="text-xs sm:text-sm">
                      Sworn and subscribed before me this{" "}
                      <span className="border-b border-black inline-block w-16 text-center">
                        <input
                          type="text"
                          value={formData.notaryDay}
                          onChange={(e) =>
                            handleChange("notaryDay", e.target.value)
                          }
                          className="border-0 bg-transparent w-full text-center px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>{" "}
                      day of{" "}
                      <span className="border-b border-black inline-block w-28">
                        <input
                          type="text"
                          value={formData.notaryMonth}
                          onChange={(e) =>
                            handleChange("notaryMonth", e.target.value)
                          }
                          className="border-0 bg-transparent w-full px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>{" "}
                      Year{" "}
                      <span className="border-b border-black inline-block w-20 text-center">
                        <input
                          type="text"
                          value={formData.notaryYear}
                          onChange={(e) =>
                            handleChange("notaryYear", e.target.value)
                          }
                          className="border-0 bg-transparent w-full text-center px-1 focus:outline-none text-xs sm:text-sm"
                        />
                      </span>
                    </p>

                    <div className="mt-4">
                      <p className="text-xs sm:text-sm mb-1">Notary Seal</p>
                      <p className="text-xs sm:text-sm">Notary Signature</p>
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
                📝 Current: Staff Misconduct Statement
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate("/employee/non-compete-agreement")}
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

                  // Check if form is submitted (and no HR notes)
                  const isSubmitted = formStatus === "submitted" && !hasHrNotes;

                  return (
                    <button
                      type="button"
                      onClick={async () => {
                        console.log("Save button clicked");
                        console.log("Form data:", formData);

                        // Validate both signatures and dates are provided
                        const newErrors = {};
                        if (!formData.signatureLine) {
                          newErrors.signatureLine =
                            "First signature is required";
                        }
                        if (!formData.dateField1) {
                          newErrors.dateField1 = "First date is required";
                        }
                        if (!formData.signatureField) {
                          newErrors.signatureField =
                            "Second signature is required";
                        }
                        if (!formData.dateField2) {
                          newErrors.dateField2 = "Second date is required";
                        }

                        if (Object.keys(newErrors).length > 0) {
                          setErrors(newErrors);
                          toast.error(
                            "Please fill in all required signature and date fields"
                          );
                          return;
                        }

                        console.log("Validation passed - proceeding with save");
                        setIsSaving(true);
                        try {
                          const userToken = Cookies.get("session");
                          const decodedToken =
                            userToken && jwtDecode(userToken);
                          const user = decodedToken?.user;

                          if (!user?._id) {
                            toast.error("Session expired. Please login again.");
                            navigate("/login");
                            return;
                          }

                          // Status is submitted since signatures are provided
                          const status = "submitted";

                          console.log(
                            "Saving misconduct statement with form data:",
                            formData
                          );

                          const requestData = {
                            applicationId,
                            employeeId: user._id,
                            formData: {
                              ...formData,
                              signingMethod: "digital",
                            },
                            status,
                          };

                          console.log(
                            "Full request data being sent:",
                            JSON.stringify(requestData, null, 2)
                          );

                          const response = await axios.post(
                            `${baseURL}/onboarding/misconduct-statement/save-misconduct-statement`,
                            requestData,
                            { withCredentials: true }
                          );

                          console.log("Save response:", response.data);

                          if (response.data) {
                            toast.success(
                              "Staff Misconduct Statement completed successfully!"
                            );
                            window.dispatchEvent(
                              new Event("formStatusUpdated")
                            );

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
                                    backendData.application?.completedForms ||
                                    [];
                                  const completedSet = new Set(
                                    completedFormsArray
                                  );

                                  const filteredKeys =
                                    FORM_KEYS.filter(shouldCountForm);
                                  setTotalForms(filteredKeys.length);

                                  const updatedCompletedForms =
                                    filteredKeys.filter((key) => {
                                      const form = forms[key];
                                      return (
                                        form?.status === "submitted" ||
                                        form?.status === "completed" ||
                                        form?.status === "under_review" ||
                                        form?.status === "approved" ||
                                        completedSet.has(key) ||
                                        (key === "employmentType" && appResponse.data.data.application.employmentType)
                                      );
                                    }).length;

                                  const updatedPercentage = Math.round(
                                    (updatedCompletedForms /
                                      filteredKeys.length) *
                                      100
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
                              navigate("/employee/edit-tb-symptom-screen-form");
                            }, 1500);
                          }
                        } catch (error) {
                          console.error(
                            "Error saving misconduct statement:",
                            error
                          );
                          toast.error("Failed to save form");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving || isSubmitted}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
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
                        <RotateCcw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span className="text-sm sm:text-base">
                        {isSaving
                          ? "Saving..."
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
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default StaffOfMisconductForm;
