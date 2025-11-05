import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";

const JobDescriptionSubmissions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("PCA");
  const [submissions, setSubmissions] = useState({
    PCA: [],
    CNA: [],
    LPN: [],
    RN: []
  });
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  const fetchAllSubmissions = async () => {
    setLoading(true);
    try {
      const endpoints = {
        PCA: "/onboarding/hr-get-all-pca-job-description-submissions",
        CNA: "/onboarding/hr-get-all-cna-job-description-submissions",
        LPN: "/onboarding/hr-get-all-lpn-job-description-submissions",
        RN: "/onboarding/hr-get-all-rn-job-description-submissions"
      };

      const results = await Promise.all(
        Object.entries(endpoints).map(async ([key, endpoint]) => {
          try {
            const response = await axios.get(`${baseURL}${endpoint}`, { withCredentials: true });
            return [key, response.data.submissions || []];
          } catch (error) {
            console.error(`Error fetching ${key} submissions:`, error);
            return [key, []];
          }
        })
      );

      setSubmissions(Object.fromEntries(results));
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filePath) => {
    window.open(`${baseURL}/${filePath}`, "_blank");
  };

  const handleClear = async (id, type) => {
    if (!window.confirm("Are you sure you want to clear this submission? The employee will be able to re-upload.")) {
      return;
    }
    try {
      const endpoints = {
        PCA: `/onboarding/hr-clear-pca-submission/${id}`,
        CNA: `/onboarding/hr-clear-cna-submission/${id}`,
        LPN: `/onboarding/hr-clear-lpn-submission/${id}`,
        RN: `/onboarding/hr-clear-rn-submission/${id}`
      };
      
      await axios.delete(`${baseURL}${endpoints[type]}`, { withCredentials: true });
      toast.success("Submission cleared successfully");
      fetchAllSubmissions();
    } catch (error) {
      console.error("Error clearing submission:", error);
      toast.error("Failed to clear submission");
    }
  };

  const tabs = [
    { id: "PCA", name: "Personal Care Assistant", color: "amber" },
    { id: "CNA", name: "Certified Nursing Assistant", color: "lime" },
    { id: "LPN", name: "Licensed Practical Nurse", color: "emerald" },
    { id: "RN", name: "Registered Nurse", color: "teal" }
  ];

  const getTabColor = (color, isActive) => {
    const colors = {
      amber: isActive ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700 hover:bg-amber-200",
      lime: isActive ? "bg-lime-500 text-white" : "bg-lime-100 text-lime-700 hover:bg-lime-200",
      emerald: isActive ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      teal: isActive ? "bg-teal-500 text-white" : "bg-teal-100 text-teal-700 hover:bg-teal-200"
    };
    return colors[color];
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HR Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Job Description Submissions
            </h1>
            <p className="text-gray-600">
              Review all employee-submitted job description documents by position type
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${getTabColor(tab.color, activeTab === tab.id)}`}
              >
                {tab.name}
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-30 rounded-full text-xs">
                  {submissions[tab.id]?.length || 0}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : submissions[activeTab]?.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No {activeTab} submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions[activeTab]?.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.employeeId?.firstName} {submission.employeeId?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {submission.employeeId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(submission.employeeUploadedForm.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(submission.employeeUploadedForm.filePath)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button
                            onClick={() => handleClear(submission._id, activeTab)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default JobDescriptionSubmissions;
