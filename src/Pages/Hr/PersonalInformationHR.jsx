import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

const PersonalInformationHR = () => {
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
        const formData = result.data?.forms?.personalInformation;
        setData(formData);
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Personal Information
          </h2>

          {data ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <p className="text-gray-900">
                    {`${data.firstName || ""} ${data.middleInitial || ""} ${
                      data.lastName || ""
                    }`.trim() || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <p className="text-gray-900">{formatDate(data.date)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Country
                  </label>
                  <p className="text-gray-900">{data.country || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    State
                  </label>
                  <p className="text-gray-900">{data.state || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    City
                  </label>
                  <p className="text-gray-900">{data.city || "N/A"}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Street Address
                  </label>
                  <p className="text-gray-900">{data.streetAddress || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Apartment/Unit #
                  </label>
                  <p className="text-gray-900">{data.apartment || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    ZIP Code
                  </label>
                  <p className="text-gray-900">{data.zipCode || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <p className="text-gray-900">{data.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900">{data.email || "N/A"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Date Available
                  </label>
                  <p className="text-gray-900">
                    {formatDate(data.dateAvailable)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Social Security No.
                  </label>
                  <p className="text-gray-900">
                    {data.socialSecurityNo || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Desired Salary
                  </label>
                  <p className="text-gray-900">
                    {data.desiredSalary
                      ? `${data.desiredSalary} ${data.salaryCurrency || "USD"}`
                      : "N/A"}
                    {data.desiredSalaryType && ` (${data.desiredSalaryType})`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Position Applied For
                  </label>
                  <p className="text-gray-900">
                    {data.positionAppliedFor || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Government ID Type
                  </label>
                  <p className="text-gray-900">
                    {data.governmentIdType || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Government ID Number
                  </label>
                  <p className="text-gray-900">
                    {data.governmentIdNumber || "N/A"}
                  </p>
                </div>
                {data.governmentIdType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      {data.governmentIdType === "Passport"
                        ? "Government ID Country"
                        : "Government ID State"}
                    </label>
                    <p className="text-gray-900">
                      {data.governmentIdType === "Passport"
                        ? data.governmentIdCountry || "N/A"
                        : data.governmentIdState || "N/A"}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    US Citizen
                  </label>
                  <p className="text-gray-900">{data.isUSCitizen || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Authorized to Work
                  </label>
                  <p className="text-gray-900">
                    {data.isAuthorizedToWork || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Worked Here Before
                  </label>
                  <p className="text-gray-900">
                    {data.hasWorkedHereBefore || "N/A"}
                  </p>
                </div>
                {data.hasWorkedHereBefore === "YES" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Previous Work Date
                    </label>
                    <p className="text-gray-900">
                      {data.previousWorkDate || "N/A"}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Convicted of Felony
                  </label>
                  <p className="text-gray-900">
                    {data.hasBeenConvictedOfFelony || "N/A"}
                  </p>
                </div>
                {data.hasBeenConvictedOfFelony === "YES" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Felony Explanation
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {data.felonyExplanation || "N/A"}
                    </p>
                  </div>
                )}
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
                formType="personal-information"
                employeeId={employeeId}
                existingNote={data?.hrFeedback?.comment}
                existingReviewedAt={data?.hrFeedback?.reviewedAt}
                onNoteSaved={fetchData}
                formData={data}
              />
            </>
          ) : (
            <p className="text-gray-500">No personal information found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PersonalInformationHR;
