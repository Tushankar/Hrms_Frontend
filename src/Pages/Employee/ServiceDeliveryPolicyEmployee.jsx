import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  CheckCircle,
  Trash2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";
import Cookies from "js-cookie";

const ServiceDeliveryPolicyEmployee = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchTemplate();
    checkSubmission();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-service-delivery-policy-template`,
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
      const applicationId = user?.applicationId;

      if (applicationId) {
        const response = await axios.get(
          `${baseURL}/onboarding/get-service-delivery-policy/${applicationId}`,
          { withCredentials: true }
        );
        if (response.data.serviceDeliveryPolicy?.employeeUploadedForm) {
          setSubmission(
            response.data.serviceDeliveryPolicy.employeeUploadedForm
          );
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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", user?.applicationId || "");
      formData.append("employeeId", user?._id || "");

      const response = await axios.post(
        `${baseURL}/onboarding/employee-upload-signed-service-delivery-policy`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Signed document uploaded successfully!");
        setFile(null);
        // Make sure to set the submission from the response
        if (response.data.serviceDeliveryPolicy?.employeeUploadedForm) {
          setSubmission(
            response.data.serviceDeliveryPolicy.employeeUploadedForm
          );
        }
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUpload = async () => {
    if (!submission) {
      toast.error("No document to remove");
      return;
    }

    if (
      !window.confirm("Are you sure you want to remove the uploaded document?")
    ) {
      return;
    }

    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      const response = await axios.post(
        `${baseURL}/onboarding/remove-service-delivery-policy-upload`,
        {
          applicationId: user?.applicationId || "",
          employeeId: user?._id || "",
        },
        { withCredentials: true }
      );

      if (response.data) {
        toast.success("Document removed successfully");
        setSubmission(null);
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error("Failed to remove document");
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
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
              Service Delivery Policy (Exhibit 4)
            </h1>
            <p className="text-gray-600">
              Download, review, sign digitally, and upload the document
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Download Section */}
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
                    Download Service Delivery Policy
                  </button>
                ) : (
                  <p className="text-gray-500">No template available</p>
                )}
              </div>

              {/* Upload Section */}
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
                    <p className="text-sm text-gray-600 mt-1">
                      File: {submission.filename}
                    </p>
                    <button
                      onClick={handleRemoveUpload}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Document
                    </button>
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
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default ServiceDeliveryPolicyEmployee;
