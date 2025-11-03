import { NextRequest } from "next/server";
import { makeResidentBillPDF } from "@/lib/report/resident-bill-pdf";

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
    const bytes = await makeResidentBillPDF(input, result);

    return new Response(Buffer.from(bytes), {
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
