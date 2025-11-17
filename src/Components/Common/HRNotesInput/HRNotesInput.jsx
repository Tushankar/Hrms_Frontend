import React, { useState, useEffect } from "react";
import { MessageSquare, Save, Send } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import SignaturePad from "../SignaturePad";

const HRNotesInput = ({
  formType,
  employeeId,
  existingNote,
  existingReviewedAt,
  existingSignature,
  onNoteSaved,
  formData,
  formId,
  showSignature = true, // new prop: controls whether HR signature UI is shown
  companyRepSignature = "",
  companyRepName = "",
  onCompanyRepUpdate,
}) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [hrSignature, setHrSignature] = useState("");
  const [localCompanyRepSignature, setLocalCompanyRepSignature] =
    useState(companyRepSignature);
  const [localCompanyRepName, setLocalCompanyRepName] =
    useState(companyRepName);

  console.log("HRNotesInput rendered with props:", {
    formType,
    employeeId,
    hasFormData: !!formData,
    formId,
  });

  // Map form types to their correct endpoint paths
  const getEndpoint = (type) => {
    const endpointMap = {
      education: "/onboarding/education/save",
      references: "/onboarding/references/save",
      "legal-disclosures": "/onboarding/legal-disclosures/save",
      "personal-information": "/onboarding/save-personal-information",
      "professional-experience": "/onboarding/save-professional-experience",
      "work-experience": "/onboarding/save-work-experience",
      w4: "/onboarding/save-w4-form",
      "w4-form": "/onboarding/save-w4-form",
      w9: "/onboarding/save-w9-form",
      "w9-form": "/onboarding/save-w9-form",
      i9: "/onboarding/save-i9-form",
      "i9-form": "/onboarding/save-i9-form",
      "background-check": "/onboarding/save-background-check",
      "service-delivery-policies": "/onboarding/save-service-delivery-policy",
      "orientation-presentation": "/onboarding/save-orientation-presentation",
      "non-compete-agreement": "/onboarding/save-non-compete-agreement",
      "job-description": "/onboarding/save-job-description-hr-notes",
      "code-of-ethics": "/onboarding/save-code-of-ethics",
      "misconduct-statement":
        "/onboarding/save-traditional-misconduct-statement",
      drivingLicense: "/onboarding/save-driving-license",
      employeeDetailsUpload: "/onboarding/save-job-description-hr-notes",
    };
    return endpointMap[type] || `/onboarding/save-${type}`;
  };

  useEffect(() => {
    setNote(existingNote || "");
    setHrSignature(existingSignature || "");
    setLocalCompanyRepSignature(companyRepSignature || "");
    setLocalCompanyRepName(companyRepName || "");
  }, [existingNote, existingSignature, companyRepSignature, companyRepName]);

  // Helper to build correct signature URL
  const buildSignatureUrl = (signaturePath) => {
    if (!signaturePath) return "";
    const baseURL = import.meta.env.VITE__BASEURL;

    console.log("🔗 Building signature URL from:", signaturePath);

    // If it's already a full URL, use it
    if (signaturePath.startsWith("http")) {
      return signaturePath;
    }

    // If it starts with /uploads/, prepend baseURL
    if (signaturePath.startsWith("/uploads/")) {
      return `${baseURL}${signaturePath}`;
    }

    // If it contains uploads/ anywhere, extract and build
    if (signaturePath.includes("uploads/")) {
      const uploadsIndex = signaturePath.indexOf("uploads/");
      const relativePath = signaturePath.substring(uploadsIndex);
      return `${baseURL}/${relativePath}`;
    }

    // Otherwise assume it's a relative path
    return `${baseURL}/${signaturePath.replace(/^\//, "")}`;
  };

  const handleSendToEmployee = async () => {
    console.log("=== handleSendToEmployee START ===");
    console.log("formType:", formType);
    console.log("employeeId:", employeeId);
    console.log("formData prop:", formData);
    console.log("formId:", formId);
    console.log("note:", note);

    if (!note.trim()) {
      toast.error("Please enter a note before sending");
      return;
    }

    try {
      setSending(true);
      const baseURL = import.meta.env.VITE__BASEURL;

      const appResponse = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );
      const applicationId = appResponse.data?.data?.application?._id;

      console.log("Got applicationId:", applicationId);

      if (!applicationId) {
        toast.error("Application ID not found");
        return;
      }

      const currentStatus = "under_review";

      let requestBody = {
        applicationId,
        employeeId,
        status: currentStatus,
      };

      console.log("Initial requestBody:", requestBody);

      if (formId) {
        requestBody.formId = formId;
        console.log("Added formId to requestBody");
      }

      console.log("Checking form type conditions...");
      if (
        formType === "background-check" ||
        formType === "w4" ||
        formType === "w4-form" ||
        formType === "w9" ||
        formType === "w9-form" ||
        formType === "i9" ||
        formType === "i9-form" ||
        formType === "service-delivery-policies" ||
        formType === "orientation-presentation" ||
        formType === "non-compete-agreement" ||
        formType === "job-description" ||
        formType === "code-of-ethics" ||
        formType === "misconduct-statement" ||
        formType === "drivingLicense" ||
        formType === "employeeDetailsUpload"
      ) {
        console.log("Matched first condition - sending hrFeedback only");
        requestBody.hrFeedback = {
          comment: note,
          reviewedAt: new Date(),
          signature: hrSignature,
          ...(formType === "non-compete-agreement" && {
            companyRepSignature: localCompanyRepSignature,
            companyRepName: localCompanyRepName,
          }),
        };
        console.log("Added hrFeedback to requestBody");
      } else if (formType === "education") {
        console.log("Matched education condition");
        requestBody.educations = formData?.educations || [];
        requestBody.hrFeedback = {
          comment: note,
          reviewedAt: new Date(),
          signature: hrSignature,
          ...(formType === "non-compete-agreement" && {
            companyRepSignature: localCompanyRepSignature,
            companyRepName: localCompanyRepName,
          }),
        };
      } else if (formType === "references") {
        console.log("Matched references condition");
        requestBody.references = formData?.references || [];
        requestBody.hrFeedback = {
          comment: note,
          reviewedAt: new Date(),
          signature: hrSignature,
          ...(formType === "non-compete-agreement" && {
            companyRepSignature: localCompanyRepSignature,
            companyRepName: localCompanyRepName,
          }),
        };
      } else if (formType === "work-experience") {
        console.log("Matched work-experience condition");
        // Don't send workExperiences array - only send HR feedback
        // The backend will preserve existing work experiences
        requestBody.hrFeedback = {
          comment: note,
          reviewedAt: new Date(),
          signature: hrSignature,
        };
      } else if (formType === "legal-disclosures") {
        console.log("Matched legal-disclosures condition");
        const {
          hrFeedback: oldFeedback,
          status: oldStatus,
          ...disclosureFields
        } = formData || {};
        Object.assign(requestBody, disclosureFields);
        requestBody.hrFeedback = {
          comment: note,
          reviewedAt: new Date(),
          signature: hrSignature,
          ...(formType === "non-compete-agreement" && {
            companyRepSignature: localCompanyRepSignature,
            companyRepName: localCompanyRepName,
          }),
        };
      } else {
        console.log("Matched else condition - merging into formData");
        requestBody.formData = {
          ...(formData || {}),
          hrFeedback: {
            comment: note,
            reviewedAt: new Date(),
          },
        };
      }

      console.log("=== FINAL REQUEST BODY ===");
      console.log("Keys:", Object.keys(requestBody));
      console.log("Full body:", JSON.stringify(requestBody, null, 2));
      console.log("Endpoint:", getEndpoint(formType));

      // Special handling for tbSymptomScreen - use submit-notes endpoint
      if (formType === "tbSymptomScreen") {
        const submitNotesPayload = {
          userId: employeeId,
          notes: note.trim(),
          formType: "TBSymptomScreen",
          timestamp: new Date().toISOString(),
        };
        await axios.post(
          `${baseURL}/onboarding/submit-notes`,
          submitNotesPayload,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.post(`${baseURL}${getEndpoint(formType)}`, requestBody, {
          withCredentials: true,
        });
      }

      // Also save HR notes to employee dashboard if sending to employee
      if (setSending) {
        try {
          const appResponse = await axios.get(
            `${baseURL}/onboarding/get-application/${employeeId}`,
            { withCredentials: true }
          );
          const applicationId = appResponse.data?.data?.application?._id;

          if (applicationId) {
            await axios.post(
              `${baseURL}/onboarding/save-hr-notes-to-employee`,
              {
                applicationId,
                note,
                hrUserId: actualEmployeeId || userId || "HR",
                signature: hrSignature,
              },
              {
                withCredentials: true,
              }
            );
          }
        } catch (notesError) {
          console.warn(
            "Failed to save HR notes to employee dashboard:",
            notesError
          );
          // Don't fail the whole operation if this fails
        }
      }

      console.log("Request successful");
      toast.success("Note saved and sent to employee");
      if (onNoteSaved) onNoteSaved();
    } catch (error) {
      console.error("Error sending note to employee:", error);
      const errorMessage = error.response?.data?.debug
        ? JSON.stringify(error.response.data.debug, null, 2)
        : error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to save note";
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">HR Notes</h3>
      </div>
      {existingReviewedAt && (
        <p className="text-xs text-gray-500 mb-2">
          Last reviewed: {new Date(existingReviewedAt).toLocaleString()}
        </p>
      )}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add notes or feedback for this form..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows="4"
      />

      {/* Company Representative Fields - Only show for non-compete agreement */}
      {formType === "non-compete-agreement" && (
        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">
            Company Representative
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Signature
              </label>
              <input
                type="text"
                value={localCompanyRepSignature}
                onChange={(e) => {
                  setLocalCompanyRepSignature(e.target.value);
                  if (onCompanyRepUpdate) {
                    onCompanyRepUpdate(e.target.value, localCompanyRepName);
                  }
                }}
                placeholder="Enter signature"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "18px",
                  fontWeight: "400",
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Name and Title
              </label>
              <input
                type="text"
                value={localCompanyRepName}
                onChange={(e) => {
                  setLocalCompanyRepName(e.target.value);
                  if (onCompanyRepUpdate) {
                    onCompanyRepUpdate(
                      localCompanyRepSignature,
                      e.target.value
                    );
                  }
                }}
                placeholder="Enter name and title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {showSignature && existingSignature && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">
              Previous HR Signature:
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-xs">
            <img
              src={buildSignatureUrl(existingSignature)}
              alt="HR Signature"
              className="max-h-16 object-contain"
              onError={(e) => {
                console.error(
                  "❌ Failed to load HR signature:",
                  existingSignature
                );
                console.error("❌ Attempted URL:", e.target.src);
                e.target.style.display = "none";
                // Show fallback text
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = "block";
                }
              }}
              onLoad={(e) => {
                console.log(
                  "✅ HR signature loaded successfully:",
                  e.target.src
                );
              }}
            />
            <div
              style={{
                display: "none",
                color: "red",
                fontSize: "12px",
                marginTop: "8px",
              }}
            >
              Signature image could not be loaded
            </div>
          </div>
        </div>
      )}

      {showSignature && (
        <div className="mt-4">
          <SignaturePad
            initialValue={hrSignature}
            onSave={(signaturePath) => setHrSignature(signaturePath)}
            label="HR Signature"
            width={400}
            height={120}
          />
        </div>
      )}

      <button
        onClick={handleSendToEmployee}
        disabled={saving || sending}
        className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors"
      >
        <Send className="w-4 h-4" />
        {sending ? "Sending..." : "Send to Employee"}
      </button>
    </div>
  );
};

export default HRNotesInput;
