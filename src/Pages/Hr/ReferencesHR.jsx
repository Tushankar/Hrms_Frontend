import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

const ReferencesHR = () => {
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
        setData(result.data?.forms?.references);
      }
    } catch (error) {
      console.error("Error:", error);
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
            Professional References
          </h2>

          {Array.isArray(data) && data.length > 0 ? (
            data.map((ref, idx) => (
              <div
                key={idx}
                className="mb-6 p-6 border border-gray-200 rounded-lg"
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Reference {idx + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <p className="text-gray-900">{ref.fullName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Relationship
                    </label>
                    <p className="text-gray-900">{ref.relationship || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Company
                    </label>
                    <p className="text-gray-900">{ref.company || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <p className="text-gray-900">{ref.phone || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Address
                    </label>
                    <p className="text-gray-900">{ref.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No references found.</p>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded ${
                  Array.isArray(data) && data[0]?.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {Array.isArray(data) ? data[0]?.status || "draft" : "draft"}
              </span>
            </p>
          </div>

          <HRNotesInput
            formType="references"
            employeeId={employeeId}
            existingNote={
              Array.isArray(data)
                ? data[0]?.hrFeedback?.comment
                : data?.hrFeedback?.comment
            }
            existingReviewedAt={
              Array.isArray(data)
                ? data[0]?.hrFeedback?.reviewedAt
                : data?.hrFeedback?.reviewedAt
            }
            onNoteSaved={fetchData}
            formData={data}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ReferencesHR;
