import React, { useEffect, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import PersonImg1 from "../../assets/PersonImg1.png";
import { X, Menu } from "lucide-react";
import axios from "axios";

export const MonitorSystem = () => {
  const baseURL = import.meta.env.VITE__BASEURL;
  const navigate = useNavigate();
  const [employee, setEmployee] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [taskManagementModalOpen, setTaskManagementModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = windowWidth < 768 ? 3 : 4;
  const [topPerformersModalOpen, setTopPerformersModalOpen] = useState(false);
  const [inactiveUsersModalOpen, setInactiveUsersModalOpen] = useState(false);
  const [addPerformerModalOpen, setAddPerformerModalOpen] = useState(false);
  const [selectedPerformerType, setSelectedPerformerType] = useState("top");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [topPerformers, setTopPerformers] = useState([
    { id: 1, name: "Andrew Tate", tasksCompleted: 344, avgTime: "8:03", image: PersonImg1 },
    { id: 2, name: "Emily Chen", tasksCompleted: 312, avgTime: "7:45", image: PersonImg1 },
    { id: 3, name: "Michael Jordan", tasksCompleted: 298, avgTime: "8:15", image: PersonImg1 },
    { id: 4, name: "Sarah Johnson", tasksCompleted: 287, avgTime: "7:58", image: PersonImg1 },
    { id: 5, name: "David Williams", tasksCompleted: 276, avgTime: "8:22", image: PersonImg1 },
    { id: 6, name: "Lisa Anderson", tasksCompleted: 265, avgTime: "8:10", image: PersonImg1 },
    { id: 7, name: "James Brown", tasksCompleted: 254, avgTime: "8:30", image: PersonImg1 },
  ]);

  const [inactiveUsers, setInactiveUsers] = useState([
    { id: 8, name: "Robert Smith", tasksCompleted: 45, avgTime: "12:03", image: PersonImg1 },
    { id: 9, name: "Jennifer Davis", tasksCompleted: 38, avgTime: "13:45", image: PersonImg1 },
  ]);

  const getEmployee = async () => {
    try {
      const response = await axios.get(`${baseURL}/employee/get-all-employee`);
      setEmployee(response.data?.employessList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleDeletePerformer = (id, type) => {
    if (type === "top") {
      setTopPerformers(topPerformers.filter(p => p.id !== id));
    } else {
      setInactiveUsers(inactiveUsers.filter(u => u.id !== id));
    }
  };

  const handleAddPerformer = (employeeData) => {
    const newPerformer = {
      id: Date.now(),
      name: employeeData.userName,
      tasksCompleted: employeeData.tasks?.length || 0,
      avgTime: "0:00",
      image: `${baseURL}/${employeeData.profileImage}` || PersonImg1,
    };
    if (selectedPerformerType === "top") {
      setTopPerformers([...topPerformers, newPerformer]);
    } else {
      setInactiveUsers([...inactiveUsers, newPerformer]);
    }
    setAddPerformerModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employee.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employee.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    getEmployee();
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1280) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-[Poppins] font-[600] text-[#1F3A93]">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const TaskModal = ({ isOpen, onClose, employee }) => {
    if (!isOpen || !employee) return null;

    // Sample tasks data for the selected employee (replace with actual API data if available)
    const tasks = employee.tasks || [
      { id: 1, name: "Complete Project Report", status: "In Progress", dueDate: "2025-08-05", priority: "High" },
      { id: 2, name: "Review Client Proposal", status: "Pending", dueDate: "2025-08-02", priority: "Medium" },
      { id: 3, name: "Update Database", status: "Completed", dueDate: "2025-07-30", priority: "Low" },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-[Poppins] font-[600] text-[#1F3A93]">
              Tasks for {employee.userName}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left font-[Poppins] border-collapse">
              <thead className="bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] border-b-2 border-[#1F3A93]">
                <tr>
                  <th className="px-3 py-2 lg:px-4 lg:py-3 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider border-r border-[#BDC3C7] bg-[#F8F9FA]">Task Name</th>
                  <th className="px-3 py-2 lg:px-4 lg:py-3 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider border-r border-[#BDC3C7] bg-[#F8F9FA]">Status</th>
                  <th className="px-3 py-2 lg:px-4 lg:py-3 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider border-r border-[#BDC3C7] bg-[#F8F9FA]">Due Date</th>
                  <th className="px-3 py-2 lg:px-4 lg:py-3 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider bg-[#F8F9FA]">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {tasks.map((task) => (
                  <tr key={task.id} className="bg-white hover:bg-gradient-to-r hover:from-[#F8F9FF] hover:to-[#F0F4FF] transition-all duration-200 border-b border-[#E5E7EB]">
                    <td className="px-3 py-2 lg:px-4 lg:py-3 border-r border-[#E5E7EB]">{task.name}</td>
                    <td className="px-3 py-2 lg:px-4 lg:py-3 border-r border-[#E5E7EB]">
                      <span className={`px-2 py-1 rounded-full text-xs ${task.status === "Completed" ? "bg-green-100 text-green-700" : task.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 lg:px-4 lg:py-3 border-r border-[#E5E7EB]">{new Date(task.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                    <td className="px-3 py-2 lg:px-4 lg:py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${task.priority === "High" ? "bg-red-100 text-red-700" : task.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tasks.length === 0 && (
            <p className="text-center text-gray-500 py-4">No tasks available for this employee.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto">
        <Navbar />
        <div className="flex flex-col xl:flex-row justify-between gap-4">
          <div className="flex-1 py-2 px-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-[Poppins] font-[600] text-[#1F3A93] text-lg sm:text-xl lg:text-2xl">
                Monitor Tasks
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-md bg-[#1F3A93] text-white"
              >
                <Menu size={24} />
              </button>
            </div>
            <div className="my-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-[Poppins] font-[600] text-gray-600">
                      Onboarding Process
                    </h3>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Recent updates</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-gray-800">No Issues</p>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 text-sm">+3 updates</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setOnboardingModalOpen(true)}
                    className="w-full py-2 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-sm hover:bg-[#153073] transition-colors"
                  >
                    View Details
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-[Poppins] font-[600] text-gray-600">
                      Task Management
                    </h3>
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Updates pending</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-gray-800">3 Issues</p>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 text-sm">-3 updates</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setTaskManagementModalOpen(true)}
                    className="w-full py-2 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-sm hover:bg-[#153073] transition-colors"
                  >
                    View Tasks
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-[Poppins] font-[600] text-gray-600">
                      Document Management
                    </h3>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Recent updates</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-2xl font-bold text-red-600">Critical Issue</p>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 text-sm">+3 updates</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDocumentModalOpen(true)}
                    className="w-full py-2 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-sm hover:bg-[#153073] transition-colors"
                  >
                    View Documents
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full bg-white border border-[#BDC3C7] rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#1F3A93] to-[#2E4BC6] border-b border-[#BDC3C7]">
                <h3 className="text-white font-[Poppins] font-[600] text-base sm:text-lg flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="white" />
                    <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22H21.0902C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="white" />
                  </svg>
                  Employee Task Overview
                </h3>
                <p className="text-blue-100 font-[Poppins] text-xs sm:text-sm mt-1">
                  Recent employee activity and task assignments
                </p>
              </div>
              <div className="block sm:hidden">
                {currentEmployees.map((employee, index) => (
                  <div key={employee._id || index} className="p-4 border-b border-[#E5E7EB] hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-[#1F3A93] to-[#2E4BC6] p-0.5">
                            <div className="w-full h-full overflow-hidden rounded-full bg-white p-0.5">
                              <img
                                className="object-cover w-full h-full rounded-full"
                                src={`${baseURL}/${employee.profileImage}`}
                                alt={employee.userName}
                                onError={(e) => { e.target.src = PersonImg1; }}
                              />
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-[#1F2937] font-[600] text-sm">{employee.userName}</p>
                          <p className="text-[#6B7280] font-[400] text-xs">ID: {employee._id?.slice(-6) || `EMP${index + 1}`}</p>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${employee.tasks.length > 5 ? "bg-red-500" : employee.tasks.length > 2 ? "bg-yellow-500" : "bg-green-500"}`}>
                        {employee.tasks.length}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
                          <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[#6B7280]">{new Date(employee.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.31623C10.8618 8.72457 10.6797 9.17726 10.2703 9.38852L7.96701 10.5417C9.06925 12.6315 11.3685 14.9308 13.4583 16.033L14.6115 13.7297C14.8227 13.3203 15.2754 13.1382 15.6838 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"/>
                        </svg>
                        <a href={`tel:${employee.phoneNumber}`} className="text-[#10B981]">{employee.phoneNumber}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <a href={`mailto:${employee.email}`} className="text-[#3B82F6] truncate">{employee.email}</a>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setTaskModalOpen(true);
                      }}
                      className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-[#1F3A93] to-[#2E4BC6] text-white font-[Poppins] font-[500] text-sm rounded-md hover:from-[#153073] hover:to-[#1E40AF] transition-all duration-200"
                    >
                      View Tasks
                    </button>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block relative overflow-x-auto">
                <table className="w-full text-sm text-left font-[Poppins] border-collapse">
                  <thead className="bg-gradient-to-r from-[#F8F9FA] to-[#E9ECEF] border-b-2 border-[#1F3A93]">
                    <tr>
                      <th className="px-3 py-3 lg:px-6 lg:py-4 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider border-r border-[#BDC3C7] bg-[#F8F9FA]">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#1F3A93" />
                            <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22H21.0902C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="#1F3A93" />
                          </svg>
                          <span className="hidden md:inline">User Name</span>
                          <span className="md:hidden">User</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 lg:px-6 lg:py-4 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider border-r border-[#BDC3C7] bg-[#F8F9FA]">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#1F3A93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="hidden md:inline">Tasks Assigned</span>
                          <span className="md:hidden">Tasks</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 lg:px-6 lg:py-4 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider border-r border-[#BDC3C7] bg-[#F8F9FA]">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#1F3A93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="hidden md:inline">Date of Birth</span>
                          <span className="md:hidden">DOB</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 lg:px-6 lg:py-4 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider border-r border-[#BDC3C7] bg-[#F8F9FA]">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.31623C10.8618 8.72457 10.6797 9.17726 10.2703 9.38852L7.96701 10.5417C9.06925 12.6315 11.3685 14.9308 13.4583 16.033L14.6115 13.7297C14.8227 13.3203 15.2754 13.1382 15.6838 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" fill="#1F3A93" />
                          </svg>
                          <span className="hidden md:inline">Contact Details</span>
                          <span className="md:hidden">Contact</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 lg:px-6 lg:py-4 text-[#1F3A93] font-[600] text-xs lg:text-sm uppercase tracking-wider bg-[#F8F9FA]">
                        <div className="flex items-center gap-2">Action</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {currentEmployees.map((employee, index) => (
                      <tr key={employee._id || index} className="bg-white hover:bg-gradient-to-r hover:from-[#F8F9FF] hover:to-[#F0F4FF] transition-all duration-200 border-b border-[#E5E7EB]">
                        <td className="px-3 py-3 lg:px-6 lg:py-4 border-r border-[#E5E7EB]">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 overflow-hidden rounded-full bg-gradient-to-br from-[#1F3A93] to-[#2E4BC6] p-0.5">
                                <div className="w-full h-full overflow-hidden rounded-full bg-white p-0.5">
                                  <img
                                    className="object-cover w-full h-full rounded-full"
                                    src={`${baseURL}/${employee.profileImage}`}
                                    alt={employee.userName}
                                    onError={(e) => { e.target.src = PersonImg1; }}
                                  />
                                </div>
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                              <p className="text-[#1F2937] font-[600] text-xs lg:text-sm">{employee.userName}</p>
                              <p className="text-[#6B7280] font-[400] text-xs">ID: {employee._id?.slice(-6) || `EMP${index + 1}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 lg:px-6 lg:py-4 border-r border-[#E5E7EB]">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs lg:text-sm ${employee.tasks.length > 5 ? "bg-red-500" : employee.tasks.length > 2 ? "bg-yellow-500" : "bg-green-500"}`}>
                                {employee.tasks.length}
                              </div>
                            </div>
                            <div>
                              <p className="text-[#1F2937] font-[600] text-xs lg:text-sm">{employee.tasks.length} tasks</p>
                              <p className="text-[#6B7280] font-[400] text-xs">
                                {employee.tasks.length > 5 ? "High Load" : employee.tasks.length > 2 ? "Medium Load" : "Light Load"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 lg:px-6 lg:py-4 border-r border-[#E5E7EB]">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div>
                              <p className="text-[#1F2937] font-[500] text-xs lg:text-sm">{new Date(employee.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                              <p className="text-[#6B7280] font-[400] text-xs">Age: {new Date().getFullYear() - new Date(employee.dateOfBirth).getFullYear()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 lg:px-6 lg:py-4 border-r border-[#E5E7EB]">
                          <div className="space-y-1 lg:space-y-2">
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none">
                                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.31623C10.8618 8.72457 10.6797 9.17726 10.2703 9.38852L7.96701 10.5417C9.06925 12.6315 11.3685 14.9308 13.4583 16.033L14.6115 13.7297C14.8227 13.3203 15.2754 13.1382 15.6838 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" fill="#10B981" />
                              </svg>
                              <a href={`tel:${employee.phoneNumber}`} className="text-[#10B981] hover:text-[#059669] font-[500] text-xs hover:underline transition-colors">{employee.phoneNumber}</a>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-3 h-3 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22 6L12 13L2 6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <a href={`mailto:${employee.email}`} className="text-[#3B82F6] hover:text-[#1D4ED8] font-[500] text-xs hover:underline transition-colors truncate max-w-[100px] lg:max-w-[150px]">{employee.email}</a>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 lg:px-6 lg:py-4">
                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setTaskModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 lg:gap-2 px-2 py-1 lg:px-3 lg:py-1.5 bg-gradient-to-r from-[#1F3A93] to-[#2E4BC6] text-white font-[Poppins] font-[500] text-xs rounded-md hover:from-[#153073] hover:to-[#1E40AF] transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2" />
                            </svg>
                            <span className="hidden sm:inline">View Tasks</span>
                            <span className="sm:hidden">View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-[#F8F9FA] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#6B7280] font-[Poppins] text-xs sm:text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Showing {currentEmployees.length} of {employee.length} employees
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="px-2 py-1 sm:px-3 sm:py-2 text-[#6B7280] hover:text-[#1F3A93] hover:bg-white rounded-md transition-all duration-200 font-[Poppins] text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${currentPage === pageNumber ? "bg-[#1F3A93] text-white" : "text-[#6B7280] hover:bg-white"} rounded-md font-[Poppins] text-xs sm:text-sm`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 sm:px-3 sm:py-2 text-[#6B7280] hover:text-[#1F3A93] hover:bg-white rounded-md transition-all duration-200 font-[Poppins] text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={`${isMobileMenuOpen ? 'block xl:block' : 'hidden xl:block'} xl:w-[25%] py-2.5 px-3`}>
            {isMobileMenuOpen && (
              <div className="flex justify-between items-center mb-4 xl:hidden">
                <h2 className="font-[Poppins] font-[600] text-[#1F3A93] text-lg">Users</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md bg-[#1F3A93] text-white">
                  <X size={24} />
                </button>
              </div>
            )}
            <div className="bg-white border border-[#cdcdcd] my-4 py-2 px-3 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base">Top Performers</h3>
                <button
                  onClick={() => setTopPerformersModalOpen(true)}
                  className="text-[#1F3A93] hover:bg-[#F7F9FC] p-1 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="my-4 flex flex-col justify-start items-start gap-3">
                {topPerformers.slice(0, 7).map((performer) => (
                  <div key={performer.id} className="flex w-full justify-between items-center p-2 rounded-md border border-[#cdcdcd] hover:border-[#1F3A93] transition-colors group">
                    <div className="flex justify-start items-center gap-2">
                      <div className="w-8 h-8">
                        <img src={performer.image} alt={performer.name} className="w-full h-full rounded-full" />
                      </div>
                      <div>
                        <h2 className="font-[Poppins] font-[600] text-[#34495E] text-xs sm:text-sm">{performer.name}</h2>
                        <p className="text-[#505050] text-xs font-[Poppins] font-[500]">Tasks: {performer.tasksCompleted}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                      <p className="font-[Poppins] font-[500] text-black text-xs sm:text-sm">{performer.avgTime}</p>
                      <p className="font-[Poppins] font-[500] text-black text-xs">Avg time</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base">Inactive users</h3>
                  <button
                    onClick={() => setInactiveUsersModalOpen(true)}
                    className="text-[#1F3A93] hover:bg-[#F7F9FC] p-1 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {inactiveUsers.slice(0, 2).map((user) => (
                  <div key={user.id} className="flex w-full justify-between items-center p-2 rounded-md border border-[#cdcdcd] hover:border-[#1F3A93] transition-colors group">
                    <div className="flex justify-start items-center gap-2">
                      <div className="w-8 h-8">
                        <img src={user.image} alt={user.name} className="w-full h-full rounded-full" />
                      </div>
                      <div>
                        <h2 className="font-[Poppins] font-[600] text-[#34495E] text-xs sm:text-sm">{user.name}</h2>
                        <p className="text-[#505050] text-xs font-[Poppins] font-[500]">Tasks: {user.tasksCompleted}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                      <p className="font-[Poppins] font-[500] text-black text-xs sm:text-sm">{user.avgTime}</p>
                      <p className="font-[Poppins] font-[500] text-black text-xs">Avg time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Modal isOpen={topPerformersModalOpen} onClose={() => setTopPerformersModalOpen(false)} title="Manage Top Performers">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <p className="text-xs sm:text-sm text-gray-600">Manage your top performing employees</p>
              <button
                onClick={() => {
                  setSelectedPerformerType("top");
                  setAddPerformerModalOpen(true);
                  setTopPerformersModalOpen(false);
                }}
                className="px-3 py-2 sm:px-4 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-xs sm:text-sm hover:bg-[#153073] transition-colors"
              >
                Add Performer
              </button>
            </div>
            <div className="space-y-3 max-h-72 sm:max-h-96 overflow-y-auto">
              {topPerformers.map((performer) => (
                <div key={performer.id} className="flex justify-between items-center p-3 border border-[#BDC3C7] rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={performer.image} alt={performer.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                    <div>
                      <h4 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base">{performer.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Tasks: {performer.tasksCompleted} | Avg Time: {performer.avgTime}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePerformer(performer.id, "top")}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
        <Modal isOpen={inactiveUsersModalOpen} onClose={() => setInactiveUsersModalOpen(false)} title="Manage Inactive Users">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <p className="text-xs sm:text-sm text-gray-600">Manage inactive users</p>
              <button
                onClick={() => {
                  setSelectedPerformerType("inactive");
                  setAddPerformerModalOpen(true);
                  setInactiveUsersModalOpen(false);
                }}
                className="px-3 py-2 sm:px-4 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-xs sm:text-sm hover:bg-[#153073] transition-colors"
              >
                Add User
              </button>
            </div>
            <div className="space-y-3 max-h-72 sm:max-h-96 overflow-y-auto">
              {inactiveUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center p-3 border border-[#BDC3C7] rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={user.image} alt={user.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                    <div>
                      <h4 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base">{user.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Tasks: {user.tasksCompleted} | Avg Time: {user.avgTime}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePerformer(user.id, "inactive")}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
        <Modal isOpen={addPerformerModalOpen} onClose={() => setAddPerformerModalOpen(false)} title={`Add ${selectedPerformerType === "top" ? "Top Performer" : "Inactive User"}`}>
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-gray-600">
              Select an employee to add as a {selectedPerformerType === "top" ? "top performer" : "inactive user"}
            </p>
            <div className="space-y-3 max-h-72 sm:max-h-96 overflow-y-auto">
              {employee.map((emp) => {
                const isAlreadyAdded = selectedPerformerType === "top"
                  ? topPerformers.some(p => p.name === emp.userName)
                  : inactiveUsers.some(u => u.name === emp.userName);
                if (isAlreadyAdded) return null;
                return (
                  <div key={emp._id} className="flex justify-between items-center p-3 border border-[#BDC3C7] rounded-md hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleAddPerformer(emp)}>
                    <div className="flex items-center gap-3">
                      <img
                        src={`${baseURL}/${emp.profileImage}`}
                        alt={emp.userName}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                        onError={(e) => { e.target.src = PersonImg1; }}
                      />
                      <div>
                        <h4 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base">{emp.userName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Tasks: {emp.tasks?.length || 0} | {emp.email}</p>
                      </div>
                    </div>
                    <button className="px-2 py-1 sm:px-3 sm:py-1 bg-[#1F3A93] text-white rounded-md text-xs sm:text-sm hover:bg-[#153073] transition-colors">Add</button>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
        <Modal isOpen={onboardingModalOpen} onClose={() => setOnboardingModalOpen(false)} title="Onboarding Process Details">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-[Poppins] font-[600] text-[#1F3A93] text-base sm:text-lg mb-3">Current Onboarding Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md">
                  <p className="text-xs text-gray-500">Total New Employees</p>
                  <p className="text-xl font-bold text-gray-800">12</p>
                </div>
                <div className="bg-white p-3 rounded-md">
                  <p className="text-xs text-gray-500">Completed This Week</p>
                  <p className="text-xl font-bold text-green-600">8</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base mb-3">Recent Onboarding Activities</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-[500] text-sm">John Doe - IT Department</p>
                    <p className="text-xs text-gray-500">Started: Jan 15, 2024</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Completed</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-[500] text-sm">Jane Smith - Marketing</p>
                    <p className="text-xs text-gray-500">Started: Jan 18, 2024</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">In Progress</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-[500] text-sm">Mike Johnson - Sales</p>
                    <p className="text-xs text-gray-500">Started: Jan 20, 2024</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Pending Documents</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <button className="w-full py-2 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-sm hover:bg-[#153073] transition-colors">Manage Onboarding Process</button>
            </div>
          </div>
        </Modal>
        <Modal isOpen={taskManagementModalOpen} onClose={() => setTaskManagementModalOpen(false)} title="Task Management Overview">
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-[Poppins] font-[600] text-orange-800 text-base sm:text-lg mb-3">Task Distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-md text-center">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-orange-600">24</p>
                </div>
                <div className="bg-white p-3 rounded-md text-center">
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-xl font-bold text-blue-600">18</p>
                </div>
                <div className="bg-white p-3 rounded-md text-center">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-xl font-bold text-green-600">156</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base mb-3">Critical Tasks (Issues)</h4>
              <div className="space-y-2">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-[500] text-sm text-red-800">Database Migration</p>
                      <p className="text-xs text-red-600">Overdue by 2 days</p>
                      <p className="text-xs text-gray-600 mt-1">Assigned to: Tech Team</p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">High Priority</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-[500] text-sm">Client Report Submission</p>
                      <p className="text-xs text-yellow-600">Due in 3 hours</p>
                      <p className="text-xs text-gray-600 mt-1">Assigned to: Sarah Wilson</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Medium Priority</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-[500] text-sm">Security Audit Review</p>
                      <p className="text-xs text-orange-600">Due tomorrow</p>
                      <p className="text-xs text-gray-600 mt-1">Assigned to: Security Team</p>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Medium Priority</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-sm hover:bg-[#153073] transition-colors">View All Tasks</button>
                <button className="py-2 border border-[#1F3A93] text-[#1F3A93] bg-white rounded-md font-[Poppins] text-sm hover:bg-gray-50 transition-colors">Create New Task</button>
              </div>
            </div>
          </div>
        </Modal>
        <Modal isOpen={documentModalOpen} onClose={() => setDocumentModalOpen(false)} title="Document Management System">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-[Poppins] font-[600] text-red-800 text-base sm:text-lg mb-3">Critical Document Issues</h3>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-md">
                  <p className="font-[500] text-sm text-red-700">Compliance Documents Expired</p>
                  <p className="text-xs text-gray-600">3 documents need immediate renewal</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base mb-3">Document Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Total Documents</p>
                  <p className="text-xl font-bold text-gray-800">1,234</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Pending Approval</p>
                  <p className="text-xl font-bold text-orange-600">23</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Recently Updated</p>
                  <p className="text-xl font-bold text-blue-600">45</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Expired</p>
                  <p className="text-xl font-bold text-red-600">3</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-[Poppins] font-[600] text-[#34495E] text-sm sm:text-base mb-3">Recent Document Activity</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                    </svg>
                    <div>
                      <p className="text-xs font-[500]">Employee_Handbook_2024.pdf</p>
                      <p className="text-xs text-gray-500">Updated by Admin</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                    </svg>
                    <div>
                      <p className="text-xs font-[500]">Q4_Financial_Report.xlsx</p>
                      <p className="text-xs text-gray-500">Uploaded by Finance Team</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                    </svg>
                    <div>
                      <p className="text-xs font-[500]">Safety_Protocol_v3.doc</p>
                      <p className="text-xs text-gray-500">Approved by Management</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 bg-[#1F3A93] text-white rounded-md font-[Poppins] text-sm hover:bg-[#153073] transition-colors">Document Library</button>
                <button className="py-2 border border-[#1F3A93] text-[#1F3A93] bg-white rounded-md font-[Poppins] text-sm hover:bg-gray-50 transition-colors">Upload Document</button>
              </div>
            </div>
          </div>
        </Modal>
        <TaskModal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} employee={selectedEmployee} />
      </div>
    </Layout>
  );
};