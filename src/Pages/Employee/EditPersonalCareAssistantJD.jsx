import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  FileText,
  Calendar,
  Target,
  RotateCcw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Cookies from "js-cookie";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";

const EditPersonalCareAssistantJD = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [formData, setFormData] = useState({
    jobDescriptionType: "PCA",
    jobTitle: "Personal Care Assistant",
    employeeInfo: {
      employeeName: "",
      employeeId: "",
      department: "Homecare Services",
      hireDate: null,
    },
    jobDescriptionContent: {
      exhibitNumber: "1a",
      jobDescriptionTitle: "PHS-PCA Job Description",
      reviewedDate: new Date(),
    },
    acknowledgment: {
      hasReadJobDescription: false,
      understandsResponsibilities: false,
      agreesToPerformDuties: false,
      acknowledgesQualifications: false,
      understandsReportingStructure: false,
    },
    staffSignature: {
      signature: "",
      date: null,
      digitalSignature: true,
    },
    supervisorSignature: {
      signature: "",
      supervisorName: "",
      supervisorTitle: "",
      date: null,
      digitalSignature: true,
    },
    comments: {
      staffComments: "",
      supervisorComments: "",
    },
  });

  // Get user data from token or localStorage
  const getUserFromToken = () => {
    try {
      const session = Cookies.get("session");
      if (!session) return null;

      const base64Url = session.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );

      const decoded = JSON.parse(jsonPayload);
      return decoded.user;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // For development - create a test user if none exists
  const ensureTestUser = () => {
    const userData =
      getUserFromToken() || JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData._id && !userData.id) {
      const testUser = {
        _id: "67e0f8770c6feb6ba99d11d2",
        userName: "Test Employee",
        email: "test@example.com",
        userRole: "employee",
      };
      localStorage.setItem("user", JSON.stringify(testUser));
      return testUser;
    }
    return userData;
  };

  // Initialize form data
  const initializeForm = async () => {
    try {
      setLoading(true);

      // Get user info
      const userData = ensureTestUser();
      const employeeId = userData._id || userData.id;

      if (taskId && taskId !== "new") {
        // Try to load existing form data
        try {
          const response = await axios.get(
            `${baseURL}/onboarding/get-job-description/${taskId}/PCA`,
            { withCredentials: true },
          );

          if (
            response.data &&
            response.data.data?.jobDescriptionAcknowledgment
          ) {
            const existingData =
              response.data.data.jobDescriptionAcknowledgment;

            // Transform dates and ensure all required structures exist
            const transformedData = {
              ...existingData,
              employeeInfo: {
                ...existingData.employeeInfo,
                hireDate: existingData.employeeInfo?.hireDate
                  ? new Date(existingData.employeeInfo.hireDate)
                  : null,
              },
              jobDescriptionContent: {
                ...existingData.jobDescriptionContent,
                reviewedDate: existingData.jobDescriptionContent?.reviewedDate
                  ? new Date(existingData.jobDescriptionContent.reviewedDate)
                  : new Date(),
              },
              staffSignature: {
                ...existingData.staffSignature,
                date: existingData.staffSignature?.date
                  ? new Date(existingData.staffSignature.date)
                  : null,
              },
              supervisorSignature: {
                ...existingData.supervisorSignature,
                date: existingData.supervisorSignature?.date
                  ? new Date(existingData.supervisorSignature.date)
                  : null,
              },
              comments: {
                staffComments: existingData.comments?.staffComments || "",
                supervisorComments:
                  existingData.comments?.supervisorComments || "",
              },
            };

            setFormData(transformedData);
            console.log(
              "Loaded existing PCA Job Description form:",
              transformedData,
            );
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error("Error loading existing form:", error);
            toast.error("Failed to load existing form data");
          }
          // If 404, we'll use the default form data initialized above
        }
      }

      // Set employee info from user data
      setFormData((prev) => ({
        ...prev,
        employeeInfo: {
          ...prev.employeeInfo,
          employeeName: userData.userName || userData.name || "",
          employeeId: employeeId || "",
        },
      }));
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Failed to initialize form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeForm();
    fetchProgressData();
  }, [taskId]);

  const baseURL =
    import.meta.env.VITE__BASEURL || "https://api.carecompapp.com";

  const fetchProgressData = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true },
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
          "jobDescriptionPCA",
          "jobDescriptionCNA",
          "jobDescriptionLPN",
          "jobDescriptionRN",
        ];

        const completedFormsArray =
          response.data.data.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const completedForms = formKeys.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key)
          );
        }).length;

        const totalForms = 25;
        const progressPercentage = Math.round(
          (completedForms / totalForms) * 100,
        );
        setOverallProgress(progressPercentage);
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  const handleInputChange = (field, value) => {
    // Handle nested object updates
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAcknowledgmentChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      acknowledgment: {
        ...prev.acknowledgment,
        [field]: value,
      },
    }));
  };

  const handleCommentChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      comments: {
        ...(prev.comments || {}),
        [field]: value,
      },
    }));
  };

  const saveForm = async (status = "draft") => {
    try {
      setSaving(true);

      // Get user and application data
      const userData = ensureTestUser();
      const employeeId = userData._id || userData.id;
      const applicationId = taskId && taskId !== "new" ? taskId : null;

      if (!applicationId) {
        toast.error("No application ID found. Please try again.");
        return;
      }

      // Prepare form data for submission
      const submissionData = {
        applicationId,
        employeeId,
        formData: {
          ...formData,
          // Ensure required fields are set
          jobDescriptionType: "PCA",
          jobTitle: "Personal Care Assistant",
        },
        status,
      };

      const response = await axios.post(
        `${baseURL}/onboarding/save-job-description`,
        submissionData,
        { withCredentials: true },
      );

      if (response.data && response.data.success) {
        if (status === "completed") {
          toast.success(
            "🎉 Personal Care Assistant Job Description completed successfully!",
            {
              style: {
                background: "#10B981",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "16px 24px",
                fontSize: "16px",
              },
              duration: 4000,
              icon: "✅",
            },
          );
        } else {
          toast.success(
            "Personal Care Assistant Job Description saved as draft!",
            {
              style: {
                background: "#3B82F6",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "16px 24px",
                fontSize: "16px",
              },
              duration: 3000,
              icon: "💾",
            },
          );
        }

        // Continue onboarding: navigate to Edit CNA form for the same application
        setTimeout(() => {
          navigate(
            `/employee/edit-cna-form/${applicationId || taskId || "new"}`,
          );
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save form. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const isValid =
      formData.acknowledgment.hasReadJobDescription &&
      formData.acknowledgment.understandsResponsibilities &&
      formData.acknowledgment.agreesToPerformDuties &&
      formData.staffSignature.signature.trim() !== "" &&
      formData.staffSignature.date;

    if (!isValid) {
      toast.error("Please complete all required fields and acknowledgments");
      return;
    }

    saveForm("completed");
  };

  const handleSaveDraft = () => {
    saveForm("draft");
  };

  const handleBack = () => {
    navigate("/employee/task-management");
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-full flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F3A93] mx-auto mb-4"></div>
              <p className="text-gray-600">
                Loading Personal Care Assistant Job Description...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />

      {/* Back Button - Outside main container for consistent positioning */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 pt-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Content Container with sidebar layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="flex gap-6">
          {/* Vertical Progress Bar Sidebar */}
          <div className="w-16 flex-shrink-0">
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
          <div className="flex-1 max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
            <div className="w-full max-w-[150%] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <form onSubmit={handleSubmit}>
                {/* Header Section */}
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            PHS
                          </span>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                          PACIFIC HEALTH SYSTEMS
                        </h1>
                        <p className="text-blue-100">
                          PRIVATE HOMECARE SERVICES
                        </p>
                      </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold">
                      Personal Care Assistant
                    </h2>
                    <p className="text-blue-100 mt-2">
                      Job Description - Exhibit 1a
                    </p>
                  </div>
                </div>

                {/* Form Body */}
                <div className="px-6 md:px-12 py-8">
                  {/* Job Purpose */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Job Purpose
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Personal Care Assistants (PCAs) provide personal care and
                      support services to clients in their homes under the
                      supervision of a registered nurse. PCAs assist clients
                      with activities of daily living, promote independence, and
                      maintain client dignity while ensuring safety and comfort.
                    </p>
                  </div>

                  {/* Essential Functions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Essential Functions & Responsibilities
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Assist clients with personal care activities including
                          bathing, grooming, dressing, and toileting.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Support clients with mobility, transfers, and
                          positioning.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Assist with meal preparation and feeding as needed.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Provide companionship and emotional support.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Assist with light housekeeping tasks related to client
                          care.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Monitor and report changes in client condition to the
                          supervisor.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Comply with infection control protocols and safety
                          procedures.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Maintain client confidentiality and respect client
                          rights.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Accurately document care and services provided each
                          day.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Qualifications */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Qualifications
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>High school diploma or GED.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Completion of a state-approved PCA training program or
                          equivalent.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>Current CPR/First Aid certification.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Must pass background checks and health screenings
                          (e.g., TB test).
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Reliable, compassionate, and good interpersonal
                          skills.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Working Conditions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Working Conditions
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Work performed in client homes with varying
                          environmental conditions.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          May require lifting, bending, standing, and walking
                          for extended periods.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Flexible schedule including evenings, weekends, and
                          holidays as needed.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#1F3A93] mr-3 mt-1">•</span>
                        <span>
                          Must have reliable transportation and valid driver's
                          license.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Employee Acknowledgment Section */}
                  <div className="bg-blue-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Employee Acknowledgment
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Please check all boxes to acknowledge that you have read
                      and understand the job description:
                    </p>

                    <div className="space-y-3">
                      <label className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            formData.acknowledgment.hasReadJobDescription
                          }
                          onChange={(e) =>
                            handleAcknowledgmentChange(
                              "hasReadJobDescription",
                              e.target.checked,
                            )
                          }
                          className="mt-1 w-4 h-4 text-[#1F3A93] bg-gray-100 border-gray-300 rounded focus:ring-[#1F3A93] focus:ring-2"
                        />
                        <span>
                          I have read and reviewed the complete Personal Care
                          Assistant job description
                        </span>
                      </label>

                      <label className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            formData.acknowledgment.understandsResponsibilities
                          }
                          onChange={(e) =>
                            handleAcknowledgmentChange(
                              "understandsResponsibilities",
                              e.target.checked,
                            )
                          }
                          className="mt-1 w-4 h-4 text-[#1F3A93] bg-gray-100 border-gray-300 rounded focus:ring-[#1F3A93] focus:ring-2"
                        />
                        <span>
                          I understand all the responsibilities and duties
                          outlined in this job description
                        </span>
                      </label>

                      <label className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            formData.acknowledgment.agreesToPerformDuties
                          }
                          onChange={(e) =>
                            handleAcknowledgmentChange(
                              "agreesToPerformDuties",
                              e.target.checked,
                            )
                          }
                          className="mt-1 w-4 h-4 text-[#1F3A93] bg-gray-100 border-gray-300 rounded focus:ring-[#1F3A93] focus:ring-2"
                        />
                        <span>
                          I agree to perform all duties and responsibilities as
                          outlined
                        </span>
                      </label>

                      <label className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            formData.acknowledgment.acknowledgesQualifications
                          }
                          onChange={(e) =>
                            handleAcknowledgmentChange(
                              "acknowledgesQualifications",
                              e.target.checked,
                            )
                          }
                          className="mt-1 w-4 h-4 text-[#1F3A93] bg-gray-100 border-gray-300 rounded focus:ring-[#1F3A93] focus:ring-2"
                        />
                        <span>
                          I acknowledge that I meet or will meet all required
                          qualifications
                        </span>
                      </label>

                      <label className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            formData.acknowledgment
                              .understandsReportingStructure
                          }
                          onChange={(e) =>
                            handleAcknowledgmentChange(
                              "understandsReportingStructure",
                              e.target.checked,
                            )
                          }
                          className="mt-1 w-4 h-4 text-[#1F3A93] bg-gray-100 border-gray-300 rounded focus:ring-[#1F3A93] focus:ring-2"
                        />
                        <span>
                          I understand the reporting structure and supervision
                          requirements
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b-2 border-[#1F3A93]">
                      Additional Comments
                    </h3>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Employee Comments (Optional)
                      </label>
                      <textarea
                        value={formData.comments?.staffComments || ""}
                        onChange={(e) =>
                          handleCommentChange("staffComments", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                        rows="3"
                        placeholder="Any additional comments or questions..."
                      />
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Signatures
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Employee Signature{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.staffSignature.signature}
                            onChange={(e) =>
                              handleInputChange(
                                "staffSignature.signature",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                            placeholder="Type your signature here"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <DatePicker
                              selected={formData.staffSignature.date}
                              onChange={(date) =>
                                handleInputChange("staffSignature.date", date)
                              }
                              placeholderText="Select date"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                              dateFormat="MM/dd/yyyy"
                              required
                            />
                            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Supervisor's Name
                          </label>
                          <input
                            type="text"
                            value={formData.supervisorSignature.supervisorName}
                            onChange={(e) =>
                              handleInputChange(
                                "supervisorSignature.supervisorName",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                            placeholder="Supervisor name"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Supervisor's Title
                          </label>
                          <input
                            type="text"
                            value={formData.supervisorSignature.supervisorTitle}
                            onChange={(e) =>
                              handleInputChange(
                                "supervisorSignature.supervisorTitle",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                            placeholder="e.g., Nursing Supervisor"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Supervisor's Signature
                          </label>
                          <input
                            type="text"
                            value={formData.supervisorSignature.signature}
                            onChange={(e) =>
                              handleInputChange(
                                "supervisorSignature.signature",
                                e.target.value,
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                            placeholder="Supervisor signature"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date
                          </label>
                          <div className="relative">
                            <DatePicker
                              selected={formData.supervisorSignature.date}
                              onChange={(date) =>
                                handleInputChange(
                                  "supervisorSignature.date",
                                  date,
                                )
                              }
                              placeholderText="Select date"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-[#1F3A93] focus:outline-none focus:ring-1 focus:ring-[#1F3A93] transition-colors duration-200"
                              dateFormat="MM/dd/yyyy"
                            />
                            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar in Form Footer */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mx-8 md:mx-12">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Application Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round((overallProgress / 100) * 25)}/25
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
                    📝 Current: Personal Care Assistant Job Description
                  </div>
                </div>

                {/* Submit Button Section - standardized three-zone footer */}
                <div className="bg-[#F8FAFF] px-8 md:px-12 py-8 mt-10 border border-[#E8EDFF]">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                        Complete Personal Care Assistant Job Description
                      </h4>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Left - Previous */}
                      <div className="w-full sm:w-1/3 flex justify-start">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const targetId = taskId || "new";
                            navigate(
                              `/employee/edit-orientation-checklist/${targetId}`,
                            );
                          }}
                          className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                          disabled={saving}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          <span>Previous Form</span>
                        </button>
                      </div>

                      {/* Center - Exit Application */}
                      <div className="w-full sm:w-1/3 flex justify-center">
                        <button
                          type="button"
                          onClick={() => navigate("/employee/task-management")}
                          className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                          disabled={saving}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          <span>Exit Application</span>
                        </button>
                      </div>

                      {/* Right - Save & Next */}
                      <div className="w-full sm:w-1/3 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            // Trigger form submit via the form's submit handler
                            const fakeEvent = { preventDefault: () => {} };
                            handleSubmit(fakeEvent);
                          }}
                          className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                          disabled={saving}
                        >
                          {saving ? (
                            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          <span>{saving ? "Saving..." : "Save & Next"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Configuration */}
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
    </Layout>
  );
};

export default EditPersonalCareAssistantJD;
