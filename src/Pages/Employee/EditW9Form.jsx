import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, Save, Target, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
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

const EditW9Form = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [overallProgress, setOverallProgress] = useState(0);
  const baseURL =
    import.meta.env.VITE__BASEURL || "https://api.carecompapp.com";
  const [formData, setFormData] = useState({
    // Taxpayer Information
    name: "",
    businessName: "",
    taxClassification: "",
    llcClassification: "",
    otherDescription: "",

    // Address Information
    address: "",
    cityStateZip: "",

    // Tax Identification Numbers
    socialSecurityNumber: "",
    employerIdNumber: "",

    // Certification
    signature: "",
    signatureDate: "",
  });

  const fetchProgressData = async () => {
    try {
      const userCookie = Cookies.get("user");
      const user = userCookie ? JSON.parse(userCookie) : null;
      if (!user?._id) return;

      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${user._id}`,
        { withCredentials: true },
      );

      if (response.data?.data?.application) {
        const forms = response.data.data.forms;
        const completedFormsArray =
          response.data.data.application?.completedForms || [];
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
    // Load existing form data for editing
    console.log("Loading W9Form data for editing, ID:", id);
    fetchProgressData();
    // For now, we'll just set some dummy data
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated W9Form data:", formData);
    alert("W-9 Form updated successfully!");
    navigate(-1);
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
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
        required={required}
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

  const taxClassificationOptions = [
    {
      value: "individual",
      label: "Individual/sole proprietor or single-member LLC",
    },
    { value: "c-corporation", label: "C Corporation" },
    { value: "s-corporation", label: "S Corporation" },
    { value: "partnership", label: "Partnership" },
    { value: "trust-estate", label: "Trust/estate" },
    {
      value: "llc",
      label:
        "Limited liability company. Enter the tax classification (C=C corporation, S=S corporation, P=Partnership)",
    },
    { value: "other", label: "Other (see instructions)" },
  ];

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Form Content */}
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

              {/* Main Form Container */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit}>
                  {/* Header Section */}
                  <div className="bg-[#1F3A93] text-white p-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold">
                            Edit Request for Taxpayer Identification Number
                          </h1>
                          <p className="text-blue-100">
                            Update W-9 Form Information
                          </p>
                          <p className="text-blue-100">
                            Department of the Treasury - Internal Revenue
                            Service
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p>Form W-9</p>
                        <p>Rev. October 2018</p>
                        <p>Department of the Treasury</p>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-2">EDIT MODE:</p>
                      <p className="mb-2">
                        You are editing an existing W-9 form. Please review and
                        update the information as needed.
                      </p>
                      <p className="font-semibold">Note:</p>
                      <p>
                        Use this form to provide your correct Taxpayer
                        Identification Number (TIN) to the person who is
                        required to file an information return with the IRS.
                      </p>
                    </div>
                  </div>

                  {/* Form Content */}
                  <div className="p-6 md:p-8">
                    {/* Section 1: Name and Business Information */}
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                        Part I: Taxpayer Identification Number (TIN)
                      </h2>

                      <div className="grid grid-cols-1 gap-4 mb-6">
                        <FormInput
                          label="Name (as shown on your income tax return). Name is required on this line; do not leave this line blank."
                          value={formData.name}
                          onChange={(value) => handleInputChange("name", value)}
                          required
                        />
                        <FormInput
                          label="Business name/disregarded entity name, if different from above"
                          value={formData.businessName}
                          onChange={(value) =>
                            handleInputChange("businessName", value)
                          }
                        />
                      </div>

                      {/* Tax Classification */}
                      <div className="mb-6">
                        <RadioGroup
                          label="Federal tax classification (Required). Check only one of the following seven boxes:"
                          name="taxClassification"
                          options={taxClassificationOptions}
                          value={formData.taxClassification}
                          onChange={(value) =>
                            handleInputChange("taxClassification", value)
                          }
                          required
                        />

                        {formData.taxClassification === "llc" && (
                          <div className="ml-6 mt-4">
                            <FormInput
                              label="Tax classification (C=C corporation, S=S corporation, P=Partnership)"
                              value={formData.llcClassification}
                              onChange={(value) =>
                                handleInputChange("llcClassification", value)
                              }
                              placeholder="Enter C, S, or P"
                            />
                          </div>
                        )}

                        {formData.taxClassification === "other" && (
                          <div className="ml-6 mt-4">
                            <FormInput
                              label="Other (see instructions)"
                              value={formData.otherDescription}
                              onChange={(value) =>
                                handleInputChange("otherDescription", value)
                              }
                              placeholder="Describe classification"
                            />
                          </div>
                        )}
                      </div>

                      {/* Address Information */}
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b border-[#1F3A93]">
                          Address Information
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <FormInput
                            label="Address (number, street, and apt. or suite no.)"
                            value={formData.address}
                            onChange={(value) =>
                              handleInputChange("address", value)
                            }
                            required
                          />
                          <FormInput
                            label="City, state, and ZIP code"
                            value={formData.cityStateZip}
                            onChange={(value) =>
                              handleInputChange("cityStateZip", value)
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Tax Identification Numbers */}
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b border-[#1F3A93]">
                          Part I: Taxpayer Identification Number (TIN)
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Enter your TIN in the appropriate box. The TIN
                          provided must match the name given on line 1 to avoid
                          backup withholding.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            label="Social security number"
                            value={formData.socialSecurityNumber}
                            onChange={(value) =>
                              handleInputChange("socialSecurityNumber", value)
                            }
                            placeholder="XXX-XX-XXXX"
                          />
                          <FormInput
                            label="Employer identification number"
                            value={formData.employerIdNumber}
                            onChange={(value) =>
                              handleInputChange("employerIdNumber", value)
                            }
                            placeholder="XX-XXXXXXX"
                          />
                        </div>
                      </div>

                      {/* Certification Section */}
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b border-[#1F3A93]">
                          Part II: Certification
                        </h3>
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <p className="text-sm text-gray-700 mb-2">
                            Under penalties of perjury, I certify that:
                          </p>
                          <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                            <li>
                              The number shown on this form is my correct
                              taxpayer identification number (or I am waiting
                              for a number to be issued to me);
                            </li>
                            <li>
                              I am not subject to backup withholding because:
                              (a) I am exempt from backup withholding, or (b) I
                              have not been notified by the Internal Revenue
                              Service (IRS) that I am subject to backup
                              withholding;
                            </li>
                            <li>I am a U.S. citizen or other U.S. person;</li>
                            <li>
                              The FATCA code(s) entered on this form (if any)
                              indicating that I am exempt from FATCA reporting
                              is correct.
                            </li>
                          </ol>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            label="Signature"
                            value={formData.signature}
                            onChange={(value) =>
                              handleInputChange("signature", value)
                            }
                            required
                          />
                          <FormInput
                            label="Date"
                            type="date"
                            value={formData.signatureDate}
                            onChange={(value) =>
                              handleInputChange("signatureDate", value)
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Note */}
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600">
                        For Privacy Act and Paperwork Reduction Act Notice, see
                        the separate instructions.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Cat. No. 10231X Form W-9 (Rev. 10-2018)
                      </p>
                    </div>
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
                      📝 Current: W-9 Form
                    </div>
                  </div>

                  {/* Submit Button Section */}
                  <div className="bg-[#F8FAFF] px-8 md:px-12 py-8 mt-10 border border-[#E8EDFF]">
                    <div className="flex flex-col-reverse md:flex-row justify-center gap-4">
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 w-full max-w-xs py-3 bg-white border-2 border-[#1F3A93] text-[#1F3A93] font-semibold rounded-lg hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20 active:bg-[#E8EDFF] transition-all duration-200 shadow-sm hover:shadow-md"
                        onClick={() => {
                          console.log("Draft saved:", formData);
                          alert("Draft saved successfully!");
                        }}
                      >
                        <span className="text-base">Save as Draft</span>
                      </button>
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="flex items-center justify-center gap-3 w-full max-w-xs py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      >
                        <Save className="w-5 h-5" />
                        <span className="text-lg">Update Form</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditW9Form;
