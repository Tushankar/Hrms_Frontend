// Batch update script for all form navigation
// Run this to see which files need updates

const formsToUpdate = [
  { file: 'WorkExperience.jsx', currentPath: '/employee/work-experience' },
  { file: 'ProfessionalExperience.jsx', currentPath: '/employee/professional-experience' },
  { file: 'LegalDisclosures.jsx', currentPath: '/employee/legal-disclosures' },
  { file: 'EditPersonalCareAssistantJD.jsx', currentPath: '/employee/job-description-pca' },
  { file: 'EditCodeofEthics.jsx', currentPath: '/employee/code-of-ethics' },
  { file: 'EditServiceDeliveryPolicies.jsx', currentPath: '/employee/service-delivery-policies' },
  { file: 'EditNonCompleteAgreement.jsx', currentPath: '/employee/non-compete-agreement' },
  { file: 'EditBackgroundFormCheckResults.jsx', currentPath: '/employee/edit-background-form-check-results' },
  { file: 'EditSymptomScreenForm.jsx', currentPath: '/employee/edit-tb-symptom-screen-form' },
  { file: 'EditEmergencyContact.jsx', currentPath: '/employee/emergency-contact' },
  { file: 'EditI9Form.jsx', currentPath: '/employee/i9-form' },
  { file: 'EditW4Form.jsx', currentPath: '/employee/w4-form' },
  { file: 'EditW9Form.jsx', currentPath: '/employee/w9-form' },
  { file: 'EditDirectDepositForm.jsx', currentPath: '/employee/direct-deposit' },
  { file: 'OrientationPresentation.jsx', currentPath: '/employee/orientation-presentation' },
  { file: 'EditOrientationChecklist.jsx', currentPath: '/employee/orientation-checklist' },
  { file: 'TrainingVideo.jsx', currentPath: '/employee/training-video' },
  { file: 'PCATrainingQuestions.jsx', currentPath: '/employee/pca-training-questions' },
];

console.log('Forms to update:');
console.log('================');
formsToUpdate.forEach((form, index) => {
  console.log(`${index + 1}. ${form.file}`);
  console.log(`   Path: ${form.currentPath}`);
  console.log(`   Add import: import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";`);
  console.log(`   Replace navigate with: navigate(getNextFormPath('${form.currentPath}'))`);
  console.log('');
});

console.log('Total forms to update:', formsToUpdate.length);
