import React, { useState } from "react";
import { RightSection } from "../../../Components/Common/UI/AuthPage/RightSection";
import { OtpVerifyModal } from "../../../Components/Common/UI/OtpVerifyModal/OtpVerifyModal";
import { Link, useNavigate } from "react-router-dom";
import * as EmailValidator from "email-validator";
import { toast } from "react-toastify";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

export const Register = () => {
  const [registerInfo, setRegisterInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    country: "",
    address: "",
    dateOfBirth: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setRegisterInfo({ ...registerInfo, [name]: value });
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
          country: registerInfo?.country,
          phoneNumber: registerInfo?.phoneNumber,
          password: registerInfo?.password,
          address: registerInfo?.address,
          dateOfBirth: registerInfo?.dateOfBirth,
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
      router("/auth/log-in");
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
          country: registerInfo?.country,
          phoneNumber: registerInfo?.phoneNumber,
          password: registerInfo?.password,
          address: registerInfo?.address,
          dateOfBirth: registerInfo?.dateOfBirth,
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
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
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
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Country
                    </label>
                    {/* <select
                      onChange={handleOnChange}
                      value={registerInfo.country}
                      name="country"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-[1vw] font-[400] rounded-lg outline-none py-2 px-2"
                    >
                      <option className="text-[#95A5A6]">
                        -Select Country-
                      </option>
                      <option>-Select Country-</option>
                      <option>-Select Country-</option>
                      <option>-Select Country-</option>
                      <option>-Select Country-</option>
                    </select> */}
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={registerInfo.country}
                      onChange={handleOnChange}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Enter Country"
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

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Address
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Address"
                      name="address"
                      value={registerInfo.address}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="country"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Date of Birth"
                      name="dateOfBirth"
                      onChange={handleOnChange}
                      value={registerInfo.dateOfBirth}
                    />
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
