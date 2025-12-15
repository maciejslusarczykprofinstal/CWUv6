"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ResidentReportInput, ResidentReportResult } from "@/lib/report/types";

type ResidentCwuAuditContext = {
  inputs: ResidentReportInput;
  result: ResidentReportResult;
};

const STORAGE_KEY = "residentCwuAuditContext";
const STORAGE_KEY_TECH_ASSESSMENT = "residentCwuTechnicalAssessment";
const STORAGE_KEY_VARIANTS = "cwuAuditVariants";

type RiskLevel = "niska" | "srednia" | "wysoka";

type CostLevel = "niski" | "sredni" | "wysoki";
type LossReductionPotential = "10-20" | "20-40" | "40-60";

type AuditVariantKey = "A" | "B" | "C";

type AuditVariant = {
  key: AuditVariantKey;
  scopeDescription: string;
  costLevel: CostLevel;
  lossReductionPotential: LossReductionPotential;
};

type AuditVariantsState = {
  A: AuditVariant;
  B: AuditVariant;
  C: AuditVariant;
};

type TechnicalAssessment = {
  checklist: {
    regulationCirculation: boolean;
    nodeSettings: boolean;
    insulationPipes: boolean;
    modernizationElements: boolean;
    requiresOnSiteMeasurements: boolean;
    circulationBalancing: boolean;
  };
  notes: string;
  riskLevel: RiskLevel;
  recommendation: string;
};

const DEFAULT_TECH_ASSESSMENT: TechnicalAssessment = {
  checklist: {
    regulationCirculation: false,
    nodeSettings: false,
    insulationPipes: false,
    modernizationElements: false,
    requiresOnSiteMeasurements: false,
    circulationBalancing: false,
  },
  notes: "",
  riskLevel: "srednia",
  recommendation: "",
};

const DEFAULT_VARIANTS: AuditVariantsState = {
  A: {
    key: "A",
    scopeDescription: "",
    costLevel: "niski",
    lossReductionPotential: "10-20",
  },
  B: {
    key: "B",
    scopeDescription: "",
    costLevel: "sredni",
    lossReductionPotential: "20-40",
  },
  C: {
    key: "C",
    scopeDescription: "",
    costLevel: "wysoki",
    lossReductionPotential: "40-60",
  },
};

function formatPLN(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("pl-PL", { maximumFractionDigits: 0 });
}

function costLevelLabel(level: CostLevel): string {
  switch (level) {
    case "niski":
      return "kilka–kilkanaście tys. zł";
    case "sredni":
      return "kilkadziesiąt tys. zł";
    case "wysoki":
      return "powyżej kilkudziesięciu tys. zł";
  }
}

function reductionRange(potential: LossReductionPotential): { minPct: number; maxPct: number } {
  switch (potential) {
    case "10-20":
      return { minPct: 0.1, maxPct: 0.2 };
    case "20-40":
      return { minPct: 0.2, maxPct: 0.4 };
    case "40-60":
      return { minPct: 0.4, maxPct: 0.6 };
  }
}

function costLevelNumericRange(level: CostLevel): { min: number; max: number } {
  // Widełki robocze tylko do klasyfikacji ROI (nie są prezentowane jako liczby w UI).
  switch (level) {
    case "niski":
      return { min: 5_000, max: 15_000 };
    case "sredni":
      return { min: 20_000, max: 60_000 };
    case "wysoki":
      return { min: 60_000, max: 200_000 };
  }
}

function selectedVariantKeyFromState(variants: AuditVariantsState): AuditVariantKey {
  const keys: AuditVariantKey[] = ["A", "B", "C"];
  const filled = keys.filter((k) => variants[k].scopeDescription.trim().length > 0);

  if (filled.length === 1) return filled[0];
  if (filled.length === 0) return "B";
  return filled.includes("B") ? "B" : filled[0];
}

function roiLabelFromPaybackYears(paybackYearsMax: number): string {
  if (paybackYearsMax <= 2) return "zwraca się szybko (≤ 2 lata)";
  if (paybackYearsMax <= 5) return "średni okres zwrotu (2–5 lat)";
  return "długoterminowa inwestycja (> 5 lat)";
}

function potentialLabel(potential: LossReductionPotential): string {
  switch (potential) {
    case "10-20":
      return "10–20%";
    case "20-40":
      return "20–40%";
    case "40-60":
      return "40–60%";
  }
}

function formatPL(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function safeParseContext(raw: string | null): ResidentCwuAuditContext | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ResidentCwuAuditContext>;
    if (!parsed || typeof parsed !== "object") return null;

    const inputs = parsed.inputs as ResidentReportInput | undefined;
    const result = parsed.result as ResidentReportResult | undefined;

    if (!inputs || !result) return null;

    const toFiniteNumber = (v: unknown): number | null => {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const normalized = v.trim().replace(/\s+/g, "").replace(",", ".");
        if (!normalized) return null;
        const n = Number(normalized);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    if (toFiniteNumber(inputs.monthlyConsumption) === null) return null;
    if (toFiniteNumber(inputs.cwuPriceFromBill) === null) return null;

    if (toFiniteNumber(result.theoreticalCostPerM3) === null) return null;
    if (toFiniteNumber(result.lossPerM3) === null) return null;
    if (toFiniteNumber(result.yearlyFinancialLoss) === null) return null;

    return { inputs, result };
  } catch {
    return null;
  }
}

function safeParseAssessment(raw: string | null): TechnicalAssessment | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TechnicalAssessment>;
    if (!parsed || typeof parsed !== "object") return null;

    const checklist = parsed.checklist as Partial<TechnicalAssessment["checklist"]> | undefined;
    const riskLevel = parsed.riskLevel as RiskLevel | undefined;

    const validRisk = riskLevel === "niska" || riskLevel === "srednia" || riskLevel === "wysoka";
    if (!validRisk) return null;
    if (!checklist || typeof checklist !== "object") return null;

    const isBool = (v: unknown) => typeof v === "boolean";

    if (!isBool(checklist.regulationCirculation)) return null;
    if (!isBool(checklist.nodeSettings)) return null;
    if (!isBool(checklist.insulationPipes)) return null;
    if (!isBool(checklist.modernizationElements)) return null;
    if (!isBool(checklist.requiresOnSiteMeasurements)) return null;
    if (!isBool(checklist.circulationBalancing)) return null;

    return {
      checklist: {
        regulationCirculation: checklist.regulationCirculation,
        nodeSettings: checklist.nodeSettings,
        insulationPipes: checklist.insulationPipes,
        modernizationElements: checklist.modernizationElements,
        requiresOnSiteMeasurements: checklist.requiresOnSiteMeasurements,
        circulationBalancing: checklist.circulationBalancing,
      },
      notes: typeof parsed.notes === "string" ? parsed.notes : "",
      riskLevel,
      recommendation: typeof parsed.recommendation === "string" ? parsed.recommendation : "",
    };
  } catch {
    return null;
  }
}

function safeParseVariants(raw: string | null): AuditVariantsState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AuditVariantsState>;
    if (!parsed || typeof parsed !== "object") return null;

    const isVariant = (v: unknown, key: AuditVariantKey): v is AuditVariant => {
      if (!v || typeof v !== "object") return false;
      const obj = v as Partial<AuditVariant>;

      const validCost = obj.costLevel === "niski" || obj.costLevel === "sredni" || obj.costLevel === "wysoki";
      const validPotential = obj.lossReductionPotential === "10-20" || obj.lossReductionPotential === "20-40" || obj.lossReductionPotential === "40-60";

      return obj.key === key && typeof obj.scopeDescription === "string" && validCost && validPotential;
    };

    if (!isVariant(parsed.A, "A")) return null;
    if (!isVariant(parsed.B, "B")) return null;
    if (!isVariant(parsed.C, "C")) return null;

    return { A: parsed.A, B: parsed.B, C: parsed.C };
  } catch {
    return null;
  }
}

export default function AudytorPage() {
  const [ctx, setCtx] = useState<ResidentCwuAuditContext | null>(null);
  const [assessment, setAssessment] = useState<TechnicalAssessment>(DEFAULT_TECH_ASSESSMENT);
  const [assessmentHydrated, setAssessmentHydrated] = useState(false);
  const [assessmentSavedAtISO, setAssessmentSavedAtISO] = useState<string | null>(null);

  const [variants, setVariants] = useState<AuditVariantsState>(DEFAULT_VARIANTS);
  const [variantsHydrated, setVariantsHydrated] = useState(false);
  const [variantsSavedAtISO, setVariantsSavedAtISO] = useState<string | null>(null);

  const [managerReportOpen, setManagerReportOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromStorage = safeParseContext(window.localStorage.getItem(STORAGE_KEY));
    setCtx(fromStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromStorage = safeParseAssessment(window.localStorage.getItem(STORAGE_KEY_TECH_ASSESSMENT));
    setAssessment(fromStorage ?? DEFAULT_TECH_ASSESSMENT);
    setAssessmentHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromStorage = safeParseVariants(window.localStorage.getItem(STORAGE_KEY_VARIANTS));
    setVariants(fromStorage ?? DEFAULT_VARIANTS);
    setVariantsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!assessmentHydrated) return;

    window.localStorage.setItem(STORAGE_KEY_TECH_ASSESSMENT, JSON.stringify(assessment));
    setAssessmentSavedAtISO(new Date().toISOString());
  }, [assessment, assessmentHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!variantsHydrated) return;

    window.localStorage.setItem(STORAGE_KEY_VARIANTS, JSON.stringify(variants));
    setVariantsSavedAtISO(new Date().toISOString());
  }, [variants, variantsHydrated]);

  function updateChecklist<K extends keyof TechnicalAssessment["checklist"]>(key: K, value: boolean) {
    setAssessment((prev) => ({ ...prev, checklist: { ...prev.checklist, [key]: value } }));
  }

  function updateVariant<K extends keyof AuditVariant>(variantKey: AuditVariantKey, key: K, value: AuditVariant[K]) {
    setVariants((prev) => ({
      ...prev,
      [variantKey]: {
        ...prev[variantKey],
        [key]: value,
      },
    }));
  }

  const view = useMemo(() => {
    if (!ctx) return null;

    const bill = Number(ctx.inputs.cwuPriceFromBill) || 0;
    const lossPerM3 = Math.max(0, Number(ctx.result.lossPerM3) || 0);
    const lossPercentRaw = bill > 0 ? (lossPerM3 / bill) * 100 : 0;
    const lossPercent = Math.min(100, Math.max(0, lossPercentRaw));

    return {
      source: "Zgłoszenie mieszkańca – analiza CWU",
      monthlyConsumption: ctx.inputs.monthlyConsumption,
      cwuPriceFromBill: ctx.inputs.cwuPriceFromBill,
      theoreticalCostPerM3: ctx.result.theoreticalCostPerM3,
      lossPercent,
      yearlyFinancialLoss: ctx.result.yearlyFinancialLoss,
    };
  }, [ctx]);

  const effectsView = useMemo(() => {
    if (!view) return null;
    const yearlyLoss = Math.max(0, Number(view.yearlyFinancialLoss) || 0);
    const lossPercent = Math.min(100, Math.max(0, Number(view.lossPercent) || 0));
    if (!Number.isFinite(yearlyLoss) || !Number.isFinite(lossPercent)) return null;

    const buildVariant = (v: AuditVariant) => {
      const { minPct, maxPct } = reductionRange(v.lossReductionPotential);
      const min = Math.round(yearlyLoss * minPct);
      const max = Math.round(yearlyLoss * maxPct);
      const minSafe = Math.max(0, Math.min(min, max));
      const maxSafe = Math.max(0, Math.max(min, max));

      return {
        key: v.key,
        cost: costLevelLabel(v.costLevel),
        effectLabel: `~${formatPLN(minSafe)} – ${formatPLN(maxSafe)} zł/rok`,
      };
    };

    return {
      yearlyLoss,
      lossPercent,
      A: buildVariant(variants.A),
      B: buildVariant(variants.B),
      C: buildVariant(variants.C),
    };
  }, [variants, view]);

  const profitabilityView = useMemo(() => {
    if (!view) return null;
    const yearlyLoss = Math.max(0, Number(view.yearlyFinancialLoss) || 0);
    if (!Number.isFinite(yearlyLoss) || yearlyLoss <= 0) return null;

    const selectedKey = selectedVariantKeyFromState(variants);
    const selected = variants[selectedKey];

    const { minPct, maxPct } = reductionRange(selected.lossReductionPotential);
    const midPct = (minPct + maxPct) / 2;
    const yearlySavings = Math.max(0, Math.round(yearlyLoss * midPct));
    if (!Number.isFinite(yearlySavings) || yearlySavings <= 0) return null;

    const { min: costMin, max: costMax } = costLevelNumericRange(selected.costLevel);
    const paybackMax = costMax / yearlySavings;
    const roiLabel = roiLabelFromPaybackYears(paybackMax);

    const character = `${roiLabel}`;
    const investment = costLevelLabel(selected.costLevel);

    const recommendation =
      paybackMax <= 2
        ? `Priorytetowo rozważyć wdrożenie wariantu ${selectedKey} po weryfikacji pomiarowej i doprecyzowaniu zakresu.`
        : paybackMax <= 5
          ? `Rozważyć wdrożenie wariantu ${selectedKey} po doprecyzowaniu zakresu oraz zebraniu ofert wykonawczych.`
          : `Traktować wariant ${selectedKey} jako inwestycję długoterminową; potwierdzić potencjał redukcji i porównać warianty ofertowe.`;

    return {
      yearlySavings,
      character,
      investment,
      recommendation,
    };
  }, [variants, view]);

  const managerSummaryView = useMemo(() => {
    if (!view) return null;
    const yearlyLoss = Math.max(0, Number(view.yearlyFinancialLoss) || 0);
    if (!Number.isFinite(yearlyLoss) || yearlyLoss <= 0) return null;

    const selectedKey = selectedVariantKeyFromState(variants);
    const selected = variants[selectedKey];

    const { minPct, maxPct } = reductionRange(selected.lossReductionPotential);
    const minSavings = Math.max(0, Math.round(yearlyLoss * minPct));
    const maxSavings = Math.max(0, Math.round(yearlyLoss * maxPct));

    const minSafe = Math.max(0, Math.min(minSavings, maxSavings));
    const maxSafe = Math.max(0, Math.max(minSavings, maxSavings));

    const bullets: string[] = [
      `Na podstawie danych ze zgłoszenia mieszkańca roczna strata finansowa CWU wynosi ok. ${formatPLN(yearlyLoss)} zł/rok (wartość orientacyjna).`,
      `Wariant roboczy: ${selectedKey} (poziom kosztu: ${costLevelLabel(selected.costLevel)}, potencjał ograniczenia strat: ${potentialLabel(selected.lossReductionPotential)}).`,
      `Orientacyjny efekt finansowy po wdrożeniu: oszczędność rzędu ~${formatPLN(minSafe)}–${formatPLN(maxSafe)} zł/rok (w zależności od rzeczywistej skuteczności).`,
      `Przed podjęciem decyzji zaleca się potwierdzenie założeń pomiarami na instalacji (temperatury, przepływy, czasy dojścia) oraz doprecyzowanie zakresu i kryteriów odbioru.`,
      `Do decyzji zarządcy/wspólnoty: wybór zakresu prac i trybu realizacji; po zebraniu ofert wykonawczych możliwe jest uszczegółowienie kosztów i harmonogramu.`,
    ];

    return { bullets };
  }, [variants, view]);

  const managerReportView = useMemo(() => {
    const selectedKey = selectedVariantKeyFromState(variants);
    const selected = variants[selectedKey];

    const yearlyLoss = view ? Math.max(0, Number(view.yearlyFinancialLoss) || 0) : null;
    const yearlyLossSafe = yearlyLoss !== null && Number.isFinite(yearlyLoss) ? yearlyLoss : null;

    const { minPct, maxPct } = reductionRange(selected.lossReductionPotential);
    const savingsMin = yearlyLossSafe !== null ? Math.max(0, Math.round(yearlyLossSafe * minPct)) : null;
    const savingsMax = yearlyLossSafe !== null ? Math.max(0, Math.round(yearlyLossSafe * maxPct)) : null;

    return {
      selectedKey,
      selected,
      yearlyLoss: yearlyLossSafe,
      savingsMin,
      savingsMax,
    };
  }, [variants, view]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100">Panel Audytora</h1>
          <p className="text-slate-300">
            Widok roboczy (read-only). Prezentuje kontekst zgłoszenia i dane wejściowe, bez edycji i bez ponownych obliczeń.
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Kontekst zgłoszenia</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">Dane wejściowe – nieedytowalne</div>
          </CardHeader>
          <CardContent>
            {!view ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Brak danych kontekstu do wyświetlenia.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Ten widok oczekuje, że dane zostaną dostarczone w stanie aplikacji (np. przez localStorage) w kluczu: <span className="font-mono">{STORAGE_KEY}</span>.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Źródło danych</div>
                  <div className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">{view.source}</div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Zużycie CWU</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatPL(view.monthlyConsumption, 1)} <span className="text-base font-bold">m³/miesiąc</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Cena CWU z rachunku</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatPL(view.cwuPriceFromBill, 2)} <span className="text-base font-bold">zł/m³</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Teoretyczny koszt CWU</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatPL(view.theoreticalCostPerM3, 2)} <span className="text-base font-bold">zł/m³</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Procent strat CWU</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatPL(view.lossPercent, 0)} <span className="text-base font-bold">%</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Strata roczna</div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatPL(view.yearlyFinancialLoss, 0)} <span className="text-base font-bold">zł/rok</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Szacunkowe koszty i efekty</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">Dane wejściowe (tylko do odczytu) + wyliczenia orientacyjne (UI)</div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!effectsView ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Brak danych do oszacowań.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Aby zobaczyć efekty, widok musi mieć dostęp do kontekstu zgłoszenia (roczna strata i procent strat).
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                    <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Aktualna roczna strata finansowa CWU</div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {formatPLN(effectsView.yearlyLoss)} <span className="text-base font-bold">zł/rok</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                    <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Procent strat CWU</div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {formatPL(effectsView.lossPercent, 0)} <span className="text-base font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                  <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">Wariant A</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Koszt</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{effectsView.A.cost}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Efekt roczny</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{effectsView.A.effectLabel}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">Wariant B</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Koszt</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{effectsView.B.cost}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Efekt roczny</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{effectsView.B.effectLabel}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">Wariant C</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Koszt</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{effectsView.C.cost}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Efekt roczny</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{effectsView.C.effectLabel}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Wartości orientacyjne. Dokładne koszty i efekty wymagają projektu i ofert wykonawczych.
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Warianty działań naprawczych</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Sekcja audytora (edytowalna). Zmiany zapisują się lokalnie w tej przeglądarce.
              {variantsSavedAtISO ? (
                <span className="ml-2">Ostatni autozapis: {new Date(variantsSavedAtISO).toLocaleString("pl-PL")}</span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-slate-100">Wariant A – Działania niskokosztowe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>regulacja cyrkulacji CWU</li>
                    <li>korekta nastaw temperatur / przepływów</li>
                    <li>drobne prace regulacyjne</li>
                  </ul>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Opis zakresu prac</label>
                    <textarea
                      className="w-full min-h-[120px] px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.A.scopeDescription}
                      onChange={(e) => updateVariant("A", "scopeDescription", e.target.value)}
                      placeholder="Opisz czynności regulacyjne, wstępny plan pomiarów i kryteria odbioru…"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Szacunkowy poziom kosztu</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.A.costLevel}
                      onChange={(e) => updateVariant("A", "costLevel", e.target.value as CostLevel)}
                    >
                      <option value="niski">niski</option>
                      <option value="sredni">średni</option>
                      <option value="wysoki">wysoki</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Potencjał ograniczenia strat</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.A.lossReductionPotential}
                      onChange={(e) => updateVariant("A", "lossReductionPotential", e.target.value as LossReductionPotential)}
                    >
                      <option value="10-20">10–20%</option>
                      <option value="20-40">20–40%</option>
                      <option value="40-60">40–60%</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-slate-100">Wariant B – Modernizacja częściowa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>poprawa izolacji pionów i poziomów</li>
                    <li>wymiana / korekta elementów instalacji</li>
                    <li>regulacja węzła cieplnego</li>
                  </ul>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Opis zakresu prac</label>
                    <textarea
                      className="w-full min-h-[120px] px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.B.scopeDescription}
                      onChange={(e) => updateVariant("B", "scopeDescription", e.target.value)}
                      placeholder="Opisz zakres modernizacji, elementy do weryfikacji/wymiany i wymagane pomiary…"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Szacunkowy poziom kosztu</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.B.costLevel}
                      onChange={(e) => updateVariant("B", "costLevel", e.target.value as CostLevel)}
                    >
                      <option value="niski">niski</option>
                      <option value="sredni">średni</option>
                      <option value="wysoki">wysoki</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Potencjał ograniczenia strat</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.B.lossReductionPotential}
                      onChange={(e) => updateVariant("B", "lossReductionPotential", e.target.value as LossReductionPotential)}
                    >
                      <option value="10-20">10–20%</option>
                      <option value="20-40">20–40%</option>
                      <option value="40-60">40–60%</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900 dark:text-slate-100">Wariant C – Modernizacja kompleksowa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    <li>przebudowa instalacji CWU</li>
                    <li>zmiany w węźle cieplnym</li>
                    <li>rozwiązania systemowe</li>
                  </ul>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Opis zakresu prac</label>
                    <textarea
                      className="w-full min-h-[120px] px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.C.scopeDescription}
                      onChange={(e) => updateVariant("C", "scopeDescription", e.target.value)}
                      placeholder="Opisz rozwiązanie docelowe, warunki brzegowe, etapy i wymagane uzgodnienia…"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Szacunkowy poziom kosztu</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.C.costLevel}
                      onChange={(e) => updateVariant("C", "costLevel", e.target.value as CostLevel)}
                    >
                      <option value="niski">niski</option>
                      <option value="sredni">średni</option>
                      <option value="wysoki">wysoki</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Potencjał ograniczenia strat</label>
                    <select
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                      value={variants.C.lossReductionPotential}
                      onChange={(e) => updateVariant("C", "lossReductionPotential", e.target.value as LossReductionPotential)}
                    >
                      <option value="10-20">10–20%</option>
                      <option value="20-40">20–40%</option>
                      <option value="40-60">40–60%</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Dane z tej sekcji nie są wysyłane na serwer (brak backendu). Zapis lokalny: <span className="font-mono">{STORAGE_KEY_VARIANTS}</span>.
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Ocena techniczna instalacji CWU</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Sekcja audytora (edytowalna). Zmiany zapisują się lokalnie w tej przeglądarce.
              {assessmentSavedAtISO ? (
                <span className="ml-2">Ostatni autozapis: {new Date(assessmentSavedAtISO).toLocaleString("pl-PL")}</span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset className="space-y-3">
              <legend className="text-base font-semibold text-slate-900 dark:text-slate-100">Checklisty techniczne</legend>
              <div className="grid md:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={assessment.checklist.regulationCirculation}
                    onChange={(e) => updateChecklist("regulationCirculation", e.target.checked)}
                  />
                  <span>Regulacja cyrkulacji CWU (przepływy, równoważenie, temperatury)</span>
                </label>
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={assessment.checklist.nodeSettings}
                    onChange={(e) => updateChecklist("nodeSettings", e.target.checked)}
                  />
                  <span>Korekta nastaw w węźle cieplnym / źródle (Tcwu, harmonogram, priorytety)</span>
                </label>
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={assessment.checklist.insulationPipes}
                    onChange={(e) => updateChecklist("insulationPipes", e.target.checked)}
                  />
                  <span>Poprawa izolacji pionów i poziomów (ciągłość, grubości, mostki)</span>
                </label>
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={assessment.checklist.modernizationElements}
                    onChange={(e) => updateChecklist("modernizationElements", e.target.checked)}
                  />
                  <span>Modernizacja elementów instalacji (pompy, zawory, regulacja, armatura)</span>
                </label>
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={assessment.checklist.circulationBalancing}
                    onChange={(e) => updateChecklist("circulationBalancing", e.target.checked)}
                  />
                  <span>Sprawdzenie / korekta równoważenia cyrkulacji (piony, kryzy, nastawy)</span>
                </label>
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={assessment.checklist.requiresOnSiteMeasurements}
                    onChange={(e) => updateChecklist("requiresOnSiteMeasurements", e.target.checked)}
                  />
                  <span>Wymagane pomiary w budynku (temperatury, czasy dojścia, przepływy)</span>
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-base font-semibold text-slate-900 dark:text-slate-100">Ryzyko / pilność</legend>
              <div className="grid md:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="riskLevel"
                    className="mt-1"
                    checked={assessment.riskLevel === "niska"}
                    onChange={() => setAssessment((prev) => ({ ...prev, riskLevel: "niska" }))}
                  />
                  <span>Niska</span>
                </label>
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="riskLevel"
                    className="mt-1"
                    checked={assessment.riskLevel === "srednia"}
                    onChange={() => setAssessment((prev) => ({ ...prev, riskLevel: "srednia" }))}
                  />
                  <span>Średnia</span>
                </label>
                <label className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="riskLevel"
                    className="mt-1"
                    checked={assessment.riskLevel === "wysoka"}
                    onChange={() => setAssessment((prev) => ({ ...prev, riskLevel: "wysoka" }))}
                  />
                  <span>Wysoka</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rekomendacja (krótko)</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                  value={assessment.recommendation}
                  onChange={(e) => setAssessment((prev) => ({ ...prev, recommendation: e.target.value }))}
                  placeholder="Np. weryfikacja nastaw + pomiary temperatury i przepływów na pionach"
                />
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-base font-semibold text-slate-900 dark:text-slate-100">Uwagi audytora</legend>
              <textarea
                className="w-full min-h-[140px] px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600"
                value={assessment.notes}
                onChange={(e) => setAssessment((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notatki z przeglądu danych, hipotezy przyczyn strat, zalecane pomiary i weryfikacje…"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Dane z tej sekcji nie są wysyłane na serwer (brak backendu). Zapis lokalny: <span className="font-mono">{STORAGE_KEY_TECH_ASSESSMENT}</span>.
              </div>
            </fieldset>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Efekt finansowy i opłacalność</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">Orientacyjna prezentacja (UI-only), bez backendu i bez ROI liczbowego</div>
          </CardHeader>
          <CardContent>
            {!profitabilityView ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Brak danych do oceny opłacalności.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Aby zobaczyć tę sekcję, potrzebna jest roczna strata finansowa z kontekstu oraz dane wariantu (koszt + potencjał redukcji).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Szacowana oszczędność roczna</div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">~{formatPLN(profitabilityView.yearlySavings)} zł/rok</div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Charakter inwestycji</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {profitabilityView.character}, koszt: {profitabilityView.investment}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-4">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rekomendacja audytora (automatyczna, neutralna)</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 md:text-right">{profitabilityView.recommendation}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Podsumowanie do przekazania zarządcy</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">Treść raportowa (UI-only), bez backendu</div>
          </CardHeader>
          <CardContent>
            {!managerSummaryView ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Brak danych do wygenerowania podsumowania.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Aby zobaczyć tę sekcję, potrzebna jest roczna strata finansowa z kontekstu oraz dane wybranego wariantu (koszt + potencjał redukcji).
                </p>
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                {managerSummaryView.bullets.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => setManagerReportOpen((v) => !v)}
              >
                Pobierz raport dla zarządcy
              </Button>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Po wygenerowaniu widoku raportu możesz użyć drukowania w przeglądarce (Ctrl+P) i zapisać jako PDF.
              </div>
            </div>

            {managerReportOpen ? (
              <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-6 text-black dark:bg-white dark:text-black dark:border-slate-300">
                <div className="space-y-3">
                  <div className="text-xl font-extrabold tracking-tight">Analiza strat CWU – podsumowanie</div>
                  <div className="text-sm text-slate-700">
                    Widok do druku (czarno-biały). Dane orientacyjne, bez backendu i bez ponownych obliczeń.
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-sm font-bold">Dane liczbowe</div>
                    <div className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-700">Strata roczna CWU</div>
                        <div className="font-semibold">
                          {managerReportView.yearlyLoss !== null ? `${formatPLN(managerReportView.yearlyLoss)} zł/rok` : "—"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-700">Oszczędność roczna (orientacyjnie)</div>
                        <div className="font-semibold">
                          {managerReportView.savingsMin !== null && managerReportView.savingsMax !== null
                            ? `~${formatPLN(managerReportView.savingsMin)}–${formatPLN(managerReportView.savingsMax)} zł/rok`
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-sm font-bold">Wariant działań</div>
                    <div className="mt-2 text-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="text-slate-700">Wariant</div>
                        <div className="font-semibold">{managerReportView.selectedKey}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="text-slate-700">Poziom kosztu (opisowo)</div>
                        <div className="font-semibold">{costLevelLabel(managerReportView.selected.costLevel)}</div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="text-slate-700">Potencjał redukcji strat</div>
                        <div className="font-semibold">{potentialLabel(managerReportView.selected.lossReductionPotential)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-sm font-bold">Podsumowanie dla zarządcy</div>
                    {managerSummaryView ? (
                      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                        {managerSummaryView.bullets.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 text-sm text-slate-700">Brak danych do wygenerowania podsumowania.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
