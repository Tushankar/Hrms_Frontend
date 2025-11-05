import React, { useState, useMemo } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { Overviewcards } from "../../Components/Admin/Overviewcards/Overviewcards";
import { Link } from "react-router-dom";
import { Search, Plus, Filter, Download, ArrowUp, MoreVertical, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Clock, Calendar, User, Menu, CircleX } from "lucide-react";

export const ErrorLogs = () => {
  const [selectedError, setSelectedError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAddErrorOpen, setIsAddErrorOpen] = useState(false);
  const [isConfigureActionsOpen, setIsConfigureActionsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSystemAlertsOpen, setIsSystemAlertsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showActions, setShowActions] = useState(null);
  const [showTableActions, setShowTableActions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSupportDetails, setShowSupportDetails] = useState(false);

  const initialErrorData = [
    {
      id: "1001",
      severity: "high",
      timestamp: "2024-12-22, 3:30 PM",
      description: "Database connection timeout occurred during peak traffic hours. Multiple retry attempts failed.",
      status: "active",
      module: "Database",
      assignee: "John Doe",
      deadline: "2024-12-25",
      clientMeeting: "2024-12-23, 2:00 PM",
      clientRequests: "Need 99.9% uptime guarantee"
    },
    {
      id: "1002",
      severity: "critical",
      timestamp: "2024-12-22, 3:28 PM",
      description: "Authentication service failed to respond. Users unable to login across all platforms.",
      status: "active",
      module: "Auth",
      assignee: "Sarah Smith",
      deadline: "2024-12-23",
      clientMeeting: "2024-12-23, 10:00 AM",
      clientRequests: "Immediate fix required, affecting all users"
    },
    {
      id: "1003",
      severity: "high",
      timestamp: "2024-12-22, 3:25 PM",
      description: "Memory leak detected in payment processing module. System resources at 85% capacity.",
      status: "resolved",
      module: "Payment",
      assignee: "Mike Johnson",
      deadline: "2024-12-22",
      resolvedBy: "Mike Johnson",
      resolvedAt: "2024-12-22, 5:00 PM"
    },
    {
      id: "1004",
      severity: "high",
      timestamp: "2024-12-22, 3:22 PM",
      description: "API rate limit exceeded for third-party integration. Requests being throttled.",
      status: "active",
      module: "API",
      assignee: "Emily Brown",
      deadline: "2024-12-24",
      clientMeeting: "2024-12-24, 3:00 PM",
      clientRequests: "Increase rate limits or implement caching"
    },
    {
      id: "1005",
      severity: "medium",
      timestamp: "2024-12-22, 3:20 PM",
      description: "SSL certificate expiring in 7 days for subdomain api.example.com.",
      status: "active",
      module: "Security",
      assignee: "David Lee",
      deadline: "2024-12-29",
      clientMeeting: "2024-12-26, 11:00 AM",
      clientRequests: "Ensure no downtime during renewal"
    }
  ];

  const [errorData, setErrorData] = useState(initialErrorData);
  const [newError, setNewError] = useState({
    severity: "medium",
    description: "",
    module: "General"
  });

  const historicalErrors = [
    {
      id: "0998",
      severity: "critical",
      description: "Server crash due to memory overflow",
      status: "resolved",
      resolvedBy: "Alex Turner",
      resolvedAt: "2024-12-20, 6:00 PM",
      resolutionTime: "2 hours"
    },
    {
      id: "0997",
      severity: "high",
      description: "Payment gateway integration failure",
      status: "resolved",
      resolvedBy: "Sarah Smith",
      resolvedAt: "2024-12-19, 4:30 PM",
      resolutionTime: "4 hours"
    },
    {
      id: "0996",
      severity: "medium",
      description: "Email notification service delayed",
      status: "overdue",
      assignee: "John Doe",
      deadline: "2024-12-18",
      daysOverdue: "4 days"
    }
  ];

  const systemAlerts = [
    {
      id: "SA001",
      type: "critical",
      title: "Housebe: Server Down",
      description: "Main production server unresponsive,API calls missing",
      timestamp: "2 minutes ago",
      affectedSystems: ["Web App", "Mobile API", "Admin Panel"]
    },
    {
      id: "SA002",
      type: "warning",
      title: "Just Drains: Responsive Issue",
      description: "Client wants to make it responsive especially for Ipads",
      timestamp: "15 minutes ago",
      affectedSystems: ["Database Server"]
    },
    {
      id: "SA003",
      type: "info",
      title: "EduQuest: Multi-Panel Issues",
      description: "Client wants to add more panels to the dashboard",
      timestamp: "1 hour ago",
      affectedSystems: ["All Systems"]
    },
    {
      id: "SA004",
      type: "info",
      title: "Wholesale: API Rate Limit",
      description: "Approaching daily API rate limit (90%)",
      timestamp: "3 hours ago",
      affectedSystems: ["External APIs"]
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "#DC2626";
      case "high": return "#F59E0B";
      case "medium": return "#10B981";
      default: return "#6B7280";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical": return <XCircle className="w-4 h-4" />;
      case "high": return <AlertCircle className="w-4 h-4" />;
      case "medium": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleErrorClick = (error) => {
    setSelectedError(error);
    setIsPopupOpen(true);
    setShowActions(null);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedError(null);
  };

  const handleAddError = () => {
    if (newError.description.trim()) {
      const newErrorEntry = {
        id: (Math.max(...errorData.map(e => parseInt(e.id))) + 1).toString(),
        severity: newError.severity,
        timestamp: new Date().toLocaleString(),
        description: newError.description,
        status: "active",
        module: newError.module,
        assignee: "Unassigned",
        deadline: "TBD",
        clientMeeting: "TBD",
        clientRequests: "Pending review"
      };
      setErrorData([newErrorEntry, ...errorData]);
      setNewError({ severity: "medium", description: "", module: "General" });
      setIsAddErrorOpen(false);
    }
  };

  const handleDeleteError = (id) => {
    setErrorData(errorData.filter(error => error.id !== id));
    setShowActions(null);
  };

  const handleResolveError = (id) => {
    setErrorData(errorData.map(error =>
      error.id === id ? { ...error, status: "resolved", resolvedBy: "Current User", resolvedAt: new Date().toLocaleString() } : error
    ));
    setShowActions(null);
  };

  const filteredErrors = useMemo(() => {
    return errorData.filter(error => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        error.description.toLowerCase().includes(searchLower) ||
        error.id.toLowerCase().includes(searchLower) ||
        error.module.toLowerCase().includes(searchLower) ||
        (error.assignee && error.assignee.toLowerCase().includes(searchLower));
      const matchesSeverity = filterSeverity === "all" || error.severity === filterSeverity;
      const matchesStatus = filterStatus === "all" || error.status === filterStatus;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [errorData, searchTerm, filterSeverity, filterStatus]);

  const downloadCSV = () => {
    const headers = ['Error ID', 'Severity', 'Status', 'Module', 'Description', 'Timestamp', 'Assignee', 'Deadline', 'Client Meeting', 'Client Requests'];
    const csvContent = [
      headers.join(','),
      ...filteredErrors.map(error => [
        error.id,
        error.severity,
        error.status,
        error.module,
        `"${error.description}"`,
        error.timestamp,
        error.assignee || 'Unassigned',
        error.deadline || 'TBD',
        error.clientMeeting || 'TBD',
        `"${error.clientRequests || 'None'}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleTaskCheck = (taskName, event) => {
    if (event.target.checked) {
      alert("Task has been completed");
    } else {
      alert("Task marked as incomplete");
    }
  };

  return (
    <>
      <Layout>
        <div className="w-full h-full bg-gray-50 min-h-screen">
          <Navbar />
          <div className="flex justify-center">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-[1920px] mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-gray-900 font-[Inter] font-[600] text-xl sm:text-2xl lg:text-3xl">
                    Error Logs
                  </h3>
                </div>
                <div className="w-full sm:w-auto">
                  <select className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2 outline-none text-gray-700 cursor-pointer hover:border-gray-400 transition-all text-sm lg:text-base shadow-sm">
                    <option className="font-[Inter] font-[400] text-gray-700">Today</option>
                    <option className="font-[Inter] font-[400] text-gray-700">Week</option>
                    <option className="font-[Inter] font-[400] text-gray-700">Month</option>
                    <option className="font-[Inter] font-[400] text-gray-700">Quarter</option>
                    <option className="font-[Inter] font-[400] text-gray-700">Year</option>
                    <option className="font-[Inter] font-[400] text-gray-700">All Time</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-900 font-[Inter] font-[600] text-base sm:text-lg">Action Panel</h4>
                    <span
                      onClick={() => setIsHistoryOpen(true)}
                      className="text-gray-400 text-xs sm:text-sm font-[Inter] cursor-pointer hover:text-gray-600"
                    >
                      History →
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-gray-700">Client Meetings</span>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                        defaultChecked
                        onChange={(e) => handleTaskCheck("Client Meetings", e)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-gray-700">Site Deployment</span>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                        onChange={(e) => handleTaskCheck("Site Deployment", e)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-gray-700">Project Delivery</span>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer"
                        defaultChecked
                        onChange={(e) => handleTaskCheck("Project Delivery", e)}
                      />
                    </div>
                    <button
                      onClick={() => setIsConfigureActionsOpen(true)}
                      className="w-full mt-4 bg-[#1E3A8A] text-white py-2 sm:py-2.5 px-4 rounded-lg font-[Inter] font-[500] text-xs sm:text-sm hover:bg-[#1E40AF] transition-colors"
                    >
                      Configure Actions
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-900 font-[Inter] font-[600] text-base sm:text-lg">Task Updates</h4>
                    <span
                      onClick={() => setIsSystemAlertsOpen(true)}
                      className="text-gray-400 text-xs sm:text-sm font-[Inter] cursor-pointer hover:text-gray-600"
                    >
                      See All →
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-[Inter] font-[500] text-gray-900">Housebe: Server Down</p>
                          <p className="text-xs text-gray-600 mt-1">Main production server unresponsive,API calls missing</p>
                          <p className="text-xs text-gray-400 mt-2">2 days ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-[Inter] font-[500] text-gray-900">Just Drains: Responsive Issue</p>
                          <p className="text-xs text-gray-600 mt-1">Client wants to make it responsive especially for Ipads</p>
                          <p className="text-xs text-gray-400 mt-2">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-4 sm:p-6 hover:shadow-md transition-shadow md:col-span-2 xl:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-900 font-[Inter] font-[600] text-base sm:text-lg">Support</h4>
                    <button
                      onClick={() => setShowSupportDetails(true)}
                      className="w-6 sm:w-8 h-6 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-3 sm:w-4 h-3 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center py-2 sm:py-4">
                      <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 sm:w-8 h-6 sm:h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 font-[Inter] mb-4">Need help with error resolution?</p>
                      <button className="bg-[#1E3A8A] text-white py-2 px-4 sm:px-6 rounded-lg font-[Inter] font-[500] text-xs sm:text-sm hover:bg-[#1E40AF] transition-colors">
                        Contact Support
                      </button>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">Average response time: 15 mins</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden border border-gray-300">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-300">
                  <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Error logs</h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <div className="relative flex-1 lg:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
                        <input
                          type="text"
                          placeholder="Search errors..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="flex flex-row gap-2 sm:gap-3">
                        <select
                          value={filterSeverity}
                          onChange={(e) => setFilterSeverity(e.target.value)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"
                        >
                          <option value="all">All Severity</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                        </select>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div className="hidden xl:flex gap-2 sm:gap-3">
                        <button
                          onClick={downloadCSV}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download CSV</span>
                        </button>
                        <button
                          onClick={() => setIsAddErrorOpen(true)}
                          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add error</span>
                        </button>
                      </div>
                      <div className="relative xl:hidden">
                        <button
                          onClick={() => setShowTableActions(!showTableActions)}
                          className="p-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {showTableActions && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-300 z-10">
                            <button
                              onClick={() => {
                                downloadCSV();
                                setShowTableActions(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download CSV
                            </button>
                            <button
                              onClick={() => {
                                setIsAddErrorOpen(true);
                                setShowTableActions(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add error
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="block lg:hidden">
                  {filteredErrors.map((error) => (
                    <div
                      key={error.id}
                      className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleErrorClick(error)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#1E3A8A] rounded-full"></div>
                            <div>
                              <p className="font-medium text-sm">Error #{error.id}</p>
                              <p className="text-xs text-gray-500">@{error.severity}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            error.status === 'active'
                              ? 'bg-[#1E3A8A] text-white'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}>
                            {error.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActions(showActions === error.id ? null : error.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{error.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                          {error.module}
                        </span>
                        <span className="text-gray-500">{error.timestamp}</span>
                      </div>
                      {showActions === error.id && (
                        <div className="mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-300">
                          {error.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolveError(error.id);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark as Resolved
                            </button>
                          )}
                          {error.status === 'resolved' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteError(error.id);
                              }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove Error
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="px-4 xl:px-6 py-3 text-left">
                          <input type="checkbox" className="rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Error Details
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                          Description
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Module
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="relative px-4 xl:px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredErrors.map((error) => (
                        <tr
                          key={error.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleErrorClick(error)}
                        >
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-[#1E3A8A] rounded-full mr-3"></div>
                              <div className="ml-1 xl:ml-2">
                                <div className="text-sm font-medium text-gray-900">Error #{error.id}</div>
                                <div className="text-sm text-gray-500">@{error.severity}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              error.status === 'active'
                                ? 'bg-[#1E3A8A] text-white'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}>
                              <span className={`w-2 h-2 rounded-full mr-1.5 ${
                                error.status === 'active' ? 'bg-white' : 'bg-gray-400'
                              }`}></span>
                              {error.status.charAt(0).toUpperCase() + error.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-sm text-gray-500 hidden xl:table-cell">
                            <p className="line-clamp-2 max-w-xs">{error.description}</p>
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                              {error.module}
                            </span>
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {error.timestamp}
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowActions(showActions === error.id ? null : error.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>
                              {showActions === error.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-300 z-10">
                                  {error.status === 'active' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleResolveError(error.id);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Mark as Resolved
                                    </button>
                                  )}
                                  {error.status === 'resolved' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteError(error.id);
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Remove Error
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 sm:px-6 py-4 border-t border-gray-300">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Showing <span className="font-medium">{filteredErrors.length}</span> of{' '}
                      <span className="font-medium">{errorData.length}</span> results
                    </p>
                    <nav className="flex gap-1">
                      <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">Previous</button>
                      <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-[#1E3A8A] text-white rounded-lg">1</button>
                      <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">2</button>
                      <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">3</button>
                      <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors">Next</button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isConfigureActionsOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-[Inter]">Active Error Assignments</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage team assignments and deadlines</p>
                    </div>
                    <button
                      onClick={() => setIsConfigureActionsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {errorData.filter(e => e.status === 'active').map((error) => (
                      <div key={error.id} className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Error #{error.id}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">{error.description}</p>
                          </div>
                          <span
                            className="inline-flex self-start px-2 sm:px-2.5 py-1 rounded-full text-white text-xs font-medium"
                            style={{ backgroundColor: getSeverityColor(error.severity) }}
                          >
                            {error.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                            <span className="text-gray-7
System: 00">Assigned to: <strong>{error.assignee}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                            <span className="text-gray-700">Deadline: <strong>{error.deadline}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                            <span className="text-gray-700">Client Meeting: <strong>{error.clientMeeting}</strong></span>
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <p className="text-gray-600">Client Requests: {error.clientRequests}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {isHistoryOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-[Inter]">Error Resolution History</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Previously resolved and overdue errors</p>
                    </div>
                    <button
                      onClick={() => setIsHistoryOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {historicalErrors.map((error) => (
                      <div key={error.id} className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base">Error #{error.id}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">{error.description}</p>
                          </div>
                          <span className={`inline-flex self-start px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium ${
                            error.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {error.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-3 text-xs sm:text-sm text-gray-600">
                          {error.status === 'resolved' ? (
                            <>
                              <p>Resolved by: <strong>{error.resolvedBy}</strong></p>
                              <p>Resolved at: {error.resolvedAt}</p>
                              <p>Resolution time: {error.resolutionTime}</p>
                            </>
                          ) : (
                            <>
                              <p>Assigned to: <strong>{error.assignee}</strong></p>
                              <p>Original deadline: {error.deadline}</p>
                              <p className="text-red-600 font-medium">Overdue by: {error.daysOverdue}</p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {isSystemAlertsOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-[Inter]">All System Alerts</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Complete list of system notifications</p>
                    </div>
                    <button
                      onClick={() => setIsSystemAlertsOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {systemAlerts.map((alert) => (
                      <div key={alert.id} className={`p-3 sm:p-4 rounded-lg border ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            alert.type === 'critical' ? 'bg-red-500' :
                            alert.type === 'warning' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-[Inter] font-[500] text-gray-900">{alert.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                              {alert.affectedSystems.map((system, idx) => (
                                <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">
                                  {system}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{alert.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {isAddErrorOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 max-w-full sm:max-w-md w-full animate-in zoom-in-95 duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-[Inter]">Add New Error</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Create a new error log entry</p>
                    </div>
                    <button
                      onClick={() => setIsAddErrorOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Severity Level</label>
                      <select
                        value={newError.severity}
                        onChange={(e) => setNewError({...newError, severity: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Module</label>
                      <select
                        value={newError.module}
                        onChange={(e) => setNewError({...newError, module: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"
                      >
                        <option value="General">General</option>
                        <option value="Database">Database</option>
                        <option value="Auth">Auth</option>
                        <option value="Payment">Payment</option>
                        <option value="API">API</option>
                        <option value="Security">Security</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Description</label>
                      <textarea
                        value={newError.description}
                        onChange={(e) => setNewError({...newError, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none text-sm"
                        placeholder="Describe the error..."
                      />
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 flex gap-3">
                    <button
                      onClick={handleAddError}
                      className="flex-1 bg-[#1E3A8A] text-white py-2 sm:py-3 px-4 rounded-xl font-[Inter] font-[500] hover:bg-[#1E40AF] transition-colors text-sm"
                    >
                      Add Error
                    </button>
                    <button
                      onClick={() => setIsAddErrorOpen(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-3 px-4 rounded-xl font-[Inter] font-[500] hover:bg-gray-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isPopupOpen && selectedError && (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 max-w-full sm:max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-[Inter]">Error Details</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Review and manage error information</p>
                    </div>
                    <button
                      onClick={closePopup}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1 font-[Inter]">Error ID</p>
                      <p className="font-medium text-gray-900 font-[Inter] text-sm sm:text-base">#{selectedError.id}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 font-[Inter]">Severity Level</p>
                      <span
                        className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white text-xs sm:text-sm font-medium ${
                          selectedError.severity === 'critical' ? 'bg-red-500' :
                          selectedError.severity === 'high' ? 'bg-orange-500' :
                          selectedError.severity === 'medium' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-white bg-opacity-30 mr-1.5 sm:mr-2" />
                        {selectedError.severity.charAt(0).toUpperCase() + selectedError.severity.slice(1)}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1 font-[Inter]">Module</p>
                      <p className="text-xs sm:text-sm text-gray-900 font-[Inter]">{selectedError.module}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1 font-[Inter]">Timestamp</p>
                      <p className="text-xs sm:text-sm text-gray-900 font-[Inter]">{selectedError.timestamp}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 font-[Inter]">Description</p>
                      <p className="text-xs sm:text-sm text-gray-900 leading-relaxed font-[Inter]">{selectedError.description}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 font-[Inter]">Assignment Details</p>
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                        <p className="text-gray-700">Assigned to: <strong>{selectedError.assignee}</strong></p>
                        <p className="text-gray-700">Deadline: <strong>{selectedError.deadline}</strong></p>
                        <p className="text-gray-700">Client Meeting: <strong>{selectedError.clientMeeting}</strong></p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                      <p className="text-xs sm:text-sm text-gray-500 mb-2 font-[Inter]">Current Status</p>
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                        selectedError.status === 'active'
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1.5 sm:mr-2 ${
                          selectedError.status === 'active' ? 'bg-white' : 'bg-gray-400'
                        }`} />
                        {selectedError.status.charAt(0).toUpperCase() + selectedError.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 space-y-3">
                    {selectedError.status === 'active' && (
                      <button
                        onClick={() => {
                          handleResolveError(selectedError.id);
                          closePopup();
                        }}
                        className="w-full bg-[#1E3A8A] text-white py-2 sm:py-3 px-4 rounded-xl font-[Inter] font-[500] hover:bg-[#1E40AF] transition-colors text-sm"
                      >
                        Mark as Resolved
                      </button>
                    )}
                    <button className="w-full bg-gray-100 text-gray-700 py-2 sm:py-3 px-4 rounded-xl font-[Inter] font-[500] hover:bg-gray-200 transition-colors text-sm">
                      View Stack Trace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showSupportDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-300 max-w-full sm:max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 font-[Inter]">Support Contact Details</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Reach out to our support teams</p>
                    </div>
                    <button
                      onClick={() => setShowSupportDetails(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2 rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">HR Department</span>
                        <span className="text-gray-900 font-medium">hr@Kyptronix.com</span>
                      </li>
                      <li className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">CEO/Admin</span>
                        <span className="text-gray-900 font-medium">ceo@Kyptronix.com</span>
                      </li>
                      <li className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Tech Team</span>
                        <span className="text-gray-900 font-medium">tech@Kyptronix.com</span>
                      </li>
                      <li className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Sales Panel</span>
                        <span className="text-gray-900 font-medium">sales@Kyptronix.com</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">Office Hours: Mon-Fri, 9AM-5PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};