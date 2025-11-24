import React, { useEffect, useRef, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { 
  ArrowUpDown, 
  Ellipsis, 
  Search, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  UserPlus, 
  Edit, 
  Trash2, 
  ClipboardList,
  BriefcaseIcon,
  Calendar,
  Phone,
  Mail,
  Activity,
  MoreVertical,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";

export const UserManagement = () => {
  const baseURL = import.meta.env.VITE__BASEURL;
  const navigate = useNavigate();
  const [employee, setEmployee] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEmployeeTasksModal, setShowEmployeeTasksModal] = useState(false);
  const [selectedEmployeeTasks, setSelectedEmployeeTasks] = useState(null);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const router = useNavigate();

  const getEmployee = async () => {
    try {
      const response = await axios.get(`${baseURL}/employee/get-all-employee`);
      setEmployee(response.data?.employessList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };
  
  console.log(employee);
  
  useEffect(() => {
    getEmployee();
  }, []);
  
  const [filter, setFilter] = useState("All users");

  // Filter users based on role and search term
  const filteredUsers = employee.filter((user) => {
    const matchesRole = filter === "All users" || user.userRole === filter;
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const updateUserField = async (userId, updatedData) => {
    try {
      await axios.put(`${baseURL}/auth/update`, {
        userId,
        ...updatedData,
      });
      getEmployee();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${baseURL}/employee/delete/${userId}`);
        getEmployee();
        if (currentEmployee?._id === userId) {
          setCurrentEmployee(null);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Handle clicking outside to close action menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu')) {
        setShowActionMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showEmployeeDetailsModal || showTaskModal || showEmployeeTasksModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showEmployeeDetailsModal, showTaskModal, showEmployeeTasksModal]);

  const getStatusColor = (status) => {
    return status === "active" 
      ? "bg-green-100 text-green-700 border-green-200" 
      : "bg-red-100 text-red-700 border-red-200";
  };

  const getRoleColor = (role) => {
    switch(role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "hr":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "employee":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleEmployeeClick = (employee) => {
    setCurrentEmployee(employee);
    setShowEmployeeDetailsModal(true);
  };

  return (
    <>
      <Layout>
        <div className="w-full h-full bg-gray-50">
          <Navbar />
          
          <div className="flex flex-col">
            {/* Main Content */}
            <div className="flex-1 p-4 md:p-6">
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-[Poppins] font-[700] text-[#1F3A93] text-xl md:text-2xl">
                    User Management
                  </h2>
                </div>
                <p className="text-gray-600 font-[Poppins] text-sm md:text-base">
                  Manage and oversee all user accounts
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden w-full bg-white border border-gray-200 rounded-lg p-3 mb-4 flex items-center justify-between"
              >
                <span className="font-[Poppins] font-[500] text-gray-700">Filters & Search</span>
                <SlidersHorizontal size={20} className="text-gray-500" />
              </button>

              {/* Filter and Search Section */}
              <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 ${
                showMobileFilters ? 'block' : 'hidden md:block'
              }`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                    <select
                      onChange={(e) => setFilter(e.target.value)}
                      className="bg-gray-50 px-4 py-2.5 rounded-lg font-[Poppins] font-[500] text-gray-700 border border-gray-200 outline-none focus:border-[#1F3A93] transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      <option value="All users">All users</option>
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="bg-[#1F3A93] text-white rounded-lg px-4 py-2 font-[Poppins] font-[600] text-center">
                      {filteredUsers.length} Users
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-[Poppins] outline-none focus:border-[#1F3A93] focus:bg-white transition-all"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Employee Button */}
              <div className="mb-4">
                <button
                  onClick={() => navigate("/admin/create-employee")}
                  className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-6 py-3 rounded-xl text-sm md:text-base font-[Poppins] font-[600] transition-colors shadow-md flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <UserPlus size={18} />
                  Create Employee
                </button>
              </div>

              {/* User Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-300">
                      <tr>
                        <th className="px-6 py-4 text-left border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-500" />
                            <span className="font-[Poppins] font-[600] text-sm text-gray-700">Employee Name</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <BriefcaseIcon size={16} className="text-gray-500" />
                            <span className="font-[Poppins] font-[600] text-sm text-gray-700">Role</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="font-[Poppins] font-[600] text-sm text-gray-700">Date of Birth</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-500" />
                            <span className="font-[Poppins] font-[600] text-sm text-gray-700">Contact</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <Activity size={16} className="text-gray-500" />
                            <span className="font-[Poppins] font-[600] text-sm text-gray-700">Status</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <MoreVertical size={16} className="text-gray-500" />
                            <span className="font-[Poppins] font-[600] text-sm text-gray-700">Actions</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentItems.map((employee) => (
                        <tr
                          key={employee._id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            if (!e.target.closest('select') && !e.target.closest('button') && !e.target.closest('a') && !e.target.closest('.action-menu')) {
                              handleEmployeeClick(employee);
                            }
                          }}
                        >
                          <td className="px-6 py-4 border-r border-gray-200">
                            <div className="flex items-center gap-3">
                              <Avatar sx={{ width: 40, height: 40 }}>
                                {employee.userName.charAt(0).toUpperCase()}
                              </Avatar>
                              <div>
                                <p className="font-[Poppins] font-[500] text-gray-900">
                                  {employee.userName}
                                </p>
                                <p className="font-[Poppins] text-sm text-gray-500">
                                  ID: {employee._id.slice(-6).toUpperCase()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <select
                              className={`px-3 py-1.5 rounded-full border text-sm font-[Poppins] font-[500] outline-none cursor-pointer transition-all ${getRoleColor(employee.userRole)}`}
                              value={employee.userRole}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateUserField(employee._id, {
                                  userRole: e.target.value,
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="employee">Employee</option>
                              <option value="hr">HR</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <span className="font-[Poppins] text-gray-700">
                              {new Date(employee.dateOfBirth).toLocaleDateString("en-GB")}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <div className="flex flex-col gap-1">
                              <Link
                                to={`tel:${employee.phoneNumber}`}
                                className="font-[Poppins] text-sm text-gray-700 hover:text-[#1F3A93] transition-colors flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone size={14} className="text-gray-500" />
                                <span className="truncate">{employee.phoneNumber}</span>
                              </Link>
                              <Link
                                to={`mailto:${employee.email}`}
                                className="font-[Poppins] text-sm text-[#3498DB] hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail size={14} className="text-[#3498DB]" />
                                <span className="truncate">{employee.email}</span>
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 border-r border-gray-200">
                            <select
                              className={`px-3 py-1.5 rounded-full border text-sm font-[Poppins] font-[500] outline-none cursor-pointer transition-all capitalize ${getStatusColor(employee.accountStatus)}`}
                              value={employee.accountStatus}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateUserField(employee._id, {
                                  accountStatus: e.target.value,
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 relative">
                            <div className="action-menu">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowActionMenu(showActionMenu === employee._id ? null : employee._id);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mx-auto block"
                              >
                                <Ellipsis size={20} className="text-gray-500" />
                              </button>
                              
                              {showActionMenu === employee._id && (
                                <div className={`absolute ${
                                  currentItems.indexOf(employee) >= currentItems.length - 3 
                                    ? 'bottom-10 right-0' 
                                    : 'right-0 top-12'
                                } bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]`}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/admin/update-employee/${employee._id}`);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-[Poppins] flex items-center gap-2 rounded-t-lg"
                                  >
                                    <Edit size={16} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const mockTasks = [
                                        {
                                          id: 1,
                                          title: "Create Front End",
                                          projectName: "E-Commerce Platform",
                                          assignedBy: "John Manager",
                                          deadline: "May 15, 2024",
                                          priority: "High",
                                          description: "Develop the front-end interface for the new e-commerce platform using React and Tailwind CSS.",
                                          status: "In Progress"
                                        },
                                        {
                                          id: 2,
                                          title: "API Integration",
                                          projectName: "Mobile App",
                                          assignedBy: "Sarah Lead",
                                          deadline: "June 20, 2024",
                                          priority: "Medium",
                                          description: "Integrate REST APIs for user authentication and data management.",
                                          status: "Pending"
                                        },
                                        {
                                          id: 3,
                                          title: "Database Design",
                                          projectName: "CRM System",
                                          assignedBy: "Mike Director",
                                          deadline: "July 10, 2024",
                                          priority: "Low",
                                          description: "Design and implement database schema for customer relationship management system.",
                                          status: "Completed"
                                        }
                                      ];
                                      setSelectedEmployeeTasks({
                                        employee: employee,
                                        tasks: employee.tasks && employee.tasks.length > 0 ? employee.tasks : mockTasks
                                      });
                                      setShowEmployeeTasksModal(true);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-[Poppins] flex items-center gap-2"
                                  >
                                    <ClipboardList size={16} />
                                    Tasks Assigned
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteUser(employee._id);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-[Poppins] flex items-center gap-2 rounded-b-lg"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {currentItems.map((employee) => (
                    <div
                      key={employee._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {employee.userName.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <p className="font-[Poppins] font-[600] text-gray-900">
                              {employee.userName}
                            </p>
                            <p className="font-[Poppins] text-xs text-gray-500">
                              ID: {employee._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="action-menu">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActionMenu(showActionMenu === employee._id ? null : employee._id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Ellipsis size={16} className="text-gray-500" />
                          </button>
                          
                          {showActionMenu === employee._id && (
                            <div className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/update-employee/${employee._id}`);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-[Poppins] flex items-center gap-2 rounded-t-lg"
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const mockTasks = [
                                    {
                                      id: 1,
                                      title: "Create Front End",
                                      projectName: "E-Commerce Platform",
                                      assignedBy: "John Manager",
                                      deadline: "May 15, 2024",
                                      priority: "High",
                                      description: "Develop the front-end interface for the new e-commerce platform using React and Tailwind CSS.",
                                      status: "In Progress"
                                    }
                                  ];
                                  setSelectedEmployeeTasks({
                                    employee: employee,
                                    tasks: employee.tasks && employee.tasks.length > 0 ? employee.tasks : mockTasks
                                  });
                                  setShowEmployeeTasksModal(true);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-[Poppins] flex items-center gap-2"
                              >
                                <ClipboardList size={16} />
                                Tasks
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteUser(employee._id);
                                  setShowActionMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-[Poppins] flex items-center gap-2 rounded-b-lg"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Role</p>
                          <select
                            className={`px-2 py-1 rounded-full border text-xs font-[Poppins] font-[500] outline-none cursor-pointer transition-all w-full ${getRoleColor(employee.userRole)}`}
                            value={employee.userRole}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateUserField(employee._id, {
                                userRole: e.target.value,
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="employee">Employee</option>
                            <option value="hr">HR</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Status</p>
                          <select
                            className={`px-2 py-1 rounded-full border text-xs font-[Poppins] font-[500] outline-none cursor-pointer transition-all capitalize w-full ${getStatusColor(employee.accountStatus)}`}
                            value={employee.accountStatus}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateUserField(employee._id, {
                                accountStatus: e.target.value,
                              });
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins]">Date of Birth</p>
                          <p className="text-sm font-[Poppins] text-gray-700">
                            {new Date(employee.dateOfBirth).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Link
                            to={`tel:${employee.phoneNumber}`}
                            className="font-[Poppins] text-sm text-gray-700 hover:text-[#1F3A93] transition-colors flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={14} className="text-gray-500" />
                            <span className="truncate">{employee.phoneNumber}</span>
                          </Link>
                          <Link
                            to={`mailto:${employee.email}`}
                            className="font-[Poppins] text-sm text-[#3498DB] hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail size={14} className="text-[#3498DB]" />
                            <span className="truncate">{employee.email}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 font-[Poppins] text-center sm:text-left">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} entries
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          disabled={page === '...'}
                          className={`px-3 py-1 rounded-lg font-[Poppins] font-[500] text-sm transition-colors ${
                            page === currentPage
                              ? 'bg-[#1F3A93] text-white'
                              : page === '...'
                              ? 'cursor-default'
                              : 'hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Details Modal */}
          {showEmployeeDetailsModal && currentEmployee && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1F3A93] to-[#2C4F99] text-white p-4 md:p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-[Poppins] font-[700] text-lg md:text-xl">
                      Employee Details
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/update-employee/${currentEmployee._id}`)
                        }
                        className="px-3 py-1.5 font-[Poppins] font-[500] text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-1 backdrop-blur-sm"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowEmployeeDetailsModal(false)}
                        className="text-white hover:text-gray-300 p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                      <div className="relative">
                        <Avatar sx={{ height: 64, width: 64, fontSize: '1.5rem' }}>
                          {currentEmployee.userName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                          currentEmployee.accountStatus === 'active' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-[Poppins] font-[600] text-lg text-gray-900 mb-1">
                          {currentEmployee?.userName}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-[Poppins] font-[500] ${getRoleColor(currentEmployee?.userRole)}`}>
                            {currentEmployee?.userRole?.charAt(0).toUpperCase() + currentEmployee?.userRole?.slice(1)}
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-[Poppins] font-[500] ${getStatusColor(currentEmployee?.accountStatus)}`}>
                            {currentEmployee?.accountStatus?.charAt(0).toUpperCase() + currentEmployee?.accountStatus?.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-[Poppins] mt-1">
                          ID: {currentEmployee._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="text-sm font-[Poppins] font-[600] text-gray-700 mb-3 flex items-center gap-2">
                        <Mail size={16} className="text-[#1F3A93]" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Email Address</p>
                          <a
                            href={`mailto:${currentEmployee?.email}`}
                            className="text-sm text-[#3498DB] hover:underline font-[Poppins] break-all"
                          >
                            {currentEmployee?.email}
                          </a>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Phone Number</p>
                          <a
                            href={`tel:${currentEmployee?.phoneNumber}`}
                            className="text-sm text-[#3498DB] hover:underline font-[Poppins] flex items-center gap-2"
                          >
                            <Phone size={14} />
                            {currentEmployee?.phoneNumber}
                          </a>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 md:col-span-2">
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Address</p>
                          <p className="text-sm text-gray-900 font-[Poppins]">
                            {currentEmployee?.address || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                      <h4 className="text-sm font-[Poppins] font-[600] text-gray-700 mb-3 flex items-center gap-2">
                        <User size={16} className="text-[#1F3A93]" />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Date of Birth</p>
                          <p className="text-sm text-gray-900 font-[Poppins] flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(currentEmployee?.dateOfBirth).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Employment Type</p>
                          <p className="text-sm text-gray-900 font-[Poppins]">Full Time</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Joining Date</p>
                          <p className="text-sm text-gray-900 font-[Poppins]">18 Mar 2020</p>
                        </div>
                      </div>
                    </div>

                    {/* Tasks Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-[Poppins] font-[600] text-gray-700 flex items-center gap-2">
                          <ClipboardList size={16} className="text-[#1F3A93]" />
                          Assigned Tasks
                        </h4>
                        <span className="bg-[#1F3A93] text-white text-xs font-[Poppins] font-[500] px-2 py-1 rounded-full">
                          {currentEmployee?.tasks?.length || 0}
                        </span>
                      </div>
                      
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {currentEmployee?.tasks && currentEmployee.tasks.length > 0 ? (
                          currentEmployee.tasks.map((cur, id) => (
                            <div
                              key={id}
                              onClick={() => {
                                setSelectedTask({
                                  id: id,
                                  title: "Create Front End",
                                  projectName: "E-Commerce Platform",
                                  assignedBy: "John Manager",
                                  deadline: "May 15, 2024",
                                  priority: "High",
                                  description: "Develop the front-end interface for the new e-commerce platform using React and Tailwind CSS.",
                                  status: "In Progress"
                                });
                                setShowTaskModal(true);
                              }}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100 hover:border-[#1F3A93]/30"
                            >
                              <div className="bg-gradient-to-br from-[#F39C12] to-[#E67E22] rounded-lg p-2 flex flex-col items-center justify-center h-12 w-12 text-white font-[Poppins] font-[500] text-xs shadow-sm">
                                <p>{12 + id + 1}</p>
                                <p className="-mt-1">May</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-[Poppins] font-[500] text-sm text-gray-900 truncate">
                                  Create Front End
                                </h4>
                                <p className="text-xs font-[Poppins] text-gray-500">
                                  Daily Task
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-[Poppins] font-[500] text-sm text-gray-700">
                                  2:00pm
                                </p>
                                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto mt-1"></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <ClipboardList size={32} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500 font-[Poppins]">
                              No tasks assigned yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/admin/update-employee/${currentEmployee._id}`)}
                        className="flex-1 bg-[#1F3A93] hover:bg-[#153073] text-white py-2.5 rounded-lg font-[Poppins] font-[500] text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit Profile
                      </button>
                      <button
                        onClick={() => {
                          const mockTasks = [
                            {
                              id: 1,
                              title: "Create Front End",
                              projectName: "E-Commerce Platform",
                              assignedBy: "John Manager",
                              deadline: "May 15, 2024",
                              priority: "High",
                              description: "Develop the front-end interface for the new e-commerce platform using React and Tailwind CSS.",
                              status: "In Progress"
                            }
                          ];
                          setSelectedEmployeeTasks({
                            employee: currentEmployee,
                            tasks: currentEmployee.tasks && currentEmployee.tasks.length > 0 ? currentEmployee.tasks : mockTasks
                          });
                          setShowEmployeeTasksModal(true);
                        }}
                        className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white py-2.5 rounded-lg font-[Poppins] font-[500] text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <ClipboardList size={16} />
                        View Tasks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Task Details Modal */}
          {showTaskModal && selectedTask && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-xl p-4 md:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg md:text-xl font-[Poppins] font-[700] text-[#1F3A93]">Task Details</h3>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-[Poppins] mb-1">Task Title</p>
                      <p className="text-sm font-[Poppins] font-[500] text-gray-900">{selectedTask.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-[Poppins] mb-1">Project Name</p>
                      <p className="text-sm font-[Poppins] font-[500] text-gray-900">{selectedTask.projectName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-[Poppins] mb-1">Assigned By</p>
                      <p className="text-sm font-[Poppins] font-[500] text-gray-900">{selectedTask.assignedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-[Poppins] mb-1">Deadline</p>
                      <p className="text-sm font-[Poppins] font-[500] text-red-600">{selectedTask.deadline}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-[Poppins] mb-1">Priority</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-[Poppins] font-[500] ${
                        selectedTask.priority === 'High' 
                          ? 'bg-red-100 text-red-700' 
                          : selectedTask.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-[Poppins] mb-1">Status</p>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-[Poppins] font-[500] bg-blue-100 text-blue-700">
                        {selectedTask.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 font-[Poppins] mb-1">Description</p>
                    <p className="text-sm font-[Poppins] text-gray-700 leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-[Poppins] font-[500] text-sm transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      router(`/admin/task-management/task-details/${selectedTask.id}`);
                      setShowTaskModal(false);
                    }}
                    className="px-4 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#153073] font-[Poppins] font-[500] text-sm transition-colors"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Employee Tasks Modal */}
          {showEmployeeTasksModal && selectedEmployeeTasks && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
              <div className="bg-white rounded-xl p-4 md:p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-[Poppins] font-[700] text-[#1F3A93]">Tasks Assigned</h3>
                    <p className="text-sm text-gray-600 font-[Poppins] mt-1">
                      Employee: {selectedEmployeeTasks.employee.userName}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmployeeTasksModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="overflow-y-auto max-h-[60vh] space-y-4">
                  {selectedEmployeeTasks.tasks.map((task, index) => (
                    <div key={task.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Task Title</p>
                          <p className="text-sm font-[Poppins] font-[600] text-gray-900">
                            {task.title || `Task ${index + 1}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Project Name</p>
                          <p className="text-sm font-[Poppins] font-[500] text-gray-900">
                            {task.projectName || "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Assigned By</p>
                          <p className="text-sm font-[Poppins] font-[500] text-gray-900">
                            {task.assignedBy || "Admin"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Deadline</p>
                          <p className="text-sm font-[Poppins] font-[500] text-red-600">
                            {task.deadline || "Not set"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Priority</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-[Poppins] font-[500] ${
                            task.priority === 'High' 
                              ? 'bg-red-100 text-red-700' 
                              : task.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {task.priority || "Medium"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-[Poppins] font-[500] ${
                            task.status === 'Completed' 
                              ? 'bg-green-100 text-green-700'
                              : task.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status || "Pending"}
                          </span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <div>
                          <p className="text-xs text-gray-500 font-[Poppins] mb-1">Description</p>
                          <p className="text-sm font-[Poppins] text-gray-700 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowEmployeeTasksModal(false)}
                    className="px-6 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#153073] font-[Poppins] font-[500] text-sm transition-colors flex items-center gap-2"
                  >
                    <ClipboardList size={16} />
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};