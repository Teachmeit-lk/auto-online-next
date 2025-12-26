"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/components/authGuard/FirebaseAuthGuard";
import { FirebaseStorageService } from "@/service/firebaseStorageService";
import {
  QuotationService,
  QuotationRequest,
  FirestoreService,
  COLLECTIONS,
} from "@/service/firestoreService";
import { buildVendorQuotationWhatsAppUrl } from "../hooks/openWhatsAppWithQuotation";
import { SendWhatsAppConfirmationModal } from "../user/SendWhatsAppConfirmationModal";
import Image from "next/image";
import { showToast } from "@/app/utils/toast";

interface IViewQuotationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: QuotationRequest | null;
  onSubmitted?: () => void;
}

interface IFormValues {
  itemName: string;
  serialNumber: string;
  stockAvailability: string;
  measurement: string;
  noOfUnits: number;
  unitPrice: number;
  totalPrice: number;
  netTotalPrice: number;
  vendorComments: string;
  description: string;
  image: File | null;
  nic: string;
  staffName: string;
  contactNumber: string;
  deliveryCost: number;
  validityDays: number;
}

export const ViewQuotationRequestModal: React.FC<
  IViewQuotationRequestModalProps
> = ({ isOpen, onClose, request, onSubmitted }) => {
  const [fileName, setFileName] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [measurementOptions, setMeasurementOptions] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [pendingWhatsAppData, setPendingWhatsAppData] = useState<{
    buyerPhone: string;
    buyerName?: string | null;
    request: QuotationRequest;
    vendorUser: any;
    quotation: {
      itemName: string;
      stockAvailability: string;
      measurement: string;
      noOfUnits: number;
      unitPrice: number;
      totalPrice: number;
      netTotalPrice: number;
      deliveryCost: number;
      validityDays: number;
      vendorComments: string;
    };
    attachmentUrl?: string;
  } | null>(null);

  const schema = Yup.object().shape({
    itemName: Yup.string().required("Item Name is required"),
    serialNumber: Yup.string().required("Item S/N is required"),
    stockAvailability: Yup.string().required("Stock Availability is required"),
    measurement: Yup.string().required("Measurement is required"),
    noOfUnits: Yup.number()
      .required("No of Units is required")
      .integer("Must be an integer")
      .when("stockAvailability", {
        is: "Out of Stock",
        then: (schema) =>
          schema
            .min(0, "Units cannot be negative")
            .max(0, "No of Units must be 0 when out of stock"),
        otherwise: (schema) =>
          schema.min(1, "No of Units must be at least 1 when in stock"),
      }),
    unitPrice: Yup.number()
      .required("Unit Price is required")
      .positive("Must be a positive number"),
    totalPrice: Yup.number().required("Total Price is required"),
    netTotalPrice: Yup.number().required("Net Total Price is required"),
    vendorComments: Yup.string().required("Vendor Comments are required"),
    description: Yup.string().required("Description is required"),
    image: Yup.mixed().nullable(),
    nic: Yup.string()
      .required("NIC is required")
      .matches(
        /^(([5-9][0-9][0-3,5-8][0-9]{6}[vVxX])|([1-2][0,9][0-9]{2}[0-3,5-8][0-9]{7})|([0-9]{9}[vV]))$/,
        "NIC must be valid. It should be either a 12-digit NIC or 9 digits followed by 'v' or 'V'."
      ),
    staffName: Yup.string().required("Staff Name is required"),
    contactNumber: Yup.string()
      .matches(
        /^0\d{9}$/,
        "Mobile number must start with 0 and contain exactly 10 digits."
      )
      .required("Contact Number is required"),
    deliveryCost: Yup.number()
      .required("Delivery Cost is required")
      .positive("Must be a positive number"),
    validityDays: Yup.number()
      .required("Validity Days is required")
      .positive("Must be a positive number")
      .integer("Must be an integer"),
  });

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IFormValues>({
    resolver: yupResolver(schema),
  });

  // Auto-calc total and net total when units or unit price change
  const watchedUnits = watch("noOfUnits");
  const watchedUnitPrice = watch("unitPrice");
  useEffect(() => {
    const unitsNum = Number(watchedUnits) || 0;
    const unitPriceNum = Number(watchedUnitPrice) || 0;
    const total = unitsNum * unitPriceNum;
    const netTotal = total * 1.12; // 12% VAT
    setValue(
      "totalPrice",
      Number.isFinite(total) ? Number(total.toFixed(2)) : 0,
      { shouldValidate: true }
    );
    setValue(
      "netTotalPrice",
      Number.isFinite(netTotal) ? Number(netTotal.toFixed(2)) : 0,
      { shouldValidate: true }
    );
  }, [watchedUnits, watchedUnitPrice, setValue]);

  const watchedStock = watch("stockAvailability");

  useEffect(() => {
    if (watchedStock === "Out of Stock") {
      setValue("noOfUnits", 0, { shouldValidate: true });
    }
  }, [watchedStock, setValue]);

  useEffect(() => {
    (async () => {
      const units = await FirestoreService.getAll<any>(
        COLLECTIONS.MEASUREMENT_UNITS,
        undefined,
        "name",
        "asc"
      );
      setMeasurementOptions((units || []).map((t: any) => t.name));
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!isOpen) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      setFileName("");
    }
  }, [isOpen, imagePreview]);

  // Form submission handler
  const onSubmit = async (data: IFormValues) => {
    if (!user) {
      setSubmitError("Please log in");
      return;
    }
    if (!request?.id) {
      setSubmitError("No request selected");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let attachmentUrl: string | undefined;
      if (data.image instanceof File) {
        const upload = await FirebaseStorageService.uploadDocument(
          user.id!,
          "quotation-attachments",
          data.image
        );
        attachmentUrl = upload.url;
      }

      const validUntil = new Date(
        Date.now() + (Number(data.validityDays) || 0) * 24 * 60 * 60 * 1000
      );

      const unitPriceNum = Number(data.unitPrice) || 0;
      const quantityNum = Number(data.noOfUnits) || 0;
      const totalPriceNum = unitPriceNum * quantityNum;
      const netTotalNum = Number(data.netTotalPrice) || totalPriceNum * 1.12;

      await QuotationService.createQuotation({
        quotationRequestId: request.id,
        vendorId: user.id!,
        vendorName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email ||
          "",
        vendorEmail: user.email || "",
        buyerId: request.buyerId,
        deliveryCost: data.deliveryCost,
        vendorPhone: user.whatsApp || "",
        products: [
          {
            partName: data.itemName,
            quantity: quantityNum,
            unitPrice: unitPriceNum,
            totalPrice: totalPriceNum,
            description: data.description,
            condition: "new",
            imageUrl: attachmentUrl || null,
            stockAvailability: data.stockAvailability,
            vendorComments: data.vendorComments,
            warranty: data.vendorComments,
          },
        ],
        description: data.description,
        totalAmount: netTotalNum,
        currency: "LKR",
        validUntil,
        deliveryTimeframe: `${data.validityDays} days`,
        terms: data.vendorComments,
        status: "pending",
        notes: `NIC: ${data.nic}, Staff: ${data.staffName}, Phone: ${
          data.contactNumber
        }, Delivery Cost: ${data.deliveryCost || 0}${
          attachmentUrl ? `, Attachment: ${attachmentUrl}` : ""
        }`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as any);

      showToast.success("Quotation submitted successfully! ");

      const buyerPhone = (request as any)?.buyerPhone;
      const buyerName = request?.buyerName;

      if (buyerPhone) {
        setPendingWhatsAppData({
          buyerPhone,
          buyerName,
          request,
          vendorUser: user,
          quotation: {
            itemName: data.itemName,
            stockAvailability: data.stockAvailability,
            measurement: data.measurement,
            noOfUnits: quantityNum,
            unitPrice: unitPriceNum,
            totalPrice: totalPriceNum,
            netTotalPrice: netTotalNum,
            deliveryCost: Number(data.deliveryCost) || 0,
            validityDays: Number(data.validityDays) || 0,
            vendorComments: data.vendorComments,
          },
          attachmentUrl,
        });
        setWhatsAppModalOpen(true);
      } else {
        onSubmitted?.();
        handleModalClose();
      }

      onSubmitted?.();
      handleModalClose();
    } catch (e: any) {
      console.error("Error submitting quotation", e);
      setSubmitError(e?.message || "Failed to submit quotation");
      showToast.error("Failed to submit quotation. Please try again. ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmWhatsApp = async () => {
    if (!pendingWhatsAppData) return;

    const {
      buyerPhone,
      buyerName,
      request,
      vendorUser,
      quotation,
      attachmentUrl,
    } = pendingWhatsAppData;

    const vendorName =
      `${vendorUser?.firstName || ""} ${vendorUser?.lastName || ""}`.trim() ||
      vendorUser?.email ||
      "Your vendor";

    try {
      await fetch("/api/webhooks/whatsapp/vendor-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerPhone,
          buyerName,
          vendorName,
          request,
          quotation,
          attachmentUrl,
        }),
      });

      showToast.success("WhatsApp message sent to buyer!");
    } catch (e) {
      console.error(e);
      showToast.error("Failed to send WhatsApp message");
    } finally {
      setWhatsAppModalOpen(false);
      setPendingWhatsAppData(null);
      onSubmitted?.();
      handleModalClose();
    }
  };

  const handleSkipWhatsApp = () => {
    setWhatsAppModalOpen(false);
    setPendingWhatsAppData(null);
    onSubmitted?.();
    handleModalClose();
  };

  // Handle modal close
  const handleModalClose = () => {
    reset();
    setFileName("");
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full h-[70vh] md:h-[85vh] sm:h-[70vh] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
          <Dialog.Title className="text-[15px] font-bold mb-3 text-[#111102] font-body">
            Requested Quotation
          </Dialog.Title>
          {submitError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-600">
              {submitError}
            </div>
          )}

          <div className="h-full overflow-y-auto no-scrollbar">
            {/* Collapsible: Requested details */}
            <div className="bg-[#F8F8F8] rounded-[8px] mb-4 border border-[#E7E7E7]">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setShowDetails((prev) => !prev)}
              >
                <span className="text-[13px] font-body font-[700] text-[#111102]">
                  Requested Details
                </span>
                <span className="text-[12px] text-[#5B5B5B]">
                  {showDetails ? "Hide" : "Show"}
                </span>
              </button>
              {showDetails && (
                <div className="px-6 pb-4 sm:grid sm:grid-cols-3 gap-x-6 gap-y-3 sm:space-y-0 space-y-2">
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Buyer</div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.buyerName || request?.buyerId || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">
                      Vehicle Type
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.vehicleType || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Fuel Type</div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.fuelType || "-"}
                    </div>
                  </div>
                  {/* Vehicle Brand */}
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">
                      Vehicle Brand
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.brand || "-"}
                    </div>
                  </div>

                  {/* Vehicle Model */}
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">
                      Vehicle Model
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.model || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">
                      Manufacturing Year
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.manufacturingYear || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">
                      Requested Category
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.category || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">
                      Measurement
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.measurement || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">
                      No. of Units
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.numberOfUnits ?? "-"}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-[10px] text-[#5B5B5B]">
                      Description
                    </div>
                    <div className="text-[11px] text-[#111102]">
                      {request?.description || "-"}
                    </div>
                  </div>
                  {Array.isArray(request?.attachedImages) &&
                    request!.attachedImages.length > 0 && (
                      <div className="col-span-3">
                        <div className="text-[10px] text-[#5B5B5B] mb-1">
                          Attached Images ({request!.attachedImages.length}{" "}
                          {request!.attachedImages.length === 1
                            ? "image"
                            : "images"}
                          )
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {request!.attachedImages.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative w-[64px] h-[48px] border rounded overflow-hidden bg-white cursor-pointer hover:border-[#F9C301] transition-all group"
                              onClick={() => setSelectedImageIndex(idx)}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`attachment-${idx}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <span className="text-white text-[8px] font-body opacity-0 group-hover:opacity-100 bg-[#F9C301] px-2 py-0.5 rounded-full">
                                  View
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
            <form
              className="sm:grid sm:grid-cols-3 gap-y-4 gap-x-6 sm:space-y-0 space-y-2 bg-[#F8F8F8] rounded-[8px] p-8 mb-11"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Item Name */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Item Name
                </label>
                <Controller
                  name="itemName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter item name"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.itemName
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.itemName && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.itemName.message}
                  </p>
                )}
              </div>

              {/* Item S/N */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Item S/N
                </label>
                <Controller
                  name="serialNumber"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter serial number"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.serialNumber
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.serialNumber && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.serialNumber.message}
                  </p>
                )}
              </div>

              {/* Stock Availability */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Stock Availability
                </label>
                <Controller
                  name="stockAvailability"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.stockAvailability
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  )}
                />
                {errors.stockAvailability && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.stockAvailability.message}
                  </p>
                )}
              </div>

              {/* Measurement */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Measurement
                </label>
                <Controller
                  name="measurement"
                  control={control}
                  defaultValue={""}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                      ${
                        errors.measurement
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    >
                      <option value="" className="text-gray-500">
                        Select Unit
                      </option>
                      {measurementOptions.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.measurement && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.measurement.message}
                  </p>
                )}
              </div>

              {/* No of Units */}
              <div className="col-span-1">
                <label className="text-[10px] font-body font-[500] text-[#111102]">
                  No of Units
                </label>
                <Controller
                  name="noOfUnits"
                  control={control}
                  defaultValue={0}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="noOfUnits"
                      disabled={watchedStock === "Out of Stock"}
                      placeholder="Enter number of units"
                      value={field.value ?? ""}
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.noOfUnits
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                    />
                  )}
                />
                {errors.noOfUnits && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.noOfUnits.message}
                  </p>
                )}
              </div>

              {/* Unit Price */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Unit Price (Rs.)
                </label>
                <Controller
                  name="unitPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.01"
                      value={field.value ?? ""}
                      placeholder="Enter unit price"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                        ${
                          errors.unitPrice
                            ? "focus:ring-red-500 focus:border-red-500"
                            : "focus:ring-yellow-500 focus:border-yellow-500"
                        }`}
                    />
                  )}
                />
                {errors.unitPrice && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.unitPrice.message}
                  </p>
                )}
              </div>

              {/* Total Price */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Total Price (Rs.)
                </label>
                <Controller
                  name="totalPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      readOnly
                      value={field.value ?? ""}
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.totalPrice
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.totalPrice && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.totalPrice.message}
                  </p>
                )}
              </div>

              {/* Net Total Price */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Net Total Price (Rs.)
                </label>
                <Controller
                  name="netTotalPrice"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      readOnly
                      value={field.value ?? ""}
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.netTotalPrice
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.netTotalPrice && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.netTotalPrice.message}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] text-[#930000] mt-12">
                  Net total includes 12% VAT rate.
                </p>
              </div>

              {/* Vendor Comments */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vendor Comments
                </label>
                <Controller
                  name="vendorComments"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Enter vendor comments"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.vendorComments
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.vendorComments && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.vendorComments.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Enter description"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.description
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102] block mb-2">
                  Upload Image
                </label>

                <Controller
                  name="image"
                  control={control}
                  defaultValue={null}
                  render={({ field }) => (
                    <>
                      <div
                        className={`flex items-center justify-center w-full h-[40px] p-2 border border-dashed border-[#D1D1D1] rounded-[3px] cursor-pointer bg-[#FEFEFE] 
                          ${
                            errors.image
                              ? "border-red-500"
                              : "hover:border-[#F9C301]"
                          }`}
                      >
                        <Camera size="16px" color="#5B5B5B" />

                        <input
                          type="file"
                          accept=".jpg, .png, .jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setFileName(file.name);

                              // Create preview
                              const previewUrl = URL.createObjectURL(file);
                              setImagePreview(previewUrl);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-[#5B5B5B] font-body text-[10px] pl-1 mt-[2px]"
                        >
                          {fileName ||
                            "Choose an Image to upload (jpg and png files only)"}
                        </label>
                      </div>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mt-3 relative group inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-24 object-cover rounded-[3px] border border-[#D1D1D1]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Clear image
                              field.onChange(null);
                              setFileName("");
                              if (imagePreview) {
                                URL.revokeObjectURL(imagePreview);
                              }
                              setImagePreview(null);

                              // Reset file input
                              const fileInput = document.getElementById(
                                "file-upload"
                              ) as HTMLInputElement;
                              if (fileInput) fileInput.value = "";
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </>
                  )}
                />

                {/* Error Message */}
                {errors.image && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              <div className="flex col-span-3 gap-x-3 items-center justify-center mt-2">
                {/* <button
                  type="submit"
                  className="w-[164px] h-[32px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[12px] rounded-[3px] hover:bg-yellow-500"
                >
                  Add Item
                </button>

                <button
                  type="submit"
                  className="w-[164px] h-[32px] bg-[#F9C301] text-[#111102] font-[600] font-body text-[12px] rounded-[3px] hover:bg-yellow-500"
                >
                  Add as Empty
                </button> */}
              </div>
              {/* Sales Person Details */}
              <h2 className="text-[15px] text-center col-span-3  mt-8 font-bold mb-2 text-[#111102] font-body">
                Sales Person Details
              </h2>

              {/* Item S/N */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Staff ID / NIC
                </label>
                <Controller
                  name="nic"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter nic number"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.serialNumber
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.nic && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.nic.message}
                  </p>
                )}
              </div>

              {/* Item S/N */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Staff Name
                </label>
                <Controller
                  name="staffName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter staff name"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.staffName
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.staffName && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.staffName.message}
                  </p>
                )}
              </div>

              {/* Item S/N */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Contact Number
                </label>
                <Controller
                  name="contactNumber"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter contact number"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.contactNumber
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>

              {/* Item S/N */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Delivery Cost (Rs.)
                </label>
                <Controller
                  name="deliveryCost"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter delivery cost"
                      value={field.value ?? ""}
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.deliveryCost
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.deliveryCost && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.deliveryCost.message}
                  </p>
                )}
              </div>

              {/* Item S/N */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Validity Days
                </label>
                <Controller
                  name="validityDays"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      value={field.value ?? ""}
                      placeholder="Enter validity days"
                      className={`w-full h-h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.validityDays
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                    />
                  )}
                />
                {errors.validityDays && (
                  <p className="text-red-500 text-[8px]  mt-1">
                    {errors.validityDays.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex col-span-3 items-center justify-center mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-[164px] h-[32px] font-[600] font-body text-[12px] rounded-[3px] ${
                    isSubmitting
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit to Customer"}
                </button>
              </div>
            </form>
          </div>
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#F9C301]"
            >
              <CirclePlus className="rotate-45" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Image Lightbox Modal */}
      {selectedImageIndex !== null && request?.attachedImages && (
        <Dialog.Root
          open={true}
          onOpenChange={() => setSelectedImageIndex(null)}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-auto md:max-w-[90vw] max-h-[90vh] focus:outline-none z-[60] px-4 md:px-0">
              <Dialog.Title></Dialog.Title>
              <div className="relative flex flex-col items-center">
                {/* Main Image */}
                <Image
                  src={request.attachedImages[selectedImageIndex]}
                  alt={`Full size image ${selectedImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className="max-w-[90vw] max-h-[85vh] w-auto h-auto rounded-lg object-contain"
                />

                {/* Image Counter */}
                <div className="absolute top-2 md:-top-12 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-[10px] md:text-[12px] font-body z-10">
                  {selectedImageIndex + 1} / {request.attachedImages.length}
                </div>

                {/* Navigation Buttons */}
                {request.attachedImages.length > 1 && (
                  <>
                    {/* Previous Button */}
                    {selectedImageIndex > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex(selectedImageIndex - 1);
                        }}
                        className="absolute left-2 md:-left-14 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#F9C301] text-white w-8 h-8 md:w-10 md: h-10 rounded-full flex items-center justify-center transition-all z-10 text-lg md:text-xl"
                      >
                        ‹
                      </button>
                    )}

                    {/* Next Button */}
                    {selectedImageIndex < request.attachedImages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex(selectedImageIndex + 1);
                        }}
                        className="absolute right-2 md:-right-14 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-[#F9C301] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10 text-lg md:text-xl"
                      >
                        ›
                      </button>
                    )}
                  </>
                )}

                {/* Close Button */}
                <Dialog.Close asChild>
                  <button
                    onClick={() => setSelectedImageIndex(null)}
                    className="absolute top-2 right-2 md:-top-12 md:-right-12 bg-black/70 hover:bg-red-500 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10"
                  >
                    <CirclePlus className="w-4 h-4 md:w-5 md:h-5 rotate-45" />
                  </button>
                </Dialog.Close>

                {/* Thumbnail Strip */}
                {request.attachedImages.length > 1 && (
                  <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 bg-black/70 p-1.5 md:p-2 max-w-[90vw] overflow-x-auto no-scrollbar">
                    {request.attachedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 overflow-hidden border-2 transition-all ${
                          idx === selectedImageIndex
                            ? "border-[#F9C301] scale-110"
                            : "border-white/30 hover:border-white/60"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      <SendWhatsAppConfirmationModal
        isOpen={whatsAppModalOpen}
        onConfirm={handleConfirmWhatsApp}
        onSkip={handleSkipWhatsApp}
        onClose={() => setWhatsAppModalOpen(false)}
        person="buyer"
      />
    </Dialog.Root>
  );
};
