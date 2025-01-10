"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  return (
    <div className="bg-white min-h-screen relative flex justify-center items-center px-4 py-10">
      {/* Buyer/Vendor Buttons */}
      <div className="absolute top-4 right-12 flex space-x-6">
        <a href="#" className="text-[#F9C301] font-bold font-body text-[16px]">
          Buyer
        </a>
        <a href="#" className="text-[#111102] font-bold font-body text-[16px]">
          Vendor
        </a>
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-center text-[24px] font-bold font-body text-[#111102] mb-5 mt-5">
          Buyer Register
        </h1>

        {/* Gray Container */}
        <div className="bg-[#F8F8F8] w-full p-12 rounded-[15px] shadow-md flex flex-col justify-center items-center ">
          <form className="space-y-4 w-full">
            {/* First Name and Last Name */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label
                  htmlFor="firstName"
                  className="block text-[16px] font-medium font-body text-[#111102] mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full text-[#111102]  bg-[#FEFEFE] rounded-[5px]   px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  placeholder="First Name"
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="lastName"
                  className="block text-[16px] font-medium font-body text-[#111102] mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full text-[#111102]  bg-[#FEFEFE] rounded-[5px]  px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  placeholder="Last Name"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Mobile Number
              </label>
              <input
                type="text"
                id="mobileNumber"
                className="w-full text-[#111102]  bg-[#FEFEFE] rounded-[5px]  px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                placeholder="Mobile Number"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label
                htmlFor="whatsappNumber"
                className="block text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                WhatsApp Number
              </label>
              <input
                type="text"
                id="whatsappNumber"
                className="w-full text-[#111102]  bg-[#FEFEFE] rounded-[5px]  px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                placeholder="WhatsApp Number"
              />
            </div>

            {/* District */}
            <div>
              <label
                htmlFor="district"
                className="block text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                District
              </label>
              <div className="relative">
                <select
                  id="district"
                  className="w-full text-gray-400 bg-[#FEFEFE] rounded-[5px] appearance-none px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                >
                  <option value="">Select District</option>
                  <option value="district1">District 1</option>
                  <option value="district2">District 2</option>
                  <option value="district3">District 3</option>
                </select>
                {/* Arrow Icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full text-[#111102]  bg-[#FEFEFE] rounded-[5px]  px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[16px] font-body font-medium text-[#111102] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="w-full text-[#111102]  bg-[#FEFEFE] rounded-[5px]  px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <i
                    className={`fas ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-[#F9C301] text-[#111102] font-bold text-[16px]  font-body py-2 rounded-md hover:bg-yellow-500 transition"
            >
              REGISTER
            </button>
          </form>

          {/* Footer */}
          <p className="text-center font-body text-[12px] mt-4 text-[#111102]">
            Already have an account?{" "}
            <button
              onClick={handleLoginClick}
              className="text-[#F9C301] text-[12px] underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
