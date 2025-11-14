import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  CheckCheck,
  X,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

const PCATrainingQuestionsHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [pcaData, setPcaData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [positionType, setPositionType] = useState("");

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchPCATrainingData();
      fetchTemplate();
      fetchPositionType();
    }
  }, [employeeId]);

  const fetchPCATrainingData = async () => {
    try {
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/pca-training/get/${employeeId}`,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setPcaData(response.data.data);
        // Employee info is now populated in the PCA data
        if (response.data.data.employeeId) {
          setEmployeeInfo(response.data.data.employeeId);
        }
      }
    } catch (error) {
      console.error("Error fetching PCA training data:", error);
      // PCA data might not exist yet, which is fine
    }
  };

  const fetchPositionType = async () => {
    try {
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      // Get position type from application data
      const appRes = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          headers,
          withCredentials: true,
        }
      );

      if (appRes.data?.data) {
        setPositionType(
          appRes.data.data.forms?.positionType?.positionAppliedFor || ""
        );
      }
    } catch (error) {
      console.error("Error fetching position type:", error);
    }
  };

  const fetchTemplate = async () => {
    try {
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/pca-training/get-pca-training-template`,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setTemplate(response.data.template);
      }
    } catch (error) {
      // Template might not exist yet
      console.log("Template not available");
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

      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/pca-training/download-template/${template._id}`,
        {
          headers,
          responseType: "blob",
          withCredentials: true,
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", template.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  const handleDownloadSubmission = async () => {
    if (!pcaData?.employeeUploadedFile) {
      toast.error("No submission file available");
      return;
    }

    try {
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      toast.loading("Downloading submission...", { id: "download-submission" });

      const response = await axios.get(
        `${baseURL}/onboarding/pca-training/download-submission/${employeeId}`,
        {
          headers,
          responseType: "blob",
          withCredentials: true,
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", pcaData.employeeUploadedFile.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Submission downloaded successfully!", {
        id: "download-submission",
      });
    } catch (error) {
      console.error("Error downloading submission:", error);
      toast.error("Failed to download submission", {
        id: "download-submission",
      });
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

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HR Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  PCA Training Questions
                </h1>
                <p className="text-gray-600 mt-1">
                  Review employee's PCA training questions submission
                </p>
                {employeeInfo && (
                  <p className="text-sm text-gray-500 mt-2">
                    Employee: {employeeInfo.firstName} {employeeInfo.lastName} •
                    Position: {positionType}
                  </p>
                )}
              </div>
              {pcaData && getStatusBadge(pcaData.status)}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Instructions for Employee
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
              Training Questions Template
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

          {/* Submission Status */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Submission Status
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
                        Submitted:{" "}
                        {new Date(
                          pcaData.employeeUploadedFile.uploadedAt
                        ).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-700">
                        File: {pcaData.employeeUploadedFile.originalName}
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={handleDownloadSubmission}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Download Submission
                        </button>
                      </div>
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
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No submission uploaded yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  The employee has not uploaded their completed PCA training
                  questions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </Layout>
  );
};

export default PCATrainingQuestionsHR;
