"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

interface ICommonLoginPageProps {
  type: "buyer" | "vendor";
}

export const CommonLoginPage: React.FC<ICommonLoginPageProps> = ({ type }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Yup schema for validation
  const schema = Yup.object().shape({
    mobile: Yup.string()
      .required("Mobile number is required.")
      .matches(
        /^0\d{9}$/,
        "Mobile number must start with 0 and contain exactly 10 digits."
      ),
    password: Yup.string()
      .required("Password is required.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/,
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character."
      ),
  });

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Form submission handler
  const onSubmit = (data: { mobile: string; password: string }) => {
    console.log("Form submitted:", data);
    // login logic here
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div
      className="bg-white relative md:px-20 px-5 py-5 md:py-[63px] overflow-hidden h-[100%]"
      id="login"
    >
      <div className="absolute top-4 md:right-12 right-5 flex md:space-x-6 space-x-3">
        <Link
          href="/user/login"
          className={`
            ${type === "buyer" ? "text-[#F9C301]" : "text-[#111102]"}
            font-bold font-body text-[12px] md:text-[16px]`}
        >
          Buyer
        </Link>
        <Link
          href="/vendor/login"
          className={`
            ${type === "vendor" ? "text-[#F9C301]" : "text-[#111102]"}
            font-bold font-body text-[12px] md:text-[16px]`}
        >
          Vendor
        </Link>
      </div>

      {/* Buyer Login Heading */}
      <div className="top-[10%] w-full md:mb-5 mb-3 md:mt-5 mt-5">
        <h1 className="text-center text-[16px] md:text-[24px] font-body font-bold text-[#111102]">
          {type === "buyer" ? "Buyer" : "Vendor"} Login
        </h1>
      </div>

      {/* Login Form */}
      <div className="flex justify-center h-full">
        <div className="bg-[#F8F8F8] md:w-[459px] w-[328px] h-auto rounded-[15px] shadow-md md:p-8 p-6 flex flex-col justify-center items-center">
          {/* Input Fields */}
          <form
            className="md:space-y-6 space-y-5 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label
                htmlFor="mobile"
                className="block text-[12px] md:text-[16px] font-[500] font-body text-[#111102] mb-2"
              >
                Mobile Number
              </label>
              <Controller
                name="mobile"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="mobile"
                    className={`w-full md:h-[36px] h-[28px] text-[10px] md:text-[14px] font-body placeholder:text-[10px] md:placeholder:text-[14px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 md:py-1 focus:outline-none focus:ring-2 ${
                      errors.mobile
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="Enter mobile number"
                  />
                )}
              />
              {errors.mobile && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[12px] md:text-[16px] font-[500] font-body text-[#111102] mb-2"
              >
                Password
              </label>
              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div className="relative">
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`w-full md:h-[36px] h-[28px] text-[10px] md:text-[14px] font-body placeholder:text-[10px] md:placeholder:text-[14px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 md:py-1 focus:outline-none focus:ring-2 ${
                        errors.password
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-[52%] transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <EyeOff className="size-[12px] md:size-[16px]" />
                      ) : (
                        <Eye className="size-[12px] md:size-[16px]" />
                      )}
                    </button>
                  </div>
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full h-[36px] md:h-[42px] bg-[#F9C301] text-[#111102] md:text-[16px] text-[12px] font-bold font-body py-2 rounded-[5px] hover:bg-yellow-500 transition"
            >
              LOGIN
            </button>
          </form>

          {/* Links */}
          <div className="text-center text-[8px] md:text-[12px] md:mt-4 mt-2 text-[#111102] font-body">
            <p>
              Don’t have an account?{" "}
              <Link
                href={`/${type === "buyer" ? "user" : "vendor"}/register`}
                className="text-[#F9C301] text-[8px] md:text-[12px] underline"
              >
                Signup
              </Link>
            </p>
            <p>
              <a
                href="#"
                className="text-[#111102] text-[8px] md:text-[12px] underline"
              >
                Forgot Password?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
