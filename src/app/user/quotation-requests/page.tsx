"use client";

import React, { useState, useEffect } from "react";
import { Search, ClipboardCheck, Plus } from "lucide-react";
import { TabLayout } from "@/components";

import { ViewEstimateModal } from "@/components/user/ViewEstimateModal";
import { FirebaseGetQuotationModal } from "@/components/user/FirebaseGetQuotationModal";
import { FirebaseViewQuotationModal } from "@/components/user/FirebaseViewQuotationModal";
import { withFirebaseAuth, useAuth } from "@/components/authGuard/FirebaseAuthGuard";
import { QuotationService, QuotationRequest } from "@/service/firestoreService";

const QuotationRequests: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState(5);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch quotation requests for the current user with real-time updates
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    
    // Set up real-time listener for user's quotation requests
    const unsubscribe = QuotationService.onQuotationRequestsByBuyerChange(
      user.id,
      (requests) => {
        setQuotationRequests(requests);
        setFilteredRequests(requests.slice(0, entries));
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or user change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, entries]);

  // Filter requests based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRequests(quotationRequests.slice(0, entries));
    } else {
      const filtered = quotationRequests.filter(request =>
        request.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered.slice(0, entries));
    }
  }, [searchTerm, quotationRequests, entries]);

  const handleViewRequest = (request: QuotationRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleCreateSuccess = () => {
    // Refresh the list when a new request is created
    if (user?.id) {
      QuotationService.getQuotationRequestsByBuyer(user.id)
        .then(requests => {
          setQuotationRequests(requests);
          setFilteredRequests(requests.slice(0, entries));
        })
        .catch(console.error);
    }
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

  return (
    <TabLayout type="user">
      <div
        className="w-full p-8 bg-[#F8F8F8] rounded-tr-[15px] rounded-br-[15px] rounded-bl-[15px] "
        id="quotationrequests"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[18px] font-bold font-body text-[#111102]">
            Quotation Requests
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-[#F9C301] hover:bg-yellow-500 text-[#111102] px-4 py-2 rounded-[5px] font-[600] text-[12px] transition-colors"
          >
            <Plus size={16} />
            <span>New Request</span>
          </button>
        </div>

        <div className="flex flex-row items-center justify-between mb-4">
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

          <div>
            <div className="font-body font-[500] text-[14px]  text-[#111102] mb-1">
              Search
            </div>
            <div className="relative flex items-center rounded-[5px] text-sm text-gray-600 w-[263px] h-[28px]">
              <input
                type="text"
                placeholder="Search by model, description..."
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
                      Request ID
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Vehicle Model
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Vehicle Type
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Status
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Quotes Received
                    </th>
                    <th className="border border-r-2 border-b-2 border-white py-2">
                      Request Date
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
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        {quotationRequests.length === 0 
                          ? "No quotation requests found. Create your first request!"
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
                          {request.id?.substring(0, 8)}...
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {request.model}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {request.vehicleType}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-[500] ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2 text-center">
                          {request.quotationsReceived || 0}
                        </td>
                        <td className="border border-r-2 border-b-2 border-[#F8F8F8] pl-7 py-2">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="grid grid-cols-1 text-center w-full h-full">
                          <button
                            className="bg-[#D1D1D1] px-3 font-body py-3 hover:bg-yellow-500 active:bg-yellow-500 focus:hover:bg-yellow-500 text-[#111102] text-[12px] w-full h-full transition-colors"
                            onClick={() => handleViewRequest(request)}
                          >
                            View
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

        {/* Pagination */}
        <div className="mt-4 text-[12px] text-[#5B5B5B] font-body">
          Showing {filteredRequests.length > 0 ? 1 : 0}-{filteredRequests.length} of {quotationRequests.length} Entries
        </div>

        {/* Create Quotation Modal */}
        <FirebaseGetQuotationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* View Firebase Quotation Modal */}
        <FirebaseViewQuotationModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          quotationRequest={selectedRequest}
        />
      </div>
    </TabLayout>
  );
};

export default withFirebaseAuth(QuotationRequests, {
  requiredRole: "buyer",
  redirectTo: "/user/login"
});
