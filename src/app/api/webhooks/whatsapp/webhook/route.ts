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
  try {
    await FirestoreService.create("webhook_logs", {
      at: new Date(),
      kind: "TEST",
      note: "curl hit",
      isActive: true,
    } as any);

    return NextResponse.json({ ok: true, log: "saved" });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      log: "failed",
      error: e?.message || String(e),
    });
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
