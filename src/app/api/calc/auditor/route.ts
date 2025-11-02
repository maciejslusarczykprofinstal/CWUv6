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

    // Enhance power object with proper assumptions for frontend
    const enhancedPower = {
      ...power,
      assumptions: {
        profile: data.simultProfile,
        consumptionPattern: `${data.flats} mieszkań, ${data.drawPeakLpm} L/min szczyt`,
        efficiency: Math.round((1 - (circGJ / (data.purchasedGJ || 500))) * 100)
      }
    };

    const variants = modernizationVariants({
      circLossGJ: circGJ,
      pricePerGJ: data.pricePerGJ,
    });

    // Economics calculation
    const currentCostPLN = Math.round(circGJ * data.pricePerGJ);
    const potentialSavingsPLN = Math.round(variants.reduce((sum, v) => sum + v.savingsPLN, 0) / variants.length);
    const co2ReductionKg = Math.round(circGJ * 0.2 * 1000); // ~0.2 kg CO2/kWh converted to GJ
    
    const economics = {
      currentCostPLN,
      potentialSavingsPLN,
      investmentRecommendation: potentialSavingsPLN > 50000 
        ? "Zdecydowanie zalecana modernizacja - wysokie oszczędności" 
        : potentialSavingsPLN > 20000 
          ? "Zalecana modernizacja - dobre oszczędności"
          : "Rozważyć modernizację - umiarkowane oszczędności",
      co2ReductionKg
    };

    // Technical analysis
    const efficiency = Math.max(60, Math.min(95, 100 - (circGJ / (data.purchasedGJ || 500) * 100)));
    const heatLosses = circGJ / (data.purchasedGJ || 500) * 100;
    const systemRating = efficiency > 85 ? "BARDZO DOBRY" : 
                        efficiency > 75 ? "DOBRY" : 
                        efficiency > 65 ? "ŚREDNI" : "WYMAGA MODERNIZACJI";
    
    const recommendations = [
      "Modernizacja izolacji przewodów cyrkulacyjnych",
      "Instalacja zaworów termostatycznych na pionach",
      "Optymalizacja temperatury cyrkulacji CWU",
      heatLosses > 20 ? "Pilna wymiana nieizolowanych przewodów" : "Regularna kontrola stanu izolacji",
      "Rozważenie instalacji systemu rekuperacji ciepła"
    ];

    const technical = {
      efficiency: Math.round(efficiency * 10) / 10,
      heatLosses: Math.round(heatLosses * 10) / 10,
      systemRating,
      recommendations
    };

    return NextResponse.json({ 
      ok: true, 
      result: { 
        power: enhancedPower, 
        circGJ, 
        variants: variants.map(v => ({
          ...v,
          description: `Redukcja strat o ${(v.savingsGJ/circGJ*100).toFixed(1)}%`,
          roi: Math.round((v.savingsPLN / v.capexPLN * 100) * 10) / 10,
          // Mapowanie do oczekiwanej struktury frontend
          savedGJ: v.savingsGJ,
          savedPLN: v.savingsPLN,
          paybackYears: v.paybackYears
        })), 
        economics,
        technical
      } 
    });
  } catch (e: unknown) {
    const msg = e instanceof ZodError ? e.issues : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
