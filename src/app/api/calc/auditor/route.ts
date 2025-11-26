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
  drawPeakLpm: z.number().positive(), // szczytowy pobór [L/min]
  simultProfile: z.enum(["low", "med", "high"]).default("med"),
  bufferL: z.number().nonnegative().default(0),
  bufferDeltaC: z.number().nonnegative().default(0),
  peakDurationSec: z.number().positive().default(300),
  circulationPct: z.number().min(0).max(100).optional().nullable(),
  purchasedGJ: z.number().positive().optional().nullable(),
  UA_WK: z.number().nonnegative().optional().nullable(),
  dT_circ: z.number().nonnegative().default(20),
  hours_circ: z.number().positive().default(8760),
  pricePerGJ: z.number().positive().default(60),
  // Metoda wybrana przez użytkownika
  method: z.enum([
    "PN_EN_806_3",
    "PN_92_B_01706",
    "bilans_energetyczny",
    "moc_czas_rozbioru",
    "peak_demand_pomiary",
    "krzywa_mocy_sezonowa",
    "kosztowa",
    "symulacja_programowa",
  ]).default("PN_EN_806_3"),
  // Parametry ekonomiczne dla metody kosztowej
  costPowerRatePLNkW: z.number().positive().optional(), // PLN/kW/rok
  penaltyRatePLNkW: z.number().positive().optional(), // PLN/kW przekroczenia/h
  expectedExceedHours: z.number().nonnegative().optional(), // h/rok z przekroczeniem
  avgExceedKW: z.number().nonnegative().optional(), // średnie przekroczenie kW
  candidateFromKW: z.number().nonnegative().optional(),
  candidateToKW: z.number().nonnegative().optional(),
  candidateStepKW: z.number().positive().optional(),
  peakMarginPct: z.number().nonnegative().default(10).optional(), // dla peak demand
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = Schema.parse(body);

    const basePower = orderedPowerCWU({
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

    // Metoda peak demand wg pomiarów – korekta mocy zamówionej o margines
    let methodPower: { PkW: number; note: string } | null = null;
    if (data.method === "peak_demand_pomiary") {
      const marginFactor = 1 + (data.peakMarginPct || 0) / 100;
      const przeplyw_lps = data.drawPeakLpm / 60; // L/s
      const rho = 1000; // kg/m3
      const c = 4.186; // kJ/kgK
      const dT = data.hotTempC - data.coldTempC;
      const m_dot = przeplyw_lps * rho; // kg/s (bez współcz. jednoczesności – realny pik)
      const PkW_peak = (m_dot * c * dT) / 3600; // kW
      methodPower = { PkW: PkW_peak * marginFactor, note: `Peak demand: pik=${PkW_peak.toFixed(1)} kW + ${data.peakMarginPct || 0}% margines` };
    }

    // Metoda kosztowa – tablica kosztów rocznych dla zakresu P
    let costOptimization: null | {
      rows: { P: number; costFixed: number; costPenalty: number; costTotal: number }[];
      optimum: { Popt: number; costTotal: number };
      assumptions: string[];
    } = null;
    if (data.method === "kosztowa" && data.costPowerRatePLNkW && data.penaltyRatePLNkW) {
      const from = data.candidateFromKW ?? Math.max(5, Math.round(basePower.PkW * 0.5));
      const to = data.candidateToKW ?? Math.round(basePower.PkW * 1.5);
      const step = data.candidateStepKW ?? Math.max(1, Math.round((to - from) / 20));
      const expectedHours = data.expectedExceedHours ?? 50; // h/rok
      const avgExceedKW = data.avgExceedKW ?? Math.max(0, basePower.PkW * 0.1); // średnie przekroczenie
      const rows: { P: number; costFixed: number; costPenalty: number; costTotal: number }[] = [];
      for (let P = from; P <= to; P += step) {
        // Jeśli P < moc techniczna (PkW_net) – zakładamy przekroczenia
        const exceedKW = Math.max(basePower.PkW - P, 0);
        const costFixed = P * data.costPowerRatePLNkW;
        const penaltyOccurKW = exceedKW > 0 ? avgExceedKW : 0;
        const costPenalty = penaltyOccurKW * data.penaltyRatePLNkW * expectedHours;
        const costTotal = costFixed + costPenalty;
        rows.push({ P: Number(P.toFixed(1)), costFixed: Math.round(costFixed), costPenalty: Math.round(costPenalty), costTotal: Math.round(costTotal) });
      }
      const optimumRow = rows.reduce((min, r) => (r.costTotal < min.costTotal ? r : min), rows[0]);
      costOptimization = {
        rows,
        optimum: { Popt: optimumRow.P, costTotal: optimumRow.costTotal },
        assumptions: [
          `Stawka mocy: ${data.costPowerRatePLNkW} PLN/kW/rok`,
          `Kara: ${data.penaltyRatePLNkW} PLN/kW·h`,
          `Godziny przekroczeń: ${expectedHours} h/rok`,
          `Średnie przekroczenie: ${avgExceedKW.toFixed(1)} kW`,
        ],
      };
    }

    // Straty cyrkulacji
    let circGJ = 0;
    if (data.UA_WK && data.UA_WK > 0) {
      const loss = circulationLossByUA(
        data.UA_WK,
        data.dT_circ,
        data.hours_circ,
      );
      circGJ = loss;
    } else if (data.circulationPct && data.purchasedGJ) {
      circGJ = data.purchasedGJ * (data.circulationPct / 100);
    }

    // Enhance power object with proper assumptions for frontend
    const chosenPower = methodPower ? methodPower.PkW : basePower.PkW;
    const enhancedPower = {
      ...basePower,
      PkW: chosenPower,
      assumptions: {
        profile: data.simultProfile,
        method: data.method,
        consumptionPattern: `${data.flats} mieszkań, ${data.drawPeakLpm} L/min szczyt`,
        efficiency: Math.round((1 - (circGJ / (data.purchasedGJ || 500))) * 100),
        methodNote: methodPower?.note || (data.method === "kosztowa" ? "Moc po optymalizacji kosztowej" : "Normatywna / bazowa moc"),
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
          description: `Redukcja strat o ${(v.savingsGJ / circGJ * 100).toFixed(1)}%`,
          roi: Math.round((v.savingsPLN / v.capexPLN * 100) * 10) / 10,
          savedGJ: v.savingsGJ,
          savedPLN: v.savingsPLN,
          paybackYears: v.paybackYears,
        })),
        economics,
        technical,
        costOptimization,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof ZodError ? e.issues : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
