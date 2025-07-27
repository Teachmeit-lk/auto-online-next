"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, MapPin, Car, Fuel, Settings, Hash, Eye, Image as ImageIcon } from "lucide-react";
import { QuotationRequest } from "@/service/firestoreService";
import { useState } from "react";

interface FirebaseViewQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotationRequest: QuotationRequest | null;
}

export const FirebaseViewQuotationModal: React.FC<FirebaseViewQuotationModalProps> = ({
  isOpen,
  onClose,
  quotationRequest,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  if (!quotationRequest) return null;

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'received_quotes': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'completed': return 'text-green-700 bg-green-100 border-green-300';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImageViewer = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-h-[90vh] bg-white py-6 px-8 rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-[18px] font-bold text-[#111102] font-body">
                Quotation Request Details
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="h-full overflow-y-auto no-scrollbar">
              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(quotationRequest.status)}`}>
                  {quotationRequest.status.charAt(0).toUpperCase() + quotationRequest.status.slice(1).replace('_', ' ')}
                </span>
                <div className="text-gray-600 text-sm mt-2 flex items-center">
                  <Hash size={16} className="mr-1" />
                  Request ID: {quotationRequest.id?.substring(0, 12)}...
                </div>
              </div>

              {/* Request Information Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-[16px] font-[600] text-[#111102] border-b pb-2">Vehicle Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Car size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-20">Model:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.model}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Car size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-20">Type:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.vehicleType}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-20">Country:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.country}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-20">Year:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.manufacturingYear}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Fuel size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-20">Fuel:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.fuelType}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[16px] font-[600] text-[#111102] border-b pb-2">Request Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Settings size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-24">Measurement:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.measurement}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Hash size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-24">Units:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.numberOfUnits}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-24">District:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.district}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Eye size={16} className="text-gray-500 mr-2" />
                      <span className="text-[12px] text-gray-600 w-24">Quotes:</span>
                      <span className="text-[12px] font-[500] text-[#111102]">{quotationRequest.quotationsReceived || 0} received</span>
                    </div>

                    {quotationRequest.maxBudget && (
                      <div className="flex items-center">
                        <span className="text-[12px] text-gray-600 w-24">Max Budget:</span>
                        <span className="text-[12px] font-[500] text-[#111102]">LKR {quotationRequest.maxBudget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-[16px] font-[600] text-[#111102] border-b pb-2 mb-3">Description</h3>
                <p className="text-[12px] text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-[8px]">
                  {quotationRequest.description}
                </p>
              </div>

              {/* Attached Images */}
              {quotationRequest.attachedImages && quotationRequest.attachedImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[16px] font-[600] text-[#111102] border-b pb-2 mb-3 flex items-center">
                    <ImageIcon size={18} className="mr-2" />
                    Attached Images ({quotationRequest.attachedImages.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {quotationRequest.attachedImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer bg-gray-100 rounded-[8px] overflow-hidden aspect-square"
                        onClick={() => handleImageClick(index)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[14px] font-[600] text-[#111102] mb-2">Request Date</h4>
                  <p className="text-[12px] text-gray-600">{formatDate(quotationRequest.createdAt)}</p>
                </div>
                
                {quotationRequest.targetDeliveryDate && (
                  <div>
                    <h4 className="text-[14px] font-[600] text-[#111102] mb-2">Target Delivery</h4>
                    <p className="text-[12px] text-gray-600">{formatDate(quotationRequest.targetDeliveryDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && quotationRequest.attachedImages && (
        <Dialog.Root open={true} onOpenChange={closeImageViewer}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] bg-white rounded-[10px] shadow-lg focus:outline-none overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-[16px] font-[600] text-[#111102]">
                  Image {selectedImageIndex + 1} of {quotationRequest.attachedImages.length}
                </h3>
                <button
                  onClick={closeImageViewer}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex items-center justify-center h-full p-4">
                <img
                  src={quotationRequest.attachedImages[selectedImageIndex]}
                  alt={`Attachment ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  );
};