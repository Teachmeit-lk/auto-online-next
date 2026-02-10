import { NextRequest, NextResponse } from "next/server";
// import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { vendorEmail, vendorName, request, requestId, imageUrls } =
      await req.json();

    // if (!vendorPhone) {
    //   return NextResponse.json(
    //     { error: "Missing vendorPhone" },
    //     { status: 400 }
    //   );
    // }

    // const to = normalizeSriLankaPhone(vendorPhone);
    const to = vendorEmail;
    if (!to) {
      return NextResponse.json(
        { error: "Invalid vendor email" },
        { status: 400 }
      );
    }

    const message = buildQuotationRequestEmail({
      vendorName,
      request,
      requestId,
      imageUrls,
    });

    // const waRes = await sendWhatsAppText(to, message);
    const emailRes = await sendEmail(
      to,
      `New Quotation Request - ${request?.vehicleType || "Vehicle"}`,
      message
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

function buildQuotationRequestEmail({
  vendorName,
  request,
  requestId,
  imageUrls,
}: any) {
  return `
    <p>Dear ${vendorName || "Sir/Madam"},</p>

    <p>You have received a new quotation request via AutoOnline.lk.</p>

    <p>Request ID: <strong>${requestId || "-"}</strong></p>

    <h3>Vehicle Information</h3>
    <ul>
      <li>Vehicle Type - ${request?.vehicleType || "-"}</li>
      <li>Vehicle Brand - ${request?.brand || "-"}</li>
      <li>Vehicle Model - ${request?.model || "-"}</li>
      <li>Manufacturing Year - ${request?.manufacturingYear || "-"}</li>
      <li>Fuel Type - ${request?.fuelType || "-"}</li>
      <li>Measurement - ${request?.measurement || "-"}</li>
      <li>No of Units - ${request?.numberOfUnits ?? "-"}</li>
    </ul>

    <p>Customer District - ${request?.district || "-"}</p>

    <h3>Description</h3>
    <p>${request?.description || "-"}</p>

    ${Array.isArray(imageUrls) && imageUrls.length
      ? `<h3>Attachments:</h3><ul>${imageUrls
        .map((url: string) => `<li><a href="${url}">View Attachment</a></li>`)
        .join("")}</ul>`
      : ""
    }

    <p>To respond, please login to your Vendor Portal and send the quotation there.</p>
    <p><a href="https://auto-online.lk/vendor/login">Vendor Login</a></p>
  `.trim();
}
