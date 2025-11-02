import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import {
  orderedPowerCWU,
  circulationLossByUA,
  modernizationVariants,
} from "@/lib/calc/cwu";

const Schema = z.object({
  flats: z.number().int().positive(),
  risers: z.number().int().positive(),
  coldTempC: z.number(),
  hotTempC: z.number(),
  drawPeakLpm: z.number().positive(), // szczytowy pobór [L/min] na budynek (np. 80–200)
  simultProfile: z.enum(["low", "med", "high"]).default("med"),
  bufferL: z.number().nonnegative().default(0),
  bufferDeltaC: z.number().nonnegative().default(0),
  peakDurationSec: z.number().positive().default(300), // 5 min
  // straty cyrkulacji – wariant A (%), wariant B (UA)
  circulationPct: z.number().min(0).max(100).optional().nullable(),
  purchasedGJ: z.number().positive().optional().nullable(),
  UA_WK: z.number().nonnegative().optional().nullable(), // [W/K]
  dT_circ: z.number().nonnegative().default(20), // typowe ΔT rury-cyrkulacji
  hours_circ: z.number().positive().default(8760), // godziny/rok
  pricePerGJ: z.number().positive().default(60),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = Schema.parse(body);

    const power = orderedPowerCWU({
      flats: data.flats,
      risers: data.risers,
      coldTempC: data.coldTempC,
      hotTempC: data.hotTempC,
      drawPeakLpm: data.drawPeakLpm,
      simultProfile: data.simultProfile,
      bufferL: data.bufferL,
      bufferDeltaC: data.bufferDeltaC,
      peakDurationSec: data.peakDurationSec,
    });

    // Straty cyrkulacji
    let circGJ = 0;
    if (data.UA_WK && data.UA_WK > 0) {
      const loss = circulationLossByUA(
        data.UA_WK,
        data.dT_circ,
        data.hours_circ,
      );
      circGJ = loss.GJ;
    } else if (data.circulationPct && data.purchasedGJ) {
      circGJ = data.purchasedGJ * (data.circulationPct / 100);
    }

    const variants = modernizationVariants({
      circLossGJ: circGJ,
      pricePerGJ: data.pricePerGJ,
    });

    return NextResponse.json({ ok: true, result: { power, circGJ, variants } });
  } catch (e: unknown) {
    const msg = e instanceof ZodError ? e.issues : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
