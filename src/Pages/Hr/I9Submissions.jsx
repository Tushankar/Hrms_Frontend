import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";

const I9Submissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/hr-get-all-i9-submissions`,
        { withCredentials: true }
      );
      setSubmissions(response.data.submissions || []);
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

  const handleClear = async (id) => {
    if (!window.confirm("Are you sure you want to clear this submission? The employee will be able to re-upload.")) {
      return;
    }
    try {
      await axios.delete(
        `${baseURL}/onboarding/hr-clear-i9-submission/${id}`,
        { withCredentials: true }
      );
      toast.success("Submission cleared successfully");
      fetchSubmissions();
    } catch (error) {
      console.error("Error clearing submission:", error);
      toast.error("Failed to clear submission");
    }
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
              I-9 Form Submissions
            </h1>
            <p className="text-gray-600">
              Review all employee-submitted I-9 forms
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No submissions yet</p>
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
                  {submissions.map((submission) => (
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
                            onClick={() => handleClear(submission._id)}
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

export default I9Submissions;
