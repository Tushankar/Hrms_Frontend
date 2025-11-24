import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// Import the same form component used by employees
const GemaltoRegistrationForm = ({ formData, readOnly = false }) => {
  const LogoHeader = () => (
    <div className="flex items-start mb-4">
      <div
        className="w-24 h-24 flex items-center justify-center mr-4 flex-shrink-0 relative"
        style={{ backgroundColor: "#1D1A53" }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 128 128"
          className="absolute inset-0"
        >
          <g transform="translate(64, 45)">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = Math.cos(rad) * 25;
              const y2 = Math.sin(rad) * 25;
              return (
                <line
                  key={i}
                  x1="0"
                  y1="0"
                  x2={x2}
                  y2={y2}
                  stroke="#FDB714"
                  strokeWidth="2.5"
                />
              );
            })}
            <circle cx="0" cy="0" r="3" fill="#FDB714" />
          </g>
        </svg>
        <div className="text-white font-bold text-lg mt-12 relative z-10">
          DBHDD
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-xl font-bold text-right mb-1">
          Georgia Department of Behavioral Health & Developmental Disabilities
        </h1>
        <p className="text-sm text-right italic mb-3">
          Judy Fitzgerald, Commissioner
        </p>
        <div className="border-t-2 border-black pt-2">
          <h2 className="text-center font-bold">
            Office of Enterprise Compliance
          </h2>
          <p className="text-xs text-center">
            Two Peachtree Street, NW • 2nd Floor • Atlanta, Georgia 30303-3142 •
            Telephone: 404-463-2507 • Fax: 770-339-5473
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-200 p-2">
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      {/* PAGE 1 - Registration Form */}
      <div className="w-[700px] min-h-[900px] mx-auto p-6 bg-white shadow-lg mb-4">
        <LogoHeader />

        <h2 className="text-xl font-bold text-center mb-6">
          Gemalto Applicant Registration Form
        </h2>

        <div className="space-y-3">
          {/* Name Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className="block text-xs mb-1">Last Name</label>
              <input
                type="text"
                value={formData?.lastName || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-5">
              <label className="block text-xs mb-1">First Name</label>
              <input
                type="text"
                value={formData?.firstName || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Middle Initial</label>
              <input
                type="text"
                value={formData?.middleInitial || ""}
                readOnly={readOnly}
                maxLength={1}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          {/* Physical Details Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3">
              <label className="block text-xs mb-1">Social Security No.</label>
              <input
                type="text"
                value={formData?.ssn || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Height</label>
              <input
                type="text"
                value={formData?.height || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Weight</label>
              <input
                type="text"
                value={formData?.weight || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Eye color</label>
              <input
                type="text"
                value={formData?.eyeColor || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs mb-1">Hair Color</label>
              <input
                type="text"
                value={formData?.hairColor || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          {/* DOB, Sex, Race Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-xs mb-1">Date of Birth</label>
              <input
                type="text"
                value={
                  formData?.dob
                    ? new Date(formData.dob).toLocaleDateString()
                    : ""
                }
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs mb-1">Sex</label>
              <input
                type="text"
                value={formData?.sex || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-5">
              <label className="block text-xs mb-1">Race</label>
              <input
                type="text"
                value={formData?.race || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          {/* Address Row */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label className="block text-xs mb-1">Street Address</label>
              <input
                type="text"
                value={formData?.streetAddress || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs mb-1">City</label>
              <input
                type="text"
                value={formData?.city || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">State</label>
              <input
                type="text"
                value={formData?.state || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs mb-1">Zip</label>
              <input
                type="text"
                value={formData?.zip || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          {/* Provider and Position Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1">Provider</label>
              <input
                type="text"
                value={formData?.provider || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Position Applied For</label>
              <input
                type="text"
                value={formData?.position || ""}
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          {/* Consent Text */}
          <div className="text-xs leading-relaxed my-4">
            <p className="text-justify">
              I am aware that a fingerprint-based background check is required
              for employment with a DBHDD network provider under Policy 04-104.
              I have read and accepted the terms of the Applicant Privacy Rights
              and Privacy Act Statement. I understand that DBHDD Criminal
              History Background Section (CHBC) must approve all applicant
              registrations prior to a fingerprint submission. I also understand
              that registrations will be approved or rejected based upon
              information submitted. In either case, I will receive an email
              from Gemalto explaining the status of my request. I understand
              that incomplete forms or inaccurate information will delay
              approval process.
            </p>
          </div>

          {/* Signature and Date */}
          <div className="grid grid-cols-1 gap-4 mt-6">
            <div>
              <label className="block text-xs mb-1">Signature</label>
              <p
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: "48px",
                  letterSpacing: "0.5px",
                }}
                className="w-full border-b-2 border-black pb-1 h-10 flex items-center"
              >
                {formData?.signature || "No Signature"}
              </p>
            </div>
            <div>
              <label className="block text-xs mb-1">Date</label>
              <input
                type="text"
                value={
                  formData?.date
                    ? new Date(formData.date).toLocaleDateString()
                    : ""
                }
                readOnly={readOnly}
                className={`w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs mt-6 pt-4 border-t">
            <p>
              2 Peachtree Street, NW • Atlanta, Georgia 30303 • 404.657.2252
            </p>
            <p>dbhdd.georgia.gov • Facebook: Georgia DBHDD • Twitter: @DBHDD</p>
          </div>
        </div>
      </div>

      {/* PAGE 2 - Notification Form */}
      <div className="w-[700px] min-h-[900px] mx-auto p-6 bg-white shadow-lg">
        <LogoHeader />

        <div className="space-y-4">
          {/* TO/FROM/RE Section */}
          <div className="space-y-2">
            <div className="flex">
              <div className="font-bold w-24">TO:</div>
              <div>DBHDD Provider Network</div>
            </div>
            <div className="flex">
              <div className="font-bold w-24">FROM:</div>
              <div>
                <div>DBHDD Office of Enterprise Compliance</div>
                <div>Criminal History Background Checks Section</div>
              </div>
            </div>
            <div className="flex">
              <div className="font-bold w-24">RE:</div>
              <div>Gemalto Applicant Registration Notification</div>
            </div>
          </div>

          {/* Notification Text */}
          <div className="text-sm">
            <p>
              Please send notification forms to CHBC by facsimile to (404),
              656-0008 or via email at{" "}
              <span className="text-blue-600 underline font-bold">
                DBHDD.REG@DBHDD.GA.GOV
              </span>{" "}
              with this Cover Sheet after completing the information required
              below:
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center">
              <label className="font-bold w-64">Provider Name</label>
              <input
                type="text"
                value={formData?.providerName || ""}
                readOnly={readOnly}
                className={`flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div className="flex items-center">
              <label className="font-bold w-64">Applicant Name</label>
              <input
                type="text"
                value={formData?.applicantName || ""}
                readOnly={readOnly}
                className={`flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div className="flex items-center">
              <label className="font-bold w-64">Name of Direct Contact</label>
              <input
                type="text"
                value={formData?.directContact || ""}
                readOnly={readOnly}
                className={`flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div className="flex items-center">
              <label className="font-bold w-64">Contact Phone Number</label>
              <input
                type="text"
                value={formData?.contactPhone || ""}
                readOnly={readOnly}
                className={`flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>

            <div className="flex items-center">
              <label className="font-bold w-64">Email address</label>
              <input
                type="text"
                value={formData?.emailAddress || ""}
                readOnly={readOnly}
                className={`flex-1 border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 ${
                  readOnly ? "bg-gray-50" : ""
                }`}
              />
            </div>
          </div>

          {/* Mandatory Notice */}
          <div className="text-center text-sm font-bold mt-6">
            ***The Notification Form and Cover Letter are Mandatory for
            Processing***
          </div>

          {/* Contact Information */}
          <div className="text-sm mt-4">
            <p>
              If you have questions, please contact our office at 404-232-1541,
              404-463-2507 or 404-232-1641.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs mt-8 pt-4 border-t">
            <p className="font-bold">
              Georgia Department of Behavioral Health & Developmental
              Disabilities
            </p>
            <p>
              2 Peachtree Street, NW • Atlanta, Georgia 30303 • 404.657.2252
              dbhdd.georgia.gov • Facebook: GeorgiaDBHDD • Twitter: @DBHDD
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BackgroundCheckFormHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const baseURL = import.meta.env.VITE__BASEURL;

  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState("");
  const [formId, setFormId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    loadData();
  }, [employeeId, baseURL]);

  const loadData = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );

      if (response.data?.data?.forms?.backgroundCheck) {
        const bgCheckData = response.data.data.forms.backgroundCheck;
        setFormId(bgCheckData._id);
        setEmployeeName(
          `${bgCheckData.firstName || ""} ${
            bgCheckData.lastName || ""
          }`.trim() || "Employee"
        );

        // Flatten the nested data structure for the form component
        const flattenedData = {
          lastName: bgCheckData.applicantInfo?.lastName || "",
          firstName: bgCheckData.applicantInfo?.firstName || "",
          middleInitial: bgCheckData.applicantInfo?.middleInitial || "",
          ssn: bgCheckData.applicantInfo?.socialSecurityNumber || "",
          dob: bgCheckData.applicantInfo?.dateOfBirth
            ? new Date(bgCheckData.applicantInfo.dateOfBirth)
                .toISOString()
                .split("T")[0]
            : "",
          height: bgCheckData.applicantInfo?.height || "",
          weight: bgCheckData.applicantInfo?.weight || "",
          sex: bgCheckData.applicantInfo?.sex || "",
          eyeColor: bgCheckData.applicantInfo?.eyeColor || "",
          hairColor: bgCheckData.applicantInfo?.hairColor || "",
          race: bgCheckData.applicantInfo?.race || "",
          streetAddress: bgCheckData.applicantInfo?.address?.street || "",
          city: bgCheckData.applicantInfo?.address?.city || "",
          state: bgCheckData.applicantInfo?.address?.state || "",
          zip: bgCheckData.applicantInfo?.address?.zipCode || "",
          provider: bgCheckData.employmentInfo?.provider || "",
          position: bgCheckData.employmentInfo?.positionAppliedFor || "",
          signature: bgCheckData.applicantSignature || "",
          date: bgCheckData.applicantSignatureDate
            ? new Date(bgCheckData.applicantSignatureDate)
                .toISOString()
                .split("T")[0]
            : "",
          providerName: bgCheckData.notification?.providerName || "",
          applicantName: bgCheckData.notification?.applicantName || "",
          directContact: bgCheckData.notification?.directContactName || "",
          contactPhone: bgCheckData.notification?.contactPhone || "",
          emailAddress: bgCheckData.notification?.contactEmail || "",
        };

        setFormData(flattenedData);
        setOriginalFormData(bgCheckData);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl border p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white text-center py-6 px-6">
              <h2 className="text-2xl font-bold">Background Check Form</h2>
              <p className="text-blue-100 mt-2">Employee Submission Review</p>
              <p className="text-sm opacity-90 mt-1">
                Employee: {employeeName}
              </p>
            </div>

            <div className="p-8">
              {/* Form Display */}
              {formData && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-auto max-h-[800px] hide-scrollbar">
                  <GemaltoRegistrationForm
                    formData={formData}
                    readOnly={true}
                  />
                </div>
              )}

              {originalFormData && (
                <div className="mt-6">
                  <HRNotesInput
                    formType="background-check"
                    employeeId={employeeId}
                    existingNote={originalFormData?.hrFeedback?.comment}
                    existingReviewedAt={
                      originalFormData?.hrFeedback?.reviewedAt
                    }
                    onNoteSaved={loadData}
                    formData={originalFormData}
                    formId={formId}
                    showSignature={false}
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6">
              <button
                onClick={() => navigate(`/hr/driving-license/${employeeId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous: Government ID
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Exit to Dashboard
              </button>
              <button
                onClick={() =>
                  navigate(`/hr/staff-misconduct-statement/${employeeId}`)
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Next: Staff Misconduct
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Toaster position="top-right" />
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </Layout>
  );
};

export default BackgroundCheckFormHR;
