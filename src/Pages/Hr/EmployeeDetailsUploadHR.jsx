import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  AlertCircle,
  Eye,
  File,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";

const EmployeeDetailsUploadHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState("");
  const [formData, setFormData] = useState(null);
  const [uploadedForm, setUploadedForm] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [positionType, setPositionType] = useState("");
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchSubmission();
    }
  }, [employeeId]);

  const fetchSubmission = async () => {
    try {
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const forms = appResponse.data?.data?.forms;
      const jobDescData =
        forms?.jobDescriptionPCA ||
        forms?.jobDescriptionCNA ||
        forms?.jobDescriptionLPN ||
        forms?.jobDescriptionRN;

      if (jobDescData) {
        console.log("📄 Job Description Form Data:", jobDescData);
        setFormData(jobDescData);
        setEmployeeName(jobDescData.employeeName || "Employee");
        setUploadedForm(jobDescData.employeeUploadedForm);

        // Determine position type
        const posType =
          jobDescData.positionType ||
          (forms?.jobDescriptionPCA
            ? "PCA"
            : forms?.jobDescriptionCNA
            ? "CNA"
            : forms?.jobDescriptionLPN
            ? "LPN"
            : "RN");
        setPositionType(posType);

        // Fetch multiple documents using the new endpoint
        await fetchUploadedDocuments(appResponse.data?.data?._id, posType);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load employee submission");
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedDocuments = async (applicationId, posType) => {
    try {
      if (!applicationId || !posType) {
        console.warn("Missing applicationId or positionType");
        return;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/get-uploaded-documents/${applicationId}/${posType}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data?.success && response.data?.data?.documents) {
        console.log("📄 Documents fetched:", response.data.data.documents);
        setUploadedDocuments(response.data.data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      // Don't show error toast, just log it
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
              Job Description Agreement
            </h1>
            <p className="text-gray-600">
              View employee's signed job description • {employeeName}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Document Section */}
              {uploadedDocuments && uploadedDocuments.length > 0 ? (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Uploaded Documents ({uploadedDocuments.length})
                    </h2>
                    <div className="space-y-3">
                      {uploadedDocuments.map((doc, index) => (
                        <div
                          key={doc._id || index}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                <File className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-800 text-sm truncate">
                                  {doc.filename || `Document ${index + 1}`}
                                </h3>
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                  {doc.fileSize && (
                                    <p>
                                      📊 Size:{" "}
                                      {(doc.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                  )}
                                  {doc.uploadedAt && (
                                    <p>
                                      📅 Uploaded:{" "}
                                      {new Date(
                                        doc.uploadedAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  )}
                                  {doc.mimeType && (
                                    <p>🔖 Type: {doc.mimeType}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <a
                                href={`${baseURL}/${
                                  doc.filePath.startsWith("/")
                                    ? doc.filePath.substring(1)
                                    : doc.filePath
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </a>
                              <a
                                href={`${baseURL}/${
                                  doc.filePath.startsWith("/")
                                    ? doc.filePath.substring(1)
                                    : doc.filePath
                                }`}
                                download
                                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : uploadedForm ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                          <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-green-800 mb-1">
                            Job Description Document (Legacy)
                          </h3>
                          <p className="text-sm text-green-600 mb-3">
                            {uploadedForm.filename ||
                              "Job Description Agreement"}
                          </p>
                          <p className="text-xs text-green-600 mb-3">
                            Uploaded:{" "}
                            {uploadedForm.uploadedAt
                              ? new Date(
                                  uploadedForm.uploadedAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <div className="flex gap-3">
                            <a
                              href={`${baseURL}/${
                                uploadedForm.filePath.startsWith("/")
                                  ? uploadedForm.filePath.substring(1)
                                  : uploadedForm.filePath
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              <Download className="w-4 h-4" />
                              Download Document
                            </a>
                            <a
                              href={`${baseURL}/${
                                uploadedForm.filePath.startsWith("/")
                                  ? uploadedForm.filePath.substring(1)
                                  : uploadedForm.filePath
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              View Document
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <AlertCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 mb-1">
                        No Documents Submitted
                      </h3>
                      <p className="text-sm text-amber-600">
                        The employee has not submitted any Job Description
                        documents yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* HR Notes Section */}
              <HRNotesInput
                formType="jobDescription"
                employeeId={employeeId}
                existingNote={formData?.hrFeedback?.comment}
                existingReviewedAt={formData?.hrFeedback?.reviewedAt}
                onNoteSaved={fetchSubmission}
                formData={formData}
                showSignature={false}
              />
            </>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default EmployeeDetailsUploadHR;
