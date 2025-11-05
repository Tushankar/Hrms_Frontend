import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, FileText, Calendar, RotateCcw } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";
import { getNextFormPath, getPreviousFormPath } from "../../utils/formNavigationSequence";

const EditNonCompleteAgreement = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [formData, setFormData] = useState({
    agreementDate: null,
    agreementMonth: "",
    agreementYear: "",
    suite: "",
    employeeName: "",
    employeeAddress: "",
    cityStateZip: "",
    jobTitle: "",
    companyRepSignature: "",
    companyRepName: "",
    employeeSignature: "",
  });
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    toast.success("Non-Compete Agreement draft saved successfully!", {
      duration: 2000,
      position: "top-right",
    });
    console.log("Draft saved:", formData);
    setTimeout(() => setSaving(false), 1200);
  };

  const handleSubmit = () => {
    setSaving(true);
    // Basic validation
    if (!formData.employeeName) {
      toast.error("Please enter the employee name", {
        duration: 4000,
        position: "top-right",
      });
      setSaving(false);
      return;
    }

    if (!formData.employeeSignature) {
      toast.error("Please provide your electronic signature", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    if (!formData.jobTitle) {
      toast.error("Please enter your job title", {
        duration: 4000,
        position: "top-right",
      });
      setSaving(false);
      return;
    }

    toast.success("Non-Compete Agreement submitted successfully!", {
      duration: 4000,
      position: "top-right",
    });

    console.log("Form submitted:", formData);

    // Navigate to next form after successful submission
    setTimeout(() => {
      setSaving(false);
      const nextPath = getNextFormPath('/employee/non-compete-agreement');
      navigate(nextPath);
    }, 1200);
  };

  const renderSectionHeader = (number, title) => (
    <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 rounded-xl shadow-lg border border-gray-200">
      <h3 className="text-sm sm:text-base md:text-lg font-bold tracking-wide flex items-center">
        <span className="bg-white text-[#1F3A93] rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0">
          {number}
        </span>
        <span className="break-words leading-tight">{title}</span>
      </h3>
    </div>
  );

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
          border: 1px solid #1f3a93;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__header {
          background-color: #1f3a93;
          border-bottom: 1px solid #1f3a93;
        }
        .react-datepicker__current-month {
          color: white;
        }
        .react-datepicker__day-name {
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #1f3a93;
        }
        .react-datepicker__day:hover {
          background-color: #f0f5ff;
        }
      `}</style>

      <Navbar />

      {/* Back Button - Outside of form */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mb-6 pt-8">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Main Form Container - 75% width with rounded borders */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-12">
        <div className="w-full max-w-[75%] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Title */}
          <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white text-center py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-9">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wide leading-tight">
              EDIT COMPETE AGREEMENT
            </h2>
            <p className="text-blue-100 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-medium">
              Pacific Health Systems LLC
            </p>
          </div>

          {/* Document Content */}
          <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm md:text-base leading-relaxed text-gray-700 px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 md:py-12">
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7">
              This Non-Compete (the &quot;Agreement&quot;) is made as of this{" "}
              <div className="inline-block mx-1">
                <DatePicker
                  selected={formData.agreementDate}
                  onChange={(date) => handleInputChange("agreementDate", date)}
                  placeholderText="Select date"
                  className="border-0 border-b-2 border-gray-300 bg-transparent font-inherit text-gray-800 outline-none px-1 w-24 text-center focus:outline-none focus:ring-0 focus:border-b-2 focus:border-b-[#1F3A93] transition-all duration-300"
                  dateFormat="dd"
                />
              </div>{" "}
              day of{" "}
              <input
                type="text"
                value={formData.agreementMonth}
                onChange={(e) =>
                  handleInputChange("agreementMonth", e.target.value)
                }
                className="border-0 border-b-2 border-gray-300 bg-transparent font-inherit text-gray-800 outline-none px-1 mx-1 w-16 sm:w-24 text-center focus:outline-none focus:ring-0 focus:border-b-2 focus:border-b-[#1F3A93] transition-all duration-300"
                placeholder="Month"
              />
              , 20
              <input
                type="text"
                value={formData.agreementYear}
                onChange={(e) =>
                  handleInputChange("agreementYear", e.target.value)
                }
                className="border-0 border-b-2 border-gray-300 bg-transparent font-inherit text-gray-800 outline-none px-1 mx-1 w-12 sm:w-16 text-center focus:outline-none focus:ring-0 focus:border-b-2 focus:border-b-[#1F3A93] transition-all duration-300"
                placeholder="Year"
              />{" "}
              (the &quot;Effective Date&quot;) by and between Pacific Health
              Systems LLC (&quot;Company&quot;), located at 303 Corporate Center
              Dr., Suite 325, Stockbridge, GA 30281, and{" "}
            </p>

            {/* Employee Information Section - Mobile Optimized */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border border-blue-200">
              <h4 className="text-sm sm:text-base md:text-lg font-semibold text-[#1F3A93] mb-3 sm:mb-4 flex items-center">
                <span className="bg-[#1F3A93] text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                  ℹ
                </span>
                Employee Information{" "}
                <span className="text-red-500 ml-1">*</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) =>
                      handleInputChange("employeeName", e.target.value)
                    }
                    className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 rounded-lg border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Job Title/Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                    className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 rounded-lg border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Enter job title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.employeeAddress}
                    onChange={(e) =>
                      handleInputChange("employeeAddress", e.target.value)
                    }
                    className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    City, State, ZIP
                  </label>
                  <input
                    type="text"
                    value={formData.cityStateZip}
                    onChange={(e) =>
                      handleInputChange("cityStateZip", e.target.value)
                    }
                    className="w-full h-10 sm:h-12 px-3 sm:px-4 border-2 rounded-lg border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                    placeholder="City, State ZIP"
                  />
                </div>
              </div>
            </div>

            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7">
              (&quot;Employee&quot;). Employee may have access to or may
              generate or otherwise come into contact with proprietary and/or
              confidential information of the Company or the Company&apos;s
              clients. The Company wishes to enter into a non-compete agreement
              in the event Employee terminates his or her employment. In
              consideration of the promises and mutual covenants herein, the
              parties agree as follows:
            </p>

            {renderSectionHeader(1, "Employee Covenants")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              In consideration of offer of employment or continued employment
              with the Company, Employee covenants that during their employment
              with the Company and for a period of two (2) years or the longest
              period of time allowed by state law, whichever is shorter, after
              said employment is ended for any reason, including but not limited
              to the termination of their employment due to inadequate
              performance or resignation:
            </p>

            <div className="ml-2 sm:ml-4 md:ml-6 space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base leading-6 sm:leading-7">
              {[
                "Employee shall not induce, directly or indirectly, any other employees of the Company to terminate their employment.",
                "Employee shall not solicit the business of any client of the Company.",
                "Employee shall not offer same or similar services to a client that they previously served during employment.",
                "Employee shall not induce, directly or indirectly, any client of the Company to transfer services to another agency.",
              ].map((text, index) => (
                <div
                  key={index}
                  className="pl-3 sm:pl-4 border-l-2 border-gray-200 flex items-start bg-gray-50 rounded-r-lg p-2 sm:p-3 hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="mr-2 sm:mr-3 font-mono text-[#1F3A93] font-bold text-sm sm:text-base flex-shrink-0">
                    {String.fromCharCode(97 + index)}.
                  </span>
                  <p className="break-words leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {renderSectionHeader(2, "Confidentiality Agreement")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              Employee shall not, without written consent, share or use any
              information relating to the Company that has not been previously
              publicly released including but not limited to patient charts,
              trade secrets, proprietary and confidential information, research,
              designs, financial, customer and employee records, and marketing
              plans.
            </p>

            {renderSectionHeader(3, "Injunctive Relief")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              Employee acknowledges that disclosure of any confidential
              information or breach of any of the noncompetitive covenants will
              cause irreparable harm to the Company. Injunctive relief is agreed
              to be an appropriate remedy.
            </p>

            {renderSectionHeader(4, "Binding Effect")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              This Agreement is binding upon the parties and their legal
              representatives, successors, and permitted assigns.
            </p>

            {renderSectionHeader(5, "Severability")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              If any provision is deemed invalid, the remainder shall still be
              enforceable.
            </p>

            {renderSectionHeader(6, "Governing Law")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              This Agreement shall be governed by the laws of the State of
              Georgia.
            </p>

            {renderSectionHeader(7, "Dispute Resolution")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              Disputes shall be brought only in Georgia courts. All parties
              waive the right to trial by jury to the maximum extent permitted
              by law.
            </p>

            {renderSectionHeader(8, "Headings")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              Section headings are for convenience only and do not affect
              interpretation.
            </p>

            {renderSectionHeader(9, "Entire Agreement")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              This document contains the full agreement and supersedes prior
              oral or written agreements.
            </p>

            {renderSectionHeader(10, "Amendment")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              This Agreement can only be amended in writing signed by both
              parties.
            </p>

            {renderSectionHeader(11, "Notices")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              All notices must be in writing and delivered to the parties&apos;
              last known addresses.
            </p>

            {renderSectionHeader(12, "Waiver")}
            <p className="text-justify mb-4 sm:mb-6 leading-6 sm:leading-7 pl-1 sm:pl-2 md:pl-4">
              Waiver of any provision must be in writing and does not waive any
              other rights.
            </p>

            <div className="text-center text-sm sm:text-base md:text-lg mt-8 sm:mt-12 mb-6 sm:mb-10 font-medium text-[#414244] bg-gradient-to-r from-gray-50 to-blue-50 py-3 sm:py-4 px-4 sm:px-6 rounded-lg border border-gray-200">
              IN WITNESS WHEREOF, this Agreement has been executed as of the
              date first above written.
            </div>

            {/* Electronic Signature Section */}
            <div className="mt-8 sm:mt-12 bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-lg">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1F3A93] mb-4 sm:mb-6 text-center">
                Electronic Signatures
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-4 sm:mb-6">
                <div>
                  <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                    Company Representative Signature
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.companyRepSignature}
                      onChange={(e) =>
                        handleInputChange("companyRepSignature", e.target.value)
                      }
                      className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Company representative signature"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3">
                    Company Rep. Name and Title
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.companyRepName}
                      onChange={(e) =>
                        handleInputChange("companyRepName", e.target.value)
                      }
                      className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-gray-300 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Name and title"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div>
                  <label className="block text-xs sm:text-sm md:text-base font-semibold text-[#1F3A93] mb-2 sm:mb-3">
                    Employee Signature <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.employeeSignature}
                      onChange={(e) =>
                        handleInputChange("employeeSignature", e.target.value)
                      }
                      className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Type your full name to sign electronically"
                    />
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      By typing your name above, you are signing this document
                      electronically
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm md:text-base font-semibold text-[#1F3A93] mb-2 sm:mb-3">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.employeeName}
                      onChange={(e) =>
                        handleInputChange("employeeName", e.target.value)
                      }
                      className="w-full h-10 sm:h-12 md:h-14 px-3 sm:px-4 border-2 rounded-xl border-[#1F3A93]/30 focus:border-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 focus:outline-none bg-white text-gray-900 text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="bg-[#F8FAFF] px-3 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 rounded-b-2xl border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
              {/* Left: Previous (styled like CTA) */}
              <div className="w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(getPreviousFormPath('/employee/non-compete-agreement'))}
                  //                   onClick={() =>
                  //   // navigate("/employee/service-delivery-policies")
                  // }

                  className="inline-flex items-center justify-center gap-2 w-full max-w-xs py-3 px-6 sm:px-8 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#2748B4] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">Previous Form</span>
                </button>
              </div>

              {/* Center: Exit Application */}
              <div className="w-full sm:w-auto flex justify-center md:flex-1">
                <button
                  type="button"
                  onClick={() => navigate("/employee/task-management")}
                  className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-xl hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  Exit Application
                </button>
              </div>

              {/* Right: Save & Next */}
              <div className="w-full md:w-auto flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-3 w-full max-w-xs py-3 px-5 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-bold tracking-wide rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/30 active:from-[#112451] active:to-[#16306e] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <RotateCcw className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  <span className="text-sm sm:text-base">
                    {saving ? "Submitting..." : "Save & Next"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Toast Configuration */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "white",
                color: "#1F3A93",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "white",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "white",
                },
              },
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default EditNonCompleteAgreement;
