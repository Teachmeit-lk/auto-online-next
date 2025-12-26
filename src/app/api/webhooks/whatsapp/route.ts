import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 403 }
  );
}

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const entry = payload?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  const messages = value?.messages;
  const statuses = value?.statuses;

  if (messages?.length) {
    for (const msg of messages) {
      const fromPhone = msg.from;
      const textBody = msg?.text?.body || "";
      const waMessageId = msg.id;

      console.log("Inbound WA message:", { fromPhone, textBody, waMessageId });
    }
  }

  if (statuses?.length) {
    for (const st of statuses) {
      console.log("WA status update:", {
        id: st.id,
        status: st.status,
        recipient: st.recipient_id,
        timestamp: st.timestamp,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
