import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/layout/Layout";
import { ArrowLeft } from "lucide-react";
import HRNotesInput from "../../Components/Common/HRNotesInput/HRNotesInput";
import PropTypes from "prop-types";

// FormInput component
const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  placeholder = "",
  required = false,
  disabled = false,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
      required={required}
      disabled={disabled}
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
  disabled: PropTypes.bool,
};

// FormSelect component
const FormSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
  required = false,
  disabled = false,
  showPlaceholder = true,
}) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 max-h-48 overflow-y-auto"
      required={required}
      disabled={disabled}
    >
      {showPlaceholder && <option value="">Select...</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

FormSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  className: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  showPlaceholder: PropTypes.bool,
};

const formatDateForInput = (isoDate) => {
  if (!isoDate) return "";
  return isoDate.split("T")[0];
};

// Format SSN as 000-00-0000
const formatSSN = (value) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, "");

  // Limit to 9 digits
  const limited = cleaned.slice(0, 9);

  // Format as XXX-XX-XXXX
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`;
  }
};

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
    return `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(
      6
    )}`;
  }
};

// Format Government ID based on type
const formatGovernmentId = (value, idType) => {
  if (!idType) return value;

  // Remove all non-alphanumeric characters and convert to uppercase
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (idType === "Passport") {
    // Passport format: typically 9 characters (1 letter + 8 digits)
    const limited = cleaned.slice(0, 9);

    // If it starts with a letter followed by digits, format accordingly
    if (limited.length > 1 && /^[A-Z]/.test(limited)) {
      const letter = limited[0];
      const numbers = limited.slice(1).replace(/[^0-9]/g, "");
      return letter + numbers.slice(0, 8);
    }

    return limited;
  } else if (idType === "Driver's License" || idType === "State ID") {
    // Driver's License/State ID: alphanumeric, typically 1-12 characters
    // Many states use formats like: 123456789 (9 digits) or A1234567 (1 letter + 7 digits)
    const limited = cleaned.slice(0, 12);

    // Common formats: if it looks like it should have a letter prefix
    if (limited.length > 1 && /^\d/.test(limited) && limited.length >= 8) {
      // Pure numeric - format as groups if long enough
      if (limited.length === 9) {
        return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(
          6
        )}`;
      } else if (limited.length === 8) {
        return `${limited.slice(0, 2)}-${limited.slice(2, 5)}-${limited.slice(
          5
        )}`;
      }
    } else if (limited.length > 1 && /^[A-Z]\d/.test(limited)) {
      // Letter followed by digits - common format
      const letter = limited[0];
      const numbers = limited.slice(1).replace(/[^0-9]/g, "");
      if (numbers.length >= 7) {
        return `${letter}${numbers.slice(0, 3)}-${numbers.slice(
          3,
          6
        )}-${numbers.slice(6, 9)}`;
      } else if (numbers.length >= 6) {
        return `${letter}${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      }
    }

    return limited;
  }

  return cleaned.slice(0, 20); // Default max length
};

const PersonalInformationHR = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchData();
    fetchCountries();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      const baseURL = import.meta.env.VITE__BASEURL;
      const response = await fetch(
        `${baseURL}/onboarding/get-application/${employeeId}`,
        {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.ok) {
        const result = await response.json();
        const formData = result.data?.forms?.personalInformation;
        setData(formData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries"
      );
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const countryList = result.data.map((country) => ({
            value: country.country,
            label: country.country,
          }));

          // Sort countries with United States first, then alphabetically
          const sortedCountries = countryList.sort((a, b) => {
            if (a.value === "United States") return -1;
            if (b.value === "United States") return 1;
            return a.label.localeCompare(b.label);
          });

          setCountries(sortedCountries);
        }
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      // Fallback to some common countries if API fails
      setCountries([
        { value: "United States", label: "United States" },
        { value: "Canada", label: "Canada" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "Australia", label: "Australia" },
        { value: "India", label: "India" },
      ]);
    }
  };

  // Fetch states based on selected country
  const fetchStates = async (countryName) => {
    if (!countryName) {
      setStates([]);
      return;
    }

    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.states) {
          const stateList = result.data.states.map((state) => ({
            value: state.name,
            label: state.name,
          }));
          setStates(stateList);
        } else {
          setStates([]);
        }
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    }
  };

  // Fetch cities based on selected country and state
  const fetchCities = async (countryName, stateName) => {
    if (!countryName || !stateName) {
      setCities([]);
      return;
    }

    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName, state: stateName }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const cityList = result.data.map((city) => ({
            value: city,
            label: city,
          }));
          setCities(cityList);
        } else {
          setCities([]);
        }
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  useEffect(() => {
    if (data?.country) {
      fetchStates(data.country).then(() => {
        if (data.state) {
          fetchCities(data.country, data.state);
        }
      });
    }
  }, [data]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-[#1F3A93] text-white p-4 md:p-6">
            <div className="text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                <div className="w-6 h-6 md:w-8 md:h-8 mb-2 sm:mb-0 sm:mr-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">👤</span>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    Applicant Information
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base"></p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 md:p-6 lg:p-8">
            {/* Full Name Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                Full Name
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <FormInput
                  label="Last Name"
                  value={data?.lastName || ""}
                  onChange={() => {}}
                  disabled={true}
                />
                <FormInput
                  label="First Name"
                  value={data?.firstName || ""}
                  onChange={() => {}}
                  disabled={true}
                />
                <FormInput
                  label="Middle Initial"
                  value={data?.middleInitial || ""}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="mb-6 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormInput
                  label="Date of Birth"
                  value={formatDateForInput(data?.date) || ""}
                  onChange={() => {}}
                  type="date"
                  disabled={true}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormSelect
                  label="Country"
                  value={data?.country || ""}
                  onChange={() => {}}
                  options={countries}
                  disabled={true}
                  showPlaceholder={false}
                />
                <FormSelect
                  label="State"
                  value={data?.state || ""}
                  onChange={() => {}}
                  options={states}
                  disabled={true}
                  showPlaceholder={false}
                />
                <FormSelect
                  label="City"
                  value={data?.city || ""}
                  onChange={() => {}}
                  options={cities}
                  disabled={true}
                  showPlaceholder={false}
                />
                <FormInput
                  label="Street Address"
                  value={data?.streetAddress || ""}
                  onChange={() => {}}
                  disabled={true}
                  className="md:col-span-2"
                />
                <FormInput
                  label="Apartment/Unit #"
                  value={data?.apartment || ""}
                  onChange={() => {}}
                  disabled={true}
                />
                <FormInput
                  label="ZIP Code"
                  value={data?.zipCode || ""}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>

            {/* Contact Details Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormInput
                  label="Phone"
                  value={formatPhone(data?.phone || "")}
                  onChange={() => {}}
                  type="tel"
                  disabled={true}
                />
                <FormInput
                  label="Email"
                  value={data?.email || ""}
                  onChange={() => {}}
                  type="email"
                  disabled={true}
                />
              </div>
            </div>

            {/* Employment Details Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                Employment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormInput
                  label="Date Available"
                  value={formatDateForInput(data?.dateAvailable) || ""}
                  onChange={() => {}}
                  type="date"
                  disabled={true}
                />
                <FormInput
                  label="Social Security No."
                  value={formatSSN(data?.socialSecurityNo || "")}
                  onChange={() => {}}
                  disabled={true}
                />
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Desired Salary Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          $
                        </span>
                        <input
                          type="text"
                          value={data?.desiredSalary || ""}
                          onChange={() => {}}
                          className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200"
                          disabled={true}
                        />
                      </div>
                    </div>
                    <FormSelect
                      label="Salary Type"
                      value={data?.desiredSalaryType || ""}
                      onChange={() => {}}
                      options={[
                        { value: "hourly", label: "Hourly" },
                        { value: "weekly", label: "Weekly" },
                        { value: "biweekly", label: "Bi-Weekly" },
                        { value: "monthly", label: "Monthly" },
                        { value: "yearly", label: "Yearly" },
                      ]}
                      disabled={true}
                      showPlaceholder={false}
                    />
                  </div>
                </div>
                <FormInput
                  label="Position Applied For"
                  value={data?.positionAppliedFor || ""}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>

            {/* Government ID Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                Government ID
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <FormSelect
                  label="ID Type"
                  value={data?.governmentIdType || ""}
                  onChange={() => {}}
                  options={[
                    {
                      value: "Driver's License",
                      label: "Driver's License",
                    },
                    { value: "State ID", label: "State ID" },
                    { value: "Passport", label: "Passport" },
                  ]}
                  disabled={true}
                  showPlaceholder={false}
                />
                <FormInput
                  label="Document Number"
                  value={formatGovernmentId(
                    data?.governmentIdNumber || "",
                    data?.governmentIdType
                  )}
                  onChange={() => {}}
                  disabled={true}
                />
                {(data?.governmentIdType === "Driver's License" ||
                  data?.governmentIdType === "State ID") && (
                  <FormSelect
                    label="State"
                    value={data?.governmentIdState || ""}
                    onChange={() => {}}
                    options={states}
                    disabled={true}
                    showPlaceholder={false}
                  />
                )}
                {data?.governmentIdType === "Passport" && (
                  <FormSelect
                    label="Country"
                    value={data?.governmentIdCountry || ""}
                    onChange={() => {}}
                    options={countries}
                    disabled={true}
                    showPlaceholder={false}
                  />
                )}
              </div>
            </div>

            {/* Authorization Questions Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-[#1F3A93] mb-4 md:mb-6 pb-2 border-b-2 border-[#1F3A93]">
                Authorization & Background
              </h2>

              <div className="space-y-6">
                {/* US Citizen Question */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Are you a citizen of the United States?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isUSCitizen"
                        value="YES"
                        checked={data?.isUSCitizen === "YES"}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={true}
                      />
                      <span className="ml-2 text-gray-700">YES</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isUSCitizen"
                        value="NO"
                        checked={data?.isUSCitizen === "NO"}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={true}
                      />
                      <span className="ml-2 text-gray-700">NO</span>
                    </label>
                  </div>
                </div>

                {/* Authorized to Work Question - Only show if NOT a US Citizen */}
                {data?.isUSCitizen === "NO" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Are you authorized to work in the U.S.?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="isAuthorizedToWork"
                          value="YES"
                          checked={data?.isAuthorizedToWork === "YES"}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          disabled={true}
                        />
                        <span className="ml-2 text-gray-700">YES</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="isAuthorizedToWork"
                          value="NO"
                          checked={data?.isAuthorizedToWork === "NO"}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          disabled={true}
                        />
                        <span className="ml-2 text-gray-700">NO</span>
                      </label>
                    </div>
                    {data?.isAuthorizedToWork === "YES" && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Please provide details about your work authorization:{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={data?.authorizedToWorkExplanation || ""}
                          onChange={() => {}}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 min-h-[100px]"
                          disabled={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Worked Here Before Question */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Have you ever worked for this company?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="hasWorkedHereBefore"
                        value="YES"
                        checked={data?.hasWorkedHereBefore === "YES"}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={true}
                      />
                      <span className="ml-2 text-gray-700">YES</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="hasWorkedHereBefore"
                        value="NO"
                        checked={data?.hasWorkedHereBefore === "NO"}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={true}
                      />
                      <span className="ml-2 text-gray-700">NO</span>
                    </label>
                  </div>
                  {data?.hasWorkedHereBefore === "YES" && (
                    <div className="mt-4">
                      <FormInput
                        label="If yes, when?"
                        value={data?.previousWorkDate || ""}
                        onChange={() => {}}
                        disabled={true}
                      />
                    </div>
                  )}
                </div>

                {/* Convicted of Felony Question */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Have you ever been convicted of a felony?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="hasBeenConvictedOfFelony"
                        value="YES"
                        checked={data?.hasBeenConvictedOfFelony === "YES"}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={true}
                      />
                      <span className="ml-2 text-gray-700">YES</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="hasBeenConvictedOfFelony"
                        value="NO"
                        checked={data?.hasBeenConvictedOfFelony === "NO"}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={true}
                      />
                      <span className="ml-2 text-gray-700">NO</span>
                    </label>
                  </div>
                  {data?.hasBeenConvictedOfFelony === "YES" && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        If yes, explain: <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={data?.felonyExplanation || ""}
                        onChange={() => {}}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors duration-200 min-h-[100px]"
                        disabled={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded ${
                    data?.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {data?.status || "draft"}
                </span>
              </p>
            </div>

            <HRNotesInput
              formType="personal-information"
              employeeId={employeeId}
              existingNote={data?.hrFeedback?.comment}
              existingReviewedAt={data?.hrFeedback?.reviewedAt}
              onNoteSaved={fetchData}
              formData={data}
              showSignature={false}
            />

            {/* Next Button */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Exit to Dashboard
              </button>
              <button
                onClick={() => navigate(`/hr/education/${employeeId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                Next: Education
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
    </Layout>
  );
};

export default PersonalInformationHR;
