import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../Components/Common/Navbar/Navbar";

const EditDirectDepositForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    // Employee Information
    employeeName: "",
    employeeId: "",
    ssn: "",
    
    // Deposit Type
    depositType: "",
    
    // Account 1
    account1: {
      accountType: "",
      routingNumber: "",
      accountNumber: "",
      bankName: "",
      amount: "",
      percentage: "",
    },
    
    // Account 2
    account2: {
      accountType: "",
      routingNumber: "",
      accountNumber: "",
      bankName: "",
      amount: "",
      percentage: "",
    },
    
    // Account 3
    account3: {
      accountType: "",
      routingNumber: "",
      accountNumber: "",
      bankName: "",
      amount: "",
      percentage: "",
    },
    
    // Authorization
    signature: "",
    signatureDate: "",
    effectiveDate: "",
  });

  useEffect(() => {
    // Load existing form data for editing
    console.log("Loading DirectDepositForm data for editing, ID:", id);
    // For now, we'll just set some dummy data
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAccountChange = (accountNum, field, value) => {
    setFormData(prev => ({
      ...prev,
      [`account${accountNum}`]: {
        ...prev[`account${accountNum}`],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated DirectDepositForm data:", formData);
    alert("Direct Deposit Form updated successfully!");
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

  const RadioGroup = ({ label, name, options, value, onChange, required = false }) => (
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

  const AccountSection = ({ accountNum, accountData, onFieldChange }) => (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h4 className="text-md font-semibold text-[#1F3A93] mb-4">Account #{accountNum}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name={`account${accountNum}Type`}
                value="checking"
                checked={accountData.accountType === "checking"}
                onChange={(e) => onFieldChange(accountNum, "accountType", e.target.value)}
                className="mr-2 h-4 w-4 text-blue-600"
              />
              <span className="text-sm">Checking</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`account${accountNum}Type`}
                value="savings"
                checked={accountData.accountType === "savings"}
                onChange={(e) => onFieldChange(accountNum, "accountType", e.target.value)}
                className="mr-2 h-4 w-4 text-blue-600"
              />
              <span className="text-sm">Savings</span>
            </label>
          </div>
        </div>
        
        <FormInput
          label="Bank Name"
          value={accountData.bankName}
          onChange={(value) => onFieldChange(accountNum, "bankName", value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormInput
          label="Routing Number"
          value={accountData.routingNumber}
          onChange={(value) => onFieldChange(accountNum, "routingNumber", value)}
          placeholder="9-digit routing number"
        />
        <FormInput
          label="Account Number"
          value={accountData.accountNumber}
          onChange={(value) => onFieldChange(accountNum, "accountNumber", value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Fixed Amount ($)"
          type="number"
          value={accountData.amount}
          onChange={(value) => onFieldChange(accountNum, "amount", value)}
          placeholder="0.00"
        />
        <FormInput
          label="Percentage (%)"
          type="number"
          value={accountData.percentage}
          onChange={(value) => onFieldChange(accountNum, "percentage", value)}
          placeholder="0"
        />
      </div>
    </div>
  );

  AccountSection.propTypes = {
    accountNum: PropTypes.number.isRequired,
    accountData: PropTypes.object.isRequired,
    onFieldChange: PropTypes.func.isRequired,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navbar */}
      <Navbar />
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
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
                      <h1 className="text-2xl md:text-3xl font-bold">Edit Direct Deposit Enrollment/Change</h1>
                      <p className="text-blue-100">Update Paychex Direct Deposit Information</p>
                      <p className="text-blue-100">Banking Information Form</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>Direct Deposit Form</p>
                    <p>Paychex Services</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">EDIT MODE:</p>
                  <p className="mb-2">
                    You are editing existing direct deposit information. Please review and update as needed.
                  </p>
                  <p className="font-semibold">Important:</p>
                  <p>
                    Changes typically take 1-2 pay periods to take effect. Verify all banking information carefully.
                  </p>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8">
                {/* Employee Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                    Employee Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Employee Name"
                      value={formData.employeeName}
                      onChange={(value) => handleInputChange("employeeName", value)}
                      required
                    />
                    <FormInput
                      label="Employee ID"
                      value={formData.employeeId}
                      onChange={(value) => handleInputChange("employeeId", value)}
                      required
                    />
                    <FormInput
                      label="Social Security Number"
                      value={formData.ssn}
                      onChange={(value) => handleInputChange("ssn", value)}
                      placeholder="XXX-XX-XXXX"
                      required
                    />
                  </div>
                </div>

                {/* Deposit Type */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b border-[#1F3A93]">
                    Type of Request
                  </h3>
                  
                  <RadioGroup
                    label="Select deposit type"
                    name="depositType"
                    options={[
                      { value: "new", label: "New Direct Deposit Enrollment" },
                      { value: "change", label: "Change to Existing Direct Deposit" },
                      { value: "cancel", label: "Cancel Direct Deposit" },
                    ]}
                    value={formData.depositType}
                    onChange={(value) => handleInputChange("depositType", value)}
                    required
                  />
                </div>

                {/* Banking Information */}
                {formData.depositType !== "cancel" && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b border-[#1F3A93]">
                      Banking Information
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      You may split your deposit among up to 3 accounts. The total percentage must equal 100% if using percentages.
                    </p>
                    
                    <AccountSection
                      accountNum={1}
                      accountData={formData.account1}
                      onFieldChange={handleAccountChange}
                    />
                    
                    <AccountSection
                      accountNum={2}
                      accountData={formData.account2}
                      onFieldChange={handleAccountChange}
                    />
                    
                    <AccountSection
                      accountNum={3}
                      accountData={formData.account3}
                      onFieldChange={handleAccountChange}
                    />
                  </div>
                )}

                {/* Authorization */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b border-[#1F3A93]">
                    Employee Authorization
                  </h3>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 mb-2">
                      I authorize my employer and its payroll service provider to initiate credit entries and, if necessary, debit 
                      entries and adjustments for any credit entries in error to my account(s) indicated above. This authorization 
                      remains in effect until I provide written notice to terminate in such time and manner as to afford a reasonable 
                      opportunity to act on it.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Employee Signature"
                      value={formData.signature}
                      onChange={(value) => handleInputChange("signature", value)}
                      required
                    />
                    <FormInput
                      label="Date Signed"
                      type="date"
                      value={formData.signatureDate}
                      onChange={(value) => handleInputChange("signatureDate", value)}
                      required
                    />
                    <FormInput
                      label="Effective Date"
                      type="date"
                      value={formData.effectiveDate}
                      onChange={(value) => handleInputChange("effectiveDate", value)}
                      required
                    />
                  </div>
                </div>

                {/* Footer Note */}
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    Please attach a voided check or bank verification form for each account listed above.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Direct Deposit Form - Paychex Services</p>
                </div>
              </div>

              {/* Submit Button Section */}
              <div className="bg-[#F8FAFF] px-8 md:px-12 py-8 mt-10 border border-[#E8EDFF]">
                <div className="flex justify-center gap-4">
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
  );
};

export default EditDirectDepositForm;
