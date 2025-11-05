import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  Play,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const TrainingVideo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [video, setVideo] = useState(null);
  const [accessData, setAccessData] = useState({
    completedForms: 0,
    totalForms: 25,
    message: "",
  });

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
    checkAccessAndFetchVideo();
  }, []);

  // Helper function to get submission status (SAME as EmployeeTaskManagement)
  const getSubmissionStatus = (formData) => {
    if (!formData) return "Not Started";
    if (formData.status === "submitted") return "Submitted";
    if (formData.status === "completed") return "Submitted";
    if (formData.status === "under_review") return "Under Review";
    if (formData.status === "approved") return "Approved";
    if (formData.status === "rejected") return "Needs Revision";
    if (formData.status === "draft") return "Draft";
    return "Not Started";
  };

  const checkAccessAndFetchVideo = async () => {
    try {
      setLoading(true);
      const userData = getUserFromToken();
      const employeeId = userData?._id || userData?.id;

      console.log("[Training Video] Base URL:", baseURL);
      console.log("[Training Video] Environment:", import.meta.env.MODE);

      if (!employeeId) {
        console.error("[Training Video] No employee ID found");
        toast.error("User not found");
        navigate("/employee/dashboard");
        return;
      }

      console.log(
        "[Training Video] Fetching application data for employee:",
        employeeId
      );

      // Fetch onboarding application data (same as EmployeeTaskManagement)
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          withCredentials: true,
        }
      );

      console.log("[Training Video] Application response:", response.data);

      if (response.data && response.data.data) {
        const backendData = response.data.data;

        // Build transformedTasks array EXACTLY like EmployeeTaskManagement does
        const transformedTasks = [
          { formData: backendData.forms?.personalInformation },
          { formData: backendData.forms?.professionalExperience },
          { formData: backendData.forms?.workExperience },
          { formData: backendData.forms?.education },
          { formData: backendData.forms?.references },
          { formData: backendData.forms?.legalDisclosures },
          { formData: backendData.forms?.positionType },
          { formData: backendData.forms?.orientationPresentation },
          { formData: backendData.forms?.w4Form },
          { formData: backendData.forms?.w9Form },
          { formData: backendData.forms?.i9Form },
          { formData: backendData.forms?.emergencyContact },
          { formData: backendData.forms?.directDeposit },
          { formData: backendData.forms?.misconductStatement },
          { formData: backendData.forms?.codeOfEthics },
          { formData: backendData.forms?.serviceDeliveryPolicy },
          { formData: backendData.forms?.nonCompeteAgreement },
          { formData: backendData.forms?.backgroundCheck },
          { formData: backendData.forms?.tbSymptomScreen },
          { formData: backendData.forms?.orientationChecklist },
        ];

        // Calculate progress EXACTLY like EmployeeTaskManagement does
        const completedForms = transformedTasks.filter((task) => {
          const submissionStatus = getSubmissionStatus(task.formData);
          return (
            submissionStatus === "Submitted" ||
            submissionStatus === "Under Review" ||
            submissionStatus === "Approved"
          );
        }).length;

        const totalForms = transformedTasks.length; // This will be 25
        const allFormsComplete =
          completedForms === totalForms && totalForms > 0;

        console.log(
          `[Training Video] Progress: ${completedForms}/${totalForms}, Access: ${allFormsComplete}`
        );

        setHasAccess(allFormsComplete);
        setAccessData({
          completedForms: completedForms,
          totalForms: totalForms,
          message: allFormsComplete
            ? "All forms completed. Access granted."
            : `Complete all ${totalForms} forms to access the training video. Current progress: ${completedForms}/${totalForms}`,
        });

        // If has access, fetch the video
        if (allFormsComplete) {
          // Get authentication token
          const sessionToken = Cookies.get("session");
          const accessToken = Cookies.get("accessToken");
          const token = sessionToken || accessToken;

          const headers = {};
          if (token) {
            headers.Authorization = token;
          }

          const videoRes = await axios.get(
            `${baseURL}/onboarding/training-video/get-training-video`,
            {
              headers,
              withCredentials: true,
            }
          );

          console.log("[Training Video] Video response:", videoRes.data);

          if (videoRes.data.success) {
            setVideo(videoRes.data.video);
            console.log(
              "[Training Video] Video loaded successfully:",
              videoRes.data.video
            );

            // Warn if original URL was HTTP
            if (videoRes.data.video?.videoUrl?.startsWith("http://")) {
              console.warn(
                "[Training Video] ⚠️ Video URL uses HTTP. Converting to HTTPS to prevent mixed content errors."
              );
              console.warn(
                "[Training Video] Original URL:",
                videoRes.data.video.videoUrl
              );
              console.warn(
                "[Training Video] Recommended: Update the video URL in HR Dashboard to use HTTPS"
              );
            }
          } else {
            console.warn("[Training Video] No video data in response");
          }
        } else {
          console.log("[Training Video] Access denied - forms not complete");
        }
      }
    } catch (error) {
      console.error("[Training Video] Error:", error);
      console.error("[Training Video] Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        baseURL: baseURL,
      });

      if (error.response?.status === 404) {
        toast.error("Training video not available yet");
      } else if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
      } else if (!baseURL) {
        toast.error("Configuration error: API URL not set");
        console.error("[Training Video] VITE__BASEURL is not defined!");
      } else {
        toast.error("Failed to load training video");
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;

    // Force HTTPS to prevent mixed content errors on Netlify
    let secureUrl = url;
    if (url.startsWith("http://")) {
      secureUrl = url.replace("http://", "https://");
      console.log("[Training Video] Converted HTTP to HTTPS:", secureUrl);
    }

    // YouTube
    if (secureUrl.includes("youtube.com") || secureUrl.includes("youtu.be")) {
      const videoId = secureUrl.includes("youtu.be")
        ? secureUrl.split("youtu.be/")[1]?.split("?")[0]
        : new URLSearchParams(new URL(secureUrl).search).get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (secureUrl.includes("vimeo.com")) {
      const videoId = secureUrl.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Direct video link - return the HTTPS version
    return secureUrl;
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-fuchsia-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">
              Loading Training Video...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-5xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Play className="w-10 h-10 text-fuchsia-600" />
                  Training Video
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete all onboarding forms to access the training video
                </p>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  hasAccess ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                {hasAccess ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock className="w-6 h-6 text-yellow-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Form Completion Status
                </h3>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">
                      {accessData.completedForms} / {accessData.totalForms}{" "}
                      Forms
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1F3A93] transition-all duration-500 rounded-full"
                      style={{
                        width: `${
                          (accessData.completedForms / accessData.totalForms) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{accessData.message}</p>
              </div>
            </div>
          </div>

          {/* Video Section or Locked Message */}
          {hasAccess && video ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">{video.title}</h2>
                {video.description && (
                  <p className="text-fuchsia-100">{video.description}</p>
                )}
                {video.duration && (
                  <div className="flex items-center gap-2 mt-2 text-fuchsia-100">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Duration: {video.duration}</span>
                  </div>
                )}
              </div>

              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={getEmbedUrl(video.videoUrl)}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                ></iframe>
              </div>

              <div className="p-6 bg-gray-50">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Congratulations! All forms completed.
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Watch this training video to complete your onboarding process.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Training Video Locked
              </h3>
              <p className="text-gray-600 mb-6">
                You need to complete all {accessData.totalForms} onboarding
                forms to access the training video.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Current Status
                    </p>
                    <p className="text-sm text-blue-800">
                      You have completed {accessData.completedForms} out of{" "}
                      {accessData.totalForms} required forms. Please complete
                      the remaining forms to unlock the training video.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/employee/task-management")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white rounded-lg hover:from-fuchsia-600 hover:to-fuchsia-700 transition-all font-semibold shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Go to My Applications
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrainingVideo;
