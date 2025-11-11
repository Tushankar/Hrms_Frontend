import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

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
          setData(professionalExperienceForm);
          setProfessionalForm(professionalExperienceForm);
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Professional Experience
          </h2>

          {data ? (
            <>
              {/* Military Service */}
              {(data.hasMilitaryService === true ||
                data.hasMilitaryService === "YES") && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Military Service
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Branch
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.branch || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        From Date
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.from || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        To Date
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.to || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Rank at Discharge
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.rankAtDischarge || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Type of Discharge
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.typeOfDischarge || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        May Contact Supervisor
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.mayContactSupervisor || "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">
                        If other than honorable, explain
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.otherThanHonorable || "N/A"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Reason for Leaving
                      </label>
                      <p className="text-gray-900">
                        {data.militaryService?.reasonForLeaving || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(data.hasMilitaryService === false ||
                data.hasMilitaryService === "NO") && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Military Service:</strong> Employee indicated no
                    military service experience.
                  </p>
                </div>
              )}

              {/* Documents Section */}
              {(data.resumePath ||
                data.coverLetterPath ||
                data.portfolioPath) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Documents Submitted
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.resumePath && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Resume
                        </label>
                        <p className="text-gray-900">{data.resumePath}</p>
                      </div>
                    )}
                    {data.coverLetterPath && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Cover Letter
                        </label>
                        <p className="text-gray-900">{data.coverLetterPath}</p>
                      </div>
                    )}
                    {data.portfolioPath && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Portfolio
                        </label>
                        <p className="text-gray-900">{data.portfolioPath}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded ${
                      professionalForm?.status === "completed" ||
                      professionalForm?.status === "submitted"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {professionalForm?.status || "draft"}
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
            </>
          ) : (
            <p className="text-gray-500">No professional experience found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalExperienceHR;
