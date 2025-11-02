 
import { NextRequest } from "next/server";
import { makeResidentPDF } from "@/lib/report/resident-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("data");
    if (!raw) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing ?data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    if (typeof parsed !== "object" || parsed === null) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { input, result } = parsed as { input: unknown; result: unknown };

    const bytes = await makeResidentPDF(input, result); // Uint8Array
    // Podajemy ArrayBuffer (BodyInit akceptuje)  bez kombinacji z BlobPart
    const ab = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    );

    return new Response(ab as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=raport-mieszkancy.pdf",
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
