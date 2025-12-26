// src/lib/whatsapp.ts
export function normalizeSriLankaPhone(raw: string) {
  let cleaned = (raw || "").replace(/\D/g, "");
  if (!cleaned) return null;

  if (cleaned.startsWith("0")) cleaned = "94" + cleaned.slice(1);

  if (!cleaned.startsWith("94") && cleaned.length === 9) {
    cleaned = "94" + cleaned;
  }

  return cleaned;
}

export async function sendWhatsAppText(to: string, body: string) {
  const token = (process.env.WHATSAPP_TOKEN || "").trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  const version = (process.env.WHATSAPP_API_VERSION || "v20.0").trim();

  if (!token) throw new Error("WHATSAPP_TOKEN is missing/empty");
  if (!phoneNumberId)
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing/empty");

  const res = await fetch(
    `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("WhatsApp API error:", data);
    throw new Error(data?.error?.message || "WhatsApp send failed");
  }

  return data;
}
