// UWAGA: Endpoint wyłączony po przeniesieniu generowania PDF na klienta.
// Pozostawiony jedynie jako bezpieczna odpowiedź 410 dla ewentualnych starych linków.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(
    JSON.stringify({
      error: "Endpoint wyłączony. Użyj wersji klienckiej generowania PDF w narzędziu Liczniki.",
    }),
    {
      status: 410, // Gone
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    }
  );
}
