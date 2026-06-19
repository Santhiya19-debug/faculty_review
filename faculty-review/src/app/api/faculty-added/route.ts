import { NextRequest, NextResponse } from "next/server";
import { notifyAndFulfillRequests } from "@/lib/notify-requesters";

// Supabase sends a secret header so we can verify the webhook is real
const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  // Verify webhook secret if configured
  if (WEBHOOK_SECRET) {
    const incomingSecret = req.headers.get("x-webhook-secret");
    if (incomingSecret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json();

    // Supabase webhook sends { type, table, record, old_record }
    const { type, record } = body;

    // Only handle INSERT events on the faculties table
    if (type !== "INSERT" || !record?.id || !record?.name) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Notify requesters and mark requests as fulfilled
    await notifyAndFulfillRequests(record.name, record.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("faculty-added webhook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}