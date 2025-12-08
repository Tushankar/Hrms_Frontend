import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Target,
  Send,
  X,
  Download,
  Trash2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesIndicator from "../../Components/Common/HRNotesIndicator/HRNotesIndicator";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import axios from "axios";
import Cookies from "js-cookie";

const DrivingLicenseUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]); // Changed from single file to array
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [applicationId, setApplicationId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [governmentIdType, setGovernmentIdType] = useState("");
  const [hrFeedback, setHrFeedback] = useState(null);
  const [formStatus, setFormStatus] = useState("draft");
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    checkSubmission();
  }, []);

  const checkSubmission = async () => {
    setLoading(true);
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (user?._id) {
        setEmployeeId(user._id);
        const appResponse = await axios.get(
          `${baseURL}/onboarding/get-application/${user._id}`,
          { withCredentials: true }
        );

        const appId = appResponse.data?.data?.application?._id;
        setApplicationId(appId);

        if (appId) {
          // Fetch personal information to get government ID type
          try {
            const personalInfoResponse = await axios.get(
              `${baseURL}/onboarding/get-personal-information/${appId}`,
              { withCredentials: true }
            );

            if (
              personalInfoResponse.data?.personalInformation?.governmentIdType
            ) {
              setGovernmentIdType(
                personalInfoResponse.data.personalInformation.governmentIdType
              );
            }
          } catch (error) {
            console.log("Personal information not yet created:", error.message);
          }

          // Check if driving license form is already submitted
          try {
            const licenseResponse = await axios.get(
              `${baseURL}/onboarding/get-driving-license/${appId}`,
              { withCredentials: true }
            );

            if (licenseResponse.data?.drivingLicense?.employeeUploadedForm) {
              setSubmission(
                licenseResponse.data.drivingLicense.employeeUploadedForm
              );
            }

            // Load all uploaded files
            if (licenseResponse.data?.drivingLicense?.uploadedFiles) {
              setUploadedFiles(
                licenseResponse.data.drivingLicense.uploadedFiles
              );
            }

            // Fetch HR feedback if available
            if (licenseResponse.data?.drivingLicense?.hrFeedback) {
              setHrFeedback(licenseResponse.data.drivingLicense.hrFeedback);
            }

            // Load form status
            if (licenseResponse.data?.drivingLicense?.status) {
              setFormStatus(licenseResponse.data.drivingLicense.status);
            }
          } catch (error) {
            console.log("Driving license not yet created:", error.message);
          }
        }
      }
    } catch (error) {
      console.error("Error checking submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length !== selectedFiles.length) {
      toast.error("All files must be PDF format");
      return;
    }

    setFiles([...files, ...pdfFiles]);
  };

  const removeSelectedFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("files", file);
      });
      formData.append("applicationId", applicationId);
      formData.append("employeeId", employeeId);

      const response = await axios.post(
        `${baseURL}/onboarding/employee-upload-driving-license-files`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data?.drivingLicense) {
        toast.success(`${files.length} file(s) uploaded successfully!`);
        setFiles([]);
        setUploadedFiles(response.data.drivingLicense.uploadedFiles || []);
        setSubmission(response.data.drivingLicense.employeeUploadedForm);
        window.dispatchEvent(new Event("formStatusUpdated"));
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload documents"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUploadedFile = async (fileId) => {
    try {
      if (!applicationId || !fileId) {
        toast.error("Missing required information");
        return;
      }

      await axios.post(
        `${baseURL}/onboarding/remove-driving-license-file`,
        {
          applicationId,
          fileId,
        },
        { withCredentials: true }
      );

      const updatedFiles = uploadedFiles.filter((f) => f._id !== fileId);
      setUploadedFiles(updatedFiles);

      if (updatedFiles.length === 0) {
        setSubmission(null);
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
        `${baseURL}/onboarding/download-driving-license-file/${applicationId}/${fileId}`,
        {
          responseType: "blob",
          withCredentials: true,
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

  const handleRemoveAllUploads = async () => {
    try {
      if (!applicationId || !employeeId) {
        toast.error("Missing application information");
        return;
      }

      // Remove each file
      for (const file of uploadedFiles) {
        await axios.post(
          `${baseURL}/onboarding/remove-driving-license-file`,
          {
            applicationId,
            fileId: file._id,
          },
          { withCredentials: true }
        );
      }

      setUploadedFiles([]);
      setSubmission(null);
      setFiles([]);
      toast.success(
        "All documents removed successfully. You can upload new ones."
      );
      window.dispatchEvent(new Event("formStatusUpdated"));
    } catch (error) {
      console.error("Error removing documents:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove documents"
      );
    }
  };

  const handleSaveAndNext = async () => {
    try {
      let hasSubmission = uploadedFiles.length > 0;

      // If files are selected but not uploaded yet, upload them first
      if (files.length > 0 && !hasSubmission) {
        await handleUpload();
        hasSubmission = true;
      }

      const status = hasSubmission ? "completed" : "draft";

      // Save the driving license form status
      await axios.post(
        `${baseURL}/onboarding/driving-license/save-status`,
        {
          applicationId,
          employeeId,
          status,
        },
        { withCredentials: true }
      );

      // Dispatch event to update sidebar
      window.dispatchEvent(new Event("formStatusUpdated"));

      // Small delay to ensure event is processed before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      navigate("/employee/background-check-upload");
    } catch (error) {
      console.error("Error in Save & Next:", error);
      toast.error("Failed to save and proceed");
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/employee/employee-details-upload")}
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
                uploadedFiles.length > 0
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {uploadedFiles.length > 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <FileText className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  {uploadedFiles.length > 0 ? (
                    <>
                      <p className="text-base font-semibold text-green-800">
                        ✅ Progress Updated - {uploadedFiles.length} Document(s)
                        Uploaded Successfully on{" "}
                        {new Date(
                          uploadedFiles[0]?.uploadedAt
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        You cannot make any changes to the form until HR
                        provides their feedback.
                      </p>
                    </>
                  ) : (
                    <p className="text-base font-semibold text-red-800">
                      ⚠️ Not filled yet - Upload your document(s) to complete
                      your progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {governmentIdType
                ? `${
                    governmentIdType.charAt(0).toUpperCase() +
                    governmentIdType.slice(1)
                  } Upload`
                : "Government ID Upload"}
            </h1>
            <p className="text-gray-600">
              Upload your Driver's License or any other means of photo
              identification
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {governmentIdType && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      Selected ID Type:{" "}
                      {governmentIdType.charAt(0).toUpperCase() +
                        governmentIdType.slice(1)}
                    </span>
                  </div>
                </div>
              )}

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
                          {governmentIdType === "driver's license"
                            ? "Scan or photograph both sides of your Driver's License"
                            : governmentIdType === "passport"
                            ? "Scan or photograph the information page of your Passport"
                            : governmentIdType === "state id"
                            ? "Scan or photograph both sides of your State ID"
                            : "Scan or photograph both sides of your government-issued Picture ID"}
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 flex-shrink-0">
                          2.
                        </span>
                        <span>
                          Ensure the document is clear and all information is
                          readable
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 flex-shrink-0">
                          3.
                        </span>
                        <span>Save the document as a PDF file</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 flex-shrink-0">
                          4.
                        </span>
                        <span>
                          Upload the PDF using the upload button below
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 flex-shrink-0">
                          5.
                        </span>
                        <span>
                          Upload the ID whose information was provided in the
                          applicant information section
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Upload Government ID Document(s)
                </h2>

                {uploadedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-3">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">
                          {uploadedFiles.length} document(s) submitted
                          successfully
                        </span>
                        {hrFeedback && (
                          <HRNotesIndicator
                            hrFeedback={hrFeedback}
                            formStatus="submitted"
                            formTitle="Government ID Document Upload"
                          />
                        )}
                      </div>

                      <div className="space-y-3 mt-4">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
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
                            <div className="flex gap-2 ml-3">
                              <button
                                onClick={() =>
                                  handleDownloadFile(
                                    file._id,
                                    file.originalName || file.filename
                                  )
                                }
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleRemoveUploadedFile(file._id)
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

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <button
                          onClick={handleRemoveAllUploads}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Remove All Documents
                        </button>
                      </div>
                    </div>

                    {/* Allow uploading additional files */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Add More Documents
                      </h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          multiple
                          className="hidden"
                          id="driving-license-upload-additional"
                        />
                        <label
                          htmlFor="driving-license-upload-additional"
                          className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
                        >
                          <FileText className="w-5 h-5" />
                          Add More PDF Documents
                        </label>

                        {files.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="font-medium text-sm">
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

                      {files.length > 0 && (
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading
                            ? `Uploading ${files.length} file(s)...`
                            : `Upload ${files.length} File(s)`}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                        id="driving-license-upload"
                      />
                      <label
                        htmlFor="driving-license-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                        Select PDF Document(s)
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        You can upload multiple files at once (e.g., front and
                        back of ID)
                      </p>

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium text-sm">
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

                    {files.length > 0 && (
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading
                          ? `Uploading ${files.length} file(s)...`
                          : `Upload ${files.length} File(s)`}
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    📋 Document Information
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span>Document must be in PDF format</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span>
                      {governmentIdType
                        ? `${
                            governmentIdType.charAt(0).toUpperCase() +
                            governmentIdType.slice(1)
                          } must be valid (not expired)`
                        : "Government-issued Picture ID must be valid (not expired)"}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span>
                      {governmentIdType === "driver's license" ||
                      governmentIdType === "state id"
                        ? "Both front and back should be clearly visible"
                        : governmentIdType === "passport"
                        ? "Information page should be clearly visible"
                        : "Both front and back should be clearly visible"}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span>
                      {governmentIdType
                        ? `Selected ID type: ${
                            governmentIdType.charAt(0).toUpperCase() +
                            governmentIdType.slice(1)
                          }`
                        : "Accepted IDs: Driver's License, Passport, State ID, etc."}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/employee/cpr-first-aid-certificate")
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
                        onClick={handleSaveAndNext}
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
                        <Send className="w-5 h-5" />
                        <span className="text-sm sm:text-base">
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

export default DrivingLicenseUpload;
