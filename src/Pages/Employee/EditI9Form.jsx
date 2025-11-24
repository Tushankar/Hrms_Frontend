import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

const EditI9Form = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [formData, setFormData] = useState({
    // Section 1: Employee Information and Attestation
    lastName: "",
    firstName: "",
    middleInitial: "",
    otherLastNames: "",
    address: "",
    aptNumber: "",
    cityOrTown: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    socialSecurityNumber: "",
    employeeEmail: "",
    employeePhone: "",
    
    // Citizenship/Immigration Status
    citizenshipStatus: "",
    uscisNumber: "",
    formI94Number: "",
    foreignPassportNumber: "",
    countryOfIssuance: "",
    expirationDate: "",
    
    // Preparer/Translator section
    preparerUsed: false,
    preparerLastName: "",
    preparerFirstName: "",
    preparerAddress: "",
    preparerSignature: "",
    preparerDate: "",
    
    // Employee Signature
    employeeSignature: "",
    employeeSignatureDate: "",
    
    // Section 2: Employer Review and Verification
    employmentStartDate: "",
    
    // Document verification (List A, B, or C)
    documentTitle1: "",
    issuingAuthority1: "",
    documentNumber1: "",
    expirationDate1: "",
    
    documentTitle2: "",
    issuingAuthority2: "",
    documentNumber2: "",
    expirationDate2: "",
    
    documentTitle3: "",
    issuingAuthority3: "",
    documentNumber3: "",
    expirationDate3: "",
    
    // Additional Information
    additionalInfo: "",
    
    // Certification
    employerSignature: "",
    employerSignatureDate: "",
    employerName: "",
    employerTitle: "",
    employerBusinessName: "",
    employerBusinessAddress: "",
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

      console.log('Loading I9 form for editing, ID:', id); // Debug log

      // Get or create onboarding application
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // If we have an ID parameter, try to load specific form data
      if (id) {
        try {
          const formResponse = await axios.get(`${baseURL}/onboarding/get-i9-form-by-id/${id}`, {
            headers,
            withCredentials: true
          });

          if (formResponse.data && formResponse.data.i9Form) {
            const i9Data = formResponse.data.i9Form;
            console.log('I9 form data loaded for editing:', i9Data);
            
            // Map the nested structure to flat structure for the form
            const flatFormData = {
              // Section 1 fields
              lastName: i9Data.section1?.lastName || "",
              firstName: i9Data.section1?.firstName || "",
              middleInitial: i9Data.section1?.middleInitial || "",
              otherLastNames: i9Data.section1?.otherLastNames || "",
              address: i9Data.section1?.address || "",
              aptNumber: i9Data.section1?.aptNumber || "",
              cityOrTown: i9Data.section1?.cityOrTown || "",
              state: i9Data.section1?.state || "",
              zipCode: i9Data.section1?.zipCode || "",
              dateOfBirth: i9Data.section1?.dateOfBirth || "",
              socialSecurityNumber: i9Data.section1?.socialSecurityNumber || "",
              employeeEmail: i9Data.section1?.employeeEmail || "",
              employeePhone: i9Data.section1?.employeePhone || "",
              citizenshipStatus: i9Data.section1?.citizenshipStatus || "",
              uscisNumber: i9Data.section1?.uscisNumber || "",
              formI94Number: i9Data.section1?.formI94Number || "",
              foreignPassportNumber: i9Data.section1?.foreignPassportNumber || "",
              countryOfIssuance: i9Data.section1?.countryOfIssuance || "",
              expirationDate: i9Data.section1?.expirationDate || "",
              employeeSignature: i9Data.section1?.employeeSignature || "",
              employeeSignatureDate: i9Data.section1?.employeeSignatureDate || "",
              
              // Preparer/Translator fields
              preparerUsed: i9Data.section1?.preparerTranslator?.preparerUsed || false,
              preparerLastName: i9Data.section1?.preparerTranslator?.preparerLastName || "",
              preparerFirstName: i9Data.section1?.preparerTranslator?.preparerFirstName || "",
              preparerAddress: i9Data.section1?.preparerTranslator?.preparerAddress || "",
              preparerSignature: i9Data.section1?.preparerTranslator?.preparerSignature || "",
              preparerDate: i9Data.section1?.preparerTranslator?.preparerDate || "",
              
              // Section 2 fields
              employmentStartDate: i9Data.section2?.employmentStartDate || "",
              documentTitle1: i9Data.section2?.documentTitle1 || "",
              issuingAuthority1: i9Data.section2?.issuingAuthority1 || "",
              documentNumber1: i9Data.section2?.documentNumber1 || "",
              expirationDate1: i9Data.section2?.expirationDate1 || "",
              documentTitle2: i9Data.section2?.documentTitle2 || "",
              issuingAuthority2: i9Data.section2?.issuingAuthority2 || "",
              documentNumber2: i9Data.section2?.documentNumber2 || "",
              expirationDate2: i9Data.section2?.expirationDate2 || "",
              documentTitle3: i9Data.section2?.documentTitle3 || "",
              issuingAuthority3: i9Data.section2?.issuingAuthority3 || "",
              documentNumber3: i9Data.section2?.documentNumber3 || "",
              expirationDate3: i9Data.section2?.expirationDate3 || "",
              additionalInfo: i9Data.section2?.additionalInfo || "",
              employerSignature: i9Data.section2?.employerSignature || "",
              employerSignatureDate: i9Data.section2?.employerSignatureDate || "",
              employerName: i9Data.section2?.employerName || "",
              employerTitle: i9Data.section2?.employerTitle || "",
              employerBusinessName: i9Data.section2?.employerBusinessName || "",
              employerBusinessAddress: i9Data.section2?.employerBusinessAddress || "",
            };
            
            setFormData(flatFormData);
            setApplicationId(i9Data.applicationId);
          } else {
            toast.error('I9 form not found');
            navigate(-1);
          }
        } catch (formError) {
          console.error('Error loading I9 form:', formError);
          toast.error('Failed to load I9 form data');
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
          
          // Load existing I9 form data if it exists (already flattened)
          if (response.data.data.forms.i9Form) {
            setFormData(response.data.data.forms.i9Form);
            console.log('I9 form data loaded:', response.data.data.forms.i9Form);
          }
        } else {
          console.error('Invalid response structure in I9 form:', response.data);
          toast.error('Failed to initialize form - invalid response');
        }
      }
    } catch (error) {
      console.error('Error initializing I9 form:', error);
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

  const saveForm = async (status = 'draft') => {
    if (!applicationId) {
      toast.error('Application ID not found');
      return;
    }

    setSaving(true);
    try {
      const userCookie = Cookies.get('user');
      const sessionToken = Cookies.get('session');
      const accessToken = Cookies.get('accessToken');
      
      // Use fallback user if needed
      const user = userCookie ? JSON.parse(userCookie) : { _id: "67e0f8770c6feb6ba99d11d2" };
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log('Updating I9 form data:', formData); // Debug log

      // Map flat form data to nested structure expected by backend
      const mappedFormData = {
        // Section 1: Employee Information and Attestation
        section1: {
          lastName: formData.lastName,
          firstName: formData.firstName,
          middleInitial: formData.middleInitial,
          otherLastNames: formData.otherLastNames,
          address: formData.address,
          aptNumber: formData.aptNumber,
          cityOrTown: formData.cityOrTown,
          state: formData.state,
          zipCode: formData.zipCode,
          dateOfBirth: formData.dateOfBirth,
          socialSecurityNumber: formData.socialSecurityNumber,
          employeeEmail: formData.employeeEmail,
          employeePhone: formData.employeePhone,
          citizenshipStatus: formData.citizenshipStatus,
          uscisNumber: formData.uscisNumber,
          formI94Number: formData.formI94Number,
          foreignPassportNumber: formData.foreignPassportNumber,
          countryOfIssuance: formData.countryOfIssuance,
          expirationDate: formData.expirationDate,
          employeeSignature: formData.employeeSignature,
          employeeSignatureDate: formData.employeeSignatureDate,
          preparerTranslator: {
            preparerUsed: formData.preparerUsed,
            preparerLastName: formData.preparerLastName,
            preparerFirstName: formData.preparerFirstName,
            preparerAddress: formData.preparerAddress,
            preparerSignature: formData.preparerSignature,
            preparerDate: formData.preparerDate,
          }
        },
        // Section 2: Employer Review and Verification
        section2: {
          employmentStartDate: formData.employmentStartDate,
          documentTitle1: formData.documentTitle1,
          issuingAuthority1: formData.issuingAuthority1,
          documentNumber1: formData.documentNumber1,
          expirationDate1: formData.expirationDate1,
          documentTitle2: formData.documentTitle2,
          issuingAuthority2: formData.issuingAuthority2,
          documentNumber2: formData.documentNumber2,
          expirationDate2: formData.expirationDate2,
          documentTitle3: formData.documentTitle3,
          issuingAuthority3: formData.issuingAuthority3,
          documentNumber3: formData.documentNumber3,
          expirationDate3: formData.expirationDate3,
          additionalInfo: formData.additionalInfo,
          employerSignature: formData.employerSignature,
          employerSignatureDate: formData.employerSignatureDate,
          employerName: formData.employerName,
          employerTitle: formData.employerTitle,
          employerBusinessName: formData.employerBusinessName,
          employerBusinessAddress: formData.employerBusinessAddress,
        }
      };

      const response = await axios.post(
        `${baseURL}/onboarding/save-i9-form`,
        {
          applicationId,
          employeeId: user._id,
          formData: mappedFormData,
          status
        },
        {
          headers,
          withCredentials: true
        }
      );

      if (response.data) {
        const message = status === 'draft' 
          ? 'I-9 form updated and saved as draft' 
          : 'I-9 form updated successfully!';
        
        toast.success(message);
        
        if (status === 'completed') {
          setTimeout(() => navigate('/employee/onboarding'), 2000);
        } else {
          setTimeout(() => navigate(-1), 1500);
        }
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error(error.response?.data?.message || 'Failed to update form');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveForm('completed');
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-full flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
              <p className="mt-2 text-gray-600">Loading I-9 form...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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

  const citizenshipOptions = [
    { value: "citizen", label: "1. A citizen of the United States" },
    { value: "national", label: "2. A noncitizen national of the United States (See instructions.)" },
    { value: "alien", label: "3. A lawful permanent resident (Enter USCIS or A-Number.)" },
    { value: "authorized", label: "4. An alien authorized to work until (expiration date, if any)" },
  ];

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

          {/* Main Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Header Section */}
              <div className="bg-[#1F3A93] text-white p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">Edit Employment Eligibility Verification</h1>
                      <p className="text-blue-100">Update Form I-9 Information</p>
                      <p className="text-blue-100">U.S. Citizenship and Immigration Services</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>USCIS Form I-9</p>
                    <p>OMB No.1615-0047</p>
                    <p>Expires 05/31/2027</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">EDIT MODE:</p>
                  <p className="mb-2">
                    You are editing an existing I-9 form. Please review and update the information as needed.
                  </p>
                  <p className="font-semibold">Note:</p>
                  <p>
                    Make sure all required fields are completed accurately. Changes will be saved when you submit the form.
                  </p>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8">
                {/* Section 1: Employee Information and Attestation */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
                    Section 1. Employee Information and Attestation:
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Update employee information as needed.
                  </p>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <FormInput
                      label="Last Name (Family Name)"
                      value={formData.lastName}
                      onChange={(value) => handleInputChange("lastName", value)}
                      required
                    />
                    <FormInput
                      label="First Name (Given Name)"
                      value={formData.firstName}
                      onChange={(value) => handleInputChange("firstName", value)}
                      required
                    />
                    <FormInput
                      label="Middle Initial (if any)"
                      value={formData.middleInitial}
                      onChange={(value) => handleInputChange("middleInitial", value)}
                    />
                    <FormInput
                      label="Other Last Names Used (if any)"
                      value={formData.otherLastNames}
                      onChange={(value) => handleInputChange("otherLastNames", value)}
                    />
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput
                      label="Address (Street Number and Name)"
                      value={formData.address}
                      onChange={(value) => handleInputChange("address", value)}
                      required
                    />
                    <FormInput
                      label="Apt. Number (if any)"
                      value={formData.aptNumber}
                      onChange={(value) => handleInputChange("aptNumber", value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <FormInput
                      label="City or Town"
                      value={formData.cityOrTown}
                      onChange={(value) => handleInputChange("cityOrTown", value)}
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

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <FormInput
                      label="Date of Birth (mm/dd/yyyy)"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(value) => handleInputChange("dateOfBirth", value)}
                      required
                    />
                    <FormInput
                      label="U.S. Social Security Number"
                      value={formData.socialSecurityNumber}
                      onChange={(value) => handleInputChange("socialSecurityNumber", value)}
                      placeholder="XXX-XX-XXXX"
                    />
                    <FormInput
                      label="Employee's Email Address"
                      type="email"
                      value={formData.employeeEmail}
                      onChange={(value) => handleInputChange("employeeEmail", value)}
                    />
                  </div>

                  <div className="mb-6">
                    <FormInput
                      label="Employee's Telephone Number"
                      value={formData.employeePhone}
                      onChange={(value) => handleInputChange("employeePhone", value)}
                      placeholder="(XXX) XXX-XXXX"
                    />
                  </div>

                  {/* Citizenship/Immigration Status */}
                  <div className="mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        I am aware that federal law provides for imprisonment and/or fines for false statements or use of false documents in
                        connection with the completion of this form.
                      </p>
                      <p className="text-sm text-gray-700">
                        Check one of the following boxes to attest to your citizenship or immigration status (See page 2 and 3 of the instructions.):
                      </p>
                    </div>

                    <RadioGroup
                      label="Citizenship/Immigration Status"
                      name="citizenshipStatus"
                      options={citizenshipOptions}
                      value={formData.citizenshipStatus}
                      onChange={(value) => handleInputChange("citizenshipStatus", value)}
                      required
                    />

                    {/* Conditional fields based on selection */}
                    {formData.citizenshipStatus === "alien" && (
                      <div className="ml-6 mb-4">
                        <FormInput
                          label="USCIS or A-Number"
                          value={formData.uscisNumber}
                          onChange={(value) => handleInputChange("uscisNumber", value)}
                          placeholder="Enter USCIS or A-Number"
                        />
                      </div>
                    )}

                    {formData.citizenshipStatus === "authorized" && (
                      <div className="ml-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <FormInput
                          label="Form I-94 Admission Number"
                          value={formData.formI94Number}
                          onChange={(value) => handleInputChange("formI94Number", value)}
                        />
                        <FormInput
                          label="Foreign Passport Number and Country of Issuance"
                          value={formData.foreignPassportNumber}
                          onChange={(value) => handleInputChange("foreignPassportNumber", value)}
                        />
                        <FormInput
                          label="Expiration Date (mm/dd/yyyy)"
                          type="date"
                          value={formData.expirationDate}
                          onChange={(value) => handleInputChange("expirationDate", value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Employee Signature Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[#1F3A93] mb-4 pb-2 border-b border-[#1F3A93]">
                      Employee Signature
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        label="Employee's Signature"
                        value={formData.employeeSignature}
                        onChange={(value) => handleInputChange("employeeSignature", value)}
                        required
                      />
                      <FormInput
                        label="Today's Date (mm/dd/yyyy)"
                        type="date"
                        value={formData.employeeSignatureDate}
                        onChange={(value) => handleInputChange("employeeSignatureDate", value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    For reverification or rehire, complete <span className="underline font-medium">Supplement B, Reverification and Rehire</span> on Page 4.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Form I-9 Edition: 01/20/25 Page 1 of 4</p>
                </div>
              </div>

              {/* Submit Button Section */}
              <div className="bg-[#F8FAFF] px-8 md:px-12 py-8 mt-10 border border-[#E8EDFF]">
                <div className="flex flex-col-reverse md:flex-row justify-center gap-4">
                  <button
                    type="button"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 w-full max-w-xs py-3 bg-white border-2 border-[#1F3A93] text-[#1F3A93] font-semibold rounded-lg hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20 active:bg-[#E8EDFF] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => saveForm('draft')}
                  >
                    {saving ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#1F3A93]"></div>
                        <span className="text-base">Saving...</span>
                      </>
                    ) : (
                      <span className="text-base">Save as Draft</span>
                    )}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    onClick={handleSubmit}
                    className="flex items-center justify-center gap-3 w-full max-w-xs py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                  >
                    {saving ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span className="text-lg">Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span className="text-lg">Update Form</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default EditI9Form;
