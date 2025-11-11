"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { OrderService } from "@/service/firestoreService";
import { FirebaseStorageService } from "@/service/firebaseStorageService";
import { useAuth } from "@/components/authGuard/FirebaseAuthGuard";

interface IPaymentSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  onSuccess?: () => void;
}

export const PaymentSlipModal: React.FC<IPaymentSlipModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  console.log("[PaymentSlipModal] Modal opened:", {
    isOpen,
    orderId,
    orderNumber,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[PaymentSlipModal] File selected:", file.name);

    // Validate file
    const validation = FirebaseStorageService.validateFile(
      file,
      ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
      10
    );

    if (!validation.isValid) {
      setSubmitError(validation.error || "Invalid file");
      return;
    }

    setSelectedFile(file);
    setSubmitError(null);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit = async () => {
    if (!selectedFile || !user?.id) {
      setSubmitError("Please select a file");
      return;
    }

    console.log("[PaymentSlipModal] Uploading payment slip:", {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      orderId,
    });

    setIsSubmitting(true);
    setSubmitError(null);
    setUploadProgress(0);

    try {
      // Compress image if it's an image
      let fileToUpload = selectedFile;
      if (selectedFile.type.startsWith("image/")) {
        console.log("[PaymentSlipModal] Compressing image...");
        fileToUpload = await FirebaseStorageService.compressImage(
          selectedFile,
          1920,
          1080,
          0.8
        );
      }

      // Upload file
      console.log("[PaymentSlipModal] Uploading to Firebase Storage...");
      const uploadResult = await FirebaseStorageService.uploadDocument(
        user.id,
        "payment-slips",
        fileToUpload,
        (progress) => {
          console.log("[PaymentSlipModal] Upload progress:", progress.progress);
          setUploadProgress(progress.progress);
        }
      );

      console.log("[PaymentSlipModal] File uploaded successfully:", uploadResult.url);

      // Update purchase order with payment slip URL
      await OrderService.uploadPaymentSlip(orderId, uploadResult.url);

      console.log("[PaymentSlipModal] Payment slip uploaded successfully");
      // TODO: Send payment slip via WhatsApp
      console.log("[PaymentSlipModal] TODO: Send payment slip via WhatsApp");

      if (onSuccess) {
        onSuccess();
      }

      handleModalClose();
    } catch (error: any) {
      console.error("[PaymentSlipModal] Error uploading payment slip:", error);
      setSubmitError(error.message || "Failed to upload payment slip. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleModalClose = () => {
    console.log("[PaymentSlipModal] Closing modal");
    setSelectedFile(null);
    setPreviewUrl(null);
    setSubmitError(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleModalClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            Upload Payment Slip
            {orderNumber && (
              <span className="text-[12px] font-normal text-[#5B5B5B] ml-2">
                ({orderNumber})
              </span>
            )}
          </Dialog.Title>

          {submitError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-600">
              {submitError}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-[#F8F8F8] rounded-[8px] p-6 space-y-4">
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102] block mb-2">
                  Payment Slip (Image or PDF) *
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="w-full h-[36px] px-3 text-[12px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] disabled:opacity-50"
                />
                <p className="text-[10px] text-[#5B5B5B] mt-1">
                  Accepted formats: JPEG, PNG, PDF (Max 10MB)
                </p>
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <p className="text-[12px] font-body font-[500] text-[#111102] mb-2">
                    Preview:
                  </p>
                  <img
                    src={previewUrl}
                    alt="Payment slip preview"
                    className="max-w-full max-h-[200px] rounded border border-gray-300"
                  />
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#F9C301] h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-[#5B5B5B] mt-1">
                    Uploading: {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}

              {selectedFile && !previewUrl && (
                <div className="mt-4 p-3 bg-white rounded border border-gray-300">
                  <p className="text-[12px] font-body text-[#111102]">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-[#5B5B5B] mt-1">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="w-[120px] h-[36px] font-[600] font-body text-[12px] rounded-[3px] bg-gray-200 text-[#111102] hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting || !selectedFile}
                className={`w-[120px] h-[36px] font-[600] font-body text-[12px] rounded-[3px] ${
                  isSubmitting || !selectedFile
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                }`}
              >
                {isSubmitting ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#F9C301] rotate-45"
            >
              <CirclePlus />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

