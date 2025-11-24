import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle, Eye } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import axios from "axios";
import Cookies from "js-cookie";

const PCAJobDescriptionTemplate = ({
  position,
  employeeSignature,
  signatureDate,
}) => {
  const getPositionTitle = () => {
    switch (position) {
      case "PCA":
        return "Personal Care Assistant (PCA) Job Description";
      case "CNA":
        return "Certified Nursing Assistant (CNA) Job Description";
      case "LPN":
        return "Licensed Practical Nurse (LPN) Job Description";
      case "RN":
        return "Registered Nurse (RN) Job Description";
      default:
        return "Job Description";
    }
  };

  const getPositionContent = () => {
    switch (position) {
      case "PCA":
        return {
          summary:
            "The Personal Care Assistant (PCA) provides non-medical support services to clients in their homes, helping them with activities of daily living (ADLs) to enhance their independence, comfort, and safety. The PCA works under the supervision of a Registered Nurse or designated supervisor.",
          duties: [
            "Assist with personal hygiene including bathing, grooming, dressing, and toileting.",
            "Provide mobility support, including transferring and ambulation.",
            "Assist with meal preparation and feeding if necessary.",
            "Perform light housekeeping tasks such as laundry, dishes, and sweeping.",
            "Offer companionship and emotional support to clients.",
            "Monitor and report changes in client condition to the supervisor.",
            "Comply with infection control protocols and safety procedures.",
            "Maintain client confidentiality and respect client rights.",
            "Accurately document care and services provided each day.",
          ],
          qualifications: [
            "High school diploma or GED.",
            "Completion of a state-approved PCA training program or equivalent.",
            "Current CPR and First Aid certification.",
            "Must pass background checks and health screenings (e.g., TB test).",
            "Reliable, compassionate, and good interpersonal skills.",
          ],
          conditions:
            "PCAs work in client homes and may encounter a variety of living environments. The role requires physical effort including lifting, standing, and assisting with mobility. Flexibility in schedule and travel between clients may be required.",
          reporting:
            "The PCA reports directly to the Supervisory Nurse or designated agency supervisor.",
        };
      case "CNA":
        return {
          summary:
            "The Certified Nursing Assistant (CNA) provides basic nursing care and assistance to patients under the supervision of licensed nursing staff. CNAs help patients with daily living activities and monitor their health status.",
          duties: [
            "Assist patients with activities of daily living (ADLs).",
            "Monitor and report vital signs and changes in patient condition.",
            "Maintain a clean and safe patient environment.",
            "Help with patient hygiene and grooming.",
            "Assist with patient transfer and mobility.",
            "Communicate compassionately with patients and families.",
            "Follow all HIPAA and facility protocols.",
          ],
          qualifications: [
            "High school diploma or GED.",
            "Completion of a state-approved CNA training program.",
            "Current CPR and First Aid certification.",
            "Pass background checks and health screenings.",
          ],
          conditions:
            "CNAs work in healthcare facilities including hospitals, nursing homes, and clinics. The role requires standing for long periods and physical exertion.",
          reporting:
            "CNAs report to the charge nurse or designated supervisor.",
        };
      case "LPN":
        return {
          summary:
            "The Licensed Practical Nurse (LPN) provides basic nursing care under the supervision of a Registered Nurse or physician. LPNs work with patients to deliver direct care and support treatment plans.",
          duties: [
            "Administer medications under supervision of RN/physician.",
            "Perform wound care and dressing changes.",
            "Monitor vital signs and patient condition.",
            "Assist with patient hygiene and ADLs.",
            "Maintain accurate patient records.",
            "Educate patients on health topics.",
            "Follow all facility and regulatory protocols.",
          ],
          qualifications: [
            "Completion of an accredited LPN program.",
            "Current state LPN licensure.",
            "CPR and First Aid certification.",
            "Pass background checks and health screenings.",
          ],
          conditions:
            "LPNs work in various healthcare settings including hospitals, clinics, and patient homes. Shift work and on-call duties may be required.",
          reporting:
            "LPNs report to the Registered Nurse or facility supervisor.",
        };
      case "RN":
        return {
          summary:
            "The Registered Nurse (RN) provides comprehensive nursing care, supervises staff, and manages patient treatment plans in accordance with physician orders and facility protocols.",
          duties: [
            "Assess and plan patient care.",
            "Administer medications and treatments.",
            "Supervise LPNs and nursing assistants.",
            "Maintain comprehensive patient documentation.",
            "Communicate with physicians and care team.",
            "Educate patients and families.",
            "Follow all regulatory and facility standards.",
          ],
          qualifications: [
            "Bachelor's or Associate's degree in nursing.",
            "Current state RN licensure.",
            "CPR and First Aid certification.",
            "Pass background checks and health screenings.",
          ],
          conditions:
            "RNs work in diverse healthcare settings with potential for shift work, on-call responsibilities, and high-stress situations.",
          reporting:
            "RNs report to the nursing director or facility administrator.",
        };
      default:
        return {};
    }
  };

  const content = getPositionContent();

  return (
    <div className="p-8 bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap');
      `}</style>

      <div className="border-2 border-gray-900 p-8 space-y-6">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <img
              src="https://www.pacifichealthsystems.net/wp-content/themes/pacifichealth/images/logo.png"
              alt="Pacific Health Systems"
              className="h-24"
            />
          </div>
          <h1 className="text-center text-sm text-gray-700 font-semibold">
            {getPositionTitle()}
          </h1>
        </div>

        {/* Position Summary */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Position Summary
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {content.summary}
          </p>
        </div>

        {/* Duties and Responsibilities */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Duties and Responsibilities
          </h2>
          <p className="text-sm text-gray-800 mb-3">
            The {position} is responsible for performing the following tasks:
          </p>
          <ul className="space-y-2 ml-6">
            {content.duties &&
              content.duties.map((duty, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-800 leading-relaxed flex"
                >
                  <span className="mr-3">-</span>
                  <span>{duty}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Qualifications */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Qualifications
          </h2>
          <ul className="space-y-2 ml-6">
            {content.qualifications &&
              content.qualifications.map((qual, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-800 leading-relaxed flex"
                >
                  <span className="mr-3">-</span>
                  <span>{qual}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Working Conditions */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-blue-900 mb-3">
            Working Conditions
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {content.conditions}
          </p>
        </div>

        {/* Reporting */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-900 mb-3">Reporting</h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {content.reporting}
          </p>
        </div>

        {/* Signature Section */}
        <div className="border-t-2 border-gray-900 pt-8 mt-12">
          <div className="max-w-md">
            <div className="pb-2 mb-8">
              <p className="text-xs text-gray-800 font-medium mb-2">
                Employee Signature
              </p>
              <div className="border-b border-gray-900 pb-1 min-h-8">
                <p
                  style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontSize: "28px",
                    fontWeight: "400",
                    letterSpacing: "0.5px",
                  }}
                  className="text-gray-800"
                >
                  {employeeSignature || "____________________"}
                </p>
              </div>
            </div>
            <div className="pb-2">
              <p className="text-xs text-gray-800 font-medium mb-2">Date</p>
              <div className="border-b border-gray-900 pb-1">
                <p className="text-sm text-gray-800">
                  {signatureDate
                    ? new Date(signatureDate).toLocaleDateString()
                    : "____________________"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalCare = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [positionType, setPositionType] = useState("PCA");
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeSubmission();
    } else {
      setLoading(false);
    }
  }, [employeeId]);

  const fetchEmployeeSubmission = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        { withCredentials: true }
      );
      const applicationData = response.data?.data;
      const positionType = applicationData?.positionType || "PCA";
      setPositionType(positionType);

      // Get the appropriate form data based on position type
      const formKey = `jobDescription${positionType.toUpperCase()}`;
      const pcaFormData = applicationData?.forms?.[formKey];
      setFormData(pcaFormData);

      if (pcaFormData?.employeeUploadedForm) {
        setSubmission(pcaFormData.employeeUploadedForm);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSubmission = () => {
    if (submission) {
      window.open(`${baseURL}/${submission.filePath}`, "_blank");
    }
  };

  return (
    <Layout>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Job Description
            </h1>
            <p className="text-gray-600">
              View employee job description submissions
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93] mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {employeeId && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Employee Job Description Submission
                  </h2>

                  {formData ? (
                    <div className="space-y-6">
                      {/* Show the template with employee's signature and date */}
                      <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                        <PCAJobDescriptionTemplate
                          position={positionType}
                          employeeSignature={formData.employeeSignature}
                          signatureDate={formData.signatureDate}
                        />
                      </div>

                      {/* Submission Status */}
                      {submission && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-green-700 mb-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">
                                  Form Submitted
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Submitted on:{" "}
                                {new Date(
                                  submission.uploadedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={handleDownloadSubmission}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F3A93] text-white rounded-lg hover:bg-[#16307E] transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        </div>
                      )}

                      {/* HR Notes */}
                      <HRNotesInput
                        formType="job-description"
                        employeeId={employeeId}
                        existingNote={formData?.hrFeedback?.comment}
                        existingReviewedAt={formData?.hrFeedback?.reviewedAt}
                        onNoteSaved={fetchEmployeeSubmission}
                        showSignature={false}
                      />

                      {/* Navigation Buttons */}
                      <div className="mt-6 flex justify-center gap-4">
                        <button
                          onClick={() =>
                            navigate(`/hr/legal-disclosures/${employeeId}`)
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
                          Previous: Legal Disclosures
                        </button>
                        <button
                          onClick={() => navigate("/")}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                        >
                          Exit to Dashboard
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/hr/code-of-ethics/${employeeId}`)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                        >
                          Next: Code of Ethics
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
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        No submission from this employee yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center pt-4">
                <button
                  onClick={() =>
                    navigate("/hr/pca-job-description-submissions")
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md"
                >
                  <Eye className="w-5 h-5" />
                  View All Employee Submissions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </Layout>
  );
};

export default PersonalCare;
