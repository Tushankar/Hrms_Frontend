import React, { useState, useEffect } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { Overviewcards } from "../../Components/Admin/Overviewcards/Overviewcards";
import { FeatureUsageChart } from "../../Components/Admin/FeatureUsageChart/FeatureUsageChart";
import { PeakUsage } from "../../Components/Admin/PeakUsage/PeakUsage";

// Mock data for system alerts
const systemAlertsData = [
  {
    id: 1,
    type: "critical",
    title: "Task Management module experiencing high response times",
    recommendation: "Restart the module and monitor for improvements",
    timestamp: new Date().toISOString(),
    status: "active"
  },
  {
    id: 2,
    type: "warning",
    title: "Task Creation module not working",
    recommendation: "Check service dependencies",
    timestamp: new Date().toISOString(),
    status: "active"
  },
  {
    id: 3,
    type: "info",
    title: "Scheduled maintenance completed",
    recommendation: "System is fully operational",
    timestamp: new Date().toISOString(),
    status: "resolved"
  }
];

// Mock FAQ data
const faqData = [
  { id: 1, question: "How to restart a module?", answer: "Click on 'Restart Modules' button in the Action Panel" },
  { id: 2, question: "What are pending errors?", answer: "Errors that need manual intervention to resolve" },
  { id: 3, question: "How to test system performance?", answer: "Use the 'Test System Performance' button to run diagnostics" },
  { id: 4, question: "When to use manual override?", answer: "Only in critical situations when automatic systems fail" }
];

// Mock action history data
const actionHistoryData = [
  { id: 1, action: "Modules Restarted", user: "Admin", timestamp: "2024-12-22, 11:45 AM", status: "Success" },
  { id: 2, action: "Performance Test", user: "System", timestamp: "2024-12-22, 11:30 AM", status: "Success" },
  { id: 3, action: "Manual Override", user: "Admin", timestamp: "2024-12-22, 10:15 AM", status: "Active" },
  { id: 4, action: "Errors Resolved (15)", user: "Admin", timestamp: "2024-12-22, 09:30 AM", status: "Success" },
  { id: 5, action: "System Cache Cleared", user: "System", timestamp: "2024-12-22, 08:00 AM", status: "Success" },
  { id: 6, action: "Modules Restarted", user: "Admin", timestamp: "2024-12-21, 06:45 PM", status: "Failed" },
];

export const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState("Week");
  const [alerts, setAlerts] = useState(systemAlertsData);
  const [selectedFaq, setSelectedFaq] = useState(faqData[0]);
  const [actionInProgress, setActionInProgress] = useState("");
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(1);

  // Handle action panel button clicks
  const handleAction = (action) => {
    setActionInProgress(action);
    
    // Simulate action processing
    setTimeout(() => {
      setActionInProgress("");
      
      // Show success notification (in real app, use a toast library)
      if (action === "restart") {
        alert("Modules restarted successfully!");
      } else if (action === "resolve") {
        alert("23 errors resolved!");
      } else if (action === "test") {
        alert("Performance test completed. Results: Optimal");
      } else if (action === "override") {
        if (window.confirm("Are you sure you want to enable manual override? This should only be used in critical situations.")) {
          alert("Manual override activated for 30 minutes");
        }
      }
    }, 2000);
  };

  // Export history to CSV
  const exportHistoryToCSV = () => {
    const headers = ['Action', 'User', 'Timestamp', 'Status'];
    const rows = actionHistoryData.map(item => [
      item.action,
      item.user,
      item.timestamp,
      item.status
    ]);
    
    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `action_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get alert background color
  const getAlertBg = (type) => {
    switch (type) {
      case "critical":
        return "bg-red-50";
      case "warning":
        return "bg-yellow-50";
      case "info":
        return "bg-green-50";
      default:
        return "bg-blue-50";
    }
  };

  // Get alert icon
  const getAlertIcon = (type) => {
    switch (type) {
      case "critical":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  return (
    <>
      <Layout>
        <div className="w-full h-full">
          <Navbar />
          <div className="w-full px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-5">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4 md:mb-5 lg:mb-6">
              <h3 className="text-[#1F3A93] font-[Poppins] font-[700] text-lg md:text-xl lg:text-2xl xl:text-3xl">
                Overview
              </h3>
              <div>
                <select 
                  className="border border-[#34495E] rounded-full px-3 md:px-4 lg:px-5 py-1.5 md:py-2 lg:py-2.5 outline-none text-[#34495E] cursor-pointer hover:border-[#1F3A93] transition-colors text-sm md:text-base font-[Poppins]"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option className="font-[Poppins] font-[400] text-[#34495E]">Day</option>
                  <option className="font-[Poppins] font-[400] text-[#34495E]">Week</option>
                  <option className="font-[Poppins] font-[400] text-[#34495E]">Month</option>
                  <option className="font-[Poppins] font-[400] text-[#34495E]">Quarter</option>
                  <option className="font-[Poppins] font-[400] text-[#34495E]">Year</option>
                </select>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="mb-4 md:mb-5 lg:mb-6">
              <Overviewcards />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5 mb-4 md:mb-5 lg:mb-6">
              <div className="xl:col-span-2">
                <div className="border border-[#BDC3C7] rounded-lg bg-white p-3 md:p-4 lg:p-5 shadow-sm h-full">
                  <FeatureUsageChart />
                </div>
              </div>
              <div className="xl:col-span-1">
                <div className="border border-[#BDC3C7] rounded-lg bg-white p-3 md:p-4 lg:p-5 shadow-sm h-full">
                  <PeakUsage />
                </div>
              </div>
            </div>

            {/* Bottom Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {/* System Alerts Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#BDC3C7] overflow-hidden">
                <div className="p-4 md:p-5 lg:p-6 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4 md:mb-5">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      System Alerts
                    </h3>
                    <button 
                      onClick={() => setAlertsModalOpen(true)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                    >
                      See All
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    {alerts.slice(0, 2).map((alert) => (
                      <div key={alert.id} className={`rounded-xl p-3 md:p-4 ${getAlertBg(alert.type)}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            alert.type === 'critical' ? 'bg-red-500' : 
                            alert.type === 'warning' ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                              {alert.title}
                            </h4>
                            {alert.recommendation && (
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                {alert.recommendation}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Panel Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#BDC3C7] overflow-hidden">
                <div className="p-4 md:p-5 lg:p-6 h-full flex flex-col space-y-2.5">
                  <div className="flex justify-between items-center mb-4 md:mb-5">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      Action Panel
                    </h3>
                    <button 
                      onClick={() => setHistoryModalOpen(true)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                    >
                      History
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2.5 md:space-y-3 flex-1 flex flex-col">
                    <button 
                      onClick={() => handleAction("restart")}
                      disabled={actionInProgress === "restart"}
                      className="w-full bg-blue-600 text-white font-medium text-sm py-2.5 md:py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {actionInProgress === "restart" ? "Restarting..." : "Restart Modules"}
                    </button>

                    <button 
                      onClick={() => handleAction("resolve")}
                      disabled={actionInProgress === "resolve"}
                      className="w-full bg-white border border-gray-300 text-gray-700 font-medium text-sm py-2.5 md:py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {actionInProgress === "resolve" ? "Resolving..." : "Resolve Errors (23)"}
                    </button>
                    
                    <button 
                      onClick={() => handleAction("test")}
                      disabled={actionInProgress === "test"}
                      className="w-full bg-white border border-gray-300 text-gray-700 font-medium text-sm py-2.5 md:py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {actionInProgress === "test" ? "Testing..." : "Test Performance"}
                    </button>

                    <div className="mt-auto pt-2">
                      <button 
                        onClick={() => handleAction("override")}
                        disabled={actionInProgress === "override"}
                        className="w-full bg-red-600 text-white font-medium text-sm py-2.5 md:py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {actionInProgress === "override" ? "Activating..." : "Manual Override"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#BDC3C7] overflow-hidden md:col-span-2 lg:col-span-1">
                <div className="p-4 md:p-5 lg:p-6 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4 md:mb-5">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      Support
                    </h3>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {/* FAQ Section */}
                    <div className="space-y-2 mb-4">
                      {faqData.slice(0, 2).map((faq) => (
                        <div key={faq.id} className="bg-gray-50 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            className="w-full px-3 md:px-4 py-2.5 md:py-3 flex justify-between items-center hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-700 text-left">
                              {faq.question}
                            </span>
                            <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${expandedFaq === faq.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {expandedFaq === faq.id && (
                            <div className="px-3 md:px-4 pb-2.5 md:pb-3 pt-1">
                              <p className="text-xs text-gray-600">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto space-y-2.5 md:space-y-3">
                      <button 
                        onClick={() => setSupportModalOpen(true)}
                        className="w-full bg-gray-100 text-gray-700 font-medium text-sm py-2.5 md:py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat with Support
                      </button>

                      <button 
                        onClick={() => alert("Calling support at: +1-800-SUPPORT")}
                        className="w-full bg-blue-600 text-white font-medium text-sm py-2.5 md:py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Support
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        Average response time: 2-3 minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Chat Modal */}
        {supportModalOpen && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#E8E6FF] to-[#F5F3FF] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#6366F1] rounded-xl flex items-center justify-center text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-[Poppins] font-semibold text-[#1A1B23]">Technical Support</h3>
                      <p className="text-sm text-[#6B7280]">We're here to help</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSupportModalOpen(false)}
                    className="text-[#6B7280] hover:text-[#374151] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#F3F4F6] rounded-xl">
                    <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#374151]">Average wait time</p>
                      <p className="text-xs text-[#6B7280]">2-3 minutes</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-[#6B7280]">Available support channels:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border border-[#E5E7EB] rounded-lg text-center hover:border-[#6366F1] transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center mx-auto mb-2">
                          💬
                        </div>
                        <p className="text-xs font-medium text-[#374151]">Live Chat</p>
                      </div>
                      <div className="p-3 border border-[#E5E7EB] rounded-lg text-center hover:border-[#6366F1] transition-colors cursor-pointer">
                        <div className="w-8 h-8 bg-[#EEF2FF] rounded-lg flex items-center justify-center mx-auto mb-2">
                          📧
                        </div>
                        <p className="text-xs font-medium text-[#374151]">Email</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => setSupportModalOpen(false)}
                    className="flex-1 px-4 py-2.5 text-[#374151] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] font-[Poppins] font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      window.open('https://support.example.com/chat', '_blank');
                      setSupportModalOpen(false);
                    }}
                    className="flex-1 px-4 py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#5558E3] font-[Poppins] font-medium text-sm transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Alerts Modal */}
        {alertsModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">All System Alerts</h3>
                  <button 
                    onClick={() => setAlertsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Filter Tabs */}
              <div className="border-b border-gray-100 px-6">
                <div className="flex gap-6">
                  <button className="py-3 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
                    All ({alerts.length})
                  </button>
                  <button className="py-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                    Critical ({alerts.filter(a => a.type === 'critical').length})
                  </button>
                  <button className="py-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                    Warning ({alerts.filter(a => a.type === 'warning').length})
                  </button>
                  <button className="py-3 px-1 text-gray-500 hover:text-gray-700 font-medium text-sm">
                    Resolved ({alerts.filter(a => a.status === 'resolved').length})
                  </button>
                </div>
              </div>
              
              {/* Alerts List */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 rounded-xl ${getAlertBg(alert.type)}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          alert.type === 'critical' ? 'bg-red-500' : 
                          alert.type === 'warning' ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {alert.title}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {alert.recommendation && (
                            <p className="text-sm text-gray-600 mb-2">
                              {alert.recommendation}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.status === 'resolved' 
                                ? 'bg-green-100 text-green-700' 
                                : alert.type === 'critical' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {alert.status === 'resolved' ? 'Resolved' : 'Active'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Mark all as read
                  </button>
                  <button 
                    onClick={() => setAlertsModalOpen(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action History Modal */}
        {historyModalOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Action History</h3>
                  <button 
                    onClick={() => setHistoryModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Search actions..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    <option>All Actions</option>
                    <option>Successful</option>
                    <option>Failed</option>
                    <option>Active</option>
                  </select>
                </div>
              </div>
              
              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {actionHistoryData.map((history) => (
                      <tr key={history.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              history.status === 'Success' ? 'bg-green-500' : 
                              history.status === 'Failed' ? 'bg-red-500' : 
                              'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-900">{history.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">{history.user.charAt(0)}</span>
                            </div>
                            <span className="text-sm text-gray-700">{history.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {history.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            history.status === 'Success' 
                              ? 'bg-green-100 text-green-700' 
                              : history.status === 'Failed' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {history.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Actions */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {actionHistoryData.length} of {actionHistoryData.length} results
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={exportHistoryToCSV}
                      className="px-4 py-2 text-blue-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </button>
                    <button 
                      onClick={() => setHistoryModalOpen(false)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};