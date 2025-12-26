import { NextRequest, NextResponse } from "next/server";
import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { vendorPhone, vendorName, request, requestId, imageUrls } =
      await req.json();

    if (!vendorPhone) {
      return NextResponse.json(
        { error: "Missing vendorPhone" },
        { status: 400 }
      );
    }

    const to = normalizeSriLankaPhone(vendorPhone);
    if (!to) {
      return NextResponse.json(
        { error: "Invalid vendor phone" },
        { status: 400 }
      );
    }

    const message = `
Dear ${vendorName || "Sir/Madam"},

You have received a new quotation request via AutoOnline.lk.

Request ID: ${requestId || "-"}

Vehicle Information
Vehicle Type - ${request?.vehicleType || "-"}
Vehicle Brand - ${request?.brand || "-"}
Vehicle Model - ${request?.model || "-"}
Manufacturing Year - ${request?.manufacturingYear || "-"}
Fuel Type - ${request?.fuelType || "-"}
Measurement - ${request?.measurement || "-"}
No of Units - ${request?.numberOfUnits ?? "-"}

Customer District - ${request?.district || "-"}

Description
${request?.description || "-"}

${
  Array.isArray(imageUrls) && imageUrls.length
    ? `Attachments:\n${imageUrls.join("\n")}\n`
    : ""
}

To respond, please login to your Vendor Portal and send the quotation there.
Vendor Login Url - https://auto-online.lk/vendor/login
`.trim();

    const waRes = await sendWhatsAppText(to, message);

    return NextResponse.json({ ok: true, wa: waRes });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
