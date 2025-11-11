"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Camera, CirclePlus } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { FirebaseStorageService, UploadResult } from "@/service/firebaseStorageService";
import { FirestoreService, COLLECTIONS, GalleryImage } from "@/service/firestoreService";

interface IAddGalleryImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (file: UploadResult) => void;
}

export const AddGalleryImageModal: React.FC<IAddGalleryImageModalProps> = ({
  isOpen,
  onClose,
  onUploaded,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const authState = useSelector((state: RootState) => state.auth as any);
  const currentUser = authState?.user;

  const schema = Yup.object().shape({
    partName: Yup.string().required("Name of the Part is required"),
    image: Yup.mixed<File>()
      .nullable()
      .required("Image is required")
      .test("fileFormat", "Only jpg and png files are allowed", (value) => {
        if (!value) return false;
        return ["image/jpeg", "image/png"].includes(value.type);
      }),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: { partName: string; image: File | null }) => {
    if (!data.image || !currentUser?.id) return;
    try {
      setSubmitting(true);
      const validation = FirebaseStorageService.validateFile(data.image);
      if (!validation.isValid) {
        alert(validation.error);
        setSubmitting(false);
        return;
      }
      // Optional: compress
      const compressed = await FirebaseStorageService.compressImage(data.image, 1920, 1080, 0.6);
      const [result] = await FirebaseStorageService.uploadGalleryImages(
        currentUser.id,
        [compressed],
        undefined,
        [{ contentType: compressed.type, customMetadata: { title: data.partName } }]
      );
      // Create Firestore mapping
      const galleryDoc: Omit<GalleryImage, "id" | "createdAt" | "updatedAt"> = {
        vendorId: currentUser.id,
        title: data.partName,
        description: "",
        imageUrl: result.url,
        category: "",
        tags: [],
        storagePath: result.path,
        isActive: true,
      } as any;
      await FirestoreService.create<GalleryImage>(COLLECTIONS.GALLERY, galleryDoc);
      if (onUploaded) onUploaded(result);
      setFileName("");
      onClose();
      reset();
    } catch (e: any) {
      alert(e?.message || "Failed to upload image");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    reset();
    setFileName("");
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[415px] bg-white py-7 px-5 rounded-lg shadow-lg focus:outline-none">
          <Dialog.Title className="text-[14px] font-bold font-body mb-5 text-[#111102]">
            Add New Gallery Image
          </Dialog.Title>
          <form
            className="space-y-4 bg-[#F8F8F8] px-6 pt-6 pb-8 rounded-[5px]"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Part Name */}
            <div>
              <label className="block text-[12px] text-[#111102] font-body font-medium">
                Name of the Part
              </label>
              <Controller
                name="partName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter part name"
                    className={`w-full mt-2 p-2  rounded-md text-[10px] text-[#111102]  font-body  focus:outline-none focus:ring-2 ${
                      errors.partName
                        ? "focus:ring-red-500"
                        : "focus:ring-yellow-500"
                    }`}
                  />
                )}
              />
              {errors.partName && (
                <p className="text-red-500 text-[10px] font-body mt-1">
                  {errors.partName.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <div
                className={`mt-1 flex items-center justify-center w-full h-[40px] p-2 border border-dashed rounded-md ${
                  errors.image ? "border-red-500" : "border-gray-300"
                } bg-[#FEFEFE]`}
              >
                <Camera size="16px" color="#5B5B5B" />
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="file"
                        accept=".jpg, .png"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          field.onChange(file);
                          setFileName(file ? file.name : "");
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-[#D1D1D1] font-body text-[9px] pl-1 mt-[2px]"
                      >
                        {fileName ||
                          "Choose an Image to upload ( jpg and png files only )"}
                      </label>
                    </>
                  )}
                />
              </div>
              {errors.image && (
                <p className="text-red-500 text-[10px] font-body mt-1">
                  {errors.image.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center ">
              <button
                type="submit"
                disabled={submitting}
                className="w-[164px] h-[28px] mt-3 bg-[#F9C301] text-[#111102] font-[600] font-body text-[12px] rounded-[3px] hover:bg-yellow-500 disabled:opacity-60"
              >
                {submitting ? "Uploading..." : "Add Image"}
              </button>
            </div>
          </form>

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-yellow-500"
            >
              <CirclePlus size={20} className="rotate-45" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
