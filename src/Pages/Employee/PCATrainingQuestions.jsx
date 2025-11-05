import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  CheckCheck,
  X,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const PCATrainingQuestions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [pcaData, setPcaData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [positionType, setPositionType] = useState("");

  const baseURL = import.meta.env.VITE__BASEURL;

  // Get user data from JWT token
  const getUserFromToken = () => {
    try {
      const session = Cookies.get("session");
      if (!session) return null;

      const decoded = jwtDecode(session);
      return decoded.user;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    checkEligibilityAndFetchData();
  }, []);

  const checkEligibilityAndFetchData = async () => {
    try {
      setLoading(true);
      const userData = getUserFromToken();
      const employeeId = userData?._id || userData?.id;

      if (!employeeId) {
        toast.error("User not found");
        navigate("/employee/dashboard");
        return;
      }

      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      // First check the application data to get position type
      const appRes = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          headers,
          withCredentials: true,
        }
      );

      const positionType = appRes.data?.data?.forms?.positionType?.positionAppliedFor || "";
      console.log("[PCA Training] Position from application:", positionType);
      
      const isEligible = positionType === "PCA";
      setIsEligible(isEligible);
      setPositionType(positionType);

      if (!isEligible) {
        toast.error(
          `PCA Training Questions are only available for PCA positions. Your position: ${
            positionType || "Not specified"
          }`
        );
        // Don't navigate away, just show the message
      } else {
        // Fetch PCA training data
        const dataRes = await axios.get(
          `${baseURL}/onboarding/pca-training/get/${employeeId}`,
          {
            headers,
            withCredentials: true,
          }
        );

        if (dataRes.data.success) {
          setPcaData(dataRes.data.data);
        }

        // Fetch global template from HR
        try {
          const templateRes = await axios.get(
            `${baseURL}/onboarding/pca-training/get-pca-training-template`,
            {
              headers,
              withCredentials: true,
            }
          );

          if (templateRes.data.success) {
            setTemplate(templateRes.data.template);
            console.log(
              "[PCA Training] Template fetched:",
              templateRes.data.template
            );
          }
        } catch (templateError) {
          // Silently handle 404 - template not uploaded yet
          if (templateError.response?.status !== 404) {
            console.error(
              "[PCA Training] Error fetching template:",
              templateError
            );
          }
        }
      }
    } catch (error) {
      console.error("[PCA Training] Error:", error);
      toast.error("Failed to load PCA Training Questions");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!template) {
        toast.error("Template not available");
        return;
      }

      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      toast.loading("Downloading PCA Training Questions...", {
        id: "download",
      });

      // Download the template file directly from the server
      const response = await axios.get(
        `${baseURL}/onboarding/pca-training/download-template/${template._id}`,
        {
          headers,
          withCredentials: true,
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        template.filename || `PCA_Training_Questions_${Date.now()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("File downloaded successfully!", { id: "download" });

      // Refresh data to update download status
      checkEligibilityAndFetchData();
    } catch (error) {
      console.error("[PCA Training] Download error:", error);
      toast.error("Failed to download file", { id: "download" });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files."
        );
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      const userData = getUserFromToken();
      const employeeId = userData?._id || userData?.id;

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {
        "Content-Type": "multipart/form-data",
      };
      if (token) {
        headers.Authorization = token;
      }

      toast.loading("Uploading your completed form...", { id: "upload" });

      const response = await axios.post(
        `${baseURL}/onboarding/pca-training/upload/${employeeId}`,
        formData,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("PCA Training Questions submitted successfully!", {
          id: "upload",
        });
        setSelectedFile(null);
        // Refresh data
        checkEligibilityAndFetchData();
      }
    } catch (error) {
      console.error("[PCA Training] Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload file", {
        id: "upload",
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
        text: "Pending",
      },
      downloaded: {
        color: "bg-blue-100 text-blue-800",
        icon: Download,
        text: "Downloaded",
      },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        icon: FileText,
        text: "In Progress",
      },
      submitted: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Submitted",
      },
      under_review: {
        color: "bg-purple-100 text-purple-800",
        icon: FileText,
        text: "Under Review",
      },
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCheck,
        text: "Approved",
      },
      rejected: { color: "bg-red-100 text-red-800", icon: X, text: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isEligible) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Not Eligible
            </h2>
            <p className="text-gray-600 mb-4">
              PCA Training Questions are only available for employees who
              selected PCA (Personal Care Assistant) as their position in the
              Employment Application form.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your current position:{" "}
              <span className="font-semibold">
                {positionType || "Not specified"}
              </span>
            </p>
            <button
              onClick={() => navigate("/employee/task-management")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to My Applications
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div className="flex gap-6 p-6">
        {/* Part 3 Sidebar */}
        <aside className="w-80 flex-shrink-0 hidden lg:block">
          <div className="sticky top-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
              <h3 className="font-bold text-lg">PART 3</h3>
              <p className="text-sm text-purple-100">PCA Forms</p>
            </div>
            <div className="p-4 space-y-3">
              <div
                onClick={() => navigate('/employee/orientation-presentation')}
                className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-800">Orientation Presentation</span>
              </div>
              <div
                onClick={() => navigate('/employee/job-description-pca')}
                className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-800">PCA Job Description</span>
              </div>
              <div className="p-3 bg-purple-100 border-2 border-purple-400 rounded-lg">
                <span className="text-sm font-semibold text-purple-900">PCA Training Questions</span>
                <div className="mt-1 text-xs text-purple-700">Current Page</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/employee/task-management")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to My Applications
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PCA Training Questions
              </h1>
              <p className="text-gray-600 mt-1">
                Download, complete, and upload your PCA training questions
              </p>
            </div>
            {pcaData && getStatusBadge(pcaData.status)}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Download the PCA Training Questions document below</li>
            <li>Print the document and answer all questions</li>
            <li>Scan or take clear photos of your completed answers</li>
            <li>Upload your completed document using the upload section</li>
          </ol>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 1: Download Questions
          </h2>

          {template ? (
            <div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {template.filename}
                    </p>
                    <p className="text-sm text-gray-500">
                      Uploaded by HR:{" "}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                The PCA Training Questions document is not available yet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please contact HR if you believe this is an error.
              </p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Step 2: Upload Completed Form
          </h2>

          {pcaData?.employeeUploadedFile ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">
                      Form Submitted Successfully
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Uploaded:{" "}
                      {new Date(
                        pcaData.employeeUploadedFile.uploadedAt
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">
                      File: {pcaData.employeeUploadedFile.originalName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Show HR Notes if any */}
              {pcaData.hrNotes && pcaData.hrNotes.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    HR Feedback
                  </h3>
                  {pcaData.hrNotes.map((note, index) => (
                    <div key={index} className="text-sm text-yellow-800 mb-2">
                      <p>{note.note}</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {new Date(note.addedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to select file
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PDF, DOC, DOCX, JPG, or PNG (Max 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedFile && !uploading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Upload className="w-5 h-5" />
                {uploading ? "Uploading..." : "Upload Completed Form"}
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default PCATrainingQuestions;
