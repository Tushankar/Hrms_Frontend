/**
 * Field Locking System for HRMS Forms
 * 
 * This system locks all fields after employee submission until HR approves.
 * HR can provide feedback on specific sections to unlock only those sections for editing.
 * 
 * USAGE IN FORMS:
 * 1. Import: import { useFieldLocking } from '@/utils/fieldLockingSystem';
 * 2. In component: const { isFieldLocked, isFormLocked, getFieldMessage } = useFieldLocking(formId, applicationStatus, lockedSections);
 * 3. On input: disabled={isFieldLocked('sectionName', 'fieldName')}
 */

// State constants
export const FORM_STATES = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  IN_REVIEW_FINAL: "in_review_final",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Get message to display when field is locked
export const getFieldLockMessage = (applicationStatus, sectionName = null) => {
  const messages = {
    [FORM_STATES.SUBMITTED]: "This form is locked. It has been submitted to HR for review.",
    [FORM_STATES.UNDER_REVIEW]:
      sectionName
        ? `Only the ${sectionName} section can be edited based on HR feedback. Other sections are locked.`
        : "This form is under HR review. Only sections with HR feedback can be edited.",
    [FORM_STATES.IN_REVIEW_FINAL]: "This form is in final review. Only sections with HR feedback can be edited.",
    [FORM_STATES.APPROVED]: "This form has been approved. All fields are locked.",
    [FORM_STATES.REJECTED]: "This form was rejected. Please review HR feedback and make corrections.",
  };

  return messages[applicationStatus] || "";
};

// Check if a field is editable
export const isFieldEditable = (
  applicationStatus,
  formId,
  sectionName,
  lockedSections = {}
) => {
  // Draft - always editable
  if (applicationStatus === FORM_STATES.DRAFT) {
    return true;
  }

  // Rejected - editable (needs fixes)
  if (applicationStatus === FORM_STATES.REJECTED) {
    return true;
  }

  // Approved - locked
  if (applicationStatus === FORM_STATES.APPROVED) {
    return false;
  }

  // Under review or submitted - check if section has HR feedback
  if (
    applicationStatus === FORM_STATES.SUBMITTED ||
    applicationStatus === FORM_STATES.UNDER_REVIEW ||
    applicationStatus === FORM_STATES.IN_REVIEW_FINAL
  ) {
    const unlockedSections = lockedSections[formId] || {};
    // If section is in unlockedSections, it's editable
    return unlockedSections[sectionName] === true;
  }

  return false;
};

// React Hook for field locking
export const useFieldLocking = (formId, applicationStatus, lockedSections = {}) => {
  const isFieldLocked = (sectionName, fieldName = null) => {
    return !isFieldEditable(applicationStatus, formId, sectionName, lockedSections);
  };

  const isFormLocked = () => {
    return (
      applicationStatus === FORM_STATES.SUBMITTED ||
      applicationStatus === FORM_STATES.UNDER_REVIEW ||
      applicationStatus === FORM_STATES.IN_REVIEW_FINAL ||
      applicationStatus === FORM_STATES.APPROVED
    );
  };

  const getFieldMessage = (sectionName) => {
    if (!isFieldLocked(sectionName)) {
      return ""; // Field is editable, no message needed
    }
    return getFieldLockMessage(applicationStatus, sectionName);
  };

  const getUnlockedSections = () => {
    return lockedSections[formId] || {};
  };

  return {
    isFieldLocked,
    isFormLocked,
    getFieldMessage,
    getUnlockedSections,
    applicationStatus,
  };
};

/**
 * IMPLEMENTATION EXAMPLE IN A FORM COMPONENT:
 * 
 * import { useFieldLocking } from '@/utils/fieldLockingSystem';
 * 
 * export const PersonalInformationForm = () => {
 *   const { isFieldLocked, isFormLocked, getFieldMessage } = useFieldLocking(
 *     "personal-information",
 *     applicationStatus,
 *     lockedSections
 *   );
 * 
 *   return (
 *     <form>
 *       {isFormLocked() && (
 *         <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
 *           <p className="text-yellow-800">{getFieldMessage("personalInfo")}</p>
 *         </div>
 *       )}
 * 
 *       <div className="form-group">
 *         <label>First Name</label>
 *         <input
 *           type="text"
 *           disabled={isFieldLocked("personalInfo", "firstName")}
 *           placeholder={isFieldLocked("personalInfo") ? "Locked" : "Enter first name"}
 *         />
 *         {isFieldLocked("personalInfo") && (
 *           <small className="text-red-500">{getFieldMessage("personalInfo")}</small>
 *         )}
 *       </div>
 *     </form>
 *   );
 * };
 */
