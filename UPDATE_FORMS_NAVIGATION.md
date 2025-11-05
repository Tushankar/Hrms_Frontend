# Form Navigation Update Guide

## Files to Update

For each form component, add these imports and update navigation:

### 1. Add Import
```javascript
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";
```

### 2. Update Save & Next Navigation
Replace hardcoded paths with:
```javascript
const nextPath = getNextFormPath('/employee/current-form-path');
navigate(nextPath, { state: { applicationId, employeeId } });
```

### 3. Update Previous Button
Replace hardcoded paths with:
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/current-form-path'))}
```

## Form Paths to Update:

1. `/employee/personal-information` → DONE ✓
2. `/employee/education` → DONE ✓
3. `/employee/references` → DONE ✓
4. `/employee/work-experience` → DONE ✓
5. `/employee/professional-experience` → DONE ✓
6. `/employee/legal-disclosures` → Update needed
7. `/employee/job-description-pca` → Update needed
8. `/employee/code-of-ethics` → Update needed
9. `/employee/service-delivery-policies` → Update needed
10. `/employee/non-compete-agreement` → Update needed
11. `/employee/edit-background-form-check-results` → Update needed
12. `/employee/edit-tb-symptom-screen-form` → Update needed
13. `/employee/emergency-contact` → Update needed
14. `/employee/i9-form` → Update needed
15. `/employee/w4-form` → Update needed
16. `/employee/w9-form` → Update needed
17. `/employee/direct-deposit` → Update needed
18. `/employee/orientation-presentation` → Update needed
19. `/employee/orientation-checklist` → Update needed
20. `/employee/training-video` → Update needed
21. `/employee/pca-training-questions` → Update needed

## Quick Find & Replace Pattern

### Find:
```javascript
navigate("/employee/NEXT_FORM_PATH"
```

### Replace with:
```javascript
const nextPath = getNextFormPath('/employee/CURRENT_FORM_PATH');
navigate(nextPath
```

### For Previous Button Find:
```javascript
onClick={() => navigate("/employee/PREVIOUS_FORM_PATH")}
```

### Replace with:
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/CURRENT_FORM_PATH'))}
```
