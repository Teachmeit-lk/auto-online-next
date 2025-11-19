"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface IViewCompletedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any | null;
}

export const ViewCompletedOrderModal: React.FC<
  IViewCompletedOrderModalProps
> = ({ isOpen, onClose, order }) => {

  const [fullOrder, setFullOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (isOpen && order) {
    if (order.purchaseOrderId) {
      console.log("Fetching as USER order");
      fetchOrderDetails(order.purchaseOrderId);
    }
    else if (order.quotationId) {
      console.log("Fetching as VENDOR order via quotationId");
      fetchVendorOrderDetails(order.quotationId);
    }
    else if (order.id) {
      console.log("Fetching as VENDOR order via id");
      fetchOrderDetails(order.id);
    }
  }
}, [isOpen, order]);

  const fetchOrderDetails = async (poId: string) => {
  setLoading(true);
  try {
    const { FirestoreService, COLLECTIONS } = await import("@/service/firestoreService");
    
    // Fetch the purchase order
    const poData = await FirestoreService.getById(COLLECTIONS.PURCHASE_ORDERS, poId);
    console.log("Fetched PO Data:", poData);
    console.log("Buyer ID from PO:", poData?.buyerId);
 
    if (poData?.buyerId) {
      try {
        const buyerData = await FirestoreService.getById(COLLECTIONS.USERS, poData.buyerId);
        console.log("Fetched Buyer Data:", buyerData);
        console.log("Buyer Phone:", buyerData?.phoneNumber);
        console.log("Buyer Contact:", buyerData?.contactNumber);
        console.log("Buyer Phone (alt):", buyerData?.phone);
        
        poData.buyerContactNumber = 
          buyerData?.phoneNumber || 
          buyerData?.contactNumber || 
          buyerData?.phone ||
          buyerData?.mobile ||
          buyerData?.mobileNumber ||
          null;
          
        console.log("Final buyerContactNumber:", poData.buyerContactNumber);
        
        poData.buyerName = buyerData?.firstName && buyerData?.lastName 
          ? `${buyerData.firstName} ${buyerData.lastName}`
          : buyerData?.name || buyerData?.email;
      } catch (error) {
        console.error("Error fetching buyer details:", error);
      }
    } else {
      console.warn("No buyerId found in order data");
    }

    if (poData?.quotationId) {
      try {
        const quotationData = await FirestoreService.getById(COLLECTIONS.QUOTATIONS, poData.quotationId);
        console.log("Fetched Quotation Data:", quotationData);

        if (quotationData?.products && Array.isArray(quotationData.products)) {
          poData.products = quotationData.products;
        }

        if (quotationData?.products?.[0]?.description) {
          poData.description = quotationData.products[0].description;
        }
      } catch (error) {
        console.error("Error fetching quotation details:", error);
      }
    }
    
    setFullOrder(poData);
  } catch (error) {
    console.error("Error fetching order details:", error);
  } finally {
    setLoading(false);
  }
};

const fetchVendorOrderDetails = async (quotationId: string) => {
  setLoading(true);
  try {
    const { FirestoreService, COLLECTIONS } = await import("@/service/firestoreService");
    
    console.log("Fetching quotation for vendor:", quotationId);
    
    const quotationData = await FirestoreService.getById(COLLECTIONS.QUOTATIONS, quotationId);
    console.log("Fetched Quotation Data (VENDOR):", quotationData);

    const transformedData = {
      ...order,
      products: quotationData?.products,
      description: quotationData?.products?.[0]?.description || quotationData?.notes || quotationData?.terms,
      quotationId: quotationId,
    };

    if (order?.purchaseOrderId) {
      try {
        const poData = await FirestoreService.getById(COLLECTIONS.PURCHASE_ORDERS, order.purchaseOrderId);
        console.log("Fetched PO Data (VENDOR):", poData);

        Object.assign(transformedData, {
          buyerId: poData.buyerId,
          vendorId: poData.vendorId,
          totalAmount: poData.totalAmount,
          completedDate: poData.completedDate,
        });
        
        // Fetch buyer details
        if (poData?.buyerId) {
          const buyerData = await FirestoreService.getById(COLLECTIONS.USERS, poData.buyerId);
          transformedData.buyerContactNumber = 
            buyerData?.phoneNumber || 
            buyerData?.contactNumber || 
            buyerData?.phone ||
            null;
        }
      } catch (error) {
        console.error("Error fetching PO for vendor:", error);
      }
    }
    
    setFullOrder(transformedData);
  } catch (error) {
    console.error("Error fetching vendor order details:", error);
  } finally {
    setLoading(false);
  }
};

  // Use fullOrder if available, otherwise use order prop
  const orderData = fullOrder || order;

    // Order Number
    const orderNo =
      orderData?.orderNumber || orderData?.purchaseOrderId || orderData?.id || "-";
    
    // Vendor Code
    const vendorCode = orderData?.vendorId || orderData?.vendorCode || "-";
    
    // Try multiple possible data structures
    const productsList = orderData?.products || orderData?.items || orderData?.orderItems || [];
    
    // Part Name
    const partName = 
      productsList[0]?.partName || 
      productsList[0]?.itemName ||
      productsList[0]?.name ||
      orderData?.partName ||
      "-";
    
    // Item Count
    const itemCount = Array.isArray(productsList) && productsList.length > 0 
      ? productsList.length 
      : orderData?.itemCount || 0;
    
    // Total Amount
    const totalAmount =
      orderData?.totalAmount != null ? String(orderData.totalAmount) : "-";
    
    // Net Total
    const netTotal = 
      orderData?.netTotal != null ? String(orderData.netTotal) : 
      orderData?.totalAmount != null ? String(orderData.totalAmount) : 
      "-";
    
    // Completed Date
    const ts =
      orderData?.completedDate ||
      orderData?.deliveredDate ||
      orderData?.deliveryDate ||
      orderData?.updatedAt ||
      orderData?.createdAt;
    const completedDate = ts?.seconds
      ? new Date(ts.seconds * 1000).toLocaleDateString()
      : ts instanceof Date
      ? ts.toLocaleDateString()
      : typeof ts === 'string'
      ? new Date(ts).toLocaleDateString()
      : "-";
    
    // Contact Number
    const contactNumber = 
      orderData?.buyerContactNumber || 
      orderData?.contactNumber ||
      orderData?.phoneNumber ||
      orderData?.buyerPhone ||
      "-";
    
  const description = (() => {
    let desc = "";

    if (productsList[0]?.description) {
      desc = productsList[0].description;
    }

    else if (orderData?.description) {
      desc = orderData.description;
    }

    else if (orderData?.terms) {
      desc = orderData.terms;
    }

    else if (orderData?.notes) {
      desc = orderData.notes;
    }

    else if (orderData?.orderNotes) {
      desc = orderData.orderNotes;
    }

    return desc || "-";
  })();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-none" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[700px] sm:w-[600px] w-full bg-white py-8 px-7 rounded-[10px] shadow-lg focus:outline-none">
          <Dialog.Title className="text-[15px] font-bold mb-5 text-[#111102] font-body text-left">
            Completed Order
          </Dialog.Title>
          {loading ? (
            <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 flex items-center justify-center h-[400px]">
              <p className="text-[12px] text-[#5B5B5B]">Loading order details...</p>
            </div>
          ) : (
          <div className="bg-[#F8F8F8] rounded-[8px] sm:p-8 p-4 space-y-6">
            <div className="flex justify-center"></div>

            <form className="sm:grid sm:grid-cols-3 gap-y-4 gap-x-6 sm:space-y-0 space-y-2 sm:h-full h-[500px] overflow-y-auto">
              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Order No
                </label>
                <input
                  type="text"
                  value={orderNo}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Vendor Code
                </label>
                <input
                  type="text"
                  value={vendorCode}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Part Name
                </label>
                <input
                  type="text"
                  value={partName}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Completed Date
                </label>
                <input
                  type="text"
                  value={completedDate}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Item Count
                </label>
                <input
                  type="text"
                  value={String(itemCount)}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Total Price (Rs.)
                </label>
                <input
                  type="text"
                  value={totalAmount}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div>
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Net Total Price (Rs.)
                </label>
                <input
                  type="text"
                  value={netTotal}
                  readOnly
                  className="w-full h-[36px] placeholder:text-[#111102] text-[#111102] font-body text-[10px] mt-1 px-3 bg-[#FEFEFE] rounded-[3px] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>

              <div className="col-span-3">
                <label className="text-[12px] font-body font-[500] text-[#111102]">
                  Description
                </label>
                <textarea
                  rows={3}
                  readOnly
                  value={description}
                  placeholder="-"
                  className="w-full placeholder:text-[#111102] h-[80px] mt-1 p-3 text-[10px] text-body bg-[#FEFEFE] rounded-[3px] text-[#111102] focus:outline-none focus:ring-2 focus:ring-[#F9C301]"
                />
              </div>
            </form>
          </div>
          )}

          <Dialog.Close asChild>
            <button
              onClick={onClose}
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
