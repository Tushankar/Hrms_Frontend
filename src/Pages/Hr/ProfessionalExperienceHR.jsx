import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft, Briefcase, CheckCircle, FileText } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

// FormInput component
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
      disabled={true}
    />
  </div>
);

// FormTextarea component
const FormTextarea = ({
  label,
  value,
  onChange,
  className = "",
  placeholder = "",
  required = false,
  rows = 4,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
      required={required}
      disabled={true}
    />
  </div>
);

const ProfessionalExperienceHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [professionalForm, setProfessionalForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      const baseURL = import.meta.env.VITE__BASEURL;
      const response = await fetch(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        console.log(
          "Professional Experience Response:",
          result.data?.forms?.professionalExperience
        );

        // Extract the professional experience form data
        const professionalExperienceForm =
          result.data?.forms?.professionalExperience;
        if (professionalExperienceForm) {
          // The entire form object contains all the data we need
          setData({ ...professionalExperienceForm });
          setProfessionalForm({ ...professionalExperienceForm });
        } else {
          console.warn("No professional experience form found");
          setData(null);
          setProfessionalForm(null);
        }
      } else {
        console.error("Failed to fetch data:", response.status);
        setData(null);
        setProfessionalForm(null);
      }
    } catch (error) {
      console.error("Error fetching professional experience:", error);
      setData(null);
      setProfessionalForm(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </Layout>
    );

  const formStatus = professionalForm?.status || "draft";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-[#1F3A93] text-white p-4 md:p-6">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                <Briefcase className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3" />
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    Military Service
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base"></p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
              Military Service
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Do you have military service experience?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="YES"
                    checked={
                      data?.hasMilitaryService === "YES" ||
                      data?.hasMilitaryService === true
                    }
                    onChange={() => {}}
                    className="mr-2 text-blue-600 focus:ring-blue-600"
                    disabled={true}
                  />
                  YES
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="NO"
                    checked={
                      data?.hasMilitaryService === "NO" ||
                      data?.hasMilitaryService === false
                    }
                    onChange={() => {}}
                    className="mr-2 text-blue-600 focus:ring-blue-600"
                    disabled={true}
                  />
                  NO
                </label>
              </div>
            </div>

            {(data?.hasMilitaryService === "YES" ||
              data?.hasMilitaryService === true) && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Branch"
                    value={data?.militaryService?.branch || ""}
                    onChange={() => {}}
                    placeholder="e.g., Army, Navy, Air Force, Marines, Coast Guard"
                  />
                  <FormInput
                    label="From"
                    value={data?.militaryService?.from || ""}
                    onChange={() => {}}
                    type="date"
                  />
                  <FormInput
                    label="To"
                    value={data?.militaryService?.to || ""}
                    onChange={() => {}}
                    type="date"
                  />
                  <FormInput
                    label="Rank at Discharge"
                    value={data?.militaryService?.rankAtDischarge || ""}
                    onChange={() => {}}
                  />
                  <FormInput
                    label="Type of Discharge"
                    value={data?.militaryService?.typeOfDischarge || ""}
                    onChange={() => {}}
                  />
                  <FormTextarea
                    label="If other than honorable, explain"
                    value={data?.militaryService?.otherThanHonorable || ""}
                    onChange={() => {}}
                    rows={3}
                  />
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        May we contact your previous supervisor for a reference?
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="YES"
                            checked={
                              data?.militaryService?.mayContactSupervisor ===
                              "YES"
                            }
                            onChange={() => {}}
                            className="mr-2 text-blue-600 focus:ring-blue-600"
                            disabled={true}
                          />
                          YES
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="NO"
                            checked={
                              data?.militaryService?.mayContactSupervisor ===
                              "NO"
                            }
                            onChange={() => {}}
                            className="mr-2 text-blue-600 focus:ring-blue-600"
                            disabled={true}
                          />
                          NO
                        </label>
                      </div>
                    </div>
                  </div>
                  <FormTextarea
                    label="Reason for Leaving"
                    value={data?.militaryService?.reasonForLeaving || ""}
                    onChange={() => {}}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Documents Section */}
            {(data?.resumePath ||
              data?.coverLetterPath ||
              data?.portfolioPath) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Documents Submitted
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.resumePath && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume
                      </label>
                      <input
                        type="text"
                        value={data.resumePath}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>
                  )}
                  {data.coverLetterPath && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Letter
                      </label>
                      <input
                        type="text"
                        value={data.coverLetterPath}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>
                  )}
                  {data.portfolioPath && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Portfolio
                      </label>
                      <input
                        type="text"
                        value={data.portfolioPath}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded ${
                    formStatus === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {formStatus || "draft"}
                </span>
              </p>
            </div>

            <HRNotesInput
              formType="professional-experience"
              employeeId={employeeId}
              existingNote={professionalForm?.hrFeedback?.comment}
              existingReviewedAt={professionalForm?.hrFeedback?.reviewedAt}
              onNoteSaved={fetchData}
              formData={data}
              showSignature={false}
            />

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => navigate(`/hr/work-experience/${employeeId}`)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous: Previous Employment
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Exit to Dashboard
              </button>
              <button
                onClick={() => navigate(`/hr/legal-disclosures/${employeeId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                Next: Disclaimer and Signature
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalExperienceHR;
