"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  partName: string;
  mainCategory: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleType: string;
  vehicleMadeIn: string;
  yearOfManufacturing: string;
  description: string;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
}) => {
  const schema = Yup.object().shape({
    partName: Yup.string().required("Part Name is required"),
    mainCategory: Yup.string().required("Main Category is required"),
    vehicleBrand: Yup.string().required("Vehicle Brand is required"),
    vehicleModel: Yup.string().required("Vehicle Model is required"),
    vehicleType: Yup.string().required("Vehicle Type is required"),
    vehicleMadeIn: Yup.string().required("Vehicle Made In is required"),
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

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    reset();
    onClose();
    // Add form submission logic here
  };

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
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Main Category"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.mainCategory
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
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
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Vehicle Brand"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102]  focus:outline-none focus:ring-2 ${
                      errors.vehicleBrand
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
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
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Vehicle Model"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102]  focus:outline-none focus:ring-2 ${
                      errors.vehicleModel
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
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
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Vehicle Type"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.vehicleType
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.vehicleType && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.vehicleType.message}
                </p>
              )}
            </div>

            {/* Vehicle Made In */}
            <div className="col-span-1">
              <label className="block text-[12px] font-body font-medium text-[#111102]">
                Vehicle Made in
              </label>
              <Controller
                name="vehicleMadeIn"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter Country of Manufacture"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102]  focus:outline-none focus:ring-2 ${
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
                  <input
                    {...field}
                    type="date"
                    placeholder="Enter Year"
                    className={`w-full mt-1 p-2  rounded-md text-[10px] font-body  text-[#111102] focus:outline-none focus:ring-2 ${
                      errors.yearOfManufacturing
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
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
