import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  MessageSquare,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const HRNotesIndicator = ({
  hrFeedback,
  formStatus,
  formTitle,
  supervisorSignature,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Get base URL from environment variable
  const baseURL = import.meta.env.VITE__BASEURL || "http://localhost:1111";
  console.log("--------------------------", hrFeedback);
  // Don't show indicator if there's no HR feedback content at all (neither text nor signatures)
  const hasAnyFeedback = !!(
    hrFeedback &&
    (hrFeedback.comment ||
      hrFeedback.notes ||
      hrFeedback.companyRepSignature ||
      hrFeedback.companyRepresentativeSignature ||
      hrFeedback.notarySignature ||
      hrFeedback.agencySignature ||
      hrFeedback.clientSignature)
  );

  if (!hasAnyFeedback) {
    return null;
  }

  // Determine the appropriate icon and color scheme based on form status
  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          iconColor: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-400",
          titleColor: "text-green-800",
          textColor: "text-green-700",
          dateColor: "text-green-600",
          indicatorBg: "bg-green-500",
          title: "Form Approved - HR Notes",
        };
      case "rejected":
        return {
          icon: XCircle,
          iconColor: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-400",
          titleColor: "text-red-800",
          textColor: "text-red-700",
          dateColor: "text-red-600",
          indicatorBg: "bg-red-500",
          title: "Form Requires Revision - HR Feedback",
        };
      case "under_review":
        return {
          icon: Clock,
          iconColor: "text-yellow-500",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-400",
          titleColor: "text-yellow-800",
          textColor: "text-yellow-700",
          dateColor: "text-yellow-600",
          indicatorBg: "bg-yellow-500",
          title: "Form Under Review - HR Notes",
        };
      default:
        return {
          icon: AlertCircle,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-400",
          titleColor: "text-blue-800",
          textColor: "text-blue-700",
          dateColor: "text-blue-600",
          indicatorBg: "bg-blue-500",
          title: "HR Review Notes",
        };
    }
  };

  const config = getStatusConfig(formStatus);
  const StatusIcon = config.icon;

  // Get the appropriate feedback text (comment for regular forms, notes for job description forms)
  const feedbackText = hrFeedback.comment || hrFeedback.notes || "";
  const reviewDate = hrFeedback.reviewedAt || hrFeedback.timestamp;
  const reviewedBy = hrFeedback.reviewedBy;

  // Attempt to detect and show company representative signature for Non-Compete Agreement
  // Accept either companyRepSignature or companyRepresentativeSignature in hrFeedback.
  const rawCompanyRepSignature =
    hrFeedback.companyRepSignature ||
    hrFeedback.companyRepresentativeSignature ||
    null;

  // Resolve signature src: handle data URLs, absolute URLs, and backend-relative paths (e.g., /uploads/...)
  const resolveImageSrc = (sig) => {
    if (!sig) return null;
    // If array provided, use the first non-empty entry
    if (Array.isArray(sig)) {
      const first = sig.find((x) => !!x);
      if (!first) return null;
      sig = first;
    }
    // If object provided (or JSON string) try to extract signature field
    if (typeof sig === "object") {
      const candidate = sig.signature || sig.path || sig.url || null;
      if (!candidate) return null;
      sig = candidate;
    } else if (typeof sig === "string" && sig.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(sig.trim());
        const candidate = parsed.signature || parsed.path || parsed.url || null;
        if (candidate) sig = candidate;
      } catch (_) {}
    }
    if (typeof sig !== "string") return null;
    // Normalize any Windows-style backslashes to forward slashes and strip wrapping quotes
    let s = sig.trim().replace(/\\/g, "/");
    // Remove surrounding quotes if present ("..." or '...')
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    if (!s) return null;
    // If already a data URL or absolute URL
    if (
      s.startsWith("data:") ||
      s.startsWith("http://") ||
      s.startsWith("https://")
    ) {
      // If absolute URL points to frontend host but references uploads, rewrite to backend host
      try {
        const u = new URL(s);
        const isFrontendHost = [
          "localhost:3000",
          "localhost:5173",
          "localhost:5174",
        ].includes(u.host);
        if (isFrontendHost && u.pathname.includes("/uploads")) {
          return `${baseURL}${u.pathname}`;
        }
      } catch (_) {}
      return s;
    }
    // Recognize uploads paths and prefer the direct signature endpoint for 'signatures' subfolder
    // 1) Directly starts with uploads
    const looksLikeUpload =
      s.startsWith("/uploads") || s.startsWith("uploads/");
    const path = s.startsWith("/") ? s : `/${s}`;
    if (looksLikeUpload) {
      // If it's in uploads/signatures, route via /upload/signature/:filename
      const sigIdx = path.indexOf("/uploads/signatures/");
      if (sigIdx === 0) {
        const filename = path.substring("/uploads/signatures/".length);
        if (filename) return `${baseURL}/upload/signature/${filename}`;
      }
      return `${baseURL}${path}`;
    }
    // 2) Embedded uploads path inside an absolute filesystem path
    const uploadsIdx = s.indexOf("uploads/");
    if (uploadsIdx > -1) {
      const rel = s.substring(
        uploadsIdx - 1 >= 0 && s[uploadsIdx - 1] === "/"
          ? uploadsIdx - 1
          : uploadsIdx
      );
      const relPath = rel.startsWith("/") ? rel : `/${rel}`;
      if (relPath.startsWith("/uploads/signatures/")) {
        const filename = relPath.substring("/uploads/signatures/".length);
        if (filename) return `${baseURL}/upload/signature/${filename}`;
      }
      return `${baseURL}${relPath}`;
    }
    // 3) Plain filename like signature-123.png -> use direct signature route
    const isPlainSignatureName =
      /^(signature-|sig_|img_).+\.(png|jpg|jpeg|gif)$/i.test(s);
    if (isPlainSignatureName) {
      return `${baseURL}/upload/signature/${s}`;
    }
    // Otherwise, treat as backend-relative path using env when it points to backend
    return `${baseURL}${path}`;
  };

  const companyRepSignature = resolveImageSrc(rawCompanyRepSignature);
  // Optional notary signature (for MisconductStatement)
  const rawNotarySignature = hrFeedback.notarySignature || null;
  const notarySignature = resolveImageSrc(rawNotarySignature);
  // Optional agency/supervisor signature (for Service Delivery Policies and Job Descriptions)
  // Check both hrFeedback.agencySignature (new data) and supervisorSignature prop (form root level)
  const rawAgencySignature =
    hrFeedback?.agencySignature || supervisorSignature?.signature || null;

  console.log("HRNotesIndicator - hrFeedback object:", hrFeedback);
  console.log(
    "HRNotesIndicator - supervisorSignature prop:",
    supervisorSignature
  );
  console.log("HRNotesIndicator - Raw agency signature:", rawAgencySignature);
  console.log("HRNotesIndicator - Type:", typeof rawAgencySignature);

  // Use resolveImageSrc which handles all signature formats
  const agencySignature = resolveImageSrc(rawAgencySignature);

  console.log(
    "HRNotesIndicator - Final agency signature URL:",
    agencySignature
  );
  // Optional client signature (for TB Symptom Screen)
  const rawClientSignature = hrFeedback.clientSignature || null;
  const clientSignature = resolveImageSrc(rawClientSignature);

  // Fallback image handler in case the constructed URL 404s
  const handleImgError = (e) => {
    const img = e.currentTarget;
    const src = img.getAttribute("src") || "";
    const stage = parseInt(img.dataset.fallbackStage || "0", 10);

    // Stage 0: If absolute URL to frontend host with /uploads, rewrite to backend host
    if (stage === 0) {
      try {
        const u = new URL(src);
        const isFrontendHost = [
          "localhost:3000",
          "localhost:5173",
          "localhost:5174",
        ].includes(u.host);
        if (isFrontendHost && u.pathname.includes("/uploads/")) {
          img.dataset.fallbackStage = "1";
          img.src = `${baseURL}${u.pathname}`;
          return;
        }
      } catch (_) {}
      img.dataset.fallbackStage = "1";
    }

    // Stage 1: If path contains /uploads/, normalize to backend base
    if (stage <= 1 && src.includes("/uploads/")) {
      const pathname = src.substring(src.indexOf("/uploads/"));
      // Only change if different to avoid loop
      const candidate = `${baseURL}${pathname}`;
      if (candidate !== src) {
        img.dataset.fallbackStage = "2";
        img.src = candidate;
        return;
      }
      img.dataset.fallbackStage = "2";
    }

    // Stage 2: Last resort - use direct signature route
    if (stage <= 2) {
      const match = src.match(/(signature-[^/?#]+\.(png|jpg|jpeg|gif))/i);
      if (match && match[1]) {
        const direct = `${baseURL}/upload/signature/${match[1]}`;
        if (direct !== src) {
          img.dataset.fallbackStage = "3";
          img.src = direct;
          return;
        }
      }
    }
    // Stage 3+: give up
  };

  return (
    <>
      {/* HR Notes Indicator Button */}
      <div className="relative">
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center justify-center w-8 h-8 rounded-full ${config.indicatorBg} hover:opacity-80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105`}
          title={`HR Notes Available - Click to view`}
          aria-label="View HR feedback"
        >
          <MessageSquare className="w-4 h-4 text-white" />
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 ${config.indicatorBg} rounded-full border-2 border-white flex items-center justify-center`}
          >
            <StatusIcon className="w-2 h-2 text-white" />
          </div>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-96 overflow-y-auto shadow-xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <StatusIcon className={`w-5 h-5 mr-2 ${config.iconColor}`} />
                  <h3 className={`text-lg font-semibold ${config.titleColor}`}>
                    {config.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Title */}
              {formTitle && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600">
                    Form: {formTitle}
                  </p>
                </div>
              )}

              {/* HR Feedback Content */}
              <div
                className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg p-4 mb-4`}
              >
                <div
                  className={`text-sm ${config.textColor} whitespace-pre-line`}
                >
                  {feedbackText}
                </div>
              </div>

              {/* Company Representative Signature (if provided) */}
              {companyRepSignature && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Company Representative Signature
                  </p>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img
                      src={companyRepSignature}
                      alt="Company Representative Signature"
                      className="max-h-40 object-contain"
                      crossOrigin="anonymous"
                      onError={handleImgError}
                    />
                  </div>
                </div>
              )}

              {/* Notary Signature (if provided) */}
              {notarySignature && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Notary Signature
                  </p>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img
                      src={notarySignature}
                      alt="Notary Signature"
                      className="max-h-40 object-contain"
                      crossOrigin="anonymous"
                      onError={handleImgError}
                    />
                  </div>
                </div>
              )}

              {/* Agency/Supervisor Signature (if provided) */}
              {(agencySignature || rawAgencySignature) && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Supervisor Signature
                  </p>
                  {agencySignature ? (
                    <>
                      <div className="border rounded-lg p-3 bg-gray-50">
                        <img
                          src={agencySignature}
                          alt="Supervisor Signature"
                          className="max-h-40 w-full object-contain"
                          crossOrigin="anonymous"
                          onLoad={() => {
                            console.log(
                              "✅ HRNotesIndicator - Signature image loaded successfully"
                            );
                            console.log(
                              "✅ HRNotesIndicator - Image src:",
                              agencySignature
                            );
                          }}
                          onError={(e) => {
                            console.error(
                              "❌ HRNotesIndicator - Signature image failed to load:",
                              e.target.src
                            );
                            console.error(
                              "❌ HRNotesIndicator - Error event:",
                              e
                            );
                            handleImgError(e);
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-100 rounded">
                        <div>
                          <strong>Image URL:</strong> {agencySignature}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="border rounded-lg p-3 bg-red-50 text-red-600 text-sm">
                      <div className="font-semibold mb-2">
                        ⚠️ Signature data exists but could not be processed
                      </div>
                      <div className="text-xs">
                        <strong>Raw data:</strong>{" "}
                        {JSON.stringify(rawAgencySignature)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Client Signature (if provided) */}
              {clientSignature && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Client Signature
                  </p>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <img
                      src={clientSignature}
                      alt="Client Signature"
                      className="max-h-40 object-contain"
                      crossOrigin="anonymous"
                      onError={handleImgError}
                    />
                  </div>
                </div>
              )}

              {/* Review Information */}
              <div className="flex flex-col space-y-2">
                {reviewDate && (
                  <p className={`text-xs ${config.dateColor}`}>
                    <span className="font-medium">Reviewed on:</span>{" "}
                    {new Date(reviewDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {reviewedBy && (
                  <p className={`text-xs ${config.dateColor}`}>
                    <span className="font-medium">Reviewed by:</span>{" "}
                    {typeof reviewedBy === "string"
                      ? reviewedBy
                      : reviewedBy.userName || reviewedBy.name || "HR Team"}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

HRNotesIndicator.propTypes = {
  hrFeedback: PropTypes.shape({
    comment: PropTypes.string,
    notes: PropTypes.string,
    reviewedAt: PropTypes.string,
    timestamp: PropTypes.string,
    reviewedBy: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        userName: PropTypes.string,
        name: PropTypes.string,
      }),
    ]),
  }),
  formStatus: PropTypes.oneOf([
    "draft",
    "completed",
    "submitted",
    "approved",
    "rejected",
    "under_review",
  ]),
  formTitle: PropTypes.string,
  supervisorSignature: PropTypes.shape({
    signature: PropTypes.string,
    date: PropTypes.string,
    digitalSignature: PropTypes.bool,
  }),
};

export default HRNotesIndicator;
