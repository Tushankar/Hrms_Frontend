import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "../../Components/Common/layout/Layout";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

const EditEmergencyContact = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [formData, setFormData] = useState({
    // Staff Information
    staffName: "",
    title: "",

    // Emergency Contact 1
    employeeName1: "",
    contactAddress1: "",
    phoneNumber1: "",

    // Emergency Contact 2
    employeeName2: "",
    contactAddress2: "",
    phoneNumber2: "",

    // Emergency Contact 3
    employeeName3: "",
    contactAddress3: "",
    phoneNumber3: "",
  });

  const baseURL = import.meta.env.VITE__BASEURL;

  // Format phone number as +1 (XXX) XXX-XXXX
  const formatPhone = (value) => {
    // Remove +1 prefix if it exists, then remove all non-digit characters
    const withoutPrefix = value.replace(/^\+1\s*/, "");
    const cleaned = withoutPrefix.replace(/\D/g, "");

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);

    // Format as +1 (XXX) XXX-XXXX
    if (limited.length === 0) {
      return "";
    } else if (limited.length <= 3) {
      return `+1 (${limited}`;
    } else if (limited.length <= 6) {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `+1 (${limited.slice(0, 3)}) ${limited.slice(
        3,
        6
      )}-${limited.slice(6)}`;
    }
  };

  useEffect(() => {
    initializeForm();
  }, [id]);

  const initializeForm = async () => {
    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      console.log("User cookie:", userCookie); // Debug log
      console.log("Session token:", sessionToken); // Debug log
      console.log("Access token:", accessToken); // Debug log

      // Use fallback user if needed
      let user;
      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error("Error parsing user cookie:", e);
        user = null;
      }

      if (!user || !user._id) {
        console.log("No user found, using test user for development");
        user = { _id: "67e0f8770c6feb6ba99d11d2" };
      }

      const token = sessionToken || accessToken;

      console.log("Final user:", user); // Debug log
      console.log("Final token:", token); // Debug log

      console.log("Loading Emergency Contact form for editing, ID:", id); // Debug log

      // Get or create onboarding application
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // If we have an ID parameter, try to load specific form data
      if (id) {
        try {
          const formResponse = await axios.get(
            `${baseURL}/onboarding/get-emergency-contact/${id}`,
            {
              headers,
              withCredentials: true,
            }
          );

          if (formResponse.data && formResponse.data.emergencyContact) {
            const emergencyData = formResponse.data.emergencyContact;
            console.log(
              "Emergency Contact form data loaded for editing:",
              emergencyData
            );
            setFormData(emergencyData);
            setApplicationId(emergencyData.applicationId);
          } else {
            toast.error("Emergency Contact form not found");
            navigate(-1);
          }
        } catch (formError) {
          console.error("Error loading Emergency Contact form:", formError);
          toast.error("Failed to load Emergency Contact form data");
          navigate(-1);
        }
      } else {
        // If no ID, get application data (fallback)
        const response = await axios.get(
          `${baseURL}/onboarding/get-application/${user._id}`,
          {
            headers,
            withCredentials: true,
          }
        );

        if (
          response.data &&
          response.data.data &&
          response.data.data.application
        ) {
          setApplicationId(response.data.data.application._id);
          console.log(
            "Application ID set:",
            response.data.data.application._id
          );

          // Load existing emergency contact data if it exists
          if (response.data.data.forms.emergencyContact) {
            setFormData(response.data.data.forms.emergencyContact);
            console.log(
              "Emergency Contact form data loaded:",
              response.data.data.forms.emergencyContact
            );
          }
        } else {
          console.error(
            "Invalid response structure in Emergency Contact form:",
            response.data
          );
          toast.error("Failed to initialize form - invalid response");
        }
      }
    } catch (error) {
      console.error("Error initializing Emergency Contact form:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    // Apply phone formatting for phone number fields
    const formattedValue = fieldName.includes("phoneNumber")
      ? formatPhone(value)
      : value;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: formattedValue,
    }));
  };

  const saveForm = async () => {
    if (saving) return; // Prevent double submission

    setSaving(true);

    try {
      const userCookie = Cookies.get("user");
      const sessionToken = Cookies.get("session");
      const accessToken = Cookies.get("accessToken");

      let user;
      try {
        user = userCookie ? JSON.parse(userCookie) : null;
      } catch (e) {
        console.error("Error parsing user cookie:", e);
        user = null;
      }

      if (!user || !user._id) {
        user = { _id: "67e0f8770c6feb6ba99d11d2" };
      }

      const token = sessionToken || accessToken;

      const payload = {
        staffName: formData.staffName || "",
        title: formData.title || "",
        employeeName1: formData.employeeName1 || "",
        contactAddress1: formData.contactAddress1 || "",
        phoneNumber1: formData.phoneNumber1 || "",
        employeeName2: formData.employeeName2 || "",
        contactAddress2: formData.contactAddress2 || "",
        phoneNumber2: formData.phoneNumber2 || "",
        employeeName3: formData.employeeName3 || "",
        contactAddress3: formData.contactAddress3 || "",
        phoneNumber3: formData.phoneNumber3 || "",
      };

      console.log("Saving Emergency Contact form with payload:", payload);

      const response = await axios.post(
        `${baseURL}/save-emergency-contact`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
        }
      );

      console.log("Save response:", response.data);
      toast.success("Emergency Contact form updated successfully!");

      // Navigate back after successful save
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error saving Emergency Contact form:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save Emergency Contact form";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Emergency Contact Form
                </h1>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
              <form className="space-y-8">
                {/* Staff Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">
                    Staff Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Staff Name
                      </label>
                      <input
                        type="text"
                        name="staffName"
                        value={formData.staffName}
                        onChange={(e) =>
                          handleInputChange("staffName", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact 1 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">
                    Emergency Contact 1
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        name="employeeName1"
                        value={formData.employeeName1}
                        onChange={(e) =>
                          handleInputChange("employeeName1", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Address
                      </label>
                      <input
                        type="text"
                        name="contactAddress1"
                        value={formData.contactAddress1}
                        onChange={(e) =>
                          handleInputChange("contactAddress1", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber1"
                        value={formData.phoneNumber1}
                        onChange={(e) =>
                          handleInputChange("phoneNumber1", e.target.value)
                        }
                        placeholder="+1 (555) 123-4567"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact 2 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">
                    Emergency Contact 2
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        name="employeeName2"
                        value={formData.employeeName2}
                        onChange={(e) =>
                          handleInputChange("employeeName2", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Address
                      </label>
                      <input
                        type="text"
                        name="contactAddress2"
                        value={formData.contactAddress2}
                        onChange={(e) =>
                          handleInputChange("contactAddress2", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber2"
                        value={formData.phoneNumber2}
                        onChange={(e) =>
                          handleInputChange("phoneNumber2", e.target.value)
                        }
                        placeholder="+1 (555) 123-4567"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact 3 */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">
                    Emergency Contact 3
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        name="employeeName3"
                        value={formData.employeeName3}
                        onChange={(e) =>
                          handleInputChange("employeeName3", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Address
                      </label>
                      <input
                        type="text"
                        name="contactAddress3"
                        value={formData.contactAddress3}
                        onChange={(e) =>
                          handleInputChange("contactAddress3", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber3"
                        value={formData.phoneNumber3}
                        onChange={(e) =>
                          handleInputChange("phoneNumber3", e.target.value)
                        }
                        placeholder="+1 (555) 123-4567"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveForm}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default EditEmergencyContact;
