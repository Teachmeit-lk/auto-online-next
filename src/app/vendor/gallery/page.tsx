"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import {
  AddGalleryImageModal,
  TabLayout,
  VendorGalleryCard,
} from "@/components/";
import withAuth from "@/components/authGuard/withAuth";
import { FirebaseStorageService, FileMetadata } from "@/service/firebaseStorageService";
import { FirestoreService, COLLECTIONS, GalleryImage } from "@/service/firestoreService";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
// import { AddGalleryImageModal } from "@/app/modal";

const VendorGallery: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;
  const [images, setImages] = useState<GalleryImage[]>([]);

  const loadImages = async () => {
    if (!currentUser?.id) return;
    const list = await FirestoreService.getAll<GalleryImage>(
      COLLECTIONS.GALLERY,
      [{ field: "vendorId", operator: "==", value: currentUser.id }]
    );
    // Optional client-side sort by createdAt desc if present
    const sorted = [...list].sort((a: any, b: any) => {
      const aTime = (a.createdAt?.seconds || 0) * 1000 + (a.createdAt?.nanoseconds || 0) / 1e6;
      const bTime = (b.createdAt?.seconds || 0) * 1000 + (b.createdAt?.nanoseconds || 0) / 1e6;
      return bTime - aTime;
    });
    setImages(sorted);
  };

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

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

          {images.map((img) => {
            const humanize = (name: string) => {
              const base = name.replace(/\.[^/.]+$/, "");
              const parts = base.split("_");
              const tail = parts.length > 1 ? parts[parts.length - 1] : base;
              return tail.replace(/[-_]+/g, " ").trim();
            };
            const label = img.title || humanize(img.imageUrl);
            return (
            <div key={img.id || img.imageUrl} className="group relative">
              <VendorGalleryCard productname={label} image={img.imageUrl} />
              <button
                className="absolute top-1 right-1 hidden group-hover:block bg-red-600 text-white text-[10px] px-2 py-1 rounded"
                onClick={async () => {
                  if (!confirm("Delete this image?")) return;
                  if (img.storagePath) await FirebaseStorageService.deleteFile(img.storagePath);
                  if (img.id) await FirestoreService.delete(COLLECTIONS.GALLERY, img.id);
                  await loadImages();
                }}
              >
                Delete
              </button>
            </div>
          )})}
        </div>
        <AddGalleryImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUploaded={() => loadImages()}
        />
      </div>
    </TabLayout>
  );
};
export default withAuth(VendorGallery);
