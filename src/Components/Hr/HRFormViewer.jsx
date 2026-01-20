import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { Avatar } from "@mui/material";

const HRFormViewer = ({
  formType,
  formTitle,
  formDescription,
  apiEndpoint,
  children,
  showActions = true,
  additionalInfo = null,
}) => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch application and form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get application details
        const appResponse = await axios.get(
          `https://api.carecompapp.com/onboarding/get-all-applications`,
          {
            withCredentials: true,
          },
        );

        if (appResponse.data?.applications) {
          const foundApp = appResponse.data.applications.find(
            (app) => app._id === applicationId,
          );

          if (foundApp) {
            setApplication(foundApp);

            // Get specific form data
            const formResponse = await axios.get(
              `https://api.carecompapp.com/onboarding/${apiEndpoint}/${applicationId}`,
              {
                withCredentials: true,
              },
            );

            if (formResponse.data) {
              setFormData(formResponse.data[formType] || formResponse.data);
            }
          } else {
            toast.error("Application not found");
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 404) {
          toast.error("Form data not found");
        } else {
          toast.error("Failed to load form data");
        }
        navigate(`/hr/application-review/${applicationId}`);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchData();
    }
  }, [applicationId, apiEndpoint, formType, navigate]);

  const handleGoBack = () => {
    navigate(`/hr/application-review/${applicationId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading form data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!application || !formData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Form data not found</p>
              <button
                onClick={handleGoBack}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Application
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGoBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex items-center gap-4">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                    }}
                  >
                    {application.employeeId.userName.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {formTitle}
                    </h1>
                    <p className="text-gray-600">{formDescription}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Employee: {application.employeeId.userName} •{" "}
                      {application.employeeId.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.status === "submitted"
                        ? "bg-green-100 text-green-800"
                        : formData.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {formData.status === "submitted"
                      ? "Completed"
                      : formData.status === "draft"
                        ? "In Progress"
                        : "Not Started"}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  {formData.updatedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Updated:{" "}
                      {new Date(formData.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        {additionalInfo && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {additionalInfo}
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Form Details
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">HR Review Mode</span>
                </div>
              </div>

              {/* Form content passed as children */}
              <div className="space-y-6">
                {typeof children === "function"
                  ? children({ formData, application })
                  : children}
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleGoBack}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                ← Back to Application Overview
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  This form is in <strong>read-only</strong> mode for HR review
                </span>

                {formData.status === "submitted" && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HRFormViewer;
