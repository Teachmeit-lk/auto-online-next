"use client";

import React, { useState, useEffect } from "react";
import { Search, ClipboardCheck, Eye } from "lucide-react";
import Image, { StaticImageData } from "next/image";

import { CarImage1 } from "@/assets/Images";
import {
  OpenChatConfirmationModal,
  TabLayout,
  ViewQuotationRequestModal,
} from "@/components";
import { withFirebaseAuth, useAuth } from "@/components/authGuard/FirebaseAuthGuard";
import { QuotationService, QuotationRequest } from "@/service/firestoreService";
import { FirebaseViewQuotationModal } from "@/components/user/FirebaseViewQuotationModal";
// import {
//   DeleteQuotationModalAlert,
//   NewPriceChatAlert,
//   RequestedQuotationModal,
//   SentQuotationModal,
// } from "@/app/modal";

const NewPriceRequests: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const [popupImage, setPopupImage] = useState<string | null>(null);

  // Fetch quotation requests from Firebase with real-time updates
  useEffect(() => {
    setLoading(true);
    
    // Set up real-time listener based on status filter
    const unsubscribe = QuotationService.onQuotationRequestsByStatusChange(
      statusFilter,
      (requests) => {
        setQuotationRequests(requests);
        setFilteredRequests(requests.slice(0, entries));
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or filter change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [entries, statusFilter]);

  // Filter requests based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRequests(quotationRequests.slice(0, entries));
    } else {
      const filtered = quotationRequests.filter(request =>
        request.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered.slice(0, entries));
    }
  }, [searchTerm, quotationRequests, entries]);

  const handleViewRequest = (request: QuotationRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setPopupImage(imageUrl);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'received_quotes': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // const handleConfirmChat = () => {
  //   console.log("Chat confirmed!");
  //   setIsModalOpen2(false);
  // };

  // const handleDeleteQuotation = () => {
  //   console.log("Quotation Deleted!");
  //   setIsModalOpen4(false);
  // };

  return (
    <TabLayout type="vendor">
      <div
        className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px]"
        id="quotationrequests"
      >
        <h1 className="text-[18px] font-bold font-body text-center text-[#111102] mb-6">
          New Price Requests
        </h1>

        <div className="flex flex-row items-center justify-between  mb-4">
          <div className="flex flex-row">
            <div>
              <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
                Show
              </div>
              <div className="flex space-x-4">
                <select
                  className="rounded-[5px] px-3 font-body  text-[12px] text-gray-600 w-[131px] h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  onChange={(e) => setEntries(Number(e.target.value))}
                  defaultValue="5"
                >
                  <option value="5">5 Entries</option>
                  <option value="10">10 Entries</option>
                  <option value="20">20 Entries</option>
                </select>
              </div>
            </div>
            <div className="ml-10">
              <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1 ">
                Status Filter
              </div>
              <div className="flex space-x-4">
                <select
                  className="rounded-[5px] px-3 font-body  text-[12px] text-gray-600 w-auto h-[28px] focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  value={statusFilter}
                >
                  <option value="pending">New Requests</option>
                  <option value="received_quotes">Quoted Requests</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
              Search
            </div>
            <div className="relative flex items-center rounded-[5px] text-sm text-gray-600 w-[263px] h-[28px]">
              <input
                type="text"
                placeholder="Search by customer, model, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full pl-3 pr-8 font-body rounded-[5px] text-[12px] text-gray-600 outline-none focus:ring-2 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search
                  strokeWidth="2px"
                  color="#5B5B5B"
                  size="17px"
                  className="text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto rounded-tl-[10px] rounded-tr-[10px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="h-[36px] bg-[#D1D1D1] text-center text-[14px] font-body text-[#111102] font-[500]">
                    <th className="border border-r-2 border-b-2 border-white px-1 py-2">
                      No.
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Customer Name
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Vehicle Model
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Vehicle Type
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Vehicle Country
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Status
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Images
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Date
                    </th>
                    <th className="border px-1 py-2 border-b-1 border-white flex items-center justify-center space-x-2">
                      <ClipboardCheck size="19px" />
                      <span>Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        {quotationRequests.length === 0
                          ? `No ${statusFilter === 'pending' ? 'new' : 'quoted'} quotation requests found.`
                          : "No requests match your search criteria."
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request, index) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 bg-white text-[12px] font-body text-[#111102]"
                      >
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] py-2 text-center">
                          {index + 1}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {request.buyerName}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {request.model}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {request.vehicleType}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {request.country}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-[500] ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] text-center py-2">
                          {request.attachedImages && request.attachedImages.length > 0 ? (
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleImageClick(request.attachedImages[0])}
                                className="relative group"
                              >
                                <img
                                  src={request.attachedImages[0]}
                                  alt="Request Image"
                                  className="h-[42px] w-[62px] object-cover rounded border"
                                />
                                {request.attachedImages.length > 1 && (
                                  <div className="absolute -top-1 -right-1 bg-yellow-500 text-black rounded-full h-5 w-5 flex items-center justify-center text-[8px] font-bold">
                                    +{request.attachedImages.length - 1}
                                  </div>
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px]">No images</span>
                          )}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="grid grid-cols-2 gap-1 text-center w-full h-full">
                          <button
                            className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 transition-colors"
                            onClick={() => handleViewRequest(request)}
                          >
                            <Eye size={14} className="inline mr-1" />
                            View
                          </button>
                          <button
                            className="bg-[#D1D1D1] py-3 text-[#111102] text-[12px] w-full h-full focus:hover:bg-yellow-500 hover:bg-yellow-500 transition-colors"
                            onClick={() => setIsModalOpen(true)}
                          >
                            Quote
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {popupImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={closePopup}
          >
            <div className="relative max-h-[80vh] max-w-[80vw]">
              <img
                src={popupImage}
                alt="Request Image"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing {filteredRequests.length > 0 ? 1 : 0}-{filteredRequests.length} of {quotationRequests.length} Entries
        </div>

        {/* Firebase View Quotation Modal */}
        <FirebaseViewQuotationModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          quotationRequest={selectedRequest}
        />

        <OpenChatConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {
            alert("Quotation feature in development");
            setIsModalOpen(false);
          }}
        />

        {/* <NewPriceChatAlert
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmChat}
      />


      <SentQuotationModal
        isOpen={isModalOpen3}
        onClose={() => setIsModalOpen3(false)}
      />

      <DeleteQuotationModalAlert
        isOpen={isModalOpen4}
        onClose={() => setIsModalOpen4(false)}
        onConfirm={handleDeleteQuotation}
      /> */}
      </div>
    </TabLayout>
  );
};
export default withFirebaseAuth(NewPriceRequests, {
  requiredRole: "vendor",
  redirectTo: "/vendor/login"
});
