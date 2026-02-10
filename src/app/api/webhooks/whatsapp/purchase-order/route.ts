import { NextRequest, NextResponse } from "next/server";
// import { normalizeSriLankaPhone, sendWhatsAppText } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { refactoredIdLast } from "@/lib/refIds";

export async function POST(req: NextRequest) {
  try {
    const {
      vendorEmail, // changed from vendorPhone
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

    // const to = normalizeSriLankaPhone(vendorPhone);
    const to = vendorEmail;
    if (!to) {
      return NextResponse.json(
        { error: "Invalid vendor email" },
        { status: 400 }
      );
    }

    const msg = buildPurchaseOrderEmail({
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

    // const wa = await sendWhatsAppText(to, msg);
    const emailRes = await sendEmail(to, `New Purchase Order - ${orderNumber}`, msg);

    return NextResponse.json({ ok: true, email: emailRes });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Failed to send Email" },
      { status: 500 }
    );
  }
}

function buildPurchaseOrderEmail({
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
  const itemsHtml = items
    .map(
      (it: any, i: number) =>
        `<li>
          <strong>${i + 1}. ${it.itemDescription}</strong><br/>
          Qty: ${it.quantity}<br/>
          Unit Price: ${it.unitPrice} ${currency}<br/>
          Total (before VAT): ${it.totalPrice} ${currency}
        </li>`
    )
    .join("");

  const deliveryBlock =
    deliveryMethod === "arrange_delivery"
      ? `
      <h3>Delivery:</h3>
      <p>Method: Arrange delivery through vendor</p>
      <p>Cost: ${deliveryCost?.toFixed(2) ?? "N/A"} ${currency}</p>
      <p>Address: ${deliveryAddress
        ? `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.district}`
        : "N/A"
      }</p>`
      : `
      <h3>Delivery:</h3>
      <p>Method: Collect from shop</p>`;

  return `
    <h1>Purchase Order – AutoOnline.lk</h1>
    <p>Vendor: ${vendorName}</p>
    <p>Order No: <strong>${refactoredIdLast("ON", orderNumber)}</strong></p>

    <h3>Customer Details</h3>
    <p>Name: ${customer.name}</p>
    <p>Phone: ${customer.phone}</p>

    <h3>Items</h3>
    <ul>${itemsHtml}</ul>

    ${deliveryBlock}

    <h3>Totals</h3>
    <p>Net Total: ${netTotal?.toFixed(2)} ${currency}</p>
    <p>Grand Total: ${grandTotal.toFixed(2)} ${currency}</p>

    <p>Payment Method: ${paymentMethod}</p>

    ${specialNotes ? `<h3>Special Notes:</h3><p>${specialNotes}</p>` : ""}

    ${requestImageUrl
      ? `<h3>Requested Part Image:</h3><img src="${requestImageUrl}" alt="Requested Part" style="max-width: 300px;"/>`
      : ""
    }

    <p><a href="https://auto-online.lk/vendor/login">Vendor Login</a></p>
  `.trim();
}
