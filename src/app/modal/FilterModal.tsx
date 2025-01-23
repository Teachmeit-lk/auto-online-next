"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus, Camera } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fileName, setFileName] = useState<string>("");

  const schema = Yup.object().shape({
    country: Yup.string().required("Country is required"),
    model: Yup.string().required("Model is required"),
    district: Yup.string().required("District is required"),
    vehicletype: Yup.string().required("Vehicle type is required"),
    manufactoringyear: Yup.string().required("Manufactoring Year is required"),
    fueltype: Yup.string().required("Fuel type is required"),
    measurement: Yup.string().required("Measurement is required"),
    noofunits: Yup.string().required("No of units are required"),
    description: Yup.string().required("Description is required"),
    image: Yup.string().required("Image is required"),
  });

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Form submission handler
  const onSubmit = (data: {
    country: string;
    model: string;
    district: string;
    vehicletype: string;
    manufactoringyear: string;
    fueltype: string;
    measurement: string;
    noofunits: string;
    description: string;
    image: string;
  }) => {
    console.log("Form submitted:", data);
    // submit logic here
  };

  // Handle modal close
  const handleModalClose = () => {
    reset();
    setFileName("");
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[89vh] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            NMK Motors - Filters
          </Dialog.Title>

          <div className="h-full overflow-y-auto no-scrollbar">
            <form
              className="grid grid-cols-3 gap-y-4 gap-x-8 bg-[#F8F8F8] rounded-[8px] p-8 mb-11"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Vehicle Country */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Country
                </label>
                <Controller
                  name="country"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="country"
                      placeholder="Europe"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.country
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
                      placeholder="Model"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]  ${
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
                  District
                </label>
                <Controller
                  name="district"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="district"
                      placeholder="Colombo"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]
                     ${
                       errors.district
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    />
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
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]
                     ${
                       errors.vehicletype
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Type
                      </option>
                      <option>Car</option>
                      <option>Truck</option>
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
                    <input
                      {...field}
                      type="text"
                      id="manufactoringyear"
                      placeholder="2023"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.manufactoringyear
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    />
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
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.fueltype
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Fuel
                      </option>
                      <option>Petrol</option>
                      <option>Diesel</option>
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
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
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
                      <option value="Kg">Kg</option>
                      <option value="Lbs">Lbs</option>
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
                <label className="text-[10px] font-body font-[500] text-[#111102]">
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
                      placeholder="0"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
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
                <label className="text-[10px] font-body font-[500] text-[#111102]">
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
                      className={`w-full h-[53px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
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
                <div
                  className={`flex items-center justify-center w-full h-[40px] p-2 mt-1 border border-dashed border-[#D1D1D1] rounded-[3px] cursor-pointer bg-[#FEFEFE] 
               ${
                 errors.image
                   ? "focus:ring-red-500 focus:border-red-500"
                   : "focus:ring-yellow-500 focus:border-yellow-500"
               }`}
                >
                  <Camera size="16px" color="#5B5B5B" />

                  <Controller
                    name="image"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <>
                        <input
                          type="file"
                          accept=".jpg, .png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setFileName(file.name);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-[#D1D1D1] font-body text-[9px] pl-1 mt-[2px]"
                        >
                          {fileName ||
                            "Choose an Image to upload (jpg and png files only)"}
                        </label>
                      </>
                    )}
                  />
                </div>
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
                  className="w-[164px] h-[32px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[12px] rounded-[3px] hover:bg-yellow-500"
                >
                  Submit
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
    </Dialog.Root>
  );
};
