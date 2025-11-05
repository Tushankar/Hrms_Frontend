import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";

const DirectDepositSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/hr-get-all-direct-deposit-submissions`,
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

  const handleView = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleClear = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to clear this submission? The employee will be able to re-upload."
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${baseURL}/onboarding/hr-clear-direct-deposit-submission/${id}`,
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
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/hr/document-management")}
            className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Document Management
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Direct Deposit Form Submissions
            </h1>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  No Direct Deposit form submissions yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Employee Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Submitted Date
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {submission.employeeId?.firstName}{" "}
                          {submission.employeeId?.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {submission.employeeId?.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {submission.employeeUploadedForm?.fileName || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {submission.employeeUploadedForm?.uploadedAt
                            ? new Date(
                                submission.employeeUploadedForm.uploadedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                handleDownload(
                                  submission.employeeUploadedForm?.filePath
                                )
                              }
                              className="inline-flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            <button
                              onClick={() => handleView(submission)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleClear(submission._id)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Clear Submission"
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

          {/* View Details Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Submission Details
                  </h2>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-600 hover:text-gray-800 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Employee Name
                    </label>
                    <p className="text-gray-600">
                      {selectedSubmission.employeeId?.firstName}{" "}
                      {selectedSubmission.employeeId?.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-600">
                      {selectedSubmission.employeeId?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      File Name
                    </label>
                    <p className="text-gray-600">
                      {selectedSubmission.employeeUploadedForm?.fileName ||
                        "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      File Size
                    </label>
                    <p className="text-gray-600">
                      {selectedSubmission.employeeUploadedForm?.fileSize
                        ? (
                            selectedSubmission.employeeUploadedForm.fileSize /
                            1024
                          ).toFixed(2) + " KB"
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Submission Date
                    </label>
                    <p className="text-gray-600">
                      {selectedSubmission.employeeUploadedForm?.uploadedAt
                        ? new Date(
                            selectedSubmission.employeeUploadedForm.uploadedAt
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <p className="text-gray-600">
                      {selectedSubmission.status || "N/A"}
                    </p>
                  </div>

                  {selectedSubmission.employeeUploadedForm?.filePath && (
                    <div className="mt-6">
                      <button
                        onClick={() =>
                          handleDownload(
                            selectedSubmission.employeeUploadedForm.filePath
                          )
                        }
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default DirectDepositSubmissions;
