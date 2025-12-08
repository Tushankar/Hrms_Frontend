import React, { useState, useEffect } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  Search,
  Filter,
  CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  ArrowUpDown,
  FileText,
  Eye,
  Send,
  Save,
  CheckCircle2,
  Target,
  Users,
  XCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import HRNotesIndicator from "../../Components/Common/HRNotesIndicator/HRNotesIndicator";

// Form keys array for progress calculation - matches CodeOfEthics.jsx (20 forms)
// These are the core forms required for onboarding completion
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

export const EmployeeTaskManagement = () => {
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE__BASEURL;

  // State for tasks data from backend
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState("draft"); // draft, submitted, approved, rejected
  const [isEditable, setIsEditable] = useState(true); // Track if forms can be edited
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAutoNavigated, setHasAutoNavigated] = useState(false);
  const [isPCAEligible, setIsPCAEligible] = useState(false);

  // HR Notes State
  const [hrNotes, setHrNotes] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Helper function to get user data from JWT token
  const getUserFromToken = () => {
    try {
      const session = Cookies.get("session");
      if (!session) return null;

      // Decode JWT token (simple base64 decode - in production you'd want a proper JWT library)
      const base64Url = session.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
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
      // Create a test user for development - using the actual employee ID from your data
      const testUser = {
        _id: "68b56e9702cc49e3bc3dc4d7", // Use the actual employee ID from the application data
        userName: "Test Employee",
        email: "test@example.com",
        userRole: "employee",
      };
      localStorage.setItem("user", JSON.stringify(testUser));
      console.log("Test user created for development:", testUser);
      return testUser;
    }
    return userData;
  };

  // Fetch onboarding data from backend
  const fetchOnboardingData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get current user ID from JWT token or localStorage (with fallback test user)
      const userData = ensureTestUser();
      const employeeId = userData._id || userData.id;

      if (!employeeId) {
        console.error("No employee ID found. User might not be logged in.");
        toast.error("Please log in to view your onboarding tasks");
        initializeEmptyApplication();
        return;
      }

      console.log("Fetching onboarding data for employee:", employeeId);
      console.log(
        `🔄 Refresh type: ${showRefreshToast ? "manual" : "auto/initial"}`
      );
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
        }
      );

      console.log(
        "🔍 Backend response for application status:",
        response.data?.data?.application?.applicationStatus
      );
      console.log(
        "📊 Full application object:",
        response.data?.data?.application
      );
      console.log("🔍 Full backend response:", response.data);
      console.log("🔍 Application object:", response.data?.data?.application);

      if (response.data && response.data.data) {
        const backendData = response.data.data;

        // Transform backend data into task format - ORDERED TO MATCH SIDEBAR
        const transformedTasks = [
          // PART 1: Employment Application
          {
            id: "personal-information",
            name: "Applicant Personal Information",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.personalInformation),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.personalInformation
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.personalInformation
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.personalInformation,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.personalInformation,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.personalInformation,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "education",
            name: "Education",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.education),
            submissionStatus: getSubmissionStatus(backendData.forms?.education),
            formsCompleted: getCompletionCount(backendData.forms?.education),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.education,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.education,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.education,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "references",
            name: "References",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.references),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.references
            ),
            formsCompleted: getCompletionCount(backendData.forms?.references),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.references,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.references,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.references,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "work-experience",
            name: "Previous Employment",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.workExperience),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.workExperience
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.workExperience
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.workExperience,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.workExperience,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.workExperience,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "professional-experience",
            name: "Military Service",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.professionalExperience),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.professionalExperience
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.professionalExperience
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.professionalExperience,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.professionalExperience,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.professionalExperience,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "legal-disclosures",
            name: "Disclaimer and Signature",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.legalDisclosures),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.legalDisclosures
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.legalDisclosures
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.legalDisclosures,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.legalDisclosures,
            hrFeedback: backendData.forms?.legalDisclosures?.hrFeedback,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.legalDisclosures,
              backendData.application?.applicationStatus
            ),
          },

          // PART 2: Documents to Submit
          {
            id: "job-description-pca",
            name: "Job Description",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(
              backendData.forms?.jobDescriptionPCA ||
                backendData.forms?.jobDescriptionCNA ||
                backendData.forms?.jobDescriptionLPN ||
                backendData.forms?.jobDescriptionRN
            ),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.jobDescriptionPCA ||
                backendData.forms?.jobDescriptionCNA ||
                backendData.forms?.jobDescriptionLPN ||
                backendData.forms?.jobDescriptionRN
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.jobDescriptionPCA ||
                backendData.forms?.jobDescriptionCNA ||
                backendData.forms?.jobDescriptionLPN ||
                backendData.forms?.jobDescriptionRN
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.jobDescriptionPCA ||
                backendData.forms?.jobDescriptionCNA ||
                backendData.forms?.jobDescriptionLPN ||
                backendData.forms?.jobDescriptionRN,
              backendData.application?.applicationStatus
            ),
            formData:
              backendData.forms?.jobDescriptionPCA ||
              backendData.forms?.jobDescriptionCNA ||
              backendData.forms?.jobDescriptionLPN ||
              backendData.forms?.jobDescriptionRN,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.jobDescriptionPCA ||
                backendData.forms?.jobDescriptionCNA ||
                backendData.forms?.jobDescriptionLPN ||
                backendData.forms?.jobDescriptionRN,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "code-of-ethics",
            name: "Code of Ethics Form",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.codeOfEthics),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.codeOfEthics
            ),
            formsCompleted: getCompletionCount(backendData.forms?.codeOfEthics),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.codeOfEthics,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.codeOfEthics,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.codeOfEthics,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "service-delivery-policies",
            name: "Service Delivery Form",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.serviceDeliveryPolicy),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.serviceDeliveryPolicy
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.serviceDeliveryPolicy
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.serviceDeliveryPolicy,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.serviceDeliveryPolicy,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.serviceDeliveryPolicy,
              backendData.application?.applicationStatus
            ),
            // Surface agency/supervisor signature from the form into hrFeedback for UI display
            ...(backendData.forms?.serviceDeliveryPolicy?.supervisorSignature
              ? {
                  formData: {
                    ...backendData.forms?.serviceDeliveryPolicy,
                    hrFeedback: {
                      ...backendData.forms?.serviceDeliveryPolicy?.hrFeedback,
                      agencySignature:
                        backendData.forms?.serviceDeliveryPolicy
                          ?.supervisorSignature,
                    },
                  },
                }
              : {}),
          },
          {
            id: "non-compete-agreement",
            name: "Non-Compete Agreement",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.nonCompeteAgreement),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.nonCompeteAgreement
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.nonCompeteAgreement
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.nonCompeteAgreement,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.nonCompeteAgreement,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.nonCompeteAgreement,
              backendData.application?.applicationStatus
            ),
            // Surface company representative signature from the form into hrFeedback for UI display
            ...(backendData.forms?.nonCompeteAgreement?.companyRepresentative
              ?.signature
              ? {
                  formData: {
                    ...backendData.forms?.nonCompeteAgreement,
                    hrFeedback: {
                      ...backendData.forms?.nonCompeteAgreement?.hrFeedback,
                      companyRepSignature:
                        backendData.forms?.nonCompeteAgreement
                          ?.companyRepresentative?.signature,
                    },
                  },
                }
              : {}),
          },
          {
            id: "emergency-contact",
            name: "Emergency Contact Form",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.emergencyContact),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.emergencyContact
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.emergencyContact
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.emergencyContact,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.emergencyContact,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.emergencyContact,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "employee-details-upload",
            name: "Professional Certificate(s)",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: (() => {
              const jobDescStatus =
                backendData.forms?.jobDescriptionPCA?.status ||
                backendData.forms?.jobDescriptionCNA?.status ||
                backendData.forms?.jobDescriptionLPN?.status ||
                backendData.forms?.jobDescriptionRN?.status;

              // If status is "completed" or "submitted", form is completed
              if (
                jobDescStatus === "completed" ||
                jobDescStatus === "submitted"
              ) {
                return "Completed";
              }
              return "Pending";
            })(),
            submissionStatus: (() => {
              const jobDescStatus =
                backendData.forms?.jobDescriptionPCA?.status ||
                backendData.forms?.jobDescriptionCNA?.status ||
                backendData.forms?.jobDescriptionLPN?.status ||
                backendData.forms?.jobDescriptionRN?.status;

              if (
                jobDescStatus === "completed" ||
                jobDescStatus === "submitted"
              ) {
                return "Submitted";
              }
              return "Not Started";
            })(),
            formsCompleted: (() => {
              const jobDescStatus =
                backendData.forms?.jobDescriptionPCA?.status ||
                backendData.forms?.jobDescriptionCNA?.status ||
                backendData.forms?.jobDescriptionLPN?.status ||
                backendData.forms?.jobDescriptionRN?.status;

              if (
                jobDescStatus === "completed" ||
                jobDescStatus === "submitted"
              ) {
                return 1;
              }
              return 0;
            })(),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              {
                status:
                  backendData.forms?.jobDescriptionPCA?.status ||
                  backendData.forms?.jobDescriptionCNA?.status ||
                  backendData.forms?.jobDescriptionLPN?.status ||
                  backendData.forms?.jobDescriptionRN?.status,
              },
              backendData.application?.applicationStatus
            ),
            formData: {
              status:
                backendData.forms?.jobDescriptionPCA?.status ||
                backendData.forms?.jobDescriptionCNA?.status ||
                backendData.forms?.jobDescriptionLPN?.status ||
                backendData.forms?.jobDescriptionRN?.status,
              // Include hrFeedback from the job description form for notes display
              hrFeedback:
                backendData.forms?.jobDescriptionPCA?.hrFeedback ||
                backendData.forms?.jobDescriptionCNA?.hrFeedback ||
                backendData.forms?.jobDescriptionLPN?.hrFeedback ||
                backendData.forms?.jobDescriptionRN?.hrFeedback,
            },
            applicationId: backendData.application?._id,
            isEditable: true,
          },
          {
            id: "cpr-first-aid-certificate",
            name: "CPR/First Aid Certificate",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getCprCertificateStatus(backendData.forms?.backgroundCheck),
            submissionStatus: getCprCertificateStatus(
              backendData.forms?.backgroundCheck
            )
              ? "Submitted"
              : "Not Started",
            formsCompleted: getCprCertificateStatus(
              backendData.forms?.backgroundCheck
            )
              ? 1
              : 0,
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.backgroundCheck,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.backgroundCheck || {},
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.backgroundCheck,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "driving-license",
            name: "Government ID",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.drivingLicense),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.drivingLicense
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.drivingLicense
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.drivingLicense,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.drivingLicense,
            hrFeedback: backendData.forms?.drivingLicense?.hrFeedback,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.drivingLicense,
              backendData.application?.applicationStatus
            ),
          },

          {
            id: "background-check",
            name: "Background Check Form",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.backgroundCheck),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.backgroundCheck
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.backgroundCheck
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.backgroundCheck,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.backgroundCheck,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.backgroundCheck,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "misconduct-form",
            name: "Staff Misconduct Statement",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.misconductStatement),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.misconductStatement
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.misconductStatement
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.misconductStatement,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.misconductStatement,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.misconductStatement,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "tb-symptom-screen",
            name: "TB or X-Ray Form",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.tbSymptomScreen),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.tbSymptomScreen
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.tbSymptomScreen
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.tbSymptomScreen,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.tbSymptomScreen,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.tbSymptomScreen,
              backendData.application?.applicationStatus
            ),
            // Surface client signature from the form into hrFeedback for UI display in notes modal
            ...(backendData.forms?.tbSymptomScreen?.clientSignature
              ? {
                  formData: {
                    ...backendData.forms?.tbSymptomScreen,
                    hrFeedback: {
                      ...backendData.forms?.tbSymptomScreen?.hrFeedback,
                      clientSignature:
                        backendData.forms?.tbSymptomScreen?.clientSignature,
                    },
                  },
                }
              : {}),
          },
          {
            id: "employment-type",
            name: "Employment Type Selection",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: backendData.application?.employmentType
              ? "Completed"
              : "Pending",
            submissionStatus: backendData.application?.employmentType
              ? "Submitted"
              : "Not Started",
            formsCompleted: backendData.application?.employmentType ? 1 : 0,
            totalForms: 1,
            hrReviewStatus: null,
            formData: {
              employmentType: backendData.application?.employmentType,
            },
            applicationId: backendData.application?._id,
            isEditable: true,
          },
          ...(backendData.application?.employmentType === "W-2"
            ? [
                {
                  id: "w4-form",
                  name: "W-4 Tax Form",
                  priority: "Medium",
                  type: "Documentation",
                  creationDate: backendData.application?.createdAt
                    ? new Date(backendData.application.createdAt)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  status: getFormStatus(backendData.forms?.w4Form),
                  submissionStatus: getSubmissionStatus(
                    backendData.forms?.w4Form
                  ),
                  formsCompleted: getCompletionCount(backendData.forms?.w4Form),
                  totalForms: 1,
                  hrReviewStatus: getHrReviewStatus(
                    backendData.forms?.w4Form,
                    backendData.application?.applicationStatus
                  ),
                  formData: backendData.forms?.w4Form,
                  applicationId: backendData.application?._id,
                  isEditable: isFormEditable(
                    backendData.forms?.w4Form,
                    backendData.application?.applicationStatus
                  ),
                },
              ]
            : []),
          ...(backendData.application?.employmentType === "1099"
            ? [
                {
                  id: "w9-form",
                  name: "W-9 Tax Form",
                  priority: "Medium",
                  type: "Documentation",
                  creationDate: backendData.application?.createdAt
                    ? new Date(backendData.application.createdAt)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  status: getFormStatus(backendData.forms?.w9Form),
                  submissionStatus: getSubmissionStatus(
                    backendData.forms?.w9Form
                  ),
                  formsCompleted: getCompletionCount(backendData.forms?.w9Form),
                  totalForms: 1,
                  hrReviewStatus: getHrReviewStatus(
                    backendData.forms?.w9Form,
                    backendData.application?.applicationStatus
                  ),
                  formData: backendData.forms?.w9Form,
                  applicationId: backendData.application?._id,
                  isEditable: isFormEditable(
                    backendData.forms?.w9Form,
                    backendData.application?.applicationStatus
                  ),
                },
              ]
            : []),
          {
            id: "direct-deposit",
            name: "Direct Deposit Form",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.directDeposit),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.directDeposit
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.directDeposit
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.directDeposit,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.directDeposit,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.directDeposit,
              backendData.application?.applicationStatus
            ),
          },

          // PART 3: Orientation Documentation
          {
            id: "orientation-presentation",
            name: "Orientation PowerPoint Presentation",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.orientationPresentation),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.orientationPresentation
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.orientationPresentation
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.orientationPresentation,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.orientationPresentation,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.orientationPresentation,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "orientation-checklist",
            name: "Orientation Checklist",
            priority: "Medium",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.orientationChecklist),
            submissionStatus: getSubmissionStatus(
              backendData.forms?.orientationChecklist
            ),
            formsCompleted: getCompletionCount(
              backendData.forms?.orientationChecklist
            ),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.orientationChecklist,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.orientationChecklist,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.orientationChecklist,
              backendData.application?.applicationStatus
            ),
            // Surface agency signature into hrFeedback for notes display
            ...(backendData.forms?.orientationChecklist?.agencySignature
              ? {
                  formData: {
                    ...backendData.forms?.orientationChecklist,
                    hrFeedback: {
                      ...backendData.forms?.orientationChecklist?.hrFeedback,
                      agencySignature:
                        backendData.forms?.orientationChecklist
                          ?.agencySignature,
                    },
                  },
                }
              : {}),
          },

          // PART 4: After Hire
          ...(backendData.application?.applicationStatus === "approved"
            ? [
                {
                  id: "training-video",
                  name: "Training Video",
                  priority: "Medium",
                  type: "Documentation",
                  creationDate: backendData.application?.createdAt
                    ? new Date(backendData.application.createdAt)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  status: getFormStatus(backendData.forms?.trainingVideo),
                  submissionStatus: getSubmissionStatus(
                    backendData.forms?.trainingVideo
                  ),
                  formsCompleted: getCompletionCount(
                    backendData.forms?.trainingVideo
                  ),
                  totalForms: 1,
                  hrReviewStatus: getHrReviewStatus(
                    backendData.forms?.trainingVideo,
                    backendData.application?.applicationStatus
                  ),
                  formData: backendData.forms?.trainingVideo,
                  applicationId: backendData.application?._id,
                  isEditable: isFormEditable(
                    backendData.forms?.trainingVideo,
                    backendData.application?.applicationStatus
                  ),
                },
              ]
            : []),
          ...(backendData.forms?.positionType?.positionAppliedFor === "PCA" &&
          backendData.application?.applicationStatus === "approved"
            ? [
                {
                  id: "pca-training-questions",
                  name: "PCA Training Examinations",
                  priority: "Medium",
                  type: "Documentation",
                  creationDate: backendData.application?.createdAt
                    ? new Date(backendData.application.createdAt)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  status: getFormStatus(
                    backendData.forms?.pcaTrainingQuestions
                  ),
                  submissionStatus: getSubmissionStatus(
                    backendData.forms?.pcaTrainingQuestions
                  ),
                  formsCompleted: getCompletionCount(
                    backendData.forms?.pcaTrainingQuestions
                  ),
                  totalForms: 1,
                  hrReviewStatus: getHrReviewStatus(
                    backendData.forms?.pcaTrainingQuestions,
                    backendData.application?.applicationStatus
                  ),
                  formData: backendData.forms?.pcaTrainingQuestions,
                  applicationId: backendData.application?._id,
                  isEditable: isFormEditable(
                    backendData.forms?.pcaTrainingQuestions,
                    backendData.application?.applicationStatus
                  ),
                },
              ]
            : []),
        ];

        // Log task creation for debugging
        console.log("📋 Created tasks with hrReviewStatus:");
        transformedTasks.forEach((task) => {
          console.log(
            `  - ${task.name}: hrReviewStatus="${task.hrReviewStatus}"`
          );
        });

        setTasks(transformedTasks);

        // Set application status and editable status
        console.log(
          "Setting application status:",
          backendData.application?.applicationStatus
        );
        console.log("Setting isEditable:", backendData.isEditable);
        console.log("Full application data:", backendData.application);
        setApplicationStatus(
          backendData.application?.applicationStatus || "draft"
        );
        setIsEditable(backendData.isEditable !== false); // Default to true if not explicitly false

        // Set PCA eligibility
        const positionType =
          backendData.forms?.positionType?.positionAppliedFor;
        setIsPCAEligible(positionType === "PCA");

        // Set employment type for progress calculation
        setEmploymentType(backendData.application?.employmentType);

        // Extract HR notes if they exist
        if (backendData.application?.hrNotesToEmployee) {
          setHrNotes(backendData.application.hrNotesToEmployee);
        }
      } else {
        // Initialize empty application if no data exists
        initializeEmptyApplication();
      }
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
      if (error.response?.status === 404) {
        // No application exists yet, initialize empty one
        initializeEmptyApplication();
      } else {
        toast.error("Failed to load onboarding data");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setLastRefresh(new Date());

      if (showRefreshToast) {
        toast.success("Tasks refreshed successfully!", {
          duration: 2000,
          style: {
            background: "#10B981",
            color: "white",
          },
        });
      }
    }
  };

  // Helper functions for data transformation
  const getFormStatus = (formData) => {
    if (!formData) return "Pending";
    if (formData.status === "submitted") return "Completed";
    if (formData.status === "completed") return "Completed";
    if (formData.status === "under_review") return "Under Review";
    if (formData.status === "approved") return "Approved";
    if (formData.status === "rejected") return "Needs Revision";
    if (formData.status === "draft" || Object.keys(formData).length > 3)
      return "In Progress";
    return "Pending";
  };

  const getSubmissionStatus = (formData) => {
    if (!formData) return "Not Started";
    if (formData.status === "submitted") return "Submitted";
    if (formData.status === "completed") return "Submitted";
    if (formData.status === "under_review") return "Under Review";
    if (formData.status === "approved") return "Approved";
    if (formData.status === "rejected") return "Needs Revision";
    if (formData.status === "draft") return "Draft";
    return "Not Started";
  };

  const getCompletionCount = (formData) => {
    if (!formData) return 0;
    // Count as complete if form is submitted, completed, under review, or approved
    if (
      formData.status === "submitted" ||
      formData.status === "completed" ||
      formData.status === "under_review" ||
      formData.status === "approved"
    )
      return 1;
    if (formData.status === "rejected") return 0.8; // Almost complete but needs revision
    if (formData.status === "draft") return 0.5;
    return 0;
  };

  // Check if a form is editable based on its status
  const isFormEditable = (formData, applicationStatus) => {
    if (!formData) return true; // New forms are editable

    // Forms are editable if they have no status, draft, completed, submitted, or rejected status
    const editableStatuses = [
      null,
      undefined,
      "draft",
      "completed",
      "submitted",
      "rejected",
    ];
    const formStatus = formData.status;
    const appStatus = applicationStatus;

    // If form status exists, use that; otherwise fall back to application status
    const statusToCheck = formStatus || appStatus;

    return editableStatuses.includes(statusToCheck);
  };

  const getHrReviewStatus = (formData, applicationStatus) => {
    // IMPORTANT: Check application status FIRST - this is the source of truth for HR review status
    // Application status is set when HR moves the task through the Kanban board

    if (applicationStatus === "under_review") {
      return "Under Review"; // HR is reviewing (In Progress stage)
    }

    if (applicationStatus === "in_review_final") {
      return "Final Review"; // HR is doing final review before decision (In Review stage)
    }

    if (applicationStatus === "rejected") {
      return "Rejected"; // Application was rejected by HR
    }

    if (applicationStatus === "approved") {
      return "Approved"; // Application was approved by HR
    }

    // If no application status or form not submitted yet
    if (!formData || !formData.status || formData.status === "draft") {
      return null; // Not submitted yet
    }

    // If form is submitted but application status is still draft/submitted, it's pending review
    if (formData.status === "submitted" || formData.status === "completed") {
      return "Pending Review"; // Submitted but not yet reviewed by HR
    }

    // Handle individual form statuses (these may be set by form-specific operations)
    if (formData.status === "under_review") {
      return "Under Review";
    }

    return null;
  };

  // Helper function to get CPR certificate status (checks if cprFirstAidCertificate file exists)
  const getCprCertificateStatus = (backgroundCheckData) => {
    if (!backgroundCheckData) {
      return "Pending"; // Not started
    }

    // If CPR certificate file exists, it's completed
    if (backgroundCheckData.cprFirstAidCertificate) {
      return "Completed";
    }

    // If background check form is started/completed but no CPR certificate, it's draft
    if (backgroundCheckData.status) {
      return "Draft";
    }

    return "Pending"; // Not started
  };

  // Initialize empty application structure
  const initializeEmptyApplication = () => {
    const emptyTasks = [
      {
        id: "personal-information",
        name: "Personal Information",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "education",
        name: "Education",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "references",
        name: "References",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "work-experience",
        name: "Previous Employment",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "professional-experience",
        name: "Military Service",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "legal-disclosures",
        name: "Disclaimer and Signature",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },

      {
        id: "job-description-pca",
        name: "Job Description",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "code-of-ethics",
        name: "Code of Ethics Form",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "service-delivery-policies",
        name: "Service Delivery Form",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "non-compete-agreement",
        name: "Non-Compete Agreement",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "emergency-contact",
        name: "Emergency Contact Form",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "employee-details-upload",
        name: "Professional Certificate(s)",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },

      {
        id: "background-check",
        name: "Background Check Form",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "misconduct-form",
        name: "Staff Misconduct Statement",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "tb-symptom-screen",
        name: "TB or X-Ray Form",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "employment-type",
        name: "Employment Type Selection",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "direct-deposit",
        name: "Direct Deposit Form",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },

      {
        id: "orientation-presentation",
        name: "Orientation PowerPoint Presentation",
        priority: "High",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
      {
        id: "orientation-checklist",
        name: "Orientation Checklist",
        priority: "Medium",
        type: "Documentation",
        creationDate: new Date().toISOString().split("T")[0],
        status: "Pending",
        submissionStatus: "Not Started",
        formsCompleted: 0,
        totalForms: 1,
        hrReviewStatus: null,
        formData: null,
        isEditable: true,
      },
    ];

    setTasks(emptyTasks);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchOnboardingData();
  }, []);

  // Auto-navigate to first unfilled form when page loads (only once per session)
  useEffect(() => {
    const hasAutoNavigatedSession = sessionStorage.getItem("hasAutoNavigated");

    if (!loading && tasks.length > 0 && !hasAutoNavigatedSession) {
      const firstUnfilledTask = tasks.find(
        (task) =>
          task.status === "Pending" || task.submissionStatus === "Not Started"
      );

      if (firstUnfilledTask) {
        sessionStorage.setItem("hasAutoNavigated", "true");
        setHasAutoNavigated(true);
        // Navigate to the form based on task ID
        if (firstUnfilledTask.id === "personal-information") {
          navigate("/employee/personal-information");
        } else if (firstUnfilledTask.id === "w4-form") {
          navigate("/employee/w4-form");
        } else if (firstUnfilledTask.id === "w9-form") {
          navigate("/employee/w9-form");
        } else if (firstUnfilledTask.id === "emergency-contact") {
          navigate("/employee/emergency-contact");
        } else if (firstUnfilledTask.id === "direct-deposit") {
          navigate("/employee/direct-deposit");
        } else if (firstUnfilledTask.id === "misconduct-form") {
          navigate("/employee/misconduct-form");
        } else if (firstUnfilledTask.id === "code-of-ethics") {
          navigate("/employee/code-of-ethics");
        } else if (firstUnfilledTask.id === "service-delivery-policies") {
          navigate("/employee/service-delivery-policies");
        } else if (firstUnfilledTask.id === "non-compete-agreement") {
          navigate("/employee/non-compete");
        } else if (firstUnfilledTask.id === "orientation-checklist") {
          navigate("/employee/orientation-checklist");
        } else if (firstUnfilledTask.id === "education") {
          navigate("/employee/education");
        } else if (firstUnfilledTask.id === "references") {
          navigate("/employee/references");
        } else if (firstUnfilledTask.id === "legal-disclosures") {
          navigate("/employee/legal-disclosures");
        }
      }
    }
  }, [loading, tasks, navigate]);

  // Manual refresh function
  const handleRefresh = async () => {
    await fetchOnboardingData(true);
  };

  // Auto refresh every 30 seconds if status is submitted, under_review, or in_review_final
  // This ensures employees see HR review status changes in real-time
  useEffect(() => {
    let interval;

    if (
      applicationStatus === "submitted" ||
      applicationStatus === "under_review" ||
      applicationStatus === "in_review_final"
    ) {
      console.log(
        `✅ Auto-refresh ENABLED for applicationStatus: ${applicationStatus}`
      );
      interval = setInterval(async () => {
        if (!loading) {
          console.log("🔄 Auto-refreshing due to pending HR review...");
          console.log(`📊 Current applicationStatus: ${applicationStatus}`);
          await fetchOnboardingData(false); // Silent refresh
        } else {
          console.log("⏸️ Auto-refresh skipped - still loading");
        }
      }, 30000); // 30 seconds
    } else {
      console.log(
        `❌ Auto-refresh DISABLED - applicationStatus is: ${applicationStatus}`
      );
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [applicationStatus, loading]);

  // Auto refresh when user returns to page or focuses the window
  // This ensures employees see HR review status changes when switching back to the tab
  useEffect(() => {
    let focusTimeout;
    let lastFetchTime = 0;
    const MIN_FETCH_INTERVAL = 5000; // Minimum 5 seconds between fetches

    const handleFocus = () => {
      const now = Date.now();
      if (loading || now - lastFetchTime < MIN_FETCH_INTERVAL) {
        console.log(
          "🔍 Page focused - skipped refresh (too soon or already loading)"
        );
        return;
      }

      // Debounce with 1 second delay
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        console.log("🔍 Page focused - refreshing data...");
        lastFetchTime = Date.now();
        fetchOnboardingData(false); // Silent refresh
      }, 1000);
    };

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (
        !document.hidden &&
        !loading &&
        now - lastFetchTime >= MIN_FETCH_INTERVAL
      ) {
        console.log("🔍 Page became visible - refreshing data...");
        lastFetchTime = Date.now();
        fetchOnboardingData(false); // Silent refresh
      }
    };

    // Listen for window focus and visibility change events
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading]);

  // State to store employment type
  const [employmentType, setEmploymentType] = useState(null);

  // Helper function to check if a form should be counted in progress
  const shouldCountForm = (formKey, empType) => {
    if (!empType) return true; // Count all if no employment type selected

    if (empType === "W-2") {
      // For W-2 employees, W4 is required, W9 is optional
      return formKey !== "w9Form";
    } else if (empType === "1099") {
      // For 1099 contractors, W9 is required, W4 is optional
      return formKey !== "w4Form";
    }

    return true; // Default to counting all
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!tasks || tasks.length === 0) {
      return {
        completed: 0,
        total: 20,
        percentage: 0,
        isComplete: false,
      };
    }

    // Map task IDs to FORM_KEYS - only include forms that are in FORM_KEYS
    const taskIdToFormKey = {
      "personal-information": "personalInformation",
      education: "education",
      references: "references",
      "work-experience": "workExperience",
      "professional-experience": "professionalExperience",
      "legal-disclosures": "legalDisclosures",
      "job-description-pca": "jobDescriptionPCA",
      "code-of-ethics": "codeOfEthics",
      "service-delivery-policies": "serviceDeliveryPolicy",
      "non-compete-agreement": "nonCompeteAgreement",
      "emergency-contact": "emergencyContact",
      "background-check": "backgroundCheck",
      "misconduct-form": "misconductStatement",
      "tb-symptom-screen": "tbSymptomScreen",
      "employment-type": "employmentType",
      "direct-deposit": "directDeposit",
      "orientation-presentation": "orientationPresentation",
      "orientation-checklist": "orientationChecklist",
      "w4-form": "w4Form",
      "w9-form": "w9Form",
    };

    // Count completed forms based on employment type filtering
    const completedCount = tasks.filter((task) => {
      const formKey = taskIdToFormKey[task.id];

      // Skip tasks that aren't in FORM_KEYS (like employee-details-upload)
      if (!formKey) return false;

      // Only count forms that should be counted based on employment type
      if (!shouldCountForm(formKey, employmentType)) return false;

      const submissionStatus = task.submissionStatus;
      return (
        submissionStatus === "Submitted" ||
        submissionStatus === "Under Review" ||
        submissionStatus === "Approved"
      );
    }).length;

    // Calculate total forms based on employment type
    const totalForms = FORM_KEYS.filter((key) =>
      shouldCountForm(key, employmentType)
    ).length;

    const progressPercentage =
      totalForms > 0 ? (completedCount / totalForms) * 100 : 0;

    console.log("📊 Task Management Progress Calculation:", {
      completedCount,
      totalForms,
      employmentType,
      percentage: Math.round(progressPercentage),
    });

    return {
      completed: completedCount,
      total: totalForms,
      percentage: Math.round(progressPercentage),
      isComplete: completedCount === totalForms && totalForms > 0,
    };
  };

  const overallProgress = calculateOverallProgress();

  // Handle application submission
  const handleSubmitApplication = async () => {
    if (overallProgress.isComplete) {
      try {
        const isResubmission = applicationStatus === "submitted";

        // Show loading toast
        const loadingToast = toast.loading(
          isResubmission
            ? "Resubmitting your application to HR..."
            : "Submitting your application to HR...",
          {
            style: {
              background: "#3B82F6",
              color: "white",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "16px 24px",
              fontSize: "16px",
            },
          }
        );

        // Get current user ID and application ID
        const userData = ensureTestUser();
        const employeeId = userData._id || userData.id;

        // Get application ID from first task (they all have the same applicationId)
        const applicationId = tasks.find(
          (task) => task.applicationId
        )?.applicationId;

        if (!applicationId) {
          toast.dismiss(loadingToast);
          toast.error(
            "Application not found. Please reload the page and try again."
          );
          return;
        }

        console.log("Submitting application:", {
          applicationId,
          employeeId,
          isResubmission,
        });
        console.log(
          "Current tasks status:",
          tasks.map((task) => ({
            name: task.title,
            status: task.status,
            submissionStatus: task.submissionStatus,
            formData: task.formData
              ? { status: task.formData.status, id: task.formData._id }
              : "No formData",
          }))
        );

        const response = await axios.put(
          `${baseURL}/onboarding/submit-application/${applicationId}`,
          {},
          {
            withCredentials: true,
          }
        );

        // Dismiss loading toast
        toast.dismiss(loadingToast);

        if (response.data && response.data.application) {
          // Show success message based on whether it's a resubmission
          if (isResubmission) {
            toast.success("🔄 Application Successfully Resubmitted to HR!", {
              style: {
                background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "20px 32px",
                fontSize: "18px",
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
              },
              duration: 6000,
              icon: "🔄",
            });

            // Show additional info toast for resubmission
            setTimeout(() => {
              toast.success(
                "📋 Your updated application is now under HR review again!",
                {
                  style: {
                    background: "#3B82F6",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    padding: "16px 24px",
                    fontSize: "16px",
                  },
                  duration: 4000,
                  icon: "📝",
                }
              );
            }, 1500);
          } else {
            toast.success("🎉 Application Successfully Submitted to HR!", {
              style: {
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "20px 32px",
                fontSize: "18px",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
              },
              duration: 6000,
              icon: "✅",
            });

            // Show additional info toast for initial submission
            setTimeout(() => {
              toast.success("📋 Your application is now under HR review!", {
                style: {
                  background: "#3B82F6",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  fontSize: "16px",
                },
                duration: 4000,
                icon: "📝",
              });
            }, 1500);
          }

          // Refresh data to reflect submission/resubmission
          await fetchOnboardingData(true);
        }
      } catch (error) {
        console.error("Error submitting application:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);

        if (error.response?.data?.incompleteforms) {
          const incompleteFormsList =
            error.response.data.incompleteforms.join(", ");
          console.log("Incomplete forms:", error.response.data.incompleteforms);
          toast.error(
            `❌ Cannot submit application. Please complete: ${incompleteFormsList}`,
            {
              style: {
                background: "#EF4444",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "16px 24px",
                fontSize: "16px",
              },
              duration: 6000,
            }
          );
        } else {
          const isResubmission = applicationStatus === "submitted";
          toast.error(
            isResubmission
              ? "❌ Failed to resubmit application. Please try again."
              : "❌ Failed to submit application. Please try again.",
            {
              style: {
                background: "#EF4444",
                color: "white",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "16px 24px",
                fontSize: "16px",
              },
              duration: 4000,
            }
          );
        }
      }
    } else {
      const remainingForms = overallProgress.total - overallProgress.completed;
      const isResubmission = applicationStatus === "submitted";
      toast.error(
        `⚠️ Please complete ${remainingForms} more form${
          remainingForms > 1 ? "s" : ""
        } before ${isResubmission ? "resubmitting" : "submitting"}!`,
        {
          style: {
            background: "#F59E0B",
            color: "white",
            fontWeight: "bold",
            borderRadius: "12px",
            padding: "16px 24px",
            fontSize: "16px",
          },
          duration: 5000,
          icon: "📝",
        }
      );
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Apply filters and sorting to tasks
  const filteredTasks = tasks.filter((task) => {
    // Show all forms (including extra forms like employee-details-upload, cpr, driving-license)
    // but progress bar only counts the 20 core forms
    const matchesSearch = task.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Under Review":
        return "bg-purple-100 text-purple-700";
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Needs Revision":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get submission status badge color
  const getSubmissionStatusBadgeColor = (submissionStatus) => {
    switch (submissionStatus) {
      case "Submitted":
        return "bg-blue-100 text-blue-700";
      case "Draft":
        return "bg-yellow-100 text-yellow-700";
      case "Not Started":
        return "bg-gray-100 text-gray-700";
      case "Under Review":
        return "bg-purple-100 text-purple-700";
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Needs Revision":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get HR review status badge color
  const getHrReviewStatusBadgeColor = (reviewStatus) => {
    switch (reviewStatus) {
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Needs Revision":
        return "bg-red-100 text-red-700";
      case "Under Review":
        return "bg-purple-100 text-purple-700";
      case "Final Review":
        return "bg-orange-100 text-orange-700"; // Orange for final review stage
      case "Pending Review":
        return "bg-blue-100 text-blue-700";
      case "Rejected": // Legacy status
        return "bg-red-100 text-red-700";
      case "Accepted": // Legacy status
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-700" />;
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-700" />;
      case "Pending":
        return <AlertTriangle className="w-4 h-4 text-amber-700" />;
      case "Under Review":
        return <Clock className="w-4 h-4 text-purple-700" />;
      case "Approved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-700" />;
      case "Needs Revision":
        return <XCircle className="w-4 h-4 text-red-700" />;
      default:
        return null;
    }
  };

  // DEBUG: Force all forms to completed status
  const debugFixForms = async () => {
    try {
      const userData = ensureTestUser();
      const applicationId = tasks.find(
        (task) => task.applicationId
      )?.applicationId;

      if (!applicationId) {
        toast.error("Application not found");
        return;
      }

      console.log("Fixing forms for application:", applicationId);

      const response = await axios.post(
        `${baseURL}/onboarding/debug-fix-forms/${applicationId}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("✅ All forms marked as completed!", {
          duration: 3000,
        });

        // Refresh data
        await fetchOnboardingData(true);
      }
    } catch (error) {
      console.error("Error fixing forms:", error);
      toast.error("Failed to fix forms");
    }
  };

  // Debug logging for application status
  console.log("Current applicationStatus:", applicationStatus);
  console.log("Is submitted?", applicationStatus === "submitted");

  // Effect to periodically check for status updates (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isRefreshing) {
        console.log("⏰ Auto-refreshing application status...");
        fetchOnboardingData(false); // Silent refresh without toast
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, isRefreshing]);

  return (
    <>
      <Layout>
        <div className="w-full h-full bg-gray-50 min-h-screen">
          <Navbar />

          <div className="flex flex-col w-full p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    My Tasks
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base">
                    Manage and track your assigned tasks
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status indicator */}
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          applicationStatus === "approved"
                            ? "bg-green-500"
                            : applicationStatus === "under_review"
                            ? "bg-yellow-500"
                            : applicationStatus === "submitted"
                            ? "bg-blue-500"
                            : applicationStatus === "rejected"
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="capitalize">
                        {applicationStatus === "under_review"
                          ? "Under Review"
                          : applicationStatus === "submitted"
                          ? "Submitted"
                          : applicationStatus}
                      </span>
                    </div>
                    <span>•</span>
                    <span>
                      Last updated: {lastRefresh.toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Refresh button */}
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    <span className="hidden sm:inline">
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </span>
                  </button>
                </div>
              </div>

              {/* HR Notes Section in Header */}
              {hrNotes && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        HR Notes
                      </h3>
                      <p className="text-sm text-gray-600">
                        Important notes from HR regarding your onboarding
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            HR Team
                          </span>
                          <span className="text-xs text-gray-500">
                            {hrNotes.sentAt
                              ? new Date(hrNotes.sentAt).toLocaleDateString()
                              : "Recent"}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {hrNotes.note}
                        </p>
                        {hrNotes.signature && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                HR Signature:
                              </span>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs">
                              {(() => {
                                const buildSignatureUrl = (signaturePath) => {
                                  if (!signaturePath) return "";
                                  const baseURL = import.meta.env.VITE__BASEURL;

                                  if (signaturePath.startsWith("http")) {
                                    return signaturePath;
                                  }
                                  if (signaturePath.startsWith("/uploads/")) {
                                    return `${baseURL}${signaturePath}`;
                                  }
                                  if (signaturePath.includes("uploads/")) {
                                    const uploadsIndex =
                                      signaturePath.indexOf("uploads/");
                                    const relativePath =
                                      signaturePath.substring(uploadsIndex);
                                    return `${baseURL}/${relativePath}`;
                                  }
                                  return `${baseURL}/${signaturePath.replace(
                                    /^\//,
                                    ""
                                  )}`;
                                };

                                const signatureUrl = buildSignatureUrl(
                                  hrNotes.signature
                                );

                                return (
                                  <>
                                    <img
                                      src={signatureUrl}
                                      alt="HR Signature"
                                      className="max-h-16 object-contain"
                                      onLoad={() => {
                                        console.log(
                                          "✅ HR signature loaded successfully:",
                                          signatureUrl
                                        );
                                      }}
                                      onError={(e) => {
                                        console.error(
                                          "❌ Failed to load HR signature:",
                                          hrNotes.signature,
                                          "❌ Attempted URL:",
                                          signatureUrl
                                        );
                                        e.target.style.display = "none";
                                        // Show fallback text
                                        if (e.target.nextElementSibling) {
                                          e.target.nextElementSibling.style.display =
                                            "block";
                                        }
                                      }}
                                    />
                                    <div
                                      style={{
                                        display: "none",
                                        color: "red",
                                        fontSize: "12px",
                                        marginTop: "8px",
                                      }}
                                    >
                                      Signature image could not be loaded
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Application Submitted Banner */}
            {applicationStatus === "submitted" && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-800 mb-1">
                      🎉 Application Submitted Successfully!
                    </h3>
                    <p className="text-green-700 text-sm mb-2">
                      Your onboarding application has been sent to HR for
                      review. You can make updates and resubmit if needed. The
                      page will automatically refresh to show status updates.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-green-600">
                      <div className="flex items-center gap-1">
                        <span>📋</span>
                        <span>Status: Under HR Review</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏰</span>
                        <span>Review Time: 2-3 business days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔄</span>
                        <span>Resubmission available anytime</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📧</span>
                        <span>You'll be notified of the outcome</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Application Under Review Banner */}
            {applicationStatus === "under_review" && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl shadow-sm border border-yellow-200 p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-800 mb-1">
                      🔍 Application Under HR Review
                    </h3>
                    <p className="text-yellow-700 text-sm mb-2">
                      HR is currently reviewing your onboarding application.
                      This process typically takes 2-3 business days. The page
                      will automatically refresh to show status updates.
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-yellow-600">
                      <div className="flex items-center gap-1">
                        <span>📋</span>
                        <span>Status: In Progress Review</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏰</span>
                        <span>Expected completion: 2-3 days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🔄</span>
                        <span>Updates will appear automatically</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📧</span>
                        <span>You'll be notified of any changes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Application Approved Banner */}
            {applicationStatus === "approved" && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-800 mb-1">
                      ✅ Application Approved by HR!
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Congratulations! Your onboarding application has been
                      approved. Welcome to the team!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Application Rejected Banner */}
            {applicationStatus === "rejected" && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-sm border border-red-200 p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-800 mb-1">
                      Application Requires Attention
                    </h3>
                    <p className="text-red-700 text-sm">
                      Your application needs some updates. Please contact HR for
                      more details.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Application Progress Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Application Progress
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Complete all {overallProgress.total} forms to{" "}
                      {applicationStatus === "submitted"
                        ? "resubmit"
                        : "submit"}{" "}
                      your application
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {overallProgress.completed}/{overallProgress.total}
                  </div>
                  <div className="text-sm text-gray-600">Forms Completed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Progress
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {overallProgress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${overallProgress.percentage}%` }}
                  >
                    {overallProgress.percentage > 10 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {overallProgress.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Milestones */}
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* DEBUG: Fix Forms Button (temporary) */}
              <div className="flex justify-center mt-4">
                {/* <button
                  onClick={debugFixForms}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
                >
                  🔧 DEBUG: Mark All Forms as Completed
                </button> */}
              </div>
            </div>

            {/* Quick Tips Section */}
            {!overallProgress.isComplete && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">
                      Quick Tips
                    </h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• You can complete forms in any order you prefer</li>
                      <li>• Save drafts and return to complete later</li>
                      <li>
                        • All {overallProgress.total} forms must be completed
                        before HR submission
                      </li>
                      <li>
                        • Once submitted, your application will be reviewed by
                        HR
                      </li>
                      <li>• Contact HR if you need assistance with any form</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-2">
                {/* Search Bar */}
                <div className="flex-1 flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Task Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th
                        className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer min-w-[200px]"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          TASK NAME
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th
                        className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer min-w-[140px]"
                        onClick={() => requestSort("creationDate")}
                      >
                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline">
                            CREATION DATE
                          </span>
                          <span className="sm:hidden">CREATED</span>
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th
                        className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer min-w-[120px]"
                        onClick={() => requestSort("status")}
                      >
                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline">TASK STATUS</span>
                          <span className="sm:hidden">STATUS</span>
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[140px]">
                        <span className="hidden sm:inline">
                          SUBMISSION STATUS
                        </span>
                        <span className="sm:hidden">SUBMISSION</span>
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">
                        HR REVIEW
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-[80px]">
                        NOTES
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-gray-500">
                              Loading onboarding tasks...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : sortedTasks.length > 0 ? (
                      sortedTasks.map((task) => (
                        <tr
                          key={task.id}
                          className={`transition-colors duration-200 ${
                            task.submissionStatus === "Submitted"
                              ? "bg-green-50 hover:bg-green-100 border-l-4 border-green-500"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-3">
                              {task.submissionStatus === "Submitted" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                              )}
                              <div
                                className={`font-medium text-sm sm:text-base ${
                                  task.submissionStatus === "Submitted"
                                    ? "text-green-800"
                                    : "text-gray-900"
                                }`}
                              >
                                {task.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                              <CalendarIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(
                                  task.creationDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                task.status
                              )}`}
                            >
                              {getStatusIcon(task.status)}
                              <span className="truncate">{task.status}</span>
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSubmissionStatusBadgeColor(
                                task.submissionStatus
                              )}`}
                            >
                              {task.submissionStatus === "Submitted" && (
                                <Send className="w-3 h-3 mr-1 flex-shrink-0" />
                              )}
                              {task.submissionStatus === "Draft" && (
                                <Save className="w-3 h-3 mr-1 flex-shrink-0" />
                              )}
                              {task.submissionStatus === "Not Started" && (
                                <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                              )}
                              <span className="truncate">
                                {task.submissionStatus}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            {task.hrReviewStatus ? (
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getHrReviewStatusBadgeColor(
                                  task.hrReviewStatus
                                )}`}
                              >
                                <span className="truncate">
                                  {task.hrReviewStatus}
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-center">
                            {(() => {
                              const hasNotes =
                                task.formData?.hrFeedback &&
                                Object.keys(task.formData.hrFeedback).length >
                                  0 &&
                                (task.formData.hrFeedback.comment ||
                                  task.formData.hrFeedback.notes ||
                                  task.formData.hrFeedback.feedback ||
                                  task.formData.hrFeedback.note ||
                                  task.formData.hrFeedback
                                    .companyRepSignature ||
                                  task.formData.hrFeedback
                                    .companyRepresentativeSignature ||
                                  task.formData.hrFeedback.notarySignature ||
                                  task.formData.hrFeedback.agencySignature ||
                                  task.formData.hrFeedback.clientSignature ||
                                  Object.keys(task.formData.hrFeedback).some(
                                    (key) =>
                                      task.formData.hrFeedback[key] &&
                                      typeof task.formData.hrFeedback[key] ===
                                        "string" &&
                                      task.formData.hrFeedback[key].trim()
                                        .length > 0
                                  ));

                              return hasNotes ? (
                                <HRNotesIndicator
                                  hrFeedback={{
                                    ...(task.formData?.hrFeedback || {}),
                                    ...(task.formData?.companyRepSignature
                                      ? {
                                          companyRepSignature:
                                            task.formData.companyRepSignature,
                                        }
                                      : {}),
                                    ...(task.formData?.companyRepresentative
                                      ?.signature
                                      ? {
                                          companyRepresentativeSignature:
                                            task.formData.companyRepresentative
                                              .signature,
                                        }
                                      : {}),
                                  }}
                                  supervisorSignature={
                                    task.formData?.supervisorSignature
                                  }
                                  formStatus={task.formData.status}
                                  formTitle={task.name}
                                />
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              );
                            })()}
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                              {(() => {
                                // Check if form has HR notes
                                const hasHrNotes =
                                  task.formData?.hrFeedback &&
                                  Object.keys(task.formData.hrFeedback).length >
                                    0 &&
                                  (task.formData.hrFeedback.comment ||
                                    task.formData.hrFeedback.notes ||
                                    task.formData.hrFeedback.feedback ||
                                    task.formData.hrFeedback.note ||
                                    task.formData.hrFeedback
                                      .companyRepSignature ||
                                    task.formData.hrFeedback
                                      .companyRepresentativeSignature ||
                                    task.formData.hrFeedback.notarySignature ||
                                    task.formData.hrFeedback.agencySignature ||
                                    task.formData.hrFeedback.clientSignature ||
                                    Object.keys(task.formData.hrFeedback).some(
                                      (key) =>
                                        task.formData.hrFeedback[key] &&
                                        typeof task.formData.hrFeedback[key] ===
                                          "string" &&
                                        task.formData.hrFeedback[key].trim()
                                          .length > 0
                                    ));

                                // Forms that don't require HR notes to be edited
                                const alwaysEditableForms = [
                                  "training-video",
                                  "pca-training-questions",
                                ];

                                // Edit button is only enabled if form has HR notes or is in alwaysEditableForms
                                const isEditEnabled =
                                  hasHrNotes ||
                                  alwaysEditableForms.includes(task.id);

                                return (
                                  <button
                                    onClick={() => {
                                      if (!isEditEnabled) {
                                        toast.error(
                                          "This form can only be edited after HR sends you feedback notes."
                                        );
                                        return;
                                      }

                                      // Navigate to integrated form routes based on task ID
                                      if (task.id === "personal-information") {
                                        navigate(
                                          "/employee/personal-information"
                                        );
                                      } else if (
                                        task.id === "professional-experience"
                                      ) {
                                        navigate(
                                          "/employee/professional-experience"
                                        );
                                      } else if (
                                        task.id === "work-experience"
                                      ) {
                                        navigate("/employee/work-experience");
                                      } else if (
                                        task.id === "employment-type"
                                      ) {
                                        navigate("/employee/employment-type");
                                      } else if (task.id === "w4-form") {
                                        navigate("/employee/w4-form");
                                      } else if (task.id === "w9-form") {
                                        navigate("/employee/w9-form");
                                      } else if (
                                        task.id === "emergency-contact"
                                      ) {
                                        navigate("/employee/emergency-contact");
                                      } else if (task.id === "direct-deposit") {
                                        navigate("/employee/direct-deposit");
                                      } else if (
                                        task.id === "misconduct-form"
                                      ) {
                                        navigate("/employee/misconduct-form");
                                      } else if (task.id === "code-of-ethics") {
                                        navigate("/employee/code-of-ethics");
                                      } else if (
                                        task.id === "service-delivery-policies"
                                      ) {
                                        navigate(
                                          "/employee/service-delivery-policies"
                                        );
                                      } else if (
                                        task.id === "non-compete-agreement"
                                      ) {
                                        navigate("/employee/non-compete");
                                      } else if (
                                        task.id === "background-check"
                                      ) {
                                        navigate(
                                          "/employee/edit-background-form-check-results"
                                        );
                                      } else if (
                                        task.id === "tb-symptom-screen"
                                      ) {
                                        navigate(
                                          "/employee/edit-tb-symptom-screen-form"
                                        );
                                      } else if (
                                        task.id === "orientation-checklist"
                                      ) {
                                        navigate(
                                          "/employee/orientation-checklist"
                                        );
                                      } else if (
                                        task.id === "job-description-pca"
                                      ) {
                                        navigate(
                                          "/employee/job-description-pca"
                                        );
                                      } else if (
                                        task.id === "job-description-cna"
                                      ) {
                                        navigate(
                                          `/employee/edit-cna-form/${
                                            task.applicationId || "new"
                                          }`
                                        );
                                      } else if (
                                        task.id === "job-description-lpn"
                                      ) {
                                        navigate(
                                          `/employee/edit-lpn-form/${
                                            task.applicationId || "new"
                                          }`
                                        );
                                      } else if (
                                        task.id === "job-description-rn"
                                      ) {
                                        navigate(
                                          `/employee/edit-rn-form/${
                                            task.applicationId || "new"
                                          }`
                                        );
                                      } else if (
                                        task.id === "pca-training-questions"
                                      ) {
                                        navigate(
                                          "/employee/pca-training-questions"
                                        );
                                      } else if (
                                        task.id === "orientation-presentation"
                                      ) {
                                        navigate(
                                          "/employee/orientation-presentation"
                                        );
                                      } else if (task.id === "education") {
                                        navigate("/employee/education");
                                      } else if (task.id === "references") {
                                        navigate("/employee/references");
                                      } else if (
                                        task.id === "legal-disclosures"
                                      ) {
                                        navigate("/employee/legal-disclosures");
                                      } else if (task.id === "training-video") {
                                        navigate("/employee/training-video");
                                      } else if (
                                        task.id === "pca-training-questions"
                                      ) {
                                        navigate(
                                          "/employee/pca-training-questions"
                                        );
                                      } else if (
                                        task.id === "driving-license"
                                      ) {
                                        navigate(
                                          "/employee/driving-license-upload"
                                        );
                                      } else {
                                        toast.error("Form not available yet");
                                      }
                                    }}
                                    disabled={!isEditEnabled}
                                    className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg transition-colors text-xs sm:text-sm font-medium min-w-0 flex-shrink-0 ${
                                      isEditEnabled
                                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                                        : "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                    }`}
                                    title={
                                      !isEditEnabled
                                        ? "Form can only be edited after HR sends feedback notes"
                                        : "Edit form"
                                    }
                                  >
                                    <Edit
                                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                        !isEditEnabled ? "text-gray-400" : ""
                                      }`}
                                    />
                                    <span className="hidden xs:inline">
                                      Edit
                                    </span>
                                  </button>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No tasks found matching your filters. Try adjusting
                          your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Submit Application Button - Moved to end of Part 2 */}
              <div className="px-6 py-6 border-t border-gray-100 bg-blue-50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    {overallProgress.isComplete ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <div>
                          <h3 className="font-bold text-green-700">
                            {applicationStatus === "submitted"
                              ? "Ready to Resubmit to HR!"
                              : "Ready to Submit to HR!"}
                          </h3>
                          <p className="text-sm text-green-600">
                            {applicationStatus === "submitted"
                              ? "All forms completed - Ready for HR resubmission"
                              : "All forms completed - Ready for HR review"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Users className="w-8 h-8 text-blue-500" />
                        <div>
                          <h3 className="font-bold text-gray-700">
                            Complete Remaining Forms
                          </h3>
                          <p className="text-sm text-gray-600">
                            {overallProgress.total - overallProgress.completed}{" "}
                            more form
                            {overallProgress.total -
                              overallProgress.completed !==
                            1
                              ? "s"
                              : ""}{" "}
                            before HR{" "}
                            {applicationStatus === "submitted"
                              ? "resubmission"
                              : "submission"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleSubmitApplication}
                    disabled={!overallProgress.isComplete}
                    className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[220px] justify-center ${
                      overallProgress.isComplete
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-400"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                    }`}
                  >
                    {overallProgress.isComplete ? (
                      <>
                        <Send className="w-5 h-5" />
                        {applicationStatus === "submitted"
                          ? "Resubmit to HR"
                          : "Submit to HR"}
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5" />
                        {applicationStatus === "submitted"
                          ? "Resubmit to HR"
                          : "Submit to HR"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Pagination & Summary */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
                    <div>
                      Showing {sortedTasks.length} of {overallProgress.total}{" "}
                      tasks
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-700">
                          {overallProgress.completed} Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="font-medium text-orange-700">
                          {overallProgress.total - overallProgress.completed}{" "}
                          Remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Previous
                    </button>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default EmployeeTaskManagement;
