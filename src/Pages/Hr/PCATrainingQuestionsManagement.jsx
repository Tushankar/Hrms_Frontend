import React, { useState, useEffect } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Users,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

const PCATrainingQuestionsManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/pca-training/hr/all-submissions`,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSubmissions(response.data.data);
      }
    } catch (error) {
      console.error("[HR PCA Training] Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTemplate = async (employeeId) => {
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);

      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = { "Content-Type": "multipart/form-data" };
      if (token) {
        headers.Authorization = token;
      }

      toast.loading("Uploading template...", { id: "upload" });

      const response = await axios.post(
        `${baseURL}/onboarding/pca-training/admin/upload-template/${employeeId}`,
        formData,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Template uploaded successfully!", { id: "upload" });
        setUploadFile(null);
        setSelectedEmployee(null);
        fetchSubmissions();
      }
    } catch (error) {
      console.error("[HR PCA Training] Error uploading:", error);
      toast.error("Failed to upload template", { id: "upload" });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.put(
        `${baseURL}/onboarding/pca-training/hr/update-status/${id}`,
        { status: newStatus },
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Status updated successfully");
        fetchSubmissions();
      }
    } catch (error) {
      console.error("[HR PCA Training] Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleAddNote = async (id, note) => {
    if (!note.trim()) return;

    try {
      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/pca-training/hr/add-note/${id}`,
        { note },
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Note added successfully");
        fetchSubmissions();
      }
    } catch (error) {
      console.error("[HR PCA Training] Error adding note:", error);
      toast.error("Failed to add note");
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
      submitted: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Submitted",
      },
      under_review: {
        color: "bg-purple-100 text-purple-800",
        icon: Eye,
        text: "Under Review",
      },
      approved: {
        color: "bg-green-600 text-white",
        icon: CheckCircle,
        text: "Approved",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        text: "Rejected",
      },
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            PCA Training Questions Management
          </h1>
          <p className="text-gray-600 mt-2">
            Upload templates and manage employee submissions
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {submissions.filter((s) => s.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold">
                  {submissions.filter((s) => s.status === "submitted").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">
                  {submissions.filter((s) => s.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No PCA Training submissions found
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.employeeId?.firstName}{" "}
                        {submission.employeeId?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.employeeId?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.adminUploadedFile ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Uploaded
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setSelectedEmployee(submission.employeeId._id)
                          }
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Template
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.employeeUploadedFile ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Received
                        </span>
                      ) : (
                        <span className="text-gray-400">Not submitted</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.status === "submitted" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateStatus(submission._id, "approved")
                            }
                            className="text-green-600 hover:text-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(submission._id, "rejected")
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Upload Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">
                Upload PCA Training Questions Template
              </h3>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0])}
                accept=".pdf,.doc,.docx"
                className="w-full mb-4 p-2 border rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUploadTemplate(selectedEmployee)}
                  disabled={!uploadFile || uploading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => {
                    setSelectedEmployee(null);
                    setUploadFile(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PCATrainingQuestionsManagement;
