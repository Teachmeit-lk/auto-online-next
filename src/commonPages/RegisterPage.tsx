"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux"; // Add this
import { SignupRequest } from "@/interfaces/requests/authRequests"; // Adjust path
import { signup } from "@/service/authService";
import { setUser } from "@/app/store/slice/authslice";
import { PasswordInput } from "@/components";

interface ICommonRegisterPageProps {
  type: "buyer" | "vendor";
}

export const CommonRegisterPage: React.FC<ICommonRegisterPageProps> = ({
  type,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Add error state
  const router = useRouter();
  const dispatch = useDispatch(); // Add Redux dispatch

  // Updated Yup schema with all required fields
  const schema = Yup.object().shape({
    firstname: Yup.string().required("First name is required."),
    lastname: Yup.string().required("Last name is required."),
    email: Yup.string().email("Invalid email format").required("Email is required."),
    address: Yup.string().required("Address is required."),
    city: Yup.string().required("City is required."),
    district: Yup.string().required("District is required."),
    zipCode: Yup.string().required("Zip code is required."),
    NIC: Yup.string().required("NIC is required."),
    mobileNumber: Yup.string()
      .required("Mobile number is required.")
      .matches(
        /(^0\d{9}$)|^\+94\d{9}$/,
        "Mobile number must start with 0 or +94 and contain exactly 10 digits."
      ),
    whatsappNumber: Yup.string()
      .required("WhatsApp number is required.")
      .matches(
        /(^0\d{9}$)|^\+94\d{9}$/,
        "WhatsApp number must start with 0 or +94 and contain exactly 10 digits."
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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Updated onSubmit with API call and state management
  const onSubmit = async (data: {
    firstname: string;
    lastname: string;
    email: string;
    address: string;
    city: string;
    district: string;
    zipCode: string;
    NIC: string;
    mobileNumber: string;
    whatsappNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setErrorMessage(null); // Reset error message
      const signupData: SignupRequest = {
        firstName: data.firstname,
        lastName: data.lastname,
        phone: data.mobileNumber,
        email: data.email,
        password: data.password,
        whatsApp: data.whatsappNumber,
        address: data.address,
        city: data.city,
        district: data.district,
        zipCode: data.zipCode,
        NIC: data.NIC,
      };
      const response = await signup(signupData, type);
      const user = {
        userId: response.data.user.id,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
        email: response.data.user.email,
        role: response.data.user.role as "buyer" | "vendor" | "admin",
      };
      dispatch(setUser(user));
      if (type === "buyer") {
        router.push("/user/search-vendors");
      } else {
        router.push("/vendor/products");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
      console.error("Signup error:", error);
    }
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
      <div className="absolute top-4 right-5 md:right-12 flex md:space-x-6 space-x-3">
        <Link
          href="/user/register"
          className={`
            ${type === "buyer" ? "text-[#F9C301]" : "text-[#111102]"}
            font-bold font-body text-[12px] md:text-[16px]`}
        >
          Buyer
        </Link>
        <Link
          href="/vendor/register"
          className={`
            ${type === "vendor" ? "text-[#F9C301]" : "text-[#111102]"}
            font-bold font-body text-[12px] md:text-[16px]`}
        >
          Vendor
        </Link>
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-center text-[16px] md:text-[24px] font-bold font-body text-[#111102] mb-3 md:mb-5 mt-5 md:mt-5">
          {type === "buyer" ? "Buyer" : "Vendor"} Register
        </h1>

        <div className="bg-[#F8F8F8] w-full md:w-full md:py-12 md:px-14 py-6 px-5 rounded-[10px] md:rounded-[15px] shadow-md flex flex-col justify-center items-center">
          {errorMessage && (
            <p className="text-red-500 text-[12px] md:text-[14px] mb-4">{errorMessage}</p>
          )}
          <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
            {/* First Name and Last Name */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label
                  htmlFor="firstName"
                  className="block text-[12px] RootState md:text-[16px] font-medium font-body text-[#111102] mb-2"
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
                  <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Email
              </label>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    id="email"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.email
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="Email"
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Address
              </label>
              <Controller
                name="address"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="address"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.address
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="Address"
                  />
                )}
              />
              {errors.address && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                City
              </label>
              <Controller
                name="city"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="city"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.city
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="City"
                  />
                )}
              />
              {errors.city && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.city.message}
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

            {/* Zip Code */}
            <div>
              <label
                htmlFor="zipCode"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Zip Code
              </label>
              <Controller
                name="zipCode"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="zipCode"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.zipCode
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="Zip Code"
                  />
                )}
              />
              {errors.zipCode && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>

            {/* NIC */}
            <div>
              <label
                htmlFor="NIC"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                NIC
              </label>
              <Controller
                name="NIC"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    id="NIC"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] placeholder:text-[10px] md:placeholder:text-[14px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 py-2 focus:ring-2 focus:outline-none ${
                      errors.NIC
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                    placeholder="NIC"
                  />
                )}
              />
              {errors.NIC && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.NIC.message}
                </p>
              )}
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
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
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
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
 _

                  {errors.whatsappNumber.message}
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
                      <PasswordInput
                        {...field}
                        id="password"
                        placeholder="Password"
                        inputClassName="h-[28px] md:h-[40px] py-2"
                        error={!!errors.password}
                      />
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
                      <PasswordInput
                        {...field}
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        inputClassName="h-[28px] md:h-[40px] py-2"
                        error={!!errors.confirmPassword}
                      />
                    )}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full h-[36px] md:h-[42px] bg-[#F9C301] text-[#111102] font-bold text-[12px] md:text-[16px] font-body py-2 rounded-md hover:bg-yellow-500 transition"
            >
              REGISTER
            </button>
          </form>

          <p className="text-center font-body text-[8px] md:text-[12px] md:mt-4 mt-2 text-[#111102]">
            Already have an account?{" "}
            <Link
              href={`/${type === "buyer" ? "user" : "vendor"}/login`}
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

export default CommonRegisterPage;