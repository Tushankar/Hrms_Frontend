import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft, Users, CheckCircle, FileText, Target } from "lucide-react";
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

const ReferencesHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [referencesForm, setReferencesForm] = useState(null);
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
        // Extract the references form data and handle the references array
        const referencesFormData = result.data?.forms?.references;
        if (referencesFormData && referencesFormData.references) {
          setData([...referencesFormData.references]);
          setReferencesForm({ ...referencesFormData });
        } else {
          setData([]);
          setReferencesForm(null);
        }
      } else {
        setData([]);
        setReferencesForm(null);
      }
    } catch (error) {
      console.error("Error:", error);
      setData([]);
      setReferencesForm(null);
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

  const formStatus = referencesForm?.status || "draft";

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
                <Users className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3" />
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    PROFESSIONAL REFERENCES
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base"></p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
              Professional References
            </h2>

            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Please list three professional references.
            </p>

            {Array.isArray(data) && data.length > 0 ? (
              data.map((reference, index) => (
                <div
                  key={index}
                  className="mb-8 p-6 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Reference {index + 1}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reference.fullName || ""}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Manager, Colleague, Professor"
                        value={reference.relationship || ""}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reference.company || ""}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formatPhone(reference.phone || "")}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reference.address || ""}
                        onChange={() => {}}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={true}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No references found.</p>
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
              formType="references"
              employeeId={employeeId}
              existingNote={referencesForm?.hrFeedback?.comment}
              existingReviewedAt={referencesForm?.hrFeedback?.reviewedAt}
              onNoteSaved={fetchData}
              formData={referencesForm}
              showSignature={false}
            />

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => navigate(`/hr/education/${employeeId}`)}
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
                Previous: Education
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Exit to Dashboard
              </button>
              <button
                onClick={() => navigate(`/hr/work-experience/${employeeId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                Next: Previous Employment
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

export default ReferencesHR;
