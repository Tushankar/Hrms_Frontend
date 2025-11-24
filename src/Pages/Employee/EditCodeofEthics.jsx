import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, FileText, Calendar, Save, RotateCcw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from 'axios';
import Cookies from 'js-cookie';

const EditCodeofEthics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [formData, setFormData] = useState({
    signature: "",
    date: null,
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get('user');
      const sessionToken = Cookies.get('session');
      const accessToken = Cookies.get('accessToken');
      
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

      console.log('Initializing Edit Code of Ethics form for user:', user._id); // Debug log

      // Get or create onboarding application
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${baseURL}/onboarding/get-application/${user._id}`, {
        headers,
        withCredentials: true
      });

      if (response.data && response.data.data && response.data.data.application) {
        setApplicationId(response.data.data.application._id);
        
        // Load existing form data if it exists
        if (response.data.data.forms.codeOfEthics) {
          setFormData(response.data.data.forms.codeOfEthics);
        }
      }
    } catch (error) {
      console.error('Error initializing edit form:', error);
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
      
      const user = userCookie ? JSON.parse(userCookie) : { _id: "67e0f8770c6feb6ba99d11d2" };
      const token = sessionToken || accessToken;

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${baseURL}/onboarding/save-code-of-ethics`,
        {
          applicationId,
          employeeId: user._id,
          formData,
          status
        },
        {
          headers,
          withCredentials: true
        }
      );

      if (response.data) {
        const message = status === 'draft' 
          ? 'Code of Ethics saved as draft' 
          : 'Code of Ethics completed successfully!';
        
        toast.success(message);
        
        if (status === 'completed') {
          setTimeout(() => navigate('/employee/onboarding'), 2000);
        }
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error(error.response?.data?.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.signature || !formData.date) {
      toast.error("Please fill in both signature and date fields");
      return;
    }
    saveForm('completed');
  };

  const handleSaveDraft = () => {
    saveForm('draft');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const ethicsRules = [
    "PHS employees will not use the client's car for personal reasons.",
    "Employees will not consume the client's food or beverages, nor will they eat inside the client's home without permission.",
    "Employees will not use the client's telephone for personal calls.",
    "Employees will not discuss political, religious beliefs, or personal problems with the client.",
    "Employees will not accept gifts or financial gratuities (tips) from the client or client's representative.",
    "Employees will not loan money or other items to the client and/or client representative.",
    "Employees will not sell gifts, food, or other items to or for the client.",
    "Employees will not purchase any items for the client unless directed in the client care plan.",
    "Employees will not bring other visitors to client's home (children, friends, relatives, etc...).",
    "Employees will not smoke in or around the client's home with or without permission.",
    "Employees will not report to duty under the influence of alcohol or drugs.",
    "Employees will not sleep in the client's house unless directed in service care plan.",
    "Employees will not remain in the client's home after services have been rendered and completed.",
    "Employees will not falsify client's records/timesheets.",
    "Employees must report any unusual changes or events with client during work hours.",
    "Employees must not breach clients' and or primary care giver's privacy and confidentiality of information and records against HIPPA regulations.",
    "Employees must not assume control of the financial or personal affairs, or both, of the client or his/her estate, including power of attorney or guardianship.",
    "Employees must not be committing any act of abuse, neglect or exploitation.",
    "Employees will wear, have badge visible and adhere to the dress code of corporate scrubs for PHS.",
    "Employees will attend all mandatory quarterly meetings.",
    "Employees will notify the office if they are unable to report to work for their assigned schedule, at least 2 hours before the start of the shift, if it's an emergency (A written doctor's excuse will be needed to make this an excused absence). Employees will provide at least a 2weeks notice to request and schedule time off.",
  ];

  return (
    <Layout>
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
        }
        .react-datepicker {
          border: 1px solid #1F3A93;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__header {
          background-color: #1F3A93;
          border-bottom: 1px solid #1F3A93;
        }
        .react-datepicker__current-month {
          color: white;
        }
        .react-datepicker__day-name {
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #1F3A93;
        }
        .react-datepicker__day:hover {
          background-color: #F0F5FF;
        }
      `}</style>
      
      <Navbar />
      
      {/* Back Button - Outside of form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Form Container - 75% width with rounded borders */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-[75%] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-12 font-sans relative">

        {/* Header with Logo */}
        <div className="flex items-center justify-center mb-8 mt-8 sm:mt-12">
          <div className="flex items-center">
            {/* Logo Circle */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mr-3 sm:mr-4 relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700"></div>
              <div className="relative z-10">
                {/* Stylized waves/mountains */}
                <svg
                  width="40"
                  height="24"
                  viewBox="0 0 40 24"
                  className="text-white w-8 sm:w-10"
                >
                  <path
                    d="M2 20 L8 14 L14 18 L20 12 L26 16 L32 10 L38 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 22 L8 16 L14 20 L20 14 L26 18 L32 12 L38 16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                  />
                </svg>
                {/* Triangular elements */}
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-0 h-0 border-l-3 border-r-3 border-b-4 border-transparent border-b-white opacity-90"></div>
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-white opacity-70 ml-1 -mt-1"></div>
                </div>
              </div>
            </div>

            {/* Company Name */}
            <div className="text-left">
              <div className="flex items-center flex-wrap">
                <span className="text-xl sm:text-2xl font-bold text-blue-900 mr-1.5 sm:mr-2">
                  PACIFIC
                </span>
                <span className="text-xl sm:text-2xl font-bold text-red-600">
                  HEALTH
                </span>
                <span className="text-xl sm:text-2xl font-bold text-blue-900 ml-1.5 sm:ml-2">
                  SYSTEMS
                </span>
              </div>
              <div className="text-xs sm:text-sm text-blue-800 font-medium tracking-wider mt-1">
                PRIVATE HOMECARE SERVICES
              </div>
            </div>
          </div>
        </div>

        {/* Code of Ethics Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-wide">
            EDIT CODE OF ETHICS
          </h1>
        </div>

        {/* Ethics Rules List */}
        <div className="mb-12">
          <ol className="space-y-4">
            {ethicsRules.map((rule, index) => (
              <li
                key={index}
                className="flex text-sm sm:text-base text-gray-800 leading-relaxed"
              >
                <span className="font-medium text-gray-700 mr-3 sm:mr-4 min-w-[20px] sm:min-w-[24px]">
                  {index + 1}.
                </span>
                <span className="flex-1">{rule}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Agreement Text */}
        <div className="mb-8 text-sm sm:text-base text-gray-800 leading-relaxed">
          <p className="mb-4">
            By signing my name below, I agree and promise that while in the
            employment of Pacific Health Systems, I will abide by the Code of
            Ethics established for Pacific Health Systems. I understand that
            failure to abide by the code of ethics will result in disciplinary
            action and may result in termination of my employment with PHS.
          </p>
        </div>

        {/* Signature Section */}
        <div className="pt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Electronic Signature</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-base font-medium text-[#1F3A93] mb-2">
                Employee Signature <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your full name to sign"
                  value={formData.signature}
                  onChange={(e) =>
                    handleInputChange("signature", e.target.value)
                  }
                  className="w-full h-12 px-4 border-2 rounded-lg border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 font-signature text-base transition-all duration-200"
                />
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  By typing your name above, you are signing this document
                  electronically
                </p>
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-[#1F3A93] mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => handleInputChange("date", date)}
                  placeholderText="Select date"
                  className="w-full h-12 px-4 border-2 rounded-lg border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-base transition-all duration-200"
                  dateFormat="MM/dd/yyyy"
                />
                <Calendar className="absolute right-3 top-4 h-4 w-4 text-gray-500 pointer-events-none" />
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Select today's date
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button Section */}
        <div className="bg-[#F8FAFF] px-4 sm:px-8 md:px-12 py-8 mt-10 rounded-lg border border-[#E8EDFF]">
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              Complete Your Code of Ethics Agreement
            </h4>
            <p className="text-sm text-gray-600">
              Review all ethics rules above and provide your electronic signature
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full sm:max-w-xs py-3 bg-white border-2 border-[#1F3A93] text-[#1F3A93] font-semibold rounded-lg hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20 active:bg-[#E8EDFF] transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={handleSaveDraft}
            >
              <FileText className="w-4 h-4" />
              <span className="text-base">Save as Draft</span>
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex items-center justify-center gap-3 w-full sm:max-w-xs py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5" />
              <span className="text-lg">Submit Form</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            © 2024 PHS Healthcare Services. All rights reserved.
          </p>
        </div>

        {/* Toast Configuration */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'white',
              color: '#1F3A93',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditCodeofEthics;
