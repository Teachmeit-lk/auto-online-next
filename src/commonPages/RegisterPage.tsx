"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { SignupRequest } from "@/interfaces/requests/authRequests";
import { registerUserAsync } from "@/app/store/slice/authslice";
import { RootState } from "@/app/store/store";
import { PasswordInput } from "@/components";
import { MobileNumberInput } from "@/components";

interface ICommonRegisterPageProps {
  type: "buyer" | "vendor";
}

export const CommonRegisterPage: React.FC<ICommonRegisterPageProps> = ({
  type,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth as any);
  const loading = !!authState?.loading;

  // Updated Yup schema with all required fields
  const schema = Yup.object().shape({
    firstname: Yup.string().required("First name is required."),
    lastname: Yup.string().required("Last name is required."),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required."),
    address: Yup.string().required("Address is required."),
    city: Yup.string().required("City is required."),
    district: Yup.string().required("District is required."),
    zipCode: Yup.string().required("Zip code is required."),
    NIC: Yup.string().required("NIC is required."),
    mobileNumber: Yup.string()
      .required("Mobile number is required.")
      .matches(
        /^0\d{9}$/,
        "Enter a valid 10-digit Sri Lankan mobile number (starts with 0)."
      ),
    whatsappNumber: Yup.string()
      .required("WhatsApp number is required.")
      .matches(
        /^0\d{9}$/,
        "Enter a valid 10-digit Sri Lankan mobile number (starts with 0)."
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

  // Submit using Firebase auth (buyers use mobile-as-email internally)
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
      setErrorMessage(null);
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
      const result = await dispatch(
        registerUserAsync({ userData: signupData, userType: type }) as any
      );
      if (registerUserAsync.fulfilled.match(result)) {
        if (type === "buyer") {
          router.push("/user/search-vendors");
        } else {
          router.push("/vendor/products");
        }
      } else if (registerUserAsync.rejected.match(result)) {
        setErrorMessage(result.payload as string);
      }
    } catch (error: any) {
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
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
      className="bg-white min-h-screen relative flex justify-center items-center overflow-hidden px-4 py-6 md:px-6 md:py-10 w-full mx-auto max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl"
      id="register"
    >
      <div className="w-full max-w-[420px] md:max-w-[520px] lg:max-w-[560px] flex flex-col items-center">
        <div className="w-full flex justify-center md:justify-end md:absolute md:top-4 md:right-12 mb-3 md:mb-0 mt-4 md:mt-0">
          <div className="w-full flex justify-center md:justify-end md:absolute md:top-4 md:right-12 mb-4 md:mb-0 mt-4 md:mt-0">
            <div className="flex border-2 border-[#111102] rounded-md md:rounded-lg overflow-hidden">
              <Link
                href="/user/register"
                className={`
                ${
                  type === "buyer"
                    ? "bg-[#F9C301] text-[#111102]"
                    : "bg-white text-[#111102]"
                }
                font-bold font-body text-[12px] md:text-[16px] 
                px-6 md:px-8 py-2 md:py-2.5 
                transition-all duration-200 
                hover:bg-[#F9C301] hover:bg-opacity-50
                min-w-[100px] md:min-w-[120px] 
                text-center
                border-r border-[#111102]`}
              >
                Buyer
              </Link>
              <Link
                href="/vendor/register"
                className={`
                ${
                  type === "vendor"
                    ? "bg-[#F9C301] text-[#111102]"
                    : "bg-white text-[#111102]"
                }
                font-bold font-body text-[12px] md:text-[16px] 
                px-6 md:px-8 py-2 md:py-2.5 
                transition-all duration-200 
                hover:bg-[#F9C301] hover:bg-opacity-50
                min-w-[100px] md:min-w-[120px] 
                text-center`}
              >
                Vendor
              </Link>
            </div>
          </div>
        </div>
        {/* Register Heading */}
        <div className="top-[10%] w-full md:mb-5 mb-3 md:mt-5 mt-5">
          <h1 className="text-center text-[16px] md:text-[24px] font-bold font-body text-[#111102] mb-3 md:mb-5 w-full">
            {type === "buyer" ? "Buyer" : "Vendor"} Register
          </h1>
        </div>

        <div className="bg-[#F8F8F8] w-full md:w-auto md:min-w-[420px] md:py-10 md:px-10 py-6 px-5 rounded-[10px] md:rounded-[15px] shadow-md flex flex-col justify-center items-center">
          {errorMessage && (
            <p className="text-red-500 text-[12px] md:text-[14px] mb-4">
              {errorMessage}
            </p>
          )}
          <form className="space-y-4 w-full" onSubmit={handleSubmit(onSubmit)}>
            {/* First Name and Last Name */}
            <div className="flex flex-row space-x-4">
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

              <Controller
                name="district"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select
                    {...field}
                    id="district"
                    className={`w-full text-[10px] md:text-[14px] h-[28px] md:h-[40px] text-[#111102] bg-[#FEFEFE] rounded-[5px] appearance-none px-3 py-2 md:pt-0 md:pb-0 focus:ring-2 focus:outline-none ${
                      errors.district
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                  >
                    <option value="">Select District</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Matale">Matale</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Hambantota">Hambantota</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Vavuniya">Vavuniya</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                    <option value="Batticaloa">Batticaloa</option>
                    <option value="Ampara">Ampara</option>
                    <option value="Trincomalee">Trincomalee</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Puttalam">Puttalam</option>
                    <option value="Anuradhapura">Anuradhapura</option>
                    <option value="Polonnaruwa">Polonnaruwa</option>
                    <option value="Badulla">Badulla</option>
                    <option value="Monaragala">Monaragala</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kegalle">Kegalle</option>
                  </select>
                )}
              />

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
                  <MobileNumberInput
                    {...field}
                    id="mobileNumber"
                    inputClassName="h-[28px] md:h-[40px] py-2 "
                    placeholder="Mobile Number"
                    error={!!errors.mobileNumber}
                    border={true}
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
                  <MobileNumberInput
                    {...field}
                    id="whatsappNumber"
                    inputClassName="h-[28px] md:h-[40px] py-2"
                    placeholder="WhatsApp Number"
                    error={!!errors.whatsappNumber}
                    border={true}
                  />
                )}
              />
              {errors.whatsappNumber && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
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
                    border={true}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[12px] md:text-[16px] font-medium font-body text-[#111102] mb-2"
              >
                Confirm Password
              </label>

              <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <PasswordInput
                    {...field}
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    inputClassName="h-[28px] md:h-[40px] py-2 "
                    error={!!errors.confirmPassword}
                    border={true}
                  />
                )}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[36px] md:h-[42px] bg-[#F9C301] text-[#111102] font-bold text-[12px] md:text-[16px] font-body py-2 rounded-md transition ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-yellow-500"
              }`}
            >
              {loading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>

          <p className="text-center font-body text-xs md:text-sm md:mt-4 mt-2 text-[#111102]">
            Already have an account?{" "}
            <Link
              href={`/${type === "buyer" ? "user" : "vendor"}/login`}
              className="text-[#F9C301] underline"
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
