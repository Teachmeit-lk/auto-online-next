"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { LoginRequest } from "@/interfaces/requests/authRequests";
import { loginUserAsync } from "@/app/store/slice/authslice";
import { RootState } from "@/app/store/store";
import { PasswordInput } from "@/components";

interface ICommonLoginPageProps {
  type: "buyer" | "vendor";
}

export const CommonLoginPage: React.FC<ICommonLoginPageProps> = ({ type }) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Define validation schemas
  const buyerSchema = Yup.object().shape({
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
      console.log(`Firebase login attempt for ${type} with:`, data);

      // Construct loginData - both buyer and vendor use email for Firebase Auth
      const loginData: LoginRequest = { 
        email: data.email, 
        password: data.password 
      };

      const result = await dispatch(loginUserAsync({ 
        credentials: loginData, 
        userType: type 
      }) as any);

      if (loginUserAsync.fulfilled.match(result)) {
        console.log("Firebase login successful");
        
        // Redirect based on user type
        if (type === "buyer") {
          router.push("/user/search-vendors");
        } else {
          router.push("/vendor/products");
        }
      }
    } catch (error: any) {
      console.error("Firebase login submission error:", error);
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
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-500 text-[12px] md:text-[14px] text-center">
                {error}
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
                  htmlFor="email"
                  className="block text-[12px] md:text-[16px] font-[500] font-body text-[#111102] mb-2"
                >
                  Email Address
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
                      placeholder="Enter your email address"
                      disabled={loading}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] md:text-[14px] mt-1">
                    {errors.email.message}
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
                      disabled={loading}
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
                  <PasswordInput
                    {...field}
                    id="password"
                    placeholder="Enter password"
                    disabled={loading}
                    inputClassName="md:h-[36px] h-[28px] md:py-1"
                    error={!!errors.password}
                  />
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
              disabled={loading}
              className={`w-full h-[36px] md:h-[42px] bg-[#F9C301] text-[#111102] md:text-[16px] text-[12px] font-bold font-body py-2 rounded-[5px] transition
                ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-yellow-500"}`}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
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