import { NextRequest } from "next/server";
import { makeResidentLetterPDF } from "@/lib/report/resident-letter-pdf";

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

    type Payload = { input?: unknown; result?: unknown };
    let payload: Payload;
    try {
      payload = JSON.parse(raw) as Payload;
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { input, result } = payload || {};
    const bytes = await makeResidentLetterPDF(input, result);

    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes as ArrayBuffer);
    const compatibleU8 = new Uint8Array(u8);
    const blob = new Blob([compatibleU8], { type: "application/pdf" });

    return new Response(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=pismo-do-zarzadcy.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
