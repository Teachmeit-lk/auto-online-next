"use client";

import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import { PasswordInput } from "@/components";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store/store";
import { updateUserProfile, changePassword } from "@/service/firebaseAuthService";
import { refreshUserProfile } from "@/app/store/slice/authslice";
import { FirestoreService, COLLECTIONS, Category, VehicleBrand, VehicleModel } from "@/service/firestoreService";

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

// Loaded dynamically from Firestore main categories
const categoryOptionsStatic: { value: string; label: string }[] = [];

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
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>(categoryOptionsStatic);
  const [brandOptionsDynamic, setBrandOptionsDynamic] = useState<{ value: string; label: string }[]>([]);
  const [modelOptionsDynamic, setModelOptionsDynamic] = useState<{ value: string; label: string }[]>([]);

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
    currentPassword: Yup.string()
      .when("newPassword", {
        is: (val: string | null | undefined) => !!val && val.length > 0,
        then: (schema) => schema.required("Current password is required."),
        otherwise: (schema) => schema.notRequired(),
      }),
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
    setValue,
  } = useForm<UserProfileFormData>({
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  // Set default values from Firebase profile
  useEffect(() => {
    const mapStringArrayToOptions = (arr?: string[]) => (arr || []).map((v) => ({ value: v, label: v }));
    const initialValues: UserProfileFormData = {
      companyName: currentUser?.firstName || "",
      contactPerson: currentUser?.lastName || "",
      companyMobileNumber: currentUser?.phone || "",
      whatsappNumber: currentUser?.whatsApp || "",
      email: currentUser?.email || "",
      conmpanyBR: currentUser?.conmpanyBR || "",
      locationLink: currentUser?.locationLink || "",
      description: currentUser?.address || "",
      currentPassword: "",
      newPassword: "",
      district: currentUser?.district || "",
      mainCategories: mapStringArrayToOptions(currentUser?.mainCategories),
      vehicleBrand: mapStringArrayToOptions(currentUser?.vehicleBrand),
      vehicleModel: mapStringArrayToOptions(currentUser?.vehicleModel),
    };

    setDefaultValues(initialValues);
    reset(initialValues);
  }, [reset, currentUser]);

  // Load main categories from Firestore
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await FirestoreService.getAll<Category>(COLLECTIONS.CATEGORIES, undefined, "sortOrder", "asc");
        if (!mounted) return;
        const opts = (list || []).map((c) => ({ value: c.id || c.name, label: c.name }));
        setCategoryOptions(opts);
      } catch (e) {
        // silent fail
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Re-map saved IDs to option labels once options are loaded
  useEffect(() => {
    if (!currentUser) return;
    if (categoryOptions.length) {
      const selected = (currentUser.mainCategories || [])
        .map((id: string) => categoryOptions.find((o) => o.value === id))
        .filter(Boolean) as { value: string; label: string }[];
      setValue("mainCategories", selected, { shouldValidate: false, shouldDirty: false });
    }
  }, [categoryOptions, currentUser, setValue]);

  useEffect(() => {
    if (!currentUser) return;
    if (brandOptionsDynamic.length) {
      const selected = (currentUser.vehicleBrand || [])
        .map((id: string) => brandOptionsDynamic.find((o) => o.value === id))
        .filter(Boolean) as { value: string; label: string }[];
      setValue("vehicleBrand", selected, { shouldValidate: false, shouldDirty: false });
    }
  }, [brandOptionsDynamic, currentUser, setValue]);

  useEffect(() => {
    if (!currentUser) return;
    if (modelOptionsDynamic.length) {
      const selected = (currentUser.vehicleModel || [])
        .map((id: string) => modelOptionsDynamic.find((o) => o.value === id))
        .filter(Boolean) as { value: string; label: string }[];
      setValue("vehicleModel", selected, { shouldValidate: false, shouldDirty: false });
    }
  }, [modelOptionsDynamic, currentUser, setValue]);

  // Load vehicle brands from Firestore
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await FirestoreService.getAll<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, undefined, "sortOrder", "asc");
        if (!mounted) return;
        const opts = (list || []).map((b) => ({
          value: b.id || b.name,
          label: b.country ? `${b.name} - ${b.country}` : b.name,
        }));
        setBrandOptionsDynamic(opts);
      } catch (e) {
        // silent fail
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load vehicle models from Firestore
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await FirestoreService.getAll<VehicleModel>(COLLECTIONS.VEHICLE_MODELS, undefined, "name", "asc");
        if (!mounted) return;
        const opts = (list || []).map((m) => ({ value: m.id || m.name, label: m.name }));
        setModelOptionsDynamic(opts);
      } catch (e) {
        // silent fail
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!defaultValues) return <p>Loading...</p>;

  const handleEditToggle = () => {
    if (isEditable) {
      handleSubmit(onSubmit)();
    } else {
      setIsEditable(true);
    }
  };
  const onSubmit: SubmitHandler<Partial<UserProfileFormData>> = async (data) => {
    try {
      // Update password first if requested
      if (data.newPassword && data.currentPassword) {
        await changePassword(data.currentPassword, data.newPassword);
      }

      // Persist profile fields supported by backend
      if (currentUser?.id || currentUser?.userId) {
        const userId = (currentUser.id || currentUser.userId) as string;
        const updates: any = {
          email: data.email,
          phone: data.companyMobileNumber,
          whatsApp: data.whatsappNumber,
          district: data.district,
          address: data.description || "",
          conmpanyBR: data.conmpanyBR || "",
          locationLink: data.locationLink || "",
          mainCategories: (data.mainCategories || []).map((o) => o.value),
          vehicleBrand: (data.vehicleBrand || []).map((o) => o.value),
          vehicleModel: (data.vehicleModel || []).map((o) => o.value),
        };
        await updateUserProfile(userId, updates);
        await (dispatch as any)(refreshUserProfile());
      }

      alert("Profile updated successfully.");
      setIsEditable(false);
      reset({
        ...data,
        locationLink: data.locationLink ?? "",
      });
    } catch (err: any) {
      alert(err?.message || "Failed to update profile.");
    }
  };
  return (
    <div className="w-full py-10 px-4 md:px-12 bg-white max-w-screen-xl mx-auto">
      <div className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px]">
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Vendor Profile - {control._formValues.companyName}
        </h1>
        <form
          onSubmit={
            isEditable ? handleSubmit(onSubmit) : (e) => e.preventDefault()
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* First Name */}
          <div>
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
              <p className="text-red-500 text-sm mt-1">
                {errors.district.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
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
                  menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                  menuPosition="fixed"
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

                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
              Vehicle Brand
            </label>
            <Controller
              name="vehicleBrand"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={brandOptionsDynamic}
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
            <label className="block text-[14px] font-medium font-body text-[#111102]">
              Vehicle Model
            </label>
            <Controller
              name="vehicleModel"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={modelOptionsDynamic}
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
          <div className="col-span-1 md:col-span-2 mt-2 flex justify-end gap-3">
            {isEditable && (
              <button
                type="button"
                onClick={() => {
                  setIsEditable(false);
                  reset(defaultValues || {} as UserProfileFormData);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-[#111102] bg-white hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleEditToggle}
              className="px-4 py-2 bg-[#F9C301] hover:bg-yellow-500 rounded-md text-sm font-body font-semibold text-[#111102]"
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
