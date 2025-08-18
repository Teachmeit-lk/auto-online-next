"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { FirestoreService, COLLECTIONS, Category, VehicleBrand, VehicleModel, GalleryImage } from "@/service/firestoreService";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { ProductService, Product } from "@/service/firestoreService";

interface IAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
}

interface FormValues {
  partName: string;
  mainCategory: { value: string; label: string } | null;
  vehicleBrand: { value: string; label: string } | null;
  vehicleModel: { value: string; label: string } | null;
  vehicleType: { value: string; label: string } | null;
  yearOfManufacturing: string;
  description: string;
}

const AddProductModal: React.FC<IAddProductModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const schema = Yup.object().shape({
    partName: Yup.string().required("Part Name is required"),
    mainCategory: Yup.mixed().required("Main Category is required"),
    vehicleBrand: Yup.mixed().required("Vehicle Brand is required"),
    vehicleModel: Yup.mixed().required("Vehicle Model is required"),
    vehicleType: Yup.mixed().required("Vehicle Type is required"),
    yearOfManufacturing: Yup.string().required(
      "Year of Manufacturing is required"
    ),
    description: Yup.string().required("Description is required"),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  const [categoryOptions, setCategoryOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [brandOptions, setBrandOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [modelOptions, setModelOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [galleryImages, setGalleryImages] = React.useState<GalleryImage[]>([]);
  const [selectedImageUrls, setSelectedImageUrls] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      const [cats, brands, models, types] = await Promise.all([
        FirestoreService.getAll<Category>(COLLECTIONS.CATEGORIES, undefined, "sortOrder", "asc"),
        FirestoreService.getAll<VehicleBrand>(COLLECTIONS.VEHICLE_BRANDS, undefined, "sortOrder", "asc"),
        FirestoreService.getAll<VehicleModel>(COLLECTIONS.VEHICLE_MODELS, undefined, "name", "asc"),
        FirestoreService.getAll<any>(COLLECTIONS.VEHICLE_TYPES, undefined, "name", "asc"),
      ]);
      setCategoryOptions((cats || []).map((c) => ({ value: c.id || c.name, label: c.name })));
      setBrandOptions((brands || []).map((b) => ({ value: b.id || b.name, label: b.country ? `${b.name} - ${b.country}` : b.name })));
      setModelOptions((models || []).map((m) => ({ value: m.id || m.name, label: m.name })));
      setVehicleTypeOptions((types || []).map((t) => ({ value: (t as any).id || (t as any).name, label: (t as any).name })));
    })();
  }, []);

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

  const toggleSelectImage = (url: string) => {
    setSelectedImageUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser?.id) return;
    const product: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      vendorId: currentUser.id,
      partName: data.partName,
      mainCategory: data.mainCategory?.value || "",
      subCategory: "",
      vehicleBrand: data.vehicleBrand?.value || "",
      vehicleModel: data.vehicleModel?.value || "",
      vehicleType: data.vehicleType?.value || "",
      yearOfManufacturing: data.yearOfManufacturing,
      description: data.description,
      images: selectedImageUrls,
      tags: [],
      condition: "new",
      views: 0,
      isApproved: false,
      isActive: true,
    } as any;

    await ProductService.createProduct(product);
    if (onCreated) await onCreated();
    reset();
    setSelectedImageUrls([]);
    onClose();
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] bg-white py-8 px-6 rounded-lg shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-body font-bold mb-5 text-[#111102]">
            Add New Product
          </Dialog.Title>
          <form
            className="grid grid-cols-3 gap-x-5 gap-y-4 bg-[#F8F8F8] rounded-[8px] px-9 pt-10 pb-11"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Part Name */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Part Name
              </label>
              <Controller
                name="partName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Part Name"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.partName
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.partName && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.partName.message}
                </p>
              )}
            </div>

            {/* Main Category */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Main Category
              </label>
              <Controller
                name="mainCategory"
                control={control}
                defaultValue={null}
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
              {errors.mainCategory && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.mainCategory.message}
                </p>
              )}
            </div>

            {/* Vehicle Brand */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Vehicle Brand
              </label>
              <Controller
                name="vehicleBrand"
                control={control}
                defaultValue={null}
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
              {errors.vehicleBrand && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.vehicleBrand.message}
                </p>
              )}
            </div>

            {/* Vehicle Model */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Vehicle Model
              </label>
              <Controller
                name="vehicleModel"
                control={control}
                defaultValue={null}
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
              {errors.vehicleModel && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.vehicleModel.message}
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
                defaultValue={null}
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

            {/* Vehicle Made In - removed per request */}

            {/* Year of Manufacturing */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Year of Manufacturing
              </label>
              <Controller
                name="yearOfManufacturing"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full mt-1 p-2 rounded-md text-[10px] font-body text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.yearOfManufacturing ? "focus:ring-red-500" : "focus:ring-yellow-500"
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

            {/* Description */}
            <div className="col-span-3">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                defaultValue=""
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

            {/* Images from Gallery */}
            <div className="col-span-3">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-body font-medium text-[#111102]">
                  Images (select from gallery)
                </label>
                <span className="text-[10px] text-gray-500">Selected: {selectedImageUrls.length}</span>
              </div>
              <div className="mt-2 grid grid-cols-6 gap-2 max-h-40 overflow-auto bg-white p-2 rounded border">
                {galleryImages.map((g) => (
                  <button
                    type="button"
                    key={(g as any).id || g.imageUrl}
                    onClick={() => toggleSelectImage(g.imageUrl)}
                    className={`relative w-full h-16 border rounded overflow-hidden ${selectedImageUrls.includes(g.imageUrl) ? "ring-2 ring-yellow-500" : ""}`}
                    title={g.title}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover" />
                    {selectedImageUrls.includes(g.imageUrl) && (
                      <div className="absolute inset-0 bg-black/30" />
                    )}
                  </button>
                ))}
                {galleryImages.length === 0 && (
                  <div className="col-span-6 text-[10px] text-gray-500">No images in gallery. Use Vendor Gallery to upload.</div>
                )}
              </div>

              {selectedImageUrls.length > 0 && (
                <div className="mt-2">
                  <div className="text-[11px] text-gray-600 mb-1">Selected thumbnails</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedImageUrls.map((url) => (
                      <div key={url} className="relative w-12 h-12 border rounded overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="selected" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => toggleSelectImage(url)} className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded px-1">x</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="col-span-3 flex justify-center">
              <button
                type="submit"
                className="w-[164px] h-[36px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[14px] rounded-[3px] hover:bg-yellow-500"
              >
                Add Product
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

export { AddProductModal };
