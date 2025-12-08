import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Send,
  Trash2,
  Download,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";

const FORM_KEYS = [
  "employmentType",
  "personalInformation",
  "professionalExperience",
  "workExperience",
  "education",
  "references",
  "legalDisclosures",
  "jobDescriptionPCA",
  "codeOfEthics",
  "serviceDeliveryPolicy",
  "nonCompeteAgreement",
  "misconductStatement",
  "orientationPresentation",
  "orientationChecklist",
  "backgroundCheck",
  "tbSymptomScreen",
  "emergencyContact",
  "w4Form",
  "w9Form",
  "directDeposit",
];

const CPRFirstAidCertificate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cprFiles, setCprFiles] = useState([]);
  const [uploadedCprCerts, setUploadedCprCerts] = useState([]);
  const [uploadingCpr, setUploadingCpr] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [uploadedCprCert, setUploadedCprCert] = useState(null);
  const [completedForms, setCompletedForms] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  const [employmentType, setEmploymentType] = useState(null);
  const [totalForms, setTotalForms] = useState(20); // default to 20
  const baseURL = import.meta.env.VITE__BASEURL;

  const shouldCountForm = (formKey) => {
    if (employmentType === "W-2 Employee") {
      return formKey !== "w9Form";
    } else if (employmentType === "1099 Contractor") {
      return formKey !== "w4Form";
    }
    return formKey !== "w9Form"; // default to W-2 if not set
  };

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        toast.error("User not found. Please log in again.");
        setLoading(false);
        return;
      }
      const user = JSON.parse(userCookie);

      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);
        setEmploymentType(appResponse.data.data.application.employmentType);
        if (
          appResponse.data.data.forms.backgroundCheck?.cprFirstAidCertificate
        ) {
          setUploadedCprCert(
            appResponse.data.data.forms.backgroundCheck.cprFirstAidCertificate
          );
        }

        // Load all uploaded CPR certificates
        if (appResponse.data.data.forms.backgroundCheck?.cprCertificates) {
          setUploadedCprCerts(
            appResponse.data.data.forms.backgroundCheck.cprCertificates
          );
        }

        // Load status and HR feedback
        if (appResponse.data.data.forms.backgroundCheck?.status) {
          setFormStatus(appResponse.data.data.forms.backgroundCheck.status);
        }
        if (appResponse.data.data.forms.backgroundCheck?.hrFeedback) {
          setHrFeedback(appResponse.data.data.forms.backgroundCheck.hrFeedback);
        }

        const forms = appResponse.data.data.forms;
        const completedFormsArray =
          appResponse.data.data.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const filteredKeys = FORM_KEYS.filter(shouldCountForm);
        setTotalForms(filteredKeys.length);

        const completed = filteredKeys.filter((key) => {
          let form = forms[key];
          if (key === "jobDescriptionPCA") {
            form =
              forms.jobDescriptionPCA ||
              forms.jobDescriptionCNA ||
              forms.jobDescriptionLPN ||
              forms.jobDescriptionRN;
          }
          return (
            ["submitted", "completed", "under_review", "approved"].includes(
              form?.status
            ) ||
            (key === "employmentType" &&
              appResponse.data.data.application.employmentType)
          );
        });

        setCompletedForms(completed);

        const progressPercentage = Math.round(
          (completed.length / filteredKeys.length) * 100
        );
        setOverallProgress(progressPercentage);
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      toast.error("Could not load application data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCprFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length !== selectedFiles.length) {
      toast.error("All files must be PDF format");
      return;
    }

    setCprFiles([...cprFiles, ...pdfFiles]);
  };

  const removeSelectedFile = (index) => {
    setCprFiles(cprFiles.filter((_, i) => i !== index));
  };

  const handleCprUpload = async () => {
    if (cprFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    setUploadingCpr(true);
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) {
        toast.error("Session expired. Please log in again.");
        setUploadingCpr(false);
        return;
      }
      const user = JSON.parse(userCookie);

      const formData = new FormData();
      cprFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("applicationId", applicationId);
      formData.append("employeeId", user._id);

      const response = await axios.post(
        `${baseURL}/onboarding/employee-upload-cpr-certificates`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data?.backgroundCheck) {
        toast.success(`${cprFiles.length} file(s) uploaded successfully!`);
        setCprFiles([]);
        setUploadedCprCerts(
          response.data.backgroundCheck.cprCertificates || []
        );
        setUploadedCprCert(
          response.data.backgroundCheck.cprFirstAidCertificate
        );
        window.dispatchEvent(new Event("formStatusUpdated"));
      }
    } catch (error) {
      console.error("Error uploading certificates:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload certificates"
      );
    } finally {
      setUploadingCpr(false);
    }
  };

  const handleRemoveUploadedFile = async (fileId) => {
    try {
      if (!applicationId || !fileId) {
        toast.error("Missing required information");
        return;
      }

      await axios.post(
        `${baseURL}/onboarding/remove-cpr-certificate-file`,
        {
          applicationId,
          fileId,
        },
        { withCredentials: true }
      );

      const updatedFiles = uploadedCprCerts.filter((f) => f._id !== fileId);
      setUploadedCprCerts(updatedFiles);

      if (updatedFiles.length === 0) {
        setUploadedCprCert(null);
      }

      toast.success("File removed successfully");
      window.dispatchEvent(new Event("formStatusUpdated"));
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error(error.response?.data?.message || "Failed to remove file");
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      if (!applicationId || !fileId) {
        toast.error("Missing required information");
        return;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/download-cpr-certificate/${applicationId}/${fileId}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "certificate.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleRemoveAllUploads = async () => {
    try {
      if (!applicationId) {
        toast.error("Missing application information");
        return;
      }

      // Remove each file
      for (const file of uploadedCprCerts) {
        await axios.post(
          `${baseURL}/onboarding/remove-cpr-certificate-file`,
          {
            applicationId,
            fileId: file._id,
          },
          { withCredentials: true }
        );
      }

      setUploadedCprCerts([]);
      setUploadedCprCert(null);
      setCprFiles([]);
      toast.success(
        "All certificates removed successfully. You can upload new ones."
      );
      window.dispatchEvent(new Event("formStatusUpdated"));
    } catch (error) {
      console.error("Error removing certificates:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove certificates"
      );
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 pt-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>

      {/* HR Feedback Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Vertical Progress Bar Sidebar */}
          <div className="w-16 flex-shrink-0 hidden md:block">
            <div className="sticky top-6 flex md:flex-col items-center">
              <div className="w-full md:w-4 h-4 md:h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                <div
                  className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm h-full md:h-auto md:w-4"
                  style={{
                    width: `${overallProgress}%`,
                    height:
                      window.innerWidth < 768 ? "100%" : `${overallProgress}%`,
                  }}
                ></div>
              </div>
              <div className="mt-0 md:mt-4 text-center ml-4 md:ml-0">
                <div className="text-lg font-bold text-blue-600">
                  {overallProgress}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Progress</div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              {/* Status Banner */}
              {!loading && (
                <div
                  className={`mb-6 p-4 rounded-lg border ${
                    uploadedCprCerts.length > 0
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {uploadedCprCerts.length > 0 ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      {uploadedCprCerts.length > 0 ? (
                        <>
                          <p className="text-base font-semibold text-green-800">
                            ✅ Progress Updated - {uploadedCprCerts.length}{" "}
                            Certificate(s) Uploaded Successfully on{" "}
                            {new Date(
                              uploadedCprCerts[0]?.uploadedAt
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            You cannot make any changes to the form until HR
                            provides their feedback.
                          </p>
                        </>
                      ) : (
                        <p className="text-base font-semibold text-red-800">
                          ⚠️ Not filled yet - Upload your certificate(s) to
                          complete your progress
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  CPR/First Aid Certificate
                </h1>
                <p className="text-gray-600">
                  Upload your CPR/First Aid certificate (Optional)
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Progress: {completedForms.length}/{totalForms} forms completed
                </div>
              </div>

              <div className="space-y-6">
                {/* Instructions Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        📋 Instructions
                      </h3>
                      <ol className="space-y-3 text-sm text-gray-700">
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            1.
                          </span>
                          <span>
                            Ensure you have a valid CPR/First Aid certificate
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            2.
                          </span>
                          <span>Scan the certificate as a PDF</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            3.
                          </span>
                          <span>
                            Upload the PDF using the upload button below
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-purple-600 flex-shrink-0">
                            4.
                          </span>
                          <span>
                            Click "Save & Next" to proceed to the next form
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Upload CPR/First Aid Certificate(s)
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    This is optional. If you have CPR/First Aid certificate(s),
                    please upload them here. You can upload multiple
                    certificates.
                  </p>

                  {uploadedCprCerts.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-white border border-purple-300 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-3">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">
                            {uploadedCprCerts.length} Certificate(s) Uploaded!
                          </span>
                        </div>

                        <div className="space-y-3 mt-4">
                          {uploadedCprCerts.map((cert, index) => (
                            <div
                              key={cert._id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">
                                    {cert.originalName || cert.filename}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      cert.uploadedAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-3">
                                <button
                                  onClick={() =>
                                    handleDownloadFile(
                                      cert._id,
                                      cert.originalName || cert.filename
                                    )
                                  }
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveUploadedFile(cert._id)
                                  }
                                  className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <button
                            onClick={handleRemoveAllUploads}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                          >
                            Remove All Certificates
                          </button>
                        </div>
                      </div>

                      {/* Allow uploading additional files */}
                      <div className="mt-6 pt-6 border-t border-purple-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Add More Certificates
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleCprFileChange}
                            multiple
                            className="hidden"
                            id="cpr-file-upload-additional"
                          />
                          <label
                            htmlFor="cpr-file-upload-additional"
                            className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <FileText className="w-5 h-5" />
                            Add More Certificates
                          </label>

                          {cprFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {cprFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium text-sm break-all">
                                      {file.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => removeSelectedFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {cprFiles.length > 0 && (
                          <button
                            onClick={handleCprUpload}
                            disabled={uploadingCpr}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {uploadingCpr
                              ? `Uploading ${cprFiles.length} file(s)...`
                              : `Upload ${cprFiles.length} Certificate(s)`}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleCprFileChange}
                          multiple
                          className="hidden"
                          id="cpr-file-upload"
                        />
                        <label
                          htmlFor="cpr-file-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                          Select CPR/First Aid Certificate PDF(s)
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          You can upload multiple files at once
                        </p>

                        {cprFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {cprFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="font-medium text-sm break-all">
                                    {file.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => removeSelectedFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {cprFiles.length > 0 && (
                        <button
                          onClick={handleCprUpload}
                          disabled={uploadingCpr}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {uploadingCpr
                            ? `Uploading ${cprFiles.length} file(s)...`
                            : `Upload ${cprFiles.length} Certificate(s)`}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Progress Bar in Form Footer */}
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
                        {completedForms.length}/{totalForms}
                      </div>
                      <div className="text-xs text-gray-600">
                        Forms Completed
                      </div>
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
                    📝 Current: CPR/First Aid Certificate
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/employee/employee-details-upload")
                      }
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4 inline mr-2" />
                      Previous Form
                    </button>

                    <div className="w-full sm:w-auto flex justify-center">
                      <button
                        type="button"
                        onClick={() => navigate("/employee/task-management")}
                        className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                      >
                        Exit Application
                      </button>
                    </div>

                    {(() => {
                      // Check if form has HR notes
                      const hasHrNotes =
                        hrFeedback &&
                        Object.keys(hrFeedback).length > 0 &&
                        (hrFeedback.comment ||
                          hrFeedback.notes ||
                          hrFeedback.feedback ||
                          hrFeedback.note ||
                          hrFeedback.companyRepSignature ||
                          hrFeedback.companyRepresentativeSignature ||
                          hrFeedback.notarySignature ||
                          hrFeedback.agencySignature ||
                          hrFeedback.clientSignature ||
                          Object.keys(hrFeedback).some(
                            (key) =>
                              hrFeedback[key] &&
                              typeof hrFeedback[key] === "string" &&
                              hrFeedback[key].trim().length > 0
                          ));

                      // Check if form is submitted (and no HR notes)
                      const isSubmitted =
                        formStatus === "submitted" && !hasHrNotes;

                      return (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const userCookie = Cookies.get("user");
                              if (userCookie && applicationId) {
                                const user = JSON.parse(userCookie);
                                const status =
                                  uploadedCprCerts.length > 0
                                    ? "completed"
                                    : "draft";
                                await axios.post(
                                  `${baseURL}/onboarding/save-cpr-certificate`,
                                  {
                                    applicationId,
                                    employeeId: user._id,
                                    formData: {},
                                    status,
                                  },
                                  { withCredentials: true }
                                );
                              }
                            } catch (error) {
                              console.error("Error saving status:", error);
                            }
                            window.dispatchEvent(
                              new Event("formStatusUpdated")
                            );
                            navigate("/employee/driving-license-upload");
                          }}
                          disabled={isSubmitted}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                            isSubmitted
                              ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                              : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] active:from-[#112451] active:to-[#16306e]"
                          }`}
                          title={
                            isSubmitted
                              ? "Form is submitted. HR notes are required to make changes."
                              : "Save and proceed to next form"
                          }
                        >
                          <span className="text-sm sm:text-base">
                            {isSubmitted
                              ? "Awaiting HR Feedback"
                              : "Save & Next"}
                          </span>
                          <Send className="w-5 h-5" />
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </Layout>
  );
};

export default CPRFirstAidCertificate;
