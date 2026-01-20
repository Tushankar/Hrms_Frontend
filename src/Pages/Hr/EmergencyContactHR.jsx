import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, FileText } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";

const EmergencyContactHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [emergencyContactData, setEmergencyContactData] = useState(null);
  const [notes, setNotes] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);

  const baseURL =
    import.meta.env.VITE__BASEURL || "https://api.carecompapp.com";

  useEffect(() => {
    if (employeeId) {
      loadFormData();
    }
  }, [employeeId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      console.log("Loading emergency contact data for employeeId:", employeeId);

      if (employeeId) {
        const apiUrl = `${baseURL}/onboarding/get-application/${employeeId}`;
        console.log("🔗 Making request to:", apiUrl);

        const response = await axios.get(apiUrl, { withCredentials: true });

        console.log("Emergency contact API response:", response.data);

        if (response.data && response.data.data) {
          const applicationData = response.data.data.forms.emergencyContact;
          console.log("Setting emergency contact form data:", applicationData);

          // Set the emergency contact form data
          if (applicationData) {
            setEmergencyContactData(applicationData);
          }

          // Load existing HR feedback
          if (applicationData?.hrFeedback) {
            setExistingFeedback(applicationData.hrFeedback);
          }
        } else {
          console.error(
            "No emergency contact data received:",
            response.data?.message || "No data in response",
          );
          toast.error("No emergency contact data found for this user");
        }
      }
    } catch (error) {
      console.error("Error loading emergency contact data:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to load emergency contact data: ${
            error.response.data?.message || error.response.statusText
          }`,
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to load emergency contact data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotes = async () => {
    if (!notes.trim()) {
      toast.error("Please enter notes before sending");
      return;
    }

    setSending(true);
    try {
      console.log("Sending emergency contact notes:", {
        employeeId,
        formType: "emergency-contact",
        notes: notes.trim(),
        formTitle: "Emergency Contact",
        timestamp: new Date().toISOString(),
      });

      const response = await axios.post(
        `${baseURL}/onboarding/submit-notes`,
        {
          employeeId,
          formType: "EmergencyContact",
          notes: notes.trim(),
          timestamp: new Date().toISOString(),
        },
        {
          withCredentials: true,
        },
      );

      console.log("Send notes response:", response.data);

      if (response.data.message === "HR feedback submitted successfully") {
        toast.success("Notes sent successfully!");
        setNotes("");
        // Update existing feedback with the new feedback
        if (response.data.form && response.data.form.hrFeedback) {
          setExistingFeedback(response.data.form.hrFeedback);
        }
      } else {
        console.error("Failed to send notes:", response.data.message);
        toast.error(response.data.message || "Failed to send notes");
      }
    } catch (error) {
      console.error("Error sending emergency contact notes:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to send notes: ${
            error.response.data?.message || error.response.statusText
          }`,
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to send notes");
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading form data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HR Dashboard
        </button>
      </div>

      {/* Main Form Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-8">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-[#1F3A93] to-[#2748B4] px-8 md:px-12 py-12">
            <div className="relative z-10 text-center">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white tracking-wide">
                  PACIFIC HEALTH SYSTEMS
                </h1>
                <div className="w-24 h-0.5 bg-white mx-auto mt-3 opacity-80"></div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Emergency Contact Information
              </h2>
              <p className="text-blue-100 text-center max-w-2xl mx-auto text-base font-medium">
                HR Review Mode - Employee Emergency Contact Details
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2 text-center text-lg">
                **Be advised, you are required to have the full address and
                contact number for all 3 contacts
              </p>
              <p className="text-center">
                Please review complete information for all emergency contacts to
                ensure we can reach them when needed.
              </p>
            </div>
          </div>

          {/* Employee Submitted Form Data */}
          {emergencyContactData && (
            <>
              {/* Staff Information Section */}
              <div className="m-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Staff Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Staff Name
                    </label>
                    <p className="text-gray-800 font-semibold mt-1">
                      {emergencyContactData.staffName || "Not provided"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Title/Position
                    </label>
                    <p className="text-gray-800 font-semibold mt-1">
                      {emergencyContactData.title || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact 1 */}
              <div className="m-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Emergency Contact 1
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Contact Name
                    </label>
                    <p className="text-gray-800 font-semibold mt-1">
                      {emergencyContactData.employeeName1 || "Not provided"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Address
                    </label>
                    <p className="text-gray-800 font-semibold mt-1">
                      {emergencyContactData.contactAddress1 || "Not provided"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <p className="text-gray-800 font-semibold mt-1">
                      {emergencyContactData.phoneNumber1 || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact 2 */}
              {(emergencyContactData.employeeName2 ||
                emergencyContactData.contactAddress2 ||
                emergencyContactData.phoneNumber2) && (
                <div className="m-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Emergency Contact 2
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Contact Name
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {emergencyContactData.employeeName2 || "Not provided"}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Address
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {emergencyContactData.contactAddress2 || "Not provided"}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {emergencyContactData.phoneNumber2 || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact 3 */}
              {(emergencyContactData.employeeName3 ||
                emergencyContactData.contactAddress3 ||
                emergencyContactData.phoneNumber3) && (
                <div className="m-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Emergency Contact 3
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Contact Name
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {emergencyContactData.employeeName3 || "Not provided"}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Address
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {emergencyContactData.contactAddress3 || "Not provided"}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-gray-800 font-semibold mt-1">
                        {emergencyContactData.phoneNumber3 || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Status */}
              <div className="m-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Submission Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                          emergencyContactData.status === "submitted"
                            ? "bg-green-100 text-green-800"
                            : emergencyContactData.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {emergencyContactData.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Submitted Date
                    </label>
                    <p className="text-gray-800 font-semibold mt-1">
                      {emergencyContactData.createdAt
                        ? new Date(
                            emergencyContactData.createdAt,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          {!emergencyContactData && (
            <div className="m-6 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No Emergency Contact information has been submitted yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Waiting for employee to submit their emergency contact
                information
              </p>
            </div>
          )}

          {/* HR Notes Section */}
          <div className="p-6 md:p-8">
            {/* HR Notes Section */}
            <div className="bg-blue-50 px-4 sm:px-8 md:px-12 py-8 mt-10 rounded-lg border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-[#1F3A93] mb-4 flex items-center gap-2">
                <Send className="w-5 h-5" />
                HR Notes & Communication
              </h3>

              <div className="space-y-4">
                {/* Display existing HR feedback */}
                {existingFeedback && (
                  <div className="bg-white p-4 rounded-md border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Previous HR Feedback:
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {existingFeedback.comment}
                    </p>
                    <div className="text-xs text-gray-500">
                      <span>
                        Reviewed by: {existingFeedback.reviewedBy || "HR"}
                      </span>
                      {existingFeedback.reviewedAt && (
                        <span className="ml-4">
                          Date:{" "}
                          {new Date(
                            existingFeedback.reviewedAt,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Add notes or feedback for this Emergency Contact form:
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1F3A93] focus:border-[#1F3A93] resize-none"
                    placeholder="Enter your notes, feedback, or questions about this Emergency Contact form..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {notes.length}/500 characters
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSendNotes}
                    disabled={!notes.trim() || sending}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Sending..." : "Send Notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 items-center px-6 md:px-8 pb-6">
            <button
              onClick={() =>
                navigate(`/hr/non-compete-agreement/${employeeId}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous: Non-Compete Agreement
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() =>
                navigate(`/hr/employee-details-upload/${employeeId}`)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white font-semibold rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Next: Professional Certificates
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>

        {/* Toast Configuration */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "white",
              color: "#1F3A93",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "white",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "white",
              },
            },
          }}
        />
      </div>
    </Layout>
  );
};

export default EmergencyContactHR;
