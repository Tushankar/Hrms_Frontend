import React, { useEffect, useState } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { DynamicOverviewcards } from "../../Components/Admin/Overviewcards/DynamicOverviewcards";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  ArrowUpDown,
  Phone,
  Mail,
  MoreVertical,
  MapPin,
  Briefcase,
  Calendar,
  Search,
  Filter,
  Download,
  UserPlus,
  ChevronDown,
  Building,
  Clock,
  Award,
  Users,
} from "lucide-react";
import { Avatar } from "@mui/material";
import axios from "axios";

export const EmployeeDirectory = () => {
  const router = useNavigate();
  const baseURL = import.meta.env.VITE__BASEURL;
  const [task, setTask] = useState({ status: false });
  const [employee, setEmployee] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  const getEmployee = async () => {
    try {
      const response = await axios.get(`${baseURL}/employee/get-all-employee`);
      setEmployee(response.data?.employessList);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    country: "",
    password: "",
    address: "",
    dateOfBirth: "",
    experience: "",
    jobDesignation: "",
    employeementType: "",
    userRole: "employee",
    profileImage: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      await axios.post(`${baseURL}/hr/register-employee`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTask({ status: false });
      alert("Employee registered successfully!");
      getEmployee();
      // Reset form
      setFormData({
        userName: "",
        email: "",
        phoneNumber: "",
        country: "",
        password: "",
        address: "",
        dateOfBirth: "",
        experience: "",
        jobDesignation: "",
        employeementType: "",
        userRole: "employee",
        profileImage: null,
      });
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };

  const sortTable = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...employee].sort((a, b) => {
      if (key === "createdAt") {
        return direction === "asc"
          ? new Date(a[key]) - new Date(b[key])
          : new Date(b[key]) - new Date(a[key]);
      }
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setEmployee(sortedData);
  };

  useEffect(() => {
    getEmployee();
  }, []);

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

  // Filter employees based on search and status
  const filteredEmployees = employee
    .filter((res) => res.userRole === "employee")
    .filter((emp) => {
      const matchesSearch =
        emp.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phoneNumber.includes(searchQuery);
      const matchesStatus =
        filterStatus === "all" || emp.accountStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });

  const handleEmployeeClick = (emp) => {
    setSelectedEmployee(emp);
    setShowMobileDetails(true);
  };

  // Employee Card Component for Mobile View
  const EmployeeCard = ({ emp }) => (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleEmployeeClick(emp)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
            {emp.userName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{emp.userName}</h4>
            <p className="text-sm text-gray-500">
              {emp.jobDesignation || "Employee"}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            emp.accountStatus === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {emp.accountStatus}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={14} />
          <span className="truncate">{emp.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={14} />
          <span>{emp.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={14} />
          <span>
            Joined{" "}
            {new Date(emp.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full h-full bg-gray-50">
        <Navbar />

        <div className="p-4 lg:p-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[#1F3A93]">
                  Employee Directory
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and view all employee information
                </p>
              </div>
              <button
                onClick={() => setTask({ status: true })}
                className="flex items-center gap-2 bg-[#1F3A93] px-6 py-2.5 rounded-lg text-white font-medium hover:bg-[#16307E] transition-colors shadow-sm"
              >
                <UserPlus size={20} />
                Add Employee
              </button>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="mb-6">
            <DynamicOverviewcards />
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Filter size={18} />
                  <span className="hidden sm:inline">More Filters</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area with Details Panel */}
          <div className="flex gap-6">
            {/* Employee List */}
            <div
              className={`flex-1 transition-all duration-300 ${
                selectedEmployee && !showMobileDetails ? "lg:mr-96" : ""
              }`}
            >
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="p-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={() => sortTable("userName")}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                          >
                            Employee
                            <ArrowUpDown size={14} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left">
                          <button
                            onClick={() => sortTable("createdAt")}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-gray-900"
                          >
                            Joined Date
                            <ArrowUpDown size={14} />
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEmployees.map((emp) => (
                        <tr
                          key={emp._id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {emp.userName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {emp.userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {emp.jobDesignation || "Employee"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <a
                                href={`mailto:${emp.email}`}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail size={14} />
                                {emp.email}
                              </a>
                              <a
                                href={`tel:${emp.phoneNumber}`}
                                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone size={14} />
                                {emp.phoneNumber}
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(emp.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {emp.employeementType || "Full-time"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                emp.accountStatus === "active"
                                  ? "bg-green-50 text-green-700 border-green-200 focus:ring-green-500"
                                  : "bg-red-50 text-red-700 border-red-200 focus:ring-red-500"
                              }`}
                              value={emp.accountStatus}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateUserField(emp._id, {
                                  accountStatus: e.target.value,
                                });
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical
                                size={16}
                                className="text-gray-500"
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredEmployees.map((emp) => (
                  <EmployeeCard key={emp._id} emp={emp} />
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    No employees found matching your criteria
                  </p>
                </div>
              )}
            </div>

            {/* Employee Details Panel - Desktop */}
            <div
              className={`hidden lg:block fixed right-0 top-20 bottom-0 w-96 bg-white border-l border-gray-200 shadow-lg transition-transform duration-300 overflow-y-auto ${
                selectedEmployee ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {selectedEmployee && (
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Employee Details
                    </h3>
                    <button
                      onClick={() => setSelectedEmployee(null)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                      {selectedEmployee.userName?.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 text-center">
                      {selectedEmployee.userName}
                    </h4>
                    <p className="text-gray-600">
                      {selectedEmployee.jobDesignation || "Employee"}
                    </p>
                    <span
                      className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                        selectedEmployee.accountStatus === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedEmployee.accountStatus}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        Contact Information
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Email</p>
                            <a
                              href={`mailto:${selectedEmployee.email}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {selectedEmployee.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Phone</p>
                            <a
                              href={`tel:${selectedEmployee.phoneNumber}`}
                              className="text-sm text-gray-700 hover:text-blue-600"
                            >
                              {selectedEmployee.phoneNumber}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm text-gray-700">
                              {selectedEmployee.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        Work Information
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">
                              Employment Type
                            </p>
                            <p className="text-sm text-gray-700">
                              {selectedEmployee.employeementType || "Full-time"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="text-sm text-gray-700">
                              {selectedEmployee.department || "Not assigned"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Experience</p>
                            <p className="text-sm text-gray-700">
                              {selectedEmployee.experience || "0"} years
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Joined Date</p>
                            <p className="text-sm text-gray-700">
                              {new Date(
                                selectedEmployee.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        Recent Activities
                      </h5>
                      <div className="space-y-2">
                        {[1, 2, 3].map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">
                                Completed task #{index + 1}
                              </p>
                              <p className="text-xs text-gray-500">
                                2 hours ago
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Employee Details - Mobile Modal */}
            {showMobileDetails && selectedEmployee && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
                <div className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Employee Details
                      </h3>
                      <button
                        onClick={() => {
                          setShowMobileDetails(false);
                          setSelectedEmployee(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Same content as desktop details panel */}
                    <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                        {selectedEmployee.userName?.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedEmployee.userName}
                      </h4>
                      <p className="text-gray-600">
                        {selectedEmployee.jobDesignation || "Employee"}
                      </p>
                      <span
                        className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                          selectedEmployee.accountStatus === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {selectedEmployee.accountStatus}
                      </span>
                    </div>

                    {/* Contact and Work Information - Mobile */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <a
                          href={`mailto:${selectedEmployee.email}`}
                          className="flex flex-col items-center p-4 bg-blue-50 rounded-lg"
                        >
                          <Mail className="w-6 h-6 text-blue-600 mb-2" />
                          <span className="text-sm text-gray-700">Email</span>
                        </a>
                        <a
                          href={`tel:${selectedEmployee.phoneNumber}`}
                          className="flex flex-col items-center p-4 bg-green-50 rounded-lg"
                        >
                          <Phone className="w-6 h-6 text-green-600 mb-2" />
                          <span className="text-sm text-gray-700">Call</span>
                        </a>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm">
                              {selectedEmployee.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Briefcase className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Employment</p>
                            <p className="text-sm">
                              {selectedEmployee.employeementType || "Full-time"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Joined</p>
                            <p className="text-sm">
                              {new Date(
                                selectedEmployee.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Employee Modal */}
          {task.status && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
              <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      Add New Employee
                    </h3>
                    <button
                      onClick={() => setTask({ status: false })}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={24} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information Section */}
                      <div className="md:col-span-2">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Personal Information
                        </h4>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="text"
                          placeholder="Enter full name"
                          name="userName"
                          value={formData.userName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="email"
                          placeholder="email@company.com"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          required
                        >
                          <option value="">Select Country</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="INDIA">India</option>
                          <option value="CANADA">Canada</option>
                          <option value="AUSTRALIA">Australia</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="text"
                          placeholder="Enter address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Work Information Section */}
                      <div className="md:col-span-2 mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          Work Information
                        </h4>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Designation{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="text"
                          placeholder="e.g. Software Engineer"
                          name="jobDesignation"
                          value={formData.jobDesignation}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employment Type{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="employeementType"
                          value={formData.employeementType}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          required
                        >
                          <option value="">Select Type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="number"
                          placeholder="0"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent"
                          type="password"
                          placeholder="Create password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                          <input
                            className="hidden"
                            type="file"
                            name="profileImage"
                            id="profileImage"
                            onChange={handleFileChange}
                            accept="image/*"
                          />
                          <label
                            htmlFor="profileImage"
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col items-center">
                              <UserPlus
                                size={40}
                                className="text-gray-400 mb-2"
                              />
                              <p className="text-sm text-gray-600">
                                Click to upload profile image
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          </label>
                          {formData.profileImage && (
                            <p className="mt-2 text-sm text-green-600">
                              Selected: {formData.profileImage.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setTask({ status: false })}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#1F3A93] text-white rounded-lg font-medium hover:bg-[#16307E] transition-colors flex items-center gap-2"
                      >
                        <UserPlus size={20} />
                        Add Employee
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
