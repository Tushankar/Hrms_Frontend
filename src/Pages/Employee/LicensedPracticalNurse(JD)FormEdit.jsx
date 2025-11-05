import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  CheckCircle,
  Send,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const FORM_KEYS = [
  "personalInformation",
  "professionalExperience",
  "workExperience",
  "education",
  "references",
  "legalDisclosures",
  "positionType",
  "employmentApplication",
  "orientationPresentation",
  "w4Form",
  "w9Form",
  "i9Form",
  "emergencyContact",
  "directDeposit",
  "misconductStatement",
  "codeOfEthics",
  "serviceDeliveryPolicy",
  "nonCompeteAgreement",
  "backgroundCheck",
  "tbSymptomScreen",
  "orientationChecklist",
  "jobDescriptionPCA",
  "jobDescriptionCNA",
  "jobDescriptionLPN",
  "jobDescriptionRN",
];

const LicensedPracticalNurseFormEdit = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [completedForms, setCompletedForms] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchTemplate();
    checkSubmission();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-lpn-job-description-template`,
        { withCredentials: true }
      );
      setTemplate(response.data.template);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("No template available");
    } finally {
      setLoading(false);
    }
  };

  const checkSubmission = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (user?._id) {
        const appResponse = await axios.get(
          `${baseURL}/onboarding/get-application/${user._id}`,
          { withCredentials: true }
        );

        const applicationId = appResponse.data?.data?.application?._id;
        if (applicationId) {
          const forms = appResponse.data?.data?.forms;
          const completedFormsArray =
            appResponse.data.data.application?.completedForms || [];
          const completedSet = new Set(completedFormsArray);

          const completed = FORM_KEYS.filter((key) => {
            const form = forms[key];
            return (
              form &&
              (form.status === "completed" ||
                form.status === "submitted" ||
                form.status === "under_review" ||
                form.status === "approved" ||
                form.employeeUploadedForm ||
                completedSet.has(key))
            );
          });
          setCompletedForms(completed);
          const progressPercentage = Math.round(
            (completed.length / FORM_KEYS.length) * 100
          );
          setOverallProgress(progressPercentage);

          const response = await axios.get(
            `${baseURL}/onboarding/job-description/${applicationId}/LPN`,
            { withCredentials: true }
          );
          if (response.data.data?.employeeUploadedForm) {
            setSubmission(response.data.data.employeeUploadedForm);
          }
        }
      }
    } catch (error) {
      console.error("Error checking submission:", error);
    }
  };

  const handleDownload = () => {
    if (template) {
      window.open(`${baseURL}/${template.filePath}`, "_blank");
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

      if (!user?._id) {
        toast.error("User not found");
        return;
      }

      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      const applicationId = appResponse.data?.data?.application?._id;
      if (!applicationId) {
        toast.error("Application not found");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId);
      formData.append("employeeId", user._id);

      const response = await axios.post(
        `${baseURL}/onboarding/employee-upload-signed-lpn-job-description`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Signed document uploaded successfully!");
        setFile(null);
        setSubmission(response.data.lpnJobDescription.employeeUploadedForm);

        setTimeout(() => {
          navigate("/employee/job-description-rn");
        }, 1500);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/task-management")}
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
              Download, review, sign digitally, and upload the document
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Progress: {completedForms.length}/{FORM_KEYS.length} forms
              completed
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Step 1: Download Template
                </h2>
                {template ? (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download LPN Job Description
                  </button>
                ) : (
                  <p className="text-gray-500">No template available</p>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Step 2: Upload Signed Document
                </h2>

                {submission ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">
                        Document submitted successfully
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Submitted on:{" "}
                      {new Date(submission.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <>
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
                        Select Signed PDF
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
                      {uploading ? "Uploading..." : "Submit Signed Document"}
                    </button>
                  </>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                      Application Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {completedForms.length}/{FORM_KEYS.length}
                    </div>
                    <div className="text-xs text-gray-600">Forms Completed</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">
                      Overall Progress
                    </span>
                    <span className="text-xs font-bold text-blue-600">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 text-center">
                  📝 Current: LPN Job Description
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/job-description-cna")}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4 inline mr-2" />
                    Previous Form
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (submission) {
                        navigate("/employee/job-description-rn");
                      } else {
                        toast.error(
                          "Please upload the signed document before proceeding"
                        );
                      }
                    }}
                    disabled={!submission}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="text-sm sm:text-base">Save & Next</span>
                    <Send className="w-5 h-5" />
                  </button>
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

export default LicensedPracticalNurseFormEdit;
