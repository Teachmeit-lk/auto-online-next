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
`.trim();

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  return url;
};
