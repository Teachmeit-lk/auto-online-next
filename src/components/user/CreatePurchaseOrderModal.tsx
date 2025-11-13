"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Quotation, OrderService } from "@/service/firestoreService";
import { useAuth } from "@/components/authGuard/FirebaseAuthGuard";

interface ICreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onSuccess?: () => void;
}

interface PurchaseOrderFormData {
  deliveryMethod: "arrange_delivery" | "collect_from_shop";
  paymentMethod: "cash_at_shop" | "bank_transfer" | "pay_online";
  deliveryAddress?: {
    street: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
  };
}

const schema = Yup.object().shape({
  deliveryMethod: Yup.string()
    .oneOf(["arrange_delivery", "collect_from_shop"], "Invalid delivery method")
    .required("Delivery method is required"),
  paymentMethod: Yup.string()
    .oneOf(
      ["cash_at_shop", "bank_transfer", "pay_online"],
      "Invalid payment method"
    )
    .required("Payment method is required"),
  deliveryAddress: Yup.object().when("deliveryMethod", {
    is: "arrange_delivery",
    then: (schema) =>
      schema.shape({
        street: Yup.string().required("Street is required"),
        city: Yup.string().required("City is required"),
        district: Yup.string().required("District is required"),
        zipCode: Yup.string().required("Zip code is required"),
        country: Yup.string().required("Country is required"),
      }),
    otherwise: (schema) => schema.optional(),
  }),
});

export const CreatePurchaseOrderModal: React.FC<
  ICreatePurchaseOrderModalProps
> = ({ isOpen, onClose, quotation, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      deliveryMethod: "collect_from_shop",
      paymentMethod: "cash_at_shop",
    },
  });

  const deliveryMethod = watch("deliveryMethod");

  console.log("[CreatePurchaseOrderModal] Modal opened:", {
    isOpen,
    quotationId: quotation?.id,
    deliveryMethod,
  });

  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (!quotation || !user?.id) {
      setSubmitError("Missing quotation or user information");
      return;
    }

    console.log("[CreatePurchaseOrderModal] Form submitted:", data);
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate form data
      console.log("[CreatePurchaseOrderModal] Validating form data...");
      await schema.validate(data);
      console.log("[CreatePurchaseOrderModal] Form validation passed");

      // Generate order number
      const orderNumber = `PO-${Date.now()}-${
        quotation.quotationRequestId?.slice(0, 8) || "00000000"
      }`;
      console.log(
        "[CreatePurchaseOrderModal] Generated order number:",
        orderNumber
      );

      // Create purchase order
      const purchaseOrderData = {
        quotationId: quotation.id!,
        quotationRequestId: quotation.quotationRequestId,
        buyerId: user.id,
        vendorId: quotation.vendorId,
        orderNumber,
        products: quotation.products.map((p) => ({
          partName: p.partName,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalPrice: p.totalPrice,
        })),
        totalAmount: quotation.totalAmount,
        currency: quotation.currency || "LKR",
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod,
        deliveryAddress:
          data.deliveryMethod === "arrange_delivery" && data.deliveryAddress
            ? data.deliveryAddress
            : {
                street: "",
                city: "",
                district: "",
                zipCode: "",
                country: "",
              },
        expectedDeliveryDate:
          quotation.validUntil instanceof Date
            ? quotation.validUntil
            : new Date(),
        status: "pending" as const,
        paymentStatus: "pending" as const,
        deliveryCostRequested: data.deliveryMethod === "arrange_delivery",
      };

      console.log(
        "[CreatePurchaseOrderModal] Creating purchase order with data:",
        purchaseOrderData
      );

      const orderId = await OrderService.createPurchaseOrder(purchaseOrderData);

      console.log(
        "[CreatePurchaseOrderModal] Purchase order created successfully:",
        orderId
      );
      // TODO: Send order confirmation via WhatsApp
      console.log(
        "[CreatePurchaseOrderModal] TODO: Send order confirmation via WhatsApp"
      );

      if (onSuccess) {
        onSuccess();
      }

      handleModalClose();
    } catch (error: any) {
      console.error(
        "[CreatePurchaseOrderModal] Error creating purchase order:",
        error
      );
      setSubmitError(
        error.message || "Failed to create purchase order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    console.log("[CreatePurchaseOrderModal] Closing modal");
    reset();
    setSubmitError(null);
    onClose();
  };

  if (!quotation) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleModalClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full  bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            Create Purchase Order
          </Dialog.Title>

          {submitError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-600">
              {submitError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 sm:h-full h-[550px] overflow-y-auto"
          >
            {/* Delivery Method Selection */}
            <div className="bg-[#F8F8F8] rounded-[8px] p-6 space-y-4">
              <label className="text-[12px] font-body font-[500] text-[#111102] block mb-3">
                Delivery Method *
              </label>
              <Controller
                name="deliveryMethod"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        {...field}
                        value="arrange_delivery"
                        className="text-[#F9C301] focus:ring-[#F9C301]"
                        onChange={(e) => {
                          field.onChange(e);
                          console.log(
                            "[CreatePurchaseOrderModal] Delivery method changed: arrange_delivery"
                          );
                        }}
                      />
                      <span className="text-[12px] font-body text-[#111102]">
                        Arrange delivery through vendor
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        {...field}
                        value="collect_from_shop"
                        className="text-[#F9C301] focus:ring-[#F9C301]"
                        onChange={(e) => {
                          field.onChange(e);
                          console.log(
                            "[CreatePurchaseOrderModal] Delivery method changed: collect_from_shop"
                          );
                        }}
                      />
                      <span className="text-[12px] font-body text-[#111102]">
                        Collect from the shop
                      </span>
                    </label>
                  </div>
                )}
              />
              {errors.deliveryMethod && (
                <p className="text-[10px] text-red-600">
                  {errors.deliveryMethod.message}
                </p>
              )}
            </div>

            {/* Delivery Address (conditional) */}
            {deliveryMethod === "arrange_delivery" && (
              <div className="bg-[#F8F8F8] rounded-[8px] p-6 space-y-4">
                <label className="text-[12px] font-body font-[500] text-[#111102] block mb-3">
                  Delivery Address *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="deliveryAddress.street"
                    control={control}
                    render={({ field }) => (
                      <div className="col-span-2">
                        <input
                          {...field}
                          placeholder="Street Address"
                          className="w-full h-[36px] px-3 text-[10px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                        />
                        {errors.deliveryAddress?.street && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {errors.deliveryAddress.street.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="deliveryAddress.city"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          {...field}
                          placeholder="City"
                          className="w-full h-[36px] px-3 text-[10px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                        />
                        {errors.deliveryAddress?.city && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {errors.deliveryAddress.city.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="deliveryAddress.district"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          {...field}
                          placeholder="District"
                          className="w-full h-[36px] px-3 text-[10px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                        />
                        {errors.deliveryAddress?.district && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {errors.deliveryAddress.district.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="deliveryAddress.zipCode"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          {...field}
                          placeholder="Zip Code"
                          className="w-full h-[36px] px-3 text-[10px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                        />
                        {errors.deliveryAddress?.zipCode && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {errors.deliveryAddress.zipCode.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="deliveryAddress.country"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <input
                          {...field}
                          placeholder="Country"
                          className="w-full h-[36px] px-3 text-[10px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                        />
                        {errors.deliveryAddress?.country && (
                          <p className="text-[10px] text-red-600 mt-1">
                            {errors.deliveryAddress.country.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="bg-[#F8F8F8] rounded-[8px] p-6 space-y-4">
              <label className="text-[12px] font-body font-[500] text-[#111102] block mb-3">
                Payment Method *
              </label>
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        {...field}
                        value="cash_at_shop"
                        className="text-[#F9C301] focus:ring-[#F9C301]"
                        onChange={(e) => {
                          field.onChange(e);
                          console.log(
                            "[CreatePurchaseOrderModal] Payment method changed: cash_at_shop"
                          );
                        }}
                      />
                      <span className="text-[12px] font-body text-[#111102]">
                        Pay cash at the shop
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        {...field}
                        value="bank_transfer"
                        className="text-[#F9C301] focus:ring-[#F9C301]"
                        onChange={(e) => {
                          field.onChange(e);
                          console.log(
                            "[CreatePurchaseOrderModal] Payment method changed: bank_transfer"
                          );
                        }}
                      />
                      <span className="text-[12px] font-body text-[#111102]">
                        Bank transfer
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        {...field}
                        value="pay_online"
                        className="text-[#F9C301] focus:ring-[#F9C301]"
                        onChange={(e) => {
                          field.onChange(e);
                          console.log(
                            "[CreatePurchaseOrderModal] Payment method changed: pay_online"
                          );
                        }}
                      />
                      <span className="text-[12px] font-body text-[#111102]">
                        Pay online
                      </span>
                    </label>
                  </div>
                )}
              />
              {errors.paymentMethod && (
                <p className="text-[10px] text-red-600">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-[#F8F8F8] rounded-[8px] p-6">
              <h3 className="text-[12px] font-body font-[600] text-[#111102] mb-3">
                Order Summary
              </h3>
              <div className="space-y-2 text-[11px] font-body text-[#111102]">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-[600]">
                    {quotation.totalAmount} {quotation.currency || "LKR"}
                  </span>
                </div>
                {quotation.products.map((product, idx) => (
                  <div key={idx} className="text-[10px] text-[#5B5B5B]">
                    {product.partName} - {product.quantity} x{" "}
                    {product.unitPrice}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
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
                {isSubmitting ? "Creating..." : "Create Order"}
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
