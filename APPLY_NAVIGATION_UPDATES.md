# Apply Navigation Updates to All Forms

## ✅ Completed Forms:
1. PersonalInformation.jsx ✓
2. Education.jsx ✓
3. References.jsx ✓

## 📝 Remaining Forms - Apply These Changes:

### For EACH form file, make these 3 changes:

---

### 1. WorkExperience.jsx
**Path:** `/employee/work-experience`

**Add import:**
```javascript
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";
```

**Replace navigation (find the navigate call after save):**
```javascript
// OLD:
navigate("/employee/professional-experience", { state: { applicationId, employeeId } });

// NEW:
const nextPath = getNextFormPath('/employee/work-experience');
navigate(nextPath, { state: { applicationId, employeeId } });
```

**Replace Previous button:**
```javascript
// OLD:
onClick={() => navigate("/employee/references")}

// NEW:
onClick={() => navigate(getPreviousFormPath('/employee/work-experience'))}
```

---

### 2. ProfessionalExperience.jsx
**Path:** `/employee/professional-experience`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/professional-experience');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/professional-experience'))}
```

---

### 3. LegalDisclosures.jsx
**Path:** `/employee/legal-disclosures`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/legal-disclosures');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/legal-disclosures'))}
```

---

### 4. EditPersonalCareAssistantJD.jsx (Job Description)
**Path:** `/employee/job-description-pca`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/job-description-pca');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/job-description-pca'))}
```

---

### 5. EditCodeofEthics.jsx
**Path:** `/employee/code-of-ethics`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/code-of-ethics');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/code-of-ethics'))}
```

---

### 6. EditServiceDeliveryPolicies.jsx
**Path:** `/employee/service-delivery-policies`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/service-delivery-policies');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/service-delivery-policies'))}
```

---

### 7. EditNonCompleteAgreement.jsx
**Path:** `/employee/non-compete-agreement`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/non-compete-agreement');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/non-compete-agreement'))}
```

---

### 8. EditBackgroundFormCheckResults.jsx
**Path:** `/employee/edit-background-form-check-results`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/edit-background-form-check-results');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/edit-background-form-check-results'))}
```

---

### 9. EditSymptomScreenForm.jsx (TB/X-Ray)
**Path:** `/employee/edit-tb-symptom-screen-form`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/edit-tb-symptom-screen-form');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/edit-tb-symptom-screen-form'))}
```

---

### 10. EditEmergencyContact.jsx
**Path:** `/employee/emergency-contact`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/emergency-contact');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/emergency-contact'))}
```

---

### 11. EditI9Form.jsx
**Path:** `/employee/i9-form`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/i9-form');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/i9-form'))}
```

---

### 12. EditW4Form.jsx
**Path:** `/employee/w4-form`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/w4-form');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/w4-form'))}
```

---

### 13. EditW9Form.jsx
**Path:** `/employee/w9-form`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/w9-form');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/w9-form'))}
```

---

### 14. EditDirectDepositForm.jsx
**Path:** `/employee/direct-deposit`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/direct-deposit');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/direct-deposit'))}
```

---

### 15. OrientationPresentation.jsx
**Path:** `/employee/orientation-presentation`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/orientation-presentation');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/orientation-presentation'))}
```

---

### 16. EditOrientationChecklist.jsx
**Path:** `/employee/orientation-checklist`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/orientation-checklist');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/orientation-checklist'))}
```

---

### 17. TrainingVideo.jsx
**Path:** `/employee/training-video`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/training-video');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/training-video'))}
```

---

### 18. PCATrainingQuestions.jsx
**Path:** `/employee/pca-training-questions`

**Changes:**
```javascript
// Import
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

// Next navigation
const nextPath = getNextFormPath('/employee/pca-training-questions');
navigate(nextPath, { state: { applicationId, employeeId } });

// Previous button
onClick={() => navigate(getPreviousFormPath('/employee/pca-training-questions'))}
```

---

## 🔍 How to Find and Replace:

### Step 1: Open each file
### Step 2: Add the import at the top
### Step 3: Find the save/submit handler and update navigation
### Step 4: Find the Previous button and update its onClick

## ✅ Testing:
After updating all forms, test the complete flow:
1. Start from Personal Information
2. Click "Save & Next" through all forms
3. Verify each form navigates to the correct next form
4. Test "Previous" button on each form
5. Verify sidebar highlights current form correctly
