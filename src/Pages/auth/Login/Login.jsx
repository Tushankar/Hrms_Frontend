import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OtpVerifyModal } from "../../../Components/Common/UI/OtpVerifyModal/OtpVerifyModal";
import { ForgotPasswordModal } from "../../../Components/Common/UI/ForgotPasswordModal/ForgotPasswordModal";
import * as EmailValidator from "email-validator";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

export const Login = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const router = useNavigate();
  // Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSendingForgotOtp, setIsSendingForgotOtp] = useState(false);
  const [isVerifyingForgotOtp, setIsVerifyingForgotOtp] = useState(false);
  const [isResendingForgotOtp, setIsResendingForgotOtp] = useState(false);

  // Carousel images
  const carouselImages = [
    "https://images.pexels.com/photos/7643735/pexels-photo-7643735.jpeg",
    "https://images.pexels.com/photos/8154228/pexels-photo-8154228.jpeg",
    "https://images.pexels.com/photos/7108466/pexels-photo-7108466.jpeg",
    "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg",
    "https://images.pexels.com/photos/7414032/pexels-photo-7414032.jpeg",
  ];

  const carouselTexts = [
    {
      title: "Streamline Your HR Process",
      subtitle:
        "Manage employees, track performance, and automate workflows with ease. Transform your workplace into a productivity powerhouse.",
    },
    {
      title: "Data-Driven Decisions",
      subtitle:
        "Get powerful insights and analytics to make informed HR decisions. Leverage real-time data for better outcomes.",
    },
    {
      title: "Modern Workforce Management",
      subtitle:
        "Connect your team with powerful collaboration tools. Build a culture of innovation and excellence.",
    },
    {
      title: "Employee Engagement",
      subtitle:
        "Foster a positive work environment with tools designed to enhance employee satisfaction and retention.",
    },
    {
      title: "Future-Ready Solutions",
      subtitle:
        "Stay ahead with cutting-edge HR technology that adapts to your growing business needs.",
    },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Auto-rotate carousel every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  };

  const LoginUser = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsLoading(false);
        return toast.error("Internal Error, please try again later!");
      }
      if (!EmailValidator.validate(loginInfo.email)) {
        setIsLoading(false);
        return toast.error("Please enter a correct email!");
      }

      const reqToLogin = await axios.post(
        `${baseUrl}/auth/log-in`,
        {
          email: loginInfo?.email,
          password: loginInfo?.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (reqToLogin?.data?.otpRequired) {
        setIsLoading(false);
        toast.success(reqToLogin?.data.message);
        setShowOtpInput(true);
        return;
      }

      const session = reqToLogin?.headers["authorization"];

      if (!session) {
        return toast.error("Session not found");
      }
      if (reqToLogin?.data.userInfo.accountStatus === "inactive") {
        toast.error("Your Account is Restricted, Please Contact Admin");
        return;
      }

      // Set session cookie
      Cookies.set("session", session, {
        path: "/",
        expiresIn: "2d",
      });

      // Set user data cookie
      Cookies.set("user", JSON.stringify(reqToLogin.data.userInfo), {
        path: "/",
        expiresIn: "2d",
      });

      switch (reqToLogin.data.userInfo.userRole) {
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
          break;
      }

      setIsLoading(false);
      toast.success(reqToLogin?.data.message);
    } catch (error) {
      setIsLoading(false);
      toast.error(error?.response?.data?.message || "Login failed");
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
        return toast.error("Internal Error, please try again later!");
      }

      const reqToVerify = await axios.post(
        `${baseUrl}/auth/verify-login-otp`,
        {
          email: loginInfo.email,
          otp: otp.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const session = reqToVerify?.headers["authorization"];

      if (!session) {
        return toast.error("Session not found");
      }
      if (reqToVerify?.data.userInfo.accountStatus === "inactive") {
        toast.error("Your Account is Restricted, Please Contact Admin");
        return;
      }

      // Set session cookie
      Cookies.set("session", session, {
        path: "/",
        expiresIn: "2d",
      });

      // Set user data cookie
      Cookies.set("user", JSON.stringify(reqToVerify.data.userInfo), {
        path: "/",
        expiresIn: "2d",
      });

      switch (reqToVerify.data.userInfo.userRole) {
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
          break;
      }

      setIsLoading(false);
      toast.success(reqToVerify?.data.message);
    } catch (error) {
      setIsLoading(false);
      toast.error(error?.response?.data?.message || "OTP verification failed");
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
        `${baseUrl}/auth/resend-login-otp`,
        {
          email: loginInfo.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(reqToResend?.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Forgot password: send OTP for password reset
  const sendForgotOtp = async () => {
    if (!loginInfo.email || !EmailValidator.validate(loginInfo.email)) {
      return toast.error("Please enter a valid email to reset password");
    }

    setIsSendingForgotOtp(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsSendingForgotOtp(false);
        return toast.error("Internal Error, please try again later!");
      }

      const req = await axios.post(
        `${baseUrl}/auth/forgot-password`,
        { email: loginInfo.email },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(req?.data?.message || "OTP sent to your email");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingForgotOtp(false);
    }
  };

  const resendForgotOtp = async () => {
    setIsResendingForgotOtp(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsResendingForgotOtp(false);
        return toast.error("Internal Error, please try again later!");
      }

      const req = await axios.post(
        `${baseUrl}/auth/forgot-password`,
        { email: loginInfo.email },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(req?.data?.message || "OTP resent to your email");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResendingForgotOtp(false);
    }
  };

  // Verify forgot OTP and reset password
  const verifyForgotOtp = async () => {
    if (!forgotOtp.trim() || !newPassword.trim()) {
      return toast.error("Please provide OTP and a new password");
    }

    setIsVerifyingForgotOtp(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsVerifyingForgotOtp(false);
        return toast.error("Internal Error, please try again later!");
      }

      const req = await axios.post(
        `${baseUrl}/auth/verify-forgot-otp`,
        {
          email: loginInfo.email,
          otp: forgotOtp.trim(),
          newPassword: newPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(req?.data?.message || "Password reset successful");
      // reset forgot states and exit forgot mode
      setForgotMode(false);
      setForgotOtp("");
      setNewPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsVerifyingForgotOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex font-[Poppins]">
      {/* Left Carousel Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Carousel Images */}
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentImageIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover object-center mix-blend-overlay"
            />
          </div>
        ))}
      </div>{" "}
      {/* Right Form Section */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow-lg border-2 border-blue-100">
                <img
                  src="https://i.pinimg.com/1200x/fd/81/16/fd81160d9bb6751db8d120e675069b10.jpg"
                  alt="HRMS Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-[#34495E]">HRMS</h1>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#34495E] mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!showOtpInput) {
                LoginUser();
              }
            }}
            className="space-y-6"
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={loginInfo.email}
                onChange={handleOnChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  value={loginInfo.password}
                  onChange={handleOnChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !Object.keys(loginInfo).every((key) => Boolean(loginInfo[key]))
              }
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      {/* OTP Verification Modal */}
      <OtpVerifyModal
        isOpen={showOtpInput}
        onClose={() => {
          setShowOtpInput(false);
          setOtp("");
        }}
        email={loginInfo.email}
        otp={otp}
        setOtp={setOtp}
        onVerify={verifyOTP}
        isLoading={isLoading}
        onResend={resendOTP}
        isResending={isResendingOtp}
      />
      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotMode}
        onClose={() => {
          setForgotMode(false);
          setForgotOtp("");
          setNewPassword("");
        }}
        email={loginInfo.email}
        setEmail={(email) => setLoginInfo({ ...loginInfo, email: email })}
        forgotOtp={forgotOtp}
        setForgotOtp={setForgotOtp}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onSendOtp={sendForgotOtp}
        onResendOtp={resendForgotOtp}
        onVerifyOtp={verifyForgotOtp}
        isSending={isSendingForgotOtp}
        isResending={isResendingForgotOtp}
        isVerifying={isVerifyingForgotOtp}
      />
    </div>
  );
};
