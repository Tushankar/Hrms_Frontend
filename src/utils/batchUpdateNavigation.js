// Batch Navigation Update Script
// This file contains the exact changes needed for each remaining form

export const FORM_UPDATES = {
  'LegalDisclosures.jsx': {
    path: '/employee/legal-disclosures',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/legal-disclosures');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/legal-disclosures'))}`
  },
  'EditPersonalCareAssistantJD.jsx': {
    path: '/employee/job-description-pca',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/job-description-pca');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/job-description-pca'))}`
  },
  'EditCodeofEthics.jsx': {
    path: '/employee/code-of-ethics',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/code-of-ethics');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/code-of-ethics'))}`
  },
  'EditServiceDeliveryPolicies.jsx': {
    path: '/employee/service-delivery-policies',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/service-delivery-policies');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/service-delivery-policies'))}`
  },
  'EditNonCompleteAgreement.jsx': {
    path: '/employee/non-compete-agreement',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/non-compete-agreement');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/non-compete-agreement'))}`
  },
  'EditBackgroundFormCheckResults.jsx': {
    path: '/employee/edit-background-form-check-results',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/edit-background-form-check-results');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/edit-background-form-check-results'))}`
  },
  'EditSymptomScreenForm.jsx': {
    path: '/employee/edit-tb-symptom-screen-form',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/edit-tb-symptom-screen-form');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/edit-tb-symptom-screen-form'))}`
  },
  'EditEmergencyContact.jsx': {
    path: '/employee/emergency-contact',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/emergency-contact');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/emergency-contact'))}`
  },
  'EditI9Form.jsx': {
    path: '/employee/i9-form',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/i9-form');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/i9-form'))}`
  },
  'EditW4Form.jsx': {
    path: '/employee/w4-form',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/w4-form');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/w4-form'))}`
  },
  'EditW9Form.jsx': {
    path: '/employee/w9-form',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/w9-form');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/w9-form'))}`
  },
  'EditDirectDepositForm.jsx': {
    path: '/employee/direct-deposit',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/direct-deposit');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/direct-deposit'))}`
  },
  'OrientationPresentation.jsx': {
    path: '/employee/orientation-presentation',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/orientation-presentation');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/orientation-presentation'))}`
  },
  'EditOrientationChecklist.jsx': {
    path: '/employee/orientation-checklist',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/orientation-checklist');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/orientation-checklist'))}`
  },
  'TrainingVideo.jsx': {
    path: '/employee/training-video',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/training-video');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/training-video'))}`
  },
  'PCATrainingQuestions.jsx': {
    path: '/employee/pca-training-questions',
    import: `import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`,
    nextNav: `const nextPath = getNextFormPath('/employee/pca-training-questions');
      navigate(nextPath, { state: { applicationId, employeeId } });`,
    prevBtn: `onClick={() => navigate(getPreviousFormPath('/employee/pca-training-questions'))}`
  }
};

console.log('Total forms to update:', Object.keys(FORM_UPDATES).length);
console.log('Forms:', Object.keys(FORM_UPDATES).join(', '));
