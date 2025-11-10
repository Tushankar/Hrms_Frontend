import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft } from "lucide-react";
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
        setData(result.data?.forms?.education);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Education</h2>

          {data &&
          data.educations &&
          Array.isArray(data.educations) &&
          data.educations.length > 0 ? (
            <>
              {data.educations
                .filter((education) => education.type !== "Other")
                .map((education, index) => (
                  <div
                    key={index}
                    className="mb-6 p-4 border border-gray-200 rounded-lg"
                  >
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      {education.type || `Education Entry ${index + 1}`}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {index > 1 && education.type && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-600">
                            Institution Type
                          </label>
                          <p className="text-gray-900">{education.type}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">
                          {education.type === "High School"
                            ? "High School Name"
                            : education.type === "College"
                            ? "College/University Name"
                            : "Institution Name"}
                        </label>
                        <p className="text-gray-900">
                          {education?.institutionName || "N/A"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">
                          Address
                        </label>
                        <p className="text-gray-900">
                          {education?.address || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          From
                        </label>
                        <p className="text-gray-900">
                          {formatDate(education?.from)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          To
                        </label>
                        <p className="text-gray-900">
                          {formatDate(education?.to)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Did you graduate?
                        </label>
                        <p className="text-gray-900">
                          {education?.didGraduate || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          {education.type === "High School"
                            ? "Diploma"
                            : "Degree/Certificate"}
                        </label>
                        <p className="text-gray-900">
                          {education?.degree || education?.diploma || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded ${
                      data.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {data.status || "draft"}
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
            </>
          ) : (
            <p className="text-gray-500">No education records found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EducationHR;
