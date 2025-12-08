import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  ArrowLeft,
  Save,
  Send,
  RotateCcw,
  Target,
  FileText,
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import apiClient from "../../utils/axiosConfig";
import HRFeedback from "../../Components/Common/HRFeedback/HRFeedback";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker - use the worker from pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

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

const OrientationPresentation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [applicationId, setApplicationId] = useState(
    location.state?.applicationId || null
  );
  const [employeeId, setEmployeeId] = useState(
    location.state?.employeeId || null
  );
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFormsCount, setCompletedFormsCount] = useState(0);
  const [hrFeedback, setHrFeedback] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const [employmentType, setEmploymentType] = useState(null);
  const [totalForms, setTotalForms] = useState(20); // default to 20
  const [document, setDocument] = useState(null);
  const [viewed, setViewed] = useState(false);
  const [positionType, setPositionType] = useState("");
  const baseURL = import.meta.env.VITE__BASEURL;

  // PDF Viewer states
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [showFullscreenPdf, setShowFullscreenPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const shouldCountForm = (formKey, empType) => {
    if (!empType) return true; // Count all if no employment type selected

    if (empType === "W-2") {
      // For W-2 employees, W4 is required, W9 is optional
      return formKey !== "w9Form";
    } else if (empType === "1099") {
      // For 1099 contractors, W9 is required, W4 is optional
      return formKey !== "w4Form";
    }

    return true; // Default to counting all
  };

  const getDecodedUser = () => {
    try {
      const session = Cookies.get("session");
      if (!session) return null;
      const base64Url = session.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload).user;
    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error("Session is invalid. Please log in again.");
      navigate("/login");
      return null;
    }
  };

  const initializeForm = async (userId) => {
    try {
      const token = Cookies.get("session");
      if (!token) {
        toast.error("Authentication token not found. Please log in.");
        return;
      }

      const [appResponse, docResponse] = await Promise.all([
        apiClient.get(`/onboarding/get-application/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.get(`/onboarding/orientation-presentation/document`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (appResponse.data?.data) {
        const backendData = appResponse.data.data;

        if (backendData.application?._id) {
          setApplicationId(backendData.application._id);
        }
        const empType = backendData.application.employmentType;
        setEmploymentType(empType);

        const presentationData = backendData.forms?.orientationPresentation;
        if (presentationData) {
          setViewed(presentationData.viewed || false);
          setHrFeedback(presentationData.hrFeedback);
          setFormStatus(presentationData.status);
        }

        const forms = backendData.forms || {};
        const position =
          backendData.forms?.positionType?.positionAppliedFor || "";
        setPositionType(position);

        // Calculate total forms based on employment type
        const totalForms = FORM_KEYS.filter((key) =>
          shouldCountForm(key, empType)
        ).length;
        setTotalForms(totalForms);

        const completedForms = FORM_KEYS.filter((key) => {
          // Only count forms that should be counted based on employment type
          if (!shouldCountForm(key, empType)) return false;

          let form = forms[key];
          if (key === "jobDescriptionPCA") {
            form =
              forms.jobDescriptionPCA ||
              forms.jobDescriptionCNA ||
              forms.jobDescriptionLPN ||
              forms.jobDescriptionRN;
          }
          return (
            form?.status === "submitted" ||
            form?.status === "completed" ||
            form?.status === "under_review" ||
            form?.status === "approved" ||
            (key === "employmentType" && empType)
          );
        }).length;

        const percentage = Math.round((completedForms / totalForms) * 100);
        setOverallProgress(percentage);
        setCompletedFormsCount(completedForms);
      }

      if (docResponse.data?.success && docResponse.data?.data) {
        setDocument(docResponse.data.data);
        console.log("✅ Orientation document loaded:", docResponse.data.data);
      } else {
        console.warn("⚠️ No orientation document found");
      }
    } catch (error) {
      console.error("Error initializing form:", error);
      if (error.response?.status !== 404) {
        toast.error(
          error.response?.data?.message || "Failed to load form data."
        );
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    const user = getDecodedUser();
    const currentEmployeeId = user?._id || user?.id;
    if (currentEmployeeId) {
      setEmployeeId(currentEmployeeId);
      initializeForm(currentEmployeeId);
    } else {
      setPageLoading(false);
      toast.error("Could not identify employee. Please log in again.");
    }
  }, []);

  useEffect(() => {
    const handleFormStatusUpdate = () => {
      const user = getDecodedUser();
      const currentEmployeeId = user?._id || user?.id;
      if (currentEmployeeId) {
        initializeForm(currentEmployeeId);
      }
    };
    window.addEventListener("formStatusUpdated", handleFormStatusUpdate);
    return () => {
      window.removeEventListener("formStatusUpdated", handleFormStatusUpdate);
    };
  }, []);

  const handleViewDocument = () => {
    if (document && document.filePath) {
      setViewed(true);
      setShowFullscreenPdf(true);
      setPageNumber(1);
      setPdfError(null);
      toast.success("Opening presentation...");
    } else {
      toast.error("No document available to view");
    }
  };

  const handleDownloadDocument = () => {
    if (document && document.filePath) {
      const fileUrl = `${import.meta.env.VITE__BASEURL}/${document.filePath}`;
      const link = globalThis.document.createElement("a");
      link.href = fileUrl;
      link.download = document.fileName || "orientation-presentation.pdf";
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      toast.success("Downloading presentation...");
    }
  };

  const onPdfLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfError(null);
    console.log(`✅ PDF loaded successfully with ${numPages} pages`);
  };

  const onPdfError = (error) => {
    console.error("❌ Error loading PDF:", error);
    setPdfError(error.message || "Failed to load PDF");
    toast.error("Failed to load presentation");
  };

  const handlePreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleSave = async (status = "submitted") => {
    if (status === "submitted" && !viewed) {
      toast.error(
        "Please view the orientation presentation before submitting."
      );
      return;
    }
    if (!employeeId) {
      toast.error("Missing employee information. Cannot save.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = Cookies.get("session");
      const payload = { employeeId, applicationId, status, viewed };

      const response = await apiClient.post(
        `/onboarding/orientation-presentation/save`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedAppId = response.data.data?.applicationId || applicationId;
      setApplicationId(savedAppId);

      toast.success(`Form saved successfully as ${status}!`);
      window.dispatchEvent(new Event("formStatusUpdated"));

      navigate("/employee/orientation-checklist", {
        state: { applicationId: savedAppId, employeeId },
      });
    } catch (error) {
      console.error("Error saving orientation presentation:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save data. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading Orientation Presentation...</p>
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
          <div className="max-w-7xl mx-auto flex gap-6">
            <aside className="w-16 flex-shrink-0 hidden md:block">
              <div className="sticky top-6 flex flex-col items-center">
                <div className="w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                  <div
                    className="w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                    style={{ height: `${overallProgress}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {overallProgress}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Application Progress
                  </div>
                </div>
              </div>
            </aside>

            {/* <aside className="w-80 flex-shrink-0 hidden lg:block">
              <div className="sticky top-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
                  <h3 className="font-bold text-lg">PART 3</h3>
                  <p className="text-sm text-purple-100">Orientation & Training</p>
                </div>
                <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                 
                  {positionType === "PCA" && (
                    <div
                      onClick={() => navigate(`/employee/pca-training-questions`, {
                        state: { applicationId, employeeId },
                      })}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">PCA Training Questions</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside> */}

            <main className="flex-1 min-h-screen md:max-h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              <div className="mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              <HRFeedback hrFeedback={hrFeedback} formStatus={formStatus} />

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-[#1F3A93] text-white p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                        ORIENTATION PRESENTATION
                      </h1>
                      <p className="text-sm sm:text-base text-blue-100">
                        Exhibit 6a - Training PowerPoint
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  {!document ? (
                    <div className="text-center py-8 sm:py-12">
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-base sm:text-lg">
                        No orientation presentation available yet.
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">
                        Please contact HR if you need assistance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">
                              File Name:
                            </p>
                            <p className="font-medium text-sm sm:text-base text-gray-900 break-all">
                              {document.fileName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Uploaded:
                            </p>
                            <p className="font-medium text-sm sm:text-base text-gray-900">
                              {new Date(
                                document.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleViewDocument}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            View Presentation
                          </button>
                          <button
                            onClick={handleDownloadDocument}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            Download
                          </button>
                        </div>
                        {viewed && (
                          <div className="flex items-center gap-2 text-green-600 mt-4">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="font-medium">Viewed</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-3">
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
                            <div className="text-xs text-gray-600">
                              Forms Completed
                            </div>
                          </div>
                        </div>
                        <div>
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
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-3 sm:px-6 py-4 border-t">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/employee/direct-deposit")}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Form</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/employee/task-management")}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      Exit Application
                    </button>

                    {(() => {
                      const hasHrNotes =
                        hrFeedback &&
                        (hrFeedback.generalNotes ||
                          hrFeedback.personalInfoNotes ||
                          hrFeedback.professionalExperienceNotes ||
                          hrFeedback.emergencyContactNotes ||
                          hrFeedback.backgroundCheckNotes ||
                          hrFeedback.cprCertificateNotes ||
                          hrFeedback.drivingLicenseNotes ||
                          hrFeedback.professionalCertificatesNotes ||
                          hrFeedback.tbSymptomScreenNotes ||
                          hrFeedback.orientationNotes ||
                          hrFeedback.w4FormNotes ||
                          hrFeedback.w9FormNotes ||
                          hrFeedback.i9FormNotes ||
                          hrFeedback.directDepositNotes ||
                          hrFeedback.codeOfEthicsNotes ||
                          hrFeedback.serviceDeliveryPoliciesNotes ||
                          hrFeedback.nonCompeteAgreementNotes ||
                          hrFeedback.misconductStatementNotes);
                      const isSubmitted =
                        formStatus === "submitted" && !hasHrNotes;

                      return (
                        <button
                          type="button"
                          onClick={() =>
                            handleSave(viewed ? "submitted" : "draft")
                          }
                          disabled={isSubmitting || isSubmitted}
                          className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-6 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base ${
                            isSubmitted
                              ? "bg-gray-400 cursor-not-allowed opacity-60"
                              : "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-[#1F3A93]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          }`}
                          title={isSubmitted ? "Waiting for HR feedback" : ""}
                        >
                          {isSubmitting ? (
                            <>
                              <RotateCcw className="w-4 h-4 animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>
                                {isSubmitted
                                  ? "Awaiting HR Feedback"
                                  : "Save & Next"}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* PDF Fullscreen Viewer Modal */}
        {showFullscreenPdf && document && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <div>
                  <p className="font-semibold">{document.fileName}</p>
                  <p className="text-sm text-gray-400">
                    Page {pageNumber} of {numPages || "..."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullscreenPdf(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-center gap-4 flex-wrap flex-shrink-0">
              <button
                onClick={handlePreviousPage}
                disabled={pageNumber <= 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:opacity-50 rounded-lg transition-colors text-sm font-medium"
              >
                ← Previous
              </button>

              <input
                type="number"
                min="1"
                max={numPages}
                value={pageNumber}
                onChange={(e) =>
                  setPageNumber(
                    Math.min(
                      Math.max(1, parseInt(e.target.value) || 1),
                      numPages || 1
                    )
                  )
                }
                className="w-16 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-center text-sm"
              />

              <button
                onClick={handleNextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:opacity-50 rounded-lg transition-colors text-sm font-medium"
              >
                Next →
              </button>

              <div className="border-l border-gray-600 h-8"></div>

              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:opacity-50 rounded-lg transition-colors"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium w-12 text-center">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                disabled={scale >= 2}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 disabled:opacity-50 rounded-lg transition-colors"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              <div className="border-l border-gray-600 h-8"></div>

              <button
                onClick={handleDownloadDocument}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center">
              {pdfError ? (
                <div className="text-center text-white">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Failed to load PDF</p>
                  <p className="text-gray-400 text-sm mt-2">{pdfError}</p>
                  <button
                    onClick={() => {
                      setPdfError(null);
                      setPageNumber(1);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="bg-white shadow-2xl">
                  <Document
                    file={`${import.meta.env.VITE__BASEURL}/${
                      document.filePath
                    }`}
                    onLoadSuccess={onPdfLoadSuccess}
                    onError={onPdfError}
                    loading={
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                          <p className="text-gray-600">
                            Loading presentation...
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrientationPresentation;
