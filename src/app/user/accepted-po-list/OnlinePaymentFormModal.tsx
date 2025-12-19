"use client";

import { useRefactoredIdLast } from "@/components/hooks/useRefactoredIdLast";
import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus, CreditCard, Lock } from "lucide-react";
import React from "react";

interface OnlinePaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPay: () => void;
}

export const OnlinePaymentFormModal: React.FC<OnlinePaymentFormModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onPay,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

        <Dialog.Content
          className="fixed top-1/2 left-1/2 
          -translate-x-1/2 -translate-y-1/2
          sm:w-[500px] w-[95%] bg-white rounded-[12px] shadow-2xl focus:outline-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Dialog.Title className="text-[16px] font-bold font-body text-[#111102]">
              Secure Checkout
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-[#F9C301] transition-colors"
              >
                <CirclePlus size={22} className="rotate-45" />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6">
            {/* Summary Card */}
            <div className="bg-[#F8F8F8] border border-gray-100 rounded-[8px] p-4 mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Order ID
                  </p>
                  <p className="text-[13px] font-medium text-[#111102]">
                    {useRefactoredIdLast("ON", orderId)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    Total Amount
                  </p>
                  <p className="text-[16px] font-bold text-[#111102]">
                    LKR{" "}
                    {amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Logos */}
            <div className="flex items-center gap-3 mb-4 l">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                alt="Visa"
                className="h-3"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                alt="Mastercard"
                className="h-5"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal"
                className="h-4"
              />
              <div className="h-4 w-[1px] bg-gray-300 mx-1" />
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                <Lock size={10} />
                <div className="mt-1">Secure Payment</div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1 ml-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    placeholder="0000 0000 0000 0000"
                    className="w-full h-[42px] border border-gray-200 rounded-[6px] px-10 text-sm font-body outline-none focus:border-[#F9C301] focus:ring-1 focus:ring-[#F9C301] transition-all"
                  />
                  <CreditCard
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1 ml-1">
                    Expiry Date
                  </label>
                  <input
                    placeholder="MM / YY"
                    className="w-full h-[42px] border border-gray-200 rounded-[6px] px-3 text-sm font-body outline-none focus:border-[#F9C301] focus:ring-1 focus:ring-[#F9C301] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1 ml-1">
                    CVV
                  </label>
                  <input
                    placeholder="123"
                    type="password"
                    maxLength={3}
                    className="w-full h-[42px] border border-gray-200 rounded-[6px] px-3 text-sm font-body outline-none focus:border-[#F9C301] focus:ring-1 focus:ring-[#F9C301] transition-all"
                  />
                </div>
              </div>

              <button
                onClick={onPay}
                className="w-full h-[45px] bg-[#F9C301] mt-2
                font-body font-bold text-[14px] text-[#111102]
                rounded-[6px] hover:bg-[#e2b100] active:scale-[0.98] transition-all shadow-md shadow-yellow-500/20"
              >
                Complete Payment
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-2">
                Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
