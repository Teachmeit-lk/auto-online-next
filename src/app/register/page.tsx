"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    whatsappNumber: "",
    district: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      whatsappNumber: "",
      district: "",
      password: "",
      confirmPassword: "",
    };

    // First Name and Last Name
    if (!firstName) newErrors.firstName = "First name is required.";
    if (!lastName) newErrors.lastName = "Last name is required.";

    // Mobile Number validation
    if (!mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required.";
    } else if (!/^0\d{9}$/.test(mobileNumber)) {
      newErrors.mobileNumber =
        "Mobile number must start with 0 and contain exactly 10 digits.";
    }

    // WhatsApp Number validation (optional, same as mobile)
    if (!whatsappNumber) {
      newErrors.whatsappNumber = "WhatsApp number is required.";
    } else if (!/^0\d{9}$/.test(whatsappNumber)) {
      newErrors.whatsappNumber =
        "WhatsApp number must start with 0 and contain exactly 10 digits.";
    }

    // District validation
    if (!district) newErrors.district = "District is required.";

    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character.";
    }

    // Confirm Password validation
    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted:", {
        firstName,
        lastName,
        mobileNumber,
        whatsappNumber,
        district,
        password,
        confirmPassword,
      });
    }
  };

  return (
    <div
      className="bg-white min-h-screen relative flex justify-center items-center px-4 py-10"
      id="register"
    >
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
        <div className="bg-[#F8F8F8] w-full py-12 px-14 rounded-[15px] shadow-md flex flex-col justify-center items-center ">
          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                    errors.firstName
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
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
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                    errors.lastName
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
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
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={`w-full text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                  errors.mobileNumber
                    ? "focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-yellow-500 focus:border-yellow-500"
                }`}
                placeholder="Mobile Number"
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mobileNumber}
                </p>
              )}
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
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className={`w-full text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                  errors.whatsappNumber
                    ? "focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-yellow-500 focus:border-yellow-500"
                }`}
                placeholder="WhatsApp Number"
              />
              {errors.whatsappNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.whatsappNumber}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label
                htmlFor="district"
                className="block text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                District
              </label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`w-full text-gray-400 bg-[#FEFEFE] rounded-[5px] appearance-none px-3 py-2 focus:ring-2 focus:outline-none ${
                  errors.district
                    ? "focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-yellow-500 focus:border-yellow-500"
                }`}
              >
                <option value="">Select District</option>
                <option value="district1">District 1</option>
                <option value="district2">District 2</option>
                <option value="district3">District 3</option>
              </select>
              {errors.district && (
                <p className="text-red-500 text-sm mt-1">{errors.district}</p>
              )}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                    errors.password
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                    errors.confirmPassword
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
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
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-[#F9C301] text-[#111102] font-bold text-[16px] font-body py-2 rounded-md hover:bg-yellow-500 transition"
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
