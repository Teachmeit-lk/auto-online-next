import Image from "next/image";
import React from "react";

interface Galleryprops {
  image: string;
  productname: string;
}

export const VendorGalleryCard = ({ image, productname }: Galleryprops) => {
  return (
    <div className="flex flex-col  rounded-[5px] bg-[#FEFEFE] w-[126px] h-[137px]">
      <div className="w-full h-[109px] overflow-hidden rounded-t-[5px]">
        <Image
          src={image}
          alt="Popup Image"
          width={126}
          height={110}
          layout="responsive"
          className="object-cover rounded-t-[5px]"
        />
      </div>
      <div className="font-body text-[10px] pl-3 text-[#000000] ">
        {productname}
      </div>
    </div>
  );
};
