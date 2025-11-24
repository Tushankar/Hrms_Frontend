// Utility to apply consistent navigation across all forms
// Import this in each form component and use the helper functions

import { getNextFormPath, getPreviousFormPath } from './formNavigationSequence';

/**
 * Get navigation handlers for a form
 * @param {string} currentPath - Current form path (e.g., '/employee/education')
 * @param {function} navigate - React Router navigate function
 * @param {object} state - State to pass to next form (applicationId, employeeId)
 * @returns {object} Navigation handlers
 */
export const useFormNavigation = (currentPath, navigate, state = {}) => {
  const handleNext = () => {
    const nextPath = getNextFormPath(currentPath);
    navigate(nextPath, { state });
  };

  const handlePrevious = () => {
    const prevPath = getPreviousFormPath(currentPath);
    navigate(prevPath, { state });
  };

  const handleExit = () => {
    navigate('/employee/task-management');
  };

  return {
    handleNext,
    handlePrevious,
    handleExit,
    nextPath: getNextFormPath(currentPath),
    prevPath: getPreviousFormPath(currentPath),
  };
};
