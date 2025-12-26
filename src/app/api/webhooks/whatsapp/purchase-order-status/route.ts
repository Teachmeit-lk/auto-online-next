import { NextRequest, NextResponse } from "next/server";
import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";
import { refactoredIdLast } from "@/lib/refIds";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const to = normalizeSriLankaPhone(payload.customerPhone);
    if (!to) {
      return NextResponse.json(
        { error: "Invalid customer phone" },
        { status: 400 }
      );
    }

    const msg = buildPurchaseOrderStatusMessage(payload);

    const wa = await sendWhatsAppText(to, msg);
    return NextResponse.json({ ok: true, wa });
  } catch (e: any) {
    console.error("[PO_STATUS_WHATSAPP] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to send WhatsApp" },
      { status: 500 }
    );
  }
}

function buildPurchaseOrderStatusMessage({
  customerName,
  orderNumber,
  status,
  items,
  totalAmount,
  netTotal,
  currency,
  deliveryMethod,
  deliveryCost,
  deliveryAddress,
  rejectionReason,
}: any) {
  const itemsText = (items || [])
    .map((it: any, i: number) => {
      const name = it.partName || it.description || `Item ${i + 1}`;
      return `${i + 1}. ${name}
Qty: ${it.quantity}
Unit: ${Number(it.unitPrice || 0).toFixed(2)} ${currency}
Total (before VAT): ${Number(it.totalPrice || 0).toFixed(2)} ${currency}`;
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

  const isDeliveryOrder = deliveryMethod === "arrange_delivery";

  const deliveryBlock = isDeliveryOrder
    ? `
Delivery:
Method: Arrange delivery through vendor
${
  typeof deliveryCost === "number"
    ? `Cost: ${deliveryCost.toFixed(2)} ${currency}`
    : ""
}
${deliveryAddressText ? `Address: ${deliveryAddressText}` : ""}`
    : "";

  if (status === "cancelled") {
    return `
Hi ${customerName},

${statusLine}

Order No: ${refactoredIdLast("ON", orderNumber)}
${rejectionReason ? `\nReason:\n${rejectionReason}\n` : ""}

Buyer Login Url - https://auto-online.lk/user/login

Thank you for using AutoOnline.lk
`.trim();
  }

  const payable = typeof totalAmount === "number" ? totalAmount : 0;

  return `
Hi ${customerName},

${statusLine}

Order No: ${refactoredIdLast("ON", orderNumber)}

Order Summary:
${itemsText || "Items as per quotation."}
${deliveryBlock}

Net Total: ${
    typeof netTotal === "number" ? netTotal.toFixed(2) : "N/A"
  } ${currency}
Total Payable: ${payable.toFixed(2)} ${currency}

Buyer Login Url - https://auto-online.lk/user/login

Thank you for using AutoOnline.lk
`.trim();
}
