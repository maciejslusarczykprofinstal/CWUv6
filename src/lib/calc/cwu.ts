import Decimal from "decimal.js";

// ========================
// HELPERY JEDNOSTEK
// ========================

export function kJToKWh(kJ: number): number {
  return new Decimal(kJ).div(3600).toNumber(); // kJ → kWh
}

export function kJToGJ(kJ: number): number {
  return new Decimal(kJ).div(1_000_000).toNumber(); // kJ → GJ
}

// ========================
// WSPÓŁCZYNNIK JEDNOCZESNOŚCI
// ========================

export function fJednoczesnosci(
  flats: number,
  profile: "low" | "med" | "high",
): number {
  // Typowe współczynniki jednoczesności dla instalacji CWU
  const baseCoeff = 1 / Math.sqrt(flats); // Podstawowy wzór √n

  const multipliers = {
    low: 0.6, // Niski profil użytkowania
    med: 0.8, // Średni profil użytkowania
    high: 1.0, // Wysoki profil użytkowania
  };

  const result = baseCoeff * multipliers[profile];
  return Math.min(Math.max(result, 0.1), 1.0); // Ograniczenia 0.1-1.0
}

export function energyForHeatingWater(
  waterM3: number,
  cold: number,
  hot: number,
) {
  const rho = new Decimal(1000); // kg/m3
  const c = new Decimal(4.186); // kJ/kgK
  const dT = new Decimal(hot).minus(cold); // K
  const V = new Decimal(waterM3);
  const Q_kJ = V.mul(rho).mul(c).mul(dT); // kJ
  const Q_kWh = Q_kJ.div(3600); // kWh
  const Q_GJ = Q_kJ.div(1_000_000); // GJ
  return { kWh: Q_kWh.toNumber(), GJ: Q_GJ.toNumber() };
}

export function residentCalc(input: {
  waterM3: number;
  coldTempC: number;
  hotTempC: number;
  mpecHeatGJ?: number | null;
  pricePerGJ?: number | null;
  residentPaymentsPLN: number;
  circulationLossPct?: number | null;
}) {
  const {
    waterM3,
    coldTempC,
    hotTempC,
    mpecHeatGJ,
    pricePerGJ,
    residentPaymentsPLN,
    circulationLossPct = 0,
  } = input;

  const needGJ = energyForHeatingWater(waterM3, coldTempC, hotTempC).GJ;

  const purchasedGJ =
    mpecHeatGJ != null && !Number.isNaN(mpecHeatGJ)
      ? mpecHeatGJ
      : pricePerGJ
        ? residentPaymentsPLN / (pricePerGJ || 1)
        : needGJ;

  const circGJ = purchasedGJ * (Number(circulationLossPct) / 100);
  const usefulGJ = Math.max(purchasedGJ - circGJ, 0);
  const costPLN = pricePerGJ ? purchasedGJ * pricePerGJ : 0;
  const diffPLN = costPLN - residentPaymentsPLN;

  return { needGJ, purchasedGJ, circGJ, usefulGJ, costPLN, diffPLN };
}

// ========================
// MOC ZAMÓWIONA CWU
// ========================

export function orderedPowerCWU(params: {
  flats: number;
  risers: number;
  coldTempC: number;
  hotTempC: number;
  drawPeakLpm: number;
  simultProfile: "low" | "med" | "high";
  bufferL: number;
  bufferDeltaC: number;
  peakDurationSec: number;
}) {
  const {
    flats,
    coldTempC,
    hotTempC,
    drawPeakLpm,
    simultProfile,
    bufferL,
    bufferDeltaC,
    peakDurationSec,
  } = params;

  // Stałe fizyczne
  const rho = new Decimal(1000); // kg/m³
  const c = new Decimal(4.186); // kJ/kgK
  const dT = new Decimal(hotTempC).minus(coldTempC); // K

  // Przepływ i jednoczesność
  const przepływ_lps = new Decimal(drawPeakLpm).div(60); // L/s
  const jednocz = fJednoczesnosci(flats, simultProfile);
  const m_dot = przepływ_lps.mul(jednocz).mul(rho); // kg/s

  // Moc cieplna [kW]
  const P_kW = m_dot.mul(c).mul(dT).div(3600); // kW

  // Energia bufora [kJ]
  const E_bufor_kJ = new Decimal(bufferL).mul(1).mul(c).mul(bufferDeltaC); // kJ
  const E_bufor_kWh = E_bufor_kJ.div(3600); // kWh

  // Moc netto po uwzględnieniu bufora [kW]
  const buforPower_kW = E_bufor_kJ.div(peakDurationSec).div(3600); // kW
  const P_net = Decimal.max(P_kW.minus(buforPower_kW), 0); // kW

  const assumptions = {
    rho_kgm3: 1000,
    c_kJkgK: 4.186,
    bufferDensity_kgL: 1,
    description: "Obliczenia wg norm technicznych CWU",
  };

  return {
    PkW: P_kW.toNumber(),
    PnetkW: P_net.toNumber(),
    jednocz: Number(jednocz.toFixed(3)),
    dT: dT.toNumber(),
    Ebufor_kWh: E_bufor_kWh.toNumber(),
    assumptions,
  };
}

// ========================
// STRATY CYRKULACJI
// ========================

export function circulationLossByUA(UA_WK: number, dT: number, hours: number) {
  // Q = UA × ΔT × t [W⋅h] → [kWh]
  const Q_Wh = new Decimal(UA_WK).mul(dT).mul(hours); // W⋅h
  const Q_kWh = Q_Wh.div(1000); // kWh
  const Q_GJ = Q_kWh.mul(3.6).div(1000); // GJ (1 kWh = 3.6 MJ)

  return {
    kWh: Q_kWh.toNumber(),
    GJ: Q_GJ.toNumber(),
  };
}

// ========================
// WARIANTY MODERNIZACJI
// ========================

export function modernizationVariants(base: {
  circLossGJ: number;
  pricePerGJ: number;
}) {
  const { circLossGJ, pricePerGJ } = base;

  const variants = [
    {
      name: "Wariant A - Podstawowy",
      reductionPct: 15,
      capexPLN: 30000,
      description: "Izolacja podstawowa, wymiana zaworów",
    },
    {
      name: "Wariant B - Średniozaawansowany",
      reductionPct: 30,
      capexPLN: 80000,
      description: "Nowe przewody, pompy sterowane, izolacja premium",
    },
    {
      name: "Wariant C - Kompleksowy",
      reductionPct: 45,
      capexPLN: 150000,
      description: "Kompletna wymiana, smart control, optymalizacja tras",
    },
  ];

  return variants.map((variant) => {
    const savingsGJ = circLossGJ * (variant.reductionPct / 100);
    const savingsPLN = savingsGJ * pricePerGJ;
    const paybackYears =
      savingsPLN > 0 ? variant.capexPLN / savingsPLN : Infinity;

    return {
      ...variant,
      savingsGJ: Number(savingsGJ.toFixed(3)),
      savingsPLN: Number(savingsPLN.toFixed(0)),
      paybackYears: Number(paybackYears.toFixed(1)),
      npv10years: Number((savingsPLN * 10 - variant.capexPLN).toFixed(0)),
    };
  });
}
