# Form Save and Next Pattern - Allow Navigation with Incomplete Forms

## Overview
This pattern allows users to click "Save & Next" and navigate to the next form even if the current form is incomplete. The form will be saved with `status: "draft"` and show a red cross (❌) in the sidebar.

## Pattern to Apply to All Forms

### 1. Update the handleSubmit function

**BEFORE:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  saveForm("completed");
};
```

**AFTER:**
```javascript
const handleSubmit = async () => {
  // Save as draft and navigate to next form
  await saveForm("draft");
  navigate("/employee/NEXT-FORM-PATH");
};
```

**Note:** Remove the `e` parameter and `e.preventDefault()` since we're changing the button type.

### 2. Remove auto-navigation from saveForm function

**BEFORE:**
```javascript
if (response.data) {
  toast.success(message);
  await fetchProgressData(user._id);
  
  if (status === "completed") {
    setTimeout(() => navigate("/employee/NEXT-FORM-PATH"), 2000);
  }
}
```

**AFTER:**
```javascript
if (response.data) {
  toast.success(message);
  await fetchProgressData(user._id);
}
```

### 3. Change Save & Next button type from submit to button

**BEFORE:**
```javascript
<button
  type="submit"
  disabled={saving}
  className="..."
>
  {saving ? "Submitting..." : "Save & Next"}
</button>
```

**AFTER:**
```javascript
<button
  type="button"
  onClick={handleSubmit}
  disabled={saving}
  className="..."
>
  {saving ? "Submitting..." : "Save & Next"}
</button>
```

**Important:** Change `type="submit"` to `type="button"` and add `onClick={handleSubmit}` to bypass HTML5 form validation.

### 4. Enable Save Draft button (if commented out)

**BEFORE:**
```javascript
<button
  type="button"
  onClick={() => saveForm("draft")}
  disabled={saving}
  // className="..."
>
  {/* <Save className="..." />
  <span>Save Draft</span> */}
</button>
```

**AFTER:**
```javascript
<button
  type="button"
  onClick={() => saveForm("draft")}
  disabled={saving}
  className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-2.5 md:py-3 px-4 md:px-6 lg:px-8 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base disabled:opacity-50"
>
  <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
  <span className="text-sm md:text-base">Save Draft</span>
</button>
```

## Form Navigation Order

Apply these changes to forms in this order:

1. **PersonalInformation.jsx** ✅ (Already updated)
   - Next: `/employee/professional-experience`

2. **ProfessionalExperience.jsx**
   - Next: `/employee/work-experience`

3. **WorkExperience.jsx**
   - Next: `/employee/references`

4. **References.jsx**
   - Next: `/employee/education`

5. **Education.jsx**
   - Next: `/employee/legal-disclosures`

6. **LegalDisclosures.jsx**
   - Next: `/employee/job-description-pca` (or based on position type)

7. **PersonalCareAssistantJD.jsx** (Job Description)
   - Next: `/employee/code-of-ethics`

8. **CodeofEthics.jsx**
   - Next: `/employee/service-delivery-policies`

9. **ServiceDeliveryPolicies.jsx**
   - Next: `/employee/non-compete-agreement`

10. **NonCompleteAgreement.jsx**
    - Next: `/employee/staff-misconduct`

11. **StaffOfMisconductForm.jsx**
    - Next: `/employee/orientation-presentation`

12. **OrientationPresentation.jsx**
    - Next: `/employee/orientation-checklist`

13. **OrientationChecklist.jsx**
    - Next: `/employee/edit-background-form-check-results`

14. **BackgroundFormCheckResults.jsx**
    - Next: `/employee/edit-tb-symptom-screen-form`

15. **SymptomScreenForm.jsx**
    - Next: `/employee/emergency-contact`

16. **EmergencyContact.jsx**
    - Next: `/employee/i9-form`

17. **I9Form.jsx**
    - Next: `/employee/w4-form`

18. **W4Form.jsx**
    - Next: `/employee/w9-form`

19. **W9Form.jsx**
    - Next: `/employee/direct-deposit`

20. **DirectDepositForm.jsx**
    - Next: `/employee/task-management` (Complete)

## Result

After applying this pattern:
- ✅ Users can navigate to next form even if current form is incomplete
- ❌ Incomplete forms show red cross in sidebar (status: "draft")
- ✓ Completed forms show green tick in sidebar (status: "completed")
- 💾 "Save Draft" button saves without navigation
- ➡️ "Save & Next" button saves as draft and navigates to next form
