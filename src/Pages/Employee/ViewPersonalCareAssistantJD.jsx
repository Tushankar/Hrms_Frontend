import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import axios from "axios";

const ViewPersonalCareAssistantJD = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobDescription = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://api-hrms-backend.kyptronix.us/onboarding/get-job-description/${taskId}/PCA`,
          { withCredentials: true }
        );

        if (response.data && response.data.data) {
          setFormData(response.data.data);
        } else {
          toast.error("Job description not found");
        }
      } catch (error) {
        console.error("Error loading job description:", error);
        toast.error("Failed to load job description");
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      loadJobDescription();
    }
  }, [taskId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading job description...</p>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </Layout>
    );
  }

  if (!formData) {
    return (
      <Layout>
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Job Description Not Found
                </h2>
                <p className="text-gray-600 mb-4">
                  The requested job description could not be loaded.
                </p>
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
        <Toaster />
      </Layout>
    );
  }

  return (
    <Layout>
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-blue-500" />
                    Personal Care Assistant Job Description
                  </h1>
                  <p className="text-gray-600 mt-1">View Mode - Read Only</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {formData.status === "completed" ? (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    <XCircle className="w-4 h-4 mr-1" />
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Employee Information */}
          {formData.employeeInfo && (
            <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Employee Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {formData.employeeInfo.name || "Not provided"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {formData.employeeInfo.employeeId || "Not provided"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {formData.employeeInfo.position ||
                      "Personal Care Assistant"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {formData.employeeInfo.startDate
                      ? new Date(
                          formData.employeeInfo.startDate
                        ).toLocaleDateString()
                      : "Not provided"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Description Acknowledgment */}
          <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Job Description Acknowledgment
            </h2>

            {/* Key Responsibilities */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Key Responsibilities & Acknowledgment
              </h3>
              <div className="space-y-3">
                {[
                  "Assist clients with personal care activities including bathing, grooming, and dressing",
                  "Provide mobility assistance and support with transfers",
                  "Assist with medication reminders as directed by healthcare professionals",
                  "Prepare meals and assist with feeding when necessary",
                  "Maintain a safe, clean, and comfortable environment for clients",
                  "Document care provided and report changes in client condition",
                  "Follow all company policies, procedures, and safety protocols",
                  "Maintain client confidentiality and dignity at all times",
                ].map((responsibility, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {formData.acknowledgment &&
                    formData.acknowledgment[`responsibility${index + 1}`] ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-gray-700 text-sm">{responsibility}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Required Qualifications & Acknowledgment
              </h3>
              <div className="space-y-3">
                {[
                  "High school diploma or equivalent",
                  "Personal Care Assistant certification or willingness to obtain",
                  "CPR and First Aid certification (or willingness to obtain within 90 days)",
                  "Ability to lift up to 50 pounds and assist with client mobility",
                  "Excellent communication and interpersonal skills",
                  "Reliable transportation and valid driver's license",
                  "Ability to pass background check and drug screening",
                  "Compassionate and patient demeanor",
                ].map((qualification, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {formData.acknowledgment &&
                    formData.acknowledgment[`qualification${index + 1}`] ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-gray-700 text-sm">{qualification}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Acknowledgment */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Final Acknowledgment
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 border-l-4 border-blue-500">
                  {formData.acknowledgment &&
                  formData.acknowledgment.finalAcknowledgment ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-gray-800 font-medium">
                      I acknowledge that I have received, read, and understand
                      this job description.
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      I understand that this job description is not an
                      employment contract and that my employment is at-will.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Signatures
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Employee Signature */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Employee Signature
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Signature
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg border min-h-[60px] italic text-lg">
                      {formData.staffSignature?.signature || "Not signed"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      {formData.staffSignature?.date
                        ? new Date(
                            formData.staffSignature.date
                          ).toLocaleDateString()
                        : "Not provided"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Supervisor Signature */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Supervisor Signature
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Signature
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg border min-h-[60px] italic text-lg">
                      {formData.supervisorSignature?.signature || "Not signed"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border flex items-center">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      {formData.supervisorSignature?.date
                        ? new Date(
                            formData.supervisorSignature.date
                          ).toLocaleDateString()
                        : "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {formData.status === "completed" ? "Completed" : "Draft"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {formData.createdAt
                      ? new Date(formData.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {formData.updatedAt
                      ? new Date(formData.updatedAt).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </Layout>
  );
};

export default ViewPersonalCareAssistantJD;
