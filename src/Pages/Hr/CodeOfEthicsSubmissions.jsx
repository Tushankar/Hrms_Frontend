import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Download, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";

const CodeOfEthicsSubmissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/hr-get-all-code-of-ethics-submissions`,
        { withCredentials: true }
      );

      if (response.data?.submissions) {
        setSubmissions(response.data.submissions);
      }
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
    if (
      !window.confirm(
        "Are you sure you want to clear this submission? The employee will be able to re-upload."
      )
    ) {
      return;
    }
    try {
      await axios.delete(
        `${baseURL}/onboarding/hr-clear-code-of-ethics-submission/${id}`,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HR Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Code of Ethics Submissions
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No submissions yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Uploaded Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      Signature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Signature Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.employeeId?.firstName}{" "}
                          {submission.employeeId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.employeeId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.employeeUploadedForm?.filename}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(
                          submission.employeeUploadedForm?.uploadedAt
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {submission.employeeSignature ? (
                          <button
                            onClick={() =>
                              setSelectedSignature(submission.employeeSignature)
                            }
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No signature
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.signatureDate
                          ? new Date(
                              submission.signatureDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() =>
                              handleDownload(
                                submission.employeeUploadedForm?.filePath
                              )
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors text-sm"
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

        {/* Signature Modal */}
        {selectedSignature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Employee Signature
              </h3>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
                <img
                  src={`${baseURL}/${selectedSignature}`}
                  alt="Employee Signature"
                  className="w-full h-auto"
                />
              </div>
              <button
                onClick={() => setSelectedSignature(null)}
                className="w-full px-4 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default CodeOfEthicsSubmissions;
