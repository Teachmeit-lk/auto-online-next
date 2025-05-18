"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

import { VendorgalleryCardImage } from "@/app/assets/images";
import {
  AddGalleryImageModal,
  TabLayout,
  VendorGalleryCard,
} from "@/components/";
// import { AddGalleryImageModal } from "@/app/modal";

export const VendorGallery: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vendors = Array.from({ length: 12 }, (_, i) => ({
    image: VendorgalleryCardImage.src,
    productname: `Product ${i + 1}`,
  }));

  return (
    <TabLayout type="vendor">
      <div
        className="w-full px-8 pt-8 pb-[50px] bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px]"
        id="quotationrequests"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          Vendor Gallery
        </h1>

        <div className="grid grid-cols-8 pl-12">
          <div
            className="flex flex-col justify-center mb-4 text-[#F9C301] font-body font-bold text-[12px] items-center w-[126px] cursor-pointer h-[137px] border-2 border-[#F9C301] rounded-[10px] transform transition-transform duration-150 hover:scale-105 active:scale-95"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus color="#F9C301" size="30px" />
            <div>Add New</div>
          </div>

          {vendors.map((items, index) => (
            <div key={index}>
              <VendorGalleryCard
                productname={items.productname}
                image={items.image}
              />
            </div>
          ))}
        </div>
        <AddGalleryImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </TabLayout>
  );
};
export default VendorGallery;
