"use client";

import React from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

export const ContactForm: React.FC = () => {
  // Yup schema for validation
  const schema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    message: Yup.string().required("Message is required"),
    whatsapp: Yup.string()
      .required("Whatsapp number is required.")
      .matches(
        /^0\d{9}$/,
        "Whatsapp number must start with 0 and contain exactly 10 digits."
      ),
    email: Yup.string()
      .required("Email is required.")
      .matches(
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Enter a valid email address."
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
  const onSubmit = (data: {
    name: string;
    message: string;
    email: string;
    whatsapp: string;
  }) => {
    console.log("Form submitted:", data);
    // submit logic here
  };

  return (
    <div className="bg-white md:px-20 md:pt-10 md:pb-20 px-1 pt-5 pb-10">
      <div className="bg-[#F8F8F8] rounded-[15px] md:w-[639px] w-full max-w-[90%] h-auto mx-auto pl-[24px] pr-[33px] md:pl-[55px] md:pr-16 py-8 md:py-12">
        <h2 className="text-center font-title md:text-[24px] text-[16px] text-[#111102] md:mb-8 mb-5">
          Get In Touch with Us
        </h2>
        <form
          className="md:space-y-6 space-y-3 pl-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Name Field */}
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="text-[#111102] md:text-[18px] text-[12px] font-body font-[500]"
            >
              Name
            </label>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="name"
                  className={`mt-2 p-3 w-full text-[#111102]  text-[12px] md:text-[15px]  h-[36px] md:h-[50px] bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
                  placeholder="Enter your name"
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500  md:text-sm text-[12px]  mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-[#111102] md:text-[18px] text-[12px] font-body font-[500]"
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
                  type="text"
                  id="email"
                  className={`mt-2 p-3 text-[#111102] w-full text-[12px] md:text-[15px]  h-[36px] md:h-[50px] bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
                  placeholder="Enter your email"
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500  md:text-sm text-[12px]  mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* WhatsApp Number Field */}
          <div className="flex flex-col">
            <label
              htmlFor="whatsapp"
              className="text-[#111102] md:text-[18px] text-[12px] font-body font-[500]"
            >
              WhatsApp Number
            </label>
            <Controller
              name="whatsapp"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="whatsapp"
                  className={`mt-2 p-3 text-[#111102] w-full text-[12px] md:text-[15px] h-[36px] md:h-[50px] bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                    errors.whatsapp
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
                  placeholder="Enter your WhatsApp number"
                />
              )}
            />
            {errors.whatsapp && (
              <p className="text-red-500 md:text-sm text-[12px]  mt-1">
                {errors.whatsapp.message}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="flex flex-col">
            <label
              htmlFor="message"
              className="text-[#111102] md:text-[18px] text-[12px] font-body font-[500]"
            >
              Message
            </label>
            <Controller
              name="message"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <textarea
                  {...field}
                  id="message"
                  rows={4}
                  className={`mt-2 p-3 text-[#111102] w-full text-[12px] md:text-[15px]  bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                    errors.message
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  }`}
                  placeholder="Enter your message"
                />
              )}
            />
            {errors.message && (
              <p className="text-red-500 md:text-sm text-[12px] mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col">
            <button
              type="submit"
              className="mt-4 mb-2 w-full bg-[#F9C301] h-[36px] md:h-[50px] text-[#111102] font-body text-[14px] md:text-[18px] font-bold md:py-3 px-4 rounded-[8px] shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-1 focus:ring-[#F9C301] focus:ring-offset-1"
            >
              SEND
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
