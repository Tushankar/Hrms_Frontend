import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Download, FileText, CheckCircle, Eye, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const LicensedPracticalNurseHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [template, setTemplate] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchTemplate();
    if (employeeId) {
      fetchEmployeeSubmission();
    }
  }, [employeeId]);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-lpn-job-description-template`,
        { withCredentials: true }
      );
      setTemplate(response.data.template);
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeSubmission = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );
      const formData = response.data?.data?.forms?.jobDescriptionLPN;
      if (formData?.employeeUploadedForm) {
        setSubmission(formData.employeeUploadedForm);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", user?._id || "");

      const response = await axios.post(
        `${baseURL}/onboarding/hr-upload-lpn-job-description-template`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Template uploaded successfully!");
        setFile(null);
        fetchTemplate();
      }
    } catch (error) {
      console.error("Error uploading template:", error);
      toast.error("Failed to upload template");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (template) {
      window.open(`${baseURL}/${template.filePath}`, "_blank");
    }
  };

  const handleDownloadSubmission = () => {
    if (submission) {
      window.open(`${baseURL}/${submission.filePath}`, "_blank");
    }
  };

  const handleClearSubmission = async () => {
    if (!window.confirm("Are you sure you want to clear this employee's submission? The employee will need to re-upload the document.")) {
      return;
    }

    try {
      await axios.delete(
        `${baseURL}/onboarding/hr-clear-lpn-submission/${employeeId}`,
        { withCredentials: true }
      );
      toast.success("Submission cleared successfully");
      setSubmission(null);
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
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              LPN Job Description (Exhibit 1c)
            </h1>
            <p className="text-gray-600">
              Upload job description template and view employee submissions
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Upload Job Description Template
                </h2>
                
                {template && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-700">Current template: {template.filename}</span>
                      </div>
                      <button
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1F3A93] text-white rounded hover:bg-[#16307E] transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Select New Template
                  </label>
                  {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {uploading ? "Uploading..." : "Upload Template"}
                </button>
              </div>

              {employeeId && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Employee Submission
                  </h2>
                  
                  {submission ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-green-700 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Document submitted</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Submitted on: {new Date(submission.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDownloadSubmission}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button
                            onClick={handleClearSubmission}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No submission from this employee yet</p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center pt-4">
                <button
                  onClick={() => navigate("/hr/lpn-job-description-submissions")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md"
                >
                  <Eye className="w-5 h-5" />
                  View All Employee Submissions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default LicensedPracticalNurseHR;
