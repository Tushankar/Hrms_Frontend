import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  AlertTriangle,
  Stethoscope,
  FileText,
} from "lucide-react";
import axios from "axios";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import toast, { Toaster } from "react-hot-toast";

const TBSymptomScreenHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams(); // Changed from userId to employeeId

  // Base URL configuration
  const baseURL =
    import.meta.env.VITE__BASEURL || "https://api-hrms-backend.kyptronix.us";

  // State for notes section
  const [notes, setNotes] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);

  // State for application data
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to format dates for HTML date inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dateOfBirth: "",
    lastSkinTest: "",
    testDate: "",
    results: "",
    positive: false,
    negative: false,
    chestXRayNormal: false,
    chestXRayAbnormal: false,
    treatedForLTBI: "",
    monthsLTBI: "",
    treatedForTB: "",
    monthsTB: "",
    whenTreated: "",
    whereTreated: "",
    medications: "",
    todaysDate: "",
    hasCough: "",
    coughDurationDays: "",
    coughDurationWeeks: "",
    coughDurationMonths: "",
    mucusColor: "",
    coughingUpBlood: "",
    hasNightSweats: "",
    hasFevers: "",
    lostWeight: "",
    weightLost: "",
    tiredOrWeak: "",
    tirednessDurationDays: "",
    tirednessDurationWeeks: "",
    tirednessDurationMonths: "",
    hasChestPain: "",
    chestPainDurationDays: "",
    chestPainDurationWeeks: "",
    chestPainDurationMonths: "",
    hasShortnessOfBreath: "",
    shortnessOfBreathDurationDays: "",
    shortnessOfBreathDurationWeeks: "",
    shortnessOfBreathDurationMonths: "",
    knowsSomeoneWithSymptoms: "",
    contactName: "",
    contactAddress: "",
    contactPhone: "",
    // Action taken checkboxes
    noSignOfActiveTB: false,
    chestXRayNotNeeded: false,
    discussedSignsAndSymptoms: false,
    clientKnowsToSeekCare: false,
    furtherActionNeeded: false,
    isolated: false,
    givenSurgicalMask: false,
    chestXRayNeeded: false,
    sputumSamplesNeeded: false,
    referredToDoctorClinic: false,
    otherAction: false,
    assessorSignature: "",
    clientSignature: "",
    signatureDate: "",
  });

  // Load application data on component mount
  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        setLoading(true);
        console.log(
          "Loading TB symptom screen data for employeeId:",
          employeeId
        );

        if (employeeId) {
          // First get the application to find the applicationId
          const appResponse = await axios.get(
            `${baseURL}/onboarding/get-application/${employeeId}`,
            { withCredentials: true }
          );

          console.log("Application response:", appResponse.data);

          if (appResponse.data?.data?.application) {
            const applicationId = appResponse.data.data.application._id;

            // Now fetch the TB Symptom Screen data using the applicationId
            const tbResponse = await axios.get(
              `${baseURL}/onboarding/get-tb-symptom-screen/${applicationId}`,
              { withCredentials: true }
            );

            console.log("TB Symptom Screen response:", tbResponse.data);

            if (tbResponse.data?.tbSymptomScreen) {
              const tbData = tbResponse.data.tbSymptomScreen;

              // Set application data for display
              setApplicationData({
                employeeName: tbData.basicInfo?.fullName || "N/A",
                employeeEmail: "N/A", // Will be populated if needed
                applicationId: applicationId,
              });

              // Map backend nested data to flat form structure for display
              setFormData({
                // Basic Info
                name: tbData.basicInfo?.fullName || "",
                gender: tbData.basicInfo?.sex || "",
                dateOfBirth: formatDateForInput(tbData.basicInfo?.dateOfBirth),

                // Last Skin Test
                lastSkinTest: tbData.lastSkinTest?.facilityName || "",
                testDate: formatDateForInput(tbData.lastSkinTest?.testDate),
                results: tbData.lastSkinTest?.resultMM || "",
                positive: tbData.lastSkinTest?.resultPositive || false,
                negative: tbData.lastSkinTest?.resultNegative || false,
                chestXRayNormal: tbData.lastSkinTest?.chestXrayNormal || false,
                chestXRayAbnormal:
                  tbData.lastSkinTest?.chestXrayAbnormal || false,

                // Treatment History
                treatedForLTBI: tbData.treatmentHistory?.latentTB
                  ? "yes"
                  : "no",
                monthsLTBI: tbData.treatmentHistory?.latentMonths || "",
                treatedForTB: tbData.treatmentHistory?.tbDisease ? "yes" : "no",
                monthsTB: tbData.treatmentHistory?.tbDiseaseMonths || "",
                whenTreated: tbData.treatmentHistory?.treatmentWhen || "",
                whereTreated: tbData.treatmentHistory?.treatmentWhere || "",
                medications: tbData.treatmentHistory?.medications || "",

                // Screening Date
                todaysDate: formatDateForInput(tbData.screeningDate),

                // Symptoms
                hasCough: tbData.symptoms?.cough ? "yes" : "no",
                coughDurationDays: tbData.symptoms?.coughDurationDays || "",
                coughDurationWeeks: tbData.symptoms?.coughDurationWeeks || "",
                coughDurationMonths: tbData.symptoms?.coughDurationMonths || "",
                mucusColor: tbData.symptoms?.mucusColor || "",
                coughingUpBlood: tbData.symptoms?.coughingBlood ? "yes" : "no",
                hasNightSweats: tbData.symptoms?.nightSweats ? "yes" : "no",
                hasFevers: tbData.symptoms?.fevers ? "yes" : "no",
                lostWeight: tbData.symptoms?.weightLoss ? "yes" : "no",
                weightLost: tbData.symptoms?.weightLossPounds || "",
                tiredOrWeak: tbData.symptoms?.fatigue ? "yes" : "no",
                tirednessDurationDays:
                  tbData.symptoms?.fatigueDurationDays || "",
                tirednessDurationWeeks:
                  tbData.symptoms?.fatigueDurationWeeks || "",
                tirednessDurationMonths:
                  tbData.symptoms?.fatigueDurationMonths || "",
                hasChestPain: tbData.symptoms?.chestPain ? "yes" : "no",
                chestPainDurationDays:
                  tbData.symptoms?.chestPainDurationDays || "",
                chestPainDurationWeeks:
                  tbData.symptoms?.chestPainDurationWeeks || "",
                chestPainDurationMonths:
                  tbData.symptoms?.chestPainDurationMonths || "",
                hasShortnessOfBreath: tbData.symptoms?.shortnessOfBreath
                  ? "yes"
                  : "no",
                shortnessOfBreathDurationDays:
                  tbData.symptoms?.shortnessBreathDurationDays || "",
                shortnessOfBreathDurationWeeks:
                  tbData.symptoms?.shortnessBreathDurationWeeks || "",
                shortnessOfBreathDurationMonths:
                  tbData.symptoms?.shortnessBreathDurationMonths || "",
                knowsSomeoneWithSymptoms: tbData.symptoms
                  ?.knowsSomeoneWithSymptoms
                  ? "yes"
                  : "no",
                contactName: tbData.symptoms?.contactName || "",
                contactAddress: tbData.symptoms?.contactAddress || "",
                contactPhone: tbData.symptoms?.contactPhone || "",

                // Action Taken
                noSignOfActiveTB: tbData.actionTaken?.noSignOfTB || false,
                chestXRayNotNeeded:
                  tbData.actionTaken?.chestXrayNotNeeded || false,
                discussedSignsAndSymptoms:
                  tbData.actionTaken?.discussedSigns || false,
                clientKnowsToSeekCare: tbData.actionTaken?.clientAware || false,
                furtherActionNeeded:
                  tbData.actionTaken?.furtherActionNeeded || false,
                isolated: tbData.actionTaken?.isolated || false,
                givenSurgicalMask: tbData.actionTaken?.givenMask || false,
                chestXRayNeeded: tbData.actionTaken?.chestXrayNeeded || false,
                sputumSamplesNeeded:
                  tbData.actionTaken?.sputumSamplesNeeded || false,
                referredToDoctorClinic: tbData.actionTaken?.referredToDoctor
                  ? true
                  : false,
                otherAction: tbData.actionTaken?.other ? true : false,

                // Signatures
                assessorSignature: tbData.screenerSignature || "",
                clientSignature: tbData.clientSignature || "",
                signatureDate: formatDateForInput(tbData.clientSignatureDate),
              });

              // Load existing HR feedback
              if (tbData.hrFeedback && tbData.hrFeedback.length > 0) {
                setExistingFeedback(tbData.hrFeedback);
              }
            } else {
              console.error("No TB symptom screen data received");
              toast.error("No TB symptom screen data found for this employee");
              setApplicationData({
                employeeName: "No data found",
                employeeEmail: "No data found",
                applicationId: employeeId,
              });
            }
          } else {
            console.error("No application data received");
            toast.error("No application found for this employee");
            setApplicationData({
              employeeName: "No application found",
              employeeEmail: "No application found",
              applicationId: employeeId,
            });
          }
        }
      } catch (error) {
        console.error("Error loading TB symptom screen data:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          toast.error(
            `Failed to load TB symptom screen data: ${
              error.response.data?.message || error.response.statusText
            }`
          );
        } else if (error.request) {
          console.error("Network error:", error.request);
          toast.error("Network error: Unable to connect to server");
        } else {
          console.error("Error:", error.message);
          toast.error("Failed to load TB symptom screen data");
        }
        setApplicationData({
          employeeName: "Error loading data",
          employeeEmail: "Error loading data",
          applicationId: userId,
        });
      } finally {
        setLoading(false);
      }
    };

    loadApplicationData();
  }, [employeeId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendNotes = async () => {
    if (!notes.trim()) {
      toast.error("Please enter some notes before sending.");
      return;
    }

    try {
      console.log(
        "Sending TB symptom screen notes for employeeId:",
        employeeId
      );

      const apiUrl = `${baseURL}/onboarding/submit-notes`;
      console.log("🔗 Making notes request to:", apiUrl);

      const payload = {
        userId: employeeId,
        notes: notes.trim(),
        formType: "TBSymptomScreen",
        timestamp: new Date().toISOString(),
        clientSignature: clientSignature || undefined,
      };

      console.log("📝 Notes payload:", payload);

      // Send notes to backend
      const response = await axios.post(apiUrl, payload, {
        withCredentials: true,
      });

      console.log("Notes submission response:", response.data);

      if (
        response.data &&
        response.data.message === "HR feedback submitted successfully"
      ) {
        toast.success("Notes sent successfully!");
        setNotes("");
        // Keep signature after send so it's visible; optionally clear it
        // setClientSignature("");
        // Update existing feedback with the new feedback
        if (response.data.form && response.data.form.hrFeedback) {
          setExistingFeedback(response.data.form.hrFeedback);
        }
      } else {
        console.error(
          "Notes submission failed:",
          response.data?.message || "Unknown error"
        );
        toast.error(
          `Failed to send notes: ${response.data?.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error sending notes:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to send notes: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to send notes. Please try again.");
      }
    }
  };

  return (
    <Layout>
      <Navbar />
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFF] to-[#F0F5FF] p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base font-medium w-auto"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back</span>
              <span className="xs:hidden">Back</span>
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F3A93]"></div>
                <span className="ml-3 text-gray-600">
                  Loading application data...
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1F3A93] to-[#2748B4] text-white text-center py-6 sm:py-8 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4">
                  <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-0 sm:mr-3" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-center">
                    Tuberculosis (TB) Symptom Screen
                  </h2>
                  <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 mt-2 sm:mt-0 sm:ml-3 hidden sm:block" />
                </div>
                <p className="text-blue-100 text-sm sm:text-base">
                  HR Review - Health Assessment & Screening Form
                </p>
                {employeeId && (
                  <p className="text-sm sm:text-base opacity-90 mt-1">
                    User ID: {employeeId}
                  </p>
                )}
              </div>

              <div className="p-4 sm:p-6 md:p-8 lg:p-12 space-y-6 sm:space-y-8">
                {/* TB Symptom Screen Form - Same UI as Employee Form */}
                <div
                  className="max-w-6xl mx-auto p-6 bg-white text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="bg-gray-300 text-center py-3 mb-4">
                    <h1 className="text-xl font-bold">
                      Tuberculosis (TB) Symptom Screen
                    </h1>
                  </div>

                  {/* Basic Information Section */}
                  <div className="mb-3">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1">
                        <span>Name: </span>
                        <input
                          type="text"
                          className="border-b border-black w-3/4 outline-none bg-transparent"
                          value={formData.name}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>M</span>
                        <input
                          type="radio"
                          name="gender"
                          className="border border-black w-4 h-4"
                          checked={formData.gender === "M"}
                          disabled
                        />
                        <span>F</span>
                        <input
                          type="radio"
                          name="gender"
                          className="border border-black w-4 h-4"
                          checked={formData.gender === "F"}
                          disabled
                        />
                      </div>
                      <div className="flex-1">
                        <span>Date of Birth: </span>
                        <input
                          type="text"
                          className="border-b border-black w-1/2 outline-none bg-transparent"
                          value={formData.dateOfBirth}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <div>
                        <span>Last skin test: </span>
                        <input
                          type="text"
                          className="border-b border-black w-5/6 outline-none bg-transparent"
                          value={formData.lastSkinTest}
                          readOnly
                        />
                      </div>
                      <div className="text-xs ml-24 -mt-1">
                        (Name, address, city, state, zip, and phone number of
                        place where test was given)
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span>Test Date:</span>
                        <input
                          type="text"
                          className="border-b border-black w-20 outline-none bg-transparent"
                          value={formData.testDate}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Results</span>
                        <input
                          type="text"
                          className="border-b border-black w-12 outline-none bg-transparent"
                          value={formData.results}
                          readOnly
                        />
                        <span>mm</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Positive</span>
                        <input
                          type="checkbox"
                          className="border border-black w-4 h-4"
                          checked={formData.positive}
                          disabled
                        />
                        <span>Negative</span>
                        <input
                          type="checkbox"
                          className="border border-black w-4 h-4"
                          checked={formData.negative}
                          disabled
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Chest X-Ray: Normal</span>
                        <input
                          type="checkbox"
                          className="border border-black w-4 h-4"
                          checked={formData.chestXRayNormal}
                          disabled
                        />
                        <span>Abnormal</span>
                        <input
                          type="checkbox"
                          className="border border-black w-4 h-4"
                          checked={formData.chestXRayAbnormal}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="mb-3 text-xs leading-relaxed">
                      <span>
                        Were you treated for:{" "}
                        <strong>Latent TB infection (LTBI)?</strong> Yes{" "}
                      </span>
                      <input
                        type="radio"
                        name="treatedLTBI"
                        className="border border-black w-3 h-3 mx-1"
                        checked={formData.treatedForLTBI === "yes"}
                        disabled
                      />
                      <span> No </span>
                      <input
                        type="radio"
                        name="treatedLTBI"
                        className="border border-black w-3 h-3 mx-1"
                        checked={formData.treatedForLTBI === "no"}
                        disabled
                      />
                      <span> #Months </span>
                      <input
                        type="text"
                        className="border-b border-black w-12 outline-none bg-transparent mx-1"
                        value={formData.monthsLTBI}
                        readOnly
                      />
                      <span>
                        {" "}
                        <strong>TB Disease?</strong> Yes{" "}
                      </span>
                      <input
                        type="radio"
                        name="treatedTB"
                        className="border border-black w-3 h-3 mx-1"
                        checked={formData.treatedForTB === "yes"}
                        disabled
                      />
                      <span> No </span>
                      <input
                        type="radio"
                        name="treatedTB"
                        className="border border-black w-3 h-3 mx-1"
                        checked={formData.treatedForTB === "no"}
                        disabled
                      />
                      <span> #Months </span>
                      <input
                        type="text"
                        className="border-b border-black w-12 outline-none bg-transparent mx-1"
                        value={formData.monthsTB}
                        readOnly
                      />
                    </div>

                    <div className="mb-3">
                      <span>
                        If yes, <strong>When?</strong>{" "}
                      </span>
                      <input
                        type="text"
                        className="border-b border-black w-32 outline-none bg-transparent"
                        value={formData.whenTreated}
                        readOnly
                      />
                      <span className="ml-8">
                        <strong>Where?</strong>{" "}
                      </span>
                      <input
                        type="text"
                        className="border-b border-black w-96 outline-none bg-transparent"
                        value={formData.whereTreated}
                        readOnly
                      />
                    </div>

                    <div className="mb-3">
                      <span>Name of Medications: </span>
                      <input
                        type="text"
                        className="border-b border-black w-5/6 outline-none bg-transparent"
                        value={formData.medications}
                        readOnly
                      />
                    </div>

                    <div className="bg-gray-300 py-2 px-3 mb-4">
                      <span className="font-bold">Today's Date </span>
                      <input
                        type="text"
                        className="border-b border-black w-48 outline-none bg-transparent ml-2"
                        value={formData.todaysDate}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Symptoms Section */}
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">Do you have a cough?</div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="cough"
                            className="border border-black w-4 h-4"
                            checked={formData.hasCough === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="cough"
                            className="border border-black w-4 h-4"
                            checked={formData.hasCough === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="pl-6">
                        If yes, how long have you had it?
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span># Days</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.coughDurationDays}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Weeks</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.coughDurationWeeks}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Months</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.coughDurationMonths}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="pl-6 flex items-center gap-2">
                        <span>What color is the mucus?</span>
                        <input
                          type="text"
                          className="border-b border-black w-28 outline-none bg-transparent"
                          value={formData.mucusColor}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span>Are you coughing up blood?</span>
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="coughingBlood"
                            className="border border-black w-4 h-4"
                            checked={formData.coughingUpBlood === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="coughingBlood"
                            className="border border-black w-4 h-4"
                            checked={formData.coughingUpBlood === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">Do you have night sweats?</div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="nightSweats"
                            className="border border-black w-4 h-4"
                            checked={formData.hasNightSweats === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="nightSweats"
                            className="border border-black w-4 h-4"
                            checked={formData.hasNightSweats === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">Do you have fevers?</div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="fevers"
                            className="border border-black w-4 h-4"
                            checked={formData.hasFevers === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="fevers"
                            className="border border-black w-4 h-4"
                            checked={formData.hasFevers === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        Have you lost weight without trying?
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="weightLoss"
                            className="border border-black w-4 h-4"
                            checked={formData.lostWeight === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="weightLoss"
                            className="border border-black w-4 h-4"
                            checked={formData.lostWeight === "no"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Pounds</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.weightLost}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">Have you been tired or weak?</div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="tiredness"
                            className="border border-black w-4 h-4"
                            checked={formData.tiredOrWeak === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="tiredness"
                            className="border border-black w-4 h-4"
                            checked={formData.tiredOrWeak === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="pl-6">
                        If yes, how long has it lasted?
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span># Days</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.tirednessDurationDays}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Weeks</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.tirednessDurationWeeks}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Months</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.tirednessDurationMonths}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">Do you have chest pain?</div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="chestPain"
                            className="border border-black w-4 h-4"
                            checked={formData.hasChestPain === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="chestPain"
                            className="border border-black w-4 h-4"
                            checked={formData.hasChestPain === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="pl-6">
                        If yes, how long has it lasted?
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span># Days</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.chestPainDurationDays}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Weeks</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.chestPainDurationWeeks}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Months</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.chestPainDurationMonths}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        Do you have shortness of breath?
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="shortnessOfBreath"
                            className="border border-black w-4 h-4"
                            checked={formData.hasShortnessOfBreath === "yes"}
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="shortnessOfBreath"
                            className="border border-black w-4 h-4"
                            checked={formData.hasShortnessOfBreath === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="pl-6">
                        If yes, how long has it lasted?
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span># Days</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.shortnessOfBreathDurationDays}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Weeks</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.shortnessOfBreathDurationWeeks}
                            readOnly
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span># Months</span>
                          <input
                            type="text"
                            className="border-b border-black w-12 outline-none bg-transparent"
                            value={formData.shortnessOfBreathDurationMonths}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        Do you know anyone who has these symptoms?
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-1">
                          <span>Yes</span>
                          <input
                            type="radio"
                            name="knowsSomeone"
                            className="border border-black w-4 h-4"
                            checked={
                              formData.knowsSomeoneWithSymptoms === "yes"
                            }
                            disabled
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span>No</span>
                          <input
                            type="radio"
                            name="knowsSomeone"
                            className="border border-black w-4 h-4"
                            checked={formData.knowsSomeoneWithSymptoms === "no"}
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <input
                          type="text"
                          className="border-b border-black w-40 outline-none bg-transparent"
                          value={formData.contactName}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Address</span>
                        <input
                          type="text"
                          className="border-b border-black w-80 outline-none bg-transparent"
                          value={formData.contactAddress}
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={formData.contactPhone}
                          className="w-full h-8 px-2 border rounded border-gray-300 bg-white text-gray-900 text-sm"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Taken Section */}
                  <div className="bg-gray-300 py-2 px-3 mb-2">
                    <span className="font-bold">Action Taken</span>
                    <span className="text-xs ml-1">(check all that apply)</span>
                  </div>

                  <table className="w-full border border-black text-xs mb-4">
                    <tbody>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-4 border-r border-black">
                          No sign of active TB at this time
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.noSignOfActiveTB}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-4 border-r border-black">
                          Chest X-ray not needed at this time
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.chestXRayNotNeeded}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-4 border-r border-black">
                          Discussed signs and symptoms of TB with client
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.discussedSignsAndSymptoms}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-4 border-r border-black">
                          Client knows to seek health care if symptoms of TB
                          appear
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.clientKnowsToSeekCare}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-4 border-r border-black">
                          Further action needed
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.furtherActionNeeded}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-16 border-r border-black">
                          • Isolated
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.isolated}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-16 border-r border-black">
                          • Given surgical mask
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.givenSurgicalMask}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-16 border-r border-black">
                          • Chest X-Ray is needed
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.chestXRayNeeded}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-16 border-r border-black">
                          • Sputum samples are needed
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.sputumSamplesNeeded}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr className="border-b border-black">
                        <td className="p-2 pl-16 border-r border-black">
                          • Referred to Doctor / Clinic (Specify):
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.referredToDoctorClinic}
                            disabled
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 pl-16 border-r border-black">
                          • Other (Specify):
                        </td>
                        <td className="p-2 w-12">
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.otherAction}
                            disabled
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Signature Section */}
                  <div className="space-y-4 mb-4 mt-6">
                    <div>
                      <label className="block text-xs font-semibold mb-2">
                        Signature of Person Making the Assessment
                      </label>
                      <input
                        type="text"
                        className="border-b-2 border-black w-full outline-none bg-transparent pb-1"
                        value={formData.assessorSignature}
                        readOnly
                        style={{
                          fontFamily: "'Great Vibes', cursive",
                          fontSize: "28px",
                          letterSpacing: "0.5px",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-xs font-semibold mb-2">
                          Signature of Client
                        </label>
                        <input
                          type="text"
                          className="border-b-2 border-black w-full outline-none bg-transparent pb-1"
                          value={formData.clientSignature}
                          readOnly
                          style={{
                            fontFamily: "'Great Vibes', cursive",
                            fontSize: "28px",
                            letterSpacing: "0.5px",
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-2">
                          Date
                        </label>
                        <input
                          type="text"
                          className="border-b-2 border-black w-full outline-none bg-transparent pb-1"
                          value={formData.signatureDate}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between text-xs text-gray-600 mt-6">
                    <span>GA DPH TB Unit</span>
                    <span>Rev. 12/2011</span>
                  </div>
                </div>

                {/* Existing HR Feedback Display */}
                {existingFeedback && existingFeedback.length > 0 && (
                  <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-green-600" />
                      Previous HR Feedback
                    </h3>
                    <div className="space-y-4">
                      {existingFeedback.map((feedback, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-md border border-green-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              {new Date(feedback.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              #{existingFeedback.length - index}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {feedback.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HR Notes Section */}
                <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    HR Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes about this TB symptom screen review..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1F3A93] focus:border-[#1F3A93] resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-gray-500">
                      {notes.length}/500 characters
                    </span>
                    <button
                      onClick={handleSendNotes}
                      disabled={!notes.trim()}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        notes.trim()
                          ? "bg-[#1F3A93] text-white hover:bg-[#1A3280] focus:ring-2 focus:ring-[#1F3A93]/20 shadow-sm hover:shadow-md"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      Send Notes
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-500">
                    © 2025 Pacific Health Systems - Private Homecare Services.
                    All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toaster for notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10B981",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "#EF4444",
              color: "#fff",
            },
          },
        }}
      />
    </Layout>
  );
};

export default TBSymptomScreenHR;
