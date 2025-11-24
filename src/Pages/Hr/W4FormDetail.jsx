import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";

const W4FormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-w4-submission/${id}`,
        { withCredentials: true }
      );
      setSubmission(response.data.submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (submission?.employeeUploadedForm?.filePath) {
      window.open(`${baseURL}/${submission.employeeUploadedForm.filePath}`, "_blank");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate("/hr/w4-submissions")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">W-4 Form Review</h2>

          {submission ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Employee Name</label>
                  <p className="text-gray-900">
                    {submission.employeeId?.firstName} {submission.employeeId?.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{submission.employeeId?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Submitted Date</label>
                  <p className="text-gray-900">
                    {new Date(submission.employeeUploadedForm?.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <p className="text-gray-900">
                    <span className={`px-2 py-1 rounded ${submission.status === "completed" || submission.status === "submitted" ? "bg-green-100 text-green-800" : submission.status === "under_review" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                      {submission.status || "draft"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Uploaded Document</label>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download W-4 Form
                </button>
              </div>

              <HRNotesInput
                formType="w4-form"
                employeeId={submission.employeeId?._id}
                existingNote={submission.hrFeedback?.comment}
                existingReviewedAt={submission.hrFeedback?.reviewedAt}
                onNoteSaved={fetchSubmission}
                formData={submission}
              />
            </>
          ) : (
            <p className="text-gray-500">Submission not found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default W4FormDetail;
