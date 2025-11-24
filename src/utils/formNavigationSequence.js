// Form navigation sequence based on the application structure
export const FORM_SEQUENCE = [
  // Part 1: Employment Application
  { id: 'personal-information', path: '/employee/personal-information' },
  { id: 'education', path: '/employee/education' },
  { id: 'references', path: '/employee/references' },
  { id: 'work-experience', path: '/employee/work-experience' },
  { id: 'professional-experience', path: '/employee/professional-experience' },
  { id: 'legal-disclosures', path: '/employee/legal-disclosures' },
  
  // Part 2: Documents to Submit
  { id: 'job-description-pca', path: '/employee/job-description-pca' },
  { id: 'code-of-ethics', path: '/employee/code-of-ethics' },
  { id: 'service-delivery-policies', path: '/employee/service-delivery-policies' },
  { id: 'non-compete-agreement', path: '/employee/non-compete-agreement' },
  { id: 'background-check', path: '/employee/edit-background-form-check-results' },
  { id: 'tb-symptom-screen', path: '/employee/edit-tb-symptom-screen-form' },
  { id: 'emergency-contact', path: '/employee/emergency-contact' },
  { id: 'i9-form', path: '/employee/i9-form' },
  { id: 'w4-form', path: '/employee/w4-form' },
  { id: 'w9-form', path: '/employee/w9-form' },
  { id: 'direct-deposit', path: '/employee/direct-deposit' },
  
  // Part 3: Orientation Documentation
  { id: 'orientation-presentation', path: '/employee/orientation-presentation' },
  { id: 'orientation-checklist', path: '/employee/orientation-checklist' },
  
  // Part 4: After Hire
  { id: 'training-video', path: '/employee/training-video' },
  { id: 'pca-training-questions', path: '/employee/pca-training-questions' },
];

export const getNextFormPath = (currentPath) => {
  const currentIndex = FORM_SEQUENCE.findIndex(form => form.path === currentPath);
  if (currentIndex === -1 || currentIndex === FORM_SEQUENCE.length - 1) {
    return '/employee/task-management';
  }
  return FORM_SEQUENCE[currentIndex + 1].path;
};

export const getPreviousFormPath = (currentPath) => {
  const currentIndex = FORM_SEQUENCE.findIndex(form => form.path === currentPath);
  if (currentIndex <= 0) {
    return '/employee/task-management';
  }
  return FORM_SEQUENCE[currentIndex - 1].path;
};
