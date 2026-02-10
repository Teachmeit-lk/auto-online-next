import { NextRequest, NextResponse } from "next/server";
// import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const {
      buyerEmail, // changed from buyerPhone
      buyerName,
      vendorName,
      request,
      quotation,
      attachmentUrl,
    } = await req.json();

    // const to = normalizeSriLankaPhone(buyerPhone);
    const to = buyerEmail;
    if (!to) {
      return NextResponse.json(
        { error: "Invalid buyer email" },
        { status: 400 }
      );
    }

    const msg = buildVendorQuotationEmail({
      buyerName,
      vendorName,
      request,
      quotation,
      attachmentUrl,
    });

    // const waRes = await sendWhatsAppText(to, msg);
    const emailRes = await sendEmail(
      to,
      `New Quotation Received - ${quotation?.itemName || "Part"}`,
      msg
    );

    return NextResponse.json({ ok: true, email: emailRes });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

function buildVendorQuotationEmail({
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
      <p>Dear ${safeBuyer},</p>

      <p>This is ${safeVendor}.</p>

      <p>Regarding your request for <strong>${quotation?.itemName || "-"
      }</strong>, unfortunately this item is <strong>OUT OF STOCK</strong>.</p>

      <p>Please check again later or update your request.</p>

      <p><a href="https://auto-online.lk/user/login">Buyer Login</a></p>
    `.trim();
  }

  return `
    <p>Dear ${safeBuyer},</p>

    <p>This is ${safeVendor}. I am sending you the quotation for your vehicle ${request?.category || ""
    } request.</p>

    <h3>Request Details</h3>
    <ul>
      <li>Vehicle Type - ${request?.vehicleType || "-"}</li>
      <li>Brand/Model - ${request?.brand || ""} ${request?.model || ""}</li>
      <li>Fuel Type - ${request?.fuelType || "-"}</li>
      <li>Manufacturing Year - ${request?.manufacturingYear || "-"}</li>
      <li>Measurement Requested - ${request?.measurement || "-"}</li>
      <li>No. of Units Requested - ${request?.numberOfUnits ?? "-"}</li>
    </ul>

    <h3>Quotation Details</h3>
    <ul>
      <li>Item Name - ${quotation?.itemName || "-"}</li>
      <li>Stock Availability - ${quotation?.stockAvailability || "-"}</li>
      <li>Measurement - ${quotation?.measurement || "-"}</li>
      <li>No. of Units - ${quotation?.noOfUnits ?? "-"}</li>
      <li>Unit Price - Rs. ${Number(quotation?.unitPrice || 0).toFixed(2)}</li>
      <li>Total Price (before VAT) - Rs. ${Number(
      quotation?.totalPrice || 0
    ).toFixed(2)}</li>
      <li>Net Total (incl. VAT) - Rs. ${Number(
      quotation?.netTotalPrice || 0
    ).toFixed(2)}</li>
      <li>Delivery Cost - Rs. ${Number(quotation?.deliveryCost || 0).toFixed(
      2
    )}</li>
      <li>Validity - ${quotation?.validityDays ?? "-"} day(s)</li>
    </ul>

    <h3>Vendor Comments</h3>
    <p>${quotation?.vendorComments || "-"}</p>

    ${attachmentUrl
      ? `<p><a href="${attachmentUrl}">View Attachment</a></p>`
      : ""
    }

    <p><a href="https://auto-online.lk/user/login">Buyer Login</a></p>
  `.trim();
}
