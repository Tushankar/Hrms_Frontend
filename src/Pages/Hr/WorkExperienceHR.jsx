import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft, Briefcase, CheckCircle, FileText } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

// Format phone number as +1 (XXX) XXX-XXXX
const formatPhone = (value) => {
  // Remove +1 prefix if it exists, then remove all non-digit characters
  const withoutPrefix = value.replace(/^\+1\s*/, "");
  const cleaned = withoutPrefix.replace(/\D/g, "");

  // Limit to 10 digits
  const limited = cleaned.slice(0, 10);

  // Format as +1 (XXX) XXX-XXXX
  if (limited.length === 0) {
    return "";
  } else if (limited.length <= 3) {
    return `+1 (${limited}`;
  } else if (limited.length <= 6) {
    return `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(
      6
    )}`;
  }
};

// Helper to format ISO date to yyyy-MM-dd
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString();
};

const WorkExperienceHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [workExperience, setWorkExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkExperience();
  }, [employeeId]);

  const fetchWorkExperience = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE__BASEURL
        }/onboarding/get-application/${employeeId}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkExperience({ ...data.data?.forms?.workExperience });
      } else {
        setWorkExperience(null);
      }
    } catch (error) {
      console.error("Error fetching work experience:", error);
      setWorkExperience(null);
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

  const formStatus = workExperience?.status || "draft";

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
                    Previous Employment
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base"></p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
              Work Experience
            </h2>

            {/* Initial Question */}
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-base md:text-lg font-semibold text-gray-800 mb-4">
                Do you have any previous work experience?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasWorkedBefore"
                    value="yes"
                    checked={workExperience?.hasPreviousWorkExperience === true}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={true}
                  />
                  <span className="ml-3 text-base font-medium text-gray-700">
                    Yes
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasWorkedBefore"
                    value="no"
                    checked={
                      workExperience?.hasPreviousWorkExperience === false
                    }
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={true}
                  />
                  <span className="ml-3 text-base font-medium text-gray-700">
                    No
                  </span>
                </label>
              </div>
            </div>

            {/* Show message when they select No */}
            {workExperience?.hasPreviousWorkExperience === false && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-base text-gray-700">
                  ✓ No previous work experience recorded. You can proceed to the
                  next section.
                </p>
              </div>
            )}

            {/* Show work experience form only if they answered Yes */}
            {workExperience?.hasPreviousWorkExperience && (
              <>
                {workExperience.workExperiences?.map((experience, index) => (
                  <div
                    key={index}
                    className="mb-8 p-6 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Previous Employment {index + 1}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={experience.company || ""}
                          onChange={() => {}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formatPhone(experience.phone || "")}
                          onChange={() => {}}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          value={experience.address || ""}
                          onChange={() => {}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supervisor
                        </label>
                        <input
                          type="text"
                          value={experience.supervisor || ""}
                          onChange={() => {}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={experience.jobTitle || ""}
                          onChange={() => {}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Starting Salary
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={experience.startingSalaryType || "hourly"}
                            onChange={() => {}}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={true}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="weekly">Weekly</option>
                            <option value="bi-weekly">Bi-Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          <input
                            type="text"
                            value={experience.startingSalaryAmount || ""}
                            onChange={() => {}}
                            placeholder="50000"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={true}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ending Salary
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={experience.endingSalaryType || "hourly"}
                            onChange={() => {}}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={true}
                          >
                            <option value="hourly">Hourly</option>
                            <option value="weekly">Weekly</option>
                            <option value="bi-weekly">Bi-Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                          <input
                            type="text"
                            value={experience.endingSalaryAmount || ""}
                            onChange={() => {}}
                            placeholder="60000"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={true}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Responsibilities{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={experience.responsibilities || ""}
                          onChange={() => {}}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={experience.from || ""}
                          onChange={() => {}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          To <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={experience.to || ""}
                          onChange={() => {}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Leaving
                        </label>
                        <input
                          type="text"
                          value={experience.reasonForLeaving || ""}
                          onChange={() => {}}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          May we contact your previous supervisor for a
                          reference?
                        </label>
                        <div className="flex gap-6">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`contactSupervisor_${index}`}
                              value="yes"
                              checked={experience.contactSupervisor === true}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              disabled={true}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              YES
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`contactSupervisor_${index}`}
                              value="no"
                              checked={experience.contactSupervisor === false}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              disabled={true}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              NO
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
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
              formType="work-experience"
              employeeId={employeeId}
              existingNote={workExperience?.hrFeedback?.comment}
              existingReviewedAt={workExperience?.hrFeedback?.reviewedAt}
              onNoteSaved={fetchWorkExperience}
              formData={workExperience}
              showSignature={false}
            />

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => navigate(`/hr/references/${employeeId}`)}
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
                Previous: References
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Exit to Dashboard
              </button>
              <button
                onClick={() =>
                  navigate(`/hr/professional-experience/${employeeId}`)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                Next: Military Service
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

export default WorkExperienceHR;
