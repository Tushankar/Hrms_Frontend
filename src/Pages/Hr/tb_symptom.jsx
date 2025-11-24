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

const TBSymptomScreenHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [notes, setNotes] = useState("");
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

      console.log("Full Application Response:", appResponse.data?.data);

      const forms = appResponse.data?.data?.forms;
      const applicationData = appResponse.data?.data?.application;

      if (applicationData) {
        setEmployeeName(applicationData.employeeName || "Employee");
      }

      // Fetch uploaded documents
      const applicationId = appResponse.data?.data?.application?._id;
      if (applicationId) {
        await fetchUploadedDocuments(applicationId);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load employee submission");
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedDocuments = async (applicationId) => {
    try {
      if (!applicationId) {
        console.warn("Missing applicationId");
        setUploadedDocuments([]);
        return;
      }

      console.log(
        `Fetching TB Symptom Screen documents for applicationId: ${applicationId}`
      );

      const response = await axios.get(
        `${baseURL}/onboarding/tb-symptom-screen/get-tb-uploaded-documents/${applicationId}/tbSymptomScreen`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log("Documents Response:", response.data);

      // Handle the response properly - backend returns data with documents array
      const documents = response.data?.data?.documents || [];

      if (documents && documents.length > 0) {
        console.log("📄 Documents fetched:", documents);
        // Map documents to include fullUrl
        const mappedDocuments = documents.map((doc) => ({
          ...doc,
          fullUrl: doc.filePath.startsWith("http")
            ? doc.filePath
            : `${baseURL}/${doc.filePath}`,
        }));
        setUploadedDocuments(mappedDocuments);
      } else {
        console.log("No documents found in response");
        setUploadedDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      console.error("Error details:", error.response?.data);
      setUploadedDocuments([]);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const fileUrl = doc.filePath.startsWith("http")
        ? doc.filePath
        : `${baseURL}/${doc.filePath}`;

      const response = await axios.get(fileUrl, {
        responseType: "blob",
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.filename || "document");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

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
              TB Symptom Screen Submission
            </h1>
            <p className="text-gray-600">
              Review uploaded document for: <strong>{employeeName}</strong>
            </p>
          </div>

          {/* Status Banner */}
          {uploadedDocuments.length > 0 ? (
            <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-center justify-start gap-3">
                <FileText className="w-6 h-6 text-green-600 flex-shrink-0" />
                <p className="text-base font-semibold text-green-800">
                  {uploadedDocuments.length} document(s) submitted
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-lg border bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <p className="text-base font-semibold text-yellow-800">
                  No TB Symptom Screen document submitted yet
                </p>
              </div>
            </div>
          )}

          {/* Documents Section */}
          {uploadedDocuments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Submitted Documents
              </h2>
              <div className="space-y-3">
                {uploadedDocuments.map((doc, index) => (
                  <div
                    key={doc._id || index}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <File className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">
                            {doc.filename}
                          </h3>
                          <div className="flex gap-3 text-xs text-gray-600 mt-1">
                            {doc.fileSize && (
                              <span>
                                {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                            {doc.uploadedAt && (
                              <span>
                                Uploaded:{" "}
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={
                            doc.fullUrl ||
                            (doc.filePath.startsWith("http")
                              ? doc.filePath
                              : `${baseURL}/${doc.filePath}`)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <HRNotesInput
              employeeId={employeeId}
              formType="tbSymptomScreen"
              onNotesChange={setNotes}
              showSignature={false}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6 mt-8">
          <button
            onClick={() =>
              navigate(`/hr/staff-misconduct-statement/${employeeId}`)
            }
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous: Staff Misconduct
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Exit to Dashboard
          </button>
          <button
            onClick={() => navigate(`/hr/i9-form/${employeeId}`)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Next: I-9 Form
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default TBSymptomScreenHR;
