import { toast } from "react-toastify";
import axios from "axios";

// Shared utility functions for task management across HR components

/**
 * Accept a task and add it to the kanban board
 * @param {Object} taskData - The task/candidate data to accept
 * @param {string} baseURL - The API base URL
 * @returns {Promise<boolean>} - Success status
 */
export const acceptTask = async (taskData, baseURL = null) => {
  try {
    // Create task object for kanban board
    const newKanbanTask = {
      id: `task_${taskData.id || taskData._id}_${Date.now()}`,
      content: taskData.task || taskData.taskTitle,
      taskTitle: taskData.task || taskData.taskTitle,
      employeeName: taskData.name || taskData.employeeName,
      deadLine: taskData.deadLine || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: taskData.priority || "Medium",
      status: "todo", // Start in todo column
      department: taskData.department || "General",
      position: taskData.position || "Employee",
      createdAt: taskData.createdAt || new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      taskType: taskData.taskType || "General"
    };

    // Store in localStorage to be picked up by task-management
    const existingKanbanTasks = JSON.parse(
      localStorage.getItem("kanbanTasks") || "[]"
    );
    const updatedKanbanTasks = [...existingKanbanTasks, newKanbanTask];
    localStorage.setItem("kanbanTasks", JSON.stringify(updatedKanbanTasks));

    // Store accepted tasks globally for cross-component consistency
    const acceptedTasks = JSON.parse(localStorage.getItem("acceptedTasks") || "[]");
    const acceptedTaskData = { 
      ...taskData, 
      status: "Accepted", 
      acceptedAt: new Date().toISOString(),
      kanbanTaskId: newKanbanTask.id
    };
    const updatedAcceptedTasks = [...acceptedTasks, acceptedTaskData];
    localStorage.setItem("acceptedTasks", JSON.stringify(updatedAcceptedTasks));

    toast.success(
      `Task for ${taskData.name || taskData.employeeName} has been accepted and added to task management`
    );

    // Try to sync with backend if available
    if (baseURL) {
      try {
        await axios.post(`${baseURL}/task/accept-task`, {
          candidateId: taskData.id || taskData._id,
          taskData: newKanbanTask
        });
      } catch (apiError) {
        console.log("Backend sync failed, but task saved locally:", apiError);
      }
    }

    return true;
  } catch (error) {
    console.error("Error accepting task:", error);
    toast.error("Failed to accept task. Please try again.");
    return false;
  }
};

/**
 * Reject a task and remove it from all systems
 * @param {string|number} taskId - The task ID to reject
 * @param {Object} taskData - The full task data (optional)
 * @param {string} baseURL - The API base URL
 * @returns {Promise<boolean>} - Success status
 */
export const rejectTask = async (taskId, taskData = null, baseURL = null) => {
  try {
    // Remove from kanban localStorage if it exists
    const existingKanbanTasks = JSON.parse(
      localStorage.getItem("kanbanTasks") || "[]"
    );
    const filteredKanbanTasks = existingKanbanTasks.filter(
      (task) => !task.id.includes(`task_${taskId}_`)
    );
    localStorage.setItem("kanbanTasks", JSON.stringify(filteredKanbanTasks));

    // Store rejected tasks for cross-component consistency
    const rejectedTasks = JSON.parse(localStorage.getItem("rejectedTasks") || "[]");
    const rejectedTaskData = { 
      ...taskData, 
      id: taskId,
      status: "Rejected", 
      rejectedAt: new Date().toISOString()
    };
    const updatedRejectedTasks = [...rejectedTasks, rejectedTaskData];
    localStorage.setItem("rejectedTasks", JSON.stringify(updatedRejectedTasks));

    toast.success(
      `Task${taskData?.name || taskData?.employeeName ? ` for ${taskData.name || taskData.employeeName}` : ''} has been rejected`
    );

    // Try to sync with backend if available
    if (baseURL) {
      try {
        await axios.post(`${baseURL}/task/reject-task`, {
          candidateId: taskId
        });
      } catch (apiError) {
        console.log("Backend sync failed, but task rejected locally:", apiError);
      }
    }

    return true;
  } catch (error) {
    console.error("Error rejecting task:", error);
    toast.error("Failed to reject task. Please try again.");
    return false;
  }
};

/**
 * Get all accepted tasks from localStorage
 * @returns {Array} - Array of accepted tasks
 */
export const getAcceptedTasks = () => {
  return JSON.parse(localStorage.getItem("acceptedTasks") || "[]");
};

/**
 * Get all rejected tasks from localStorage
 * @returns {Array} - Array of rejected tasks
 */
export const getRejectedTasks = () => {
  return JSON.parse(localStorage.getItem("rejectedTasks") || "[]");
};

/**
 * Get all kanban tasks from localStorage
 * @returns {Array} - Array of kanban tasks
 */
export const getKanbanTasks = () => {
  return JSON.parse(localStorage.getItem("kanbanTasks") || "[]");
};

/**
 * Check if a task has been accepted
 * @param {string|number} taskId - The task ID to check
 * @returns {boolean} - Whether the task has been accepted
 */
export const isTaskAccepted = (taskId) => {
  const acceptedTasks = getAcceptedTasks();
  return acceptedTasks.some(task => (task.id || task._id) === taskId);
};

/**
 * Check if a task has been rejected
 * @param {string|number} taskId - The task ID to check
 * @returns {boolean} - Whether the task has been rejected
 */
export const isTaskRejected = (taskId) => {
  const rejectedTasks = getRejectedTasks();
  return rejectedTasks.some(task => (task.id || task._id) === taskId);
};

/**
 * Update task status across all systems
 * @param {string|number} taskId - The task ID
 * @param {string} status - The new status
 * @param {Object} taskData - The task data
 * @param {string} baseURL - The API base URL
 * @returns {Promise<boolean>} - Success status
 */
export const updateTaskStatus = async (taskId, status, taskData, baseURL = null) => {
  try {
    if (status === "Complete" || status === "Accepted") {
      return await acceptTask(taskData, baseURL);
    } else if (status === "Reject" || status === "Rejected") {
      return await rejectTask(taskId, taskData, baseURL);
    } else {
      // For other statuses, just update kanban if the task exists there
      const kanbanTasks = getKanbanTasks();
      const updatedKanbanTasks = kanbanTasks.map(task => {
        if (task.id.includes(`task_${taskId}_`)) {
          return { ...task, status: status.toLowerCase() };
        }
        return task;
      });
      localStorage.setItem("kanbanTasks", JSON.stringify(updatedKanbanTasks));
      
      // Try API update
      if (baseURL) {
        try {
          await axios.put(`${baseURL}/task/update-task`, {
            taskId,
            taskStatus: status,
          });
        } catch (apiError) {
          console.log("Backend sync failed, but task updated locally:", apiError);
        }
      }
      
      toast.success("Task status updated successfully");
      return true;
    }
  } catch (error) {
    console.error("Error updating task status:", error);
    toast.error("Failed to update task status");
    return false;
  }
};
