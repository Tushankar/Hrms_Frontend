import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";

const NonCompeteSubmissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/hr-get-all-non-compete-submissions`,
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

  return (
    <Layout>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/document-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Non-Compete Agreement Submissions
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.employeeId?.firstName} {submission.employeeId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.employeeId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submission.employeeUploadedForm?.filename}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(submission.employeeUploadedForm?.uploadedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDownload(submission.employeeUploadedForm?.filePath)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
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

export default NonCompeteSubmissions;
