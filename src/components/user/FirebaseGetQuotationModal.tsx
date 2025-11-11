"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus, Camera, X } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { FirebaseStorageService } from "@/service/firebaseStorageService";
import { QuotationService } from "@/service/firestoreService";
import { useAuth } from "@/components/authGuard/FirebaseAuthGuard";

interface IFirebaseGetQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (requestId: string) => void;
}

interface QuotationFormData {
  country: string;
  model: string;
  district: string;
  vehicletype: string;
  manufactoringyear: string;
  fueltype: string;
  measurement: string;
  noofunits: number;
  description: string;
  images: FileList | null;
  maxBudget?: number;
  targetDeliveryDate?: string;
}

export const FirebaseGetQuotationModal: React.FC<IFirebaseGetQuotationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = Yup.object().shape({
    country: Yup.string().required("Country is required"),
    model: Yup.string().required("Model is required"),
    district: Yup.string().required("District is required"),
    vehicletype: Yup.string().required("Vehicle type is required"),
    manufactoringyear: Yup.string().required("Manufacturing Year is required"),
    fueltype: Yup.string().required("Fuel type is required"),
    measurement: Yup.string().required("Measurement is required"),
    noofunits: Yup.number()
      .required("Number of units is required")
      .min(1, "At least 1 unit required"),
    description: Yup.string().required("Description is required"),
    images: Yup.mixed().required("At least one image is required"),
    maxBudget: Yup.number().min(0, "Budget must be positive"),
    targetDeliveryDate: Yup.string(),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: yupResolver(schema),
  });

  const selectedImages = watch("images");

  // Form submission handler
  const onSubmit = async (data: QuotationFormData) => {
    if (!user) {
      setSubmitError("Please log in to submit quotation requests");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let imageUrls: string[] = [];

      // Upload images if any
      if (data.images && data.images.length > 0) {
        const imageFiles = Array.from(data.images);
        
        // Validate images
        const validation = FirebaseStorageService.validateFiles(
          imageFiles,
          ["image/jpeg", "image/jpg", "image/png", "image/gif"],
          5, // 5MB max
          5  // max 5 images
        );

        if (!validation.isValid) {
          setSubmitError(validation.errors.join(", "));
          setIsSubmitting(false);
          return;
        }

        // Create request ID first for folder structure
        const tempRequestId = `temp_${Date.now()}`;

        // Upload images with progress tracking
        const uploadResults = await FirebaseStorageService.uploadQuotationImages(
          user.id!,
          tempRequestId,
          imageFiles,
          (fileIndex, progress) => {
            setUploadProgress(prev => {
              const newProgress = [...prev];
              newProgress[fileIndex] = progress.progress;
              return newProgress;
            });
          }
        );

        imageUrls = uploadResults.map(result => result.url);
      }

      // Create quotation request in Firestore
      const quotationRequestData = {
        buyerId: user.id!,
        buyerName: `${user.firstName} ${user.lastName}`,
        buyerEmail: user.email,
        buyerPhone: user.phone || "",
        country: data.country,
        model: data.model,
        district: data.district,
        vehicleType: data.vehicletype,
        manufacturingYear: data.manufactoringyear,
        fuelType: data.fueltype,
        measurement: data.measurement,
        numberOfUnits: data.noofunits,
        description: data.description,
        attachedImages: imageUrls,
        status: "pending" as const,
        quotationsReceived: 0,
        maxBudget: data.maxBudget,
        targetDeliveryDate: data.targetDeliveryDate ? new Date(data.targetDeliveryDate) : undefined,
        isActive: true,
      };

      const requestId = await QuotationService.createQuotationRequest(quotationRequestData);
      
      console.log("Quotation request created successfully:", requestId);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(requestId);
      }

      handleModalClose();
    } catch (error: any) {
      console.error("Error submitting quotation request:", error);
      setSubmitError(error.message || "Failed to submit quotation request. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress([]);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    reset();
    setUploadProgress([]);
    setSubmitError(null);
    onClose();
  };

  // Render upload progress
  const renderUploadProgress = () => {
    if (uploadProgress.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {uploadProgress.map((progress, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Image {index + 1}:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[89vh] bg-white py-8 px-6 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <Dialog.Title className="text-[15px] font-bold text-[#111102] font-body">
              Request Quotation - Auto Parts
            </Dialog.Title>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          <div className="h-full overflow-y-auto no-scrollbar">
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-500 text-sm">{submitError}</p>
              </div>
            )}

            <form
              className="grid grid-cols-3 gap-y-4 gap-x-8 bg-[#F8F8F8] rounded-[8px] p-8 mb-11"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Vehicle Country */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Country
                </label>
                <Controller
                  name="country"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.country
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select Country</option>
                      <option value="Japan">Japan</option>
                      <option value="Europe">Europe</option>
                      <option value="Korea">Korea</option>
                      <option value="India">India</option>
                      <option value="China">China</option>
                      <option value="USA">USA</option>
                      <option value="Other">Other</option>
                    </select>
                  )}
                />
                {errors.country && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Vehicle Model */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Model
                </label>
                <Controller
                  name="model"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Toyota Corolla"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.model
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.model && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.model.message}
                  </p>
                )}
              </div>

              {/* District */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  District
                </label>
                <Controller
                  name="district"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Colombo"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.district
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.district && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.district.message}
                  </p>
                )}
              </div>

              {/* Vehicle Type */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vehicle Type
                </label>
                <Controller
                  name="vehicletype"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.vehicletype
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select Type</option>
                      <option value="Car">Car</option>
                      <option value="Van">Van</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Bus">Bus</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Three Wheeler">Three Wheeler</option>
                    </select>
                  )}
                />
                {errors.vehicletype && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.vehicletype.message}
                  </p>
                )}
              </div>

              {/* Manufacturing Year */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Manufacturing Year
                </label>
                <Controller
                  name="manufactoringyear"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      placeholder="2020"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.manufactoringyear
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.manufactoringyear && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.manufactoringyear.message}
                  </p>
                )}
              </div>

              {/* Fuel Type */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Fuel Type
                </label>
                <Controller
                  name="fueltype"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.fueltype
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select Fuel Type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                      <option value="LPG">LPG</option>
                    </select>
                  )}
                />
                {errors.fueltype && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.fueltype.message}
                  </p>
                )}
              </div>

              {/* Measurement */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Measurement/Size
                </label>
                <Controller
                  name="measurement"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., 185/65R15"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.measurement
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.measurement && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.measurement.message}
                  </p>
                )}
              </div>

              {/* Number of Units */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Number of Units
                </label>
                <Controller
                  name="noofunits"
                  control={control}
                  defaultValue={1}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.noofunits
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.noofunits && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.noofunits.message}
                  </p>
                )}
              </div>

              {/* Max Budget */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Max Budget (LKR) <span className="text-gray-500">(Optional)</span>
                </label>
                <Controller
                  name="maxBudget"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="0"
                      placeholder="50000"
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.maxBudget
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.maxBudget && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.maxBudget.message}
                  </p>
                )}
              </div>

              {/* Target Delivery Date */}
              <div className="col-span-1">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Target Delivery <span className="text-gray-500">(Optional)</span>
                </label>
                <Controller
                  name="targetDeliveryDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full h-[33px] text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] ${
                        errors.targetDeliveryDate
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
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
                      placeholder="Please provide detailed description of the required auto part..."
                      className={`w-full text-[#111102] font-body text-[10px] mt-1 p-2 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301] resize-none ${
                        errors.description
                          ? "focus:ring-red-500 focus:border-red-500"
                          : "focus:ring-yellow-500 focus:border-yellow-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-500 text-[8px] mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102] mb-2 block">
                  Upload Images (Max 5 images, 5MB each)
                </label>
                <div
                  className={`flex items-center justify-center w-full h-[80px] p-4 border-2 border-dashed rounded-[8px] cursor-pointer bg-[#FEFEFE] transition-colors
                  ${errors.images
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
                  }`}
                >
                  <div className="text-center">
                    <Camera size="24px" color="#5B5B5B" className="mx-auto mb-2" />
                    <Controller
                      name="images"
                      control={control}
                      render={({ field: { onChange, name } }) => (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => onChange(e.target.files)}
                            className="hidden"
                            id="images-upload"
                            name={name}
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="images-upload"
                            className="cursor-pointer text-gray-600 font-body text-[12px]"
                          >
                            {selectedImages && selectedImages.length > 0
                              ? `${selectedImages.length} image(s) selected`
                              : "Choose images to upload (JPG, PNG, GIF)"}
                          </label>
                        </>
                      )}
                    />
                  </div>
                </div>

                {/* Show selected images */}
                {selectedImages && selectedImages.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Selected images:</p>
                    <div className="space-y-1">
                      {Array.from(selectedImages).map((file, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          {index + 1}. {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload progress */}
                {renderUploadProgress()}

                {errors.images && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.images.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex col-span-3 items-center justify-center mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-[200px] h-[40px] font-[600] font-body text-[14px] rounded-[5px] transition-all
                    ${isSubmitting
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-[#F9C301] text-[#111102] hover:bg-yellow-500"
                    }`}
                >
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT REQUEST"}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};