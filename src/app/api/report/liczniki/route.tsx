import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { z } from "zod";
import { LicznikiSummaryPDF, type LicznikiSummaryData } from "@/lib/report/liczniki-summary-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  waterVolumeM3: z.coerce.number(),
  pricePerM3: z.coerce.number(),
  pricePerGJ: z.coerce.number(),
  totalPaid: z.coerce.number().optional(),
  totalCost: z.coerce.number().optional(),
  createdAt: z.string().optional(),
  paidVolumeM3: z.coerce.number().optional(),
  theoreticalVolumeM3: z.coerce.number().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("data");
    if (!raw) {
      return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
    }

    let data: LicznikiSummaryData;
    try {
      data = Schema.parse(JSON.parse(raw));
    } catch (e) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Uzupełnij wartości jeśli nie dostarczono totalPaid/totalCost — komponent sam też to potrafi,
    // ale trzymamy się jawnego kontraktu i spójności z API.
    const doc = <LicznikiSummaryPDF data={data} />;
    const bytes = (await pdf(doc).toBuffer()) as unknown as Uint8Array;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="raport-liczniki-${Date.now()}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("PDF generation error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
