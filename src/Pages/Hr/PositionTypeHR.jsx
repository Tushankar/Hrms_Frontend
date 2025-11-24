import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import Navbar from "../../Components/Common/Navbar/Navbar";
import {
  ArrowLeft,
  Briefcase,
  RotateCcw,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

const PositionTypeHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [hrNotes, setHrNotes] = useState("");
  const [submittingNotes, setSubmittingNotes] = useState(false);
  const baseURL = import.meta.env.VITE__BASEURL;

  useEffect(() => {
    fetchFormData();
  }, [employeeId]);

  const fetchFormData = async () => {
    try {
      const token = Cookies.get("session");
      const response = await axios.get(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data?.data?.forms?.positionType) {
        setFormData(response.data.data.forms.positionType);
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNotes = async (status) => {
    if (!hrNotes.trim()) {
      toast.error("Please enter feedback before submitting");
      return;
    }

    setSubmittingNotes(true);
    try {
      const token = Cookies.get("session");
      await axios.post(
        `${baseURL}/onboarding/submit-notes`,
        {
          employeeId,
          notes: hrNotes,
          formType: "PositionType",
          status,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(
        `Feedback submitted and form ${
          status === "approved" ? "approved" : "rejected"
        }`
      );
      setHrNotes("");
      fetchFormData();
    } catch (error) {
      console.error("Error submitting notes:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingNotes(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RotateCcw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading Position Type Form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <Navbar />
        <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-[#1F3A93] to-[#2748B4] rounded-lg hover:from-[#16306e] hover:to-[#1F3A93] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-[#1F3A93] text-white p-6">
                <div className="flex items-center justify-center gap-3">
                  <Briefcase className="w-8 h-8" />
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      POSITION TYPE - HR REVIEW
                    </h1>
                    <p className="text-blue-100"></p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Form Status:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        formData?.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : formData?.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : formData?.status === "under_review"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formData?.status?.toUpperCase() || "DRAFT"}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Applied For
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900">
                      {formData?.positionAppliedFor || "Not provided"}
                    </p>
                  </div>
                </div>

                {formData?.hrFeedback && (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Previous HR Feedback:
                    </h3>
                    <p className="text-gray-700">
                      {formData.hrFeedback.comment}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on:{" "}
                      {new Date(
                        formData.hrFeedback.reviewedAt
                      ).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    HR Feedback
                  </h3>
                  <textarea
                    value={hrNotes}
                    onChange={(e) => setHrNotes(e.target.value)}
                    placeholder="Enter your feedback or comments here..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                  <button
                    onClick={() => handleSubmitNotes("rejected")}
                    disabled={submittingNotes || !hrNotes.trim()}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-2 px-5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleSubmitNotes("approved")}
                    disabled={submittingNotes || !hrNotes.trim()}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-2 px-5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {submittingNotes ? (
                      <RotateCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {submittingNotes ? "Submitting..." : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PositionTypeHR;
