import React, { useState } from "react";
import { RightSection } from "../../../Components/Common/UI/AuthPage/RightSection";
import { OtpVerifyModal } from "../../../Components/Common/UI/OtpVerifyModal/OtpVerifyModal";
import { Link, useNavigate } from "react-router-dom";
import * as EmailValidator from "email-validator";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import CircularProgress from "@mui/material/CircularProgress";

export const Register = () => {
  const [registerInfo, setRegisterInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    country: "",
    state: "",
    city: "",
    zip: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const router = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setRegisterInfo({ ...registerInfo, [name]: value });

    // Handle cascading dropdowns
    if (name === "country") {
      // Reset state and city when country changes
      setRegisterInfo((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
      setStates([]);
      setCities([]);
      if (value) {
        fetchStates(value);
      }
    } else if (name === "state") {
      // Reset city when state changes
      setRegisterInfo((prev) => ({
        ...prev,
        city: "",
      }));
      setCities([]);
      if (value && registerInfo.country) {
        fetchCities(registerInfo.country, value);
      }
    }
  };

  const createNewAccount = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsLoading(false);
        return toast.error("Internal Error, please try again later !");
      }
      if (!EmailValidator.validate(registerInfo.email)) {
        setIsLoading(false);
        return toast.error("Please enter a correct email !!");
      }

      if (registerInfo.password !== registerInfo.confirmPassword) {
        setIsLoading(false);
        return toast.error("Incorrect confirm-password !!");
      }

      const reqToSendOTP = await axios.post(
        `${baseUrl}/auth/register`,
        {
          fullName: registerInfo?.fullName,
          email: registerInfo?.email,
          phoneNumber: registerInfo?.phoneNumber,
          addressLine1: registerInfo?.addressLine1,
          country: registerInfo?.country,
          state: registerInfo?.state,
          city: registerInfo?.city,
          zip: registerInfo?.zip,
          dateOfBirth: registerInfo?.dateOfBirth,
          password: registerInfo?.password,
          userRole: "employee",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsLoading(false);
      toast.success(reqToSendOTP?.data.message);
      setShowOtpInput(true);
    } catch (error) {
      setIsLoading(false);
      console.error(error?.response.data);
      toast.error(error?.response.data.message);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      return toast.error("Please enter the OTP");
    }

    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsLoading(false);
        return toast.error("Internal Error, please try again later !");
      }

      const reqToVerify = await axios.post(
        `${baseUrl}/auth/verify-otp`,
        {
          email: registerInfo.email,
          otp: otp.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsLoading(false);
      toast.success(reqToVerify?.data.message);

      // After successful OTP verification, automatically log the user in
      try {
        const loginResponse = await axios.post(
          `${baseUrl}/auth/log-in`,
          {
            email: registerInfo.email,
            password: registerInfo.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Login response:", loginResponse);
        const session = loginResponse?.headers["authorization"];

        if (!session) {
          console.error("No session token in response headers");
          toast.error(
            "Login failed after registration. Please try logging in manually."
          );
          router("/auth/log-in");
          return;
        }

        if (loginResponse?.data.userInfo.accountStatus === "inactive") {
          toast.error("Your Account is Restricted, Please Contact Admin");
          return;
        }

        // Set session cookie
        Cookies.set("session", session, {
          path: "/",
          expires: 2, // 2 days
        });

        // Set user data cookie
        Cookies.set("user", JSON.stringify(loginResponse.data.userInfo), {
          path: "/",
          expires: 2, // 2 days
        });

        // Redirect based on user role
        const userRole = loginResponse.data.userInfo.userRole;
        console.log("User role:", userRole);

        switch (userRole) {
          case "employee":
            router("/employee/dashboard");
            break;
          case "admin":
            router("/admin/dashboard");
            break;
          case "hr":
            router("/");
            break;
          default:
            router("/employee/dashboard");
            break;
        }

        toast.success("Account created and logged in successfully!");
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        console.error("Error response:", loginError.response?.data);
        toast.error("Account created successfully! Please log in manually.");
        router("/auth/log-in");
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error?.response.data);
      toast.error(error?.response.data.message);
    }
  };

  const resendOTP = async () => {
    setIsResendingOtp(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsResendingOtp(false);
        return toast.error("Internal Error, please try again later!");
      }

      const reqToResend = await axios.post(
        `${baseUrl}/auth/register`,
        {
          fullName: registerInfo?.fullName,
          email: registerInfo?.email,
          phoneNumber: registerInfo?.phoneNumber,
          addressLine1: registerInfo?.addressLine1,
          country: registerInfo?.country,
          state: registerInfo?.state,
          city: registerInfo?.city,
          zip: registerInfo?.zip,
          dateOfBirth: registerInfo?.dateOfBirth,
          password: registerInfo?.password,
          userRole: "employee",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(reqToResend?.data.message || "OTP resent to your email");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await axios.get(
        "https://countriesnow.space/api/v0.1/countries"
      );
      if (response.data && response.data.data) {
        const countryList = response.data.data.map((country) => ({
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

        // Set United States as default if no country is selected
        if (!registerInfo.country) {
          setRegisterInfo((prev) => ({
            ...prev,
            country: "United States",
          }));
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
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states based on selected country
  const fetchStates = async (countryName) => {
    if (!countryName) {
      setStates([]);
      return;
    }

    setLoadingStates(true);
    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/states",
        {
          country: countryName,
        }
      );

      if (response.data && response.data.data && response.data.data.states) {
        const stateList = response.data.data.states.map((state) => ({
          value: state.name,
          label: state.name,
        }));
        setStates(stateList);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities based on selected country and state
  const fetchCities = async (countryName, stateName) => {
    if (!countryName || !stateName) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      const response = await axios.post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        {
          country: countryName,
          state: stateName,
        }
      );

      if (response.data && response.data.data) {
        const cityList = response.data.data.map((city) => ({
          value: city,
          label: city,
        }));
        setCities(cityList);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Load countries on component mount
  React.useEffect(() => {
    fetchCountries();
  }, []);

  // Load states when country changes
  React.useEffect(() => {
    if (registerInfo.country) {
      fetchStates(registerInfo.country);
    }
  }, [registerInfo.country]);

  return (
    <>
      <div className="p-3 sm:p-5 min-h-[100dvh] flex justify-center items-center">
        <div className="flex flex-col lg:flex-row justify-center items-center gap-5 w-full max-w-7xl mx-auto">
          <div className="hidden lg:block">
            <RightSection />
          </div>
          <div className="w-full lg:flex-1 px-2 sm:px-4 max-w-2xl">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#34495E] font-[800] text-2xl sm:text-3xl lg:text-4xl">
                Create an account
              </h3>
              <p className="text-[#505050] font-[Poppins] font-[400] text-xs sm:text-sm lg:text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam ac
                lectus nec enim tempor suscipit.
              </p>
            </div>
            <div className="mt-3 sm:mt-5">
              <h3 className="text-[#505050] font-[Poppins] font-[700] text-base sm:text-lg lg:text-xl">
                Enter details
              </h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={registerInfo.fullName}
                      onChange={handleOnChange}
                      name="fullName"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Email
                    </label>
                    <input
                      type="email"
                      id="lastName"
                      onChange={handleOnChange}
                      name="email"
                      value={registerInfo.email}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={registerInfo.phoneNumber}
                      onChange={handleOnChange}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Address Line 1"
                      name="addressLine1"
                      value={registerInfo.addressLine1}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="flex flex-col w-full sm:w-1/3 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={registerInfo.country}
                      onChange={handleOnChange}
                      disabled={loadingCountries}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={registerInfo.state}
                      onChange={handleOnChange}
                      disabled={loadingStates || states.length === 0}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      City
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={registerInfo.city}
                      onChange={handleOnChange}
                      disabled={loadingCities || cities.length === 0}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Zip Code"
                      name="zip"
                      value={registerInfo.zip}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Date of Birth"
                      name="dateOfBirth"
                      onChange={handleOnChange}
                      value={registerInfo.dateOfBirth}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Password
                    </label>

                    <div className="w-full flex justify-center items-center border border-[#95A5A6] rounded-lg p-1">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        onChange={handleOnChange}
                        value={registerInfo.password}
                        className="placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] outline-none py-1 px-2 flex-1 border-none focus:border-none focus:outline-none"
                        placeholder="*********"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Confirm Password
                    </label>
                    <div className="w-full flex justify-center items-center border border-[#95A5A6] rounded-lg p-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerInfo.confirmPassword}
                        onChange={handleOnChange}
                        className="placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] outline-none py-1 px-2 flex-1 border-none focus:border-none focus:outline-none"
                        placeholder="*********"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="p-1 text-gray-500 hover:text-gray-700 transition"
                      >
                        {showConfirmPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    disabled={
                      !Object.keys(registerInfo).every((key) => {
                        return Boolean(registerInfo[key]);
                      })
                    }
                    type="button"
                    onClick={createNewAccount}
                    className="w-full sm:w-auto bg-[#34495E] flex justify-center items-center gap-5 text-white hover:text-[#34495E] hover:bg-white transition-all duration-200 ease-linear border border-[#34495E] font-[Poppins] font-[600] px-8 sm:px-16 py-2 sm:py-2.5 rounded-full disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        Sending OTP
                        <CircularProgress size={20} color="#7EC2F3" />
                      </>
                    ) : (
                      "Create an account"
                    )}
                  </button>
                  <p className="font-[Poppins] font-[400] text-sm md:text-base mt-3">
                    Already have an account?{" "}
                    <Link className="text-[#7EC2F3] ml-1" to="/auth/log-in">
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerifyModal
        isOpen={showOtpInput}
        onClose={() => {
          setShowOtpInput(false);
          setOtp("");
        }}
        email={registerInfo.email}
        otp={otp}
        setOtp={setOtp}
        onVerify={verifyOTP}
        isLoading={isLoading}
        onResend={resendOTP}
        isResending={isResendingOtp}
      />
    </>
  );
};
