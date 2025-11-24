import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

const EditDirectDepositForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [formData, setFormData] = useState({
    // Company Information
    companyName: "",
    clientNumber: "",
    employeeName: "",
    employeeNumber: "",
    
    // Account 1
    account1Action: "",
    account1Type: "",
    account1HolderName: "",
    account1RoutingNumber: "",
    account1Number: "",
    account1Institution: "",
    account1DepositType: "",
    account1PercentageNet: "",
    account1SpecificAmount: "",
    
    // Account 2
    account2Action: "",
    account2Type: "",
    account2HolderName: "",
    account2RoutingNumber: "",
    account2Number: "",
    account2Institution: "",
    account2DepositType: "",
    account2PercentageNet: "",
    account2SpecificAmount: "",
    
    // Account 3
    account3Action: "",
    account3Type: "",
    account3HolderName: "",
    account3RoutingNumber: "",
    account3Number: "",
    account3Institution: "",
    account3DepositType: "",
    account3PercentageNet: "",
    account3SpecificAmount: "",
    
    // Authorization
    employeeSignature: "",
    employeeSignatureDate: "",
    employerRepName: "",
    employerRepSignature: "",
    employerRepDate: "",
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, [id]);

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get('user');
      const sessionToken = Cookies.get('session');
      const accessToken = Cookies.get('accessToken');
      
      console.log('User cookie:', userCookie); // Debug log
      console.log('Session token:', sessionToken); // Debug log
      console.log('Access token:', accessToken); // Debug log
      
      // Use fallback user if needed
      let user;
      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error('Error parsing user cookie:', e);
        user = null;
      }
      
      if (!user || !user._id) {
        console.log('No user found, using test user for development');
        user = { _id: "67e0f8770c6feb6ba99d11d2" };
      }
      
      const token = sessionToken || accessToken;
      
      console.log('Final user:', user); // Debug log
      console.log('Final token:', token); // Debug log

      console.log('Loading Direct Deposit form for editing, ID:', id); // Debug log

      // Get or create onboarding application
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // If we have an ID parameter, try to load specific form data
      if (id) {
        try {
          const formResponse = await axios.get(`${baseURL}/onboarding/get-direct-deposit-by-id/${id}`, {
            headers,
            withCredentials: true
          });

          if (formResponse.data && formResponse.data.directDeposit) {
            const directDepositData = formResponse.data.directDeposit;
            console.log('Direct Deposit form data loaded for editing:', directDepositData);
            setFormData(directDepositData);
            setApplicationId(directDepositData.applicationId);
          } else {
            toast.error('Direct Deposit form not found');
            navigate(-1);
          }
        } catch (formError) {
          console.error('Error loading Direct Deposit form:', formError);
          toast.error('Failed to load Direct Deposit form data');
          navigate(-1);
        }
      } else {
        // If no ID, get application data (fallback)
        const response = await axios.get(`${baseURL}/onboarding/get-application/${user._id}`, {
          headers,
          withCredentials: true
        });

        if (response.data && response.data.data && response.data.data.application) {
          setApplicationId(response.data.data.application._id);
          console.log('Application ID set:', response.data.data.application._id);
          
          // Load existing direct deposit data if it exists
          if (response.data.data.forms.directDeposit) {
            setFormData(response.data.data.forms.directDeposit);
            console.log('Direct Deposit form data loaded:', response.data.data.forms.directDeposit);
          }
        } else {
          console.error('Invalid response structure in Direct Deposit form:', response.data);
          toast.error('Failed to initialize form - invalid response');
        }
      }
    } catch (error) {
      console.error('Error initializing Direct Deposit form:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveForm = async () => {
    if (saving) return; // Prevent double submission
    
    if (!applicationId) {
      toast.error('Application ID not found');
      return;
    }

    setSaving(true);
    
    try {
      const userCookie = Cookies.get('user');
      const sessionToken = Cookies.get('session');
      const accessToken = Cookies.get('accessToken');
      
      let user;
      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error('Error parsing user cookie:', e);
        user = null;
      }
      
      if (!user || !user._id) {
        user = { _id: "67e0f8770c6feb6ba99d11d2" };
      }
      
      const token = sessionToken || accessToken;
      
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('Saving Direct Deposit form data:', formData);

      const response = await axios.post(
        `${baseURL}/onboarding/save-direct-deposit`,
        {
          applicationId,
          employeeId: user._id,
          formData,
          status: 'completed'
        },
        {
          headers,
          withCredentials: true
        }
      );

      console.log('Save response:', response.data);
      toast.success('Direct Deposit form updated successfully!');
      
      // Navigate back after successful save
      setTimeout(() => {
        navigate(-1);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving Direct Deposit form:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save Direct Deposit form';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveForm();
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

  const accountActionOptions = [
    { value: "add", label: "Add new" },
    { value: "update", label: "Update existing account" },
    { value: "replace", label: "Replace existing account" },
  ];

  const accountTypeOptions = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
  ];

  const depositTypeOptions = [
    { value: "percentage", label: "Percentage of Net Pay" },
    { value: "specific", label: "Specific Dollar Amount" },
    { value: "remainder", label: "Remainder of Net Pay" },
  ];

  const AccountSection = ({ accountNumber, accountData, onFieldChange }) => (
    <div className="mb-8 p-6 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-bold text-[#1F3A93] mb-4">Account {accountNumber}</h3>
      
      {/* Account Action */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-semibold text-gray-700">COMPLETE TO ENROLL / ADD / CHANGE BANK ACCOUNTS - PLEASE PRINT CLEARLY IN BLACK/BLUE INK ONLY</span>
        </div>
        <RadioGroup
          label="Action:"
          name={`account${accountNumber}Action`}
          options={accountActionOptions}
          value={accountData.action}
          onChange={(value) => onFieldChange(`account${accountNumber}Action`, value)}
        />
        
        {accountData.action === "replace" && (
          <div className="mb-4">
            <FormInput
              label="Last 4 digits of the existing account number"
              value={accountData.lastFourDigits || ""}
              onChange={(value) => onFieldChange(`account${accountNumber}LastFourDigits`, value)}
              placeholder="XXXX"
              className="w-24"
            />
          </div>
        )}
      </div>

      {/* Account Type and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <RadioGroup
          label="Type of Account:"
          name={`account${accountNumber}Type`}
          options={accountTypeOptions}
          value={accountData.type}
          onChange={(value) => onFieldChange(`account${accountNumber}Type`, value)}
        />
        <FormInput
          label="Account holder's Name:"
          value={accountData.holderName}
          onChange={(value) => onFieldChange(`account${accountNumber}HolderName`, value)}
        />
      </div>

      {/* Routing and Account Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormInput
          label="Routing/Transit Number"
          value={accountData.routingNumber}
          onChange={(value) => onFieldChange(`account${accountNumber}RoutingNumber`, value)}
          placeholder="9 digits"
        />
        <FormInput
          label="Checking/Savings Account Number"
          value={accountData.number}
          onChange={(value) => onFieldChange(`account${accountNumber}Number`, value)}
        />
      </div>

      {/* Financial Institution */}
      <div className="mb-4">
        <FormInput
          label="Financial Institution ('Bank') Name"
          value={accountData.institution}
          onChange={(value) => onFieldChange(`account${accountNumber}Institution`, value)}
        />
      </div>

      {/* Deposit Preferences */}
      <div className="mb-4">
        <RadioGroup
          label="I wish to deposit (check one):"
          name={`account${accountNumber}DepositType`}
          options={depositTypeOptions}
          value={accountData.depositType}
          onChange={(value) => onFieldChange(`account${accountNumber}DepositType`, value)}
        />
      </div>

      {/* Amount Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountData.depositType === "percentage" && (
          <FormInput
            label="% of Net"
            value={accountData.percentageNet}
            onChange={(value) => onFieldChange(`account${accountNumber}PercentageNet`, value)}
            type="number"
            placeholder="0-100"
          />
        )}
        {accountData.depositType === "specific" && (
          <FormInput
            label="Specific Dollar Amount $"
            value={accountData.specificAmount}
            onChange={(value) => onFieldChange(`account${accountNumber}SpecificAmount`, value)}
            type="number"
            placeholder="0.00"
          />
        )}
        {accountData.depositType === "remainder" && (
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            Remainder of Net Pay will be deposited to this account
          </div>
        )}
      </div>
    </div>
  );

  AccountSection.propTypes = {
    accountNumber: PropTypes.number.isRequired,
    accountData: PropTypes.object.isRequired,
    onFieldChange: PropTypes.func.isRequired,
  };

  return (
    <Layout>
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

            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              /* Main Form Container */
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <form onSubmit={handleSubmit}>
                {/* Header Section */}
                <div className="bg-[#1F3A93] text-white p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Edit Direct Deposit Enrollment/Change Form</h1>
                        <p className="text-blue-100">Update Paychex Payroll Services Information</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">EDIT MODE:</p>
                    <p className="mb-2">
                      You are editing an existing Direct Deposit form. Please review and update the information as needed.
                    </p>
                    <p className="font-semibold">Note:</p>
                    <p>
                      Make sure all required fields are completed accurately. Changes will be saved when you submit the form.
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6 md:p-8">
                  {/* Company and Employee Information */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                      Company and Employee Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormInput
                        label="Company Name and/or Client Number"
                        value={formData.companyName}
                        onChange={(value) => handleInputChange("companyName", value)}
                        required
                      />
                      <FormInput
                        label="Client Number"
                        value={formData.clientNumber}
                        onChange={(value) => handleInputChange("clientNumber", value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormInput
                        label="Employee/Worker Name"
                        value={formData.employeeName}
                        onChange={(value) => handleInputChange("employeeName", value)}
                        required
                      />
                      <FormInput
                        label="Employee/Worker Number"
                        value={formData.employeeNumber}
                        onChange={(value) => handleInputChange("employeeNumber", value)}
                      />
                    </div>
                  </div>

                  {/* Account Sections */}
                  <AccountSection
                    accountNumber={1}
                    accountData={{
                      action: formData.account1Action,
                      type: formData.account1Type,
                      holderName: formData.account1HolderName,
                      routingNumber: formData.account1RoutingNumber,
                      number: formData.account1Number,
                      institution: formData.account1Institution,
                      depositType: formData.account1DepositType,
                      percentageNet: formData.account1PercentageNet,
                      specificAmount: formData.account1SpecificAmount,
                    }}
                    onFieldChange={handleInputChange}
                  />

                  <AccountSection
                    accountNumber={2}
                    accountData={{
                      action: formData.account2Action,
                      type: formData.account2Type,
                      holderName: formData.account2HolderName,
                      routingNumber: formData.account2RoutingNumber,
                      number: formData.account2Number,
                      institution: formData.account2Institution,
                      depositType: formData.account2DepositType,
                      percentageNet: formData.account2PercentageNet,
                      specificAmount: formData.account2SpecificAmount,
                    }}
                    onFieldChange={handleInputChange}
                  />

                  <AccountSection
                    accountNumber={3}
                    accountData={{
                      action: formData.account3Action,
                      type: formData.account3Type,
                      holderName: formData.account3HolderName,
                      routingNumber: formData.account3RoutingNumber,
                      number: formData.account3Number,
                      institution: formData.account3Institution,
                      depositType: formData.account3DepositType,
                      percentageNet: formData.account3PercentageNet,
                      specificAmount: formData.account3SpecificAmount,
                    }}
                    onFieldChange={handleInputChange}
                  />

                  {/* Authorization Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                      Confirmation Statement
                    </h2>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-gray-700 mb-4">
                        <strong>PLEASE READ CAREFULLY IN BLACK/BLUE INK ONLY:</strong>
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        I authorize my employer/company to deposit my earnings into the bank account(s) specified above and, if necessary, to electronically 
                        debit my account to correct erroneous entries. I certify my account(s) allow these transactions. Furthermore, I certify that the above listed 
                        account number accurately reflects my intended receiving account. I agree that direct deposit transactions I authorize comply with all 
                        applicable laws. My signature authorizes my employer to deposit funds at my request, and I am entitled to know when the account is established.
                        I understand that this authorization will remain in full force and effect until I notify Company in writing that I wish to cancel my authorization, 
                        and Company has a reasonable period of time to act on my cancellation.
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        This authorization requires at least 5 business days prior notice to cancel this authorization.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormInput
                        label="Employee/Worker Signature"
                        value={formData.employeeSignature}
                        onChange={(value) => handleInputChange("employeeSignature", value)}
                        placeholder="Sign Here"
                        required
                      />
                      <FormInput
                        label="Date:"
                        type="date"
                        value={formData.employeeSignatureDate}
                        onChange={(value) => handleInputChange("employeeSignatureDate", value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Employer/Company Representative Printed Name:"
                        value={formData.employerRepName}
                        onChange={(value) => handleInputChange("employerRepName", value)}
                      />
                      <FormInput
                        label="Date:"
                        type="date"
                        value={formData.employerRepDate}
                        onChange={(value) => handleInputChange("employerRepDate", value)}
                      />
                    </div>

                    <div className="mt-4">
                      <FormInput
                        label="Employer/Company Representative Signature:"
                        value={formData.employerRepSignature}
                        onChange={(value) => handleInputChange("employerRepSignature", value)}
                        placeholder="Employer Signature"
                      />
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Important Notes</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• All fields are required except Employee/Worker Number.</li>
                      <li>• Certain accounts may have restrictions on deposits and withdrawals. Check with your bank for more information specific to your account.</li>
                      <li>• Note: Digital or Electronic Signatures are not acceptable.</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-4">Form DP0002 10/20 - Form Expires 10/31/23</p>
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
                      disabled={saving}
                      className="flex items-center justify-center gap-3 w-full max-w-xs py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      <span className="text-lg">{saving ? 'Saving...' : 'Update Form'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditDirectDepositForm;
