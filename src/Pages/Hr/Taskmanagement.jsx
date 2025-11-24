import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  Ellipsis,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Plus,
  X,
  ChevronDown,
  Menu,
  Filter,
  RefreshCw,
  Eye,
  XCircle,
  CheckCircle,
  MessageCircle,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import moment from "moment";
import apiClient from "../../utils/axiosConfig";

export const Taskmanagement = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [checkTaskCreated, setCheckTaskCreated] = useState(0);
  const [taskList, setTaskList] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addNewTask, setAddNewTask] = useState({
    employeeName: "",
    taskTitle: "",
    priority: "",
    deadLine: "",
    description: "",
    taskType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmployeeFormsModal, setShowEmployeeFormsModal] = useState(false);
  const [selectedTaskData, setSelectedTaskData] = useState(null);
  const [employeeFormsData, setEmployeeFormsData] = useState(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const router = useNavigate();
  const baseURL = import.meta.env.VITE__BASEURL;

  // kanban start
  const [newTask, setNewTask] = useState("");
  const [columns, setColumns] = useState({
    todo: {
      name: "To Do",
      icon: <FileText className="w-5 h-5" />,
      color: "#3B82F6",
      tasks: [],
    },
    inProgress: {
      name: "In Progress",
      icon: <Clock className="w-5 h-5" />,
      color: "#F59E0B",
      tasks: [],
    },
    inReview: {
      name: "In Review",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "#8B5CF6",
      tasks: [],
    },
    done: {
      name: "Complete",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "#10B981",
      tasks: [],
    },
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [defaultState, setDefaultState] = useState("todo");
  const [showFinalDecisionModal, setShowFinalDecisionModal] = useState(false);
  const [pendingDrop, setPendingDrop] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationForms, setApplicationForms] = useState(null);
  const [hrNoteToEmployee, setHrNoteToEmployee] = useState("");
  const [isSendingNote, setIsSendingNote] = useState(false);

  // Manual task addition - disabled for onboarding-only workflow
  /*
  const handleAddNewtask = () => {
    if (newTask.trim() === "") return;

    const updateColums = { ...columns };
    updateColums[defaultState].tasks.push({
      id: Date.now().toString(),
      content: newTask,
    });

    setColumns(updateColums);
    setNewTask("");
  };
  */

  // Load onboarding tasks from backend
  useEffect(() => {
    const loadOnboardingTasks = async () => {
      try {
        console.log("🔄 Loading onboarding tasks from backend...");

        const response = await apiClient.get("/hr/kanban/get-kanban-tasks");

        if (response.data && response.data.success) {
          const backendTasks = response.data.tasks;
          console.log("✅ Loaded tasks from backend:", backendTasks);

          // Clear existing tasks and organize by status
          const updatedColumns = { ...columns };
          Object.keys(updatedColumns).forEach((columnId) => {
            updatedColumns[columnId].tasks = [];
          });

          // Add backend tasks to appropriate columns
          backendTasks.forEach((task) => {
            const targetColumn = getColumnFromStatus(task.status);

            console.log(
              `Adding task "${task.taskTitle}" to column "${targetColumn}"`
            );

            updatedColumns[targetColumn].tasks.push({
              id: task.id,
              taskId: task.taskId,
              content: task.taskTitle,
              taskTitle: task.taskTitle,
              employeeName: task.employeeName,
              employeeEmail: task.employeeEmail,
              employeePosition: task.employeePosition,
              employeeId: task.employeeId,
              deadLine: task.deadLine,
              priority: task.priority,
              department: task.department,
              position: task.position,
              createdAt: task.createdAt,
              acceptedAt: task.acceptedAt,
              applicationId: task.applicationId,
              taskType: task.taskType,
              status: task.status,
              description: task.description,
              assignedBy: task.assignedBy,
              updatedAt: task.updatedAt,
              approvalType: task.approvalType,
              cardClass: task.cardClass,
              cardGradient: task.cardGradient,
            });
          });

          console.log("✅ Updated columns with backend tasks:", updatedColumns);
          setColumns(updatedColumns);
        } else {
          console.log("ℹ️ No tasks found in backend response");
          // Clear all columns if no tasks
          const clearedColumns = { ...columns };
          Object.keys(clearedColumns).forEach((columnId) => {
            clearedColumns[columnId].tasks = [];
          });
          setColumns(clearedColumns);
        }
      } catch (error) {
        console.error("❌ Error loading tasks from backend:", error);
        toast.error("Failed to load onboarding tasks from server");
        // Keep existing columns state on error
      }
    };

    loadOnboardingTasks();

    // Listen for custom kanban tasks updated event from HR Dashboard
    const handleKanbanTasksUpdated = (e) => {
      console.log(
        "🔔 Detected kanbanTasksUpdated event, reloading from backend..."
      );
      loadOnboardingTasks();
    };

    window.addEventListener("kanbanTasksUpdated", handleKanbanTasksUpdated);

    return () => {
      window.removeEventListener(
        "kanbanTasksUpdated",
        handleKanbanTasksUpdated
      );
    };
  }, []);

  // Helper function to map task status to column
  const getColumnFromStatus = (status) => {
    switch (status) {
      case "Complete":
        return "done";
      case "In Review":
        return "inReview";
      case "In Progress":
        return "inProgress";
      case "To Do":
      default:
        return "todo";
    }
  };

  // Helper function to map column to status
  const getStatusFromColumn = (columnId) => {
    switch (columnId) {
      case "done":
        return "Complete";
      case "inReview":
        return "In Review";
      case "inProgress":
        return "In Progress";
      case "todo":
      default:
        return "To Do";
    }
  };

  // Update backend when columns change (replace localStorage)
  const updateBackend = async (updatedColumns, movedTask = null) => {
    // Backend updates are now handled in handleDrop function
    // This function is kept for future backend sync if needed
    console.log("📡 Columns updated, backend sync handled in drag/drop");
  };

  // handle on dragged...
  const handleDragStart = (columnId, item) => {
    // Prevent dragging completed tasks
    if (columnId === "done" || item.status === "Complete") {
      return;
    }

    setDraggedItem({
      columnId,
      item,
    });
  };

  const handleDraggedOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, columnId) => {
    if (!draggedItem) return;

    const { columnId: sourceColumnId, item } = draggedItem;

    if (sourceColumnId === columnId) return;
    try {
      const newStatus = getStatusFromColumn(columnId);

      // If dropping into Complete, require final approval/rejection first
      if (columnId === "done") {
        // Store pending drop and show modal
        setPendingDrop({
          sourceColumnId,
          targetColumnId: columnId,
          item,
          newStatus,
        });
        setShowFinalDecisionModal(true);
        return;
      }

      // Update local state first for immediate UI feedback
      const updateColumns = { ...columns };

      updateColumns[sourceColumnId].tasks = updateColumns[
        sourceColumnId
      ].tasks.filter((t) => t.id !== item.id);

      // Update the task status before adding to new column
      const updatedTask = {
        ...item,
        status: newStatus,
      };

      updateColumns[columnId].tasks.push(updatedTask);

      setColumns(updateColumns);

      // Update backend task status
      try {
        const taskId = item.taskId || item.id;
        console.log(`🔄 Updating task ${taskId} to status: ${newStatus}`);

        const response = await apiClient.put(
          `/hr/kanban/update-task-status/${taskId}`,
          {
            status: newStatus,
            reviewComments: `Status updated via Task Management: ${newStatus}`,
          }
        );

        if (response.data && response.data.success) {
          toast.success(`✅ Task moved to ${newStatus}`);
          console.log("✅ Backend task status updated successfully");
        } else {
          toast.warning("Task moved locally but backend update failed");
        }
      } catch (apiError) {
        console.error("❌ Error updating task status in backend:", apiError);
        toast.error("Task moved locally but failed to update backend");

        // Revert local changes on backend failure
        updateColumns[columnId].tasks = updateColumns[columnId].tasks.filter(
          (t) => t.id !== item.id
        );
        updateColumns[sourceColumnId].tasks.push(item);
        setColumns(updateColumns);
      }

      // Also update application status if we have an applicationId
      if (item.applicationId) {
        try {
          console.log(
            `📋 Updating application status for applicationId: ${item.applicationId}`
          );
          const appStatusMapping = {
            "To Do": "submitted",
            "In Progress": "under_review", // HR is reviewing the application
            "In Review": "in_review_final", // HR is doing final review before decision
            Complete: "approved",
          };

          const appStatus = appStatusMapping[newStatus] || "submitted";
          console.log(`📊 Mapped status: ${newStatus} → ${appStatus}`);

          const appResponse = await apiClient.put(
            `/onboarding/update-status/${item.applicationId}`,
            {
              status: appStatus,
              reviewComments: `Application status updated via Task Management: ${newStatus}`,
            }
          );

          console.log("✅ Application status updated successfully:", appStatus);
          console.log("✅ Response:", appResponse.data);
        } catch (appError) {
          console.error("⚠️ Error updating application status:", appError);
          console.error("⚠️ Error details:", appError.response?.data);
          // Don't show error for application update failure as task update succeeded
        }
      } else {
        console.warn("⚠️ No applicationId found in task item:", item);
      }

      setDraggedItem(null);
    } catch (error) {
      console.error("❌ Error handling task drop:", error);
      toast.error("Failed to move task");
      setDraggedItem(null);
    }
  };
  // kanban end

  // Manual refresh function - now loads from backend
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered - loading from backend");

    try {
      const response = await apiClient.get("/hr/kanban/get-kanban-tasks");

      if (response.data && response.data.success) {
        const backendTasks = response.data.tasks;
        console.log("✅ Refreshed tasks from backend:", backendTasks);

        // Clear existing tasks and organize by status
        const updatedColumns = { ...columns };
        Object.keys(updatedColumns).forEach((columnId) => {
          updatedColumns[columnId].tasks = [];
        });

        // Add backend tasks to appropriate columns
        backendTasks.forEach((task) => {
          const targetColumn = getColumnFromStatus(task.status);

          updatedColumns[targetColumn].tasks.push({
            id: task.id,
            taskId: task.taskId,
            content: task.taskTitle,
            taskTitle: task.taskTitle,
            employeeName: task.employeeName,
            employeeEmail: task.employeeEmail,
            employeePosition: task.employeePosition,
            employeeId: task.employeeId,
            deadLine: task.deadLine,
            priority: task.priority,
            department: task.department,
            position: task.position,
            createdAt: task.createdAt,
            acceptedAt: task.acceptedAt,
            applicationId: task.applicationId,
            taskType: task.taskType,
            status: task.status,
            description: task.description,
            assignedBy: task.assignedBy,
            updatedAt: task.updatedAt,
            approvalType: task.approvalType, // Add approval type for persistent styling
            cardClass: task.cardClass, // Add card class for styling
            cardGradient: task.cardGradient, // Add card gradient for background styling
          });
        });

        setColumns(updatedColumns);
        toast.success(
          `✅ Refreshed ${backendTasks.length} onboarding tasks from backend!`
        );
      } else {
        console.log("ℹ️ No tasks found in backend");
        // Clear all columns if no tasks
        const clearedColumns = { ...columns };
        Object.keys(clearedColumns).forEach((columnId) => {
          clearedColumns[columnId].tasks = [];
        });
        setColumns(clearedColumns);
        toast("No onboarding tasks found in backend");
      }
    } catch (error) {
      console.error("❌ Error refreshing from backend:", error);
      toast.error("Failed to refresh tasks from backend");
    }
  };

  // Clear all tasks from backend (for testing/debugging)
  const handleClearTasks = async () => {
    if (
      !window.confirm(
        "⚠️ Are you sure you want to delete ALL onboarding tasks from the backend? This cannot be undone!"
      )
    ) {
      return;
    }

    try {
      // First get all tasks
      const response = await apiClient.get("/hr/kanban/get-kanban-tasks");

      if (
        response.data &&
        response.data.success &&
        response.data.tasks.length > 0
      ) {
        const tasks = response.data.tasks;

        // Delete each task
        const deletePromises = tasks.map((task) =>
          apiClient
            .delete(`/hr/kanban/delete-task/${task.taskId}`)
            .catch((err) => {
              console.error(`Failed to delete task ${task.taskId}:`, err);
              return null;
            })
        );

        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter(
          (result) => result !== null
        ).length;

        // Clear local columns
        const clearedColumns = { ...columns };
        Object.keys(clearedColumns).forEach((columnId) => {
          clearedColumns[columnId].tasks = [];
        });
        setColumns(clearedColumns);

        toast.success(
          `✅ Deleted ${successfulDeletes}/${tasks.length} onboarding tasks from backend`
        );

        if (successfulDeletes < tasks.length) {
          toast.warning(
            `⚠️ Some tasks could not be deleted. Check console for details.`
          );
        }
      } else {
        toast("ℹ️ No onboarding tasks found in backend to delete");
      }
    } catch (error) {
      console.error("❌ Error clearing tasks from backend:", error);
      toast.error("Failed to clear tasks from backend");
    }
  };

  // Fetch employee forms from backend
  const fetchEmployeeForms = async (employeeIdentifier) => {
    try {
      setLoadingForms(true);
      console.log(
        "Fetching forms for employee identifier:",
        employeeIdentifier
      );

      // Fetch application details and forms from the backend
      const response = await apiClient.get(
        `/onboarding/get-application/${employeeIdentifier}`
      );

      if (response.data && response.data.data && response.data.data.forms) {
        console.log(
          "Successfully fetched employee forms:",
          response.data.data.forms
        );
        return response.data.data.forms;
      } else {
        console.error("No forms data found in response");
        toast.error("No forms data found for this employee");
        return null;
      }
    } catch (error) {
      console.error("Error fetching employee forms:", error);
      toast.error("Failed to load employee forms");
      return null;
    } finally {
      setLoadingForms(false);
    }
  };

  // Handle task click to show employee forms
  const handleTaskClick = async (task) => {
    console.log("Task clicked:", task);

    if (!task.employeeEmail) {
      toast.error("No employee email found for this task");
      return;
    }

    setSelectedTaskData(task);
    setShowEmployeeFormsModal(true);
    setEmployeeFormsData(null);

    // Fetch the employee's forms using employee email
    const formsData = await fetchEmployeeForms(task.employeeEmail);
    if (formsData) {
      setEmployeeFormsData(formsData);
    }
  };

  // Handle view application details (similar to HrDashboard)
  const handleViewApplication = async (task) => {
    setSelectedApplication(task);
    const formsData = await fetchEmployeeForms(
      task.employeeEmail || task.employeeId
    );
    if (formsData) {
      setApplicationForms(formsData);
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

    // Navigate to form routes based on formKey
    switch (formKey) {
      case "w4Form":
        navigate(`/hr/w4-form/${employeeId}`);
        break;
      case "w9Form":
        navigate(`/hr/w9-form/${employeeId}`);
        break;
      case "i9Form":
        navigate(`/hr/i9-form/${employeeId}`);
        break;
      case "emergencyContact":
        navigate(`/hr/emergency-contact/${employeeId}`);
        break;
      case "directDeposit":
        navigate(`/hr/direct-deposit-form/${employeeId}`);
        break;
      case "misconductStatement":
        navigate(`/hr/staff-misconduct-statement/${employeeId}`);
        break;
      case "codeOfEthics":
        navigate(`/hr/code-of-ethics/${employeeId}`);
        break;
      case "serviceDeliveryPolicies":
        navigate(`/hr/service-delivery-policies/${employeeId}`);
        break;
      case "nonCompeteAgreement":
        navigate(`/hr/non-compete-agreement/${employeeId}`);
        break;
      case "backgroundCheck":
        navigate(`/hr/background-check-form/${employeeId}`);
        break;
      case "tbSymptomScreen":
        navigate(`/hr/tb-symptom-screen/${employeeId}`);
        break;
      case "orientationChecklist":
        navigate(`/hr/orientation-checklist/${employeeId}`);
        break;
      case "orientationPresentation":
        navigate(`/hr/orientation-presentation/${employeeId}`);
        break;
      case "jobDescriptionPCA":
        navigate(`/hr/job-description/pca/${employeeId}`);
        break;
      case "pcaTrainingQuestions":
        navigate(`/hr/pca-training-questions/${employeeId}`);
        break;
      case "personalInformation":
        navigate(`/hr/personal-information/${employeeId}`);
        break;
      case "professionalExperience":
        navigate(`/hr/professional-experience/${employeeId}`);
        break;
      case "education":
        navigate(`/hr/education/${employeeId}`);
        break;
      case "references":
        navigate(`/hr/references/${employeeId}`);
        break;
      case "legalDisclosures":
        navigate(`/hr/legal-disclosures/${employeeId}`);
        break;
      case "workExperience":
        navigate(`/hr/work-experience/${employeeId}`);
        break;
      case "drivingLicense":
        navigate(`/hr/driving-license/${employeeId}`);
        break;
      case "employeeDetailsUpload":
        navigate(`/hr/employee-details-upload/${employeeId}`);
        break;
      default:
        toast.error(`Form viewer not available for ${formName}`);
    }
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
          hrUserId: "HR",
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
        setHrNoteToEmployee("");
      }
    } catch (error) {
      console.error("Error sending HR note:", error);
      toast.error("Failed to send HR note. Please try again.");
    } finally {
      setIsSendingNote(false);
    }
  };

  // Handle form click to navigate to HR form view (like HR Dashboard)
  const handleFormClick = (formKey, formData) => {
    console.log("Form clicked:", formKey, formData);

    // Check if we have the selected task data for employee identification
    if (!selectedTaskData) {
      toast.error("No employee data available");
      return;
    }

    // Check if form data exists
    if (!formData || Object.keys(formData).length === 0) {
      toast("Form data not available for viewing");
      return;
    }

    // Get employee identifier - try different properties that might contain the employee ID
    const employeeIdentifier =
      selectedTaskData.employeeEmail ||
      selectedTaskData.employeeId ||
      selectedTaskData.applicationId ||
      selectedTaskData.employeeName;

    // Map form keys to their corresponding HR routes
    const formRouteMap = {
      employmentApplication: "/hr/employment-application",
      i9Form: "/hr/i9-form",
      w4Form: "/hr/w4-form",
      w9Form: "/hr/w9-form",
      emergencyContact: "/hr/emergency-contact",
      directDeposit: "/hr/direct-deposit-form",
      misconductStatement: "/hr/staff-misconduct-statement",
      codeOfEthics: "/hr/code-of-ethics",
      serviceDeliveryPolicies: "/hr/service-delivery-policies",
      nonCompeteAgreement: "/hr/non-compete-agreement",
      backgroundCheck: "/hr/background-check-form",
      tbSymptomScreen: "/hr/tb-symptom-screen",
      orientationChecklist: "/hr/orientation-checklist",
      orientationPresentation: "/hr/orientation-presentation",
      jobDescriptionPCA: "/hr/job-description/pca",
      jobDescriptionCNA: "/hr/job-description/cna",
      jobDescriptionLPN: "/hr/job-description/lpn",
      jobDescriptionRN: "/hr/job-description/rn",
    };

    const route = formRouteMap[formKey];

    if (route && employeeIdentifier) {
      console.log(`🔗 Navigating to: ${route}/${employeeIdentifier}`);
      console.log(`👤 Employee: ${selectedTaskData.employeeName}`);
      console.log(`📋 Form: ${formKey}`);

      // Navigate to the HR form page with employee identifier
      navigate(`${route}/${employeeIdentifier}`);

      // Close the employee forms modal
      setShowEmployeeFormsModal(false);
      setSelectedTaskData(null);
      setEmployeeFormsData(null);

      toast.success(`Opening ${formKey} for ${selectedTaskData.employeeName}`);
    } else {
      console.error("Route or employee identifier not found:", {
        route,
        employeeIdentifier,
        formKey,
      });
      toast.error("Unable to open form - missing route or employee identifier");
    }
  };

  // Handle final approval of employee onboarding
  const handleFinalApproval = async () => {
    if (!selectedTaskData) {
      toast.error("No task data available");
      return;
    }

    if (
      !window.confirm(
        `🎉 Are you sure you want to FINALLY APPROVE ${selectedTaskData.employeeName}'s onboarding? This will complete their onboarding process.`
      )
    ) {
      return;
    }

    try {
      const taskId = selectedTaskData.taskId || selectedTaskData.id;

      // Update task status to Complete
      const taskResponse = await apiClient.put(
        `/hr/kanban/update-task-status/${taskId}`,
        {
          status: "Complete",
          reviewComments: `Final approval completed by HR - ${selectedTaskData.employeeName} onboarding is complete`,
          approvalType: "final_approved",
        }
      );

      if (taskResponse.data && taskResponse.data.success) {
        // Update application status if we have applicationId
        if (selectedTaskData.applicationId) {
          try {
            await apiClient.put(
              `/onboarding/final-approve/${selectedTaskData.applicationId}`,
              {
                reviewComments: `Final approval completed by HR - all onboarding requirements satisfied`,
              }
            );
            console.log("✅ Application also finally approved");
          } catch (appError) {
            console.error("⚠️ Error finally approving application:", appError);
          }
        }

        toast.success(
          `🎉 ${selectedTaskData.employeeName}'s onboarding has been FINALLY APPROVED!`,
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

        // Close modal and refresh tasks
        setShowEmployeeFormsModal(false);
        setSelectedTaskData(null);
        setEmployeeFormsData(null);

        // Refresh the kanban board to show the updated task
        handleRefresh();
      } else {
        toast.error("Failed to finally approve the onboarding");
      }
    } catch (error) {
      console.error("❌ Error in final approval:", error);
      toast.error("Failed to finally approve the onboarding");
    }
  };

  // Handle final rejection of employee onboarding
  const handleFinalRejection = async () => {
    if (!selectedTaskData) {
      toast.error("No task data available");
      return;
    }

    const rejectionReason = window.prompt(
      `⚠️ Please provide a reason for rejecting ${selectedTaskData.employeeName}'s onboarding:`,
      ""
    );

    if (!rejectionReason) {
      toast("Rejection cancelled - no reason provided");
      return;
    }

    if (
      !window.confirm(
        `❌ Are you sure you want to REJECT ${selectedTaskData.employeeName}'s onboarding? This action will mark their onboarding as rejected.`
      )
    ) {
      return;
    }

    try {
      const taskId = selectedTaskData.taskId || selectedTaskData.id;

      // Update task status to Complete (but with rejection flag)
      const taskResponse = await apiClient.put(
        `/hr/kanban/update-task-status/${taskId}`,
        {
          status: "Complete",
          reviewComments: `Final rejection by HR - Reason: ${rejectionReason}`,
          approvalType: "final_rejected",
        }
      );

      if (taskResponse.data && taskResponse.data.success) {
        // Update application status if we have applicationId
        if (selectedTaskData.applicationId) {
          try {
            console.log(
              "🔄 Updating application status to REJECTED for applicationId:",
              selectedTaskData.applicationId
            );
            const appUpdateResponse = await apiClient.put(
              `/onboarding/update-status/${selectedTaskData.applicationId}`,
              {
                status: "rejected",
                reviewComments: `Final rejection by HR - Reason: ${rejectionReason}`,
              }
            );
            console.log(
              "✅ Application rejection response:",
              appUpdateResponse.data
            );
            console.log("✅ Application also rejected");
          } catch (appError) {
            console.error("⚠️ Error rejecting application:", appError);
            console.error(
              "⚠️ Application ID that failed:",
              selectedTaskData.applicationId
            );
          }
        } else {
          console.warn(
            "⚠️ No applicationId found in selectedTaskData:",
            selectedTaskData
          );
        }

        toast.success(
          `❌ ${selectedTaskData.employeeName}'s onboarding has been REJECTED`,
          {
            style: {
              background: "#DC2626",
              color: "white",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "16px 24px",
              fontSize: "16px",
            },
            duration: 6000,
            icon: "❌",
          }
        );

        // Close modal and refresh tasks
        setShowEmployeeFormsModal(false);
        setSelectedTaskData(null);
        setEmployeeFormsData(null);

        // Refresh the kanban board to show the updated task
        handleRefresh();
      } else {
        toast.error("Failed to reject the onboarding");
      }
    } catch (error) {
      console.error("❌ Error in final rejection:", error);
      toast.error("Failed to reject the onboarding");
    }
  };

  const [files, setFiles] = useState([]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setAddNewTask({ ...addNewTask, [name]: value });
  };

  const handleCreateNewTask = async () => {
    setIsLoading(true);
    const employeeNameAndId = addNewTask?.employeeName.split(" ");
    const employeeId = employeeNameAndId.splice(employeeNameAndId.length - 1);
    const employeeName = employeeNameAndId.join(" ");

    try {
      if (!baseURL) {
        return toast.error("Internal error! Please try again later");
      }

      const formData = new FormData();
      formData.append("employeeName", employeeName);
      formData.append("taskTitle", addNewTask?.taskTitle);
      formData.append("priority", addNewTask?.priority);
      formData.append("deadLine", addNewTask?.deadLine);
      formData.append("description", addNewTask?.description);
      formData.append("assignedToID", employeeId[0]);
      formData.append("assignedByID", userInfo?._id || "");
      formData.append("taskType", addNewTask?.taskType);

      // Append multiple files
      files.forEach((file) => {
        formData.append("docs", file);
      });

      const reqToCreateNewTask = await axios.post(
        `${baseURL}/task/create-task`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(reqToCreateNewTask?.data.message);
      setCheckTaskCreated(checkTaskCreated + 1);
      setFiles([]); // Reset file state
      setShowCreateTask(false); // Close the form after successful creation

      // Reset form
      setAddNewTask({
        employeeName: "",
        taskTitle: "",
        priority: "",
        deadLine: "",
        description: "",
        taskType: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Task creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  //   get-all-task-list function..
  const getAllTasklist = async () => {
    try {
      const getAllTaskList = await axios.get(`${baseURL}/task/get-all`);
      setTaskList([...getAllTaskList?.data.taskList]);
    } catch (error) {
      console.error(error?.response.data);
      toast.error(error?.response.data.message);
    }
  };

  // get-all-Employee-list ....
  const getAllEmployeeList = async (token) => {
    try {
      const getEmployee = await axios.get(
        `${baseURL}/employee/get-all-employee`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (getEmployee.status === 200) {
        setEmployeeList([...getEmployee.data.employessList]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data.message);
    }
  };

  //   get user session...
  useEffect(() => {
    const session = Cookies.get("session");
    if (!session) {
      return router("/auth/log-in");
    }
    const userData = jwtDecode(session);
    setUserInfo(userData.user);
    getAllEmployeeList(session);
  }, []);

  // Removed getAllTasklist() call - we only want approved onboarding tasks from localStorage

  const handlePriorityBg = (priority) => {
    switch (priority) {
      case "Normal":
        return "#10B981";
      case "Medium":
        return "#F59E0B";
      case "High":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  return (
    <>
      <Layout>
        <div className='className="w-full h-full"'>
          <Navbar />
        </div>
        <div className="flex justify-center gap-4 bg-gray-50 min-h-screen">
          <div className="flex-1 py-4 lg:py-6 px-4 lg:px-6">
            {/* heading */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Onboarding Task Management
                </h1>
                <p className="text-sm lg:text-base text-gray-600 mt-1">
                  Track approved employee onboarding progress
                </p>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleRefresh}
                  className="flex-none px-3 lg:px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium text-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center gap-2"
                  title="Refresh from Backend"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden lg:inline">Refresh</span>
                </button>
                {/* Debug button - remove in production */}
                <button
                  onClick={handleClearTasks}
                  className="flex-none px-3 lg:px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium text-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center gap-2"
                  title="Delete All Backend Tasks (Debug Only)"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden lg:inline">Clear All</span>
                </button>
                <button className="flex-1 sm:flex-none px-4 lg:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium text-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                  View All Onboarding
                </button>
              </div>
            </div>

            {/* Create Task Card - Disabled for Onboarding-only workflow
            {showCreateTask && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6 animate-in slide-in-from-top duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Create New Task
                  </h2>

                  <button
                    onClick={() => setShowCreateTask(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <select
                        name="employeeName"
                        value={addNewTask.employeeName}
                        onChange={handleOnChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Employee...</option>
                        {employeeList.map((employee, id) => (
                          <>
                            {employee.userRole === "employee" && (
                              <option
                                key={id}
                                value={`${employee.userName} ${employee._id}`}
                              >
                                {employee.userName}
                              </option>
                            )}
                          </>
                        ))}
                      </select>

                      <input
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        type="text"
                        placeholder="Task Title"
                        name="taskTitle"
                        onChange={handleOnChange}
                        value={addNewTask.taskTitle}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          name="priority"
                          value={addNewTask.priority}
                          onChange={handleOnChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Priority</option>
                          <option value="Normal">Normal</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>

                        <select
                          name="taskType"
                          value={addNewTask.taskType}
                          onChange={handleOnChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Task Type</option>
                          <option value="Onboarding">Onboarding</option>
                          <option value="Daily">Daily</option>
                        </select>
                      </div>

                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Deadline"
                        value={addNewTask.deadLine}
                        name="deadLine"
                        onChange={handleOnChange}
                      />
                    </div>
                  </div>

                  <textarea
                    placeholder="Task Description..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                    onChange={handleOnChange}
                    value={addNewTask.description}
                    name="description"
                  ></textarea>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label
                      htmlFor="fileUpload"
                      className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Attach Files
                    </label>
                    <input
                      id="fileUpload"
                      type="file"
                      multiple
                      hidden
                      onChange={(e) => setFiles([...e.target.files])}
                    />
                    {files.length > 0 && (
                      <span className="text-sm text-gray-600">
                        {files.length} file(s) selected
                      </span>
                    )}
                    <button
                      onClick={handleCreateNewTask}
                      disabled={
                        !Object.keys(addNewTask).every((key) => {
                          return Boolean(addNewTask[key]);
                        }) || isLoading
                      }
                      className="sm:ml-auto w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium text-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none inline-flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Task
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )} 
            End of commented create task form */}

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">
                    Backend-Integrated Onboarding Management
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Tasks are now stored in the backend database. When HR
                    approves applications, onboarding tasks are automatically
                    created and synced across all sessions in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>

                  {/* Filter Options - Hidden on mobile unless menu is open */}
                  <div
                    className={`${
                      mobileMenuOpen ? "flex" : "hidden"
                    } lg:flex flex-col lg:flex-row gap-4 lg:items-center w-full`}
                  >
                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <option>All Tasks</option>
                      <option>HR Tasks</option>
                      <option>Employee Tasks</option>
                    </select>

                    <div className="flex-1 lg:max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          placeholder="Search tasks..."
                        />
                      </div>
                    </div>

                    <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                      <option>Select Date</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 6 months</option>
                      <option>1 Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Desktop Kanban View */}
              <div className="hidden lg:block h-[70vh] overflow-x-auto bg-gray-50">
                <div className="grid grid-cols-4 gap-0 min-w-[800px] h-full">
                  {Object.keys(columns).map((columnId, id) => (
                    <div
                      key={id}
                      onDragOver={(e) => handleDraggedOver(e, columnId)}
                      onDrop={(e) => handleDrop(e, columnId)}
                      className="flex flex-col h-full border-r border-gray-200 last:border-r-0 min-w-[200px]"
                    >
                      <div
                        className="p-4 bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10"
                        style={{
                          borderTop: `3px solid ${columns[columnId].color}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div style={{ color: columns[columnId].color }}>
                              {columns[columnId].icon}
                            </div>
                            <h3 className="font-semibold text-gray-800">
                              {columns[columnId].name}
                            </h3>
                          </div>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {columns[columnId].tasks.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto min-h-0">
                        {columns[columnId].tasks.length === 0 && (
                          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl">
                            <p className="text-gray-400 text-sm font-medium">
                              Drop tasks here
                            </p>
                          </div>
                        )}

                        {columns[columnId].tasks.map((task, taskId) => {
                          // Determine card styling based on approval/status
                          const getTaskCardStyling = () => {
                            // Use backend-provided styling hints for Complete cards
                            if (
                              columnId === "done" &&
                              task.status === "Complete"
                            ) {
                              if (task.cardGradient) {
                                // Apply backend-provided gradient with enhanced styling
                                return task.approvalType === "final_approved"
                                  ? "border-green-300 shadow-lg hover:shadow-green-300 shadow-green-100"
                                  : "border-red-300 shadow-lg hover:shadow-red-200 shadow-red-100";
                              }
                              // Fallback for complete tasks without final decision
                              return "bg-white border-gray-100 shadow-sm hover:shadow-md";
                            }

                            // Standard styling for other statuses
                            if (
                              task.status === "Reject" ||
                              task.approvalType === "final_rejected"
                            ) {
                              return "bg-white border-red-100 shadow-sm hover:shadow-md";
                            }

                            return "bg-white border-gray-100 shadow-sm hover:shadow-md";
                          };

                          const getApprovalIndicator = () => {
                            if (
                              columnId === "done" &&
                              task.status === "Complete"
                            ) {
                              if (task.approvalType === "final_approved") {
                                return (
                                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                    🎉 APPROVED
                                  </div>
                                );
                              } else if (
                                task.approvalType === "final_rejected"
                              ) {
                                return (
                                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                    ❌ REJECTED
                                  </div>
                                );
                              }
                            }
                            return null;
                          };

                          return (
                            <div
                              key={taskId}
                              draggable={
                                columnId !== "done" &&
                                task.status !== "Complete"
                              }
                              onDragStart={() => {
                                // Only allow drag if not in done column and not completed
                                if (
                                  columnId !== "done" &&
                                  task.status !== "Complete"
                                ) {
                                  handleDragStart(columnId, task);
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewApplication(task);
                              }}
                              className={`relative p-4 rounded-xl border mb-3 transition-all duration-300 group ${getTaskCardStyling()} ${
                                columnId === "done" ||
                                task.status === "Complete"
                                  ? "cursor-pointer"
                                  : "cursor-move hover:cursor-grab active:cursor-grabbing"
                              }`}
                              style={{
                                // Apply backend-provided gradient for Complete cards
                                background:
                                  columnId === "done" &&
                                  task.status === "Complete" &&
                                  task.cardGradient
                                    ? task.cardGradient
                                    : undefined,
                              }}
                            >
                              {getApprovalIndicator()}

                              {/* Lock indicator for completed tasks */}
                              {(columnId === "done" ||
                                task.status === "Complete") && (
                                <div className="absolute top-2 left-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                  🔒{" "}
                                  <span className="hidden sm:inline">
                                    Fixed
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-start mb-3">
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded ${
                                    task.approvalType === "final_approved"
                                      ? "bg-green-100 text-green-800"
                                      : task.approvalType === "final_rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {task.department || "DEV"} S-
                                  {task.id.slice(-3)}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Ellipsis
                                    size={16}
                                    className="text-gray-400"
                                  />
                                </button>
                              </div>

                              <h4
                                className={`font-medium mb-2 line-clamp-2 ${
                                  task.approvalType === "final_approved"
                                    ? "text-green-900"
                                    : task.approvalType === "final_rejected"
                                    ? "text-red-900"
                                    : "text-gray-900"
                                }`}
                              >
                                {task.taskTitle || task.content}
                              </h4>

                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                  {task.deadLine
                                    ? moment(task.deadLine).format("MMM DD")
                                    : "No deadline"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-xs ${
                                      task.approvalType === "final_approved"
                                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                        : task.approvalType === "final_rejected"
                                        ? "bg-gradient-to-br from-red-500 to-rose-600"
                                        : "bg-gradient-to-br from-blue-500 to-purple-600"
                                    }`}
                                  >
                                    {task.employeeName
                                      ? task.employeeName
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                      : "UN"}
                                  </div>
                                  <span
                                    className={`text-sm truncate max-w-[80px] ${
                                      task.approvalType === "final_approved"
                                        ? "text-green-700"
                                        : task.approvalType === "final_rejected"
                                        ? "text-red-700"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {task.employeeName || "Unknown"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                      backgroundColor: handlePriorityBg(
                                        task.priority || "Normal"
                                      ),
                                    }}
                                  />
                                  <span className="text-xs font-medium text-gray-600">
                                    {task.priority || "Normal"}
                                  </span>
                                </div>
                              </div>

                              {/* Show special approval status message */}
                              {columnId === "done" &&
                                task.status === "Complete" &&
                                task.approvalType && (
                                  <div
                                    className={`mt-3 pt-2 border-t text-center text-xs font-medium ${
                                      task.approvalType === "final_approved"
                                        ? "border-green-200 text-green-800"
                                        : task.approvalType === "final_rejected"
                                        ? "border-red-200 text-red-800"
                                        : "border-gray-200 text-gray-600"
                                    }`}
                                  >
                                    {task.approvalType === "final_approved"
                                      ? "✅ Onboarding Complete"
                                      : task.approvalType === "final_rejected"
                                      ? "❌ Onboarding Rejected"
                                      : "🔄 Processing Complete"}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Column Selector */}
              <div className="lg:hidden">
                <div className="p-4 bg-white border-b border-gray-200">
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {Object.keys(columns).map((columnId) => (
                      <option key={columnId} value={columnId}>
                        {columns[columnId].name} (
                        {columns[columnId].tasks.length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile Task View */}
                <div className="h-[60vh] overflow-y-auto bg-gray-50 p-4">
                  <div
                    className="mb-4 p-3 rounded-lg bg-white"
                    style={{
                      borderLeft: `4px solid ${columns[selectedColumn].color}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div style={{ color: columns[selectedColumn].color }}>
                        {columns[selectedColumn].icon}
                      </div>
                      <h3 className="font-semibold text-gray-800">
                        {columns[selectedColumn].name}
                      </h3>
                      <span className="ml-auto px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {columns[selectedColumn].tasks.length}
                      </span>
                    </div>
                  </div>

                  {columns[selectedColumn].tasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-white">
                      <p className="text-gray-400 text-sm font-medium">
                        No tasks in this column
                      </p>
                    </div>
                  )}

                  {columns[selectedColumn].tasks.map((task, taskId) => {
                    // Determine mobile card styling based on approval/status
                    const getMobileCardStyling = () => {
                      // Use backend-provided styling hints for Complete cards
                      if (
                        selectedColumn === "done" &&
                        task.status === "Complete"
                      ) {
                        if (task.cardGradient) {
                          // Apply backend-provided gradient with enhanced styling
                          return task.approvalType === "final_approved"
                            ? "border-green-300 shadow-lg hover:shadow-green-300 shadow-green-100"
                            : "border-red-300 shadow-lg hover:shadow-red-200 shadow-red-100";
                        }
                        return "bg-white border-gray-100 shadow-sm hover:shadow-md";
                      }

                      if (
                        task.status === "Reject" ||
                        task.approvalType === "final_rejected"
                      ) {
                        return "bg-white border-red-100 shadow-sm hover:shadow-md";
                      }

                      return "bg-white border-gray-100 shadow-sm hover:shadow-md";
                    };

                    const getMobileApprovalIndicator = () => {
                      if (
                        selectedColumn === "done" &&
                        task.status === "Complete"
                      ) {
                        if (task.approvalType === "final_approved") {
                          return (
                            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                              🎉 APPROVED
                            </div>
                          );
                        } else if (task.approvalType === "final_rejected") {
                          return (
                            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                              ❌ REJECTED
                            </div>
                          );
                        }
                      }
                      return null;
                    };

                    return (
                      <div
                        key={taskId}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewApplication(task);
                        }}
                        className={`relative p-4 rounded-xl border mb-3 cursor-pointer transition-all duration-300 ${getMobileCardStyling()}`}
                        style={{
                          // Apply backend-provided gradient for Complete cards in mobile view
                          background:
                            selectedColumn === "done" &&
                            task.status === "Complete" &&
                            task.cardGradient
                              ? task.cardGradient
                              : undefined,
                        }}
                      >
                        {getMobileApprovalIndicator()}

                        {/* Lock indicator for completed tasks in mobile */}
                        {(selectedColumn === "done" ||
                          task.status === "Complete") && (
                          <div className="absolute top-2 left-2 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            🔒 <span>Fixed</span>
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              task.approvalType === "final_approved"
                                ? "bg-green-100 text-green-800"
                                : task.approvalType === "final_rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {task.department || "DEV"} S-{task.id.slice(-3)}
                          </span>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Ellipsis size={16} className="text-gray-400" />
                          </button>
                        </div>

                        <h4
                          className={`font-medium mb-2 ${
                            task.approvalType === "final_approved"
                              ? "text-green-900"
                              : task.approvalType === "final_rejected"
                              ? "text-red-900"
                              : "text-gray-900"
                          }`}
                        >
                          {task.taskTitle || task.content}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {task.deadLine
                              ? moment(task.deadLine).format("MMM DD")
                              : "No deadline"}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-xs ${
                                task.approvalType === "final_approved"
                                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                  : task.approvalType === "final_rejected"
                                  ? "bg-gradient-to-br from-red-500 to-rose-600"
                                  : "bg-gradient-to-br from-blue-500 to-purple-600"
                              }`}
                            >
                              {task.employeeName
                                ? task.employeeName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "UN"}
                            </div>
                            <span
                              className={`text-sm ${
                                task.approvalType === "final_approved"
                                  ? "text-green-700"
                                  : task.approvalType === "final_rejected"
                                  ? "text-red-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {task.employeeName || "Unknown"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: handlePriorityBg(
                                  task.priority || "Normal"
                                ),
                              }}
                            />
                            <span className="text-xs font-medium text-gray-600">
                              {task.priority || "Normal"}
                            </span>
                          </div>
                        </div>

                        {/* Show special approval status message for mobile */}
                        {selectedColumn === "done" &&
                          task.status === "Complete" &&
                          task.approvalType && (
                            <div
                              className={`mt-3 pt-2 border-t text-center text-xs font-medium ${
                                task.approvalType === "final_approved"
                                  ? "border-green-200 text-green-800"
                                  : task.approvalType === "final_rejected"
                                  ? "border-red-200 text-red-800"
                                  : "border-gray-200 text-gray-600"
                              }`}
                            >
                              {task.approvalType === "final_approved"
                                ? "✅ Onboarding Complete"
                                : task.approvalType === "final_rejected"
                                ? "❌ Onboarding Rejected"
                                : "🔄 Processing Complete"}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Forms Modal */}
        {showEmployeeFormsModal && selectedTaskData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedTaskData.employeeName} - Onboarding Forms
                    </h2>
                    <p className="text-gray-600">
                      View all submitted forms for this employee
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEmployeeFormsModal(false);
                      setSelectedTaskData(null);
                      setEmployeeFormsData(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-3xl font-light"
                  >
                    ×
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingForms ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">
                        Loading employee forms...
                      </span>
                    </div>
                  ) : employeeFormsData ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { key: "i9Form", name: "I-9 Form", icon: "🆔" },
                          { key: "w4Form", name: "W-4 Form", icon: "💰" },
                          { key: "w9Form", name: "W-9 Form", icon: "📋" },
                          {
                            key: "emergencyContact",
                            name: "Emergency Contact",
                            icon: "🚨",
                          },
                          {
                            key: "directDeposit",
                            name: "Direct Deposit",
                            icon: "🏦",
                          },
                          {
                            key: "misconductStatement",
                            name: "Misconduct Statement",
                            icon: "⚖️",
                          },
                          {
                            key: "codeOfEthics",
                            name: "Code of Ethics",
                            icon: "📜",
                          },
                          {
                            key: "serviceDeliveryPolicy",
                            name: "Service Delivery Policy",
                            icon: "🔄",
                          },
                          {
                            key: "nonCompeteAgreement",
                            name: "Non-Compete Agreement",
                            icon: "🤝",
                          },
                          {
                            key: "backgroundCheck",
                            name: "Background Check",
                            icon: "🔍",
                          },
                          {
                            key: "tbSymptomScreen",
                            name: "TB Symptom Screen",
                            icon: "🏥",
                          },
                          {
                            key: "orientationChecklist",
                            name: "Orientation Checklist",
                            icon: "✅",
                          },
                          {
                            key: "orientationPresentation",
                            name: "Orientation Presentation",
                            icon: "📊",
                          },
                          {
                            key: "jobDescriptionPCA",
                            name: "PCA Job Description",
                            icon: "👩‍⚕️",
                          },
                          {
                            key: "jobDescriptionCNA",
                            name: "CNA Job Description",
                            icon: "👨‍⚕️",
                          },
                          {
                            key: "jobDescriptionLPN",
                            name: "LPN Job Description",
                            icon: "🩺",
                          },
                          {
                            key: "jobDescriptionRN",
                            name: "RN Job Description",
                            icon: "👩‍⚕️",
                          },
                        ].map((form) => (
                          <div
                            key={form.key}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              employeeFormsData[form.key]
                                ? "border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300"
                                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                            }`}
                            onClick={() => {
                              if (employeeFormsData[form.key]) {
                                handleFormClick(
                                  form.key,
                                  employeeFormsData[form.key]
                                );
                              } else {
                                console.log(
                                  `No data available for ${form.key}`
                                );
                                toast(
                                  `${form.name} has not been submitted yet`
                                );
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{form.icon}</span>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {form.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {employeeFormsData[form.key]
                                    ? "Submitted"
                                    : "Not Submitted"}
                                </p>
                              </div>
                            </div>

                            {employeeFormsData[form.key] && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 text-sm font-medium">
                                    ✓ Complete
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    {employeeFormsData[form.key].status ||
                                      "Submitted"}
                                  </span>
                                </div>

                                {/* Show some key fields from the form */}
                                {form.key === "i9Form" && (
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p>
                                      <strong>Name:</strong>{" "}
                                      {employeeFormsData[form.key].firstName}{" "}
                                      {employeeFormsData[form.key].lastName}
                                    </p>
                                    <p>
                                      <strong>Citizenship:</strong>{" "}
                                      {
                                        employeeFormsData[form.key]
                                          .citizenshipStatus
                                      }
                                    </p>
                                  </div>
                                )}

                                {form.key === "emergencyContact" && (
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p>
                                      <strong>Contact:</strong>{" "}
                                      {employeeFormsData[form.key].contactName}
                                    </p>
                                    <p>
                                      <strong>Relationship:</strong>{" "}
                                      {employeeFormsData[form.key].relationship}
                                    </p>
                                    <p>
                                      <strong>Phone:</strong>{" "}
                                      {employeeFormsData[form.key].phoneNumber}
                                    </p>
                                  </div>
                                )}

                                {/* Job Description Forms Preview */}
                                {(form.key === "jobDescriptionPCA" ||
                                  form.key === "jobDescriptionCNA" ||
                                  form.key === "jobDescriptionLPN" ||
                                  form.key === "jobDescriptionRN") && (
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p>
                                      <strong>Type:</strong>{" "}
                                      {employeeFormsData[form.key]
                                        .jobDescriptionType ||
                                        form.key.replace("jobDescription", "")}
                                    </p>
                                    <p>
                                      <strong>Employee:</strong>{" "}
                                      {employeeFormsData[form.key].employeeInfo
                                        ?.employeeName || "Not specified"}
                                    </p>
                                    {employeeFormsData[form.key].acknowledgment
                                      ?.hasReadJobDescription && (
                                      <p>
                                        <strong>Status:</strong> Acknowledged
                                      </p>
                                    )}
                                  </div>
                                )}

                                {employeeFormsData[form.key].createdAt && (
                                  <p className="text-xs text-gray-500">
                                    Submitted:{" "}
                                    {new Date(
                                      employeeFormsData[form.key].createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                )}

                                <div className="mt-3 pt-3 border-t border-green-200">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFormClick(
                                        form.key,
                                        employeeFormsData[form.key]
                                      );
                                    }}
                                    className="w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                                  >
                                    <FileText size={14} />
                                    View Form Details
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <p className="text-gray-500">
                          Failed to load employee forms
                        </p>
                        <button
                          onClick={() =>
                            fetchEmployeeForms(selectedTaskData.employeeEmail)
                          }
                          className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-t border-gray-200 bg-gray-50">
                  {/* Final Approval/Rejection Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {selectedTaskData &&
                      selectedTaskData.status !== "Complete" && (
                        <>
                          <button
                            onClick={handleFinalApproval}
                            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">🎉</span>
                            <span>FINAL APPROVAL</span>
                          </button>
                          <button
                            onClick={handleFinalRejection}
                            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">❌</span>
                            <span>FINAL REJECT</span>
                          </button>
                        </>
                      )}

                    {selectedTaskData &&
                      selectedTaskData.status === "Complete" && (
                        <div className="flex-1 text-center py-3 px-6 bg-blue-50 border border-blue-200 rounded-lg">
                          <span className="text-blue-800 font-medium">
                            {selectedTaskData.approvalType === "final_approved"
                              ? "🎉 FINALLY APPROVED"
                              : selectedTaskData.approvalType ===
                                "final_rejected"
                              ? "❌ FINALLY REJECTED"
                              : "✅ COMPLETED"}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setShowEmployeeFormsModal(false);
                      setSelectedTaskData(null);
                      setEmployeeFormsData(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Application View Modal (similar to HrDashboard) */}
        {showDetailModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedApplication.employeeName}'s Application
                    </h2>
                    <p className="text-gray-600">
                      {selectedApplication.employeeEmail}
                    </p>
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
                    {/* Forms List - Organized by sections */}
                    <div className="space-y-6">
                      {/* PART 1 - Personal Information */}
                      <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                        <h3 className="font-bold text-blue-900 mb-4">
                          PART 1: Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              key: "personalInformation",
                              name: "1. Personal Information",
                              icon: "👤",
                            },
                            {
                              key: "education",
                              name: "2. Education",
                              icon: "🎓",
                            },
                            {
                              key: "references",
                              name: "3. References",
                              icon: "📞",
                            },
                            {
                              key: "workExperience",
                              name: "4. Previous Employment",
                              icon: "🏢",
                            },
                            {
                              key: "professionalExperience",
                              name: "5. Military Service",
                              icon: "💼",
                            },
                            {
                              key: "legalDisclosures",
                              name: "6. Disclaimer and Signature",
                              icon: "⚖️",
                            },
                          ].map((form) => (
                            <div
                              key={form.key}
                              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                applicationForms[form.key]
                                  ? "border-green-200 bg-green-50 hover:bg-green-100"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                              onClick={() => {
                                if (applicationForms[form.key]) {
                                  handleViewFormDetail(form.key, form.name);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{form.icon}</span>
                                  <div>
                                    <h5 className="font-medium">{form.name}</h5>
                                    <p className="text-sm text-gray-600">
                                      {applicationForms[form.key]
                                        ? "Submitted"
                                        : "Not Submitted"}
                                    </p>
                                  </div>
                                </div>
                                {applicationForms[form.key] && (
                                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PART 2 - Documents to Submit */}
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                        <h3 className="font-bold text-green-900 mb-4">
                          PART 2: Documents to Submit (15 Forms)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              key: "jobDescriptionPCA",
                              name: "1. Job Description",
                              icon: "📋",
                            },
                            {
                              key: "codeOfEthics",
                              name: "2. Code of Ethics",
                              icon: "📜",
                            },
                            {
                              key: "serviceDeliveryPolicies",
                              name: "3. Service Delivery",
                              icon: "🔄",
                            },
                            {
                              key: "nonCompeteAgreement",
                              name: "4. Non-Compete",
                              icon: "🤝",
                            },
                            {
                              key: "emergencyContact",
                              name: "5. Emergency Contact",
                              icon: "🚨",
                            },
                            {
                              key: "employeeDetailsUpload",
                              name: "6. Professional Certificate(s)",
                              icon: "📄",
                            },
                            {
                              key: "backgroundCheck",
                              name: "7. CPR/First Aid Certificate",
                              icon: "🏥",
                            },
                            {
                              key: "drivingLicense",
                              name: "8. Government ID",
                              icon: "🚗",
                            },
                            {
                              key: "backgroundCheck",
                              name: "9. Background Check",
                              icon: "🔍",
                            },
                            {
                              key: "misconductStatement",
                              name: "10. Staff Misconduct",
                              icon: "⚠️",
                            },
                            {
                              key: "tbSymptomScreen",
                              name: "11. TB or X-Ray Form",
                              icon: "🏥",
                            },
                            { key: "i9Form", name: "12. I-9 Form", icon: "🆔" },
                            { key: "w4Form", name: "13. W-4 Form", icon: "💰" },
                            { key: "w9Form", name: "14. W-9 Form", icon: "📊" },
                            {
                              key: "directDeposit",
                              name: "15. Direct Deposit",
                              icon: "🏦",
                            },
                          ].map((form) => (
                            <div
                              key={form.key}
                              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                applicationForms[form.key]
                                  ? "border-green-200 bg-green-50 hover:bg-green-100"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                              onClick={() => {
                                if (applicationForms[form.key]) {
                                  handleViewFormDetail(form.key, form.name);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{form.icon}</span>
                                  <div>
                                    <h5 className="font-medium">{form.name}</h5>
                                    <p className="text-sm text-gray-600">
                                      {applicationForms[form.key]
                                        ? "Submitted"
                                        : "Not Submitted"}
                                    </p>
                                  </div>
                                </div>
                                {applicationForms[form.key] && (
                                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* PART 3 - Orientation Documentation */}
                      <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                        <h3 className="font-bold text-purple-900 mb-4">
                          PART 3: Orientation Documentation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            {
                              key: "orientationPresentation",
                              name: "1. Orientation Presentation",
                              icon: "📊",
                            },
                            {
                              key: "orientationChecklist",
                              name: "2. Orientation Checklist",
                              icon: "✅",
                            },
                          ].map((form) => (
                            <div
                              key={form.key}
                              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                applicationForms[form.key]
                                  ? "border-green-200 bg-green-50 hover:bg-green-100"
                                  : "border-gray-200 bg-gray-50"
                              }`}
                              onClick={() => {
                                if (applicationForms[form.key]) {
                                  handleViewFormDetail(form.key, form.name);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{form.icon}</span>
                                  <div>
                                    <h5 className="font-medium">{form.name}</h5>
                                    <p className="text-sm text-gray-600">
                                      {applicationForms[form.key]
                                        ? "Submitted"
                                        : "Not Submitted"}
                                    </p>
                                  </div>
                                </div>
                                {applicationForms[form.key] && (
                                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* HR Notes Section */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300">
                      <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        HR Notes to Employee
                      </h3>
                      <div className="space-y-4">
                        <textarea
                          value={hrNoteToEmployee}
                          onChange={(e) => setHrNoteToEmployee(e.target.value)}
                          placeholder="Enter your note to the employee..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        />
                        <button
                          onClick={() =>
                            handleSendHrNoteToEmployee(
                              selectedApplication.applicationId
                            )
                          }
                          disabled={!hrNoteToEmployee.trim() || isSendingNote}
                          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                        >
                          {isSendingNote ? "Sending..." : "Send Note"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Loading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Final Decision Modal - appears when dragging to Complete */}
        {showFinalDecisionModal && pendingDrop && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-3">
                Final decision required
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You moved "
                {pendingDrop.item.taskTitle || pendingDrop.item.content}" to
                Complete. Please choose to finally approve or reject this
                onboarding. Without a final decision the task cannot be moved to
                Complete.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    // Final approve
                    try {
                      const taskId =
                        pendingDrop.item.taskId || pendingDrop.item.id;
                      const resp = await apiClient.put(
                        `/hr/kanban/update-task-status/${taskId}`,
                        { status: "Complete", approvalType: "final_approved" }
                      );

                      if (resp.data && resp.data.success) {
                        toast.success("🎉 Task finally approved");
                        // Move locally
                        const updateColumns = { ...columns };
                        updateColumns[pendingDrop.sourceColumnId].tasks =
                          updateColumns[
                            pendingDrop.sourceColumnId
                          ].tasks.filter((t) => t.id !== pendingDrop.item.id);
                        updateColumns[pendingDrop.targetColumnId].tasks.push({
                          ...pendingDrop.item,
                          status: pendingDrop.newStatus,
                          approvalType: "final_approved",
                        });
                        setColumns(updateColumns);
                      } else {
                        toast.error("Failed to finally approve");
                      }
                    } catch (err) {
                      console.error("Error final approving:", err);
                      toast.error("Error final approving");
                    } finally {
                      setShowFinalDecisionModal(false);
                      setPendingDrop(null);
                      setDraggedItem(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
                >
                  Final Approve
                </button>

                <button
                  onClick={async () => {
                    // Final reject
                    const reason = window.prompt(
                      "Please provide a reason for rejection:",
                      ""
                    );
                    if (!reason) {
                      toast("Rejection cancelled - no reason provided");
                      return;
                    }

                    try {
                      const taskId =
                        pendingDrop.item.taskId || pendingDrop.item.id;
                      const resp = await apiClient.put(
                        `/hr/kanban/update-task-status/${taskId}`,
                        {
                          status: "Complete",
                          approvalType: "final_rejected",
                          reviewComments: `Rejected: ${reason}`,
                        }
                      );

                      if (resp.data && resp.data.success) {
                        toast.success("❌ Task rejected");
                        // Move locally with rejection flag
                        const updateColumns = { ...columns };
                        updateColumns[pendingDrop.sourceColumnId].tasks =
                          updateColumns[
                            pendingDrop.sourceColumnId
                          ].tasks.filter((t) => t.id !== pendingDrop.item.id);
                        updateColumns[pendingDrop.targetColumnId].tasks.push({
                          ...pendingDrop.item,
                          status: pendingDrop.newStatus,
                          approvalType: "final_rejected",
                        });
                        setColumns(updateColumns);
                      } else {
                        toast.error("Failed to reject");
                      }
                    } catch (err) {
                      console.error("Error final rejecting:", err);
                      toast.error("Error final rejecting");
                    } finally {
                      setShowFinalDecisionModal(false);
                      setPendingDrop(null);
                      setDraggedItem(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium"
                >
                  Final Reject
                </button>

                <button
                  onClick={() => {
                    // Cancel - revert local drag
                    const updateColumns = { ...columns };
                    setShowFinalDecisionModal(false);
                    setPendingDrop(null);
                    setDraggedItem(null);
                    toast(
                      "Move cancelled - final decision required to complete"
                    );
                  }}
                  className="px-3 py-2 bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};
