# FINAL BATCH UPDATE - Copy & Paste for Each Form

## ✅ Already Done (5 forms):
1. PersonalInformation.jsx ✓
2. Education.jsx ✓
3. References.jsx ✓
4. WorkExperience.jsx ✓
5. ProfessionalExperience.jsx ✓

---

## 🔧 REMAINING 16 FORMS - EXACT CHANGES

### Universal Import (Add to ALL files after existing imports):
```javascript
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";
```

---

### 6️⃣ LegalDisclosures.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/legal-disclosures');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/legal-disclosures'))}
```

---

### 7️⃣ EditPersonalCareAssistantJD.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/job-description-pca');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/job-description-pca'))}
```

---

### 8️⃣ EditCodeofEthics.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/code-of-ethics');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/code-of-ethics'))}
```

---

### 9️⃣ EditServiceDeliveryPolicies.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/service-delivery-policies');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/service-delivery-policies'))}
```

---

### 🔟 EditNonCompleteAgreement.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/non-compete-agreement');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/non-compete-agreement'))}
```

---

### 1️⃣1️⃣ EditBackgroundFormCheckResults.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/edit-background-form-check-results');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/edit-background-form-check-results'))}
```

---

### 1️⃣2️⃣ EditSymptomScreenForm.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/edit-tb-symptom-screen-form');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/edit-tb-symptom-screen-form'))}
```

---

### 1️⃣3️⃣ EditEmergencyContact.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/emergency-contact');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/emergency-contact'))}
```

---

### 1️⃣4️⃣ EditI9Form.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/i9-form');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/i9-form'))}
```

---

### 1️⃣5️⃣ EditW4Form.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/w4-form');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/w4-form'))}
```

---

### 1️⃣6️⃣ EditW9Form.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/w9-form');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/w9-form'))}
```

---

### 1️⃣7️⃣ EditDirectDepositForm.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/direct-deposit');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/direct-deposit'))}
```

---

### 1️⃣8️⃣ OrientationPresentation.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/orientation-presentation');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/orientation-presentation'))}
```

---

### 1️⃣9️⃣ EditOrientationChecklist.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/orientation-checklist');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/orientation-checklist'))}
```

---

### 2️⃣0️⃣ TrainingVideo.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/training-video');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/training-video'))}
```

---

### 2️⃣1️⃣ PCATrainingQuestions.jsx
**Find:** `navigate("/employee/NEXT_PATH"`
**Replace with:**
```javascript
const nextPath = getNextFormPath('/employee/pca-training-questions');
navigate(nextPath, { state: { applicationId, employeeId } });
```
**Previous Button:**
```javascript
onClick={() => navigate(getPreviousFormPath('/employee/pca-training-questions'))}
```

---

## 🚀 QUICK STEPS FOR EACH FILE:

1. **Open** the file
2. **Add import** at top (after other imports)
3. **Find** the save/submit handler (search for `navigate("/employee/`)
4. **Replace** navigation with the code above
5. **Find** Previous button (search for `onClick={() => navigate`)
6. **Replace** with the code above
7. **Save** file
8. **Move to next file**

---

## ✅ VERIFICATION:

After updating all files, test:
- [ ] Navigate from Personal Information through all forms
- [ ] Click "Save & Next" on each form
- [ ] Click "Previous" button works correctly
- [ ] Sidebar highlights current form
- [ ] Completion indicators update

---

## 📊 PROGRESS TRACKER:

- [x] PersonalInformation.jsx
- [x] Education.jsx
- [x] References.jsx
- [x] WorkExperience.jsx
- [x] ProfessionalExperience.jsx
- [ ] LegalDisclosures.jsx
- [ ] EditPersonalCareAssistantJD.jsx
- [ ] EditCodeofEthics.jsx
- [ ] EditServiceDeliveryPolicies.jsx
- [ ] EditNonCompleteAgreement.jsx
- [ ] EditBackgroundFormCheckResults.jsx
- [ ] EditSymptomScreenForm.jsx
- [ ] EditEmergencyContact.jsx
- [ ] EditI9Form.jsx
- [ ] EditW4Form.jsx
- [ ] EditW9Form.jsx
- [ ] EditDirectDepositForm.jsx
- [ ] OrientationPresentation.jsx
- [ ] EditOrientationChecklist.jsx
- [ ] TrainingVideo.jsx
- [ ] PCATrainingQuestions.jsx

**Status: 5/21 Complete (24%)**
**Remaining: 16 forms**
**Time: ~3 min/form = ~48 minutes**

---

## 🎯 RESULT:

Once complete, your entire onboarding flow will follow the exact sequence:

```
Part 1: Employment Application
  Personal Information → Education → References → 
  Work Experience → Professional Experience → Legal Disclosures

Part 2: Documents to Submit
  Job Description → Code of Ethics → Service Delivery → 
  Non-Compete → Background Check → TB/X-Ray → 
  Emergency Contact → I-9 → W-4 → W-9 → Direct Deposit

Part 3: Orientation Documentation
  Orientation Presentation → Orientation Checklist

Part 4: After Hire
  Training Video → PCA Training Questions
```

All managed from ONE central file: `formNavigationSequence.js`
