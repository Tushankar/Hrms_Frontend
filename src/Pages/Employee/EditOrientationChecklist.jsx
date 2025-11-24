import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Calendar } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";

const EditOrientationChecklist = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [formData, setFormData] = useState({
    policies: false,
    duties: false,
    emergencies: false,
    tbExposure: false,
    clientRights: false,
    complaints: false,
    documentation: false,
    handbook: false,
    employeeSignature: "",
    employeeDate: new Date(),
    agencySignature: "",
    agencyDate: new Date(),
  });

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredChecks = ['policies', 'duties', 'emergencies', 'tbExposure', 'clientRights', 'complaints', 'documentation', 'handbook'];
    const missingChecks = requiredChecks.filter(check => !formData[check]);
    
    if (missingChecks.length > 0) {
      toast.error("Please check all required orientation statements before submitting!", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    if (!formData.employeeSignature.trim()) {
      toast.error("Employee signature is required!", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    console.log("Orientation Checklist submitted:", formData);
    toast.success("Orientation Checklist submitted successfully!", {
      duration: 3000,
      position: "top-right",
    });
    
    // Navigate back to task management after brief delay
    setTimeout(() => {
      navigate("/employee/task-management");
    }, 2000);
  };

  const statements = [
    {
      key: "policies",
      text: "I have read and understand the policies and procedures regarding scope of services and the types of clients served",
      highlight: "bg-gradient-to-r from-blue-50 to-indigo-50",
    },
    {
      key: "duties",
      text: "I have read and understand my assigned duties and responsibilities",
      highlight: "bg-gradient-to-r from-amber-50 to-yellow-50",
    },
    {
      key: "emergencies",
      text: "I understand to report client emergencies, problems and/or progress to supervisory nurse",
      highlight: "bg-gradient-to-r from-sky-50 to-blue-50",
    },
    {
      key: "tbExposure",
      text: "I understand that I must report suspected exposure to TB to the agency",
      highlight: "bg-gradient-to-r from-emerald-50 to-green-50",
    },
    {
      key: "clientRights",
      text: "I have read and understand the client rights",
      highlight: "bg-gradient-to-r from-orange-50 to-amber-50",
    },
    {
      key: "complaints",
      text: "I have read procedures regarding handling of complaints, medical emergencies and other incidents",
      highlight: "bg-gradient-to-r from-purple-50 to-violet-50",
    },
    {
      key: "documentation",
      text: "I have read and understand the required daily documentation of activities as client is being served",
      highlight: "bg-gradient-to-r from-teal-50 to-emerald-50",
    },
    {
      key: "handbook",
      text: "I have received a copy of the Pacific Health Systems Employee Handbook",
      highlight: "bg-gradient-to-r from-indigo-50 to-blue-50",
    },
  ];

  return (
    <Layout>
      <Navbar />
      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container input {
          width: 100%;
          height: 2.75rem;
          padding: 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 0.75rem;
          background-color: white;
          color: #111827;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .react-datepicker__input-container input:focus {
          outline: none;
          border-color: #1F3A93;
          box-shadow: 0 0 0 3px rgba(31, 58, 147, 0.1);
        }
        @media (min-width: 640px) {
          .react-datepicker__input-container input {
            height: 3rem;
            font-size: 1rem;
          }
        }
      `}</style>

      {/* Back Button - Outside main container for consistent positioning */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 pt-8">
        <button
          onClick={() => navigate("/employee/task-management")}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base font-semibold transform hover:-translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span>Back to Tasks</span>
        </button>
      </div>

      {/* Main Form Container - 75% width with rounded borders */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="w-full max-w-[75%] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white text-center py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-9">
            <div className="flex flex-col lg:flex-row items-center justify-center mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-center">
                {/* Logo Circle */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mb-3 sm:mb-0 sm:mr-3 md:mr-4 relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700"></div>
                  <div className="relative z-10">
                    {/* Stylized waves/mountains */}
                    <svg
                      width="24"
                      height="14"
                      viewBox="0 0 40 24"
                      className="text-white sm:w-8 sm:h-5 md:w-10 md:h-6"
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
                    <div className="absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-2 sm:border-l-3 border-r-2 sm:border-r-3 border-b-3 sm:border-b-4 border-transparent border-b-white opacity-90"></div>
                      <div className="w-0 h-0 border-l-1 sm:border-l-2 border-r-1 sm:border-r-2 border-b-2 sm:border-b-3 border-transparent border-b-white opacity-70 ml-0.5 sm:ml-1 -mt-0.5 sm:-mt-1"></div>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-white mr-0 sm:mr-2">
                      PACIFIC
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-red-200">
                      HEALTH
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-white ml-0 sm:ml-2">
                      SYSTEMS
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100 font-medium tracking-wider mt-1">
                    PRIVATE HOMECARE SERVICES
                  </div>
                </div>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wide leading-tight">
              EDIT ORIENTATION CHECKLIST
            </h2>
          </div>

          {/* Document Content */}
          <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-12">
            
            {/* Introduction */}
            <div className="mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed text-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-gray-200">
              <p className="font-medium text-[#1F3A93]">
                After attending the Pacific Health Systems Services orientation,
                please initial the following statements and sign below:
              </p>
            </div>

            {/* Policy Statements */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 sm:space-y-6">
                {statements.map((statement, index) => (
                  <div key={statement.key} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id={statement.key}
                        checked={formData[statement.key]}
                        onChange={() => handleCheckboxChange(statement.key)}
                        className="w-5 h-5 sm:w-6 sm:h-6 border-2 rounded-md border-[#1F3A93]/30 text-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:ring-offset-2 cursor-pointer hover:border-[#1F3A93]/50 checked:bg-[#1F3A93] checked:border-[#1F3A93] transition-all duration-300 flex-shrink-0"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <span className="bg-[#1F3A93] text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <label
                          htmlFor={statement.key}
                          className={`block text-sm sm:text-base p-3 sm:p-4 md:p-5 rounded-xl leading-relaxed text-gray-700 cursor-pointer ${statement.highlight} border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300`}
                        >
                          {statement.text}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signature Section */}
              <div className="mt-12 sm:mt-16 bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-lg">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1F3A93] mb-4 sm:mb-6 text-center">
                  Electronic Signatures
                </h3>
                <div className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-[#1F3A93] mb-2 sm:mb-3">
                        Employee Signature *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type your full name to sign"
                          value={formData.employeeSignature}
                          onChange={(e) =>
                            handleInputChange("employeeSignature", e.target.value)
                          }
                          className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md font-signature"
                          required
                        />
                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                          By typing your name above, you are signing this document electronically
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                        Employee Date *
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formData.employeeDate}
                          onChange={(date) => handleInputChange("employeeDate", date)}
                          className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select date"
                          showPopperArrow={false}
                          popperClassName="react-datepicker-popper"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                        Agency Representative Signature
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Agency representative signature"
                          value={formData.agencySignature}
                          onChange={(e) =>
                            handleInputChange("agencySignature", e.target.value)
                          }
                          className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md font-signature"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                        Agency Date
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formData.agencyDate}
                          onChange={(date) => handleInputChange("agencyDate", date)}
                          className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select date"
                          showPopperArrow={false}
                          popperClassName="react-datepicker-popper"
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white px-3 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 rounded-b-2xl border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-6 sm:mb-8">
                    <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">
                      Complete Your Orientation Checklist
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm md:text-base">
                      Review all information above before submitting
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto py-3 sm:py-4 px-4 sm:px-6 bg-white border-2 border-[#1F3A93] text-[#1F3A93] font-semibold rounded-xl hover:bg-[#F0F5FF] focus:ring-2 focus:ring-[#1F3A93]/20 active:bg-[#E8EDFF] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base md:text-lg"
                      onClick={() => {
                        toast.success("Orientation Checklist draft saved successfully!", {
                          duration: 3000,
                          position: "top-right",
                        });
                        console.log("Draft saved:", formData);
                      }}
                    >
                      <span>Save as Draft</span>
                    </button>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      <span>Submit Checklist</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
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
    </Layout>
  );
};

export default EditOrientationChecklist;
