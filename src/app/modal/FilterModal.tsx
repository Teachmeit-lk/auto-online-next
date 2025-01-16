"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose }) => {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[14px] font-bold mb-5 text-[#111102] font-body">
            NMK Motors - Filters
          </Dialog.Title>

          <form className="grid grid-cols-3 gap-y-4 gap-x-8 bg-[#F8F8F8] rounded-[8px] p-8">
            {/* Vehicle Country */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                Vehicle Country
              </label>
              <input
                type="text"
                placeholder="Europe"
                className="w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
              />
            </div>

            {/* Vehicle Model */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                Vehicle Model
              </label>
              <input
                type="text"
                placeholder="Model"
                className="w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
              />
            </div>

            {/* District */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                District
              </label>
              <input
                type="text"
                placeholder="Colombo"
                className="w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
              />
            </div>

            {/* Vehicle Type */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                Vehicle Type
              </label>
              <select className="w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]">
                <option value="" className="text-gray-500">
                  Select Type
                </option>
                <option>Car</option>
                <option>Truck</option>
              </select>
            </div>

            {/* Year of Manufacturing */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                Year of Manufacturing
              </label>
              <input
                type="number"
                placeholder="2023"
                className="w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
              />
            </div>

            {/* Fuel Type */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                Fuel Type
              </label>
              <select className="w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]">
                <option value="" className="text-gray-500">
                  Select Fuel
                </option>
                <option>Petrol</option>
                <option>Diesel</option>
              </select>
            </div>

            {/* Measurement */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                Measurement
              </label>
              <select
                className="w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                defaultValue=""
              >
                <option value="" className="text-gray-500">
                  Select Unit
                </option>
                <option value="Kg">Kg</option>
                <option value="Lbs">Lbs</option>
              </select>
            </div>

            {/* No of Units */}
            <div className="col-span-1">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                No of Units
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
              />
            </div>

            {/* Description */}
            <div className="col-span-3">
              <label className="text-[10px] font-body font-[500] text-[#111102]">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Enter description"
                className="w-full h-[53px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
              />
            </div>

            {/* Image Upload */}
            <div className="col-span-3">
              <div className="flex items-center justify-center w-full h-[40px] p-2 mt-1 border border-dashed border-[#D1D1D1] rounded-[3px] cursor-pointer bg-[#FEFEFE]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.00033 10.2083C7.72949 10.2083 8.34938 9.95322 8.85999 9.443C9.3706 8.93278 9.62571 8.31289 9.62533 7.58333C9.62494 6.85378 9.36983 6.23408 8.85999 5.72425C8.35016 5.21442 7.73027 4.95911 7.00033 4.95833C6.27038 4.95756 5.65069 5.21286 5.14124 5.72425C4.6318 6.23564 4.37649 6.85533 4.37533 7.58333C4.37416 8.31133 4.62946 8.93122 5.14124 9.443C5.65302 9.95478 6.27271 10.2099 7.00033 10.2083ZM7.00033 9.04167C6.59199 9.04167 6.24685 8.90069 5.96491 8.61875C5.68296 8.33681 5.54199 7.99167 5.54199 7.58333C5.54199 7.175 5.68296 6.82986 5.96491 6.54792C6.24685 6.26597 6.59199 6.125 7.00033 6.125C7.40866 6.125 7.7538 6.26597 8.03574 6.54792C8.31769 6.82986 8.45866 7.175 8.45866 7.58333C8.45866 7.99167 8.31769 8.33681 8.03574 8.61875C7.7538 8.90069 7.40866 9.04167 7.00033 9.04167ZM2.33366 12.25C2.01283 12.25 1.73827 12.1359 1.50999 11.9076C1.28171 11.6793 1.16738 11.4046 1.16699 11.0833V4.08333C1.16699 3.7625 1.28133 3.48794 1.50999 3.25967C1.73866 3.03139 2.01321 2.91706 2.33366 2.91667H4.17116L4.90033 2.12917C5.00727 2.0125 5.13619 1.92014 5.28708 1.85208C5.43796 1.78403 5.59585 1.75 5.76074 1.75H8.23991C8.40519 1.75 8.56327 1.78403 8.71416 1.85208C8.86505 1.92014 8.99377 2.0125 9.10033 2.12917L9.82949 2.91667H11.667C11.9878 2.91667 12.2626 3.031 12.4912 3.25967C12.7199 3.48833 12.834 3.76289 12.8337 4.08333V11.0833C12.8337 11.4042 12.7195 11.6789 12.4912 11.9076C12.263 12.1362 11.9882 12.2504 11.667 12.25H2.33366Z"
                    fill="#5B5B5B"
                  />
                </svg>

                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".jpg, .png"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-[#D1D1D1] font-body text-[8px] pl-1"
                >
                  {fileName ||
                    "Choose an Image to upload ( jpg and png files only )"}
                </label>
              </div>
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

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FilterModal;
