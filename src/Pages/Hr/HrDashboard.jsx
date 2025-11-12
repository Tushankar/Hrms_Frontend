import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Overviewcards } from "../../Components/Admin/Overviewcards/Overviewcards";
import {
  UploadIcon,
  Calendar,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  TrendingUp,
  Activity,
  MessageCircle,
} from "lucide-react";
import { Avatar } from "@mui/material";
import axios from "axios";
import apiClient from "../../utils/axiosConfig";
import { updateTaskStatus } from "../../utils/taskUtils";

export const HrDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useNavigate();
  const baseURL = import.meta.env.VITE__BASEURL;
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationForms, setApplicationForms] = useState(null);
  const [selectedFormDetail, setSelectedFormDetail] = useState(null);
  const [showFormDetailModal, setShowFormDetailModal] = useState(false);
  const [finallyApprovedApps, setFinallyApprovedApps] = useState(new Set()); // Track locked applications

  // HR Notes to Employee state
  const [hrNoteToEmployee, setHrNoteToEmployee] = useState("");
  const [isSendingNote, setIsSendingNote] = useState(false);

  const getEmployeeInfo = async (token) => {
    try {
      // Fetch submitted onboarding applications from backend
      const response = await axios.get(
        `${baseURL}/onboarding/get-all-applications`,
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.applications) {
        // Transform applications into task format for the dashboard
        const transformedApplications = response.data.applications
          .filter((app) => app.applicationStatus === "submitted") // Only show submitted applications
          .map((app) => ({
            _id: app._id,
            employeeName: app.employeeId?.userName || "Unknown Employee",
            employeeEmail: app.employeeId?.email || "",
            employeePhone: app.employeeId?.phoneNumber || "",
            employeePosition: app.employeeId?.position || "",
            employeeId: app.employeeId?._id || app.employeeId, // Add the actual employee ObjectId
            taskTitle: "Onboarding Application Submitted",
            createdAt: app.submittedAt || app.createdAt,
            taskStatus: getApplicationStatus(app.applicationStatus),
            taskType: "Onboarding",
            applicationId: app._id,
            completionPercentage: app.completionPercentage || 0,
            reviewComments: app.reviewComments || "",
            reviewedBy: app.reviewedBy?.userName || "",
            reviewedAt: app.reviewedAt || null,
          }));

        setEmployeeInfo(transformedApplications);
      } else {
        console.log("No applications found");
        setEmployeeInfo([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Fallback to empty array if API fails
      setEmployeeInfo([]);
    }
  };

  // Helper function to map application status to task status
  const getApplicationStatus = (appStatus) => {
    switch (appStatus) {
      case "submitted":
        return "In Review";
      case "approved":
        return "Approved"; // Changed from 'Complete' to 'Approved'
      case "rejected":
        return "Rejected"; // Changed from 'Reject' to 'Rejected'
      default:
        return "Pending";
    }
  };

  // Helper function to check if an application is finally approved (locked)
  const checkIfFinallyApproved = async (employeeId) => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.data) {
        const formsData = response.data.data.forms;
        // Check if any form has "approved" status (indicates final approval)
        const hasFinallyApprovedForms = Object.values(formsData).some(
          (form) => form && form.status === "approved"
        );
        return hasFinallyApprovedForms;
      }
      return false;
    } catch (error) {
      console.error("Error checking final approval status:", error);
      return false;
    }
  };

  // Function to fetch detailed application data
  const fetchApplicationDetails = async (applicationId, employeeId) => {
    try {
      console.log(
        "Fetching details for application:",
        applicationId,
        "employee:",
        employeeId
      );

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.data) {
        const formsData = response.data.data.forms;
        setApplicationForms(formsData);

        // Check if this application is finally approved (has forms with "approved" status)
        const hasFinallyApprovedForms = Object.values(formsData).some(
          (form) => form && form.status === "approved"
        );

        // Update the finally approved applications set
        if (hasFinallyApprovedForms) {
          setFinallyApprovedApps((prev) => new Set([...prev, applicationId]));
        } else {
          setFinallyApprovedApps((prev) => {
            const newSet = new Set([...prev]);
            newSet.delete(applicationId);
            return newSet;
          });
        }

        return formsData;
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast.error("Failed to load application details");
      return null;
    }
  };

  // Handle view application details
  const handleViewApplication = async (application) => {
    setSelectedApplication(application);
    // Fetch application forms data
    const formsData = await fetchApplicationDetails(
      application.applicationId,
      application.employeeId
    );
    if (formsData) {
      setShowDetailModal(true);
    }
  };

  // Handle view specific form details - Navigate to actual form pages
  const handleViewFormDetail = (formKey, formName) => {
    if (!selectedApplication || !selectedApplication.employeeId) {
      toast.error("No application selected");
      return;
    }

    const employeeId = selectedApplication.employeeId;
    const applicationId = selectedApplication.applicationId;

    console.log("🔗 Navigating to form:", formKey);
    console.log("👤 EmployeeId:", employeeId);
    console.log("📋 ApplicationId:", applicationId);

    // Navigate to form routes based on formKey - using employeeId as userId parameter
    switch (formKey) {
      case "w4Form":
        router(`/hr/w4-form/${employeeId}`);
        break;
      case "w9Form":
        router(`/hr/w9-form/${employeeId}`);
        break;
      case "i9Form":
        router(`/hr/i9-form/${employeeId}`);
        break;
      case "emergencyContact":
        router(`/hr/emergency-contact/${employeeId}`);
        break;
      case "directDeposit":
        router(`/hr/direct-deposit-form/${employeeId}`);
        break;
      case "misconductStatement":
        router(`/hr/staff-misconduct-statement/${employeeId}`);
        break;
      case "codeOfEthics":
        router(`/hr/code-of-ethics/${employeeId}`);
        break;
      case "serviceDeliveryPolicies":
        router(`/hr/service-delivery-policies/${employeeId}`);
        break;
      case "nonCompeteAgreement":
        router(`/hr/non-compete-agreement/${employeeId}`);
        break;
      case "backgroundCheck":
        router(`/hr/background-check-form/${employeeId}`);
        break;
      case "tbSymptomScreen":
        router(`/hr/tb-symptom-screen/${employeeId}`);
        break;
      case "orientationChecklist":
        router(`/hr/orientation-checklist/${employeeId}`);
        break;
      case "orientationPresentation":
        router(`/hr/orientation-presentation/${employeeId}`);
        break;
      case "jobDescriptionPCA":
        router(`/hr/job-description/pca/${employeeId}`);
        break;

      case "pcaTrainingQuestions":
        router(`/hr/pca-training-questions/${employeeId}`);
        break;
      case "personalInformation":
        router(`/hr/personal-information/${employeeId}`);
        break;
      case "professionalExperience":
        router(`/hr/professional-experience/${employeeId}`);
        break;
      case "education":
        router(`/hr/education/${employeeId}`);
        break;
      case "references":
        router(`/hr/references/${employeeId}`);
        break;
      case "legalDisclosures":
        router(`/hr/legal-disclosures/${employeeId}`);
        break;
      case "workExperience":
        router(`/hr/work-experience/${employeeId}`);
        break;
      case "drivingLicense":
        router(`/hr/driving-license/${employeeId}`);
        break;
      case "employeeDetailsUpload":
        router(`/hr/employee-details-upload/${employeeId}`);
        break;
      default:
        toast.error(`Form viewer not available for ${formName}`);
        console.log("Available forms:", Object.keys(applicationForms || {}));
    }
  };

  // Function to render form data in a readable format
  const renderFormData = (data) => {
    if (!data) return <p className="text-gray-500">No data available</p>;

    const excludeKeys = [
      "_id",
      "__v",
      "applicationId",
      "employeeId",
      "createdAt",
      "updatedAt",
    ];

    // Special handling for different form types
    const formatFieldName = (key) => {
      const specialNames = {
        // W4 Form specific fields
        firstName: "First Name",
        lastName: "Last Name",
        middleInitial: "Middle Initial",
        socialSecurityNumber: "Social Security Number",
        filingStatus: "Filing Status",
        multipleJobsOption: "Multiple Jobs Option",
        qualifyingChildren: "Qualifying Children Amount",
        otherDependents: "Other Dependents Amount",
        totalCredits: "Total Credits",
        otherIncome: "Other Income",
        extraWithholding: "Extra Withholding",
        employeeSignature: "Employee Signature",
        signatureDate: "Signature Date",
        employerName: "Employer Name",
        employerAddress: "Employer Address",
        firstDateOfEmployment: "First Date of Employment",
        employerEIN: "Employer EIN",

        // I9 Form specific fields
        citizenshipStatus: "Citizenship Status",
        uscisNumber: "USCIS Number",
        formI94Number: "Form I-94 Number",
        foreignPassportNumber: "Foreign Passport Number",
        countryOfIssuance: "Country of Issuance",
        expirationDate: "Expiration Date",
        employmentStartDate: "Employment Start Date",
        documentTitle1: "Document Title 1",
        issuingAuthority1: "Issuing Authority 1",
        documentNumber1: "Document Number 1",
        expirationDate1: "Expiration Date 1",

        // Emergency Contact specific fields
        contactName: "Contact Name",
        relationship: "Relationship",
        phoneNumber: "Phone Number",
        alternatePhone: "Alternate Phone",
        emailAddress: "Email Address",

        // Direct Deposit specific fields
        bankName: "Bank Name",
        routingNumber: "Routing Number",
        accountNumber: "Account Number",
        accountType: "Account Type",

        // Job Description specific fields
        jobDescriptionType: "Job Description Type",
        positionTitle: "Position Title",
        departmentUnit: "Department/Unit",
        reportsTo: "Reports To",
        staffSignature: "Staff Signature",
        staffSignatureDate: "Staff Signature Date",
        supervisorSignature: "Supervisor Signature",
        supervisorSignatureDate: "Supervisor Signature Date",
      };

      return (
        specialNames[key] ||
        key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
      );
    };

    const formatValue = (value, key) => {
      if (value === "" || value === null || value === undefined) {
        return "Not provided";
      }

      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }

      if (typeof value === "object" && value !== null) {
        if (
          value instanceof Date ||
          (typeof value === "string" && !isNaN(Date.parse(value)))
        ) {
          return new Date(value).toLocaleDateString();
        }

        // Handle nested objects (like Employment Application sections)
        if (Array.isArray(value)) {
          return value.length > 0
            ? JSON.stringify(value, null, 2)
            : "No entries";
        }

        return JSON.stringify(value, null, 2);
      }

      return value.toString();
    };

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => {
          if (excludeKeys.includes(key)) return null;

          const displayValue = formatValue(value, key);
          const fieldName = formatFieldName(key);

          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row border-b border-gray-100 pb-2"
            >
              <div className="sm:w-1/3 font-medium text-gray-700 mb-1 sm:mb-0">
                {fieldName}:
              </div>
              <div className="sm:w-2/3 text-gray-900 break-words">
                {typeof value === "object" &&
                value !== null &&
                !Array.isArray(value) &&
                !(value instanceof Date) ? (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {displayValue}
                    </pre>
                  </div>
                ) : (
                  <span>{displayValue}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Handle sending HR notes to employee
  const handleSendHrNoteToEmployee = async (applicationId) => {
    if (!hrNoteToEmployee.trim()) {
      toast.error("Please enter a note before sending");
      return;
    }

    try {
      setIsSendingNote(true);

      const response = await apiClient.post(
        "/onboarding/save-hr-notes-to-employee",
        {
          applicationId,
          note: hrNoteToEmployee.trim(),
          hrUserId: "HR", // You can get this from user context if available
        }
      );

      if (response.data.success) {
        toast.success("HR note sent to employee successfully!", {
          style: {
            background: "#10B981",
            color: "white",
            fontWeight: "bold",
            borderRadius: "12px",
            padding: "16px 24px",
            fontSize: "14px",
          },
          duration: 4000,
          icon: "📝",
        });

        // Clear the note input
        setHrNoteToEmployee("");

        // Note: No need to refresh applications list as HR notes don't change application status
        // The notes are just stored for employee communication and don't affect progress
      }
    } catch (error) {
      console.error("Error sending HR note:", error);
      toast.error("Failed to send HR note. Please try again.", {
        style: {
          background: "#EF4444",
          color: "white",
          fontWeight: "bold",
          borderRadius: "12px",
          padding: "16px 24px",
          fontSize: "14px",
        },
        duration: 5000,
      });
    } finally {
      setIsSendingNote(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const session = Cookies.get("session");
    if (!session) {
      setIsLoading(false);
      toast.error("Session not found. Please log-in");
      router("/auth/log-in");
      return;
    }

    getEmployeeInfo(session).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const onboardingTasks =
    employeeInfo?.filter((task) => task.taskType === "Onboarding") || [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = onboardingTasks.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(onboardingTasks.length / itemsPerPage);

  const handleTaskStatusUpdate = async (
    taskId,
    status,
    approvalType = "regular"
  ) => {
    try {
      // Find the task data (which is actually an application)
      const taskData = employeeInfo.find((task) => task._id === taskId);

      if (!taskData) {
        toast.error("Application not found");
        return;
      }

      // Map status to application status
      const applicationStatus =
        status === "Complete"
          ? "approved"
          : status === "Reject"
          ? "rejected"
          : status.toLowerCase();

      // Use different endpoints based on approval type
      let response;
      if (approvalType === "final" && applicationStatus === "approved") {
        // Final approval - goes directly to Kanban complete
        response = await apiClient.put(
          `/onboarding/final-approve/${taskData.applicationId}`,
          {
            reviewComments: `Application finally approved by HR - all onboarding complete`,
          }
        );
      } else {
        // Regular approval - goes to Kanban todo
        response = await apiClient.put(
          `/onboarding/update-status/${taskData.applicationId}`,
          {
            status: applicationStatus,
            reviewComments: `Application ${applicationStatus} by HR`,
          }
        );
      }

      if (response.data && response.data.application) {
        if (status === "Complete") {
          // Create task in backend when approving
          try {
            const createTaskResponse = await apiClient.post(
              "/hr/kanban/create-onboarding-task",
              {
                employeeName: taskData.employeeName,
                employeeId: taskData.employeeId,
                employeeEmail: taskData.employeeEmail,
                employeePosition: taskData.employeePosition || "New Employee",
                applicationId: taskData.applicationId,
                taskTitle: `Complete Onboarding Process for ${taskData.employeeName}`,
                priority: "High",
                description: `Complete all onboarding requirements for ${taskData.employeeName}. Review all submitted forms and finalize employee setup.`,
                assignedByID: "67839baa15e3dce22e59cef8", // Replace with actual HR user ID from auth
                deadLine: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                withCredentials: true,
              }
            );
            if (createTaskResponse.data.success) {
              console.log(
                "✅ Backend task created:",
                createTaskResponse.data.task
              );

              if (approvalType === "final") {
                // Update task status to Complete for final approval
                await apiClient.put(
                  `/hr/kanban/update-task-status/${createTaskResponse.data.task.taskId}`,
                  {
                    status: "Complete",
                    reviewComments: `Application finally approved by HR - all onboarding complete`,
                  }
                );
              }
            } else {
              console.log(
                "ℹ️ Task creation info:",
                createTaskResponse.data.message
              );
            }
          } catch (taskError) {
            console.error("Error creating backend task:", taskError);
            // Don't fail the approval if task creation fails
          }

          // Remove localStorage code - we now use backend
          // const newKanbanTask = { ... }; // REMOVED
          // const existingKanbanTasks = JSON.parse(localStorage.getItem("kanbanTasks") || "[]"); // REMOVED
          // localStorage.setItem("kanbanTasks", JSON.stringify(updatedKanbanTasks)); // REMOVED

          // Trigger a custom event to notify task management component to refresh from backend
          window.dispatchEvent(
            new CustomEvent("kanbanTasksUpdated", {
              detail: {
                action: "taskCreated",
                approvalType: approvalType,
                taskData: taskData,
              },
            })
          );

          if (approvalType === "final") {
            toast.success(
              `✅ Application FINALLY APPROVED! ${taskData.employeeName} onboarding is complete and locked`,
              {
                style: {
                  background: "#059669",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  fontSize: "16px",
                },
                duration: 8000,
                icon: "🎉",
              }
            );
          } else {
            toast.success(
              `✅ Application approved! ${taskData.employeeName} has been added to onboarding tasks`,
              {
                style: {
                  background: "#10B981",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  fontSize: "16px",
                },
                duration: 6000,
                icon: "🎉",
              }
            );
          }
        } else if (status === "Reject") {
          toast.success(
            `❌ Application rejected for "${taskData.employeeName}"`,
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
              icon: "⚠️",
            }
          );
        }

        // Refresh the applications list to reflect the updated status
        const session = Cookies.get("session");
        if (session) {
          await getEmployeeInfo(session);
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error);

      // Handle specific lock errors from backend
      if (error.response && error.response.status === 403) {
        const errorData = error.response.data;
        if (
          errorData.error === "APPLICATION_LOCKED" ||
          errorData.error === "ALREADY_FINALLY_APPROVED"
        ) {
          toast.error(`🔒 ${errorData.message}`, {
            style: {
              background: "#DC2626",
              color: "white",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "16px 24px",
              fontSize: "16px",
            },
            duration: 8000,
            icon: "🔒",
          });

          // Refresh the applications list to show current status
          const session = Cookies.get("session");
          if (session) {
            await getEmployeeInfo(session);
          }
          return;
        }
      }

      // Generic error handling
      toast.error("Failed to update application status. Please try again.", {
        style: {
          background: "#EF4444",
          color: "white",
          fontWeight: "bold",
          borderRadius: "12px",
          padding: "16px 24px",
        },
        duration: 5000,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Review":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Complete":
        return "bg-green-100 text-green-700 border-green-200";
      case "Approved": // New status for approved applications
        return "bg-green-100 text-green-700 border-green-200";
      case "Reject":
        return "bg-red-100 text-red-700 border-red-200";
      case "Rejected": // New status for rejected applications
        return "bg-red-100 text-red-700 border-red-200";
      case "Pending":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Mobile Card Component for Tasks
  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar sx={{ width: 40, height: 40 }}>
            {task.employeeName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <h4 className="font-semibold text-gray-900">{task.employeeName}</h4>
            <p className="text-xs text-gray-500">{task.employeeEmail}</p>
            <p className="text-sm text-gray-500">
              Submitted: {new Date(task.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {finallyApprovedApps.has(task.applicationId) && (
            <div className="bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              🔒 LOCKED
            </div>
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              task.taskStatus
            )}`}
          >
            {task.taskStatus}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-2">{task.taskTitle}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>📋 Completion: {task.completionPercentage}%</span>
          {task.employeePosition && (
            <span>👤 Position: {task.employeePosition}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleViewApplication(task)}
          className="flex-1 bg-[#1F3A93] text-white text-sm px-3 py-2 rounded-lg hover:bg-[#16307E] transition-colors flex items-center justify-center gap-1"
        >
          <Eye size={16} />
          View Details
        </button>
        {task.taskStatus === "In Review" &&
          !finallyApprovedApps.has(task.applicationId) && (
            <>
              <button
                onClick={() => handleTaskStatusUpdate(task._id, "Complete")}
                className="flex-1 bg-green-500 text-white text-sm px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle size={16} />
                Approve
              </button>
              <button
                onClick={() => handleTaskStatusUpdate(task._id, "Reject")}
                className="flex-1 bg-red-500 text-white text-sm px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
              >
                <XCircle size={16} />
                Reject
              </button>
            </>
          )}
        {finallyApprovedApps.has(task.applicationId) && (
          <div className="flex-1 text-center text-sm bg-emerald-50 border border-emerald-200 rounded-lg py-2 font-bold text-emerald-700">
            🔒 FINALLY APPROVED & LOCKED
          </div>
        )}
        {task.taskStatus === "Approved" &&
          !finallyApprovedApps.has(task.applicationId) && (
            <div className="flex-1 text-center text-sm text-green-600 font-semibold py-2">
              ✅ Application Approved
            </div>
          )}
        {task.taskStatus === "Rejected" && (
          <div className="flex-1 text-center text-sm text-red-600 font-semibold py-2">
            ❌ Application Rejected
          </div>
        )}
      </div>

      {/* Show review details if reviewed */}
      {task.reviewedAt && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <p>
            Reviewed: {new Date(task.reviewedAt).toLocaleDateString("en-GB")}
          </p>
          {task.reviewedBy && <p>By: {task.reviewedBy}</p>}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="w-full h-screen flex flex-col overflow-x-hidden">
        <Navbar />
        <div className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden">
          <div className="p-4 lg:p-6 max-w-full">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-[#1F3A93] mb-2">
                    HR Dashboard
                  </h1>
                  <p className="text-gray-600">
                    Welcome back! Here's your overview for today.
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="mb-6 w-full overflow-x-hidden">
              {/* Custom Application Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Applications */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">
                        Total Applications
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {employeeInfo?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending Review */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {employeeInfo?.filter(
                          (task) => task.taskStatus === "In Review"
                        ).length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Approved */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {employeeInfo?.filter(
                          (task) => task.taskStatus === "Approved"
                        ).length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejected */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {employeeInfo?.filter(
                          (task) => task.taskStatus === "Rejected"
                        ).length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col gap-6 w-full">
              {/* Top Section - Onboarding Table */}
              <div className="w-full">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden">
                  {/* Table Header */}
                  <div className="p-4 lg:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                        Onboarding Candidates
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFilterStatus("all")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === "all"
                              ? "bg-[#1F3A93] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilterStatus("active")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === "active"
                              ? "bg-[#1F3A93] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Active
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block w-full overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Task
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Documents
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
                                <p className="text-gray-500">
                                  Loading onboarding applications...
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : currentTasks?.length > 0 ? (
                          currentTasks.map((task, index) => (
                            <tr
                              key={task._id || index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar sx={{ width: 40, height: 40 }}>
                                    {task.employeeName.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {task.employeeName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {task.employeeEmail}
                                    </div>
                                    {task.employeePosition && (
                                      <div className="text-xs text-gray-400">
                                        {task.employeePosition}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs">
                                  {task.taskTitle}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Completion: {task.completionPercentage}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">
                                  Submitted:{" "}
                                  {new Date(task.createdAt).toLocaleDateString(
                                    "en-GB"
                                  )}
                                </div>
                                {task.reviewedAt && (
                                  <div className="text-xs text-gray-500">
                                    Reviewed:{" "}
                                    {new Date(
                                      task.reviewedAt
                                    ).toLocaleDateString("en-GB")}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleViewApplication(task)}
                                  className="inline-flex items-center gap-1 bg-[#1F3A93] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#16307E] transition-colors"
                                >
                                  <Eye size={16} />
                                  View Details
                                </button>
                              </td>
                              <td className="px-3 py-4">
                                <div className="flex justify-center gap-2">
                                  {task.taskStatus === "In Review" &&
                                  !finallyApprovedApps.has(
                                    task.applicationId
                                  ) ? (
                                    <>
                                      <button
                                        className="bg-green-500 hover:bg-green-600 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                                        onClick={() =>
                                          handleTaskStatusUpdate(
                                            task._id,
                                            "Complete"
                                          )
                                        }
                                      >
                                        <CheckCircle size={16} />
                                        Accept
                                      </button>
                                      <button
                                        className="bg-red-500 hover:bg-red-600 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                                        onClick={() =>
                                          handleTaskStatusUpdate(
                                            task._id,
                                            "Reject"
                                          )
                                        }
                                      >
                                        <XCircle size={16} />
                                        Reject
                                      </button>
                                    </>
                                  ) : finallyApprovedApps.has(
                                      task.applicationId
                                    ) ? (
                                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                                      🔒 LOCKED
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-500 italic">
                                      {task.taskStatus === "Approved"
                                        ? "✅ Approved"
                                        : task.taskStatus === "Rejected"
                                        ? "❌ Rejected"
                                        : "No actions"}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {finallyApprovedApps.has(
                                    task.applicationId
                                  ) && (
                                    <span className="bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                      🔒
                                    </span>
                                  )}
                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                      task.taskStatus
                                    )}`}
                                  >
                                    {task.taskStatus}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <FileText className="w-12 h-12 text-gray-300" />
                                <p className="text-gray-500">
                                  No submitted applications found
                                </p>
                                <p className="text-sm text-gray-400">
                                  Applications will appear here after employees
                                  submit them
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden p-4">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-3 py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
                        <p className="text-gray-500">Loading applications...</p>
                      </div>
                    ) : currentTasks?.length > 0 ? (
                      currentTasks.map((task, index) => (
                        <TaskCard key={task._id || index} task={task} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">
                          No submitted applications found
                        </p>
                        <p className="text-sm text-gray-400">
                          Applications will appear here after employees submit
                          them
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                          className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>

                        <div className="hidden sm:flex items-center gap-2">
                          {[...Array(totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i + 1)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === i + 1
                                  ? "bg-[#1F3A93] text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <span className="sm:hidden text-sm text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>

                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section - Calendar & Activities Side by Side */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar Section - 1/3 width */}
                <div className="w-full lg:w-1/3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full h-[400px]">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar size={18} />
                          Calendar
                        </h3>
                        <button
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                          {showCalendar ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <div
                      className={`${
                        showCalendar ? "block" : "hidden lg:block"
                      } w-full h-[calc(100%-73px)] overflow-hidden`}
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar
                          sx={{
                            width: "100%",
                            maxWidth: "100%",
                            height: "100%",
                            maxHeight: "100%",
                            overflow: "hidden",
                            fontFamily: "'Inter', -apple-system, sans-serif",
                            ".MuiPickersCalendarHeader-root": {
                              paddingLeft: "16px",
                              paddingRight: "16px",
                              marginBottom: "12px",
                              "& .MuiPickersArrowSwitcher-root": {
                                "& .MuiIconButton-root": {
                                  backgroundColor: "#f8fafc !important",
                                  border: "1px solid #e2e8f0 !important",
                                  borderRadius: "8px !important",
                                  width: "36px",
                                  height: "36px",
                                  color: "#374151 !important",
                                  "&:hover": {
                                    backgroundColor: "#e5e7eb !important",
                                    color: "#1f2937 !important",
                                  },
                                },
                              },
                            },
                            ".MuiDayCalendar-root": {
                              height: "100%",
                              maxHeight: "100%",
                              overflow: "hidden",
                            },
                            ".MuiDayCalendar-weekContainer": {
                              overflow: "hidden",
                            },
                            ".MuiDayCalendar-slideTransition": {
                              overflow: "hidden",
                            },
                            ".MuiPickersSlideTransition-root": {
                              overflow: "hidden",
                            },
                            ".MuiPickersDay-root": {
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              width: "36px",
                              height: "36px",
                              margin: "2px",
                              borderRadius: "8px",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: "#e5e7eb !important",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#3b82f6 !important",
                                color: "#fff !important",
                                fontWeight: "600",
                                "&:hover": {
                                  backgroundColor: "#2563eb !important",
                                },
                              },
                              "&.MuiPickersDay-today": {
                                backgroundColor: "#1f2937 !important",
                                color: "#fff !important",
                                fontWeight: "600",
                                border: "none",
                                "&:not(.Mui-selected)": {
                                  backgroundColor: "#1f2937 !important",
                                  "&:hover": {
                                    backgroundColor: "#374151 !important",
                                  },
                                },
                              },
                            },
                            ".MuiTypography-root": {
                              fontSize: "0.875rem",
                              fontWeight: "500",
                            },
                            ".MuiPickersCalendarHeader-label": {
                              fontSize: "1.125rem",
                              fontWeight: "700",
                              color: "#1f2937",
                            },
                            ".MuiDayCalendar-weekDayLabel": {
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              width: "36px",
                              height: "36px",
                              color: "#6b7280",
                              textTransform: "uppercase",
                              letterSpacing: "0.025em",
                            },
                            ".MuiPickersCalendarHeader-switchViewButton": {
                              backgroundColor: "#f8fafc !important",
                              border: "1px solid #e2e8f0 !important",
                              borderRadius: "8px !important",
                              color: "#374151 !important",
                              "&:hover": {
                                backgroundColor: "#e5e7eb !important",
                                color: "#1f2937 !important",
                              },
                            },
                            "& .MuiPickersArrowSwitcher-button": {
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              "&:hover": {
                                backgroundColor: "#e5e7eb",
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </div>
                  </div>
                </div>

                {/* Recent Activities Section - 2/3 width */}
                <div className="w-full lg:w-2/3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden h-[400px]">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity size={20} />
                        Recent Activities
                      </h3>
                    </div>
                    <div className="p-4 h-[calc(100%-73px)] overflow-y-auto">
                      {employeeInfo
                        ?.filter((task) => task.taskType === "Onboarding")
                        .slice(0, 5)
                        .map((task, index) => {
                          const date = new Date(task.createdAt);
                          const day = date.getDate();
                          const month = date.toLocaleString("default", {
                            month: "short",
                          });
                          const time = date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <div
                              key={task._id || index}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer mb-2"
                            >
                              <div className="bg-[#1F3A93] text-white rounded-lg p-2 flex flex-col items-center justify-center min-w-[48px] h-12">
                                <span className="text-sm font-bold">{day}</span>
                                <span className="text-xs -mt-1">{month}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {task.taskTitle}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Onboarding
                                </p>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} />
                                {time}
                              </div>
                            </div>
                          );
                        })}
                      {(!employeeInfo ||
                        employeeInfo.filter(
                          (task) => task.taskType === "Onboarding"
                        ).length === 0) && (
                        <p className="text-center text-gray-500 py-8">
                          No recent activities
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Application View Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar sx={{ width: 50, height: 50 }}>
                    {selectedApplication.employeeName.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedApplication.employeeName}'s Application
                    </h2>
                    <p className="text-gray-600">
                      {selectedApplication.employeeEmail}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted:{" "}
                      {new Date(
                        selectedApplication.createdAt
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {applicationForms ? (
                <div className="space-y-6">
                  {/* Forms Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">20</div>
                      <div className="text-sm text-blue-800">
                        Forms Submitted
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedApplication.completionPercentage}%
                      </div>
                      <div className="text-sm text-green-800">
                        Completion Rate
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        20
                      </div>
                      <div className="text-sm text-purple-800">Total Forms</div>
                    </div>
                  </div>

                  {/* Forms List */}
                  <div className="space-y-6">
                    {/* PART 1 - Employment Application */}
                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-md">
                      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                        📋 PART 1 - Employment Application
                      </h3>

                      {/* Employment Application Section */}
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 border-b-2 border-blue-300 pb-2">
                          Employment Application Forms (6 Forms)
                        </h4>

                        {/* 1. Applicant Information */}
                        <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                1. Applicant Information
                              </h5>
                              <p className="text-sm text-gray-600">
                                Applicant personal details and contact
                                information
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewFormDetail(
                                  "personalInformation",
                                  "Applicant Information"
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* 2. Education */}
                        <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">2. Education</h5>
                              <p className="text-sm text-gray-600">
                                Educational background and qualifications
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewFormDetail("education", "Education")
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* 3. References */}
                        <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">3. References</h5>
                              <p className="text-sm text-gray-600">
                                Professional references
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewFormDetail("references", "References")
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* 4. Previous Employment */}
                        <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                4. Previous Employment
                              </h5>
                              <p className="text-sm text-gray-600">
                                Previous work history and employment experience
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewFormDetail(
                                  "workExperience",
                                  "Previous Employment"
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* 5. Military Service */}
                        <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                5. Military Service
                              </h5>
                              <p className="text-sm text-gray-600">
                                Military service and professional background
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewFormDetail(
                                  "professionalExperience",
                                  "Military Service"
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* 6. Disclaimer and Signature */}
                        <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">
                                6. Disclaimer and Signature
                              </h5>
                              <p className="text-sm text-gray-600">
                                Legal disclosures and acknowledgments with
                                signature
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleViewFormDetail(
                                  "legalDisclosures",
                                  "Disclaimer and Signature"
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* PART 2 - Documents to Submit */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-md">
                        <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                          📄 PART 2 - Documents to Submit
                        </h3>

                        {/* Documents to Submit Section */}
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-gray-800 mb-3 border-b-2 border-green-300 pb-2">
                            Documents to Submit (15 Forms)
                          </h4>

                          {/* 1. Job Description */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  1. Job Description
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Position-specific job description
                                  (PCA/CNA/LPN/RN)
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "jobDescriptionPCA",
                                    "Job Description"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 2. Code of Ethics Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  2. Code of Ethics Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Company ethical standards acknowledgment
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "codeOfEthics",
                                    "Code of Ethics Form"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 3. Service Delivery Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  3. Service Delivery Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Service delivery standards acknowledgment
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "serviceDeliveryPolicies",
                                    "Service Delivery Form"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 4. Non-Compete Agreement */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  4. Non-Compete Agreement
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Non-compete and confidentiality agreement
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "nonCompeteAgreement",
                                    "Non-Compete Agreement"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 5. Emergency Contact Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  5. Emergency Contact Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Emergency contact information
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "emergencyContact",
                                    "Emergency Contact Form"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 6. Professional Certificate(s) */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  6. Professional Certificate(s)
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Professional certifications and licenses
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "employeeDetailsUpload",
                                    "Professional Certificate(s)"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 7. CPR/First Aid Certificate */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  7. CPR/First Aid Certificate
                                </h5>
                                <p className="text-sm text-gray-600">
                                  CPR and First Aid certification
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  // Check if CPR certificate exists
                                  const bgCheck =
                                    applicationForms?.backgroundCheck;
                                  if (bgCheck?.cprFirstAidCertificate) {
                                    // Show modal with certificate details
                                    setSelectedFormDetail({
                                      type: "cprCertificate",
                                      data: bgCheck.cprFirstAidCertificate,
                                      fullData: bgCheck,
                                      name: "CPR/First Aid Certificate",
                                    });
                                    setShowFormDetailModal(true);
                                  } else {
                                    toast.info(
                                      "No CPR/First Aid certificate uploaded yet"
                                    );
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Certificate
                              </button>
                            </div>
                          </div>

                          {/* 8. Government ID */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  8. Government ID
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Government-issued ID documentation
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "drivingLicense",
                                    "Government ID"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 9. Background Check Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  9. Background Check Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Background verification authorization
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "backgroundCheck",
                                    "Background Check Form"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 10. Staff Misconduct Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  10. Staff Misconduct Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Staff misconduct disclosure form
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "misconductStatement",
                                    "Staff Misconduct Form"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 11. TB or X-Ray Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  11. TB or X-Ray Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Tuberculosis screening questionnaire
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "tbSymptomScreen",
                                    "TB or X-Ray Form"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 12. I-9 Employment Eligibility */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  12. I-9 Employment Eligibility
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Employment Eligibility Verification
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "i9Form",
                                    "I-9 Employment Eligibility"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 13. W-4 Tax Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  13. W-4 Tax Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Employee's Withholding Certificate
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail("w4Form", "W-4 Tax Form")
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 14. W-9 Tax Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  14. W-9 Tax Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Taxpayer Identification Number and
                                  Certification
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail("w9Form", "W-9 Tax Form")
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 15. Direct Deposit Form */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  15. Direct Deposit Form
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Banking information for payroll
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "directDeposit",
                                    "Direct Deposit Form"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PART 3 - Orientation Documentation */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 shadow-md">
                        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                          🎓 PART 3 - Orientation Documentation
                        </h3>

                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-gray-800 mb-3 border-b-2 border-purple-300 pb-2">
                            Orientation Documentation (2 Forms)
                          </h4>

                          {/* 21. Orientation Presentation */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  21. Orientation PowerPoint Presentation
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Company orientation video and materials
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "orientationPresentation",
                                    "Orientation Presentation"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>

                          {/* 22. Orientation Checklist */}
                          <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">
                                  22. Orientation Checklist
                                </h5>
                                <p className="text-sm text-gray-600">
                                  Employee orientation requirements
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleViewFormDetail(
                                    "orientationChecklist",
                                    "Orientation Checklist"
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PART 4 - After Hire */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-300 shadow-md">
                        <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                          🎯 PART 4 - After Hire
                        </h3>

                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-gray-800 mb-3 border-b-2 border-orange-300 pb-2">
                            After Hire Forms
                          </h4>

                          {/* PCA Training Questions - Only show if position is PCA */}
                          {applicationForms?.positionType
                            ?.positionAppliedFor === "PCA" && (
                            <div className="p-4 mb-3 rounded-lg border border-gray-200 bg-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium">
                                    PCA Training Examinations
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Personal Care Assistant training assessment
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleViewFormDetail(
                                      "pcaTrainingQuestions",
                                      "PCA Training Questions"
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HR Notes to Employee Section */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300 shadow-md">
                    <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                      📝 HR Notes to Employee
                    </h3>
                    <p className="text-sm text-yellow-800 mb-4">
                      Send a summary note to the employee that will be visible
                      in their dashboard overview.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note Content
                        </label>
                        <textarea
                          value={hrNoteToEmployee}
                          onChange={(e) => setHrNoteToEmployee(e.target.value)}
                          placeholder="Enter your note to the employee here..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-vertical"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            handleSendHrNoteToEmployee(
                              selectedApplication.applicationId
                            )
                          }
                          disabled={!hrNoteToEmployee.trim() || isSendingNote}
                          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                        >
                          {isSendingNote ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <MessageCircle size={16} />
                              Send Note to Employee
                            </>
                          )}
                        </button>
                      </div>

                      {/* Show existing HR note if any */}
                      {selectedApplication.hrNotesToEmployee && (
                        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-yellow-900">
                              Previous Note Sent:
                            </h4>
                            <span className="text-xs text-yellow-700">
                              {new Date(
                                selectedApplication.hrNotesToEmployee.sentAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-yellow-800 whitespace-pre-line">
                            {selectedApplication.hrNotesToEmployee.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedApplication.taskStatus === "In Review" &&
                    !finallyApprovedApps.has(
                      selectedApplication.applicationId
                    ) && (
                      <div className="flex gap-4 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => {
                            handleTaskStatusUpdate(
                              selectedApplication._id,
                              "Complete",
                              "final"
                            );
                            setShowDetailModal(false);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg border-2 border-green-500"
                        >
                          <CheckCircle size={20} />
                          ACCEPT APPLICATION (Final)
                        </button>
                        <button
                          onClick={() => {
                            handleTaskStatusUpdate(
                              selectedApplication._id,
                              "Reject"
                            );
                            setShowDetailModal(false);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={20} />
                          Reject Application
                        </button>
                      </div>
                    )}

                  {/* Show LOCKED status for finally approved applications */}
                  {finallyApprovedApps.has(
                    selectedApplication.applicationId
                  ) && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <CheckCircle size={28} className="text-emerald-600" />
                          <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            🔒 LOCKED
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-emerald-800 mb-2">
                          APPLICATION FINALLY APPROVED
                        </h3>
                        <p className="text-emerald-700 font-medium mb-2">
                          ✅ This application has been FINALLY APPROVED and is
                          permanently locked.
                        </p>
                        <p className="text-emerald-600 text-sm mb-3">
                          🚫 No further modifications can be made to this
                          application or its forms.
                        </p>
                        <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-center gap-2 text-emerald-700">
                            <Activity size={16} />
                            <span className="font-semibold">
                              Onboarding Complete - Task Management Updated
                            </span>
                          </div>
                        </div>
                        {selectedApplication.reviewedAt && (
                          <p className="text-sm text-emerald-600 mt-3 font-medium">
                            🎉 Finally Approved on:{" "}
                            {new Date(
                              selectedApplication.reviewedAt
                            ).toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show status for approved/rejected applications (regular approval) */}
                  {selectedApplication.taskStatus === "Approved" &&
                    !finallyApprovedApps.has(
                      selectedApplication.applicationId
                    ) && (
                      <div className="pt-6 border-t border-gray-200">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <CheckCircle
                            size={24}
                            className="text-green-600 mx-auto mb-2"
                          />
                          <h3 className="text-lg font-semibold text-green-800">
                            Application Approved
                          </h3>
                          <p className="text-green-700">
                            This application has been approved and all forms are
                            locked from editing.
                          </p>
                          {selectedApplication.reviewedAt && (
                            <p className="text-sm text-green-600 mt-2">
                              Approved on:{" "}
                              {new Date(
                                selectedApplication.reviewedAt
                              ).toLocaleDateString("en-GB")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  {selectedApplication.taskStatus === "Rejected" && (
                    <div className="pt-6 border-t border-gray-200">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <XCircle
                          size={24}
                          className="text-red-600 mx-auto mb-2"
                        />
                        <h3 className="text-lg font-semibold text-red-800">
                          Application Rejected
                        </h3>
                        <p className="text-red-700">
                          This application has been rejected.
                        </p>
                        {selectedApplication.reviewComments && (
                          <p className="text-sm text-red-600 mt-2 italic">
                            "{selectedApplication.reviewComments}"
                          </p>
                        )}
                        {selectedApplication.reviewedAt && (
                          <p className="text-sm text-red-600 mt-2">
                            Rejected on:{" "}
                            {new Date(
                              selectedApplication.reviewedAt
                            ).toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
                  <span className="ml-3 text-gray-600">
                    Loading application details...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Detail Modal */}
      {showFormDetailModal && selectedFormDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedFormDetail.name}
                  </h2>
                  <p className="text-gray-600">Detailed Form Information</p>
                  {selectedFormDetail.data?.status && (
                    <span
                      className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedFormDetail.data.status === "submitted"
                          ? "bg-green-100 text-green-800"
                          : selectedFormDetail.data.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      Status: {selectedFormDetail.data.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFormDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-light"
                >
                  ×
                </button>
              </div>

              {/* Form Data - Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Show form-specific sections */}
                  {selectedFormDetail.key === "employmentApplication" &&
                    selectedFormDetail.data?.applicantInfo && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Applicant Information
                        </h3>
                        <p>
                          <strong>Name:</strong>{" "}
                          {selectedFormDetail.data.applicantInfo.firstName}{" "}
                          {selectedFormDetail.data.applicantInfo.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          {selectedFormDetail.data.applicantInfo.email}
                        </p>
                        <p>
                          <strong>Phone:</strong>{" "}
                          {selectedFormDetail.data.applicantInfo.phone}
                        </p>
                        <p>
                          <strong>Address:</strong>{" "}
                          {selectedFormDetail.data.applicantInfo.address}
                        </p>
                      </div>
                    )}

                  {selectedFormDetail.key === "i9Form" && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">
                        I-9 Employment Eligibility Verification
                      </h3>
                      <p>
                        <strong>Employee Name:</strong>{" "}
                        {selectedFormDetail.data.firstName}{" "}
                        {selectedFormDetail.data.lastName}
                      </p>
                      <p>
                        <strong>Citizenship Status:</strong>{" "}
                        {selectedFormDetail.data.citizenshipStatus}
                      </p>
                      <p>
                        <strong>Employment Start Date:</strong>{" "}
                        {selectedFormDetail.data.employmentStartDate}
                      </p>
                    </div>
                  )}

                  {selectedFormDetail.key === "w4Form" && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">
                        W-4 Tax Withholding Information
                      </h3>
                      <p>
                        <strong>Employee Name:</strong>{" "}
                        {selectedFormDetail.data.firstName}{" "}
                        {selectedFormDetail.data.lastName}
                      </p>
                      <p>
                        <strong>Filing Status:</strong>{" "}
                        {selectedFormDetail.data.filingStatus}
                      </p>
                      <p>
                        <strong>Multiple Jobs:</strong>{" "}
                        {selectedFormDetail.data.multipleJobsOption ||
                          "Not specified"}
                      </p>
                    </div>
                  )}

                  {selectedFormDetail.type === "cprCertificate" &&
                    selectedFormDetail.data && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-orange-900 mb-4">
                          CPR/First Aid Certificate Information
                        </h3>
                        <div className="space-y-2">
                          <p>
                            <strong>File Name:</strong>{" "}
                            {selectedFormDetail.data.filename}
                          </p>
                          <p>
                            <strong>Upload Date:</strong>{" "}
                            {new Date(
                              selectedFormDetail.data.uploadedAt
                            ).toLocaleString()}
                          </p>
                          <p>
                            <strong>Status:</strong>{" "}
                            <span className="text-green-600 font-medium">
                              ✓ Uploaded
                            </span>
                          </p>
                          <div className="mt-4">
                            <a
                              href={`${import.meta.env.VITE__BASEURL}/${
                                selectedFormDetail.data.filePath
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View Certificate
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Full Form Data */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Complete Form Data
                    </h3>
                    {selectedFormDetail.type === "cprCertificate" ? (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">
                          Certificate information displayed above. Use the "View
                          Certificate" button to download or preview the PDF.
                        </p>
                      </div>
                    ) : (
                      renderFormData(selectedFormDetail.data)
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowFormDetailModal(false)}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
