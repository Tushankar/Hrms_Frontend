/**
 * Frontend utility functions for form status and display
 */

/**
 * Check if a form is editable on the frontend
 * @param {Object} form - The form object
 * @param {string} applicationStatus - The overall application status
 * @returns {boolean} - Whether the form can be edited
 */
export const isFormEditable = (form, applicationStatus = null) => {
  // If no form exists, it can be edited (new form)
  if (!form) return true;

  // Check if form has explicit editability
  if (form.hasOwnProperty("isEditable")) {
    return form.isEditable;
  }

  // If application is approved, no forms can be edited
  if (applicationStatus === "approved") {
    return false;
  }

  // Forms with approved or rejected status cannot be edited
  if (form.status === "approved" || form.status === "rejected") {
    return false;
  }

  // Forms with draft, completed, or submitted status can be edited
  return ["draft", "completed", "submitted", "under_review"].includes(
    form.status
  );
};

/**
 * Get form status display text with colors
 * @param {string} status - The form status
 * @returns {Object} - Status display object with text and color
 */
export const getFormStatusDisplay = (status) => {
  const statusMap = {
    draft: { text: "Draft", color: "bg-gray-100 text-gray-700" },
    completed: { text: "Completed", color: "bg-blue-100 text-blue-700" },
    submitted: { text: "Submitted", color: "bg-yellow-100 text-yellow-700" },
    under_review: {
      text: "Under Review",
      color: "bg-orange-100 text-orange-700",
    },
    approved: { text: "✓ Approved", color: "bg-green-100 text-green-700" },
    rejected: { text: "✗ Rejected", color: "bg-red-100 text-red-700" },
    staff_signed: {
      text: "Staff Signed",
      color: "bg-purple-100 text-purple-700",
    },
  };

  return (
    statusMap[status] || { text: status, color: "bg-gray-100 text-gray-700" }
  );
};

/**
 * Get form lock message for non-editable forms
 * @param {Object} form - The form object
 * @param {string} applicationStatus - The overall application status
 * @returns {string|null} - Lock message or null if editable
 */
export const getFormLockMessage = (form, applicationStatus = null) => {
  if (isFormEditable(form, applicationStatus)) {
    return null;
  }

  if (applicationStatus === "approved") {
    return "🔒 This application has been approved and all forms are now locked from editing.";
  }

  if (form?.status === "approved") {
    return "✅ This form has been approved by HR and cannot be modified.";
  }

  if (form?.status === "rejected") {
    return "❌ This form has been rejected by HR. Please contact HR for further instructions.";
  }

  return "🔒 This form is locked from editing.";
};

/**
 * Show appropriate toast message based on form editability
 * @param {Object} form - The form object
 * @param {string} applicationStatus - The overall application status
 * @param {Function} toast - Toast function
 */
export const showFormAccessMessage = (form, applicationStatus, toast) => {
  const lockMessage = getFormLockMessage(form, applicationStatus);

  if (lockMessage) {
    if (applicationStatus === "approved" || form?.status === "approved") {
      toast.success(lockMessage, {
        duration: 5000,
        style: {
          background: "#10B981",
          color: "white",
          fontWeight: "bold",
        },
      });
    } else if (form?.status === "rejected") {
      toast.error(lockMessage, {
        duration: 5000,
        style: {
          background: "#EF4444",
          color: "white",
          fontWeight: "bold",
        },
      });
    } else {
      toast(lockMessage, {
        icon: "🔒",
        duration: 4000,
      });
    }
    return false; // Not editable
  }

  return true; // Editable
};

/**
 * Check if an application has been finally approved (locked permanently)
 * @param {Object} formsData - The forms data object from API
 * @returns {boolean} - Whether the application is finally approved
 */
export const isFinallyApproved = (formsData) => {
  if (!formsData || typeof formsData !== "object") return false;

  // Check if any form has "approved" status (indicates final approval)
  return Object.values(formsData).some(
    (form) => form && form.status === "approved"
  );
};

/**
 * Get final approval lock message
 * @param {Object} formsData - The forms data object from API
 * @returns {string|null} - Final lock message or null if not finally approved
 */
export const getFinalApprovalMessage = (formsData) => {
  if (!isFinallyApproved(formsData)) return null;

  return "🔒 APPLICATION FINALLY APPROVED - This entire application and all forms have been permanently locked. No further modifications are possible. Your onboarding is complete!";
};

/**
 * Show final approval message if application is locked
 * @param {Object} formsData - The forms data object from API
 * @param {Function} toast - Toast function
 * @returns {boolean} - Whether application is finally approved
 */
export const checkFinalApprovalStatus = (formsData, toast) => {
  const message = getFinalApprovalMessage(formsData);

  if (message) {
    toast.success(message, {
      duration: 8000,
      style: {
        background: "#059669",
        color: "white",
        fontWeight: "bold",
        borderRadius: "12px",
        padding: "16px 24px",
        fontSize: "16px",
      },
      icon: "🎉",
    });
    return true; // Finally approved
  }

  return false; // Not finally approved
};

export default {
  isFormEditable,
  getFormStatusDisplay,
  getFormLockMessage,
  showFormAccessMessage,
  isFinallyApproved,
  getFinalApprovalMessage,
  checkFinalApprovalStatus,
};
