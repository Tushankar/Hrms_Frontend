import { useState, useEffect } from "react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  Upload,
  FileText,
  CheckCircle,
  Download,
  Eye,
  Sparkles,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const DocumentManagement = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState({});
  const [templates, setTemplates] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  const forms = [
    {
      id: "pcaTrainingQuestions",
      name: "PCA Training Questions",
      color: "violet",
      category: "Training Materials",
    },
    {
      id: "trainingVideo",
      name: "Training Video",
      color: "fuchsia",
      category: "Training Materials",
      isVideo: true, // Special flag for video handling
    },
    {
      id: "orientationPresentation",
      name: "Orientation Presentation",
      color: "sky",
      category: "Training Materials",
    },
  ];

  useEffect(() => {
    fetchAllTemplates();
    fetchAllSubmissions();
    fetchTrainingVideo();
  }, []);

  const fetchAllTemplates = async () => {
    // Get authentication token
    const sessionToken = Cookies.get("session");
    const accessToken = Cookies.get("accessToken");
    const token = sessionToken || accessToken;

    const endpoints = {
      employmentApplication: "/onboarding/get-employment-application-template",
      codeOfEthics: "/onboarding/get-code-of-ethics-template",
      serviceDeliveryPolicy: "/onboarding/get-service-delivery-policy-template",
      nonCompete: "/onboarding/get-non-compete-template",
      backgroundCheck: "/onboarding/get-background-check-template",
      tbSymptomScreen: "/onboarding/get-tb-symptom-screen-template",
      emergencyContact: "/onboarding/get-emergency-contact-template",
      pcaTrainingQuestions:
        "/onboarding/pca-training/get-pca-training-template",
      i9Form: "/onboarding/get-i9-form-template",
      w4Form: "/onboarding/get-w4-form-template",
      w9Form: "/onboarding/get-w9-form-template",
      directDeposit: "/onboarding/get-direct-deposit-template",
      rnJobDescription: "/onboarding/get-rn-job-description-template",
      lpnJobDescription: "/onboarding/get-lpn-job-description-template",
      cnaJobDescription: "/onboarding/get-cna-job-description-template",
      pcaJobDescription: "/onboarding/get-pca-job-description-template",
      orientationPresentation: "/onboarding/orientation-presentation/document",
      misconductStatement: "/onboarding/misconduct-statement/get-template",
    };

    for (const [key, endpoint] of Object.entries(endpoints)) {
      try {
        // Prepare headers with authentication
        const headers = {};
        if (token) {
          headers.Authorization = token;
        }

        const response = await axios.get(`${baseURL}${endpoint}`, {
          headers,
          withCredentials: true,
        });
        if (
          key === "orientationPresentation"
            ? response.data?.data
            : response.data?.template
        ) {
          setTemplates((prev) => ({
            ...prev,
            [key]:
              key === "orientationPresentation"
                ? response.data.data
                : response.data.template,
          }));
        }
      } catch (error) {
        // Ignore 404 errors (no template uploaded yet)
        if (error.response?.status !== 404) {
          console.error(`Error fetching ${key} template:`, error);
        }
      }
    }
  };

  const fetchAllSubmissions = async () => {
    // Get authentication token
    const sessionToken = Cookies.get("session");
    const accessToken = Cookies.get("accessToken");
    const token = sessionToken || accessToken;

    const endpoints = {
      codeOfEthics: "/onboarding/hr-get-all-code-of-ethics-submissions",
      serviceDeliveryPolicy:
        "/onboarding/hr-get-all-service-delivery-policy-submissions",
      nonCompete: "/onboarding/hr-get-all-non-compete-submissions",
      backgroundCheck: "/onboarding/hr-get-all-background-check-submissions",
      tbSymptomScreen: "/onboarding/hr-get-all-tb-symptom-screen-submissions",
      emergencyContact: "/onboarding/hr-get-all-emergency-contact-submissions",
      directDeposit: "/onboarding/hr-get-all-direct-deposit-submissions",
    };

    for (const [key, endpoint] of Object.entries(endpoints)) {
      try {
        // Prepare headers with authentication
        const headers = {};
        if (token) {
          headers.Authorization = token;
        }

        const response = await axios.get(`${baseURL}${endpoint}`, {
          headers,
          withCredentials: true,
        });
        if (response.data?.submissions) {
          setSubmissions((prev) => ({
            ...prev,
            [key]: response.data.submissions,
          }));
        }
      } catch (error) {
        // Ignore 404 errors (no submissions yet)
        if (error.response?.status !== 404) {
          console.error(`Error fetching ${key} submissions:`, error);
        }
      }
    }
  };

  const handleFileChange = async (formId, file) => {
    if (!file) return;

    if (formId === "orientationPresentation") {
      const validTypes = [
        "application/pdf",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a PDF or PowerPoint file");
        return;
      }
    } else if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    setUploading((prev) => ({ ...prev, [formId]: true }));
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      // Get authentication token
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadedBy", user?._id || "");

      const endpoints = {
        employmentApplication:
          "/onboarding/hr-upload-employment-application-template",
        codeOfEthics: "/onboarding/hr-upload-code-of-ethics-template",
        serviceDeliveryPolicy:
          "/onboarding/hr-upload-service-delivery-policy-template",
        nonCompete: "/onboarding/hr-upload-non-compete-template",
        backgroundCheck: "/onboarding/hr-upload-background-check-template",
        tbSymptomScreen: "/onboarding/hr-upload-tb-symptom-screen-template",
        emergencyContact: "/onboarding/hr-upload-emergency-contact-template",
        pcaTrainingQuestions:
          "/onboarding/pca-training/hr-upload-pca-training-template",
        i9Form: "/onboarding/hr-upload-i9-form-template",
        w4Form: "/onboarding/hr-upload-w4-form-template",
        w9Form: "/onboarding/hr-upload-w9-form-template",
        directDeposit: "/onboarding/hr-upload-direct-deposit-template",
        rnJobDescription: "/onboarding/hr-upload-rn-job-description-template",
        lpnJobDescription: "/onboarding/hr-upload-lpn-job-description-template",
        cnaJobDescription: "/onboarding/hr-upload-cna-job-description-template",
        pcaJobDescription: "/onboarding/hr-upload-pca-job-description-template",
        orientationPresentation: "/onboarding/orientation-presentation/upload",
        misconductStatement:
          "/onboarding/misconduct-statement/admin-upload-template",
      };

      // Prepare headers with authentication
      const headers = { "Content-Type": "multipart/form-data" };
      if (token) {
        // authMiddleware expects token directly, not with "Bearer " prefix
        headers.Authorization = token;
      }

      const response = await axios.post(
        `${baseURL}${endpoints[formId]}`,
        formData,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Template uploaded successfully!");
        setTemplates((prev) => ({
          ...prev,
          [formId]:
            formId === "orientationPresentation"
              ? response.data.data
              : response.data.template,
        }));
      }
    } catch (error) {
      console.error("Error uploading template:", error);
      toast.error("Failed to upload template");
    } finally {
      setUploading((prev) => ({ ...prev, [formId]: false }));
    }
  };

  const fetchTrainingVideo = async () => {
    try {
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.get(
        `${baseURL}/onboarding/training-video/get-training-video`,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data?.video) {
        setTemplates((prev) => ({
          ...prev,
          trainingVideo: response.data.video,
        }));
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching training video:", error);
      }
    }
  };

  const handleVideoUpload = async () => {
    try {
      if (!videoData.title || !videoData.videoUrl) {
        toast.error("Title and Video URL are required");
        return;
      }

      setUploading((prev) => ({ ...prev, trainingVideo: true }));

      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");
      const token = sessionToken || accessToken;

      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = token;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/training-video/hr-upload-training-video`,
        videoData,
        {
          headers,
          withCredentials: true,
        }
      );

      if (response.data) {
        toast.success("Training video uploaded successfully!");
        setTemplates((prev) => ({
          ...prev,
          trainingVideo: response.data.video,
        }));
        setShowVideoModal(false);
        setVideoData({
          title: "",
          description: "",
          videoUrl: "",
          thumbnailUrl: "",
          duration: "",
        });
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload training video");
    } finally {
      setUploading((prev) => ({ ...prev, trainingVideo: false }));
    }
  };

  const handleDownload = (filePath) => {
    window.open(`${baseURL}/${filePath}`, "_blank");
  };

  const handleClearDocument = async (formId) => {
    if (
      !window.confirm(
        "Are you sure you want to clear this document? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setTemplates((prev) => {
        const updated = { ...prev };
        delete updated[formId];
        return updated;
      });
      toast.success("Document cleared successfully!");
    } catch (error) {
      console.error("Error clearing document:", error);
      toast.error("Failed to clear document");
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      indigo:
        "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      cyan: "from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700",
      purple:
        "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      violet:
        "from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700",
      fuchsia:
        "from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700",
      green:
        "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      orange:
        "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      pink: "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
      teal: "from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
      emerald:
        "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      lime: "from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700",
      amber:
        "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      sky: "from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700",
      rose: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700",
    };
    return colors[color] || colors.blue;
  };

  const groupedForms = forms.reduce((acc, form) => {
    if (!acc[form.category]) acc[form.category] = [];
    acc[form.category].push(form);
    return acc;
  }, {});

  return (
    <Layout>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <Sparkles className="w-10 h-10 text-indigo-600" />
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Document Management Center
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Centralized hub for uploading and managing all onboarding form
              templates
            </p>
          </div>

          {Object.entries(groupedForms).map(([category, categoryForms]) => (
            <div key={category} className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryForms.map((form) => (
                  <div
                    key={form.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    <div
                      className={`bg-gradient-to-r ${getColorClasses(
                        form.color
                      )} p-5 text-white`}
                    >
                      <FileText className="w-10 h-10 mb-2" />
                      <h3 className="text-lg font-bold leading-tight">
                        {form.name}
                      </h3>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Special rendering for Training Video */}
                      {form.isVideo ? (
                        <>
                          {templates[form.id] ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-700 mb-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-semibold text-sm">
                                  Active
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-gray-800 mb-1">
                                {templates[form.id].title}
                              </p>
                              <p className="text-xs text-gray-600 mb-2">
                                {templates[form.id].description}
                              </p>
                              <a
                                href={templates[form.id].videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm"
                              >
                                <Eye className="w-3 h-3" />
                                View Video
                              </a>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">
                                No video uploaded
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => setShowVideoModal(true)}
                            disabled={uploading[form.id]}
                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r ${getColorClasses(
                              form.color
                            )} text-white rounded-lg font-semibold transition-all text-sm ${
                              uploading[form.id]
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            {uploading[form.id]
                              ? "Uploading..."
                              : "Upload Video"}
                          </button>
                        </>
                      ) : (
                        <>
                          {templates[form.id] ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-700 mb-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-semibold text-sm">
                                  Active
                                </span>
                              </div>
                              <p
                                className="text-xs text-gray-600 mb-2 truncate"
                                title={
                                  form.id === "orientationPresentation"
                                    ? templates[form.id].fileName
                                    : templates[form.id].filename
                                }
                              >
                                {form.id === "orientationPresentation"
                                  ? templates[form.id].fileName
                                  : templates[form.id].filename}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleDownload(templates[form.id].filePath)
                                  }
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </button>
                                <button
                                  onClick={() => handleClearDocument(form.id)}
                                  className="px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Clear document"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">
                                No template
                              </p>
                            </div>
                          )}

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                            <input
                              type="file"
                              accept={
                                form.id === "orientationPresentation"
                                  ? ".pdf,.ppt,.pptx"
                                  : ".pdf"
                              }
                              onChange={(e) =>
                                handleFileChange(form.id, e.target.files[0])
                              }
                              className="hidden"
                              id={`file-${form.id}`}
                              disabled={uploading[form.id]}
                            />
                            <label
                              htmlFor={`file-${form.id}`}
                              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getColorClasses(
                                form.color
                              )} text-white rounded-lg font-semibold transition-all text-sm ${
                                uploading[form.id]
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <Upload className="w-4 h-4" />
                              {uploading[form.id] ? "Uploading..." : "Upload"}
                            </label>
                          </div>
                        </>
                      )}

                      {/* Special handling for PCA Training Questions */}
                      {form.id === "pcaTrainingQuestions" && (
                        <div className="pt-3 border-t border-gray-200">
                          <button
                            onClick={() =>
                              navigate("/hr/pca-training-management")
                            }
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg hover:from-violet-600 hover:to-violet-700 transition-all text-sm font-semibold shadow-md"
                          >
                            <Eye className="w-4 h-4" />
                            Manage PCA Training
                          </button>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Upload templates & review submissions
                          </p>
                        </div>
                      )}

                      {submissions[form.id] !== undefined &&
                        form.id !== "pcaTrainingQuestions" && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-700">
                                Submissions
                              </span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                {submissions[form.id]?.length || 0}
                              </span>
                            </div>
                            {submissions[form.id] &&
                              submissions[form.id].length > 0 && (
                                <button
                                  onClick={() => {
                                    const routes = {
                                      codeOfEthics:
                                        "/hr/code-of-ethics-submissions",
                                      serviceDeliveryPolicy:
                                        "/hr/service-delivery-policy-submissions",
                                      nonCompete: "/hr/non-compete-submissions",
                                      backgroundCheck:
                                        "/hr/background-check-submissions",
                                      directDeposit:
                                        "/hr/direct-deposit-submissions",
                                    };
                                    navigate(routes[form.id]);
                                  }}
                                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                              )}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Upload Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white p-6">
              <h2 className="text-2xl font-bold">Upload Training Video</h2>
              <p className="text-fuchsia-100 text-sm mt-1">
                Add video URL and details for employee training
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={videoData.title}
                  onChange={(e) =>
                    setVideoData({ ...videoData, title: e.target.value })
                  }
                  placeholder="e.g., Employee Onboarding Training 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video URL *
                </label>
                <input
                  type="url"
                  value={videoData.videoUrl}
                  onChange={(e) =>
                    setVideoData({ ...videoData, videoUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube, Vimeo, and direct video links
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={videoData.description}
                  onChange={(e) =>
                    setVideoData({ ...videoData, description: e.target.value })
                  }
                  placeholder="Brief description of the training video content"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={videoData.thumbnailUrl}
                  onChange={(e) =>
                    setVideoData({
                      ...videoData,
                      thumbnailUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  value={videoData.duration}
                  onChange={(e) =>
                    setVideoData({ ...videoData, duration: e.target.value })
                  }
                  placeholder="e.g., 15:30 or 15 minutes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 flex gap-3 border-t">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setVideoData({
                    title: "",
                    description: "",
                    videoUrl: "",
                    thumbnailUrl: "",
                    duration: "",
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVideoUpload}
                disabled={uploading.trainingVideo}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white rounded-lg hover:from-fuchsia-600 hover:to-fuchsia-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading.trainingVideo ? "Uploading..." : "Upload Video"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </Layout>
  );
};
