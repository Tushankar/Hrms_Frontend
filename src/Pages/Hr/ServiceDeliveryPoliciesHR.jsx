import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function ServiceDeliveryPoliciesHR() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [employeeSignature, setEmployeeSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [policyInitials, setPolicyInitials] = useState({
    policy1: "",
    policy2: "",
    policy3: "",
    policy4: "",
    policy5: "",
  });
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      // Get employee's service delivery policy data from application
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );

      console.log(
        "Service Delivery Policy Response:",
        response.data?.data?.forms
      );

      if (response.data?.data?.forms?.serviceDeliveryPolicy) {
        const policyData = response.data.data.forms.serviceDeliveryPolicy;

        console.log("Policy Data:", policyData);

        // Set signature data
        if (policyData.employeeSignature) {
          setEmployeeSignature(policyData.employeeSignature);
        }
        if (policyData.employeeSignatureDate) {
          const dateObj = new Date(policyData.employeeSignatureDate);
          const formattedDate = dateObj.toISOString().split("T")[0];
          setSignatureDate(formattedDate);
        }

        // Set policy initials
        if (policyData.policyInitials) {
          setPolicyInitials(policyData.policyInitials);
        }
      } else {
        console.warn("No service delivery policy data found");
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      {/* Add cursive signature fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Service Delivery Policy Review
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Review the employee's Service Delivery Policy submission
            </p>
          </div>

          <div className="space-y-6">
            {/* Instructions Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    📋 HR Review Instructions
                  </h3>
                  <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        1.
                      </span>
                      <span>
                        Review the employee's policy initials and signature
                        below
                      </span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <span className="font-bold text-blue-600 flex-shrink-0">
                        2.
                      </span>
                      <span>Add your review notes at the bottom</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="max-w-3xl w-full px-12 py-8">
                {/* Header with Logo */}
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png"
                    alt="Pacific Health Systems Logo"
                    className="h-20"
                  />
                </div>

                {/* Title */}
                <h1 className="text-center text-base font-bold mb-6 underline">
                  Service Delivery Policies
                </h1>

                {/* Introduction Text */}
                <div className="text-[13px] leading-normal mb-6">
                  <p>
                    At the Pacific Health Systems orientation forum, employees
                    where told of the significances of rendering quality service
                    to our clients. Please initial the following statements and
                    sign below:
                  </p>
                </div>

                {/* Policy Statements */}
                <div className="space-y-6">
                  {/* Statement 1 - Magenta highlight */}
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy1}
                      readOnly
                      className="w-16 mt-3 shrink-0 text-center text-sm bg-transparent outline-none italic border-b border-gray-300"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-[13px] leading-normal">
                      <span className="bg-[#E91E8C]">
                        I am aware of the agency policy of NO "EXU Login, NO
                        pay"
                      </span>
                      <span className="bg-[#E91E8C]">
                        . I understand that I have to complete my hours detail
                        for the previous Date within 6 days and payroll week by
                        11:00am on Monday
                      </span>
                      <span className="bg-[#E91E8C]">
                        {" "}
                        of the Payroll week and send in the copies of the
                        Progress Notes by email to{" "}
                      </span>
                      <span className="bg-[#9400D3] text-white">
                        office@pacifichealthsystems.com
                      </span>
                      <span className="bg-[#E91E8C]">
                        {" "}
                        or by dropping them at the office.
                      </span>
                    </div>
                  </div>

                  {/* Statement 2 - Yellow highlight */}
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy2}
                      readOnly
                      className="w-16 mt-3 shrink-0 text-center text-sm bg-transparent outline-none italic border-b border-gray-300"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-[13px] leading-normal">
                      <span className="bg-yellow-300">
                        I understand that NO CALL, NO SHOW results in immediate
                        termination
                      </span>
                    </div>
                  </div>

                  {/* Statement 3 - Cyan highlight */}
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy3}
                      readOnly
                      className="w-16 mt-3 shrink-0 text-center text-sm bg-transparent outline-none italic border-b border-gray-300"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-[13px] leading-normal">
                      <span className="bg-cyan-400">
                        Should there be a need to attend to non-business or
                        family matters during my scheduled hours, I understand
                        that{" "}
                      </span>
                      <span className="bg-cyan-400">
                        I have to let the Administration or my supervisor know
                        my intentions of my plans to be off-duty as early as
                        possible
                      </span>
                      <span className="bg-cyan-400">.</span>
                    </div>
                  </div>

                  {/* Statement 4 */}
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy4}
                      readOnly
                      className="w-16 mt-3 shrink-0 text-center text-sm bg-transparent outline-none italic border-b border-gray-300"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-[13px] leading-normal">
                      I understand that it is against agency policy to borrow
                      money from my client or tell my client about my personal
                      challenges.
                    </div>
                  </div>

                  {/* Statement 5 */}
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={policyInitials.policy5}
                      readOnly
                      className="w-16 mt-3 shrink-0 text-center text-sm bg-transparent outline-none italic border-b border-gray-300"
                      style={{ fontStyle: "italic" }}
                    />
                    <div className="text-[13px] leading-normal">
                      I understand that services are performed at client's home
                      and I must seek agency approval before driving the client
                      on Doctor's appointments, grocery shopping, purchase
                      medication etc.
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="mt-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-8">
                  <div className="w-full sm:flex-1 sm:max-w-xs">
                    <div className="border-b border-black mb-2 min-h-12 flex items-end pb-1">
                      <p
                        className="text-lg"
                        style={{
                          fontFamily: "'Great Vibes', cursive",
                          fontSize: "28px",
                          fontWeight: "400",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {employeeSignature || "No Signature"}
                      </p>
                    </div>
                    <p className="text-sm font-bold mt-1">Employee Signature</p>
                  </div>
                  <div className="w-full sm:flex-1 sm:max-w-xs">
                    <div className="border-b border-black mb-2 min-h-12 flex items-end pb-1">
                      <input
                        type="date"
                        value={signatureDate}
                        readOnly
                        className="w-full bg-transparent border-none outline-none text-sm"
                      />
                    </div>
                    <p className="text-sm font-bold mt-1 text-center">Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HR Notes Section */}
            <div className="mt-8">
              <HRNotesInput
                formType="service-delivery-policies"
                employeeId={employeeId}
                onNoteSaved={fetchEmployeeData}
                showSignature={false}
              />

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => navigate(`/hr/code-of-ethics/${employeeId}`)}
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
                  Previous: Code of Ethics
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Exit to Dashboard
                </button>
                <button
                  onClick={() =>
                    navigate(`/hr/non-compete-agreement/${employeeId}`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  Next: Non-Compete Agreement
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
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
}
