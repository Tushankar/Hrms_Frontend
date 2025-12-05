import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import PropTypes from "prop-types";
import SignaturePad from "../../Components/Common/SignaturePad";
// FormInput component for read-only HR version
const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = "",
  required = false,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value || ""}
      readOnly
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed transition-colors duration-200"
    />
  </div>
);

FormInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
};

const EmploymentApplicationHR = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams(); // Changed from userId to employeeId
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    ssn: "",
    positionApplied: "",
    desiredSalary: "",
    dateAvailable: "",
    employmentType: "",
    authorizedToWork: "",
    workedForCompanyBefore: "",
    workedWhen: "",
    convictedOfFelony: "",
    felonyExplanation: "",

    // Education
    highSchool: {
      name: "",
      address: "",
      from: "",
      to: "",
      graduated: "",
      diploma: "",
    },
    college: {
      name: "",
      address: "",
      from: "",
      to: "",
      graduated: "",
      degree: "",
    },
    other: {
      name: "",
      address: "",
      from: "",
      to: "",
      graduated: "",
      degree: "",
    },

    // References
    references: [
      {
        fullName: "",
        relationship: "",
        company: "",
        phone: "",
        address: "",
      },
      {
        fullName: "",
        relationship: "",
        company: "",
        phone: "",
        address: "",
      },
      {
        fullName: "",
        relationship: "",
        company: "",
        phone: "",
        address: "",
      },
    ],

    // Previous Employment
    previousEmployments: [
      {
        company: "",
        phone: "",
        address: "",
        supervisor: "",
        jobTitle: "",
        startingSalary: "",
        endingSalary: "",
        responsibilities: "",
        from: "",
        to: "",
        reasonForLeaving: "",
        mayContactSupervisor: "",
      },
      {
        company: "",
        phone: "",
        address: "",
        supervisor: "",
        jobTitle: "",
        startingSalary: "",
        endingSalary: "",
        responsibilities: "",
        from: "",
        to: "",
        reasonForLeaving: "",
        mayContactSupervisor: "",
      },
      {
        company: "",
        phone: "",
        address: "",
        supervisor: "",
        jobTitle: "",
        startingSalary: "",
        endingSalary: "",
        responsibilities: "",
        from: "",
        to: "",
        reasonForLeaving: "",
        mayContactSupervisor: "",
      },
    ],

    // Military Service
    militaryService: {
      branch: "",
      from: "",
      to: "",
      rankAtDischarge: "",
      typeOfDischarge: "",
      otherThanHonorable: "",
      mayContactSupervisor: "",
      reasonForLeaving: "",
    },

    // Signature
    signature: "",
    date: "",
  });
  const [notes, setNotes] = useState("");
  const [existingFeedback, setExistingFeedback] = useState(null);

  const baseURL = import.meta.env.VITE__BASEURL || "http://localhost:1111";

  useEffect(() => {
    if (employeeId) {
      loadFormData();
    }
  }, [employeeId]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      console.log(
        "Loading employment application data for employeeId:",
        employeeId
      );

      if (employeeId) {
        const apiUrl = `${baseURL}/onboarding/get-application/${employeeId}`;
        console.log("🔗 Making request to:", apiUrl);

        // Fetch employment application data from backend using userId
        const response = await axios.get(apiUrl, { withCredentials: true });

        console.log("Employment application API response:", response.data);

        // Check if we have data (the API returns data directly without a success flag)
        if (response.data && response.data.data) {
          const applicationData =
            response.data.data.forms.employmentApplication;
          console.log(
            "Setting employment application form data:",
            applicationData
          );

          // Map backend data to form structure
          setFormData({
            // Personal Information
            firstName: applicationData.applicantInfo?.firstName || "",
            middleName: applicationData.applicantInfo?.middleName || "",
            lastName: applicationData.applicantInfo?.lastName || "",
            address: applicationData.applicantInfo?.address || "",
            city: applicationData.applicantInfo?.city || "",
            state: applicationData.applicantInfo?.state || "",
            zip: applicationData.applicantInfo?.zip || "",
            phone: applicationData.applicantInfo?.phone || "",
            email: applicationData.applicantInfo?.email || "",
            ssn: applicationData.applicantInfo?.ssn || "",

            // Position Details
            positionApplied:
              applicationData.applicantInfo?.positionApplied || "",
            desiredSalary: applicationData.applicantInfo?.desiredSalary || "",
            dateAvailable: applicationData.applicantInfo?.dateAvailable || "",
            employmentType: applicationData.applicantInfo?.employmentType || "",

            // Authorization & Background
            authorizedToWork:
              applicationData.applicantInfo?.authorizedToWork || "",
            workedForCompanyBefore: applicationData.applicantInfo
              ?.workedForCompanyBefore?.hasWorked
              ? "YES"
              : "NO" || "",
            workedWhen:
              applicationData.applicantInfo?.workedForCompanyBefore?.when || "",
            convictedOfFelony:
              applicationData.applicantInfo?.convictedOfFelony || "",
            felonyExplanation:
              applicationData.applicantInfo?.felonyExplanation || "",

            // Education
            highSchool: {
              name: applicationData.education?.highSchool?.name || "",
              address: applicationData.education?.highSchool?.address || "",
              from: applicationData.education?.highSchool?.from || "",
              to: applicationData.education?.highSchool?.to || "",
              graduated: applicationData.education?.highSchool?.graduated || "",
              diploma: applicationData.education?.highSchool?.diploma || "",
            },
            college: {
              name: applicationData.education?.college?.name || "",
              address: applicationData.education?.college?.address || "",
              from: applicationData.education?.college?.from || "",
              to: applicationData.education?.college?.to || "",
              graduated: applicationData.education?.college?.graduated || "",
              degree: applicationData.education?.college?.degree || "",
            },
            other: {
              name: applicationData.education?.other?.name || "",
              address: applicationData.education?.other?.address || "",
              from: applicationData.education?.other?.from || "",
              to: applicationData.education?.other?.to || "",
              graduated: applicationData.education?.other?.graduated || "",
              degree: applicationData.education?.other?.degree || "",
            },

            // References (ensure 3 references)
            references: [
              ...(applicationData.references || []),
              // Fill remaining slots with empty objects if needed
              ...Array(
                Math.max(0, 3 - (applicationData.references?.length || 0))
              ).fill({
                fullName: "",
                relationship: "",
                company: "",
                phone: "",
                address: "",
              }),
            ].slice(0, 3),

            // Previous Employments (ensure 3 employment records)
            previousEmployments: [
              ...(applicationData.employment || []),
              // Fill remaining slots with empty objects if needed
              ...Array(
                Math.max(0, 3 - (applicationData.employment?.length || 0))
              ).fill({
                company: "",
                phone: "",
                address: "",
                supervisor: "",
                jobTitle: "",
                startingSalary: "",
                endingSalary: "",
                responsibilities: "",
                from: "",
                to: "",
                reasonForLeaving: "",
                mayContactSupervisor: "",
              }),
            ].slice(0, 3),

            // Military Service
            militaryService: {
              branch: applicationData.militaryService?.branch || "",
              from: applicationData.militaryService?.from || "",
              to: applicationData.militaryService?.to || "",
              rankAtDischarge:
                applicationData.militaryService?.rankAtDischarge || "",
              typeOfDischarge:
                applicationData.militaryService?.typeOfDischarge || "",
              otherThanHonorable:
                applicationData.militaryService?.otherThanHonorable || "",
              mayContactSupervisor:
                applicationData.militaryService?.mayContactSupervisor || "",
              reasonForLeaving:
                applicationData.militaryService?.reasonForLeaving || "",
            },

            // Signature & Date
            signature: applicationData.signature || "",
            date: applicationData.date || "",
          });

          // Load existing HR feedback
          if (applicationData.hrFeedback) {
            setExistingFeedback(applicationData.hrFeedback);
          }
        } else {
          console.error(
            "No employment application data received:",
            response.data?.message || "No data in response"
          );
          toast.error("No employment application data found for this user");
        }
      }
    } catch (error) {
      console.error("Error loading employment application data:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          `Failed to load employment application data: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error("Network error: Unable to connect to server");
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to load employment application data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // This is kept for component compatibility but won't be used since fields are read-only
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendNotes = async () => {
    if (!notes.trim()) {
      toast.error("Please enter notes before sending");
      return;
    }

    setSending(true);
    try {
      console.log("Sending employment application notes:", {
        employeeId,
        formType: "employment-application",
        notes: notes.trim(),
        formTitle: "Employment Application",
        timestamp: new Date().toISOString(),
      });

      const response = await axios.post(
        `${baseURL}/onboarding/submit-notes`,
        {
          userId: employeeId,
          formType: "EmploymentApplication",
          notes: notes.trim(),
          timestamp: new Date().toISOString(),
        },
        {
          withCredentials: true,
        }
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
      console.error("Error sending employment application notes:", error);
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
        toast.error("Failed to send notes");
      }
    } finally {
      setSending(false);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
          {/* Navigation and Page Info */}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] focus:ring-2 focus:ring-[#1F3A93]/20 transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to HR Dashboard
            </button>

            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} - HR Review Mode
            </div>
          </div>

          {/* Main Form Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="bg-[#1F3A93] text-white p-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Employment Application
                    </h1>
                    <p className="text-blue-100">
                      Pacific Health Systems - HR Review
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm absolute top-6 right-6">
                  <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20 inline-flex items-center">
                    <span className="mr-2">📄</span>
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6">
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2">HR REVIEW MODE:</p>
                <p className="mb-2">
                  This form is being reviewed by HR. All fields are read-only
                  and display the information submitted by the employee.
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 md:p-8">
              {/* Page 1: Personal Information and Employment Questions */}
              {currentPage === 1 && (
                <div className="space-y-12">
                  {/* Applicant Information Section */}
                  <div>
                    <div className="bg-[#1F3A93] text-white px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                      <h3 className="font-bold text-xl">
                        Applicant Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                      <FormInput
                        label="First Name"
                        value={formData.firstName}
                        onChange={(value) =>
                          handleInputChange("firstName", value)
                        }
                        required
                      />
                      <FormInput
                        label="Middle Name"
                        value={formData.middleName}
                        onChange={(value) =>
                          handleInputChange("middleName", value)
                        }
                      />
                      <FormInput
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(value) =>
                          handleInputChange("lastName", value)
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <div className="md:col-span-2">
                        <FormInput
                          label="Address"
                          value={formData.address}
                          onChange={(value) =>
                            handleInputChange("address", value)
                          }
                        />
                      </div>
                      <FormInput
                        label="City"
                        value={formData.city}
                        onChange={(value) => handleInputChange("city", value)}
                      />
                      <FormInput
                        label="State"
                        value={formData.state}
                        onChange={(value) => handleInputChange("state", value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      <FormInput
                        label="ZIP Code"
                        value={formData.zip}
                        onChange={(value) => handleInputChange("zip", value)}
                      />
                      <FormInput
                        label="Phone"
                        value={formData.phone}
                        onChange={(value) => handleInputChange("phone", value)}
                        type="tel"
                      />
                      <FormInput
                        label="Email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        type="email"
                      />
                      <FormInput
                        label="SSN"
                        value={formData.ssn}
                        onChange={(value) => handleInputChange("ssn", value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <FormInput
                        label="Position Applied For"
                        value={formData.positionApplied}
                        onChange={(value) =>
                          handleInputChange("positionApplied", value)
                        }
                      />
                      <FormInput
                        label="Desired Salary"
                        value={formData.desiredSalary}
                        onChange={(value) =>
                          handleInputChange("desiredSalary", value)
                        }
                      />
                      <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          Date Available:
                        </label>
                        <input
                          type="date"
                          value={formData.dateAvailable || ""}
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type of Employment Desired:
                      </label>
                      <div className="flex flex-wrap gap-6">
                        <label className="flex items-center cursor-not-allowed">
                          <input
                            type="radio"
                            name="employmentType"
                            value="Full-time"
                            checked={formData.employmentType === "Full-time"}
                            readOnly
                            disabled
                            className="mr-2 cursor-not-allowed"
                          />
                          <span className="text-sm">Full-time</span>
                        </label>
                        <label className="flex items-center cursor-not-allowed">
                          <input
                            type="radio"
                            name="employmentType"
                            value="Part-time"
                            checked={formData.employmentType === "Part-time"}
                            readOnly
                            disabled
                            className="mr-2 cursor-not-allowed"
                          />
                          <span className="text-sm">Part-time</span>
                        </label>
                        <label className="flex items-center cursor-not-allowed">
                          <input
                            type="radio"
                            name="employmentType"
                            value="Temporary"
                            checked={formData.employmentType === "Temporary"}
                            readOnly
                            disabled
                            className="mr-2 cursor-not-allowed"
                          />
                          <span className="text-sm">Temporary</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Employment Questions Section */}
                  <div>
                    <div className="bg-[#1F3A93] text-white px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                      <h3 className="font-bold text-xl">
                        Employment Questions
                      </h3>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Are you authorized to work in the United States?
                        </p>
                        <div className="flex gap-6 mb-4">
                          <label className="flex items-center cursor-not-allowed">
                            <input
                              type="radio"
                              name="authorizedToWork"
                              value="YES"
                              checked={formData.authorizedToWork === "YES"}
                              readOnly
                              disabled
                              className="mr-2 cursor-not-allowed"
                            />
                            <span className="text-sm">YES</span>
                          </label>
                          <label className="flex items-center cursor-not-allowed">
                            <input
                              type="radio"
                              name="authorizedToWork"
                              value="NO"
                              checked={formData.authorizedToWork === "NO"}
                              readOnly
                              disabled
                              className="mr-2 cursor-not-allowed"
                            />
                            <span className="text-sm">NO</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Have you ever worked for this company?
                        </p>
                        <div className="flex gap-6 mb-4">
                          <label className="flex items-center cursor-not-allowed">
                            <input
                              type="radio"
                              name="workedForCompanyBefore"
                              value="YES"
                              checked={
                                formData.workedForCompanyBefore === "YES"
                              }
                              readOnly
                              disabled
                              className="mr-2 cursor-not-allowed"
                            />
                            <span className="text-sm">YES</span>
                          </label>
                          <label className="flex items-center cursor-not-allowed">
                            <input
                              type="radio"
                              name="workedForCompanyBefore"
                              value="NO"
                              checked={formData.workedForCompanyBefore === "NO"}
                              readOnly
                              disabled
                              className="mr-2 cursor-not-allowed"
                            />
                            <span className="text-sm">NO</span>
                          </label>
                        </div>
                        <FormInput
                          label="If yes, when?"
                          value={formData.workedWhen}
                          onChange={(value) =>
                            handleInputChange("workedWhen", value)
                          }
                          placeholder="Month/Year"
                          className="w-full md:w-64"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Have you ever been convicted of a felony?
                        </p>
                        <div className="flex gap-6 mb-4">
                          <label className="flex items-center cursor-not-allowed">
                            <input
                              type="radio"
                              name="convictedOfFelony"
                              value="YES"
                              checked={formData.convictedOfFelony === "YES"}
                              readOnly
                              disabled
                              className="mr-2 cursor-not-allowed"
                            />
                            <span className="text-sm">YES</span>
                          </label>
                          <label className="flex items-center cursor-not-allowed">
                            <input
                              type="radio"
                              name="convictedOfFelony"
                              value="NO"
                              checked={formData.convictedOfFelony === "NO"}
                              readOnly
                              disabled
                              className="mr-2 cursor-not-allowed"
                            />
                            <span className="text-sm">NO</span>
                          </label>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            If yes, explain:
                          </label>
                          <textarea
                            value={formData.felonyExplanation || ""}
                            readOnly
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed resize-none"
                            placeholder="Explanation..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <div className="bg-[#1F3A93] text-white px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                      <h3 className="font-bold text-xl">Education</h3>
                    </div>

                    {/* High School */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">
                        High School
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormInput
                          label="School Name"
                          value={formData.highSchool.name}
                          onChange={(value) =>
                            handleInputChange("highSchool.name", value)
                          }
                        />
                        <FormInput
                          label="Address"
                          value={formData.highSchool.address}
                          onChange={(value) =>
                            handleInputChange("highSchool.address", value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormInput
                          label="From"
                          value={formData.highSchool.from}
                          onChange={(value) =>
                            handleInputChange("highSchool.from", value)
                          }
                        />
                        <FormInput
                          label="To"
                          value={formData.highSchool.to}
                          onChange={(value) =>
                            handleInputChange("highSchool.to", value)
                          }
                        />
                        <FormInput
                          label="Graduated"
                          value={formData.highSchool.graduated}
                          onChange={(value) =>
                            handleInputChange("highSchool.graduated", value)
                          }
                        />
                        <FormInput
                          label="Diploma/Degree"
                          value={formData.highSchool.diploma}
                          onChange={(value) =>
                            handleInputChange("highSchool.diploma", value)
                          }
                        />
                      </div>
                    </div>

                    {/* College */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">
                        College
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormInput
                          label="School Name"
                          value={formData.college.name}
                          onChange={(value) =>
                            handleInputChange("college.name", value)
                          }
                        />
                        <FormInput
                          label="Address"
                          value={formData.college.address}
                          onChange={(value) =>
                            handleInputChange("college.address", value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormInput
                          label="From"
                          value={formData.college.from}
                          onChange={(value) =>
                            handleInputChange("college.from", value)
                          }
                        />
                        <FormInput
                          label="To"
                          value={formData.college.to}
                          onChange={(value) =>
                            handleInputChange("college.to", value)
                          }
                        />
                        <FormInput
                          label="Graduated"
                          value={formData.college.graduated}
                          onChange={(value) =>
                            handleInputChange("college.graduated", value)
                          }
                        />
                        <FormInput
                          label="Diploma/Degree"
                          value={formData.college.degree}
                          onChange={(value) =>
                            handleInputChange("college.degree", value)
                          }
                        />
                      </div>
                    </div>

                    {/* Other Education */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">
                        Other
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <FormInput
                          label="School Name"
                          value={formData.other.name}
                          onChange={(value) =>
                            handleInputChange("other.name", value)
                          }
                        />
                        <FormInput
                          label="Address"
                          value={formData.other.address}
                          onChange={(value) =>
                            handleInputChange("other.address", value)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormInput
                          label="From"
                          value={formData.other.from}
                          onChange={(value) =>
                            handleInputChange("other.from", value)
                          }
                        />
                        <FormInput
                          label="To"
                          value={formData.other.to}
                          onChange={(value) =>
                            handleInputChange("other.to", value)
                          }
                        />
                        <FormInput
                          label="Graduated"
                          value={formData.other.graduated}
                          onChange={(value) =>
                            handleInputChange("other.graduated", value)
                          }
                        />
                        <FormInput
                          label="Diploma/Degree"
                          value={formData.other.degree}
                          onChange={(value) =>
                            handleInputChange("other.degree", value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 2: References, Previous Employment, Military Service, Signature */}
              {currentPage === 2 && (
                <div className="space-y-12">
                  {/* References Section */}
                  <div>
                    <div className="bg-[#1F3A93] text-white px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                      <h3 className="font-bold text-xl">References</h3>
                    </div>

                    {formData.references.map((reference, index) => (
                      <div
                        key={index}
                        className="mb-8 p-4 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-semibold text-gray-800 mb-4">
                          Reference {index + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormInput
                            label="Full Name"
                            value={reference.fullName}
                            onChange={(value) =>
                              handleInputChange(
                                `references[${index}].fullName`,
                                value
                              )
                            }
                          />
                          <FormInput
                            label="Relationship"
                            value={reference.relationship}
                            onChange={(value) =>
                              handleInputChange(
                                `references[${index}].relationship`,
                                value
                              )
                            }
                          />
                          <FormInput
                            label="Company"
                            value={reference.company}
                            onChange={(value) =>
                              handleInputChange(
                                `references[${index}].company`,
                                value
                              )
                            }
                          />
                          <FormInput
                            label="Phone"
                            value={reference.phone}
                            onChange={(value) =>
                              handleInputChange(
                                `references[${index}].phone`,
                                value
                              )
                            }
                            type="tel"
                          />
                          <div className="md:col-span-2">
                            <FormInput
                              label="Address"
                              value={reference.address}
                              onChange={(value) =>
                                handleInputChange(
                                  `references[${index}].address`,
                                  value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Previous Employment Section */}
                  <div>
                    <div className="bg-[#1F3A93] text-white px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                      <h3 className="font-bold text-xl">Previous Employment</h3>
                    </div>

                    {formData.previousEmployments.map((employment, index) => (
                      <div
                        key={index}
                        className="mb-8 p-4 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-semibold text-gray-800 mb-4">
                          Employment {index + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <FormInput
                            label="Company"
                            value={employment.company}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].company`,
                                value
                              )
                            }
                          />
                          <FormInput
                            label="Phone"
                            value={employment.phone}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].phone`,
                                value
                              )
                            }
                            type="tel"
                          />
                          <div className="md:col-span-2">
                            <FormInput
                              label="Address"
                              value={employment.address}
                              onChange={(value) =>
                                handleInputChange(
                                  `previousEmployments[${index}].address`,
                                  value
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <FormInput
                            label="Supervisor"
                            value={employment.supervisor}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].supervisor`,
                                value
                              )
                            }
                          />
                          <FormInput
                            label="Job Title"
                            value={employment.jobTitle}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].jobTitle`,
                                value
                              )
                            }
                          />
                          <FormInput
                            label="Starting Salary"
                            value={employment.startingSalary}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].startingSalary`,
                                value
                              )
                            }
                          />
                          <FormInput
                            label="Ending Salary"
                            value={employment.endingSalary}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].endingSalary`,
                                value
                              )
                            }
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Responsibilities
                          </label>
                          <textarea
                            value={employment.responsibilities || ""}
                            readOnly
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed resize-none"
                            placeholder="Job responsibilities..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <FormInput
                            label="From Date"
                            value={employment.from}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].from`,
                                value
                              )
                            }
                            type="date"
                          />
                          <FormInput
                            label="To Date"
                            value={employment.to}
                            onChange={(value) =>
                              handleInputChange(
                                `previousEmployments[${index}].to`,
                                value
                              )
                            }
                            type="date"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Reason for Leaving
                          </label>
                          <textarea
                            value={employment.reasonForLeaving || ""}
                            readOnly
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed resize-none"
                            placeholder="Reason for leaving..."
                          />
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-3">
                            May we contact your previous supervisor for a
                            reference?
                          </p>
                          <div className="flex gap-6">
                            <label className="flex items-center cursor-not-allowed">
                              <input
                                type="radio"
                                name={`mayContactSupervisor${index}`}
                                value="YES"
                                checked={
                                  employment.mayContactSupervisor === "YES"
                                }
                                readOnly
                                disabled
                                className="mr-2 cursor-not-allowed"
                              />
                              <span className="text-sm">YES</span>
                            </label>
                            <label className="flex items-center cursor-not-allowed">
                              <input
                                type="radio"
                                name={`mayContactSupervisor${index}`}
                                value="NO"
                                checked={
                                  employment.mayContactSupervisor === "NO"
                                }
                                readOnly
                                disabled
                                className="mr-2 cursor-not-allowed"
                              />
                              <span className="text-sm">NO</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Military Service Section */}
                  <div>
                    <div className="bg-[#1F3A93] text-white px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                      <h3 className="font-bold text-xl">Military Service</h3>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <FormInput
                          label="Branch"
                          value={formData.militaryService.branch}
                          onChange={(value) =>
                            handleInputChange("militaryService.branch", value)
                          }
                        />
                        <FormInput
                          label="Rank at Discharge"
                          value={formData.militaryService.rankAtDischarge}
                          onChange={(value) =>
                            handleInputChange(
                              "militaryService.rankAtDischarge",
                              value
                            )
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormInput
                          label="From"
                          value={formData.militaryService.from}
                          onChange={(value) =>
                            handleInputChange("militaryService.from", value)
                          }
                          type="date"
                        />
                        <FormInput
                          label="To"
                          value={formData.militaryService.to}
                          onChange={(value) =>
                            handleInputChange("militaryService.to", value)
                          }
                          type="date"
                        />
                        <FormInput
                          label="Type of Discharge"
                          value={formData.militaryService.typeOfDischarge}
                          onChange={(value) =>
                            handleInputChange(
                              "militaryService.typeOfDischarge",
                              value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div>
                    <div className="bg-[#1F3A93] text-white px-6 py-4 mb-8 rounded-xl text-center shadow-lg">
                      <h3 className="font-bold text-xl">Signature</h3>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-6">
                      <p className="text-sm text-red-800">
                        I certify that my answers are true and complete to the
                        best of my knowledge. If this application leads to
                        employment, I understand that false or misleading
                        information in my application or interview may result in
                        my release.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* <FormInput
                        label="Digital Signature"
                        value={formData.signature}
                        onChange={(value) => handleInputChange("signature", value)}
                        required
                      /> */}
                      {/* console.log(formData.signature); */}
                      <div className="space-y-4">
                        <SignaturePad
                          // label="Employee Application Form Signature"
                          initialValue={formData.signature}
                          // onSave={(imagePath) => handleSignatureSave('employeeSignature', imagePath)}
                          // required={true}
                          width={400}
                          height={150}
                        />
                      </div>
                      <FormInput
                        label="Date"
                        value={formData.date}
                        onChange={(value) => handleInputChange("date", value)}
                        type="date"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Page Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#1F3A93] text-white hover:bg-[#16306e] shadow-md hover:shadow-lg"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#1F3A93] text-white hover:bg-[#16306e] shadow-md hover:shadow-lg"
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* HR Notes Section - Show on all pages */}
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
                              existingFeedback.reviewedAt
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
                      Add notes or feedback for this Employment Application:
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#1F3A93] focus:border-[#1F3A93] resize-none"
                      placeholder="Enter your notes, feedback, or questions about this Employment Application..."
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
      </div>
    </Layout>
  );
};

export default EmploymentApplicationHR;
