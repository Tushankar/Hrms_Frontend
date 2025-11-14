import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft, GraduationCap, CheckCircle, FileText } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

const EducationHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
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
        setData({ ...result.data?.forms?.education });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.split("T")[0];
  };

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </Layout>
    );

  const educations = data?.educations || [];
  const formStatus = data?.status || "draft";

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
          <div className="bg-[#1F3A93] text-white p-6">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                <GraduationCap className="w-8 h-8 mr-3" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    EDUCATION & CERTIFICATES
                  </h1>
                  <p className="text-blue-100"></p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#1F3A93] mb-6 pb-2 border-b-2 border-[#1F3A93]">
              Education
            </h2>

            {/* Education Entries */}
            {educations.length > 0 ? (
              educations.map((education, index) => (
                <div
                  key={index}
                  className="mb-8 p-6 border border-gray-200 rounded-lg relative"
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {education.type || `Education Entry ${index + 1}`}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {index > 1 && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution Type
                        </label>
                        <input
                          type="text"
                          value={education?.type || ""}
                          onChange={() => {}}
                          placeholder="e.g., University, Trade School, Online Course"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {index === 0
                          ? "High School Name"
                          : index === 1
                          ? "College/University Name"
                          : "Institution Name"}
                      </label>
                      <input
                        type="text"
                        value={education?.institutionName || ""}
                        onChange={() => {}}
                        placeholder={
                          index === 0
                            ? "e.g., Lincoln High School"
                            : index === 1
                            ? "e.g., Harvard University"
                            : "e.g., Institution Name"
                        }
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
                        value={education?.address || ""}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={formatDate(education?.from)}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={formatDate(education?.to)}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Did you graduate?
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`graduate_${index}`}
                            value="YES"
                            checked={education?.didGraduate === "YES"}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={true}
                          />
                          <span className="ml-2 text-gray-700">YES</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`graduate_${index}`}
                            value="NO"
                            checked={education?.didGraduate === "NO"}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            disabled={true}
                          />
                          <span className="ml-2 text-gray-700">NO</span>
                        </label>
                      </div>
                    </div>

                    {education?.didGraduate === "YES" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {education.type === "High School"
                            ? "Diploma"
                            : "Degree/Certificate"}
                        </label>
                        <input
                          type="text"
                          value={education?.degree || education?.diploma || ""}
                          onChange={() => {}}
                          placeholder={
                            education.type === "High School"
                              ? "e.g., High School Diploma"
                              : "e.g., Bachelor of Science, Certificate"
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No education records found.</p>
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
              formType="education"
              employeeId={employeeId}
              existingNote={data?.hrFeedback?.comment}
              existingReviewedAt={data?.hrFeedback?.reviewedAt}
              onNoteSaved={fetchData}
              formData={data}
              showSignature={false}
            />

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() =>
                  navigate(`/hr/personal-information/${employeeId}`)
                }
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
                Previous: Personal Information
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Exit to Dashboard
              </button>
              <button
                onClick={() => navigate(`/hr/references/${employeeId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                Next: References
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

export default EducationHR;
