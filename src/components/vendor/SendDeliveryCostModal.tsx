"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { OrderService } from "@/service/firestoreService";

interface ISendDeliveryCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  onSuccess?: () => void;
}

interface DeliveryCostFormData {
  cost: number;
  notes?: string;
}

const schema = Yup.object().shape({
  cost: Yup.number()
    .required("Delivery cost is required")
    .min(0, "Delivery cost must be positive"),
  notes: Yup.string().optional(),
});

export const SendDeliveryCostModal: React.FC<ISendDeliveryCostModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeliveryCostFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      cost: 0,
      notes: "",
    },
  });

  console.log("[SendDeliveryCostModal] Modal opened:", {
    isOpen,
    orderId,
    orderNumber,
  });

  const onSubmit = async (data: DeliveryCostFormData) => {
    console.log("[SendDeliveryCostModal] Form submitted:", data);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await OrderService.sendDeliveryCost(orderId, data.cost, data.notes);

      console.log("[SendDeliveryCostModal] Delivery cost sent successfully");
      // TODO: Send delivery cost via WhatsApp with quotation number
      console.log("[SendDeliveryCostModal] TODO: Send delivery cost via WhatsApp with quotation number");

      if (onSuccess) {
        onSuccess();
      }

      handleModalClose();
    } catch (error: any) {
      console.error("[SendDeliveryCostModal] Error sending delivery cost:", error);
      setSubmitError(error.message || "Failed to send delivery cost. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    console.log("[SendDeliveryCostModal] Closing modal");
    reset();
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleModalClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            Send Delivery Cost
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-[#F8F8F8] rounded-[8px] p-6 space-y-4">
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102] block mb-2">
                  Delivery Cost (Rs.) *
                </label>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full h-[36px] px-3 text-[12px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value) || 0);
                        console.log("[SendDeliveryCostModal] Delivery cost changed:", e.target.value);
                      }}
                    />
                  )}
                />
                {errors.cost && (
                  <p className="text-[10px] text-red-600 mt-1">{errors.cost.message}</p>
                )}
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102] block mb-2">
                  Notes (Optional)
                </label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Add any notes about the delivery cost..."
                      className="w-full px-3 py-2 text-[12px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        console.log("[SendDeliveryCostModal] Notes changed");
                      }}
                    />
                  )}
                />
              </div>
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
                type="submit"
                disabled={isSubmitting}
                className={`w-[120px] h-[36px] font-[600] font-body text-[12px] rounded-[3px] ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Cost"}
              </button>
            </div>
          </form>

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

