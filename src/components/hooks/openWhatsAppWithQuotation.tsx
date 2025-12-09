import { QuotationRequest } from "@/service/firestoreService";
import { useRefactoredIdLast } from "./useRefactoredIdLast";

export const buildWhatsAppQuotationUrl = ({
  vendor,
  vendorPhone,
  data,
  currentUser,
  fileUrl,
}: {
  vendor?: { id: string; name: string } | null;
  vendorPhone?: string | null;
  data: {
    country: string;
    brand: string;
    model: string;
    district: string;
    vehicletype: string;
    manufactoringyear: string;
    fueltype: string;
    measurement: string;
    noofunits: number;
    description: string;
    category: string;
  };
  currentUser: any;
  fileUrl?: string;
}) => {
  if (!vendorPhone) return null;

  let cleaned = vendorPhone.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "94" + cleaned.slice(1);
  }

  const phone = cleaned;

  const customerName = `${currentUser?.firstName || ""} ${
    currentUser?.lastName || ""
  }`.trim();

  const message = `
Dear ${vendor?.name || "Sir/Madam"},

I want to get the complete details of the vehicle ${
    data.category
  } attached in the file.

Please contact me as soon as possible if you have stock of these items.

Customer Information
Customer Name - ${customerName || "N/A"}
Customer Mobile - ${currentUser?.phone || "N/A"}
Customer Whatsapp No - ${currentUser?.phone || "N/A"}

Vehicle Information
Vehicle Type - ${data.vehicletype}
Vehicle Brand - ${data.brand}
Vehicle Model - ${data.model}
Manufacturing year - ${data.manufactoringyear}

Country of Manufacturing - ${data.country}
Fuel Type - ${data.fueltype}
Measurement - ${data.measurement}
No of units - ${data.noofunits}
Customer District - ${data.district}

Description
${data.description}

${
  fileUrl
    ? `${data.category} file URL - ${fileUrl}
(Please open this link to view/download the PDF/image.)`
    : ""
}

Vendor Login Url - https://auto-online.lk/vendor/login
`.trim();

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return url;
};

export const buildVendorQuotationWhatsAppUrl = ({
  buyerPhone,
  buyerName,
  request,
  vendorUser,
  quotation,
  attachmentUrl,
}: {
  buyerPhone?: string | null;
  buyerName?: string | null;
  request?: QuotationRequest | null;
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
}) => {
  if (!buyerPhone) return null;

  const phone = "+94" + buyerPhone.replace(/\D/g, "");
  const vendorName =
    `${vendorUser?.firstName || ""} ${vendorUser?.lastName || ""}`.trim() ||
    vendorUser?.email ||
    "Your vendor";

  const isOutOfStock = quotation.stockAvailability
    ?.toLowerCase()
    .includes("out");

  if (isOutOfStock) {
    const msg = `
Dear ${buyerName || "Customer"},

This is ${vendorName}.

Regarding your request for ${
      quotation.itemName
    }, unfortunately this item is currently *OUT OF STOCK*.

Please check again later or update your request.

Buyer Login Url - https://auto-online.lk/user/login
    `.trim();

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  const message = `
Dear ${buyerName || "Customer"},

This is ${vendorName}. I am sending you the quotation for your vehicle ${
    request?.category
  } request.

Request Details
Vehicle Type - ${request?.vehicleType || "-"}
Brand/Model - ${request?.brand || ""} ${request?.model || ""}
Fuel Type - ${request?.fuelType || "-"}
Manufacturing Year - ${request?.manufacturingYear || "-"}
Measurement Requested - ${request?.measurement || "-"}
No. of Units Requested - ${request?.numberOfUnits ?? "-"}

Quotation Details
Item Name - ${quotation.itemName}
Stock Availability - ${quotation.stockAvailability}
Measurement - ${quotation.measurement}
No. of Units - ${quotation.noOfUnits}
Unit Price - Rs. ${quotation.unitPrice.toFixed(2)}
Total Price (before VAT) - Rs. ${quotation.totalPrice.toFixed(2)}
Net Total (incl. VAT) - Rs. ${quotation.netTotalPrice.toFixed(2)}
Delivery Cost - Rs. ${quotation.deliveryCost.toFixed(2)}
Validity - ${quotation.validityDays} day(s)

Vendor Comments
${quotation.vendorComments}

${
  attachmentUrl
    ? `Attachment URL - ${attachmentUrl}
(Please open this link to view/download the image.)`
    : ""
}

Buyer Login Url - https://auto-online.lk/user/login
  `.trim();

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const buildPurchaseOrderWhatsAppUrl = ({
  vendorPhone,
  vendorName,
  orderNumber,
  items,
  grandTotal,
  currency,
  deliveryMethod,
  paymentMethod,
  specialNotes,
  customer,
  requestImageUrl,
  deliveryCost,
  deliveryAddress,
}: {
  vendorPhone: string;
  vendorName: string;
  orderNumber: string;
  items: {
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  grandTotal: number;
  currency: string;
  deliveryMethod: string;
  paymentMethod: string;
  specialNotes?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  requestImageUrl?: string | null;
  deliveryCost?: number;
  deliveryAddress?: {
    street: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
  } | null;
}) => {
  if (!vendorPhone) return null;

  const phone = "+94" + vendorPhone.replace(/\D/g, "");

  const itemsText = items
    .map(
      (it, i) =>
        `${i + 1}. ${it.itemDescription}
Qty: ${it.quantity}
Unit Price: ${it.unitPrice}
Total: ${it.totalPrice}`
    )
    .join("\n\n");

  const isDeliveryOrder = deliveryMethod === "arrange_delivery";

  const itemsTotal = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);

  const effectiveGrandTotal = isDeliveryOrder ? grandTotal : itemsTotal;

  const deliveryAddressText =
    isDeliveryOrder && deliveryAddress
      ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.district}, ${deliveryAddress.zipCode}, ${deliveryAddress.country}`
      : "";

  const deliveryBlock = isDeliveryOrder
    ? `
    
Delivery:
Method: Arrange delivery through vendor
${
  typeof deliveryCost === "number"
    ? `Cost: ${deliveryCost.toFixed(2)} ${currency}`
    : "Cost: N/A"
}
${deliveryAddressText ? `Address: ${deliveryAddressText}` : ""}`
    : "";

  const msg = `
Purchase Order from AutoOnline.lk

Vendor: ${vendorName}
Order No: ${useRefactoredIdLast("ON", orderNumber)}

Customer Details:
Name: ${customer.name}
Phone: ${customer.phone}

Items:
${itemsText}${deliveryBlock}

Grand Total: ${effectiveGrandTotal.toFixed(2)} ${currency}

Payment Method: ${paymentMethod}
${specialNotes ? `\nSpecial Notes:\n${specialNotes}` : ""}

${requestImageUrl ? `Requested Part Image:\n${requestImageUrl}` : ""}

Vendor Login Url - https://auto-online.lk/vendor/login
`.trim();

  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};

export const buildPurchaseOrderStatusWhatsAppUrl = ({
  customerPhone,
  customerName,
  orderNumber,
  status,
  items,
  totalAmount,
  currency,
  deliveryMethod,
  deliveryCost,
  deliveryAddress,
  rejectionReason,
}: {
  customerPhone: string;
  customerName: string;
  orderNumber: string;
  status: "confirmed" | "in_progress" | "shipped" | "delivered" | "cancelled";
  items: {
    partName?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  currency: string;
  deliveryMethod?: string;
  deliveryCost?: number;
  deliveryAddress?: {
    street: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
  } | null;
  rejectionReason?: string;
}) => {
  if (!customerPhone) return null;

  const phone = "+94" + customerPhone.replace(/\D/g, "");

  const itemsText = (items || [])
    .map((it, i) => {
      const name = it.partName || it.description || `Item ${i + 1}`;
      return `${i + 1}. ${name}
Qty: ${it.quantity}
Unit: ${it.unitPrice.toFixed(2)} ${currency}
Total: ${it.totalPrice.toFixed(2)} ${currency}`;
    })
    .join("\n\n");

  const deliveryAddressText = deliveryAddress
    ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.district}, ${deliveryAddress.zipCode}, ${deliveryAddress.country}`
    : "";

  let statusLine = "";
  switch (status) {
    case "confirmed":
      statusLine = "Your order has been *CONFIRMED*.";
      break;
    case "in_progress":
      statusLine = "Your order is now *BEING PREPARED*.";
      break;
    case "shipped":
      statusLine = "Your order has been *DISPATCHED*.";
      break;
    case "delivered":
      statusLine = "Your order has been marked as *DELIVERED*.";
      break;
    case "cancelled":
      statusLine = "Your order has been *REJECTED*.";
      break;
  }

  if (status === "cancelled") {
    const msg = `
Hi ${customerName},

${statusLine}

Order No: ${useRefactoredIdLast("ON", orderNumber)}
${rejectionReason ? `\nReason for rejection:\n${rejectionReason}\n` : ""}

Buyer Login Url - https://auto-online.lk/user/login

Thank you for using AutoOnline.lk
    `.trim();

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  const isDeliveryOrder = deliveryMethod === "arrange_delivery";

  let effectiveTotal = totalAmount;
  if (
    !isDeliveryOrder &&
    typeof deliveryCost === "number" &&
    deliveryCost > 0
  ) {
    effectiveTotal = totalAmount - deliveryCost;
  }

  const deliveryBlock = isDeliveryOrder
    ? `
Delivery:
Method: ${deliveryMethod || "As discussed"}
${
  typeof deliveryCost === "number"
    ? `Cost: ${deliveryCost.toFixed(2)} ${currency}`
    : ""
}
${deliveryAddressText ? `Address: ${deliveryAddressText}` : ""}`
    : "";

  const msg = `
Hi ${customerName},

${statusLine}

Order No: ${useRefactoredIdLast("ON", orderNumber)}

Order Summary:
${itemsText || "Items as per quotation."}
${deliveryBlock}

Total Payable: ${effectiveTotal.toFixed(2)} ${currency}

Buyer Login Url - https://auto-online.lk/user/login

Thank you for using AutoOnline.lk
  `.trim();

  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};
