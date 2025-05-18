"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const RejectPurchaseOrderModal: React.FC<AlertModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[415px] h-[280px] bg-white rounded-[8px]  shadow-lg focus:outline-none">
          <Dialog.Title className="text-[14px] font-bold text-[#111102] font-body text-left mt-6 pl-6">
            Reject Purchase Order
          </Dialog.Title>
          <div className="bg-[#F8F8F8] rounded-[5px] ml-4 mr-4 mt-2  pt-6 pb-7 px-8 flex flex-col  justify-center text-left ">
            <div className="">
              <p className="text-[11px] text-[#111102] font-body font-[500] text-left">
                Are you sure to delete this also from received device? Enter the
                reason why are you delete the quotation...
              </p>
            </div>

            <div className="col-span-3">
              <textarea
                rows={3}
                placeholder="Add reason here..."
                className="w-full  h-[60px] mt-4 mb-4 px-4 py-2 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
              />
            </div>

            <div className="flex justify-center ">
              <button
                onClick={onConfirm}
                className="w-[164px] h-[28px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[11px] rounded-[4px] hover:bg-yellow-500"
              >
                Decline
              </button>
            </div>
          </div>
          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-500 hover:text-[#F9C301]"
            >
              <CirclePlus className="rotate-45" size={18} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
