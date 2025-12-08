import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Target,
  Send,
  CheckCircle,
  Upload,
  File,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

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

const shouldCountForm = (key, employmentType) => {
  if (key === "w4Form") return employmentType === "W-2";
  if (key === "w9Form") return employmentType === "1099";
  return true;
};

const EditSymptomScreenForm = () => {
  const navigate = useNavigate();
  const [tbFiles, setTbFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingAndNext, setSavingAndNext] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [totalForms, setTotalForms] = useState(20);
  const fileInputRef = useRef(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    checkSubmission();
  }, []);

  useEffect(() => {
    const handleFormStatusUpdate = () => {
      checkSubmission();
    };
    window.addEventListener("formStatusUpdated", handleFormStatusUpdate);
    return () =>
      window.removeEventListener("formStatusUpdated", handleFormStatusUpdate);
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetchUploadedDocument(applicationId);
    }
  }, [applicationId]);

  const checkSubmission = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      setEmployeeId(user._id);

      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        setApplicationId(appResponse.data.data.application._id);

        // Calculate progress
        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const currentEmploymentType =
          backendData.application.employmentType || "";
        const filteredKeys = FORM_KEYS.filter((key) =>
          shouldCountForm(key, currentEmploymentType)
        );

        const completedForms = filteredKeys.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key) ||
            (key === "employmentType" && currentEmploymentType)
          );
        }).length;

        const totalFormsCount = filteredKeys.length;
        const percentage = Math.round((completedForms / totalFormsCount) * 100);
        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
        setTotalForms(totalFormsCount);

        // Fetch uploaded document
        if (appResponse.data.data.application._id) {
          await fetchUploadedDocument(appResponse.data.data.application._id);
        }
      }
    } catch (error) {
      console.error("Error checking submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedDocument = async (appId) => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-tb-uploaded-documents/${appId}/tbSymptomScreen`,
        { withCredentials: true }
      );

      if (
        response.data?.data?.documents &&
        response.data.data.documents.length > 0
      ) {
        const documents = response.data.data.documents.map((doc) => ({
          ...doc,
          fullUrl: doc.filePath.startsWith("http")
            ? doc.filePath
            : `${baseURL}/${doc.filePath}`,
        }));
        setUploadedDocuments(documents);
      } else {
        setUploadedDocuments([]);
      }
    } catch (error) {
      // 404 is expected when no documents exist yet - don't log as error
      if (error.response?.status === 404) {
        console.log("📄 No TB Symptom Screen documents found yet");
        setUploadedDocuments([]);
      } else {
        console.error("❌ Error fetching uploaded documents:", error);
        setUploadedDocuments([]);
      }
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/x-png", // Alternative PNG MIME type
      "image/pjpeg", // IE JPEG variant
    ];
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif"];
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      // Check both MIME type and file extension for better compatibility
      const fileName = file.name.toLowerCase();
      const fileExtension = "." + fileName.split(".").pop();
      const isMimeTypeAllowed = allowedTypes.includes(file.type);
      const isExtensionAllowed = allowedExtensions.includes(fileExtension);

      if (!isMimeTypeAllowed && !isExtensionAllowed) {
        errors.push(
          `${file.name}: Invalid file type. Only PDF, JPG, and PNG files are allowed.`
        );
      } else if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 10MB`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
    }

    if (validFiles.length > 0) {
      setTbFiles([...tbFiles, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added!`);
    }
  };

  const handleFileUpload = async () => {
    if (tbFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    if (!applicationId || !employeeId) {
      toast.error("Missing required information");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      tbFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("applicationId", applicationId);
      formData.append("employeeId", employeeId);

      const response = await axios.post(
        `${baseURL}/onboarding/employee-upload-tb-documents`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.success) {
        toast.success(`${tbFiles.length} document(s) uploaded successfully!`);
        setTbFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Update uploadedDocuments with the response
        if (response.data?.documents) {
          const newDocs = response.data.documents.map((doc) => ({
            ...doc,
            fullUrl: doc.filePath.startsWith("http")
              ? doc.filePath
              : `${baseURL}/${doc.filePath}`,
          }));
          // Set the documents from response instead of appending
          setUploadedDocuments(newDocs);
        }

        window.dispatchEvent(new Event("formStatusUpdated"));
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedDocument = async (documentId) => {
    if (!applicationId) {
      toast.error("Missing required information");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this document?"
    );
    if (!confirmed) return;

    try {
      const response = await axios.post(
        `${baseURL}/onboarding/remove-tb-document-file`,
        {
          applicationId,
          fileId: documentId,
        },
        { withCredentials: true }
      );

      if (response.data?.success) {
        setUploadedDocuments(
          uploadedDocuments.filter((doc) => doc._id !== documentId)
        );
        toast.success("Document removed successfully");
        window.dispatchEvent(new Event("formStatusUpdated"));
        await checkSubmission();
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error("Failed to remove document");
    }
  };

  const removeSelectedFile = (index) => {
    setTbFiles(tbFiles.filter((_, i) => i !== index));
    toast.success("File removed from selection");
  };

  const handleDownloadFile = (fileId, fileName) => {
    if (!applicationId) {
      toast.error("Missing application information");
      return;
    }

    const downloadUrl = `${baseURL}/onboarding/download-tb-document/${applicationId}/${fileId}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveAndNext = async () => {
    try {
      if (uploadedDocuments.length === 0) {
        toast.error("Please upload a document before proceeding");
        return;
      }

      setSavingAndNext(true);
      const toastId = toast.loading("Saving and processing your submission...");

      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      const status = "completed";

      await axios.post(
        `${baseURL}/onboarding/save-status`,
        {
          applicationId,
          employeeId: user._id,
          status,
        },
        { withCredentials: true }
      );

      toast.dismiss(toastId);
      toast.success("✅ TB Symptom Screen completed successfully!");

      window.dispatchEvent(new Event("formStatusUpdated"));
      await checkSubmission();

      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/employee/employment-type");
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error(
        error.response?.data?.message || "Failed to save and proceed"
      );
    } finally {
      setSavingAndNext(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Status Banner */}
          {!loading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                uploadedDocuments.length > 0
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {uploadedDocuments.length > 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {uploadedDocuments.length > 0 ? (
                    <p className="text-base font-semibold text-green-800">
                      ✅ Progress Updated - {uploadedDocuments.length}{" "}
                      document(s) uploaded successfully
                    </p>
                  ) : (
                    <p className="text-base font-semibold text-red-800">
                      ⚠️ Not filled yet - Upload your TB Symptom Screen document
                      to complete your progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              TB Symptom Screen Document Upload
            </h1>
            <p className="text-gray-600">
              Provide TB test result by uploading your TB Symptom Screen
              document
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Instructions
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-700">
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>
                        Prepare your signed TB Symptom Screen document
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>
                        Click "Choose File" to select and upload your document
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        3.
                      </span>
                      <span>
                        Once uploaded, you can view or remove the document if
                        needed
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        4.
                      </span>
                      <span>Click Save & Next to complete this step</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 1: Upload Document
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Select and upload your signed TB Symptom Screen document.
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>

              {uploadedDocuments && uploadedDocuments.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Uploaded Documents ({uploadedDocuments.length})
                    </h3>

                    {uploadedDocuments.map((doc) => (
                      <div
                        key={doc._id || doc.filePath}
                        className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <File className="w-6 h-6 text-green-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-green-800 truncate">
                                {doc.originalName || doc.filename}
                              </h3>
                              <div className="flex gap-3 text-xs text-gray-500">
                                {doc.fileSize && (
                                  <span>
                                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                                <span>
                                  Uploaded on{" "}
                                  {new Date(
                                    doc.uploadedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() =>
                                handleDownloadFile(
                                  doc._id,
                                  doc.originalName || doc.filename
                                )
                              }
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => removeUploadedDocument(doc._id)}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Upload Additional Documents
                    </h4>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload-more"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-blue-500" />
                          <p className="mb-1 text-sm text-blue-600">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-blue-500">
                            PDF, JPG, PNG (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          id="file-upload-more"
                          type="file"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                        />
                      </label>
                    </div>

                    {tbFiles && tbFiles.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Files Ready to Upload ({tbFiles.length}):
                        </h5>
                        <div className="space-y-2 mb-4">
                          {tbFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <File className="w-5 h-5 text-yellow-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-yellow-800 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeSelectedFile(index)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleFileUpload}
                          disabled={uploading}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                          {uploading ? "Uploading..." : "Upload Documents"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                      />
                    </label>
                  </div>

                  {tbFiles && tbFiles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">
                        Selected Files ({tbFiles.length}):
                      </h4>
                      <div className="space-y-2 mb-4">
                        {tbFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <File className="w-5 h-5 text-blue-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-800 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-blue-600">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeSelectedFile(index)}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleFileUpload}
                        disabled={uploading}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {uploading ? "Uploading..." : "Upload Documents"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Application Progress
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {completedFormsCount}/{totalForms}
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
                Current: TB Symptom Screen Document Upload
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/employee/misconduct-form")
                  }
                  className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
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

                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  disabled={savingAndNext}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {savingAndNext ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">
                        Processing...
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span className="text-sm sm:text-base">Save & Next</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default EditSymptomScreenForm;
