import { NextRequest } from "next/server";
import { makeResidentPDF } from "@/lib/report/resident-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("data");
    if (!raw) {
      return new Response(JSON.stringify({ ok: false, error: "Missing ?data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

  type ResidentReportPayload = { input?: unknown; result?: unknown };
  let payload: ResidentReportPayload;
    try {
  payload = JSON.parse(raw) as ResidentReportPayload;
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { input, result } = payload || {};
    const bytes = await makeResidentPDF(input, result); // Uint8Array

    // *** KLUCZ: użyjemy Blob z Uint8Array (zgodne z BodyInit) ***
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes as ArrayBuffer);
    const compatibleU8 = new Uint8Array(u8);
    const blob = new Blob([compatibleU8], { type: "application/pdf" });

    return new Response(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=raport-mieszkancy.pdf",
        "Cache-Control": "no-store"
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
