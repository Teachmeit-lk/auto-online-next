"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus, Camera } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { FirebaseStorageService } from "@/service/firebaseStorageService";
import {
  FirestoreService,
  COLLECTIONS,
  QuotationRequest,
} from "@/service/firestoreService";
import { buildWhatsAppQuotationUrl } from "../hooks/openWhatsAppWithQuotation";
import { SendWhatsAppConfirmationModal } from "./SendWhatsAppConfirmationModal";

interface Vendor {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  whatsApp?: string;
  email?: string;
  mainCategories?: string[];
}

interface IGetQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
}

export const GetQuotationModal: React.FC<IGetQuotationModalProps> = ({
  isOpen,
  onClose,
  vendor,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{
    data: any;
    fileUrl: string;
  } | null>(null);

  const schema = Yup.object().shape({
    country: Yup.string().required("Country is required"),
    category: Yup.string().required("Category is required"),
    brand: Yup.string().required("Brand is required"),
    model: Yup.string().required("Model is required"),
    vehicletype: Yup.string().required("Vehicle type is required"),
    manufactoringyear: Yup.string().required("Manufacturing Year is required"),
    fueltype: Yup.string().required("Fuel type is required"),
    measurement: Yup.string().required("Measurement is required"),
    noofunits: Yup.number()
      .typeError("Must be a valid number")
      .positive("Must be greater than 0")
      .integer("Must be a whole number")
      .min(1, "Must be at least 1")
      .required("No of units are required"),
    description: Yup.string().required("Description is required"),
    district: Yup.string().required("District is required"),
    image: Yup.mixed().required("Image is required"),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const vendorDisplayName =
    vendor?.companyName ||
    `${vendor?.firstName || ""} ${vendor?.lastName || ""}`.trim() ||
    "Vendor";

  const vendorWhatsApp = vendor?.whatsApp || vendor?.phone || "";

  const onSubmit = async (data: {
    country: string;
    brand: string;
    category: string;
    model: string;
    district: string;
    vehicletype: string;
    manufactoringyear: string;
    fueltype: string;
    measurement: string;
    noofunits: number;
    description: string;
    image: File;
  }) => {
    if (!currentUser?.id) return;

    const file = data.image;
    let uploadedUrl = "";
    if (file) {
      const compressed = file.type.startsWith("image/")
        ? await FirebaseStorageService.compressImage(file, 1920, 1080, 0.7)
        : file;

      const res = await FirebaseStorageService.uploadDocument(
        currentUser.id,
        "quotation",
        compressed
      );
      uploadedUrl = res.url;
    }

    const doc: Omit<QuotationRequest, "id" | "createdAt" | "updatedAt"> = {
      buyerId: currentUser.id,
      buyerName: `${currentUser.firstName || ""} ${
        currentUser.lastName || ""
      }`.trim(),
      buyerEmail: currentUser.email || "",
      buyerPhone: currentUser.phone || "",
      vendorId: vendor?.id,
      vendorName: vendor?.firstName,
      country: data.country,
      brand: data.brand,
      model: data.model,
      category: data.category,
      district: data.district,
      vehicleType: data.vehicletype,
      manufacturingYear: data.manufactoringyear,
      fuelType: data.fueltype,
      measurement: data.measurement,
      numberOfUnits: data.noofunits,
      description: data.description,
      attachedImages: uploadedUrl ? [uploadedUrl] : [],
      status: "pending",
      quotationsReceived: 0,
    } as any;

    await FirestoreService.create<QuotationRequest>(
      COLLECTIONS.QUOTATION_REQUESTS,
      doc
    );

    setLastSubmission({ data, fileUrl: uploadedUrl });
    setWhatsAppModalOpen(true);

    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
      setFileName("");
      setImagePreview("");
    }
  }, [isOpen, reset]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle modal close
  const handleModalClose = () => {
    reset();
    setFileName("");
    setImagePreview("");
    onClose();
  };

  // Dynamic options
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<string[]>([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState<string[]>([]);
  const [measurementOptions, setMeasurementOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [vendorCategoryOptions, setVendorCategoryOptions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [brands, vtypes, fuels, units, models, vendorsList, categories] =
        await Promise.all([
          FirestoreService.getAll<any>(
            COLLECTIONS.VEHICLE_BRANDS,
            undefined,
            "sortOrder",
            "asc"
          ),
          FirestoreService.getAll<any>(
            COLLECTIONS.VEHICLE_TYPES,
            undefined,
            "name",
            "asc"
          ),
          FirestoreService.getAll<any>(
            COLLECTIONS.FUEL_TYPES,
            undefined,
            "name",
            "asc"
          ),
          FirestoreService.getAll<any>(
            COLLECTIONS.MEASUREMENT_UNITS,
            undefined,
            "name",
            "asc"
          ),
          FirestoreService.getAll<any>(
            COLLECTIONS.VEHICLE_MODELS,
            undefined,
            "name",
            "asc"
          ),
          FirestoreService.getAll<any>(COLLECTIONS.USERS, [
            { field: "role", operator: "==", value: "vendor" },
            { field: "isActive", operator: "==", value: true },
          ]),
          FirestoreService.getAll<any>(
            COLLECTIONS.CATEGORIES,
            undefined,
            "sortOrder",
            "asc"
          ),
        ]);

      const countries = Array.from(
        new Set((brands || []).map((b: any) => b.country).filter(Boolean))
      );
      setCountryOptions(countries);

      const brandNames = Array.from(
        new Set((brands || []).map((b: any) => b.name).filter(Boolean))
      );
      setBrandOptions(brandNames);

      setVehicleTypeOptions((vtypes || []).map((t: any) => t.name));
      setFuelTypeOptions((fuels || []).map((t: any) => t.name));
      setMeasurementOptions((units || []).map((t: any) => t.name));
      setModelOptions((models || []).map((m: any) => m.name));

      const districts = Array.from(
        new Set((vendorsList || []).map((v: any) => v.district).filter(Boolean))
      );
      setDistrictOptions(districts);

      setAllCategories(categories);
    })();
  }, []);

  useEffect(() => {
    if (!vendor || !allCategories.length) {
      setVendorCategoryOptions([]);
      return;
    }

    const vendorCatIds = (vendor.mainCategories || []) as string[];

    const matched = allCategories.filter(
      (c: any) => vendorCatIds.includes(c.id) || vendorCatIds.includes(c.name)
    );

    setVendorCategoryOptions(matched);
  }, [vendor, allCategories]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= 1945; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const handleConfirmWhatsApp = () => {
    if (!lastSubmission || !currentUser) return;

    const vendorPhone = vendor?.whatsApp || vendor?.phone || "";

    const waUrl = buildWhatsAppQuotationUrl({
      vendor: {
        id: vendor?.id || "",
        name: vendorDisplayName,
      },
      vendorPhone,
      data: lastSubmission.data,
      currentUser,
      fileUrl: lastSubmission.fileUrl,
    });

    if (waUrl) {
      window.location.href = waUrl;
    }

    setWhatsAppModalOpen(false);
    onClose();
  };

  const handleSkipWhatsApp = () => {
    setWhatsAppModalOpen(false);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full h-auto md:h-[89vh] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            {vendorDisplayName
              ? `${vendorDisplayName} - Get Quotation`
              : "Get Quotation"}
          </Dialog.Title>

          <div className="sm:h-full h-[600px] overflow-y-auto no-scrollbar">
            <form
              className="sm:grid sm:grid-cols-3 sm:space-y-0 space-y-2  gap-y-4 gap-x-8 bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 mb-11"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Vehicle Country */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Country of Manufacturing
                </label>
                <Controller
                  name="country"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      id="country"
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.country
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Country
                      </option>
                      {countryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.country && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Vehicle Brand */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Brand
                </label>
                <Controller
                  name="brand"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      id="brand"
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.brand
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Brand
                      </option>
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.brand && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.brand.message}
                  </p>
                )}
              </div>

              {/* Vehicle Model */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Model
                </label>
                <Controller
                  name="model"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="model"
                      placeholder="Enter vehicle model"
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]  ${
                        errors.model
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.model && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.model.message}
                  </p>
                )}
              </div>

              {/* District */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Customer District
                </label>
                <Controller
                  name="district"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      id="district"
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]
                     ${
                       errors.district
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    >
                      <option value="" className="text-gray-500">
                        Select District
                      </option>
                      {districtOptions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.district && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* Vehicle Type */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Type
                </label>
                <Controller
                  name="vehicletype"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]
                     ${
                       errors.vehicletype
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Type
                      </option>
                      {vehicleTypeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.vehicletype && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.vehicletype.message}
                  </p>
                )}
              </div>

              {/* Year of Manufacturing */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Year of Manufacturing
                </label>
                <Controller
                  name="manufactoringyear"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      id="manufactoringyear"
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.manufactoringyear
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Year
                      </option>
                      {years.map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.manufactoringyear && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.manufactoringyear.message}
                  </p>
                )}
              </div>

              {/* Fuel Type */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Fuel Type
                </label>
                <Controller
                  name="fueltype"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.fueltype
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Fuel
                      </option>
                      {fuelTypeOptions.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.fueltype && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.fueltype.message}
                  </p>
                )}
              </div>

              {/* Measurement */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Measurement
                </label>
                <Controller
                  name="measurement"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.measurement
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                      defaultValue=""
                    >
                      <option value="" className="text-gray-500">
                        Select Unit
                      </option>
                      {measurementOptions.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.measurement && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.measurement.message}
                  </p>
                )}
              </div>

              {/* No of Units */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  No of Units
                </label>
                <Controller
                  name="noofunits"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="noofunits"
                      placeholder="Enter units"
                      min="1"
                      step="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "-" ||
                          e.key === "+" ||
                          e.key === "e" ||
                          e.key === "E"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        const value = target.value;
                        if (
                          value &&
                          (Number(value) <= 0 || value.includes("-"))
                        ) {
                          target.value = "";
                          field.onChange(undefined);
                        }
                      }}
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                      ${
                        errors.noofunits
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.noofunits && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.noofunits.message}
                  </p>
                )}
              </div>

              {/* Vendor Category */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[11px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.category
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    >
                      <option value="" className="text-gray-500">
                        {vendorCategoryOptions.length
                          ? "Select Category"
                          : "No categories configured"}
                      </option>
                      {vendorCategoryOptions.map((c: any) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.category && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="description"
                      rows={3}
                      placeholder="Enter description"
                      className={`w-full h-[53px] mt-1 p-3 text-[11px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.description
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-500 text-[8px]">
                    {errors.description.message}
                  </p>
                )}
              </div>
              {/* Image Upload */}
              <div className="col-span-3">
                <Controller
                  name="image"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <>
                      <div
                        className={`flex items-center justify-center w-full h-[40px] p-2 mt-1 border border-dashed border-[#D1D1D1] rounded-[3px] cursor-pointer bg-[#FEFEFE] 
                    ${
                      errors.image
                        ? "focus:ring-red-500 focus:border-red-500"
                        : "focus:ring-yellow-500 focus:border-yellow-500"
                    }`}
                      >
                        <Camera size="16px" color="#5B5B5B" />

                        <input
                          type="file"
                          accept=".jpg, .png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setFileName(file.name);
                              // Create preview
                              const previewUrl = URL.createObjectURL(file);
                              setImagePreview(previewUrl);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-[#D1D1D1] font-body text-[10px] pl-1 mt-[2px]"
                        >
                          {fileName ||
                            "Choose an Image to upload (jpg and png files only)"}
                        </label>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded-[3px] border border-[#D1D1D1]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview("");
                              setFileName("");
                              field.onChange(undefined);
                              // Reset the file input
                              const fileInput = document.getElementById(
                                "file-upload"
                              ) as HTMLInputElement;
                              if (fileInput) fileInput.value = "";
                            }}
                            className="text-[10px] text-red-500 hover:text-red-700 font-body"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </>
                  )}
                />

                {/* Error Message */}
                {errors.image && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex col-span-3 items-center justify-center mt-4">
                <button
                  type="submit"
                  className={`w-[164px] h-[32px]   font-[600] font-body text-[12px] rounded-[3px]  ${
                    isSubmitting
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#F9C301]"
            >
              <CirclePlus className="rotate-45" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>

      <SendWhatsAppConfirmationModal
        isOpen={whatsAppModalOpen}
        onConfirm={handleConfirmWhatsApp}
        onSkip={handleSkipWhatsApp}
        onClose={() => setWhatsAppModalOpen(false)}
        person="vendor"
      />
    </Dialog.Root>
  );
};
