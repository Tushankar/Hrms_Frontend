import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  const disclosures = [
    { key: "employmentAtWill", label: "Employment At-Will Acknowledgment" },
    { key: "backgroundCheckConsent", label: "Background Check Consent" },
    { key: "drugTestingConsent", label: "Drug Testing Consent" },
    {
      key: "accuracyDeclaration",
      label: "Accuracy of Information Declaration",
    },
    {
      key: "contactReferencesAuth",
      label: "Authorization to Contact References",
    },
    { key: "eeoStatement", label: "Equal Employment Opportunity Statement" },
    { key: "dataPrivacyConsent", label: "Data Privacy Consent (GDPR/CCPA)" },
    {
      key: "i9Acknowledgment",
      label: "I-9 & Work Authorization Acknowledgment",
    },
    { key: "eSignatureAgreement", label: "E-Signature Agreement" },
  ];

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
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

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Legal Disclosures & Consents
          </h2>

          {data ? (
            <>
              <div className="space-y-3 mb-8">
                {disclosures.map((disclosure) => (
                  <div
                    key={disclosure.key}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    {data[disclosure.key] ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <XCircle className="text-red-600" size={20} />
                    )}
                    <span className="text-sm text-gray-700">
                      {disclosure.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Legal Questions Section */}
              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Legal Questions
                </h3>

                <div className="space-y-4">
                  {/* Question 1 */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Are you a citizen of the United States?
                    </label>
                    <p
                      className={`text-sm font-medium px-3 py-1 rounded-full w-fit ${
                        data.usaCitizen
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {data.usaCitizen ? "Yes" : "No"}
                    </p>
                  </div>

                  {/* Question 2 */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Have you ever worked for this company?
                    </label>
                    <p
                      className={`text-sm font-medium px-3 py-1 rounded-full w-fit ${
                        data.workedForCompanyBefore
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {data.workedForCompanyBefore ? "Yes" : "No"}
                    </p>
                    {data.workedForCompanyBefore &&
                      data.workedForCompanyWhen && (
                        <div className="mt-3 p-2 bg-gray-50 rounded border-l-2 border-green-500">
                          <label className="block text-xs font-medium text-gray-600">
                            When:
                          </label>
                          <p className="text-sm text-gray-900">
                            {data.workedForCompanyWhen}
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Question 3 */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Are you legally authorized to work in the U.S.?
                    </label>
                    <p
                      className={`text-sm font-medium px-3 py-1 rounded-full w-fit ${
                        data.legallyAuthorizedToWorkUS
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {data.legallyAuthorizedToWorkUS ? "Yes" : "No"}
                    </p>
                  </div>

                  {/* Question 4 */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Do you require visa sponsorship?
                    </label>
                    <p
                      className={`text-sm font-medium px-3 py-1 rounded-full w-fit ${
                        data.requiresVisaSponsorship
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {data.requiresVisaSponsorship
                        ? "Yes (Requires Sponsorship)"
                        : "No"}
                    </p>
                  </div>

                  {/* Question 5 */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Have you ever been convicted of a felony?
                    </label>
                    <p
                      className={`text-sm font-medium px-3 py-1 rounded-full w-fit ${
                        data.convictedOfFelony
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {data.convictedOfFelony ? "Yes" : "No"}
                    </p>
                    {data.convictedOfFelony && data.convictionExplanation && (
                      <div className="mt-3 p-3 bg-red-50 rounded border-l-2 border-red-500">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Explanation:
                        </label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {data.convictionExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Signature
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Applicant Digital Signature
                    </label>
                    {data.applicantSignature ? (
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <p
                          className="text-center text-lg text-gray-900"
                          style={{
                            fontFamily: "'Great Vibes', cursive",
                            fontSize: "28px",
                            fontWeight: "400",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {data.applicantSignature}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No signature provided
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Date
                    </label>
                    <p className="text-gray-900">
                      {formatDate(data.signatureDate)}
                    </p>
                  </div>
                </div>
              </div>

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
                formType="legal-disclosures"
                employeeId={employeeId}
                existingNote={data?.hrFeedback?.comment}
                existingReviewedAt={data?.hrFeedback?.reviewedAt}
                onNoteSaved={fetchData}
                formData={data}
              />
            </>
          ) : (
            <p className="text-gray-500">No legal disclosures found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LegalDisclosuresHR;
