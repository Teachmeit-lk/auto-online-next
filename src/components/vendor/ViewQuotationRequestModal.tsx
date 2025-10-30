"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/components/authGuard/FirebaseAuthGuard";
import { FirebaseStorageService } from "@/service/firebaseStorageService";
import { QuotationService, QuotationRequest } from "@/service/firestoreService";

interface IViewQuotationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: QuotationRequest | null;
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
> = ({ isOpen, onClose, request }) => {
  const [fileName, setFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const schema = Yup.object().shape({
    itemName: Yup.string().required("Item Name is required"),
    serialNumber: Yup.string().required("Item S/N is required"),
    stockAvailability: Yup.string().required("Stock Availability is required"),
    measurement: Yup.string().required("Measurement is required"),
    noOfUnits: Yup.number()
      .required("No of Units is required")
      .positive("Must be a positive number")
      .integer("Must be an integer"),
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
    setValue("totalPrice", Number.isFinite(total) ? Number(total.toFixed(2)) : 0, { shouldValidate: true });
    setValue("netTotalPrice", Number.isFinite(netTotal) ? Number(netTotal.toFixed(2)) : 0, { shouldValidate: true });
  }, [watchedUnits, watchedUnitPrice, setValue]);

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
        const upload = await FirebaseStorageService.uploadDocument(user.id!, "quotation-attachments", data.image);
        attachmentUrl = upload.url;
      }

      const validUntil = new Date(Date.now() + (Number(data.validityDays) || 0) * 24 * 60 * 60 * 1000);

      const unitPriceNum = Number(data.unitPrice) || 0;
      const quantityNum = Number(data.noOfUnits) || 0;
      const totalAmountNum = Number(data.netTotalPrice) || unitPriceNum * quantityNum;

      await QuotationService.createQuotation({
        quotationRequestId: request.id,
        vendorId: user.id!,
        vendorName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "",
        vendorEmail: user.email || "",
        buyerId: request.buyerId,
        products: [
          {
            partName: data.itemName,
            quantity: quantityNum,
            unitPrice: unitPriceNum,
            totalPrice: unitPriceNum * quantityNum,
            description: data.description,
            condition: "new",
          },
        ],
        totalAmount: totalAmountNum,
        currency: "LKR",
        validUntil,
        deliveryTimeframe: `${data.validityDays} days`,
        terms: data.vendorComments,
        status: "pending",
        notes: `NIC: ${data.nic}, Staff: ${data.staffName}, Phone: ${data.contactNumber}${attachmentUrl ? `, Attachment: ${attachmentUrl}` : ""}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as any);

      handleModalClose();
    } catch (e: any) {
      console.error("Error submitting quotation", e);
      setSubmitError(e?.message || "Failed to submit quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    reset();
    setFileName("");
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[89vh] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
          <Dialog.Title className="text-[15px] font-bold mb-3 text-[#111102] font-body">
            Requested Quotation
          </Dialog.Title>
          {submitError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-[12px] text-red-600">{submitError}</div>
          )}

          <div className="h-full overflow-y-auto no-scrollbar">
            {/* Collapsible: Requested details */}
            <div className="bg-[#F8F8F8] rounded-[8px] mb-4 border border-[#E7E7E7]">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setShowDetails(prev => !prev)}
              >
                <span className="text-[13px] font-body font-[700] text-[#111102]">Requested Details</span>
                <span className="text-[12px] text-[#5B5B5B]">{showDetails ? "Hide" : "Show"}</span>
              </button>
              {showDetails && (
                <div className="px-6 pb-4 grid grid-cols-3 gap-x-6 gap-y-3">
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Buyer</div>
                    <div className="text-[11px] text-[#111102]">{request?.buyerName || request?.buyerId || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Vehicle Type</div>
                    <div className="text-[11px] text-[#111102]">{request?.vehicleType || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Fuel Type</div>
                    <div className="text-[11px] text-[#111102]">{request?.fuelType || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Brand/Model</div>
                    <div className="text-[11px] text-[#111102]">{request?.model || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Manufacturing Year</div>
                    <div className="text-[11px] text-[#111102]">{request?.manufacturingYear || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">Measurement</div>
                    <div className="text-[11px] text-[#111102]">{request?.measurement || "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5B5B5B]">No. of Units</div>
                    <div className="text-[11px] text-[#111102]">{request?.numberOfUnits ?? "-"}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-[10px] text-[#5B5B5B]">Description</div>
                    <div className="text-[11px] text-[#111102]">{request?.description || "-"}</div>
                  </div>
                  {Array.isArray(request?.attachedImages) && request!.attachedImages.length > 0 && (
                    <div className="col-span-3">
                      <div className="text-[10px] text-[#5B5B5B] mb-1">Attached Images</div>
                      <div className="flex flex-wrap gap-2">
                        {request!.attachedImages.map((url, idx) => (
                          <div key={idx} className="w-[64px] h-[48px] border rounded overflow-hidden bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`attachment-${idx}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <form
              className="grid grid-cols-3 gap-y-4 gap-x-6 bg-[#F8F8F8] rounded-[8px] p-8 mb-11"
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
                  defaultValue={request?.measurement || ""}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] 
                     ${
                       errors.measurement
                         ? "focus:ring-red-500 focus:border-red-500"
                         : "focus:ring-yellow-500 focus:border-yellow-500"
                     }`}
                      defaultValue=""
                    >
                      <option value="" className="text-gray-500">
                        Select Unit
                      </option>
                      <option value="Kg">Kg</option>
                      <option value="Lbs">Lbs</option>
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
                  defaultValue={(request?.numberOfUnits as any) || 1}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      id="noOfUnits"
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
                <div
                  className={`flex items-center justify-center w-full h-[40px] p-2 mt-1 border border-dashed border-[#D1D1D1] rounded-[3px] cursor-pointer bg-[#FEFEFE] 
               ${
                 errors.image
                   ? "focus:ring-red-500 focus:border-red-500"
                   : "focus:ring-yellow-500 focus:border-yellow-500"
               }`}
                >
                  <Camera size="16px" color="#5B5B5B" />

                  <Controller
                    name="image"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => (
                      <>
                        <input
                          type="file"
                          accept=".jpg, .png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setFileName(file.name);
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer text-[#D1D1D1] font-body text-[9px] pl-1 mt-[2px]"
                        >
                          {fileName ||
                            "Choose an Image to upload (jpg and png files only)"}
                        </label>
                      </>
                    )}
                  />
                </div>
                {/* Error Message */}
                {errors.image && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              <div className="flex col-span-3 gap-x-3 items-center justify-center mt-2">
                <button
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
                </button>
              </div>
              {/* Sales Person Details */}
              <h2 className="text-[15px] text-center col-span-3  mt-8 font-bold mb-2 text-[#111102] font-body">
                Sales Person Details
              </h2>

              {/* Item S/N */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  NIC
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
                  className={`w-[164px] h-[32px] font-[600] font-body text-[12px] rounded-[3px] ${isSubmitting ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"}`}
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
    </Dialog.Root>
  );
};
