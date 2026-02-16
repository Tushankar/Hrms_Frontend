import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, Save, Lock, Target, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { toast } from "react-toastify";
import {
  isFormEditable,
  getFormLockMessage,
  getFormStatusDisplay,
} from "../../utils/formStatusUtils";
import axios from "axios";
import Cookies from "js-cookie";

const FORM_KEYS = [
  "personalInformation",
  "professionalExperience",
  "workExperience",
  "education",
  "references",
  "legalDisclosures",
  "positionType",
  "employmentApplication",
  "orientationPresentation",
  "w4Form",
  "w9Form",
  "i9Form",
  "emergencyContact",
  "directDeposit",
  "misconductStatement",
  "codeOfEthics",
  "serviceDeliveryPolicy",
  "nonCompeteAgreement",
  "backgroundCheck",
  "tbSymptomScreen",
  "orientationChecklist",
  "jobDescriptionPCA",
  "jobDescriptionCNA",
  "jobDescriptionLPN",
  "jobDescriptionRN",
];

const EditW4Form = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const [isLoading, setIsLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [formEditability, setFormEditability] = useState({
    isEditable: true,
    applicationStatus: null,
    formStatus: null,
    lockMessage: null,
  });
  const baseURL =
    import.meta.env.VITE__BASEURL || "https://api.carecompapp.com";

  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: "",
    middleInitial: "",
    lastName: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    filingStatus: "",

    // Step 2: Multiple Jobs or Spouse Works
    multipleJobs: false,
    twoJobs: false,
    useWorksheet: false,
    extraWithholding: "",

    // Step 3: Claim Dependents
    numberOfQualifyingChildren: "",
    numberOfOtherDependents: "",

    // Step 4: Other Adjustments
    otherIncome: "",
    deductions: "",
    extraWithholdingAmount: "",

    // Step 5: Signature
    signature: "",
    date: "",
    employerName: "",
    employerEIN: "",
    employerAddress: "",
  });

  const fetchProgressData = async (existingData = null) => {
    try {
      let backendData = existingData;
      
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;

      if (!backendData && user?._id) {
        const response = await axios.get(
          `${baseURL}/onboarding/get-application/${user._id}`,
          { withCredentials: true },
        );
        if (response.data?.data) {
          backendData = response.data.data;
        }
      }

      if (backendData?.application) {
        const forms = backendData.forms;
        const completedFormsArray =
          backendData.application?.completedForms || [];
        const completedSet = new Set(completedFormsArray);

        const completed = FORM_KEYS.filter((key) => {
          const form = forms[key];
          return (
            form &&
            (form.status === "completed" ||
              form.status === "submitted" ||
              form.employeeUploadedForm ||
              completedSet.has(key))
          );
        });

        setOverallProgress(Math.round((completed.length / 25) * 100));
      }
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  };

  useEffect(() => {
    const checkFormEditability = async () => {
      try {
        setIsLoading(true);

        // Get application data to check editability
        const response = await axios.get(
          `https://api.carecompapp.com/onboarding/get-application/${id}`,
          {
            withCredentials: true,
          },
        );

        if (response.data && response.data.data) {
          const { application, forms } = response.data.data;
          const w4Form = forms.w4Form;

          // Check if form is editable
          const isEditable = isFormEditable(
            w4Form,
            application.applicationStatus,
          );
          const lockMessage = getFormLockMessage(
            w4Form,
            application.applicationStatus,
          );

          setFormEditability({
            isEditable,
            applicationStatus: application.applicationStatus,
            formStatus: w4Form?.status,
            lockMessage,
          });

          // Show lock message if form is not editable
          if (!isEditable && lockMessage) {
            if (
              application.applicationStatus === "approved" ||
              w4Form?.status === "approved"
            ) {
              toast.success(lockMessage, {
                duration: 6000,
                style: {
                  background: "#10B981",
                  color: "white",
                  fontWeight: "bold",
                },
              });
            } else if (w4Form?.status === "rejected") {
              toast.error(lockMessage, {
                duration: 6000,
                style: {
                  background: "#EF4444",
                  color: "white",
                  fontWeight: "bold",
                },
              });
            } else {
              toast(lockMessage, {
                duration: 5000,
              });
            }
          }

          // Load existing form data
          if (w4Form) {
            setFormData({
              firstName: w4Form.firstName || "",
              middleInitial: w4Form.middleInitial || "",
              lastName: w4Form.lastName || "",
              ssn: w4Form.socialSecurityNumber || "",
              address: w4Form.address || "",
              city: w4Form.cityStateZip?.split(",")[0] || "",
              state: w4Form.cityStateZip?.split(",")[1] || "",
              zipCode: w4Form.cityStateZip?.split(",")[2] || "",
              filingStatus: w4Form.filingStatus || "",
              multipleJobs: w4Form.multipleJobsOption === "yes",
              twoJobs: w4Form.multipleJobsOption === "twoJobs",
              useWorksheet: w4Form.multipleJobsOption === "useWorksheet",
              extraWithholding: w4Form.extraWithholding || "",
              numberOfQualifyingChildren: w4Form.qualifyingChildren || "",
              numberOfOtherDependents: w4Form.otherDependents || "",
              otherIncome: w4Form.otherIncome || "",
              deductions: w4Form.deductions || "",
              extraWithholdingAmount: w4Form.extraWithholding || "",
              signature: w4Form.employeeSignature || "",
              date: w4Form.signatureDate || "",
              employerName: w4Form.employerName || "",
              employerEIN: w4Form.employerEIN || "",
              employerAddress: w4Form.employerAddress || "",
            });
          }
          
           // Pass fetched data to fetchProgressData to avoid redundant call
          if (response.data.data) {
             fetchProgressData(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error checking form editability:", error);
        toast.error("Error loading form data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      checkFormEditability();

    }
  }, [id]);

  const handleInputChange = (field, value) => {
    // Prevent changes if form is not editable
    if (!formEditability.isEditable) {
      toast.warning("This form cannot be edited");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent submission if form is not editable
    if (!formEditability.isEditable) {
      toast.error("This form cannot be submitted - it is locked from editing");
      return;
    }

    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else {
      console.log("Updated W4Form data:", formData);
      alert("W-4 Form updated successfully!");
      navigate(-1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const FormInput = ({
    label,
    value,
    onChange,
    type = "text",
    className = "",
    placeholder = "",
    required = false,
  }) => (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
          {!formEditability.isEditable && (
            <Lock className="inline ml-2 w-4 h-4 text-gray-400" />
          )}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          !formEditability.isEditable
            ? "bg-gray-100 cursor-not-allowed opacity-60"
            : "hover:border-gray-400"
        }`}
        placeholder={placeholder}
        required={required}
        disabled={!formEditability.isEditable}
        readOnly={!formEditability.isEditable}
      />
    </div>
  );

  FormInput.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
  };

  const RadioGroup = ({
    label,
    name,
    options,
    value,
    onChange,
    required = false,
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              required={required}
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  RadioGroup.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
  };

  const CheckboxGroup = ({ label, checked, onChange, description }) => (
    <div className="mb-4">
      <label className="flex items-start">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
        />
        <div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </label>
    </div>
  );

  CheckboxGroup.propTypes = {
    label: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    description: PropTypes.string,
  };

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentPage} of {totalPages}
        </span>
        <span className="text-sm text-gray-500">
          {Math.round((currentPage / totalPages) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h3 className="text-lg font-bold text-[#1F3A93] mb-6 pb-2 border-b border-[#1F3A93]">
        Step 1: Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormInput
          label="First Name"
          value={formData.firstName}
          onChange={(value) => handleInputChange("firstName", value)}
          required
        />
        <FormInput
          label="Middle Initial"
          value={formData.middleInitial}
          onChange={(value) => handleInputChange("middleInitial", value)}
        />
        <FormInput
          label="Last Name"
          value={formData.lastName}
          onChange={(value) => handleInputChange("lastName", value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormInput
          label="Social Security Number"
          value={formData.ssn}
          onChange={(value) => handleInputChange("ssn", value)}
          placeholder="XXX-XX-XXXX"
          required
        />
      </div>

      <FormInput
        label="Home Address"
        value={formData.address}
        onChange={(value) => handleInputChange("address", value)}
        placeholder="Street address"
        required
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormInput
          label="City"
          value={formData.city}
          onChange={(value) => handleInputChange("city", value)}
          required
        />
        <FormInput
          label="State"
          value={formData.state}
          onChange={(value) => handleInputChange("state", value)}
          required
        />
        <FormInput
          label="ZIP Code"
          value={formData.zipCode}
          onChange={(value) => handleInputChange("zipCode", value)}
          required
        />
      </div>

      <RadioGroup
        label="Filing Status"
        name="filingStatus"
        options={[
          { value: "single", label: "Single or Married filing separately" },
          {
            value: "marriedJoint",
            label: "Married filing jointly or Qualifying widow(er)",
          },
          {
            value: "headOfHousehold",
            label:
              "Head of household (Check only if you're unmarried and pay more than half the costs of keeping up a home for yourself and a qualifying individual)",
          },
        ]}
        value={formData.filingStatus}
        onChange={(value) => handleInputChange("filingStatus", value)}
        required
      />
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 className="text-lg font-bold text-[#1F3A93] mb-6 pb-2 border-b border-[#1F3A93]">
        Step 2: Multiple Jobs or Spouse Works
      </h3>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-gray-700">
          Complete this step if you (1) hold more than one job at a time, or (2)
          are married filing jointly and your spouse also works. The correct
          amount of withholding depends on income earned from all of these jobs.
        </p>
      </div>

      <CheckboxGroup
        label="I have multiple jobs or my spouse works"
        checked={formData.multipleJobs}
        onChange={(value) => handleInputChange("multipleJobs", value)}
        description="Check if this applies to your situation"
      />

      {formData.multipleJobs && (
        <div className="ml-6 mt-4 space-y-4">
          <CheckboxGroup
            label="There are only two jobs total (including spouse)"
            checked={formData.twoJobs}
            onChange={(value) => handleInputChange("twoJobs", value)}
            description="If yes, you may use the online estimator or the worksheet below"
          />

          <CheckboxGroup
            label="I want to use the Multiple Jobs Worksheet"
            checked={formData.useWorksheet}
            onChange={(value) => handleInputChange("useWorksheet", value)}
            description="Complete the worksheet on page 3 and enter the result in Step 4(c)"
          />

          <FormInput
            label="Extra Withholding Amount (if applicable)"
            type="number"
            value={formData.extraWithholding}
            onChange={(value) => handleInputChange("extraWithholding", value)}
            placeholder="0.00"
          />
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 className="text-lg font-bold text-[#1F3A93] mb-6 pb-2 border-b border-[#1F3A93]">
        Step 3: Claim Dependents
      </h3>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-sm text-gray-700">
          If your total income will be $200,000 or less ($400,000 or less if
          married filing jointly), multiply the number of qualifying children
          under age 17 by $2,000 and other dependents by $500. Add the amounts
          and enter the total.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FormInput
            label="Qualifying children under age 17"
            type="number"
            value={formData.numberOfQualifyingChildren}
            onChange={(value) =>
              handleInputChange("numberOfQualifyingChildren", value)
            }
            placeholder="0"
          />
          <p className="text-xs text-gray-600 mt-1">Multiply by $2,000</p>
        </div>

        <div>
          <FormInput
            label="Other dependents"
            type="number"
            value={formData.numberOfOtherDependents}
            onChange={(value) =>
              handleInputChange("numberOfOtherDependents", value)
            }
            placeholder="0"
          />
          <p className="text-xs text-gray-600 mt-1">Multiply by $500</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="font-semibold text-gray-700 mb-2">Calculation:</h4>
        <div className="text-sm text-gray-600">
          <p>
            Qualifying children: {formData.numberOfQualifyingChildren || 0} ×
            $2,000 = ${(formData.numberOfQualifyingChildren || 0) * 2000}
          </p>
          <p>
            Other dependents: {formData.numberOfOtherDependents || 0} × $500 = $
            {(formData.numberOfOtherDependents || 0) * 500}
          </p>
          <p className="font-semibold text-gray-700 pt-2 border-t border-gray-300">
            Total: $
            {(formData.numberOfQualifyingChildren || 0) * 2000 +
              (formData.numberOfOtherDependents || 0) * 500}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h3 className="text-lg font-bold text-[#1F3A93] mb-6 pb-2 border-b border-[#1F3A93]">
        Step 4: Other Adjustments & Signature
      </h3>

      {/* Other Adjustments */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-4">
          Other Adjustments (Optional)
        </h4>

        <FormInput
          label="4(a) Other income (not from jobs)"
          type="number"
          value={formData.otherIncome}
          onChange={(value) => handleInputChange("otherIncome", value)}
          placeholder="0.00"
          className="mb-4"
        />

        <FormInput
          label="4(b) Deductions"
          type="number"
          value={formData.deductions}
          onChange={(value) => handleInputChange("deductions", value)}
          placeholder="0.00"
          className="mb-4"
        />

        <FormInput
          label="4(c) Extra withholding"
          type="number"
          value={formData.extraWithholdingAmount}
          onChange={(value) =>
            handleInputChange("extraWithholdingAmount", value)
          }
          placeholder="0.00"
        />
      </div>

      {/* Signature Section */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-4">Step 5: Signature</h4>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-700">
            Under penalties of perjury, I declare that this certificate, to the
            best of my knowledge and belief, is true, correct, and complete.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Employee's Signature"
            value={formData.signature}
            onChange={(value) => handleInputChange("signature", value)}
            required
          />
          <FormInput
            label="Date"
            type="date"
            value={formData.date}
            onChange={(value) => handleInputChange("date", value)}
            required
          />
        </div>
      </div>

      {/* Employer Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-4">
          For Employer Use Only
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Employer's Name and Address"
            value={formData.employerName}
            onChange={(value) => handleInputChange("employerName", value)}
          />
          <FormInput
            label="Employer Identification Number (EIN)"
            value={formData.employerEIN}
            onChange={(value) => handleInputChange("employerEIN", value)}
            placeholder="XX-XXXXXXX"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1F3A93] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading form data...</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        {!isLoading && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto flex gap-6">
              {/* Vertical Progress Bar Sidebar */}
              <div className="w-16 flex-shrink-0">
                <div className="sticky top-6 flex flex-col items-center">
                  <div className="w-4 h-[500px] bg-gray-200 rounded-full relative shadow-inner">
                    <div
                      className="w-4 bg-gradient-to-t from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out absolute bottom-0 shadow-sm"
                      style={{ height: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {overallProgress}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Application Progress
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-5xl">
                {/* Back Button */}
                <div className="mb-6">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium w-24"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>

                {/* Form Status Alert */}
                {!formEditability.isEditable && formEditability.lockMessage && (
                  <div
                    className={`mb-6 p-4 rounded-lg border-l-4 ${
                      formEditability.applicationStatus === "approved" ||
                      formEditability.formStatus === "approved"
                        ? "bg-green-50 border-green-400 text-green-800"
                        : formEditability.formStatus === "rejected"
                          ? "bg-red-50 border-red-400 text-red-800"
                          : "bg-yellow-50 border-yellow-400 text-yellow-800"
                    }`}
                  >
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      <div>
                        <p className="font-semibold">Form Locked</p>
                        <p className="text-sm">{formEditability.lockMessage}</p>
                        {formEditability.formStatus && (
                          <p className="text-xs mt-1">
                            Status:{" "}
                            {
                              getFormStatusDisplay(formEditability.formStatus)
                                .text
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Form Container */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <form onSubmit={handleSubmit}>
                    {/* Header Section */}
                    <div className="bg-[#1F3A93] text-white p-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                              Edit Employee's Withholding Certificate
                            </h1>
                            <p className="text-blue-100">
                              Update Form W-4 (2024)
                            </p>
                            <p className="text-blue-100">
                              Department of the Treasury - Internal Revenue
                              Service
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p>Form W-4</p>
                          <p>OMB No. 1545-0074</p>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-2">EDIT MODE:</p>
                        <p className="mb-2">
                          You are editing existing W-4 information. Complete
                          only the steps that apply to you.
                        </p>
                        <p>
                          The amount of income tax withheld from your pay
                          depends on what you earn and the information you give
                          your employer on Form W-4.
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 md:px-8">
                      <ProgressBar />
                    </div>

                    {/* Form Content */}
                    <div className="p-6 md:p-8">
                      {currentPage === 1 && renderStep1()}
                      {currentPage === 2 && renderStep2()}
                      {currentPage === 3 && renderStep3()}
                      {currentPage === 4 && renderStep4()}
                    </div>

                    {/* Progress Bar in Form Footer */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mx-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-700">
                            Application Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {Math.round((overallProgress / 100) * 25)}/25
                          </div>
                          <div className="text-xs text-gray-600">
                            Forms Completed
                          </div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">
                            Overall Progress
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {overallProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${overallProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center">
                        📝 Current: W-4 Tax Form
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="bg-[#F8FAFF] px-8 md:px-12 py-8 mt-10 border border-[#E8EDFF]">
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                            currentPage === 1
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-white border-2 border-[#1F3A93] text-[#1F3A93] hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20"
                          }`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Previous
                        </button>

                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (!formEditability.isEditable) {
                                toast.warning(
                                  "Form is locked and cannot be saved",
                                );
                                return;
                              }
                              console.log("Saving draft:", formData);
                              alert("Draft saved successfully!");
                            }}
                            className={`px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg transition-all duration-200 ${
                              formEditability.isEditable
                                ? "hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-300"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                            disabled={!formEditability.isEditable}
                          >
                            Save as Draft
                          </button>

                          <button
                            type="submit"
                            className={`flex items-center justify-center gap-3 px-8 py-3 font-bold tracking-wide rounded-lg transition-all duration-200 shadow-md ${
                              formEditability.isEditable
                                ? "bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 hover:shadow-lg"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!formEditability.isEditable}
                          >
                            {currentPage === totalPages ? (
                              <>
                                <Save className="w-5 h-5" />
                                Update Form
                              </>
                            ) : (
                              <>
                                Next Step
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditW4Form;
