"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";

interface iDeleteItemConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteItemConfirmation: React.FC<iDeleteItemConfirmationProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[160px] bg-white rounded-[8px]  shadow-lg focus:outline-none">
          <Dialog.Title className="text-[14px] font-bold text-[#111102] font-body text-left mt-3 pl-4">
            Alert
          </Dialog.Title>
          <div className="bg-[#F8F8F8] rounded-[5px] ml-4 mr-4 mt-2  p-4 flex flex-col items-center justify-center">
            <div className="">
              <p className="text-[11px] text-[#111102] font-body font-[500] text-center">
                Are you sure to delete this item from the table now?
              </p>
            </div>
            <div className="flex justify-center gap-x-6 mt-8 ">
              <button
                onClick={onConfirm}
                className="w-[100px] h-[24px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[11px] rounded-[4px] hover:bg-yellow-500"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="w-[100px] h-[24px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[11px] rounded-[4px] hover:bg-yellow-500"
              >
                Not Now
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
