"use client";

import React, { useState } from "react";

export const ContactForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    whatsapp: "",
    message: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      whatsapp: "",
      message: "",
    };

    // Name validation
    if (!name) {
      newErrors.name = "Name is required.";
    } else if (name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    // WhatsApp validation
    if (!whatsapp) {
      newErrors.whatsapp = "WhatsApp number is required.";
    } else if (!/^0\d{9}$/.test(whatsapp)) {
      newErrors.whatsapp =
        "WhatsApp number must start with 0 and contain exactly 10 digits.";
    }

    // Message validation
    if (!message) {
      newErrors.message = "Message is required.";
    } else if (message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long.";
    }

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted successfully:", {
        name,
        email,
        whatsapp,
        message,
      });
    }
  };

  return (
    <div className="bg-white md:px-20 md:pt-10 md:pb-20 px-1 pt-5 pb-10">
      <div className="bg-[#F8F8F8] rounded-[15px] md:w-[639px] w-full max-w-[90%] h-auto mx-auto pl-[24px] pr-[33px] md:pl-[55px] md:pr-16 py-8 md:py-12">
        <h2 className="text-center font-title md:text-[24px] text-[16px] text-[#111102] md:mb-8 mb-5">
          Get In Touch with Us
        </h2>
        <form
          className="md:space-y-6 space-y-3 pl-2 w-full"
          onSubmit={handleSubmit}
        >
          {/* Name Field */}
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="text-[#111102] md:text-[18px] text-[12px] font-body font-[500]"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-2 p-3 w-full text-[#111102]  text-[12px] md:text-[15px]  h-[36px] md:h-[50px] bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                errors.name
                  ? "focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-yellow-500 focus:border-yellow-500"
              }`}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-500  md:text-sm text-[12px]  mt-1">
                {errors.name}
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
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-2 p-3 text-[#111102] w-full text-[12px] md:text-[15px]  h-[36px] md:h-[50px] bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                errors.email
                  ? "focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-yellow-500 focus:border-yellow-500"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500  md:text-sm text-[12px]  mt-1">
                {errors.email}
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
            <input
              type="text"
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className={`mt-2 p-3 text-[#111102] w-full text-[12px] md:text-[15px] h-[36px] md:h-[50px] bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                errors.whatsapp
                  ? "focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-yellow-500 focus:border-yellow-500"
              }`}
              placeholder="Enter your WhatsApp number"
            />
            {errors.whatsapp && (
              <p className="text-red-500 md:text-sm text-[12px]  mt-1">
                {errors.whatsapp}
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
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`mt-2 p-3 text-[#111102] w-full text-[12px] md:text-[15px]  bg-white rounded-[8px] focus:outline-none focus:ring-2 ${
                errors.message
                  ? "focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-yellow-500 focus:border-yellow-500"
              }`}
              placeholder="Enter your message"
            ></textarea>
            {errors.message && (
              <p className="text-red-500 md:text-sm text-[12px] mt-1">
                {errors.message}
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
