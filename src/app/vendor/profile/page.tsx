"use client";

import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";

interface UserProfileFormData {
  companyName: string;
  contactPerson: string;
  companyMobileNumber: string;
  whatsappNumber: string;
  email: string;
  conmpanyBR: string;
  locationLink?: string | null;
  description: string;
  currentPassword: string;
  newPassword?: string | null;
  district: string;
  mainCategories: { value: string; label: string }[];
  vehicleBrand: { value: string; label: string }[];
  vehicleModel: { value: string; label: string }[];
}

const categoryOptions = [
  { value: "filters", label: "Filters" },
  { value: "tyres", label: "Tyres" },
];

const brandOptions = [
  { value: "europe", label: "Europe" },
  { value: "korean", label: "Korean" },
  { value: "china", label: "China" },
];

const modelOptions = [
  { value: "model1", label: "Model1" },
  { value: "model2", label: "Model2" },
  { value: "model3", label: "Model3" },
];

const VendorProfile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [defaultValues, setDefaultValues] =
    useState<UserProfileFormData | null>(null);

  // Yup schema for validation
  const schema = Yup.object().shape({
    companyName: Yup.string().required("Company name is required."),
    contactPerson: Yup.string().required("Contact person is required."),
    conmpanyBR: Yup.string().required("Company BR is required."),
    locationLink: Yup.string().nullable().notRequired(),
    description: Yup.string().required("Description is required."),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required."),
    companyMobileNumber: Yup.string()
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
    mainCategories: Yup.array()
      .default([])
      .min(1, "At least one category is required."),
    vehicleBrand: Yup.array()
      .default([])
      .min(1, "At least one vehicle brand is required."),
    vehicleModel: Yup.array()
      .default([])
      .min(1, "At least one vehicle model is required."),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  // Set default values on mount
  useEffect(() => {
    const initialValues: UserProfileFormData = {
      companyName: "NMK Motors",
      contactPerson: "Praharsha Gangaboda",
      companyMobileNumber: "0753813398",
      whatsappNumber: "0753813398",
      email: "praharsha.lanka@gmail.com",
      conmpanyBR: "PV464564",
      locationLink: "",
      description: "Updated in August 2023/ modified in 18th Aug",
      currentPassword: "Qw12345@",
      newPassword: "",
      district: "Colombo",
      mainCategories: [],
      vehicleBrand: [],
      vehicleModel: [],
    };

    setDefaultValues(initialValues);
    reset(initialValues);
  }, [reset]);

  if (!defaultValues) return <p>Loading...</p>;

  const handleEditToggle = () => {
    if (isEditable) {
      handleSubmit(onSubmit)();
    } else {
      setIsEditable(true);
    }
  };
  const onSubmit: SubmitHandler<Partial<UserProfileFormData>> = (data) => {
    console.log("Updated Profile:", data);
    setIsEditable(false);
    reset({
      ...data,
      locationLink: data.locationLink ?? "",
    });
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white py-20">
      <h1 className="text-center text-[24px] font-bold font-body text-[#111102] mb-6">
        Vendor Profile - {control._formValues.companyName}
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
              Company Name
            </label>
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2  ${
                    errors.companyName
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
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Contact Person
            </label>
            <Controller
              name="contactPerson"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.contactPerson
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
            {errors.contactPerson && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contactPerson.message}
              </p>
            )}
          </div>

          {/* NIC */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Company Mobile Number
            </label>
            <Controller
              name="companyMobileNumber"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.companyMobileNumber
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
            {errors.companyMobileNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.companyMobileNumber.message}
              </p>
            )}
          </div>

          {/* Email */}
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

          {/* Mobile Number */}
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

          {/* Whatsapp Number */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Company BR
            </label>
            <Controller
              name="conmpanyBR"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.conmpanyBR
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
            {errors.conmpanyBR && (
              <p className="text-red-500 text-sm mt-1">
                {errors.conmpanyBR.message}
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
                <input
                  {...field}
                  type="text"
                  readOnly
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.currentPassword
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
                <input
                  {...field}
                  type="text"
                  value={field.value || ""}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.newPassword
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

          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Location Link
            </label>
            <Controller
              name="locationLink"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  value={field.value || ""}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.locationLink
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
            {errors.locationLink && (
              <p className="text-red-500 text-sm mt-1">
                {errors.locationLink.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  readOnly={!isEditable}
                  className={`mt-1 block w-full h-[108px] rounded-md shadow-sm px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.description
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
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Main Categories */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Main Categories
            </label>
            <Controller
              name="mainCategories"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={categoryOptions}
                  isMulti
                  isDisabled={!isEditable}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: errors.mainCategories
                        ? "#ef4444"
                        : state.isFocused
                        ? "#eab308"
                        : "transparent",

                      boxShadow: errors.mainCategories
                        ? "0 0 0 1px #ef4444"
                        : state.isFocused
                        ? "0 0 0 1px #eab308"
                        : "none",

                      backgroundColor: "#ffffff",
                      width: "100%",
                      borderRadius: "8px",
                      "&:hover": {
                        borderColor: errors.mainCategories
                          ? "#ef4444"
                          : state.isFocused
                          ? "#eab308"
                          : "transparent",

                        boxShadow: errors.mainCategories
                          ? "0 0 0 1px #ef4444"
                          : state.isFocused
                          ? "0 0 0 1px #eab308"
                          : "none",
                      },
                    }),

                    menu: (provided) => ({
                      ...provided,
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }),

                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: "#F8F8F8",
                      color: "#111102",
                    }),

                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: "#111102",
                    }),

                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: "#111102",
                      "&:hover": {
                        color: "#111102",
                        backgroundColor: "#e5e7eb",
                      },
                    }),
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm font-body text-sm focus:outline-none ${
                    errors.mainCategories
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
            {errors.mainCategories && (
              <p className="text-red-500 text-sm mt-1">
                {errors.mainCategories.message}
              </p>
            )}
          </div>

          {/* Vehicle Brand */}
          <div>
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Vehicle Brand
            </label>
            <Controller
              name="vehicleBrand"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={brandOptions}
                  isMulti
                  isDisabled={!isEditable}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: errors.vehicleBrand
                        ? "#ef4444"
                        : state.isFocused
                        ? "#eab308"
                        : "transparent",

                      boxShadow: errors.vehicleBrand
                        ? "0 0 0 1px #ef4444"
                        : state.isFocused
                        ? "0 0 0 1px #eab308"
                        : "none",

                      backgroundColor: "#ffffff",
                      width: "100%",
                      borderRadius: "8px",
                      "&:hover": {
                        borderColor: errors.vehicleBrand
                          ? "#ef4444"
                          : state.isFocused
                          ? "#eab308"
                          : "transparent",

                        boxShadow: errors.vehicleBrand
                          ? "0 0 0 1px #ef4444"
                          : state.isFocused
                          ? "0 0 0 1px #eab308"
                          : "none",
                      },
                    }),

                    menu: (provided) => ({
                      ...provided,
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }),

                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: "#F8F8F8",
                      color: "#111102",
                    }),

                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: "#111102",
                    }),

                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: "#111102",
                      "&:hover": {
                        color: "#111102",
                        backgroundColor: "#e5e7eb",
                      },
                    }),
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm  font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.vehicleBrand
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
            {errors.vehicleBrand && (
              <p className="text-red-500 text-sm mt-1">
                {errors.vehicleBrand.message}
              </p>
            )}
          </div>

          {/* Vehicle Model */}
          <div className="">
            <label className="block text-[16px] font-medium font-body text-[#111102]">
              Vehicle Model
            </label>
            <Controller
              name="vehicleModel"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={modelOptions}
                  isMulti
                  isDisabled={!isEditable}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: errors.vehicleModel
                        ? "#ef4444"
                        : state.isFocused
                        ? "#eab308"
                        : "transparent",

                      boxShadow: errors.vehicleModel
                        ? "0 0 0 1px #ef4444"
                        : state.isFocused
                        ? "0 0 0 1px #eab308"
                        : "none",

                      backgroundColor: "#ffffff",
                      width: "100%",
                      borderRadius: "8px",
                      "&:hover": {
                        borderColor: errors.vehicleModel
                          ? "#ef4444"
                          : state.isFocused
                          ? "#eab308"
                          : "transparent",

                        boxShadow: errors.vehicleModel
                          ? "0 0 0 1px #ef4444"
                          : state.isFocused
                          ? "0 0 0 1px #eab308"
                          : "none",
                      },
                    }),

                    menu: (provided) => ({
                      ...provided,
                      borderRadius: "8px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }),

                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: "#F8F8F8",
                      color: "#111102",
                    }),

                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: "#111102",
                    }),

                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: "#111102",
                      "&:hover": {
                        color: "#111102",
                        backgroundColor: "#e5e7eb",
                      },
                    }),
                  }}
                  className={`mt-1 block w-full rounded-md shadow-sm  font-body text-sm focus:outline-none focus:ring-2 ${
                    errors.vehicleModel
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
            {errors.vehicleModel && (
              <p className="text-red-500 text-sm mt-1">
                {errors.vehicleModel.message}
              </p>
            )}
          </div>

          {/* Edit / Save Button */}
          <div className="col-span-1 mt-6">
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
export default VendorProfile;
