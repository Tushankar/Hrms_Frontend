import React, { useEffect, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Paperclip,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { acceptTask, rejectTask } from "../../utils/taskUtils";

export const Task = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "Sasanka Roy",
      email: "sasanka.roy@email.com",
      phone: "+1 (555) 123-4567",
      position: "Frontend Developer",
      department: "Engineering",
      task: "Upload All the Required Documents",
      date: "24/03/2025",
      status: "Complete",
      avatar: "SR",
      priority: "High",
      deadLine: "2024-02-15",
    },
    {
      id: 2,
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 234-5678",
      position: "UX Designer",
      department: "Design",
      task: "Complete onboarding documentation",
      date: "22/01/2024",
      status: "In Progress",
      avatar: "ED",
      priority: "Medium",
      deadLine: "2024-02-10",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael.brown@email.com",
      phone: "+1 (555) 345-6789",
      position: "Backend Developer",
      department: "Engineering",
      task: "Setup development environment",
      date: "01/02/2024",
      status: "Complete",
      avatar: "MB",
      priority: "Normal",
      deadLine: "2024-02-20",
    },
    {
      id: 4,
      name: "Jessica Wilson",
      email: "jessica.wilson@email.com",
      phone: "+1 (555) 456-7890",
      position: "Product Manager",
      department: "Product",
      task: "Team introduction meetings",
      date: "05/02/2024",
      status: "Pending",
      avatar: "JW",
      priority: "High",
      deadLine: "2024-02-12",
    },
    {
      id: 5,
      name: "Alex Rodriguez",
      email: "alex.rodriguez@email.com",
      phone: "+1 (555) 567-8901",
      position: "Data Analyst",
      department: "Analytics",
      task: "Complete compliance training",
      date: "10/02/2024",
      status: "In Progress",
      avatar: "AR",
      priority: "Medium",
      deadLine: "2024-02-18",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const router = useNavigate();
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    const session = Cookies.get("session");
    if (!session) {
      return router("/auth/log-in");
    }
    const userData = jwtDecode(session);
    setUserInfo(userData.user);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || candidate.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "All" || candidate.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = ["All", ...new Set(candidates.map((c) => c.department))];
  const statuses = ["All", "Pending", "In Progress", "Complete"];

  // Add these new functions for handling Accept and Reject
  const handleAcceptTask = async (candidate) => {
    const success = await acceptTask(candidate, baseURL);
    if (success) {
      // Update candidate status to "Accepted"
      const updatedCandidates = candidates.map((c) =>
        c.id === candidate.id ? { ...c, status: "Accepted" } : c
      );
      setCandidates(updatedCandidates);
    }
  };

  const handleRejectTask = async (candidateId) => {
    const candidateToReject = candidates.find(c => c.id === candidateId);
    const success = await rejectTask(candidateId, candidateToReject, baseURL);
    if (success) {
      // Update local candidates list
      const updatedCandidates = candidates.filter((c) => c.id !== candidateId);
      setCandidates(updatedCandidates);
    }
  };

  return (
    <>
      <Layout>
        <div className="w-full h-screen flex flex-col">
          <Navbar />
          <div className="flex-1 bg-gray-50 overflow-hidden">
            <div className="h-full p-3 sm:p-4 lg:p-6 overflow-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Onboarding Candidates
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                    Track and manage new employee onboarding tasks
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center gap-2">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sm:hidden">Add</span>
                    <span className="hidden sm:inline">Add Candidate</span>
                  </button>
                  <button className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm hover:bg-gray-50 transition-all duration-200 inline-flex items-center justify-center gap-2">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Search candidates..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status} Status
                        </option>
                      ))}
                    </select>

                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept} Department
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3 sm:space-y-4">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {candidate.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm sm:text-base">
                            {candidate.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {candidate.position}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {candidate.department}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1">
                        Task
                      </div>
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {candidate.task}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1">
                        Date
                      </div>
                      <div className="text-gray-700 text-sm sm:text-base">
                        {candidate.date}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => router("/task-lists")}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1F3A93] text-white text-xs sm:text-sm px-3 py-2 rounded-lg hover:bg-[#16307E] transition-colors"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      {candidate.status !== "Accepted" && (
                        <>
                          <button
                            onClick={() => handleRejectTask(candidate.id)}
                            className="flex-1 bg-red-500 text-white text-xs sm:text-sm px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAcceptTask(candidate)}
                            className="flex-1 bg-green-500 text-white text-xs sm:text-sm px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Accept
                          </button>
                        </>
                      )}
                      {candidate.status === "Accepted" && (
                        <span className="flex-1 bg-gray-100 text-gray-600 text-xs sm:text-sm px-3 py-2 rounded-lg text-center">
                          Accepted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Task
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Documents
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {candidate.avatar}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {candidate.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidate.position}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {candidate.department}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {candidate.task}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-700">
                              {candidate.date}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => router("/task-lists")}
                              className="inline-flex items-center gap-1 bg-[#1F3A93] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#16307E] transition-colors"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {candidate.status !== "Accepted" ? (
                                <>
                                  <button
                                    onClick={() =>
                                      handleRejectTask(candidate.id)
                                    }
                                    className="bg-red-500 text-white font-[Poppins] text-[.9vw] px-5 py-2.5 capitalize rounded-full hover:bg-red-600 transition-colors"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleAcceptTask(candidate)}
                                    className="bg-[green] text-white font-[Poppins] text-[.9vw] px-5 py-2.5 capitalize rounded-full hover:bg-green-600 transition-colors"
                                  >
                                    Accept
                                  </button>
                                </>
                              ) : (
                                <span className="bg-gray-100 text-gray-600 font-[Poppins] text-[.9vw] px-5 py-2.5 capitalize rounded-full">
                                  Accepted
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                candidate.status
                              )}`}
                            >
                              {candidate.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCandidates.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No candidates found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Empty State */}
              {filteredCandidates.length === 0 && (
                <div className="lg:hidden flex items-center justify-center py-12">
                  <div className="text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No candidates found
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {filteredCandidates.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
                  <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
                    Showing{" "}
                    <span className="font-medium">
                      {filteredCandidates.length}
                    </span>{" "}
                    of <span className="font-medium">{candidates.length}</span>{" "}
                    candidates
                  </div>
                  <div className="flex gap-1 sm:gap-2 order-1 sm:order-2">
                    <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                      Previous
                    </button>
                    <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-all">
                      1
                    </button>
                    <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                      Next
                    </button>
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
