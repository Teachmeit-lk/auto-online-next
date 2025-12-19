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
import { MobileNumberInput } from "@/components";

interface ICommonLoginPageProps {
  type: "buyer" | "vendor";
}

export const CommonLoginPage: React.FC<ICommonLoginPageProps> = ({ type }) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth as any);
  const loading = authState.loading as boolean;
  const error = authState.error as string | null;

  // Define validation schemas
  const buyerSchema = Yup.object().shape({
    phone: Yup.string()
      .required("Mobile number is required.")
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

  type LoginFormFields = {
    email?: string;
    phone?: string;
    password: string;
  };

  // Initialize react-hook-form with dynamic schema
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormFields>({
    resolver: yupResolver(schema as any),
  });

  const onSubmit = async (data: any) => {
    try {
      const loginData: LoginRequest =
        type === "buyer"
          ? { phone: data.phone, password: data.password }
          : { email: data.email, password: data.password };

      const result = await dispatch(
        loginUserAsync({
          credentials: loginData,
          userType: type,
        }) as any
      );

      if (loginUserAsync.fulfilled.match(result)) {
        console.log("Firebase login successful");

        const pendingQuotation = localStorage.getItem("pendingQuotation");

        if (type === "buyer" && pendingQuotation) {
          try {
            const parsed = JSON.parse(pendingQuotation);

            if (parsed.returnUrl) {
              router.push(parsed.returnUrl);
              return;
            }
          } catch (error) {
            console.error("Error parsing pending quotation:", error);
            localStorage.removeItem("pendingQuotation");
          }
        }

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
      className="bg-white relative md:px-20 px-5 py-5 md:py-[63px] overflow-hidden min-h-screen w-full mx-auto max-w-screen-xl"
      id="login"
    >
      <div className="w-full flex justify-center md:justify-end md:absolute md:top-4 md:right-12 mb-4 md:mb-0 mt-4 md:mt-0">
        <div className="flex border-2 border-[#111102] rounded-md md:rounded-lg overflow-hidden">
          <Link
            href="/user/login"
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
            href="/vendor/login"
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
            className="sm:space-y-6 w-full space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {type === "buyer" ? (
              <div>
                <label
                  htmlFor="phone"
                  className="block text-[12px] md:text-[16px] font-[500] font-body text-[#111102] mb-2"
                >
                  Mobile Number
                </label>
                <Controller
                  name={"phone" as any}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <MobileNumberInput
                      {...field}
                      id="phone"
                      inputClassName="md:h-[36px] h-[28px] md:py-1"
                      placeholder="Enter mobile number"
                      error={!!(errors as any).phone}
                      disabled={loading}
                    />
                  )}
                />
                {(errors as any).phone && (
                  <p className="text-red-500 text-[10px] md:text-[12px] mt-1 break-words whitespace-normal max-w-full">
                    {(errors as any).phone.message as string}
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
                  <p className="text-red-500 text-[10px] md:text-[12px] mt-1 break-words whitespace-normal max-w-full">
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
                <p className="text-red-500 text-[10px] md:text-[12px] mt-1 break-words whitespace-normal max-w-full">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[36px] md:h-[42px] bg-[#F9C301] text-[#111102] md:text-[16px] text-[12px] font-bold font-body py-2 rounded-[5px] transition
                ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-yellow-500"
                }`}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <div className="text-center text-xs md:text-sm md:mt-4 mt-2 text-[#111102] font-body">
            <p>
              Don’t have an account?{" "}
              <Link
                href={`/${type === "buyer" ? "user" : "vendor"}/register`}
                className="text-[#F9C301] underline"
              >
                Signup
              </Link>
            </p>
            {/* <p>
              <a href="#" className="text-[#111102] underline">
                Forgot Password?
              </a>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};
