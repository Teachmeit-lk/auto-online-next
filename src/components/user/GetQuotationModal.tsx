"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus, Camera } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller, useWatch } from "react-hook-form";
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
import { log } from "console";

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
  mode?: "direct" | "search";
  onSearchSubmit?: (
    filters: {
      country: string;
      category: string;
      district: string;
    },
    fullData?: any
  ) => void;
  preSelectedCategory?: string;
}

export const GetQuotationModal: React.FC<IGetQuotationModalProps> = ({
  isOpen,
  onClose,
  vendor,
  mode = "direct",
  onSearchSubmit,
  preSelectedCategory,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    images: Yup.array()
      .of(Yup.mixed())
      .min(1, "At least one image is required")
      .max(5, "Maximum 5 images allowed")
      .required("Images are required"),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    shouldUnregister: false,
  });

  const watchCountry = useWatch({ control, name: "country" });
  const watchBrand = useWatch({ control, name: "brand" });

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
    images: File[];
  }) => {
    if (mode === "search" && onSearchSubmit) {
      let imageDataArray: Array<{ data: string; name: string; type: string }> =
        [];
      const filesToProcess =
        selectedFiles.length > 0 ? selectedFiles : data.images || [];

      if (filesToProcess && filesToProcess.length > 0) {
        imageDataArray = await Promise.all(
          filesToProcess.map(
            (file) =>
              new Promise<{ data: string; name: string; type: string }>(
                (resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    resolve({
                      data: reader.result as string,
                      name: file.name,
                      type: file.type,
                    });
                  };
                  reader.onerror = () => reject(reader.error);
                  reader.readAsDataURL(file);
                }
              )
          )
        );
      }

      const { images, ...dataWithoutImage } = data;

      console.log("Images", imageDataArray);

      onSearchSubmit(
        {
          country: data.country,
          category: data.category,
          district: data.district,
        },
        {
          ...dataWithoutImage,
          imageDataArray,
        }
      );

      onClose();
      return;
    }

    if (!currentUser?.id) return;

    const files = data.images;
    let uploadedUrls: string[] = [];

    if (files && files.length > 0) {
      console.log("Uploading images:", files.length);
      const compressedFiles = await Promise.all(
        files.map((file) =>
          file.type.startsWith("image/")
            ? FirebaseStorageService.compressImage(file, 1920, 1080, 0.7)
            : Promise.resolve(file)
        )
      );

      const requestId = `req_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const uploadResults = await FirebaseStorageService.uploadQuotationImages(
        currentUser.id,
        requestId,
        compressedFiles
      );

      uploadedUrls = uploadResults.map((result) => result.url);
      console.log("Images uploaded:", uploadedUrls);
    }

    const doc: Omit<QuotationRequest, "id" | "createdAt" | "updatedAt"> = {
      buyerId: currentUser.id,
      buyerName: `${currentUser.firstName || ""} ${
        currentUser.lastName || ""
      }`.trim(),
      buyerEmail: currentUser.email || "",
      buyerPhone: currentUser.phone || "",
      vendorId: vendor?.id || null,
      vendorName: vendor?.firstName || null,
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
      attachedImages: uploadedUrls.length > 0 ? uploadedUrls : [],
      status: "pending",
      quotationsReceived: 0,
      isActive: true,
    } as any;

    console.log("logs: ", doc);

    await FirestoreService.create<QuotationRequest>(
      COLLECTIONS.QUOTATION_REQUESTS,
      doc
    );

    setLastSubmission({ data, fileUrl: uploadedUrls[0] || "" });
    setWhatsAppModalOpen(true);

    onClose();
  };

  // useEffect(() => {
  //   if (!isOpen) {
  //     reset();
  //     setSelectedFiles([]);
  //     imagePreviews.forEach((url) => URL.revokeObjectURL(url));
  //     setImagePreviews([]);
  //   }
  // }, [isOpen, reset]);

  useEffect(() => {
    if (isOpen && selectedFiles.length > 0) {
      setValue("images", selectedFiles, { shouldValidate: false });
    }
  }, [isOpen, selectedFiles, setValue]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleModalClose = () => {
    onClose();
  };

  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<string[]>([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState<string[]>([]);
  const [measurementOptions, setMeasurementOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [vendorCategoryOptions, setVendorCategoryOptions] = useState<any[]>([]);
  const [filteredBrandOptions, setFilteredBrandOptions] = useState<string[]>(
    []
  );
  const [filteredCountryOptions, setFilteredCountryOptions] = useState<
    string[]
  >([]);
  const [brandData, setBrandData] = useState<any[]>([]);

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

      // Store full brand data
      setBrandData(brands || []);

      const countries = Array.from(
        new Set((brands || []).map((b: any) => b.country).filter(Boolean))
      );
      setCountryOptions(countries);
      setFilteredCountryOptions(countries);

      const brandNames = Array.from(
        new Set((brands || []).map((b: any) => b.name).filter(Boolean))
      );
      setBrandOptions(brandNames);
      setFilteredBrandOptions(brandNames);

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

  // Filter brands when country changes
  useEffect(() => {
    if (!brandData.length) {
      setFilteredBrandOptions(brandOptions);
      return;
    }

    if (!watchCountry) {
      setFilteredBrandOptions(brandOptions);
      return;
    }

    const filtered = brandData
      .filter((b: any) => b.country === watchCountry)
      .map((b: any) => b.name);

    setFilteredBrandOptions(filtered);

    if (watchBrand && !filtered.includes(watchBrand)) {
      setValue("brand", "");
    }
  }, [watchCountry, watchBrand, brandData, brandOptions, setValue]);

  useEffect(() => {
    if (!brandData.length) {
      setFilteredCountryOptions(countryOptions);
      return;
    }

    if (!watchBrand) {
      setFilteredCountryOptions(countryOptions);
      return;
    }

    const brandObj = brandData.find((b: any) => b.name === watchBrand);

    if (brandObj && brandObj.country) {
      if (watchCountry !== brandObj.country) {
        setValue("country", brandObj.country);
      }

      const countriesWithBrand = Array.from(
        new Set(
          brandData
            .filter((b: any) => b.name === watchBrand)
            .map((b: any) => b.country)
            .filter(Boolean)
        )
      );
      setFilteredCountryOptions(countriesWithBrand);
    }
  }, [watchBrand, watchCountry, brandData, countryOptions, setValue]);

  useEffect(() => {
    if (isOpen && mode === "search" && preSelectedCategory) {
      setValue("category", preSelectedCategory);
    }
  }, [isOpen, mode, preSelectedCategory, setValue]);

  useEffect(() => {
    if (mode === "search") {
      setVendorCategoryOptions(allCategories);
      return;
    }

    if (!vendor || !allCategories.length) {
      setVendorCategoryOptions([]);
      return;
    }

    const vendorCatIds = (vendor.mainCategories || []) as string[];

    const matched = allCategories.filter(
      (c: any) => vendorCatIds.includes(c.id) || vendorCatIds.includes(c.name)
    );

    setVendorCategoryOptions(matched);
  }, [vendor, allCategories, mode]);

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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full h-auto md:h-[95vh] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            {mode === "search"
              ? "Get Quotation"
              : vendorDisplayName
              ? `${vendorDisplayName} - Get Quotation`
              : "Get Quotation"}
          </Dialog.Title>

          <div className="sm:h-full h-[600px] overflow-y-auto no-scrollbar">
            <form
              className="sm:grid sm:grid-cols-3 sm:space-y-0 space-y-2  gap-y-4 gap-x-8 bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 mb-11"
              onSubmit={handleSubmit(onSubmit)}
            >
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
                        Select Category
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

              {/* Vehicle Country */}
              <div className="col-span-2">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Country of Manufacturing (Vehicle)
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
                      {filteredCountryOptions.map((c) => (
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
                      {filteredBrandOptions.map((b) => (
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
                <label className="text-[12px] font-body font-[500] text-[#111102] block mb-2">
                  Upload Images (Max 5)
                </label>
                <Controller
                  name="images"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <>
                      <div
                        className={`flex items-center justify-center w-full h-[40px] p-2 border border-dashed border-[#D1D1D1] rounded-[3px] cursor-pointer bg-[#FEFEFE] 
                          ${
                            errors.images
                              ? "border-red-500"
                              : "hover:border-[#F9C301]"
                          }`}
                      >
                        <Camera size="16px" color="#5B5B5B" />

                        <input
                          type="file"
                          accept=".jpg, .png, .jpeg"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              // Limit to 5 images
                              const limitedFiles = files.slice(
                                0,
                                5 - selectedFiles.length
                              );
                              const newFiles = [
                                ...selectedFiles,
                                ...limitedFiles,
                              ].slice(0, 5);

                              field.onChange(newFiles);
                              setSelectedFiles(newFiles);

                              // Create previews for new files
                              const newPreviews = limitedFiles.map((file) =>
                                URL.createObjectURL(file)
                              );
                              setImagePreviews((prev) =>
                                [...prev, ...newPreviews].slice(0, 5)
                              );
                            }
                          }}
                          className="hidden"
                          id="file-upload-multiple"
                        />
                        <label
                          htmlFor="file-upload-multiple"
                          className="cursor-pointer text-[#5B5B5B] font-body text-[10px] pl-1 mt-[2px]"
                        >
                          {selectedFiles.length > 0
                            ? `${selectedFiles.length} image(s) selected`
                            : "Choose images to upload (jpg and png files only, max 5)"}
                        </label>
                      </div>

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-5 gap-2">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded-[3px] border border-[#D1D1D1]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  // Remove specific image
                                  const newFiles = selectedFiles.filter(
                                    (_, i) => i !== index
                                  );
                                  const newPreviews = imagePreviews.filter(
                                    (_, i) => i !== index
                                  );

                                  // Revoke the removed preview URL
                                  URL.revokeObjectURL(imagePreviews[index]);

                                  setSelectedFiles(newFiles);
                                  setImagePreviews(newPreviews);
                                  field.onChange(newFiles);

                                  // Reset file input if no files left
                                  if (newFiles.length === 0) {
                                    const fileInput = document.getElementById(
                                      "file-upload-multiple"
                                    ) as HTMLInputElement;
                                    if (fileInput) fileInput.value = "";
                                  }
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clear All Button */}
                      {selectedFiles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            imagePreviews.forEach((url) =>
                              URL.revokeObjectURL(url)
                            );
                            setImagePreviews([]);
                            setSelectedFiles([]);
                            field.onChange([]);
                            const fileInput = document.getElementById(
                              "file-upload-multiple"
                            ) as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          className="mt-2 text-[10px] text-red-500 hover:text-red-700 font-body"
                        >
                          Clear All Images
                        </button>
                      )}
                    </>
                  )}
                />

                {/* Error Message */}
                {errors.images && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.images.message}
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
