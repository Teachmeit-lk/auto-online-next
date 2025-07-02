"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { LoginRequest } from "@/interfaces/requests/authRequests";
import { login } from "@/service/authService";
import { setUser } from "@/app/store/slice/authslice";

interface ICommonLoginPageProps {
  type: "buyer" | "vendor";
}

export const CommonLoginPage: React.FC<ICommonLoginPageProps> = ({ type }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  // Define validation schemas
  const buyerSchema = Yup.object().shape({
    mobile: Yup.string()
      .required("Mobile number is required.")
      .matches(
        /(^0\d{9}$)|^\+94\d{9}$/,
        "Mobile number must either start with 0 and contain exactly 10 digits or start with +94 and contain exactly 11 digits."
      ),
    password: Yup.string()
      .required("Password is required.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/,
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character."
      ),
  });

  const vendorSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required.")
      .email("Invalid email address."),
    password: Yup.string()
      .required("Password is required.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/,
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a special character."
      ),
  });

  // Select schema based on user type
  const schema = type === "buyer" ? buyerSchema : vendorSchema;

  // Initialize react-hook-form with dynamic schema
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      setErrorMessage(null);
      console.log(`Login attempt for ${type} with:`, data);

      // Construct loginData based on user type
      const loginData: LoginRequest = type === "buyer"
        ? { phone: data.mobile, password: data.password }
        : { email: data.email, password: data.password };

      const response = await login(loginData, type);
      console.log("Login successful:", response);

      const { user } = response.data;
      const normalizedRole = user.role?.toLowerCase();

      dispatch(
        setUser({
          id: user.userId || user.buyerId,
          userId: user.userId,
          buyerId: user.buyerId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: normalizedRole as "admin" | "buyer" | "vendor",
          phone: user.phone,
        })
      );

      if (type === "buyer") {
        router.push("/user/search-vendors");
      } else {
        router.push("/vendor/products");
      }
    } catch (error: any) {
      console.error("Login submission error:", error);

      let errorMsg = "Login failed. Please try again.";

      if (error.isServerError) {
        errorMsg = error.message;
      } else if (error.code === 521) {
        errorMsg = "Server is unavailable. Please try again later.";
      } else if (error.message?.includes("Network error")) {
        errorMsg = "Network error. Please check your internet connection.";
      } else if (error.code === 401) {
        errorMsg = error.message || "Invalid credentials. Please check your input.";
      } else if (error.code === 500) {
        errorMsg = "Server error. We are working on a fix, please try again later.";
      } else if (error.code === 404) {
        errorMsg = "The login endpoint was not found. Please contact support.";
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div
      className="bg-white relative md:px-20 px-5 py-5 md:py-[63px] overflow-hidden min-h-screen"
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

      {/* Login Heading */}
      <div className="top-[10%] w-full md:mb-5 mb-3 md:mt-5 mt-5">
        <h1 className="text-center text-[16px] md:text-[24px] font-body font-bold text-[#111102]">
          {type === "buyer" ? "Buyer" : "Vendor"} Login
        </h1>
      </div>

      {/* Login Form */}
      <div className="flex justify-center">
        <div className="bg-[#F8F8F8] md:w-[459px] w-[328px] h-auto rounded-[15px] shadow-md md:p-8 p-6 flex flex-col justify-center items-center">
          {errorMessage && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-500 text-[12px] md:text-[14px] text-center">
                {errorMessage}
              </p>
            </div>
          )}
          <form
            className="md:space-y-6 space-y-5 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            {type === "buyer" ? (
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
                          ? "focus:ring-red-500 border-red-300"
                          : "focus:ring-yellow-500 border-gray-300"
                      } border`}
                      placeholder="Enter mobile number"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                    {errors.mobile.message}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor="email"
                  className="block text-[12px] md:text-[16px] font-[500] font-body text-[#111102] mb-2"
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
                      className={`w-full md:h-[36px] h-[28px] text-[10px] md:text-[14px] font-body placeholder:text-[10px] md:placeholder:text-[14px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 md:py-1 focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "focus:ring-red-500 border-red-300"
                          : "focus:ring-yellow-500 border-gray-300"
                      } border`}
                      placeholder="Enter email address"
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            )}

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
                          ? "focus:ring-red-500 border-red-300"
                          : "focus:ring-yellow-500 border-gray-300"
                      } border`}
                      placeholder="Enter password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-[52%] transform -translate-y-1/2 text-gray-500"
                      disabled={isSubmitting}
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

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-[36px] md:h-[42px] bg-[#F9C301] text-[#111102] md:text-[16px] text-[12px] font-bold font-body py-2 rounded-[5px] transition
                ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-yellow-500"}`}
            >
              {isSubmitting ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

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