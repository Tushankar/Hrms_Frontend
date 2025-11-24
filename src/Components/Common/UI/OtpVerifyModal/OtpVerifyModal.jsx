import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

export const OtpVerifyModal = ({
  isOpen,
  onClose,
  email,
  otp,
  setOtp,
  onVerify,
  isLoading,
  onResend,
  isResending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#34495E]">
            Email Verification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-gray-600 font-[Poppins] font-[400] text-sm mb-2">
            Please enter the 6-digit OTP sent to your email:
          </p>
          <p className="font-semibold text-[#34495E] mb-4">{email}</p>

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-[#505050] font-[600] font-[Poppins] text-sm">
              OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm font-[400] rounded-lg outline-none py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={onResend}
              disabled={isResending || isLoading}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isResending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Resending...
                </div>
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onVerify}
            disabled={!otp.trim() || otp.length !== 6 || isLoading}
            className="flex-1 bg-[#34495E] flex justify-center items-center gap-2 text-white hover:text-white hover:bg-[#2c3e50] transition-all duration-200 border border-[#34495E] font-[Poppins] font-[600] px-4 py-2 rounded-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none text-sm"
          >
            {isLoading ? (
              <>
                Verifying
                <CircularProgress size={16} color="inherit" />
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
