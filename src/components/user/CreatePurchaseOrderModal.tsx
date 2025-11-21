"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Quotation, OrderService } from "@/service/firestoreService";
import { useAuth } from "@/components/authGuard/FirebaseAuthGuard";
import Image from "next/image";

interface ICreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onSuccess?: () => void;
  requestImageUrl?: string | null;
}

interface PurchaseOrderFormData {
  deliveryMethod: "arrange_delivery" | "collect_from_shop";
  paymentMethod: "cash_at_shop" | "bank_transfer" | "pay_online";
  specialNotes?: string;
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
  specialNotes: Yup.string().optional(),
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

// local representation of line items
type OrderItem = {
  id: string;
  itemDescription: string;
  partNumber?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export const CreatePurchaseOrderModal: React.FC<
  ICreatePurchaseOrderModalProps
> = ({ isOpen, onClose, quotation, onSuccess, requestImageUrl }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [hasOutOfStock, setHasOutOfStock] = useState(false);
  const [showOutOfStockAlert, setShowOutOfStockAlert] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState<number>(0);

  console.log("quotation:", quotation);

  // initialise items from quotation
  useEffect(() => {
    if (!quotation) {
      setItems([]);
      return;
    }
    const mapped: OrderItem[] = (quotation.products || []).map(
      (p: any, idx) => {
        const qty = Number(p.quantity) || 1;
        const price = Number(p.unitPrice) || 0;
        return {
          id: p.id || String(idx),
          itemDescription: p.partName || p.description || `Item ${idx + 1}`,
          partNumber: p.partNumber || "",
          image: Array.isArray(p.images) ? p.images[0] : undefined,
          quantity: qty,
          unitPrice: price,
          totalPrice: Number(p.totalPrice) || qty * price,
        };
      }
    );
    setItems(mapped);
  }, [quotation]);

  const grandTotal = useMemo(
    () => {
      const itemsTotal = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);
      return itemsTotal + deliveryCost;
    },
    [items, deliveryCost]
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue, 
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      deliveryMethod: "collect_from_shop",
      paymentMethod: "cash_at_shop",
      specialNotes: "",
    },
  });

  const deliveryMethod = watch("deliveryMethod");
  const paymentMethod = watch("paymentMethod");

  const handleQtyChange = (index: number, value: string) => {
    const numeric = Math.max(1, Number(value) || 1);
    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? { ...it, quantity: numeric, totalPrice: numeric * it.unitPrice }
          : it
      )
    );
  };

useEffect(() => {
  if (!quotation || !isOpen) {
    return;
  }

  const mapped: OrderItem[] = (quotation.products || []).map(
    (p: any, idx) => {
      const qty = Number(p.quantity) || 1;
      const price = Number(p.unitPrice) || 0;
      return {
        id: p.id || String(idx),
        itemDescription: p.partName || p.description || `Item ${idx + 1}`,
        partNumber: p.partNumber || "",
        image: Array.isArray(p.images) ? p.images[0] : undefined,
        quantity: qty,
        unitPrice: price,
        totalPrice: Number(p.totalPrice) || qty * price,
      };
    }
  );
  setItems(mapped);

  setDeliveryCost(Number(quotation.deliveryCost) || 0);

  const outOfStock = (quotation.products || []).some(
    (p: any) => 
      p.stockAvailability && 
      p.stockAvailability.toLowerCase().includes('out of stock')
  );
  setHasOutOfStock(outOfStock);

  // Show alert immediately if out of stock
  if (outOfStock) {
      setShowOutOfStockAlert(true);
    }
  }, [quotation, isOpen]);

useEffect(() => {
  if (deliveryMethod === "arrange_delivery" && paymentMethod === "cash_at_shop") {
    setValue("deliveryMethod", "collect_from_shop");
  }
  
  if (paymentMethod === "cash_at_shop" && deliveryMethod === "arrange_delivery") {
    setValue("deliveryMethod", "collect_from_shop");
  }
}, [deliveryMethod, paymentMethod, setValue]);

  const handleModalClose = () => {
    reset();
    setSubmitError(null);
    setItems([]);
    setHasOutOfStock(false);
    setShowOutOfStockAlert(false);
    setDeliveryCost(0);
    onClose();
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (hasOutOfStock) {
      setShowOutOfStockAlert(true);
      return;
    }

    if (!quotation || !user?.id) {
      setSubmitError("Missing quotation or user information");
      return;
    }

    if (!items.length) {
      setSubmitError("No items found in this quotation.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await schema.validate(data);

      const orderNumber = `PO-${Date.now()}-${
        quotation.quotationRequestId?.slice(0, 8) || "00000000"
      }`;

      const purchaseOrderData = {
        quotationId: quotation.id!,
        quotationRequestId: quotation.quotationRequestId,
        buyerId: user.id,
        vendorId: quotation.vendorId,
        orderNumber,
        products: items.map((it) => ({
          partName: it.itemDescription,
          partNumber: it.partNumber,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
        })),
        totalAmount: grandTotal,
        currency: quotation.currency || "LKR",
        deliveryMethod: data.deliveryMethod,
        paymentMethod: data.paymentMethod,
        specialNotes: data.specialNotes || "",
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

      const orderId = await OrderService.createPurchaseOrder(purchaseOrderData);

      console.log(
        "[CreatePurchaseOrderModal] Purchase order created:",
        orderId
      );

      onSuccess && onSuccess();
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

  if (!quotation) return null;

  const today = new Date().toLocaleDateString();
  const customerName =
    (user as any)?.firstName + "  " + (user as any)?.lastName || "";
  const contactNo = (user as any)?.phone || "";
  const whatsappNo = (user as any)?.whatsApp || contactNo;
  const baseAddress =
    (user as any)?.address + " , " + (user as any)?.city || "";

  const deliveryLabel =
    deliveryMethod === "arrange_delivery"
      ? "Arrange delivery through vendor"
      : "Collect from the shop";

  const paymentLabel =
    paymentMethod === "bank_transfer"
      ? "Bank transfer"
      : paymentMethod === "pay_online"
      ? "Pay online"
      : "Pay cash at the shop";


  return (
    <Dialog.Root open={isOpen} onOpenChange={handleModalClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:w-[900px] md:w-[750px] sm:w-[600px] w-full bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body">
            Create Purchase Order
          </Dialog.Title>

          {submitError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 space-y-6 sm:h-full max-h-[65vh] overflow-y-auto no-scrollbar">
              <div className="sm:grid sm:grid-cols-2 gap-x-8 gap-y-3 sm:space-y-0 space-y-2 text-[11px] font-body text-[#111102]">
                <div>
                  <label className="text-[12px] font-[500]">Date</label>
                  <input
                    readOnly
                    value={today}
                    className="mt-1 w-full h-[32px] px-3 text-[11px] bg-[#FEFEFE] rounded-[3px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-[500]">
                    Customer name
                  </label>
                  <input
                    readOnly
                    value={customerName}
                    placeholder="Customer name"
                    className="mt-1 w-full h-[32px] px-3 text-[11px] bg-[#FEFEFE] rounded-[3px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-[500]">Contact No</label>
                  <input
                    readOnly
                    value={contactNo}
                    placeholder="Contact number"
                    className="mt-1 w-full h-[32px] px-3 text-[11px] bg-[#FEFEFE] rounded-[3px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-[500]">WhatsApp No</label>
                  <input
                    readOnly
                    value={whatsappNo}
                    placeholder="WhatsApp number"
                    className="mt-1 w-full h-[32px] px-3 text-[11px] bg-[#FEFEFE] rounded-[3px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-[500]">Address</label>
                  <input
                    readOnly
                    value={baseAddress}
                    placeholder="Customer address"
                    className="mt-1 w-full h-[32px] px-3 text-[11px] bg-[#FEFEFE] rounded-[3px] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-[500]">
                    Quotation reference no
                  </label>
                  <input
                    readOnly
                    value={
                      quotation.quotationRequestId || quotation.id || "N/A"
                    }
                    className="mt-1 w-full h-[32px] px-3 text-[11px] bg-[#FEFEFE] rounded-[3px] focus:outline-none"
                  />
                </div>
              </div>

              {deliveryMethod === "arrange_delivery" && (
                <div className="space-y-2">
                  <label className="text-[12px] font-body font-[500] text-[#111102]">
                    Delivery Address *
                  </label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Controller
                      name="deliveryAddress.street"
                      control={control}
                      render={({ field }) => (
                        <div className="sm:col-span-2">
                          <input
                            {...field}
                            placeholder="Street address"
                            className="w-full h-[32px] px-3 text-[11px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
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
                            className="w-full h-[32px] px-3 text-[11px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
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
                            className="w-full h-[32px] px-3 text-[11px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
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
                            placeholder="Zip code"
                            className="w-full h-[32px] px-3 text-[11px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
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
                            className="w-full h-[32px] px-3 text-[11px] font-body bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
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

              <div className="overflow-y-auto  no-scrollbar max-h-[150px] rounded-tl-[8px] rounded-tr-[8px] ">
                <table className="w-full text-[10px] font-body text-[#111102] border border-white table-fixed min-w-[600px] overflow-x-auto ">
                  <thead className="bg-[#D1D1D1]">
                    <tr>
                      <th className="p-2 border w-[5%]">No.</th>
                      <th className="p-2 border w-[25%]">Item description</th>
                      <th className="p-2 border w-[15%]">Part number</th>
                      <th className="p-2 border w-[15%]">Photo</th>
                      <th className="p-2 border w-[10%]">No of units</th>
                      <th className="p-2 border w-[15%]">Unit price</th>
                      <th className="p-2 border w-[15%]">Total price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={item.id}
                        className="odd:bg-white even:bg-gray-50 border-b border-white"
                      >
                        <td className="p-2 border text-center">{index + 1}</td>
                        <td className="p-2 border text-center">
                          {item.itemDescription}
                        </td>
                        <td className="p-2 border text-center">
                          {item.partNumber || "-"}
                        </td>
                        <td className="p-2 border text-center">
                          {requestImageUrl ? (
                            <div className=" flex justify-center">
                              <Image
                                src={requestImageUrl}
                                alt="Requested part"
                                width={100}
                                height={60}
                                className="w-[80px] h-[50px] rounded-[6px] object-cover border border-[#E5E5E5]"
                              />
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2 border text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQtyChange(index, e.target.value)
                            }
                            className="w-[60px] h-[26px] text-center text-[10px] bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-1 focus:ring-[#F9C301]"
                          />
                        </td>
                        <td className="p-2 border text-right">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-2 border text-right">
                          {item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#FFF8D9] font-[600]">
                      <td className="p-2 border text-right" colSpan={4}>
                        Delivery Cost
                      </td>
                      <td className="p-2 border text-right" colSpan={1}>
                        {deliveryCost.toFixed(2)} {quotation.currency || "LKR"}
                      </td>
                      <td className="p-2 border text-right" colSpan={1}>
                        Grand Total
                      </td>
                      <td className="p-2 border text-right" colSpan={1}>
                        {grandTotal.toFixed(2)} {quotation.currency || "LKR"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Special notes
                </label>
                <Controller
                  name="specialNotes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      className="mt-1 w-full text-[11px] font-body bg-[#FEFEFE] rounded-[3px] p-3 focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                      placeholder="Any additional instructions for the vendor…"
                    />
                  )}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102] block mb-2">
                    Delivery Method *
                  </label>
                  <Controller
                    name="deliveryMethod"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1 text-[11px]">
                        <label className={`flex items-center space-x-2 cursor-pointer ${
                          paymentMethod === "cash_at_shop" ? "opacity-50 cursor-not-allowed" : ""
                        }`}>
                          <input
                            type="radio"
                            {...field}
                            value="arrange_delivery"
                            className="text-[#F9C301] focus:ring-[#F9C301]"
                            checked={field.value === "arrange_delivery"}
                            disabled={paymentMethod === "cash_at_shop"}
                          />
                          <span>Arrange delivery through vendor</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            {...field}
                            value="collect_from_shop"
                            className="text-[#F9C301] focus:ring-[#F9C301]"
                            checked={field.value === "collect_from_shop"}
                          />
                          <span>Collect from the shop</span>
                        </label>
                      </div>
                    )}
                  />
                  {errors.deliveryMethod && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {errors.deliveryMethod.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[12px] font-body font-[500] text-[#111102] block mb-2">
                    Payment Method *
                  </label>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1 text-[11px]">
                        <label className={`flex items-center space-x-2 cursor-pointer ${
                          deliveryMethod === "arrange_delivery" ? "opacity-50 cursor-not-allowed" : ""
                        }`}>
                          <input
                            type="radio"
                            {...field}
                            value="cash_at_shop"
                            className="text-[#F9C301] focus:ring-[#F9C301]"
                            checked={field.value === "cash_at_shop"}
                            disabled={deliveryMethod === "arrange_delivery"}
                          />
                          <span>Pay cash at the shop</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            {...field}
                            value="bank_transfer"
                            className="text-[#F9C301] focus:ring-[#F9C301]"
                            checked={field.value === "bank_transfer"}
                          />
                          <span>Bank transfer</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            {...field}
                            value="pay_online"
                            className="text-[#F9C301] focus:ring-[#F9C301]"
                            checked={field.value === "pay_online"}
                          />
                          <span>Pay online</span>
                        </label>
                      </div>
                    )}
                  />
                  {errors.paymentMethod && (
                    <p className="text-[10px] text-red-600 mt-1">
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </div>
              </div>

              {/* <div className="text-[10px] text-[#111102] space-y-1 mt-2">
                <p>Delivery method: {deliveryLabel}</p>
                <p>Payment: {paymentLabel}</p>
                <p>Online platform : Auto Online .lk</p>
              </div> */}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="w-[120px] h-[36px] font-[600] font-body text-[12px] rounded-[3px] bg-gray-200 text-[#111102] hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              {/* <button
                type="submit"
                disabled={isSubmitting}
                className={`w-[120px] h-[36px] font-[600] font-body text-[12px] rounded-[3px] ${
                  isSubmitting
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </button> */}
              <button
                type="submit"
                disabled={isSubmitting || hasOutOfStock}
                className={`w-[120px] h-[36px] font-[600] font-body text-[12px] rounded-[3px] ${
                  isSubmitting || hasOutOfStock
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                }`}
              >
                {isSubmitting ? "Creating..." : hasOutOfStock ? "Out of Stock" : "Create Order"}
              </button>
            </div>
          </form>
          {/* Out of Stock Alert */}
          {showOutOfStockAlert && (
            <Dialog.Root open={showOutOfStockAlert} onOpenChange={setShowOutOfStockAlert}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[180px] bg-white rounded-[8px] shadow-lg focus:outline-none z-[70]">
                  <Dialog.Title className="text-[14px] font-bold text-[#111102] font-body text-left mt-3 pl-4">
                    Out of Stock
                  </Dialog.Title>
                  <div className="bg-[#F8F8F8] rounded-[5px] ml-4 mr-4 mt-2 p-4 flex flex-col items-center justify-center">
                    <div>
                      <p className="text-[11px] text-[#111102] font-body font-[500] text-center">
                        Sorry, one or more items are currently out of stock. You cannot create a purchase order at this time.
                      </p>
                    </div>
                    <div className="flex justify-center gap-x-6 mt-8">
                      <button
                        onClick={() => setShowOutOfStockAlert(false)}
                        className="w-[100px] h-[24px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[11px] rounded-[4px] hover:bg-yellow-500"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      onClick={() => setShowOutOfStockAlert(false)}
                      className="absolute top-3 right-4 text-gray-500 hover:text-[#F9C301]"
                    >
                      <CirclePlus className="rotate-45" size={18} />
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
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
