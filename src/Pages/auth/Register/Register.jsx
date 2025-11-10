import React, { useState } from "react";
import { RightSection } from "../../../Components/Common/UI/AuthPage/RightSection";
import { Link, useNavigate } from "react-router-dom";
import {
  AppleIcon,
  FaceBooIcon,
  GoogleIcon,
} from "../../../assets/Svgs/AllSvgs";
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

                    <div className="w-full  flex justify-center items-center border border-[#95A5A6] rounded-lg p-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        onChange={handleOnChange}
                        value={registerInfo.password}
                        className=" placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400]  outline-none  py-1 px-2 flex-1 border-none focus:border-none focus:outline-none"
                        placeholder="*********"
                      />
                      <button className="p-1">
                        <svg
                          width="19"
                          height="16"
                          viewBox="0 0 19 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_224_1841)">
                            <path
                              d="M9.82108 12.0179C7.65589 12.0179 5.90318 10.3797 5.7419 8.30385L2.74746 6.04185C2.35381 6.52456 1.99157 7.03488 1.69926 7.59291C1.63396 7.71917 1.59994 7.85867 1.59994 8.00014C1.59994 8.14162 1.63396 8.28111 1.69926 8.40737C3.24729 11.3597 6.31196 13.3571 9.82108 13.3571C10.5892 13.3571 11.3303 13.2455 12.0445 13.0653L10.5633 11.945C10.3186 11.9912 10.0702 12.0156 9.82108 12.0179ZM18.7793 13.639L15.6236 11.255C16.5822 10.4654 17.3706 9.49729 17.9429 8.40709C18.0082 8.28083 18.0422 8.14134 18.0422 7.99986C18.0422 7.85839 18.0082 7.71889 17.9429 7.59264C16.3949 4.64035 13.3302 2.64286 9.82108 2.64286C8.3514 2.6446 6.9056 3.00624 5.61573 3.69476L1.98415 0.951173C1.93679 0.915154 1.88264 0.888609 1.82478 0.873055C1.76693 0.857501 1.7065 0.853243 1.64696 0.860524C1.58742 0.867806 1.52993 0.886483 1.47778 0.91549C1.42562 0.944497 1.37983 0.983264 1.34301 1.02958L0.782661 1.73466C0.708327 1.82812 0.675019 1.94662 0.690061 2.06409C0.705104 2.18156 0.767265 2.28838 0.862874 2.36105L17.658 15.0488C17.7054 15.0848 17.7595 15.1114 17.8174 15.1269C17.8752 15.1425 17.9357 15.1468 17.9952 15.1395C18.0547 15.1322 18.1122 15.1135 18.1644 15.0845C18.2165 15.0555 18.2623 15.0167 18.2991 14.9704L18.8598 14.2653C18.9341 14.1718 18.9673 14.0533 18.9522 13.9359C18.9372 13.8184 18.8749 13.7116 18.7793 13.639ZM13.5349 9.6769L12.413 8.82924C12.5075 8.56235 12.5576 8.28239 12.5615 8C12.567 7.58657 12.4733 7.17762 12.2879 6.80601C12.1024 6.4344 11.8304 6.11048 11.4936 5.86027C11.1568 5.61007 10.7647 5.44055 10.3488 5.36533C9.93284 5.29011 9.50464 5.3113 9.09859 5.42718C9.27072 5.65516 9.36383 5.93094 9.36435 6.21429C9.36009 6.30858 9.34535 6.40213 9.32039 6.4933L7.21914 4.90597C7.94905 4.30977 8.86986 3.98283 9.82108 3.98214C10.361 3.98185 10.8956 4.08558 11.3945 4.28739C11.8933 4.4892 12.3466 4.78514 12.7284 5.15829C13.1101 5.53144 13.4129 5.97449 13.6194 6.46209C13.8258 6.94969 13.932 7.47229 13.9317 8C13.9317 8.60352 13.7806 9.16602 13.5349 9.67718V9.6769Z"
                              fill="black"
                              fill-opacity="0.5"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_224_1841">
                              <rect
                                width="19"
                                height="15"
                                fill="white"
                                transform="translate(0 0.5)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base ">
                      Confirm Password
                    </label>
                    <div className="w-full  flex justify-center items-center border border-[#95A5A6] rounded-lg p-1">
                      <input
                        id="password"
                        name="confirmPassword"
                        type="password"
                        value={registerInfo.confirmPassword}
                        onChange={handleOnChange}
                        className=" placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400]  outline-none py-1 px-2 flex-1 border-none focus:border-none focus:outline-none"
                        placeholder="*********"
                      />
                      <button className="p-1">
                        <svg
                          width="19"
                          height="16"
                          viewBox="0 0 19 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_224_1841)">
                            <path
                              d="M9.82108 12.0179C7.65589 12.0179 5.90318 10.3797 5.7419 8.30385L2.74746 6.04185C2.35381 6.52456 1.99157 7.03488 1.69926 7.59291C1.63396 7.71917 1.59994 7.85867 1.59994 8.00014C1.59994 8.14162 1.63396 8.28111 1.69926 8.40737C3.24729 11.3597 6.31196 13.3571 9.82108 13.3571C10.5892 13.3571 11.3303 13.2455 12.0445 13.0653L10.5633 11.945C10.3186 11.9912 10.0702 12.0156 9.82108 12.0179ZM18.7793 13.639L15.6236 11.255C16.5822 10.4654 17.3706 9.49729 17.9429 8.40709C18.0082 8.28083 18.0422 8.14134 18.0422 7.99986C18.0422 7.85839 18.0082 7.71889 17.9429 7.59264C16.3949 4.64035 13.3302 2.64286 9.82108 2.64286C8.3514 2.6446 6.9056 3.00624 5.61573 3.69476L1.98415 0.951173C1.93679 0.915154 1.88264 0.888609 1.82478 0.873055C1.76693 0.857501 1.7065 0.853243 1.64696 0.860524C1.58742 0.867806 1.52993 0.886483 1.47778 0.91549C1.42562 0.944497 1.37983 0.983264 1.34301 1.02958L0.782661 1.73466C0.708327 1.82812 0.675019 1.94662 0.690061 2.06409C0.705104 2.18156 0.767265 2.28838 0.862874 2.36105L17.658 15.0488C17.7054 15.0848 17.7595 15.1114 17.8174 15.1269C17.8752 15.1425 17.9357 15.1468 17.9952 15.1395C18.0547 15.1322 18.1122 15.1135 18.1644 15.0845C18.2165 15.0555 18.2623 15.0167 18.2991 14.9704L18.8598 14.2653C18.9341 14.1718 18.9673 14.0533 18.9522 13.9359C18.9372 13.8184 18.8749 13.7116 18.7793 13.639ZM13.5349 9.6769L12.413 8.82924C12.5075 8.56235 12.5576 8.28239 12.5615 8C12.567 7.58657 12.4733 7.17762 12.2879 6.80601C12.1024 6.4344 11.8304 6.11048 11.4936 5.86027C11.1568 5.61007 10.7647 5.44055 10.3488 5.36533C9.93284 5.29011 9.50464 5.3113 9.09859 5.42718C9.27072 5.65516 9.36383 5.93094 9.36435 6.21429C9.36009 6.30858 9.34535 6.40213 9.32039 6.4933L7.21914 4.90597C7.94905 4.30977 8.86986 3.98283 9.82108 3.98214C10.361 3.98185 10.8956 4.08558 11.3945 4.28739C11.8933 4.4892 12.3466 4.78514 12.7284 5.15829C13.1101 5.53144 13.4129 5.97449 13.6194 6.46209C13.8258 6.94969 13.932 7.47229 13.9317 8C13.9317 8.60352 13.7806 9.16602 13.5349 9.67718V9.6769Z"
                              fill="black"
                              fill-opacity="0.5"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_224_1841">
                              <rect
                                width="19"
                                height="15"
                                fill="white"
                                transform="translate(0 0.5)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
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

            {showOtpInput && (
              <div className="mt-5 p-4 border border-[#95A5A6] rounded-lg">
                <h3 className="text-[#505050] font-[Poppins] font-[700] text-base sm:text-lg lg:text-xl mb-3">
                  Email Verification
                </h3>
                <p className="text-[#505050] font-[Poppins] font-[400] text-sm mb-4">
                  Please enter the 6-digit OTP sent to your email:{" "}
                  <strong>{registerInfo.email}</strong>
                </p>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                    OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </div>
                <button
                  type="button"
                  onClick={verifyOTP}
                  disabled={!otp.trim() || otp.length !== 6}
                  className="w-full sm:w-auto bg-[#34495E] flex justify-center items-center gap-5 text-white hover:text-[#34495E] hover:bg-white transition-all duration-200 ease-linear border border-[#34495E] font-[Poppins] font-[600] px-8 sm:px-16 py-2 sm:py-2.5 rounded-full disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      Verifying
                      <CircularProgress size={20} color="#7EC2F3" />
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>
              </div>
            )}

            <div className="flex justify-between items-center my-4 sm:my-6">
              <div className="bg-[#D9D9D9] h-0.5 sm:h-1 w-[30%] sm:w-[35%] rounded-3xl" />
              <div className="px-2">
                <p className="font-[Poppins] font-[500] text-xs sm:text-sm lg:text-base text-[#000000]/50 whitespace-nowrap">
                  Or login with
                </p>
              </div>
              <div className="bg-[#D9D9D9] h-0.5 sm:h-1 w-[30%] sm:w-[35%] rounded-3xl" />
            </div>

            <div className="flex flex-col sm:flex-row justify-center sm:justify-evenly items-center gap-3 sm:gap-2">
              <button className="w-full sm:w-auto text-[#34495E] font-[Poppins] font-[400] text-sm md:text-base flex justify-center items-center gap-2 sm:gap-3 bg-[#ffffff] border border-[#e1e1e1] rounded-full px-6 sm:px-8 lg:px-10 py-2">
                <span>
                  <GoogleIcon />
                </span>
                Google
              </button>
              <button className="w-full sm:w-auto text-[#000000] font-[Poppins] font-[400] text-sm md:text-base flex justify-center items-center gap-2 sm:gap-3 bg-[#ffffff] border border-[#e1e1e1] rounded-full px-6 sm:px-8 lg:px-10 py-2">
                <span>
                  <AppleIcon />
                </span>
                Apple
              </button>
              <button className="w-full sm:w-auto text-[#006DDF] font-[Poppins] font-[400] text-sm md:text-base flex justify-center items-center gap-2 sm:gap-3 bg-[#ffffff] border border-[#e1e1e1] rounded-full px-6 sm:px-8 lg:px-10 py-2">
                <span>
                  <FaceBooIcon />
                </span>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
