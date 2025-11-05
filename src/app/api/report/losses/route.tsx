import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import { LossesPDF } from "@/lib/report/losses-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dataStr = searchParams.get("data");
    if (!dataStr) {
      return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
    }

    const data = JSON.parse(dataStr);
    
    const doc = <LossesPDF data={data} />;
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
        "Content-Disposition": `attachment; filename="raport-straty-cyrkulacji-${Date.now()}.pdf"`,
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
