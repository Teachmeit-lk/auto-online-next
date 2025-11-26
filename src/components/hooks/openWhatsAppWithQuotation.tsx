import { QuotationRequest } from "@/service/firestoreService";

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

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return url;
};
