"use client";

import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ mobile: "", password: "" });

  const router = useRouter();

  const handleSignUpClick = () => {
    router.push("/register");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const validateForm = () => {
    const newErrors = { mobile: "", password: "" };

    // Mobile number validation
    if (!mobile) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^0\d{9}$/.test(mobile)) {
      newErrors.mobile =
        "Mobile number must start with 0 and contain exactly 10 digits.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character.";
    }

    setErrors(newErrors);

    return !newErrors.mobile && !newErrors.password;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted:", { mobile, password });
      // need to add login logic here
    }
  };

  return (
    <div
      className="bg-white relative px-20 py-[63px] overflow-hidden h-[100%]"
      id="login"
    >
      <div className="absolute top-4 right-12 flex space-x-6">
        <a href="#" className="text-[#F9C301] font-bold font-body text-[16px]">
          Buyer
        </a>
        <a href="#" className="text-[#111102] font-bold font-body text-[16px]">
          Vendor
        </a>
      </div>

      {/* Buyer Login Heading */}
      <div className="top-[10%] w-full mb-5 mt-5">
        <h1 className="text-center text-[24px] font-body font-bold text-[#111102]">
          Buyer Login
        </h1>
      </div>

      {/* Login Form */}
      <div className="flex justify-center h-full">
        <div className="bg-[#F8F8F8] w-[459px] h-auto rounded-[15px] shadow-md p-8 flex flex-col justify-center items-center">
          {/* Input Fields */}
          <form className="space-y-6 w-full" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="mobile"
                className="block text-[16px] font-[500] font-body text-[#111102] mb-2"
              >
                Mobile Number
              </label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                className={`w-full h-[36px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.mobile
                    ? "focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-yellow-500 focus:border-yellow-500"
                }`}
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[16px] font-[500] font-body text-[#111102] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`w-full h-[36px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Login Button */}
            <button
              type="submit"
              className="w-full h-[42px] bg-[#F9C301] text-[#111102] text-[16px] font-bold font-body py-2 rounded-[5px] hover:bg-yellow-500 transition"
            >
              LOGIN
            </button>
          </form>

          {/* Links */}
          <div className="text-center text-[12px] mt-4 text-[#111102] font-body">
            <p>
              Don’t have an account?{" "}
              <button
                onClick={handleSignUpClick}
                className="text-[#F9C301] text-[12px] underline"
              >
                Signup
              </button>
            </p>
            <p>
              <a href="#" className="text-[#111102] text-[12px] underline">
                Forgot Password?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
