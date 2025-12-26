import { NextRequest, NextResponse } from "next/server";
import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const {
      buyerPhone,
      buyerName,
      vendorName,
      request,
      quotation,
      attachmentUrl,
    } = await req.json();

    const to = normalizeSriLankaPhone(buyerPhone);
    if (!to) {
      return NextResponse.json(
        { error: "Invalid buyer phone" },
        { status: 400 }
      );
    }

    const msg = buildVendorQuotationMessage({
      buyerName,
      vendorName,
      request,
      quotation,
      attachmentUrl,
    });

    const waRes = await sendWhatsAppText(to, msg);

    return NextResponse.json({ ok: true, wa: waRes });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

function buildVendorQuotationMessage({
  buyerName,
  vendorName,
  request,
  quotation,
  attachmentUrl,
}: any) {
  const safeBuyer = buyerName || "Customer";
  const safeVendor = vendorName || "Vendor";

  const isOutOfStock = String(quotation?.stockAvailability || "")
    .toLowerCase()
    .includes("out");

  if (isOutOfStock) {
    return `
Dear ${safeBuyer},

This is ${safeVendor}.

Regarding your request for ${
      quotation?.itemName || "-"
    }, unfortunately this item is *OUT OF STOCK*.

Please check again later or update your request.

Buyer Login Url - https://auto-online.lk/user/login
`.trim();
  }

  return `
Dear ${safeBuyer},

This is ${safeVendor}. I am sending you the quotation for your vehicle ${
    request?.category || ""
  } request.

Request Details
Vehicle Type - ${request?.vehicleType || "-"}
Brand/Model - ${request?.brand || ""} ${request?.model || ""}
Fuel Type - ${request?.fuelType || "-"}
Manufacturing Year - ${request?.manufacturingYear || "-"}
Measurement Requested - ${request?.measurement || "-"}
No. of Units Requested - ${request?.numberOfUnits ?? "-"}

Quotation Details
Item Name - ${quotation?.itemName || "-"}
Stock Availability - ${quotation?.stockAvailability || "-"}
Measurement - ${quotation?.measurement || "-"}
No. of Units - ${quotation?.noOfUnits ?? "-"}
Unit Price - Rs. ${Number(quotation?.unitPrice || 0).toFixed(2)}
Total Price (before VAT) - Rs. ${Number(quotation?.totalPrice || 0).toFixed(2)}
Net Total (incl. VAT) - Rs. ${Number(quotation?.netTotalPrice || 0).toFixed(2)}
Delivery Cost - Rs. ${Number(quotation?.deliveryCost || 0).toFixed(2)}
Validity - ${quotation?.validityDays ?? "-"} day(s)

Vendor Comments
${quotation?.vendorComments || "-"}

${attachmentUrl ? `Attachment URL - ${attachmentUrl}` : ""}

Buyer Login Url - https://auto-online.lk/user/login
`.trim();
}
