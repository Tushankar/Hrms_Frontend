import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";

const NonCompeteAgreementHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const baseURL = import.meta.env.VITE__BASEURL;

  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState("");
  const [formId, setFormId] = useState(null);
  const [formData, setFormData] = useState(null);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [companyRepSignature, setCompanyRepSignature] = useState("");
  const [companyRepName, setCompanyRepName] = useState("");

  const loadData = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );

      console.log(
        "Non-Compete Agreement Response:",
        response.data?.data?.forms
      );

      if (response.data?.data?.forms?.nonCompeteAgreement) {
        const data = response.data.data.forms.nonCompeteAgreement;
        console.log("📄 Non-Compete Form Data:", data);
        setFormId(data._id);
        setEmployeeName(data.employeeName || "Employee");
        setFormData(data);
        setCompanyRepSignature(data.companyRepSignature || "");
        setCompanyRepName(data.companyRepName || "");
      } else {
        console.warn("No non-compete agreement data found");
        setFormData(null);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  return (
    <Layout>
      <Navbar />
      {/* Add cursive signature fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap"
        rel="stylesheet"
      />

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
              <h2 className="text-2xl font-bold">Non-Compete Agreement</h2>
              <p className="text-blue-100 mt-2">HR Document Review</p>
              <p className="text-sm opacity-90 mt-1">
                Employee: {employeeName}
              </p>
            </div>

            <div className="p-8">
              {/* Non-Compete Agreement Form Display */}
              {formData && (
                <div className="space-y-6 mb-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Non-Compete Agreement Form
                    </h3>
                    <div className="max-w-4xl mx-auto bg-white p-8 font-serif text-sm leading-relaxed border border-gray-200 rounded-lg">
                      {/* Page 1 */}
                      <div className="mb-8">
                        <h1 className="text-center text-base font-bold mb-8 border-b border-gray-400 pb-2">
                          NON-COMPETE AGREEMENT
                        </h1>

                        <p className="mb-6">
                          This Non-Compete (the "Agreement") is made as of this{" "}
                          <span className="border-b border-black px-1">
                            {formData.day || "___"}
                          </span>{" "}
                          day of{" "}
                          <span className="border-b border-black px-1">
                            {formData.month || "___"}
                          </span>
                          ,{" "}
                          <span className="border-b border-black px-1">
                            {formData.year || "20__"}
                          </span>{" "}
                          (the "Effective Date") by and between Pacific Health
                          Systems LLC ("Company"), located at 303 Corporate
                          Center Dr., Suite 325, Stockbridge, GA 30281, and{" "}
                          <span className="border-b border-black px-1">
                            {formData.employeeName || "____________________"}
                          </span>{" "}
                          ("Employee"), residing at{" "}
                          <span className="border-b border-black px-1">
                            {formData.employeeAddress || "____________________"}
                          </span>
                          <span className="block border-b border-black w-full my-1"></span>
                          Employee will be serving as{" "}
                          <span className="border-b border-black px-1">
                            {formData.employeePosition ||
                              "____________________"}
                          </span>
                          . Employee may have access to or may generate or
                          otherwise come into contact with proprietary and/or
                          confidential information of the Company or the
                          Company's clients. The Company wishes to enter into a
                          non-compete agreement in the event Employee terminates
                          his or her employment. In consideration of the
                          promises and mutual covenants herein, the parties
                          agree as follows:
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          1. Employee Covenants.
                        </h3>

                        <p className="mb-4">
                          In consideration of offer of employment or continued
                          employment with the Company, Employee covenants that
                          during their employment with the Company and for a
                          period of two (2) years or the longest period of time
                          allowed by state law, whichever is shorter, after said
                          employment is ended for any reason, including but not
                          limited to the termination of their employment due to
                          inadequate performance or resignation:
                        </p>

                        <div className="ml-8 mb-6 space-y-3">
                          <div className="flex">
                            <span className="mr-4">a.</span>
                            <p>
                              Employee shall not induce, directly or indirectly,
                              any other employees of the Company to terminate
                              their employment.
                            </p>
                          </div>
                          <div className="flex">
                            <span className="mr-4">b.</span>
                            <p>
                              Employee shall not solicit the business of any
                              client of the Company.
                            </p>
                          </div>
                          <div className="flex">
                            <span className="mr-4">c.</span>
                            <p>
                              Employee shall not offer same or similar services
                              to a client that they previously served during
                              employment.
                            </p>
                          </div>
                          <div className="flex">
                            <span className="mr-4">d.</span>
                            <p>
                              Employee shall not induce, directly or indirectly,
                              any client of the Company to transfer services to
                              another agency.
                            </p>
                          </div>
                        </div>

                        <h3 className="font-bold text-blue-700 mb-2">
                          2. Confidentiality Agreement.
                        </h3>

                        <p className="mb-6">
                          Employee shall not, without written consent, share or
                          use any information relating to the Company that has
                          not been previously publicly released including but
                          not limited to patient charts, trade secrets,
                          proprietary and confidential information, research,
                          designs, financial data, customer and employee
                          records, and marketing plans.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          3. Injunctive Relief.
                        </h3>

                        <p className="mb-6">
                          Employee acknowledges that disclosure of any
                          confidential information or breach of any of the
                          noncompetitive covenants will cause irreparable harm
                          to the Company. Injunctive relief is agreed to be an
                          appropriate remedy.
                        </p>

                        <div className="text-xs text-gray-600 border-t border-gray-300 pt-2 mt-8">
                          1 | Page
                        </div>
                      </div>

                      {/* Page 2 */}
                      <div className="mt-12">
                        <h3 className="font-bold text-blue-700 mb-2">
                          4. Binding Effect.
                        </h3>

                        <p className="mb-6">
                          This Agreement is binding upon the parties and their
                          legal representatives, successors, and permitted
                          assigns.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          5. Severability.
                        </h3>

                        <p className="mb-6">
                          If any provision is deemed invalid, the remainder
                          shall still be enforceable.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          6. Governing Law.
                        </h3>

                        <p className="mb-6">
                          This Agreement shall be governed by the laws of the
                          State of Georgia.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          7. Dispute Resolution.
                        </h3>

                        <p className="mb-6">
                          Disputes shall be brought only in Georgia courts. All
                          parties waive the right to trial by jury to the
                          maximum extent permitted by law.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          8. Headings.
                        </h3>

                        <p className="mb-6">
                          Section headings are for convenience only and do not
                          affect interpretation.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          9. Entire Agreement.
                        </h3>

                        <p className="mb-6">
                          This document contains the full agreement and
                          supersedes prior oral or written agreements.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          10. Amendment.
                        </h3>

                        <p className="mb-6">
                          This Agreement can only be amended in writing signed
                          by both parties.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          11. Notices.
                        </h3>

                        <p className="mb-6">
                          All notices must be in writing and delivered to the
                          parties' last known addresses.
                        </p>

                        <h3 className="font-bold text-blue-700 mb-2">
                          12. Waiver.
                        </h3>

                        <p className="mb-8">
                          Waiver of any provision must be in writing and does
                          not waive any other rights.
                        </p>

                        <p className="mb-12">
                          IN WITNESS WHEREOF, this Agreement has been executed
                          as of the date first above written.
                        </p>

                        {/* Signature Section */}
                        <div className="space-y-12">
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <div className="border-b border-black mb-2 h-12 flex items-end pb-1">
                                <input
                                  type="text"
                                  value={companyRepSignature}
                                  onChange={(e) =>
                                    setCompanyRepSignature(e.target.value)
                                  }
                                  placeholder="Company Representative Signature"
                                  className="w-full bg-transparent border-none outline-none text-lg"
                                  style={{
                                    fontFamily: "'Great Vibes', cursive",
                                    fontSize: "28px",
                                    fontWeight: "400",
                                    letterSpacing: "0.5px",
                                  }}
                                />
                              </div>
                              <p className="text-xs">
                                Company Representative Signature
                              </p>
                            </div>
                            <div>
                              <div className="border-b border-black mb-2 h-12 flex items-center px-2">
                                <input
                                  type="text"
                                  value={companyRepName}
                                  onChange={(e) =>
                                    setCompanyRepName(e.target.value)
                                  }
                                  placeholder="Name and Title"
                                  className="w-full bg-transparent border-none outline-none text-sm"
                                />
                              </div>
                              <p className="text-xs">
                                Company Representative Name and Title
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <div className="border-b border-black mb-2 h-12 flex items-end pb-1">
                                <p
                                  className="text-lg"
                                  style={{
                                    fontFamily: "'Great Vibes', cursive",
                                    fontSize: "28px",
                                    fontWeight: "400",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {formData.employeeSignature || "No Signature"}
                                </p>
                              </div>
                              <p className="text-xs">Employee Signature</p>
                            </div>
                            <div>
                              <div className="border-b border-black mb-2 h-12 flex items-center px-2">
                                <span className="text-sm">
                                  {formData.employeeSignatureName ||
                                    "____________________"}
                                </span>
                              </div>
                              <p className="text-xs">Employee Name</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 border-t border-gray-300 pt-2 mt-16">
                          2 | Page
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!formData && !loading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">
                        No Data Found
                      </h3>
                      <p className="text-sm text-yellow-700">
                        No non-compete agreement data available for this
                        employee.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Signature Section */}
              {formData?.employeeSignature && (
                <div className="space-y-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-blue-800 mb-1">
                            Digital Signature
                          </h3>
                          <p className="text-sm text-blue-600 mb-3">
                            Employee signed digitally
                          </p>
                          {formData.employeeSignatureDate && (
                            <p className="text-xs text-blue-600 mb-3">
                              Signed on:{" "}
                              {new Date(
                                formData.employeeSignatureDate
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Display */}
                  <div className="space-y-4">
                    <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                      <div className="w-full flex justify-center">
                        <p
                          className="text-3xl"
                          style={{
                            fontFamily: "'Great Vibes', cursive",
                            fontSize: "48px",
                            fontWeight: "400",
                            letterSpacing: "0.5px",
                            minHeight: "60px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {formData.employeeSignature || "No Signature"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">
                            Digital signature submitted
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          ✍️ Digital signature • Date:{" "}
                          {formData.employeeSignatureDate
                            ? new Date(
                                formData.employeeSignatureDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HR Notes Section */}
              <div className="p-8 border-t">
                <HRNotesInput
                  formType="non-compete-agreement"
                  employeeId={employeeId}
                  existingNote={formData?.hrFeedback?.comment}
                  existingReviewedAt={formData?.hrFeedback?.reviewedAt}
                  onNoteSaved={loadData}
                  formData={formData}
                  showSignature={false}
                  companyRepSignature={companyRepSignature}
                  companyRepName={companyRepName}
                  onCompanyRepUpdate={(signature, name) => {
                    setCompanyRepSignature(signature);
                    setCompanyRepName(name);
                  }}
                />

                {/* Navigation Buttons */}
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() =>
                      navigate(`/hr/service-delivery-policies/${employeeId}`)
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
                    Previous: Service Delivery
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Exit to Dashboard
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/hr/emergency-contact/${employeeId}`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    Next: Emergency Contact
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
        )}
      </div>

      {/* Signature Modal */}
      {selectedSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Employee Signature
            </h3>
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
              {selectedSignature && (
                <p
                  className="text-3xl text-center"
                  style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontSize: "48px",
                    fontWeight: "400",
                    letterSpacing: "0.5px",
                    minHeight: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedSignature}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedSignature(null)}
              className="w-full px-4 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </Layout>
  );
};

export default NonCompeteAgreementHR;
