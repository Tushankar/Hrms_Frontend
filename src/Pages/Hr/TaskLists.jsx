import React, { useEffect, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { Eye, Calendar, User, Clock, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const TaskLists = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const session = Cookies.get("session");
    if (!session) {
      return router("/auth/log-in");
    }
    const userData = jwtDecode(session);
    setUserInfo(userData.user);
  }, []);

  const taskItems = [
    {
      id: 1,
      title: "Employment Application",
      description:
        "Complete and submit the employment application form with all required personal and professional information",
      priority: "High",
      dueDate: "2024-02-15",
      assignee: "Sasanka Roy",
      status: "In Progress",
    },
    {
      id: 2,
      title: "PHS-PCA Job Description",
      description:
        "Review and acknowledge the Personal Care Assistant job description, responsibilities, and requirements",
      priority: "Medium",
      dueDate: "2024-02-10",
      assignee: "Emily Davis",
      status: "Pending",
    },
    {
      id: 3,
      title: "PHS-CNA_Job_Description",
      description:
        "Read and confirm understanding of Certified Nursing Assistant role, duties, and qualifications",
      priority: "High",
      dueDate: "2024-02-20",
      assignee: "Michael Brown",
      status: "Complete",
    },
    {
      id: 4,
      title: "PHS-LPN_Job_Description",
      description:
        "Review Licensed Practical Nurse position details, scope of practice, and job expectations",
      priority: "Medium",
      dueDate: "2024-02-12",
      assignee: "Jessica Wilson",
      status: "In Progress",
    },
    {
      id: 5,
      title: "PHS-RN_Job_Description",
      description:
        "Study Registered Nurse job description, clinical responsibilities, and professional requirements",
      priority: "High",
      dueDate: "2024-02-18",
      assignee: "Alex Rodriguez",
      status: "Pending",
    },
    {
      id: 6,
      title: "PHS-Staff Statement of Misconduct Form",
      description:
        "Complete and sign the staff statement acknowledging policies regarding professional misconduct",
      priority: "High",
      dueDate: "2024-02-14",
      assignee: "Sarah Johnson",
      status: "In Progress",
    },
    {
      id: 7,
      title: "PHS-Code of Ethics",
      description:
        "Review, understand, and acknowledge the company's code of ethics and professional conduct standards",
      priority: "Medium",
      dueDate: "2024-02-16",
      assignee: "David Wilson",
      status: "Pending",
    },
    {
      id: 8,
      title: "PHS-Service Delivery Policies",
      description:
        "Study service delivery policies, procedures, and quality standards for patient care",
      priority: "High",
      dueDate: "2024-02-13",
      assignee: "Lisa Chen",
      status: "Complete",
    },
    {
      id: 9,
      title: "PHS-Non-Compete Agreement",
      description:
        "Read and sign the non-compete agreement outlining post-employment restrictions and obligations",
      priority: "Medium",
      dueDate: "2024-02-17",
      assignee: "Robert Taylor",
      status: "In Progress",
    },
    {
      id: 10,
      title: "PHS_Orientation_Training_Presentation",
      description:
        "Attend and complete the comprehensive orientation training presentation for new employees",
      priority: "High",
      dueDate: "2024-02-21",
      assignee: "Amanda Garcia",
      status: "Pending",
    },
    {
      id: 11,
      title: "PHS-Orientation Checklist",
      description:
        "Complete all items on the orientation checklist to ensure proper onboarding process",
      priority: "Medium",
      dueDate: "2024-02-19",
      assignee: "Mark Anderson",
      status: "Complete",
    },
    {
      id: 12,
      title: "PHS-Background Check Form-Results",
      description:
        "Submit background check form and review results for employment verification purposes",
      priority: "High",
      dueDate: "2024-02-22",
      assignee: "Jennifer Lee",
      status: "Pending",
    },
    {
      id: 13,
      title: "PHS-TB-Symptom Screen Form",
      description:
        "Complete tuberculosis symptom screening form as part of health and safety requirements",
      priority: "Medium",
      dueDate: "2024-02-15",
      assignee: "Kevin Martinez",
      status: "In Progress",
    },
    {
      id: 14,
      title: "PHS-I-9 Form",
      description:
        "Complete Form I-9 for employment eligibility verification and provide required documentation",
      priority: "Low",
      dueDate: "2024-02-20",
      assignee: "Rachel Thompson",
      status: "Complete",
    },
  ];

  const handleViewTask = (taskId) => {
    router("/task-management");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Complete":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </div>
        );
      case "In Progress":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          </div>
        );
      case "Pending":
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Complete":
        return "bg-green-50 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      <Layout>
        <div className="w-full h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 bg-gray-50 overflow-hidden">
            <div className="h-full p-3 sm:p-4 lg:p-6 overflow-auto">
              {/* Task Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {taskItems.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border border-gray-200/60 p-6 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <span className="text-xs text-gray-500 font-medium">
                            TASK-{task.id.toString().padStart(3, "0")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Task Content */}
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 text-base mb-2 leading-tight">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    {/* Task Meta */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleViewTask(task.id)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {/* Empty State - if no tasks */}
              {taskItems.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tasks found
                    </h3>
                    <p className="text-gray-500">
                      Tasks will appear here when they are created
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TaskLists;
