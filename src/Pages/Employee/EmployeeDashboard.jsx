import React, { useEffect, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import VecIcon from "../../assets/VecIcon.png";
import { TrashIcon, UploadIcon } from "../../assets/Svgs/AllSvgs";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { toast } from "react-toastify";
import {
  X,
  MapPin,
  Edit2,
  Mail,
  Phone,
  Briefcase,
  Award,
  Calendar,
  Clock,
  FileText,
  Download,
  BookOpen,
  GraduationCap,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  HelpCircle,
  ChevronRight,
  Upload,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Building,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Format phone number as +1 (XXX) XXX-XXXX
const formatPhone = (value) => {
  if (!value) return "";

  // Remove +1 prefix if it exists, then remove all non-digit characters
  const withoutPrefix = String(value).replace(/^\+1\s*/, "");
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
    return `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(
      6
    )}`;
  }
};

export const EmployeeDashboard = () => {
  const userToken = Cookies.get("session");
  const decodedToken = userToken && jwtDecode(userToken);
  const user = decodedToken?.user;

  // Get user data from cookie for latest OTP status
  const userCookie = Cookies.get("user");
  const userData = userCookie ? JSON.parse(userCookie) : user;
  const baseURL = import.meta.env.VITE__BASEURL;
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [updateTaskStatus, setUpdateTaskStatus] = useState("");
  const [clientSession, setClientSession] = useState("");
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [task, setTask] = useState({
    taskStatus: false,
    taskInfo: null,
  });

  // Onboarding Progress State
  const [onboardingTasks, setOnboardingTasks] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState("draft");
  const [applicationId, setApplicationId] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // HR Notes State
  const [hrNotes, setHrNotes] = useState(null);

  // Profile Edit State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [profileData, setProfileData] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
  });
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // OTP State
  const [otpEnabled, setOtpEnabled] = useState(userData?.otpEnabled || false);
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);

  // Change Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const router = useNavigate();

  const getEmployeeInfo = async (token) => {
    const employeeInfo = await axios.get(
      `${baseURL}/employee/get-employee-info`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    setEmployeeInfo(employeeInfo.data.employeeInfo);
  };

  useEffect(() => {
    const session = Cookies.get("session");
    if (!session) {
      return router("/auth/log-in");
    }
    setClientSession(session);

    getEmployeeInfo(session);
    fetchOnboardingProgress(); // Add onboarding progress fetch
  }, []);

  const handlePriorityBg = (priority) => {
    switch (priority) {
      case "Normal":
        return "bg-green-100 text-green-700 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "In Review":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Complete":
        return "bg-green-100 text-green-700 border-green-200";
      case "Reject":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "In Progress":
        return <AlertCircle size={16} />;
      case "In Review":
        return <Clock size={16} />;
      case "Complete":
        return <CheckCircle size={16} />;
      case "Reject":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const handleTaskStatusUpdate = async (taskId) => {
    try {
      const updateTask = await axios.put(
        `${baseURL}/task/update-task`,
        {
          taskId: taskId,
          taskStatus: updateTaskStatus,
        },
        {
          headers: {
            Authorization: clientSession,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(updateTask.data.message);
      setTask({
        taskStatus: false,
        taskInfo: null,
      });
      getEmployeeInfo(clientSession);
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async (taskId) => {
    if (selectedFiles.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("docs", selectedFiles[i]);
    }
    formData.append("taskId", taskId);
    formData.append("taskStatus", "In Review");

    try {
      setUploading(true);
      const response = await axios.put(
        `${baseURL}/task/update-task`,
        formData,
        {
          headers: {
            Authorization: clientSession,
          },
        }
      );

      setMessage(response.data.message);
      getEmployeeInfo(clientSession);
      window.location.reload();
    } catch (error) {
      setMessage(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (taskId, docId = null) => {
    if (!taskId) {
      alert("Task ID is required.");
      return;
    }

    try {
      const confirmDelete = window.confirm(
        docId
          ? "Are you sure you want to delete this file?"
          : "Are you sure you want to delete this task?"
      );
      if (!confirmDelete) return;

      if (docId) {
        const response = await axios.delete(`${baseURL}/task/delete-document`, {
          data: { taskId, docId },
          headers: {
            Authorization: clientSession,
          },
        });
        window.location.reload();
      } else {
        const response = await axios.delete(`${baseURL}/task/${taskId}`, {
          headers: {
            Authorization: clientSession,
          },
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert(
        error.response?.data?.message ||
          (docId
            ? "Failed to delete file. Please try again."
            : "Failed to delete task. Please try again.")
      );
    }
  };

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

  // Get user data (like in TaskManagement)
  const getUserData = () => {
    if (user && user._id) {
      return user;
    }

    // Fallback to localStorage/cookies if needed
    try {
      const userData = localStorage.getItem("userInfo");
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    return null;
  };

  // Fetch onboarding data from backend (similar to TaskManagement)
  const fetchOnboardingProgress = async () => {
    try {
      // Get current user ID from JWT token or localStorage (with fallback test user)
      const userData = ensureTestUser();
      const employeeId = userData._id || userData.id;

      if (!employeeId) {
        console.error("No employee ID found. User might not be logged in.");
        toast.error("Please log in to view your onboarding tasks");
        return;
      }

      console.log("Fetching onboarding data for employee:", employeeId);
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
      console.log("🔍 Full backend response:", response.data);

      if (response.data && response.data.data) {
        const backendData = response.data.data;

        // Transform backend data into task format - matching sidebar sequence
        const transformedTasks = [
          // Part 1: Employment Application
          {
            id: "personal-information",
            name: "Applicant Information",
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
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.legalDisclosures,
              backendData.application?.applicationStatus
            ),
          },
          // Part 2: Documents to Submit
          {
            id: "job-description",
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
            id: "background-check",
            name: "Background Check Form",
            priority: "Low",
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
            name: "Staff Misconduct Form",
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
            ...(backendData.forms?.misconductStatement?.notarySignature
              ? {
                  formData: {
                    ...backendData.forms?.misconductStatement,
                    hrFeedback: {
                      ...backendData.forms?.misconductStatement?.hrFeedback,
                      notarySignature:
                        backendData.forms?.misconductStatement?.notarySignature,
                    },
                  },
                }
              : {}),
          },
          {
            id: "tb-symptom-screen",
            name: "TB or X-Ray Form",
            priority: "Low",
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
            id: "i9-form",
            name: "I-9 Employment Eligibility",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.i9Form),
            submissionStatus: getSubmissionStatus(backendData.forms?.i9Form),
            formsCompleted: getCompletionCount(backendData.forms?.i9Form),
            totalForms: 1,
            hrReviewStatus: getHrReviewStatus(
              backendData.forms?.i9Form,
              backendData.application?.applicationStatus
            ),
            formData: backendData.forms?.i9Form,
            applicationId: backendData.application?._id,
            isEditable: isFormEditable(
              backendData.forms?.i9Form,
              backendData.application?.applicationStatus
            ),
          },
          {
            id: "w4-form",
            name: "W-4 Tax Form",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.w4Form),
            submissionStatus: getSubmissionStatus(backendData.forms?.w4Form),
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
          {
            id: "w9-form",
            name: "W-9 Tax Form",
            priority: "High",
            type: "Documentation",
            creationDate: backendData.application?.createdAt
              ? new Date(backendData.application.createdAt)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            status: getFormStatus(backendData.forms?.w9Form),
            submissionStatus: getSubmissionStatus(backendData.forms?.w9Form),
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
          // Part 3: Orientation Documentation
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
            priority: "Low",
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
        ];

        setOnboardingTasks(transformedTasks);
        setApplicationStatus(
          backendData.application?.applicationStatus || "draft"
        );
        setApplicationId(backendData.application?._id);

        // Extract HR notes if they exist
        if (backendData.application?.hrNotesToEmployee) {
          setHrNotes(backendData.application.hrNotesToEmployee);
        }
      }
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Helper functions (from TaskManagement)
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
    if (!formData) return null;

    // If form is not submitted yet, no HR review status
    if (!formData.status || formData.status === "draft") return null;

    // Use individual form status if available, otherwise fall back to application status
    const statusToCheck = formData.status || applicationStatus;

    // Map status to HR review status
    switch (statusToCheck) {
      case "draft":
        return null; // Not submitted yet
      case "submitted":
      case "completed":
        return "Pending Review"; // Submitted but not yet reviewed
      case "under_review":
        return "Under Review"; // HR is actively reviewing
      case "approved":
        return "Approved"; // HR approved the application
      case "rejected":
        return "Needs Revision"; // HR rejected the application
      default:
        return null;
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    // Count forms as completed if they are submitted, completed, under review, or approved
    const completedForms = onboardingTasks.filter((task) => {
      const submissionStatus = task.submissionStatus;
      return (
        submissionStatus === "Submitted" ||
        submissionStatus === "Under Review" ||
        submissionStatus === "Approved"
      );
    }).length;

    const totalForms = onboardingTasks.length;
    const progressPercentage =
      totalForms > 0 ? (completedForms / totalForms) * 100 : 0;

    return {
      completed: completedForms,
      total: totalForms,
      percentage: Math.round(progressPercentage),
      isComplete: completedForms === totalForms && totalForms > 0,
    };
  };

  // Profile Update Functions
  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileInputChange = (field, value) => {
    // Format phone number if it's the phone field
    let formattedValue = value;
    if (field === "phone") {
      formattedValue = formatPhone(value);
    }
    setProfileData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);

      // Extract only digits from formatted phone number
      const phoneDigitsOnly = profileData.phone.replace(/\D/g, "");

      const formData = new FormData();

      // Add text fields
      formData.append("userName", profileData.userName);
      formData.append("email", profileData.email);
      formData.append("phone", phoneDigitsOnly);

      // Add profile image if selected
      if (selectedProfileImage) {
        formData.append("profileImage", selectedProfileImage);
      }

      const response = await axios.put(
        `${baseURL}/employee/update-profile`,
        formData,
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        setShowEditProfile(false);

        // Refresh the JWT token with updated user data
        try {
          const refreshResponse = await axios.post(
            `${baseURL}/employee/refresh-token`,
            {},
            {
              headers: {
                Authorization: userToken,
              },
            }
          );

          if (refreshResponse.data.success) {
            // Update the session cookie with new token
            Cookies.set("session", refreshResponse.data.token);

            // Reload page to reflect changes
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          // Fallback to page reload
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const openEditProfile = () => {
    // Reset form with current user data
    setProfileData({
      userName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
    });
    setSelectedProfileImage(null);
    setProfileImagePreview(null);
    setShowEditProfile(true);
  };

  const handleToggleOTP = async () => {
    setIsTogglingOtp(true);
    try {
      const userToken = Cookies.get("session");
      const response = await axios.post(
        `${baseURL}/auth/toggle-otp`,
        {
          userId: user?._id,
          otpEnabled: !otpEnabled,
        },
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "Success") {
        setOtpEnabled(!otpEnabled);
        // Update user cookie
        const updatedUser = { ...user, otpEnabled: !otpEnabled };
        Cookies.set("user", JSON.stringify(updatedUser), {
          expires: 7,
          path: "/",
        });
        toast.success(
          `OTP ${!otpEnabled ? "enabled" : "disabled"} successfully!`
        );
      }
    } catch (error) {
      console.error("OTP toggle error:", error);
      toast.error(error.response?.data?.message || "Failed to toggle OTP");
    } finally {
      setIsTogglingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate required fields
    if (!changePasswordData.currentPassword.trim()) {
      return toast.error("Please enter your current password");
    }

    if (!changePasswordData.newPassword.trim()) {
      return toast.error("Please enter your new password");
    }

    if (!changePasswordData.confirmPassword.trim()) {
      return toast.error("Please confirm your new password");
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    if (changePasswordData.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long");
    }

    setIsChangingPassword(true);
    try {
      const userToken = Cookies.get("session");
      const response = await axios.post(
        `${baseURL}/auth/change-password`,
        {
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword,
        },
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "Success") {
        toast.success("Password changed successfully!");
        setShowChangePassword(false);
        setChangePasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);

      // Handle specific error messages from backend
      const errorMessage = error.response?.data?.message;
      if (errorMessage === "Current password is incorrect") {
        toast.error("Current password is incorrect. Please try again.");
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to change password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const overallProgress = calculateOverallProgress();

  const getFormRoute = (taskId) => {
    const routes = {
      "personal-information": "/employee/personal-information",
      "professional-experience": "/employee/professional-experience",
      "work-experience": "/employee/work-experience",
      education: "/employee/education",
      references: "/employee/references",
      "legal-disclosures": "/employee/legal-disclosures",
      "job-description": "/employee/task-management",
      "orientation-presentation": "/employee/orientation-presentation",
      "w4-form": "/employee/w4-form",
      "w9-form": "/employee/w9-form",
      "i9-form": "/employee/i9-form",
      "emergency-contact": "/employee/emergency-contact",
      "direct-deposit": "/employee/direct-deposit",
      "misconduct-form": "/employee/misconduct-form",
      "code-of-ethics": "/employee/code-of-ethics",
      "service-delivery-policies": "/employee/service-delivery-policies",
      "non-compete-agreement": "/employee/non-compete-agreement",
      "background-check": "/employee/edit-background-form-check-results",
      "tb-symptom-screen": "/employee/edit-tb-symptom-screen-form",
      "orientation-checklist": "/employee/orientation-checklist",
    };
    return routes[taskId] || "/employee/task-management";
  };

  return (
    <Layout>
      <div className="w-full h-full bg-gray-50">
        <Navbar />

        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#1F3A93] mb-2">
              Employee Dashboard
            </h1>
            <p className="text-gray-600">Welcome back, {user?.userName}!</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 flex-1">
                <div className="relative">
                  <img
                    src={
                      user?.profileImage
                        ? `${baseURL}/${user.profileImage}`
                        : VecIcon
                    }
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    alt="Profile"
                    onError={(e) => {
                      console.log(
                        "Profile image failed to load:",
                        `${baseURL}/${user.profileImage}`
                      );
                      e.target.src = VecIcon;
                    }}
                  />
                  <span
                    className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                      user?.accountStatus === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user?.accountStatus}
                  </span>
                </div>

                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user?.userName}
                  </h2>
                  <button
                    onClick={openEditProfile}
                    className="inline-flex items-center gap-2 bg-[#1F3A93] text-white px-6 py-2 rounded-lg hover:bg-[#16307E] transition-colors"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Work Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase size={24} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Role
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {user?.userRole}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={24} className="text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Email
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2 break-all">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={24} className="text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="font-semibold text-gray-900 text-base mt-2">
                        {formatPhone(user?.phoneNumber)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OTP Verification Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Enhance your account security with OTP verification
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Shield size={20} className="text-blue-600" />
                OTP Verification Settings
              </h4>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Do you want OTP verification after every login for enhanced
                security?
              </p>
              <button
                onClick={handleToggleOTP}
                disabled={isTogglingOtp}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm ${
                  otpEnabled
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                <Shield size={16} />
                {isTogglingOtp
                  ? "Updating..."
                  : otpEnabled
                  ? "Disable OTP"
                  : "Enable OTP"}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {otpEnabled
                  ? "OTP is currently enabled. You'll receive a code via email on each login."
                  : "OTP is currently disabled. Enable for additional security."}
              </p>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h3>
                <p className="text-sm text-gray-600">
                  Update your account password for better security
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Shield size={20} className="text-green-600" />
                Password Security
              </h4>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Regularly changing your password helps keep your account secure.
              </p>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium text-sm"
              >
                <Shield size={16} />
                {showChangePassword ? "Cancel" : "Change Password"}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Click to securely update your password
              </p>
            </div>

            {showChangePassword && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
                <h4 className="text-base font-semibold text-gray-800 mb-3">
                  Update Password
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={changePasswordData.currentPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={changePasswordData.newPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={changePasswordData.confirmPassword}
                      onChange={(e) =>
                        setChangePasswordData({
                          ...changePasswordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowChangePassword(false);
                        setChangePasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HR Notes Section */}
          {hrNotes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
                      <span className="font-medium text-gray-900">HR Team</span>
                      <span className="text-xs text-gray-500">
                        {hrNotes.sentAt
                          ? new Date(hrNotes.sentAt).toLocaleDateString()
                          : "Recent"}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {hrNotes.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Application Progress - Full Width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Application Progress
                </h3>
                <p className="text-sm text-gray-600">
                  {overallProgress.completed}/{overallProgress.total} Tasks
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAllTasks(!showAllTasks)}
                  className="text-[#1F3A93] hover:text-[#16307E] text-sm font-medium"
                >
                  {showAllTasks ? "Show Less" : "View All"}
                </button>
                <div className="text-3xl font-bold text-[#1F3A93]">
                  {overallProgress.percentage}% Complete
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1F3A93] transition-all duration-500 rounded-full"
                  style={{ width: `${overallProgress.percentage}%` }}
                />
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {isLoadingProgress ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1F3A93] mr-2"></div>
                  <span className="text-gray-600">Loading tasks...</span>
                </div>
              ) : onboardingTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No onboarding tasks found
                </div>
              ) : (
                (showAllTasks
                  ? onboardingTasks
                  : onboardingTasks.slice(0, 6)
                ).map((task) => {
                  const isCompleted =
                    task.submissionStatus === "Submitted" ||
                    task.submissionStatus === "Under Review" ||
                    task.submissionStatus === "Approved";
                  const isInProgress = task.submissionStatus === "Draft";

                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Status Icon */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-green-500"
                              : isInProgress
                              ? "bg-yellow-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle size={18} className="text-white" />
                          ) : isInProgress ? (
                            <Clock size={18} className="text-white" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-white" />
                          )}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {task.name}
                          </h4>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(getFormRoute(task.id))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCompleted
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : isInProgress
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-[#1F3A93] text-white hover:bg-[#16307E]"
                        }`}
                      >
                        {isCompleted
                          ? "Edit"
                          : isInProgress
                          ? "Continue"
                          : "Start"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* View All Button */}
            {!showAllTasks && onboardingTasks.length > 6 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllTasks(true)}
                  className="px-6 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors text-sm font-medium"
                >
                  View All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={
                        profileImagePreview ||
                        (user?.profileImage
                          ? `${baseURL}/${user.profileImage}`
                          : VecIcon)
                      }
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      alt="Profile Preview"
                      onError={(e) => {
                        console.log(
                          "Modal profile image failed to load:",
                          profileImagePreview ||
                            `${baseURL}/${user.profileImage}`
                        );
                        e.target.src = VecIcon;
                      }}
                    />
                    <label className="absolute bottom-0 right-0 bg-[#1F3A93] text-white p-2 rounded-full cursor-pointer hover:bg-[#16307E] transition-colors">
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Click the upload icon to change your profile picture
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.userName}
                      onChange={(e) =>
                        handleProfileInputChange("userName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) =>
                        handleProfileInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={profileData.zip}
                      onChange={(e) =>
                        handleProfileInputChange("zip", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                      placeholder="Enter your ZIP code"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="px-6 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {task.taskStatus && task.taskInfo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Task Details
                </h3>
                <button
                  onClick={() => setTask({ taskStatus: false, taskInfo: null })}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    type="text"
                    value={task.taskInfo.taskTitle}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      type="text"
                      value={task.taskInfo.taskPriority}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline
                    </label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      type="text"
                      value={moment(task.taskInfo.deadLine).format(
                        "DD/MM/YYYY"
                      )}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={updateTaskStatus || task.taskInfo.taskStatus}
                      onChange={(e) => setUpdateTaskStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    rows={5}
                    value={task.taskInfo.taskDescription}
                    readOnly
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() =>
                      setTask({ taskStatus: false, taskInfo: null })
                    }
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleTaskStatusUpdate(task.taskInfo._id)}
                    disabled={!updateTaskStatus}
                    className="px-6 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
