import { NextRequest, NextResponse } from "next/server";
// import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { refactoredIdLast } from "@/lib/refIds";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // const to = normalizeSriLankaPhone(payload.customerPhone);
    const to = payload.customerEmail;
    if (!to) {
      return NextResponse.json(
        { error: "Invalid customer email" },
        { status: 400 }
      );
    }

    const msg = buildPurchaseOrderStatusEmail(payload);

    // const wa = await sendWhatsAppText(to, msg);
    const emailRes = await sendEmail(
      to,
      `Order Status Update - ${payload.status?.toUpperCase()}`,
      msg
    );
    return NextResponse.json({ ok: true, email: emailRes });
  } catch (e: any) {
    console.error("[PO_STATUS_EMAIL] Error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to send Email" },
      { status: 500 }
    );
  }
}

function buildPurchaseOrderStatusEmail({
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
  const itemsHtml = (items || [])
    .map((it: any, i: number) => {
      const name = it.partName || it.description || `Item ${i + 1}`;
      return `<li>
          <strong>${i + 1}. ${name}</strong><br/>
          Qty: ${it.quantity}<br/>
          Unit: ${Number(it.unitPrice || 0).toFixed(2)} ${currency}<br/>
          Total (before VAT): ${Number(it.totalPrice || 0).toFixed(
        2
      )} ${currency}
        </li>`;
    })
    .join("");

  const deliveryAddressText = deliveryAddress
    ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.district}, ${deliveryAddress.zipCode}, ${deliveryAddress.country}`
    : "";

  let statusLine = "";
  switch (status) {
    case "confirmed":
      statusLine = "Your order has been <strong>CONFIRMED</strong>.";
      break;
    case "in_progress":
      statusLine = "Your order is now <strong>BEING PREPARED</strong>.";
      break;
    case "shipped":
      statusLine = "Your order has been <strong>DISPATCHED</strong>.";
      break;
    case "delivered":
      statusLine = "Your order has been marked as <strong>DELIVERED</strong>.";
      break;
    case "cancelled":
      statusLine = "Your order has been <strong>REJECTED</strong>.";
      break;
  }

  const isDeliveryOrder = deliveryMethod === "arrange_delivery";

  const deliveryBlock = isDeliveryOrder
    ? `
      <h3>Delivery:</h3>
      <p>Method: Arrange delivery through vendor</p>
      ${typeof deliveryCost === "number"
      ? `<p>Cost: ${deliveryCost.toFixed(2)} ${currency}</p>`
      : ""
    }
      ${deliveryAddressText ? `<p>Address: ${deliveryAddressText}</p>` : ""}`
    : "";

  if (status === "cancelled") {
    return `
      <p>Hi ${customerName},</p>

      <p>${statusLine}</p>

      <p>Order No: <strong>${refactoredIdLast("ON", orderNumber)}</strong></p>
      ${rejectionReason
        ? `<p>Reason:<br/>${rejectionReason}</p>`
        : ""
      }

      <p><a href="https://auto-online.lk/user/login">Buyer Login</a></p>

      <p>Thank you for using AutoOnline.lk</p>
    `.trim();
  }

  const payable = typeof totalAmount === "number" ? totalAmount : 0;

  return `
    <p>Hi ${customerName},</p>

    <p>${statusLine}</p>

    <p>Order No: <strong>${refactoredIdLast("ON", orderNumber)}</strong></p>

    <h3>Order Summary:</h3>
    <ul>${itemsHtml || "<li>Items as per quotation.</li>"}</ul>
    ${deliveryBlock}

    <h3>Totals</h3>
    <p>Net Total: ${typeof netTotal === "number" ? netTotal.toFixed(2) : "N/A"
    } ${currency}</p>
    <p>Total Payable: ${payable.toFixed(2)} ${currency}</p>

    <p><a href="https://auto-online.lk/user/login">Buyer Login</a></p>

    <p>Thank you for using AutoOnline.lk</p>
  `.trim();
}
