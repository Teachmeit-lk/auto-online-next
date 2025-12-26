import { NextRequest, NextResponse } from "next/server";
import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";
import { refactoredIdLast } from "@/lib/refIds";

export async function POST(req: NextRequest) {
  try {
    const {
      vendorPhone,
      vendorName,
      orderNumber,
      items,
      grandTotal,
      netTotal,
      currency,
      deliveryMethod,
      paymentMethod,
      specialNotes,
      customer,
      requestImageUrl,
      deliveryCost,
      deliveryAddress,
    } = await req.json();

    const to = normalizeSriLankaPhone(vendorPhone);
    if (!to) {
      return NextResponse.json(
        { error: "Invalid vendor phone" },
        { status: 400 }
      );
    }

    const msg = buildPurchaseOrderMessage({
      vendorName,
      orderNumber,
      items,
      grandTotal,
      netTotal,
      currency,
      deliveryMethod,
      paymentMethod,
      specialNotes,
      customer,
      requestImageUrl,
      deliveryCost,
      deliveryAddress,
    });

    const wa = await sendWhatsAppText(to, msg);

    return NextResponse.json({ ok: true, wa });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Failed to send WhatsApp" },
      { status: 500 }
    );
  }
}

function buildPurchaseOrderMessage({
  vendorName,
  orderNumber,
  items,
  grandTotal,
  netTotal,
  currency,
  deliveryMethod,
  paymentMethod,
  specialNotes,
  customer,
  requestImageUrl,
  deliveryCost,
  deliveryAddress,
}: any) {
  const itemsText = items
    .map(
      (it: any, i: number) =>
        `${i + 1}. ${it.itemDescription}
Qty: ${it.quantity}
Unit Price: ${it.unitPrice} ${currency}
Total (before VAT): ${it.totalPrice} ${currency}`
    )
    .join("\n\n");

  const deliveryBlock =
    deliveryMethod === "arrange_delivery"
      ? `
Delivery:
Method: Arrange delivery through vendor
Cost: ${deliveryCost?.toFixed(2) ?? "N/A"} ${currency}
Address: ${
          deliveryAddress
            ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.district}`
            : "N/A"
        }`
      : `
Delivery:
Method: Collect from shop`;

  return `
*Purchase Order – AutoOnline.lk*

Vendor: ${vendorName}
Order No: ${refactoredIdLast("ON", orderNumber)}

Customer Details
Name: ${customer.name}
Phone: ${customer.phone}

Items
${itemsText}

${deliveryBlock}

Totals
Net Total: ${netTotal?.toFixed(2)} ${currency}
Grand Total: ${grandTotal.toFixed(2)} ${currency}

Payment Method: ${paymentMethod}

${specialNotes ? `Special Notes:\n${specialNotes}` : ""}

${requestImageUrl ? `Requested Part Image:\n${requestImageUrl}` : ""}

Vendor Login:
https://auto-online.lk/vendor/login
`.trim();
}
