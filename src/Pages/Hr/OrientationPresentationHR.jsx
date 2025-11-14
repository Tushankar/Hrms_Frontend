import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  ArrowLeft,
  FileText,
  RotateCcw,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

const OrientationPresentationHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [document, setDocument] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      const token = Cookies.get("session");
      const [formResponse, docResponse] = await Promise.all([
        axios.get(`${baseURL}/onboarding/get-application/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        axios.get(`${baseURL}/onboarding/orientation-presentation/document`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
      ]);

      if (formResponse.data?.data?.forms?.orientationPresentation) {
        setFormData(formResponse.data.data.forms.orientationPresentation);
      }

      if (docResponse.data?.success) {
        setDocument(docResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const token = Cookies.get("session");
      const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", user._id || user.id);

      await axios.post(
        `${baseURL}/onboarding/orientation-presentation/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Orientation presentation uploaded successfully");
      fetchData();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <Navbar />
        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-[#1F3A93] text-white p-6">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      ORIENTATION PRESENTATION - HR
                    </h1>
                    <p className="text-blue-100">
                      Upload & Manage Training Document
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Employee Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        formData?.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : formData?.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : formData?.status === "under_review"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formData?.viewed ? "VIEWED" : "NOT VIEWED"}
                    </span>
                  </div>
                  {formData?.viewedAt && (
                    <p className="text-xs text-gray-600 mt-2">
                      Viewed on: {new Date(formData.viewedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Upload Orientation Presentation
                  </h3>
                  {document && (
                    <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-600">Current Document:</p>
                      <p className="font-medium text-gray-900">
                        {document.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded:{" "}
                        {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <label className="block">
                    <input
                      type="file"
                      accept=".ppt,.pptx,.pdf"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {uploadingFile ? (
                        <RotateCcw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      {uploadingFile
                        ? "Uploading..."
                        : "Upload New Presentation"}
                    </label>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: PPT, PPTX, PDF
                  </p>
                </div>

                <HRNotesInput
                  formType="orientation-presentation"
                  employeeId={employeeId}
                  existingNote={formData?.hrFeedback?.comment}
                  existingReviewedAt={formData?.hrFeedback?.reviewedAt}
                  onNoteSaved={fetchData}
                  formData={formData}
                  showSignature={false}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6 mt-8">
                <button
                  onClick={() =>
                    navigate(`/hr/direct-deposit-form/${employeeId}`)
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous: Direct Deposit
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Exit to Dashboard
                </button>
                <button
                  onClick={() =>
                    navigate(`/hr/orientation-checklist/${employeeId}`)
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Next: Orientation Checklist
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrientationPresentationHR;
