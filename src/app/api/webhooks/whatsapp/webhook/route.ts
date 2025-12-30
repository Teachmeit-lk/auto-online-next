import { NextRequest, NextResponse } from "next/server";
import { FirestoreService, COLLECTIONS } from "@/service/firestoreService";
import { sendWhatsAppText } from "@/lib/whatsapp";

function normalizeSriLankaPhone(raw?: string): string | null {
  if (!raw) return null;

  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("94") && digits.length === 11) return digits;
  if (digits.startsWith("0") && digits.length === 10)
    return "94" + digits.slice(1);
  if (digits.length === 9) return "94" + digits;

  return null;
}

function extractRefCode(text?: string): string | null {
  if (!text) return null;

  const cleaned = text.toUpperCase().replace(/\s+/g, "");
  const match = cleaned.match(/\b(RC|ON)-?[A-Z0-9]+\b/);

  if (!match) return null;

  const raw = match[0];
  return raw.includes("-") ? raw : raw.slice(0, 2) + "-" + raw.slice(2);
}

function toMillis(t: any): number {
  if (t?.seconds) return t.seconds * 1000 + (t.nanoseconds || 0) / 1e6;

  if (t instanceof Date) return t.getTime();

  const d = new Date(t);
  if (!isNaN(d.getTime())) return d.getTime();
  return 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge || "", { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  let body: any = null;

  try {
    body = await req.json();

    await FirestoreService.create("webhook_logs", {
      at: new Date(),
      kind: "RAW",
      keys: Object.keys(body || {}),
      body,
      isActive: true,
    } as any);

    const value = body?.entry?.[0]?.changes?.[0]?.value;

    const status = value?.statuses?.[0];
    if (status) {
      await FirestoreService.create("webhook_logs", {
        at: new Date(),
        kind: "STATUS",
        status,
        isActive: true,
      } as any);

      return NextResponse.json({ ok: true, kind: "STATUS" });
    }

    const msg = value?.messages?.[0];
    if (!msg) {
      await FirestoreService.create("webhook_logs", {
        at: new Date(),
        kind: "NO_MESSAGE",
        note: "No messages[] or statuses[] found",
        isActive: true,
      } as any);

      return NextResponse.json({ ok: true, kind: "NO_MESSAGE" });
    }

    const fromPhone = normalizeSriLankaPhone(msg.from);
    if (!fromPhone) {
      await FirestoreService.create("webhook_logs", {
        at: new Date(),
        kind: "BAD_PHONE",
        from: msg.from,
        isActive: true,
      } as any);

      return NextResponse.json({ ok: true, kind: "BAD_PHONE" });
    }

    const text = msg.type === "text" ? msg.text?.body || "" : `[${msg.type}]`;
    const refCode = extractRefCode(text);

    const chatRoom = await findChatRoom(fromPhone, refCode);

    if (!chatRoom) {
      await FirestoreService.create("webhook_logs", {
        at: new Date(),
        kind: "NO_CHATROOM",
        fromPhone,
        text,
        refCode: refCode || null,
        isActive: true,
      } as any);

      await sendWhatsAppText(
        fromPhone,
        `Hi\nPlease reply with your Request Code (RC-XXXX) or Order No (ON-XXXX) so we can connect you to the correct vendor.`
      );

      return NextResponse.json({ ok: true, kind: "NO_CHATROOM" });
    }

    const isBuyer = chatRoom.buyerPhone === fromPhone;
    const targetPhone = isBuyer ? chatRoom.vendorPhone : chatRoom.buyerPhone;

    const prefix = isBuyer
      ? `Buyer (${chatRoom.refCode})`
      : `Vendor (${chatRoom.refCode})`;

    await sendWhatsAppText(
      targetPhone,
      `FORWARDED MESSAGE\n${prefix}:\n${text}`
    );

    await FirestoreService.create(COLLECTIONS.CHAT_MESSAGES, {
      chatRoomId: chatRoom.id,
      from: fromPhone,
      to: targetPhone,
      role: isBuyer ? "buyer" : "vendor",
      message: text,
      isActive: true,
    } as any);

    await FirestoreService.update(COLLECTIONS.CHAT_ROOMS, chatRoom.id!, {
      lastInboundFrom: isBuyer ? "buyer" : "vendor",
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await FirestoreService.create("webhook_logs", {
      at: new Date(),
      kind: "FORWARDED",
      fromPhone,
      targetPhone,
      refCode: chatRoom.refCode,
      text,
      chatRoomId: chatRoom.id,
      isActive: true,
    } as any);

    return NextResponse.json({
      ok: true,
      kind: "FORWARDED",
      fromPhone,
      targetPhone,
      refCode: chatRoom.refCode,
    });
  } catch (err: any) {
    console.error("[WHATSAPP_WEBHOOK_ERROR]", err);

    try {
      await FirestoreService.create("webhook_logs", {
        at: new Date(),
        kind: "ERROR",
        message: err?.message || String(err),
        body: body || null,
        isActive: true,
      } as any);
    } catch {}

    return NextResponse.json({ ok: false, kind: "ERROR" }, { status: 200 });
  }
}

async function findChatRoom(senderPhone: string, refCode?: string | null) {
  if (refCode) {
    const byRef = await FirestoreService.getAll<any>(COLLECTIONS.CHAT_ROOMS, [
      { field: "refCode", operator: "==", value: refCode },
      { field: "status", operator: "==", value: "open" },
    ]);

    const hit = byRef.find(
      (c) => c.buyerPhone === senderPhone || c.vendorPhone === senderPhone
    );
    if (hit) return hit;
  }

  const asBuyer = await FirestoreService.getAll<any>(COLLECTIONS.CHAT_ROOMS, [
    { field: "buyerPhone", operator: "==", value: senderPhone },
    { field: "status", operator: "==", value: "open" },
  ]);

  const asVendor = await FirestoreService.getAll<any>(COLLECTIONS.CHAT_ROOMS, [
    { field: "vendorPhone", operator: "==", value: senderPhone },
    { field: "status", operator: "==", value: "open" },
  ]);

  const merged = [...asBuyer, ...asVendor];
  merged.sort((a, b) => toMillis(b.lastMessageAt) - toMillis(a.lastMessageAt));

  return merged[0] || null;
}
