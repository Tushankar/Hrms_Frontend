import React from "react";
import { AlertCircle, Lock, Unlock } from "lucide-react";

/**
 * FieldLockStatus Component
 * Displays visual feedback about field lock status
 */
export const FieldLockStatus = ({
  isLocked,
  sectionName,
  applicationStatus,
  showIcon = true,
}) => {
  if (!isLocked) {
    return null;
  }

  const messages = {
    submitted: "This form is locked. Submitted to HR for review.",
    under_review: `Only the ${sectionName} section can be edited based on HR feedback.`,
    in_review_final: `Only the ${sectionName} section can be edited based on HR feedback.`,
    approved: "This form has been approved. All fields are locked.",
    rejected: `Please review HR feedback and make corrections to the ${sectionName} section.`,
  };

  const colors = {
    submitted: "bg-blue-50 border-blue-200 text-blue-800",
    under_review: "bg-yellow-50 border-yellow-200 text-yellow-800",
    in_review_final: "bg-yellow-50 border-yellow-200 text-yellow-800",
    approved: "bg-gray-50 border-gray-200 text-gray-800",
    rejected: "bg-red-50 border-red-200 text-red-800",
  };

  const icons = {
    submitted: <Lock className="w-4 h-4" />,
    under_review: <AlertCircle className="w-4 h-4" />,
    in_review_final: <AlertCircle className="w-4 h-4" />,
    approved: <Lock className="w-4 h-4" />,
    rejected: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border ${
        colors[applicationStatus] || colors.submitted
      }`}
    >
      {showIcon && icons[applicationStatus]}
      <span className="text-sm font-medium">
        {messages[applicationStatus] || messages.submitted}
      </span>
    </div>
  );
};

/**
 * FormLockOverlay Component
 * Displays at the top of a form showing lock status
 */
export const FormLockOverlay = ({
  isLocked,
  applicationStatus,
  unlockedSections = {},
}) => {
  if (!isLocked) {
    return null;
  }

  const colors = {
    submitted: "bg-blue-100 border-blue-300 text-blue-900",
    under_review: "bg-yellow-100 border-yellow-300 text-yellow-900",
    in_review_final: "bg-yellow-100 border-yellow-300 text-yellow-900",
    approved: "bg-gray-100 border-gray-300 text-gray-900",
    rejected: "bg-red-100 border-red-300 text-red-900",
  };

  const getTitleMessage = () => {
    const titles = {
      submitted: "📋 Form Submitted - Under HR Review",
      under_review: "🔍 Form Under HR Review",
      in_review_final: "🔍 Form In Final Review",
      approved: "✅ Form Approved - Locked",
      rejected: "⚠️ Form Requires Updates",
    };
    return titles[applicationStatus] || titles.submitted;
  };

  const getDescriptionMessage = () => {
    const descriptions = {
      submitted:
        "Your form has been submitted to HR for review. You cannot edit any fields at this time.",
      under_review:
        "HR is reviewing your form. Only sections with HR feedback can be edited.",
      in_review_final:
        "HR is performing final review. Only sections with HR feedback can be edited.",
      approved:
        "Your form has been approved and is now locked. Thank you for completing the onboarding process.",
      rejected:
        "HR has identified issues that need to be corrected. Please review the feedback below and make the necessary updates.",
    };
    return descriptions[applicationStatus] || descriptions.submitted;
  };

  return (
    <div
      className={`mb-6 p-4 border-l-4 rounded-lg ${
        colors[applicationStatus] || colors.submitted
      }`}
    >
      <h3 className="font-bold mb-2">{getTitleMessage()}</h3>
      <p className="text-sm mb-3">{getDescriptionMessage()}</p>

      {Object.keys(unlockedSections).length > 0 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-sm font-semibold mb-2">✓ Sections you can edit:</p>
          <ul className="text-sm space-y-1">
            {Object.entries(unlockedSections)
              .filter(([_, isUnlocked]) => isUnlocked)
              .map(([sectionName]) => (
                <li key={sectionName} className="flex items-center gap-2">
                  <Unlock className="w-3 h-3" />
                  <span className="capitalize">
                    {sectionName
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()
                      .trim()}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * LockedFieldIndicator Component
 * Small inline indicator showing a field is locked
 */
export const LockedFieldIndicator = ({ reason = "Locked until approved" }) => {
  return (
    <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
      <Lock className="w-3 h-3" />
      <span>{reason}</span>
    </div>
  );
};

export default {
  FieldLockStatus,
  FormLockOverlay,
  LockedFieldIndicator,
};
