"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

import { ChevronDown } from "lucide-react";

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);

  // Yup schema for validation
  const schema = Yup.object().shape({
    firstname: Yup.string().required("First name is required."),
    lastname: Yup.string().required("Last name is required."),
    district: Yup.string().required("District is required."),
    mobileNumber: Yup.string()
      .required("Mobile number is required.")
      .matches(
        /^0\d{9}$/,
        "Mobile number must start with 0 and contain exactly 10 digits."
      ),
    whatsappNumber: Yup.string()
      .required("WhatsApp number is required.")
      .matches(
        /^0\d{9}$/,
        "WhatsApp number must start with 0 and contain exactly 10 digits."
      ),
    password: Yup.string()
      .required("Password is required.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/,
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character."
      ),
    confirmPassword: Yup.string()
      .required("Confirm password is required.")
      .oneOf([Yup.ref("password")], "Passwords must match."),
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
  const onSubmit = (data: {
    firstname: string;
    lastname: string;
    district: string;
    whatsappNumber: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log("Form submitted:", data);
    // login logic here
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  const toggleConfirmPasswordVisibility = () => {
    setshowConfirmPassword((prevState) => !prevState);
  };

  return (
    <div
      className="bg-white min-h-screen relative flex justify-center items-center overflow-hidden px-5 py-5 sm:px-16 md:px-4 md:py-10"
      id="register"
    >
      {/* Buyer/Vendor Buttons */}
      <div className="absolute top-4 right-5 md:right-12 flex md:space-x-6 space-x-3">
        <a
          href="#"
          className="text-[#F9C301] font-bold font-body text-[12px] md:text-[16px]"
        >
          Buyer
        </a>
        <a
          href="#"
          className="text-[#111102] font-bold font-body text-[12px] md:text-[16px]"
        >
          Vendor
        </a>
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-center text-[16px] md:text-[24px] font-bold font-body text-[#111102] mb-3 md:mb-5 mt-5  md:mt-5">
          Buyer Register
        </h1>

        {/* Gray Container */}
        <div className="bg-[#F8F8F8] w-full md:w-full md:py-12 md:px-14 py-6 px-5 rounded-[10px] md:rounded-[15px] shadow-md flex flex-col justify-center items-center ">
          <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
            {/* First Name and Last Name */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label
                  htmlFor="firstName"
                  className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
                >
                  First Name
                </label>
                <Controller
                  name="firstname"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="firstName"
                      className={`w-full placeholder:text-[10px] text-[10px] md:text-[14px] md:placeholder:text-[14px] h-[28px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                        errors.firstname
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      placeholder="First Name"
                    />
                  )}
                />
                {errors.firstname && (
                  <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                    {errors.firstname.message}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="lastName"
                  className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
                >
                  Last Name
                </label>
                <Controller
                  name="lastname"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="lastname"
                      className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                        errors.lastname
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      placeholder="Last Name"
                    />
                  )}
                />
                {errors.lastname && (
                  <p className="text-red-500 text-[10px] md:text-[14px]  mt-1">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                htmlFor="mobileNumber"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Mobile Number
              </label>
              <Controller
                name="mobileNumber"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="mobileNumber"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.mobileNumber
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="Mobile Number"
                  />
                )}
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-[10px] md:text-[14px]  mt-1">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label
                htmlFor="whatsappNumber"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                WhatsApp Number
              </label>
              <Controller
                name="whatsappNumber"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="whatsappNumber"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.whatsappNumber
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="WhatsApp Number"
                  />
                )}
              />
              {errors.whatsappNumber && (
                <p className="text-red-500 text-[10px] md:text-[14px]  mt-1">
                  {errors.whatsappNumber.message}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label
                htmlFor="district"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                District
              </label>

              <div className="relative">
                <Controller
                  name="district"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <>
                      <select
                        {...field}
                        id="district"
                        className={`w-full text-[10px] md:text-[14px] h-[28px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] appearance-none px-3 py-2 focus:ring-2 focus:outline-none ${
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

                      {/* ChevronDown Icon */}
                      <ChevronDown className="absolute w-[12px] md:w-[16px] right-3 md:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </>
                  )}
                />
              </div>

              {errors.district && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.district.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Password
              </label>
              <div className="relative flex flex-col">
                <div className="flex items-center relative">
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <>
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          id="password"
                          className={`w-full text-[10px] md:text-[14px] placeholder:text-[10px] md:placeholder:text-[14px] h-[28px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
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
                          {showPassword ? (
                            <EyeOff className="w-[12px] md:w-[16px]" />
                          ) : (
                            <Eye className="w-[12px] md:w-[16px]" />
                          )}
                        </button>
                      </>
                    )}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative flex flex-col">
                <div className="flex items-center relative">
                  <Controller
                    name="confirmPassword"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <>
                        <input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          className={`w-full text-[10px] md:text-[14px] placeholder:text-[10px] md:placeholder:text-[14px] h-[28px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
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
                          {showConfirmPassword ? (
                            <EyeOff className="w-[12px] md:w-[16px]" />
                          ) : (
                            <Eye className="w-[12px] md:w-[16px]" />
                          )}
                        </button>
                      </>
                    )}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[10px] md:text-[14px]  mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full h-[36px] md:h-[42px]  bg-[#F9C301] text-[#111102] font-bold text-[12px] md:text-[16px] font-body py-2 rounded-md hover:bg-yellow-500 transition"
            >
              REGISTER
            </button>
          </form>

          {/* Footer */}
          <p className="text-center font-body text-[8px] md:text-[12px] md:mt-4 mt-2 text-[#111102]">
            Already have an account?{" "}
            <Link
              href="/#login"
              className="text-[#F9C301] text-[8px] md:text-[12px] underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
