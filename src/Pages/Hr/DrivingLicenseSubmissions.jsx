import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, Trash2, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";

const HRNotesInput = ({
  formType,
  employeeId,
  existingNote,
  existingReviewedAt,
  onNoteSaved,
  formData,
}) => {
  const [note, setNote] = useState(existingNote || "");
  const [submitting, setSubmitting] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${baseURL}/onboarding/save-hr-notes`,
        {
          formType,
          employeeId,
          comment: note,
        },
        { withCredentials: true }
      );

      toast.success("Note saved successfully!");
      setNote("");
      if (onNoteSaved) {
        onNoteSaved();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(error.response?.data?.message || "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          HR Notes & Feedback
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter your notes or feedback..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3A93] focus:border-transparent resize-vertical min-h-[120px] text-sm"
        />
      </div>

      {existingReviewedAt && (
        <div className="text-xs text-gray-500">
          Last reviewed: {new Date(existingReviewedAt).toLocaleString()}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full px-4 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {submitting ? "Saving..." : "Save Note"}
      </button>
    </div>
  );
};

const DrivingLicenseSubmissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/hr-get-all-driving-license-submissions`,
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

  const handleDownload = (filePath, fileName) => {
    if (!filePath) {
      toast.error("No file to download");
      return;
    }
    window.open(`${baseURL}/${filePath}`, "_blank");
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      await axios.post(
        `${baseURL}/onboarding/delete-driving-license-submission`,
        { submissionId },
        { withCredentials: true }
      );

      toast.success("Submission deleted successfully");
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete submission");
    }
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
            Driver's License Submissions
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
            <div className="space-y-6">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
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
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              submission.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : submission.status === "under_review"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {submission.status || "pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedSubmission.employeeId?.firstName}{" "}
                  {selectedSubmission.employeeId?.lastName}
                </h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Employee Information */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Employee Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">
                        {selectedSubmission.employeeId?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">
                        {selectedSubmission.employeeId?.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Information */}
                {selectedSubmission.employeeUploadedForm && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Document Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-600 text-sm">File Name</p>
                        <p className="font-medium text-gray-900">
                          {selectedSubmission.employeeUploadedForm?.filename}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Uploaded Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            selectedSubmission.employeeUploadedForm?.uploadedAt
                          ).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleDownload(
                            selectedSubmission.employeeUploadedForm?.filePath,
                            selectedSubmission.employeeUploadedForm?.filename
                          )
                        }
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Document
                      </button>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Status</h3>
                  <span
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      selectedSubmission.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedSubmission.status === "under_review"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedSubmission.status || "pending"}
                  </span>
                </div>

                {/* HR Notes */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <HRNotesInput
                    formType="driving-license"
                    employeeId={selectedSubmission.employeeId?._id}
                    existingNote={selectedSubmission.hrFeedback?.comment}
                    existingReviewedAt={
                      selectedSubmission.hrFeedback?.reviewedAt
                    }
                    onNoteSaved={() => fetchSubmissions()}
                    formData={selectedSubmission}
                  />
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(selectedSubmission._id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Submission
                </button>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default DrivingLicenseSubmissions;
