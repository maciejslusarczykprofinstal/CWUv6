import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { residentCalc } from "@/lib/calc/cwu";

const Schema = z
  .object({
    waterM3: z.number().positive(),
    coldTempC: z.number(),
    hotTempC: z.number(),
    mpecHeatGJ: z.number().nullable().optional(),
    pricePerGJ: z.number().nullable().optional(),
    residentPaymentsPLN: z.number().nonnegative(),
    circulationLossPct: z.number().min(0).max(100).nullable().optional(),
  })
  .refine((d) => d.hotTempC > d.coldTempC, {
    path: ["hotTempC"],
    message: "Temperatura CWU musi być większa od temperatury zimnej.",
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = Schema.parse(body);
    const result = residentCalc(data);
    return NextResponse.json({ ok: true, result });
  } catch (e: unknown) {
    const msg = e instanceof ZodError ? e.issues : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
