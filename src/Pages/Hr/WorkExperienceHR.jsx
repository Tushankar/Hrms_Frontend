import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

const WorkExperienceHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [workExperience, setWorkExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkExperience(data.data?.forms?.workExperience);
      } else {
        setError("Work experience not found");
      }
    } catch (error) {
      console.error("Error fetching work experience:", error);
      setError("Failed to load work experience");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading work experience...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Work Experience - HR Review
        </h2>

        {/* Display whether candidate has previous work experience */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-base font-semibold text-gray-800">
            <span className="text-gray-700">Has Previous Work Experience:</span>{" "}
            <span
              className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                workExperience?.hasPreviousWorkExperience
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {workExperience?.hasPreviousWorkExperience !== undefined
                ? workExperience.hasPreviousWorkExperience
                  ? "Yes"
                  : "No"
                : "Not Specified"}
            </span>
          </p>
        </div>

        {workExperience?.hasPreviousWorkExperience === false ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-lg text-gray-700 font-medium">
              ✓ Candidate indicated they have no previous work experience
            </p>
          </div>
        ) : workExperience?.workExperiences?.length > 0 ? (
          <div className="space-y-6">
            {workExperience.workExperiences.map((experience, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Work Experience {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.company || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.phone || "N/A"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.address || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supervisor
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.supervisor || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.jobTitle || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Salary
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.startingSalaryAmount
                        ? `${experience.startingSalaryAmount} (${
                            experience.startingSalaryType || "hourly"
                          })`
                        : experience.startingSalary
                        ? `$${experience.startingSalary}`
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ending Salary
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.endingSalaryAmount
                        ? `${experience.endingSalaryAmount} (${
                            experience.endingSalaryType || "hourly"
                          })`
                        : experience.endingSalary
                        ? `$${experience.endingSalary}`
                        : "N/A"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsibilities
                    </label>
                    <div className="text-gray-900 bg-white p-3 rounded border min-h-[100px]">
                      {experience.responsibilities || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {formatDate(experience.from)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {formatDate(experience.to)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Leaving
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.reasonForLeaving || "N/A"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      May we contact supervisor for reference?
                    </label>
                    <p className="text-gray-900 bg-white p-2 rounded border">
                      {experience.contactSupervisor === true
                        ? "Yes"
                        : experience.contactSupervisor === false
                        ? "No"
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No work experience information available.
            </p>
          </div>
        )}

        {/* Form Status */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded ${
                workExperience?.status === "completed" ||
                workExperience?.status === "submitted"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {workExperience?.status || "draft"}
            </span>
          </p>
        </div>

        {/* HR Notes */}
        <HRNotesInput
          formType="work-experience"
          employeeId={employeeId}
          existingNote={workExperience?.hrFeedback?.comment}
          existingReviewedAt={workExperience?.hrFeedback?.reviewedAt}
          onNoteSaved={fetchWorkExperience}
          formData={workExperience}
        />
      </div>
    </Layout>
  );
};

export default WorkExperienceHR;
