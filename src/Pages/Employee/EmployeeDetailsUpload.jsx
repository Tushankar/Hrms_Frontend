import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Target,
  Send,
  Upload,
  File,
  CheckCircle,
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
  "references",
  "education",
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

const EmployeeDetailsUpload = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [positionType, setPositionType] = useState("");
  const [employeeId, setEmployeeId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Changed to array
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // Array of uploaded documents
  const [applicationId, setApplicationId] = useState(null);
  const [formStatus, setFormStatus] = useState("draft");
  const [hrFeedback, setHrFeedback] = useState(null);

  const [employmentType, setEmploymentType] = useState(null);
  const [totalForms, setTotalForms] = useState(20); // default to 20
  const fileInputRef = useRef(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  const shouldCountForm = (formKey) => {
    if (employmentType === "W-2 Employee") {
      return formKey !== "w9Form";
    } else if (employmentType === "1099 Contractor") {
      return formKey !== "w4Form";
    }
    return formKey !== "w9Form"; // default to W-2 if not set
  };

  const getPositionDisplayName = (position) => {
    const positionMap = {
      PCA: "Personal Care Assistant",
      CNA: "Certified Nursing Assistant",
      LPN: "Licensed Practical Nurse",
      RN: "Registered Nurse",
    };
    return positionMap[position] || "Professional";
  };

  const getCertificateType = (position) => {
    const certMap = {
      PCA: "PCA Certificate",
      CNA: "CNA Certificate",
      LPN: "LPN License",
      RN: "RN License",
    };
    return certMap[position] || "Professional Certificate";
  };

  useEffect(() => {
    checkSubmission();
  }, []);

  useEffect(() => {
    // Listen for form status updates from other components
    const handleFormStatusUpdate = () => {
      console.log("Form status updated, refreshing data...");
      checkSubmission();
    };

    window.addEventListener("formStatusUpdated", handleFormStatusUpdate);
    return () =>
      window.removeEventListener("formStatusUpdated", handleFormStatusUpdate);
  }, []);

  const checkSubmission = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie
        ? JSON.parse(userCookie)
        : { _id: "67e0f8770c6feb6ba99d11d2" };

      setEmployeeId(user._id);

      // Get application
      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true }
      );

      if (appResponse.data?.data?.application) {
        const appId = appResponse.data.data.application._id;
        setApplicationId(appId);
        setEmploymentType(appResponse.data.data.application.employmentType);

        // Get position type
        const savedPosition =
          appResponse.data?.data?.forms?.positionType?.positionAppliedFor;

        console.log("🔍 Saved Position:", savedPosition);
        console.log("🔍 Application ID:", appId);

        if (savedPosition) {
          setPositionType(savedPosition);
          console.log("✅ Setting position type to:", savedPosition);

          // Fetch documents immediately after setting position
          try {
            await fetchUploadedDocument(appId, savedPosition);
          } catch (docError) {
            console.error(
              "Error fetching documents in checkSubmission:",
              docError
            );
          }
        } else {
          console.warn("⚠️ No saved position found");
          setUploadedDocuments([]);
        }

        // Calculate progress
        const backendData = appResponse.data.data;
        const forms = backendData.forms || {};
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const filteredKeys = FORM_KEYS.filter(shouldCountForm);
        setTotalForms(filteredKeys.length);

        // Check if professional certificate is completed for this position
        const hasProfessionalCertificate =
          backendData.professionalCertificateCompleted ||
          (savedPosition &&
            backendData.application?.professionalCertificates?.[savedPosition]
              ?.length > 0);

        const completedForms = filteredKeys.filter((key) => {
          const form = forms[key];
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            completedSet.has(key) ||
            (key === "employmentType" &&
              appResponse.data.data.application.employmentType)
          );
        }).length;

        // Use only FORM_KEYS.length (20 forms), not adding +1 for professional certificate
        const totalCompletedForms = completedForms;
        const totalForms = filteredKeys.length;

        const percentage = Math.round((totalCompletedForms / totalForms) * 100);
        setOverallProgress(percentage);
        setCompletedFormsCount(totalCompletedForms);
      }
    } catch (error) {
      console.error("Error checking submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedDocument = async (appId, posType) => {
    try {
      console.log("📂 Fetching documents for:", { appId, posType });
      const response = await axios.get(
        `${baseURL}/onboarding/professional-certificates/get-uploaded-documents/${appId}/${posType}`,
        { withCredentials: true }
      );

      console.log("📦 Full documents response:", response.data);

      const documents = response.data?.data?.documents || [];
      console.log("📋 Documents array:", documents);
      console.log("📊 Document count:", documents.length);

      if (documents && documents.length > 0) {
        // Convert filePath to full URL if needed and add _id for consistent key usage
        const processedDocuments = documents.map((doc, index) => {
          console.log(`Processing document ${index}:`, doc);
          const fullUrl = doc.filePath.startsWith("http")
            ? doc.filePath
            : `${baseURL}/${doc.filePath.replace(/\\/g, "/")}`;
          console.log(`Generated URL for document ${index}:`, fullUrl);
          return {
            ...doc,
            _id: doc._id || `doc-${index}-${Date.now()}`, // Generate ID if not present
            fullUrl,
          };
        });
        console.log("✅ Processed documents:", processedDocuments);
        setUploadedDocuments(processedDocuments);
      } else {
        console.log("❌ No documents found or empty array");
        setUploadedDocuments([]);
      }

      // Load status and HR feedback from response
      if (response.data?.data?.status) {
        setFormStatus(response.data.data.status);
      }
      if (response.data?.data?.hrFeedback) {
        setHrFeedback(response.data.data.hrFeedback);
      }
    } catch (error) {
      console.error("❌ Error fetching uploaded documents:", error);
      console.error("Error details:", error.response?.data || error.message);
      setUploadedDocuments([]);
    }
  };

  const removeUploadedDocument = async (documentId, filePath) => {
    if (!applicationId || !positionType) {
      toast.error("Missing required information");
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to remove this document? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await axios.post(
        `${baseURL}/onboarding/professional-certificates/remove-document`,
        {
          applicationId,
          positionType,
          documentId: documentId || filePath, // Use filePath as fallback
        },
        { withCredentials: true }
      );

      if (response.data?.success) {
        // Remove document from local state
        setUploadedDocuments(
          uploadedDocuments.filter(
            (doc) => doc._id !== documentId && doc.filePath !== filePath
          )
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

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) {
      return;
    }

    // Validate files
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
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
      setUploadedFiles(validFiles);
      toast.success(`${validFiles.length} file(s) selected`);
    }
  };

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    if (!applicationId || !positionType || !employeeId) {
      toast.error(
        "Missing required information. Please refresh and try again."
      );
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      // Append all files
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("applicationId", applicationId);
      formData.append("employeeId", employeeId);
      formData.append("positionType", positionType);

      const response = await axios.post(
        `${baseURL}/onboarding/professional-certificates/employee-upload-multiple-documents`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data?.success) {
        toast.success(
          `${uploadedFiles.length} document(s) uploaded successfully!`
        );
        setUploadedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Debug: Check what's actually saved in the database
        try {
          const debugResponse = await axios.get(
            `${baseURL}/onboarding/professional-certificates/debug-application/${applicationId}`,
            { withCredentials: true }
          );
          console.log("🔍 Debug - Database content:", debugResponse.data);
        } catch (debugError) {
          console.error("🔍 Debug endpoint error:", debugError);
        }

        // Fetch the uploaded documents to update the display
        await fetchUploadedDocument(applicationId, positionType);

        window.dispatchEvent(new Event("formStatusUpdated"));
        await checkSubmission();
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAndNext = async () => {
    try {
      // Check if documents are uploaded before proceeding
      if (!uploadedDocuments || uploadedDocuments.length === 0) {
        toast.error("Please upload at least one document before proceeding");
        return;
      }

      const status = "completed";

      console.log("Saving employee details upload with status:", status);
      console.log("Application ID:", applicationId);
      console.log("Employee ID:", employeeId);
      console.log("Position Type:", positionType);
      console.log("Uploaded Documents Count:", uploadedDocuments.length);

      // Save the professional certificate form status
      const saveResponse = await axios.post(
        `${baseURL}/onboarding/professional-certificates/save-status`,
        {
          applicationId,
          employeeId,
          positionType,
          status,
        },
        { withCredentials: true }
      );

      console.log("Status saved successfully:", saveResponse.data);

      // Dispatch event to refresh form status
      window.dispatchEvent(new Event("formStatusUpdated"));

      // Refresh the application data to update progress
      await checkSubmission();

      // Small delay to ensure data is processed before navigation
      await new Promise((resolve) => setTimeout(resolve, 300));

      toast.success("Professional certificate saved successfully!");
      navigate("/employee/cpr-first-aid-certificate");
    } catch (error) {
      console.error("Error in Save & Next:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save and proceed");
      }
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/job-description-pca")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* HR Feedback Section */}
        <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Status Banner */}
          {!loading && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                uploadedDocuments && uploadedDocuments.length > 0
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {uploadedDocuments && uploadedDocuments.length > 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {uploadedDocuments && uploadedDocuments.length > 0 ? (
                    <>
                      <p className="text-base font-semibold text-green-800">
                        ✅ {uploadedDocuments.length} document(s) uploaded
                        successfully
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        You cannot make any changes to the form until HR
                        provides their feedback.
                      </p>
                    </>
                  ) : (
                    <p className="text-base font-semibold text-red-800">
                      ⚠️ Not filled yet - Upload your documents to complete your
                      progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                Professional Certificate
              </h2>
              <p className="text-gray-700 text-lg">
                You have selected:{" "}
                <span className="font-semibold text-blue-800">
                  {getCertificateType(positionType)}
                </span>
              </p>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {getCertificateType(positionType)} Document Upload
            </h1>
            <p className="text-gray-600">
              Upload your {getCertificateType(positionType).toLowerCase()}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      📋 Instructions
                    </h3>
                    <ol className="space-y-3 text-sm text-gray-700">
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 flex-shrink-0">
                          1.
                        </span>
                        <span>
                          Prepare your{" "}
                          {getCertificateType(positionType).toLowerCase()} (PDF
                          or image format)
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 flex-shrink-0">
                          2.
                        </span>
                        <span>
                          Click "Choose File" or drag and drop to upload your
                          certificate
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 flex-shrink-0">
                          3.
                        </span>
                        <span>
                          Once uploaded, you can view or remove the certificate
                          if needed
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
                  Select and upload your signed job description document.
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </p>

                {uploadedDocuments && uploadedDocuments.length > 0 ? (
                  /* Display Uploaded Documents + Option to Add More */
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        📄 Uploaded Documents ({uploadedDocuments.length})
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
                                  {doc.filename}
                                </h3>
                                <div className="flex gap-3 text-xs text-gray-500">
                                  {doc.fileSize && (
                                    <span>
                                      {(doc.fileSize / 1024 / 1024).toFixed(2)}{" "}
                                      MB
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
                              <a
                                href={doc.fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                              >
                                View
                              </a>
                              <button
                                onClick={() =>
                                  removeUploadedDocument(doc._id, doc.filePath)
                                }
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upload More Documents Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        ➕ Upload Additional Documents
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
                                Click to upload more
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-blue-500">
                              PDF, JPG, PNG (MAX. 10MB each)
                            </p>
                          </div>
                          <input
                            id="file-upload-more"
                            type="file"
                            multiple
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                      </div>

                      {uploadedFiles && uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h5 className="font-semibold text-gray-800">
                            Files Ready to Upload ({uploadedFiles.length}):
                          </h5>
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <File className="w-5 h-5 text-yellow-600" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setUploadedFiles(
                                    uploadedFiles.filter((_, i) => i !== index)
                                  );
                                }}
                                className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={handleFileUpload}
                            disabled={isUploading}
                            className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                          >
                            {isUploading
                              ? "Uploading..."
                              : `Upload ${uploadedFiles.length} File(s)`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Initial File Upload Interface */
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF, JPG, PNG (MAX. 10MB each, up to 10 files)
                          </p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>

                    {uploadedFiles && uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">
                          Selected Files ({uploadedFiles.length}):
                        </h4>
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <File className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-800">
                                  {file.name}
                                </p>
                                <p className="text-xs text-blue-600">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setUploadedFiles(
                                  uploadedFiles.filter((_, i) => i !== index)
                                );
                              }}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          {isUploading
                            ? "Uploading..."
                            : `Upload ${uploadedFiles.length} File(s)`}
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
                  📝 Current: Job Description Document Upload
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate("/employee/emergency-contact")}
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
                        onClick={handleSaveAndNext}
                        disabled={isSubmitted}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3 font-bold tracking-wide rounded-lg focus:ring-2 focus:ring-[#1F3A93]/30 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base ${
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
                        <Send className="w-5 h-5" />
                        <span>
                          {isSubmitted ? "Awaiting HR Feedback" : "Save & Next"}
                        </span>
                      </button>
                    );
                  })()}
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

export default EmployeeDetailsUpload;
