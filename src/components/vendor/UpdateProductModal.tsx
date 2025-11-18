"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import {
  FirestoreService,
  COLLECTIONS,
  Product,
  GalleryImage,
} from "@/service/firestoreService";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";

interface IUpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void | Promise<void>;
  product?: Product | null;
  categoryOptions?: Array<{ value: string; label: string }>;
  brandOptions?: Array<{ value: string; label: string }>;
  modelOptions?: Array<{ value: string; label: string }>;
  vehicleTypeOptions?: Array<{ value: string; label: string }>;
}

interface FormValues {
  name: string;
  categoryId: { value: string; label: string } | null;
  brandId: { value: string; label: string } | null;
  modelId: { value: string; label: string } | null;
  vehicleType: { value: string; label: string } | null;
  yearOfManufacturing: string;
  description: string;
  price: number;
  stockQuantity: number;
  vehicleMadeIn: string;
  fuelType: { value: string; label: string } | null;
  measurement: { value: string; label: string } | null;
}

const UpdateProductModal: React.FC<IUpdateProductModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
  product,
  categoryOptions = [],
  brandOptions = [],
  modelOptions = [],
  vehicleTypeOptions = [],
}) => {
  const schema = Yup.object().shape({
    name: Yup.string().required("Product Name is required"),
    categoryId: Yup.mixed().required("Category is required"),
    brandId: Yup.mixed().required("Brand is required"),
    modelId: Yup.mixed().required("Model is required"),
    vehicleType: Yup.mixed().required("Vehicle Type is required"),
    yearOfManufacturing: Yup.string().required("Year is required"),
    description: Yup.string().required("Description is required"),
    price: Yup.number()
      .required("Price is required")
      .min(0, "Price must be positive"),
    stockQuantity: Yup.number()
      .required("Quantity is required")
      .min(0, "Quantity must be positive"),
    vehicleMadeIn: Yup.string(),
    fuelType: Yup.mixed().optional(),
    measurement: Yup.mixed().optional(),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: product
      ? {
          name: product.partName || "",
          categoryId: product.mainCategory
            ? {
                value: String(product.mainCategory || ""),
                label: product.mainCategory || "",
              }
            : null,
          brandId: product.vehicleBrand
            ? {
                value: String(product.vehicleBrand || ""),
                label: product.vehicleBrand || "",
              }
            : null,
          modelId: product.vehicleModel
            ? {
                value: String(product.vehicleModel || ""),
                label: product.vehicleModel || "",
              }
            : null,
          vehicleType: product.vehicleType
            ? { value: product.vehicleType, label: product.vehicleType }
            : null,
          yearOfManufacturing: String(product.yearOfManufacturing || ""),
          description: product.description || "",
          price: product.price || 0,
          stockQuantity: product.stockQuantity || 0,
          vehicleMadeIn: product.vehicleMadeIn || "",
          fuelType: (product as any).fuelType || "",
          measurement: (product as any).measurement || "",
        }
      : {
          name: "",
          categoryId: null,
          brandId: null,
          modelId: null,
          vehicleType: null,
          yearOfManufacturing: "",
          description: "",
          price: 0,
          stockQuantity: 0,
          vehicleMadeIn: "",
          fuelType: "",
          measurement: "",
        },
  });

  const onSubmit = async (data: FormValues) => {
    if (!product?.id) return;

    try {
      const updateData: Partial<Product> = {
        partName: data.name,
        mainCategory: data.categoryId?.value || undefined,
        vehicleBrand: data.brandId?.value || undefined,
        vehicleModel: data.modelId?.value || undefined,
        vehicleType: data.vehicleType?.value || undefined,
        yearOfManufacturing: data.yearOfManufacturing || undefined,
        description: data.description,
        price: data.price,
        stockQuantity: data.stockQuantity,
        vehicleMadeIn: data.vehicleMadeIn,
        images:
          selectedImageUrls && selectedImageUrls.length > 0
            ? selectedImageUrls
            : product.images || [],
        fuelType: data.fuelType?.value || (product as any).fuelType,
        measurement: data.measurement?.value || (product as any).measurement,
      } as Partial<Product>;

      await FirestoreService.update<Product>(
        COLLECTIONS.PRODUCTS,
        product.id,
        updateData
      );
      if (onUpdated) await onUpdated();
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const start = 1945;
    const arr: string[] = [];
    for (let y = currentYear; y >= start; y--) arr.push(String(y));
    return arr;
  }, [currentYear]);

  const handleModalClose = () => {
    reset();
    onClose();
  };

  // Reset form when product changes
  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  const [galleryImages, setGalleryImages] = React.useState<GalleryImage[]>([]);
  const [selectedImageUrls, setSelectedImageUrls] = React.useState<string[]>(
    []
  );
  const [fuelTypeOptions, setFuelTypeOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([]);
  const [measurementOptions, setMeasurementOptions] = React.useState<
    Array<{ value: string; label: string }>
  >([]);

  React.useEffect(() => {
    (async () => {
      try {
        const existing = (product?.images || []) as string[];
        setSelectedImageUrls(existing);
      } catch {}
    })();
  }, [product?.images]);

  React.useEffect(() => {
    (async () => {
      if (!currentUser?.id) return;
      const imgs = await FirestoreService.getAll<GalleryImage>(
        COLLECTIONS.GALLERY,
        [{ field: "vendorId", operator: "==", value: currentUser.id }]
      );
      setGalleryImages(imgs);
    })();
  }, [currentUser?.id]);

  // Load fuel types and measurement units for dropdowns
  React.useEffect(() => {
    (async () => {
      const [fuels, measures] = await Promise.all([
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
      ]);
      setFuelTypeOptions(
        (fuels || []).map((f: any) => ({
          value: String((f as any).id || (f as any).name),
          label: (f as any).name,
        }))
      );
      setMeasurementOptions(
        (measures || []).map((m: any) => ({
          value: String((m as any).id || (m as any).name),
          label: (m as any).name,
        }))
      );
    })();
  }, []);

  const toggleSelectImage = (url: string) => {
    setSelectedImageUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  React.useEffect(() => {
    if (!product || !isOpen) return;
    if (
      categoryOptions.length === 0 ||
      brandOptions.length === 0 ||
      modelOptions.length === 0 ||
      vehicleTypeOptions.length === 0
    )
      return;

    // Find the selected option objects for the current product values
    const categoryId =
      categoryOptions.find(
        (opt) => opt.value === String(product.mainCategory)
      ) || null;
    const brandId =
      brandOptions.find((opt) => opt.value === String(product.vehicleBrand)) ||
      null;
    const modelId =
      modelOptions.find((opt) => opt.value === String(product.vehicleModel)) ||
      null;
    const vehicleType =
      vehicleTypeOptions.find(
        (opt) => opt.value === String(product.vehicleType)
      ) || null;
    const fuelType =
      fuelTypeOptions.find(
        (opt) => opt.value === String((product as any).fuelType)
      ) || null;
    const measurement =
      measurementOptions.find(
        (opt) => opt.value === String((product as any).measurement)
      ) || null;

    reset({
      name: product.partName || "",
      categoryId,
      brandId,
      modelId,
      vehicleType,
      yearOfManufacturing: String(product.yearOfManufacturing || ""),
      description: product.description || "",
      price: product.price || 0,
      stockQuantity: product.stockQuantity || 0,
      vehicleMadeIn: product.vehicleMadeIn || "",
      fuelType,
      measurement,
    });
  }, [
    product,
    isOpen,
    categoryOptions,
    brandOptions,
    modelOptions,
    vehicleTypeOptions,
    fuelTypeOptions,
    measurementOptions,
    reset,
  ]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full md:h-[85vh] h-auto bg-white py-8 px-6 rounded-lg shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-body font-bold mb-5 text-[#111102]">
            Update Product
          </Dialog.Title>
          <form
            className="sm:grid sm:grid-cols-3 no-scrollbar gap-x-5 gap-y-4 bg-[#F8F8F8] rounded-[8px] sm:px-9 px-4 pt-10 pb-11 sm:space-y-0 space-y-2  h-[500px] overflow-y-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Product Name */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Product Name
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Product Name"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Category
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    options={categoryOptions}
                    classNamePrefix="react-select"
                    className="mt-1 text-[10px]"
                  />
                )}
              />
              {errors.categoryId && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Brand */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Brand
              </label>
              <Controller
                name="brandId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    options={brandOptions}
                    classNamePrefix="react-select"
                    className="mt-1 text-[10px]"
                  />
                )}
              />
              {errors.brandId && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.brandId.message}
                </p>
              )}
            </div>

            {/* Model */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Model
              </label>
              <Controller
                name="modelId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    options={modelOptions}
                    classNamePrefix="react-select"
                    className="mt-1 text-[10px]"
                  />
                )}
              />
              {errors.modelId && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.modelId.message}
                </p>
              )}
            </div>

            {/* Vehicle Type */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Vehicle Type
              </label>
              <Controller
                name="vehicleType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    options={vehicleTypeOptions}
                    classNamePrefix="react-select"
                    className="mt-1 text-[10px]"
                  />
                )}
              />
              {errors.vehicleType && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.vehicleType.message}
                </p>
              )}
            </div>

            {/* Year */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Year
              </label>
              <Controller
                name="yearOfManufacturing"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full mt-1 p-2 rounded-md text-[10px] font-body text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.yearOfManufacturing
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  >
                    <option value="" disabled>
                      Select Year
                    </option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.yearOfManufacturing && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.yearOfManufacturing.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Price
              </label>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Enter Price"
                    className={`w-full mt-1 p-2 rounded-md text-[10px] font-body text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.price
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.price && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Quantity
              </label>
              <Controller
                name="stockQuantity"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="Enter Quantity"
                    className={`w-full mt-1 p-2 rounded-md text-[10px] font-body text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.stockQuantity
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.stockQuantity && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>

            {/* Country of Manufacture */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Country of Manufacture
              </label>
              <Controller
                name="vehicleMadeIn"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Country"
                    className={`w-full mt-1 p-2 rounded-md text-[10px] font-body text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.vehicleMadeIn
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.vehicleMadeIn && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.vehicleMadeIn.message}
                </p>
              )}
            </div>

            {/* Fuel Type */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Fuel Type
              </label>
              <Controller
                name="fuelType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    options={fuelTypeOptions}
                    classNamePrefix="react-select"
                    className="mt-1 text-[10px]"
                  />
                )}
              />
              {errors.fuelType && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.fuelType.message}
                </p>
              )}
            </div>

            {/* Measurement */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Measurement
              </label>
              <Controller
                name="measurement"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    options={measurementOptions}
                    classNamePrefix="react-select"
                    className="mt-1 text-[10px]"
                  />
                )}
              />
              {errors.measurement && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.measurement.message}
                </p>
              )}
            </div>

            {/* Images from Gallery (selector) */}
            <div className="col-span-3">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-body font-medium text-[#111102]">
                  Images (select from gallery)
                </label>
                <span className="text-[10px] text-gray-500">
                  Selected: {selectedImageUrls.length}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-6 gap-2 max-h-40 overflow-auto bg-white p-2 rounded border">
                {galleryImages.map((g) => (
                  <button
                    type="button"
                    key={(g as any).id || g.imageUrl}
                    onClick={() => toggleSelectImage(g.imageUrl)}
                    className={`relative w-full h-16 border rounded overflow-hidden ${
                      selectedImageUrls.includes(g.imageUrl)
                        ? "ring-2 ring-yellow-500"
                        : ""
                    }`}
                    title={g.title}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.imageUrl}
                      alt={g.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedImageUrls.includes(g.imageUrl) && (
                      <div className="absolute inset-0 bg-black/30" />
                    )}
                  </button>
                ))}
                {galleryImages.length === 0 && (
                  <div className="col-span-6 text-[10px] text-gray-500">
                    No images in gallery. Use Vendor Gallery to upload.
                  </div>
                )}
              </div>

              {selectedImageUrls.length > 0 && (
                <div className="mt-2">
                  <div className="text-[11px] text-gray-600 mb-1">
                    Selected thumbnails
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedImageUrls.map((url) => (
                      <div
                        key={url}
                        className="relative w-12 h-12 border rounded overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="selected"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSelectImage(url)}
                          className="absolute top-[-1px] right-[-1px] bg-red-600 text-white text-[10px] rounded px-1"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="col-span-3">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Enter Description"
                    rows={3}
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102]  focus:outline-none focus:ring-2 ${
                      errors.description
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="col-span-3 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-[150px] h-[36px] font-[600] font-body text-[12px] rounded-[3px] ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                }`}
              >
                {isSubmitting ? "Updating.." : "Update Product"}
              </button>
            </div>
          </form>

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-yellow-500"
            >
              <CirclePlus className="rotate-45" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export { UpdateProductModal };
