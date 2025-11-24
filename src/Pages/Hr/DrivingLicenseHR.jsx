import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";

const DrivingLicenseHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchSubmission();
    }
  }, [employeeId]);

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const drivingLicenseData = response.data?.data?.forms?.drivingLicense;
      if (drivingLicenseData) {
        setSubmission(drivingLicenseData);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load employee submission");
    } finally {
      setLoading(false);
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Driver's License
            </h1>
            <p className="text-gray-600">
              View employee driving license submission
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <>
              {!submission?.employeeUploadedForm && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800">
                    No driving license submission found for this employee.
                  </p>
                </div>
              )}
              {submission?.employeeUploadedForm && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Employee Driving License
                  </h2>
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <span className="capitalize px-2 py-1 rounded bg-green-100 text-green-800">
                        submitted
                      </span>
                    </p>
                    {submission.employeeUploadedForm.filename && (
                      <p className="text-sm text-gray-600">
                        File:{" "}
                        <span className="font-medium">
                          {submission.employeeUploadedForm.filename}
                        </span>
                      </p>
                    )}
                    {submission.employeeUploadedForm.uploadedAt && (
                      <p className="text-sm text-gray-600">
                        Uploaded:{" "}
                        <span className="font-medium">
                          {new Date(
                            submission.employeeUploadedForm.uploadedAt
                          ).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                    {(submission.employeeUploadedForm.filePath ||
                      submission.employeeUploadedForm.fileUrl) && (
                      <button
                        onClick={() =>
                          window.open(
                            submission.employeeUploadedForm.fileUrl ||
                              `${baseURL}/${submission.employeeUploadedForm.filePath}`,
                            "_blank"
                          )
                        }
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download Submission
                      </button>
                    )}
                  </div>
                  <HRNotesInput
                    formType="drivingLicense"
                    employeeId={employeeId}
                    existingNote={submission?.hrFeedback?.comment}
                    existingReviewedAt={submission?.hrFeedback?.reviewedAt}
                    onNoteSaved={fetchSubmission}
                    formData={submission}
                    showSignature={false}
                  />
                </div>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6">
            <button
              onClick={() =>
                navigate(`/hr/employee-details-upload/${employeeId}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: Professional Certificates
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() =>
                navigate(`/hr/background-check-form/${employeeId}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Next: Background Check
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default DrivingLicenseHR;
