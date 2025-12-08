import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, FileText, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";

const DrivingLicenseHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchSubmission();
    }
  }, [employeeId]);

  const fetchSubmission = async () => {
    try {
      // First try to get the application with forms
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

      // Also fetch directly from driving license endpoint to get all uploaded files
      try {
        // Get the application ID from the first response
        const appId = response.data?.data?.application?._id;
        if (appId) {
          const licenseResponse = await axios.get(
            `${baseURL}/onboarding/get-driving-license/${appId}`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (licenseResponse.data?.drivingLicense) {
            const drivingLicense = licenseResponse.data.drivingLicense;
            setSubmission(drivingLicense);

            // Set uploaded files if available
            if (
              drivingLicense.uploadedFiles &&
              drivingLicense.uploadedFiles.length > 0
            ) {
              setUploadedFiles(drivingLicense.uploadedFiles);
            } else if (drivingLicense.employeeUploadedForm) {
              // Fallback to single file for backward compatibility
              setUploadedFiles([drivingLicense.employeeUploadedForm]);
            }
          }
        }
      } catch (licenseError) {
        console.log(
          "Could not fetch from driving license endpoint:",
          licenseError.message
        );
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load employee submission");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const appId = submission?.applicationId;
      if (!appId || !fileId) {
        // For backward compatibility with old data
        window.open(
          submission?.employeeUploadedForm?.fileUrl ||
            `${baseURL}/${submission?.employeeUploadedForm?.filePath}`,
          "_blank"
        );
        return;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/download-driving-license-file/${appId}/${fileId}`,
        {
          responseType: "blob",
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "document.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
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
              {uploadedFiles.length === 0 &&
                !submission?.employeeUploadedForm && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <p className="text-yellow-800">
                      No driving license submission found for this employee.
                    </p>
                  </div>
                )}
              {uploadedFiles.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Employee Driving License Documents ({uploadedFiles.length})
                  </h2>
                  <div className="space-y-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={file._id || index}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">
                              {file.originalName || file.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(file.uploadedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleDownloadFile(
                              file._id,
                              file.originalName || file.filename
                            )
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors text-sm font-medium ml-3 flex-shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                  {submission?.status && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Status:{" "}
                        <span className="capitalize px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                          {submission.status}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
              {uploadedFiles.length === 0 &&
                submission?.employeeUploadedForm && (
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Employee Driving License (Legacy)
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
                  </div>
                )}
              {(uploadedFiles.length > 0 || submission) && (
                <div className="border border-gray-200 rounded-lg p-6">
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
