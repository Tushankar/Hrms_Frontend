import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, FileText, Calendar } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";

const EditServiceDeliveryPolicies = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  
  const [formData, setFormData] = useState({
    policy1: false,
    policy2: false,
    policy3: false,
    policy4: false,
    policy5: false,
    employeeSignature: "",
    employeeDate: null,
    agencySignature: "",
    agencyDate: null,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    navigate("/employee/task-management");
  };

  const handleSaveDraft = () => {
    toast.success("Service Delivery Policies draft saved successfully!", {
      duration: 3000,
      position: "top-right",
    });
    console.log("Draft saved:", formData);
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.employeeSignature) {
      toast.error("Please provide your electronic signature", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    if (!formData.employeeDate) {
      toast.error("Please select a date", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    const allPoliciesChecked = Object.keys(formData)
      .filter(key => key.startsWith('policy'))
      .every(key => formData[key]);

    if (!allPoliciesChecked) {
      toast.error("Please acknowledge all policy statements", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    toast.success("Service Delivery Policies submitted successfully!", {
      duration: 4000,
      position: "top-right",
    });
    
    console.log("Form submitted:", formData);
    
    // Navigate back after successful submission
    setTimeout(() => {
      navigate("/employee/task-management");
    }, 2000);
  };

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
      
      {/* Back Button - Outside of form with proper spacing */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8 mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Form Container - 85% width with rounded borders */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="w-full max-w-[140%] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8 md:p-12 font-sans relative">

            {/* Header with Logo */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                {/* Logo Circle */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mr-3 sm:mr-4 relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700"></div>
                  <div className="relative z-10">
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

            {/* Title */}
            <div className="text-center mb-8 mt-10">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F3A93] tracking-wide">
                EDIT SERVICE DELIVERY POLICIES
              </h2>
            </div>

            {/* Introduction */}
            <div className="mb-8 text-sm sm:text-base leading-relaxed text-gray-700">
              <p>
                At the Pacific Health Systems orientation forum, employees were
                informed about the significance of rendering quality service to
                our clients. Please initial the following statements and sign
                below:
              </p>
            </div>

            {/* Policy Statements */}
            <div className="space-y-8">
              {/* Policy 1 */}
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={formData.policy1}
                  onChange={(e) =>
                    handleInputChange("policy1", e.target.checked)
                  }
                  className="w-6 h-6 mt-1 flex-shrink-0 border-2 rounded-md border-[#1F3A93]/30 text-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:ring-offset-2 cursor-pointer hover:border-[#1F3A93]/50 checked:bg-[#1F3A93] checked:border-[#1F3A93] transition-all duration-200"
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base bg-[#E8EDFF] p-3 rounded-lg leading-relaxed text-gray-700">
                    I understand the{" "}
                    <strong className="text-[#1F3A93]">
                      Agency policy of No &quot;PVT Login, No pay&quot;
                    </strong>
                    . I understand that I have to complete my timesheet
                    correctly and log in to the PVT system, complete my shift
                    and log out at the Payroll week and send in the copies of
                    the Progress Notes by email to{" "}
                    <span className="bg-[#FFF9E6] px-1 rounded font-semibold">
                      info@pacifichealthsystems.com
                    </span>{" "}
                    not later than Friday of the week of service.
                  </p>
                </div>
              </div>

              {/* Policy 2 */}
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={formData.policy2}
                  onChange={(e) =>
                    handleInputChange("policy2", e.target.checked)
                  }
                  className="w-6 h-6 mt-1 flex-shrink-0 border-2 rounded-md border-[#1F3A93]/30 text-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:ring-offset-2 cursor-pointer hover:border-[#1F3A93]/50 checked:bg-[#1F3A93] checked:border-[#1F3A93] transition-all duration-200"
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base bg-[#FFF9E6] p-3 rounded-lg leading-relaxed text-[#1F3A93] font-semibold">
                    I understand that NO CALL, NO SHOW results in immediate
                    termination
                  </p>
                </div>
              </div>

              {/* Policy 3 */}
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={formData.policy3}
                  onChange={(e) =>
                    handleInputChange("policy3", e.target.checked)
                  }
                  className="w-6 h-6 mt-1 flex-shrink-0 border-2 rounded-md border-[#1F3A93]/30 text-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:ring-offset-2 cursor-pointer hover:border-[#1F3A93]/50 checked:bg-[#1F3A93] checked:border-[#1F3A93] transition-all duration-200"
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base bg-[#F0F7FF] p-3 rounded-lg leading-relaxed text-gray-700">
                    Should there be a need to attend to non-business or family
                    matters during my scheduled hours, I understand that I have
                    to let the Administrator or my supervisor know of my plans
                    to be off-duty as early as possible.
                  </p>
                </div>
              </div>

              {/* Policy 4 */}
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={formData.policy4}
                  onChange={(e) =>
                    handleInputChange("policy4", e.target.checked)
                  }
                  className="w-6 h-6 mt-1 flex-shrink-0 border-2 rounded-md border-[#1F3A93]/30 text-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:ring-offset-2 cursor-pointer hover:border-[#1F3A93]/50 checked:bg-[#1F3A93] checked:border-[#1F3A93] transition-all duration-200"
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                    I understand that it is against agency policy to borrow
                    money from my client or tell my client about my personal
                    challenges.
                  </p>
                </div>
              </div>

              {/* Policy 5 */}
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={formData.policy5}
                  onChange={(e) =>
                    handleInputChange("policy5", e.target.checked)
                  }
                  className="w-6 h-6 mt-1 flex-shrink-0 border-2 rounded-md border-[#1F3A93]/30 text-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:ring-offset-2 cursor-pointer hover:border-[#1F3A93]/50 checked:bg-[#1F3A93] checked:border-[#1F3A93] transition-all duration-200"
                />
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-relaxed text-gray-700">
                    I understand that services are performed at client&apos;s
                    home and I must seek agency approval before driving the
                    client on Doctor&apos;s appointments, grocery shopping,
                    purchase medication etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Electronic Signature Section */}
            <div className="pt-8 mt-16">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Electronic Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div>
                  <label className="block text-base font-medium text-[#1F3A93] mb-2">
                    Employee Signature <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type your full name to sign"
                      value={formData.employeeSignature}
                      onChange={(e) =>
                        handleInputChange("employeeSignature", e.target.value)
                      }
                      className="w-full h-12 px-4 border-2 rounded-lg border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 font-signature text-base transition-all duration-200"
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      By typing your name, you are signing electronically
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-base font-medium text-[#1F3A93] mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.employeeDate}
                      onChange={(date) => handleInputChange("employeeDate", date)}
                      placeholderText="Select date"
                      className="w-full h-12 px-4 border-2 rounded-lg border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-base transition-all duration-200"
                      dateFormat="MM/dd/yyyy"
                    />
                    <Calendar className="absolute right-3 top-4 h-4 w-4 text-gray-500 pointer-events-none" />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      Current date
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-8">
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-2">
                    Agency&apos;s Signature
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Agency representative signature"
                      value={formData.agencySignature}
                      onChange={(e) =>
                        handleInputChange("agencySignature", e.target.value)
                      }
                      className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 font-signature text-base transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-2">
                    Agency Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.agencyDate}
                      onChange={(date) => handleInputChange("agencyDate", date)}
                      placeholderText="Select date"
                      className="w-full h-12 px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-base transition-all duration-200"
                      dateFormat="MM/dd/yyyy"
                    />
                    <Calendar className="absolute right-3 top-4 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button Section */}
            <div className="bg-[#F8FAFF] px-4 sm:px-8 md:px-12 py-8 mt-10 rounded-lg border border-[#E8EDFF]">
              <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  Complete Your Service Delivery Policies
                </h4>
                <p className="text-sm text-gray-600">
                  Review all policy statements above and provide your electronic signature
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

export default EditServiceDeliveryPolicies;
