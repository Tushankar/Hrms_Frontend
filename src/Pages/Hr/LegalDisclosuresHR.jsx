import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft, Shield, CheckCircle, FileText } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

const LegalDisclosuresHR = () => {
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
        setData(result.data?.forms?.legalDisclosures);
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

  const formStatus = data?.status || "draft";

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Add cursive signature fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
          rel="stylesheet"
        />
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
                <Shield className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3" />
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    Disclaimer & Signature
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base"></p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            {/* Certification Statement */}
            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-800 mb-2">
                    Important Certification
                  </h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    I certify that my answers are true and complete to the best
                    of my knowledge. If this application leads to employment, I
                    understand that false or misleading information in my
                    application or interview may result in my release.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Applicant Signature
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="applicantSignature"
                  >
                    Type Your Signature *
                  </label>
                  <input
                    id="applicantSignature"
                    type="text"
                    value={data?.applicantSignature || ""}
                    onChange={() => {}}
                    placeholder="Type your full name as signature"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={true}
                    style={{
                      fontFamily: "'Great Vibes', cursive",
                      fontSize: "28px",
                      fontWeight: "400",
                      letterSpacing: "0.5px",
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your signature will appear in Great Vibes cursive font
                  </p>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="signatureDate"
                  >
                    Date Signed *
                    <span className="text-xs text-gray-500 block">
                      (Defaults to today, can be overridden)
                    </span>
                  </label>
                  <input
                    id="signatureDate"
                    type="date"
                    value={data?.signatureDate || ""}
                    onChange={() => {}}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={true}
                  />
                </div>
              </div>
            </div>

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
              formType="legal-disclosures"
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
                  navigate(`/hr/professional-experience/${employeeId}`)
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
                Previous: Military Service
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Exit to Dashboard
              </button>
              <button
                onClick={() =>
                  navigate(`/hr/job-description/pca/${employeeId}`)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                Next: Job Description
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

export default LegalDisclosuresHR;
