"use client";

import React, { useState } from "react";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { PasswordInput } from "@/components";

interface UserProfileFormData {
  firstName: string;
  lastName: string;
  nic: string;
  email: string;
  mobileNumber: string;
  whatsappNumber: string;
  currentPassword: string;
  newPassword?: string | null;
  district: string;
}

const UserProfile = () => {
  const [isEditable, setIsEditable] = useState(false);

  // Yup schema for validation
  const schema = Yup.object().shape({
    firstName: Yup.string().required("First name is required."),
    lastName: Yup.string().required("Last name is required."),
    nic: Yup.string()
      .required("NIC is required.")
      .matches(
        /^(([5-9][0-9][0-3,5-8][0-9]{6}[vVxX])|([1-2][0,9][0-9]{2}[0-3,5-8][0-9]{7})|([0-9]{9}[vV]))$/,
        "NIC must be valid. It should be either a 12-digit NIC or 9 digits followed by 'v' or 'V'."
      ),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required."),
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
        "Mobile number must start with 0 and contain exactly 10 digits."
      ),
    currentPassword: Yup.string().required("Current password is required."),
    newPassword: Yup.string()
      .nullable()
      .notRequired()
      .test(
        "is-strong-password",
        "Password must have at least 8 characters, include an uppercase letter, a lowercase letter, and a special character.",
        (value) => !value || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(value)
      ),

    district: Yup.string().required("District is required."),
  });

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "Shehan",
      lastName: "Jayasena",
      nic: "200238924567",
      email: "shehanjayasena98@gmail.com",
      mobileNumber: "0743065580",
      whatsappNumber: "0713856191",
      currentPassword: "Qw12345@",
      newPassword: "",
      district: "Colombo",
    },
  });

  const handleEditToggle = () => {
    if (isEditable) {
      handleSubmit(onSubmit)();
    } else {
      setIsEditable(true);
    }
  };

  const onSubmit = (data: UserProfileFormData) => {
    console.log("Updated Profile:", data);
    setIsEditable(false);
    reset(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white py-20">
      <h1 className="text-center text-[24px] font-bold font-body text-[#111102] mb-6">
        User Profile - {control._formValues.firstName}{" "}
        {control._formValues.lastName}
      </h1>
      <div className="bg-[#F8F8F8] rounded-[15px] w-full max-w-3xl px-12 pt-12 pb-14">
        <form
          onSubmit={
            isEditable ? handleSubmit(onSubmit) : (e) => e.preventDefault()
          }
          className="grid grid-cols-2 gap-6"
        >
          {/* First Name */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              First Name
            </label>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2  ${
                    errors.firstName
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  } ${
                    !isEditable
                      ? "bg-white text-[#5B5B5B]"
                      : "bg-white text-[#111102]"
                  }`}
                />
              )}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Last Name
            </label>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.lastName
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  } ${
                    !isEditable
                      ? "bg-white text-[#5B5B5B]"
                      : "bg-white text-[#111102]"
                  }`}
                />
              )}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* NIC */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              NIC
            </label>
            <Controller
              name="nic"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.nic
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  } ${
                    !isEditable
                      ? "bg-white text-[#5B5B5B]"
                      : "bg-white text-[#111102]"
                  }`}
                />
              )}
            />
            {errors.nic && (
              <p className="text-red-500 text-sm mt-1">{errors.nic.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Email Address
            </label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  } ${
                    !isEditable
                      ? "bg-white text-[#5B5B5B]"
                      : "bg-white text-[#111102]"
                  }`}
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Mobile Number
            </label>
            <Controller
              name="mobileNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.mobileNumber
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  } ${
                    !isEditable
                      ? "bg-white text-[#5B5B5B]"
                      : "bg-white text-[#111102]"
                  }`}
                />
              )}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>

          {/* Whatsapp Number */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Whatsapp Number
            </label>
            <Controller
              name="whatsappNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.whatsappNumber
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  } ${
                    !isEditable
                      ? "bg-white text-[#5B5B5B]"
                      : "bg-white text-[#111102]"
                  }`}
                />
              )}
            />
            {errors.whatsappNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.whatsappNumber.message}
              </p>
            )}
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Current Password
            </label>
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  readOnly
                  inputClassName="px-3 py-2"
                  error={!!errors.currentPassword}
                />
              )}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              New Password
            </label>
            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <PasswordInput
                  {...field}
                  value={field.value || ""}
                  readOnly={!isEditable}
                  inputClassName="px-3 py-2"
                  error={!!errors.newPassword}
                />
              )}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              District
            </label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.district
                      ? "focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-yellow-500 focus:border-yellow-500"
                  } ${
                    !isEditable
                      ? "bg-white text-[#5B5B5B] pointer-events-none"
                      : "bg-white text-[#111102]"
                  }`}
                >
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                </select>
              )}
            />
            {errors.district && (
              <p className="text-red-500 text-sm mt-1">
                {errors.district.message}
              </p>
            )}
          </div>

          {/* Edit / Save Button */}
          <div className="col-span-1 mt-5">
            <button
              type="button"
              onClick={handleEditToggle}
              className="w-full bg-yellow-500 hover:bg-yellow-600 font-bold font-body py-2 px-4 rounded-md shadow-md text-[#111102]"
            >
              {isEditable ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UserProfile;
