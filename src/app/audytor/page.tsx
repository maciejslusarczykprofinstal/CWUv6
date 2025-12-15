"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResidentReportInput, ResidentReportResult } from "@/lib/report/types";

type ResidentCwuAuditContext = {
  inputs: ResidentReportInput;
  result: ResidentReportResult;
};

const STORAGE_KEY = "residentCwuAuditContext";
const STORAGE_KEY_TECH_ASSESSMENT = "residentCwuTechnicalAssessment";
const STORAGE_KEY_VARIANTS = "cwuAuditVariants";
const STORAGE_KEY_AUDIT_REQUEST = "residentCwuAuditRequest";
const STORAGE_KEY_AUDIT_STATUS = "residentCwuAuditStatus";
const STORAGE_KEY_AUDIT_ORDER = "residentCwuAuditOrder";
const STORAGE_KEY_AUDIT_AGREEMENT = "residentCwuAuditAgreement";
const STORAGE_KEY_ROI_MODEL_INTEREST = "residentCwuRoiModelInterest";
const STORAGE_KEY_AUDIT_TOKEN = "residentCwuAuditToken";
const STORAGE_KEY_AUDIT_CONTACT_STAGE = "residentCwuAuditContactStage";

type RiskLevel = "niska" | "srednia" | "wysoka";

type CostLevel = "niski" | "sredni" | "wysoki";
type LossReductionPotential = "10-20" | "20-40" | "40-60";

type AuditVariantKey = "A" | "B" | "C";

type AuditRequestStatus = "REQUESTED";
type AuditStatus = "NEW" | "READY_FOR_AUDIT" | "AUDIT_REQUESTED";
type AuditOrderStatus = "REQUESTED";
type AuditAgreementStatus = "ACCEPTED";
type RoiModelInterestStatus = "EXPRESSED";

type AuditContactStage = "NEW" | "CONTACTED" | "TALK_DONE" | "OFFER_SENT";

type AuditDecisionStage = "CONTACTED" | "OFFER_SENT" | "DECISION_PENDING" | "ACCEPTED" | "REJECTED";

function decisionStageBadge(stage: AuditDecisionStage): {
  label: string;
  variant: "outline" | "secondary" | "success" | "destructive";
  className?: string;
} {
  switch (stage) {
    case "CONTACTED":
      return { label: "CONTACTED", variant: "outline" };
    case "OFFER_SENT":
      return { label: "OFFER_SENT", variant: "secondary" };
    case "DECISION_PENDING":
      return { label: "DECISION_PENDING", variant: "outline", className: "text-muted-foreground" };
    case "ACCEPTED":
      return { label: "ACCEPTED", variant: "success" };
    case "REJECTED":
      return { label: "REJECTED", variant: "destructive" };
  }
}

function contactStageBadge(stage: AuditContactStage): { label: string; variant: "outline" | "secondary" | "success" } {
  switch (stage) {
    case "NEW":
      return { label: "NEW – niekontaktowany", variant: "outline" };
    case "CONTACTED":
      return { label: "CONTACTED – kontakt nawiązany", variant: "secondary" };
    case "TALK_DONE":
      return { label: "TALK_DONE – rozmowa odbyta", variant: "secondary" };
    case "OFFER_SENT":
      return { label: "OFFER_SENT – oferta wysłana", variant: "success" };
  }
}

function contactStageSortKey(stage: AuditContactStage): number {
  switch (stage) {
    case "NEW":
      return 0;
    case "CONTACTED":
      return 1;
    case "TALK_DONE":
      return 2;
    case "OFFER_SENT":
      return 3;
  }
}

type LeadCrmStatus = "NOWE" | "GOTOWE" | "AUDYT" | "ROI";

function leadStatusLabel(status: LeadCrmStatus): string {
  switch (status) {
    case "NOWE":
      return "Nowe zgłoszenie";
    case "GOTOWE":
      return "Gotowe do audytu";
    case "AUDYT":
      return "Audyt wykonany";
    case "ROI":
      return "ROI do omówienia";
  }
}

type SimplifiedLeadBadgeStatus = "NEW" | "READY" | "AUDIT_DONE";

function simplifiedLeadBadge(status: SimplifiedLeadBadgeStatus): {
  label: string;
  variant: "outline" | "secondary" | "success";
} {
  switch (status) {
    case "NEW":
      return { label: "Nowe", variant: "outline" };
    case "READY":
      return { label: "Gotowe do audytu", variant: "secondary" };
    case "AUDIT_DONE":
      return { label: "Audyt wykonany", variant: "success" };
  }
}

type LeadCrmFilter = "ALL" | "NOWE" | "GOTOWE" | "ROI";

type LeadPriority = "Niski" | "Średni" | "Wysoki";
type LeadPrioritySortKey = 1 | 2 | 3;

function leadPriority(params: { yearlyLoss: number | null; lossPercent: number | null }): {
  label: LeadPriority;
  sortKey: LeadPrioritySortKey;
  variant: "outline" | "secondary" | "warning";
} {
  const yearlyLoss = params.yearlyLoss;
  const lossPercent = params.lossPercent;

  const hasYearlyLoss = typeof yearlyLoss === "number" && Number.isFinite(yearlyLoss);
  const hasLossPercent = typeof lossPercent === "number" && Number.isFinite(lossPercent);

  const isHigh =
    (hasYearlyLoss && yearlyLoss > 4000) ||
    (hasLossPercent && lossPercent > 50);

  if (isHigh) return { label: "Wysoki", sortKey: 3, variant: "warning" };

  const isMedium = hasYearlyLoss && yearlyLoss >= 1500 && yearlyLoss <= 4000;
  if (isMedium) return { label: "Średni", sortKey: 2, variant: "secondary" };

  return { label: "Niski", sortKey: 1, variant: "outline" };
}

type LeadStatusCode = "NEW" | "READY_FOR_AUDIT" | "AUDIT_REQUESTED" | "AUDIT_DONE";

function leadStatusCode(params: {
  auditStatus: AuditStatus | null;
  auditRequestStatus: AuditRequestStatus | null;
  hasAuditDoneVariants: boolean;
  hasContext: boolean;
}): LeadStatusCode {
  const { auditStatus, auditRequestStatus, hasAuditDoneVariants, hasContext } = params;

  if (hasAuditDoneVariants) return "AUDIT_DONE";
  if (auditStatus === "NEW") return "NEW";
  if (auditStatus === "READY_FOR_AUDIT") return "READY_FOR_AUDIT";
  if (auditStatus === "AUDIT_REQUESTED") return "AUDIT_REQUESTED";

  if (auditRequestStatus === "REQUESTED") return "AUDIT_REQUESTED";
  return hasContext ? "NEW" : "NEW";
}

function leadStatusBadgeVariant(status: LeadStatusCode): "outline" | "secondary" | "success" {
  switch (status) {
    case "NEW":
      return "outline";
    case "READY_FOR_AUDIT":
    case "AUDIT_REQUESTED":
      return "secondary";
    case "AUDIT_DONE":
      return "success";
  }
}

type AuditRequestsView =
  | { hasAny: false }
  | {
      hasAny: true;
      isPartial: boolean;
      yearlyLoss: number | null;
      monthlyLoss: number | null;
      lossPercent: number | null;
    };

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

function paybackMonthsLabel(params: {
  yearlyLoss: number | null;
  potential: LossReductionPotential;
  model: "A" | "B" | "C";
}): string | null {
  const { yearlyLoss, potential, model } = params;
  if (typeof yearlyLoss !== "number" || !Number.isFinite(yearlyLoss) || yearlyLoss <= 0) return null;

  const { minPct, maxPct } = reductionRange(potential);

  // UI-only heurystyka: czas zwrotu zależy od skali strat oraz potencjału redukcji,
  // bez wprowadzania jakichkolwiek cen/kwot audytu.
  const baseMonths = yearlyLoss < 3_000 ? 8 : yearlyLoss < 12_000 ? 4 : 2;

  const modelFactor = model === "A" ? 1.25 : model === "B" ? 1.0 : 0.85;

  // Im większy potencjał redukcji, tym krótszy zwrot.
  const monthsBest = Math.max(1, Math.round(baseMonths * modelFactor * (0.25 / maxPct)));
  const monthsWorst = Math.max(monthsBest, Math.round(baseMonths * modelFactor * (0.35 / minPct)));

  const minOut = Math.min(24, Math.max(1, Math.min(monthsBest, monthsWorst)));
  const maxOut = Math.min(24, Math.max(1, Math.max(monthsBest, monthsWorst)));

  return `${minOut}–${maxOut} miesięcy`;
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

function investmentCharacterLabel(level: CostLevel): string {
  switch (level) {
    case "niski":
      return "niska";
    case "sredni":
      return "średnia";
    case "wysoki":
      return "wysoka";
  }
}

function roiPaybackDescriptor(cost: CostLevel, potential: LossReductionPotential): string {
  if (potential === "40-60" && cost === "niski") return "krótki okres zwrotu (ok. 1–2 lata)";
  if (potential === "20-40" && cost === "sredni") return "średni okres zwrotu (ok. 3–5 lat)";
  if (potential === "10-20" && cost === "wysoki") return "długoterminowa inwestycja (powyżej 5 lat)";

  // Fallback: opisowo i neutralnie dla pozostałych kombinacji.
  return "średni okres zwrotu (ok. 3–5 lat)";
}

function formatPL(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function toFiniteNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const normalized = v.trim().replace(/\s+/g, "").replace(",", ".");
    if (!normalized) return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function safeParseContextObject(obj: unknown): ResidentCwuAuditContext | null {
  if (!obj || typeof obj !== "object") return null;
  const parsed = obj as Partial<ResidentCwuAuditContext>;

  const inputs = parsed.inputs as ResidentReportInput | undefined;
  const result = parsed.result as ResidentReportResult | undefined;
  if (!inputs || !result) return null;

  if (toFiniteNumber((inputs as any).monthlyConsumption) === null) return null;
  if (toFiniteNumber((inputs as any).cwuPriceFromBill) === null) return null;

  if (toFiniteNumber((result as any).theoreticalCostPerM3) === null) return null;
  if (toFiniteNumber((result as any).lossPerM3) === null) return null;
  if (toFiniteNumber((result as any).yearlyFinancialLoss) === null) return null;

  return { inputs, result };
}

function safeParseContext(raw: string | null): ResidentCwuAuditContext | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return safeParseContextObject(parsed);
  } catch {
    return null;
  }
}

function safeParseContextsFromRaw(raw: string | null): ResidentCwuAuditContext[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map(safeParseContextObject).filter((x): x is ResidentCwuAuditContext => Boolean(x));
    }
    const one = safeParseContextObject(parsed);
    return one ? [one] : [];
  } catch {
    return [];
  }
}

function collectResidentContextsFromLocalStorage(storage: Storage): ResidentCwuAuditContext[] {
  const keys = Object.keys(storage);
  const ctxKeys = keys
    .filter(
      (k) =>
        k === STORAGE_KEY ||
        k.startsWith(`${STORAGE_KEY}:`) ||
        k.startsWith(`${STORAGE_KEY}_`) ||
        k.startsWith(`${STORAGE_KEY}-`)
    )
    .sort();

  const out: ResidentCwuAuditContext[] = [];
  for (const key of ctxKeys) {
    const raw = storage.getItem(key);
    out.push(...safeParseContextsFromRaw(raw));
  }
  return out;
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

function AudytorPageInner() {
  const searchParams = useSearchParams();
  const auditTokenParam = (searchParams?.get("auditToken") ?? "").trim() || null;
  const [isAuditorMode, setIsAuditorMode] = useState(false);

  const [ctx, setCtx] = useState<ResidentCwuAuditContext | null>(null);
  const [auditRequestStatus, setAuditRequestStatus] = useState<AuditRequestStatus | null>(null);
  const [auditStatus, setAuditStatus] = useState<AuditStatus | null>(null);
  const [auditOrderStatus, setAuditOrderStatus] = useState<AuditOrderStatus | null>(null);
  const [auditAgreementStatus, setAuditAgreementStatus] = useState<AuditAgreementStatus | null>(null);
  const [roiModelInterestStatus, setRoiModelInterestStatus] = useState<RoiModelInterestStatus | null>(null);
  const [leadFilter, setLeadFilter] = useState<LeadCrmFilter>("ALL");
  const [leadCreatedAtFallback] = useState<number>(() => Date.now());
  const [leadSort, setLeadSort] = useState<"PRIORITY" | "YEARLY_LOSS" | "LOSS_PERCENT">("PRIORITY");
  const [hasVariantsInStorage, setHasVariantsInStorage] = useState(false);
  const [contactStage, setContactStage] = useState<AuditContactStage>("NEW");
  const [decisionStage, setDecisionStage] = useState<AuditDecisionStage | null>(null);

  const [auditAgreementAccepted, setAuditAgreementAccepted] = useState(false);
  const [assessment, setAssessment] = useState<TechnicalAssessment>(DEFAULT_TECH_ASSESSMENT);
  const [assessmentHydrated, setAssessmentHydrated] = useState(false);
  const [assessmentSavedAtISO, setAssessmentSavedAtISO] = useState<string | null>(null);

  const [variants, setVariants] = useState<AuditVariantsState>(DEFAULT_VARIANTS);
  const [variantsHydrated, setVariantsHydrated] = useState(false);
  const [variantsSavedAtISO, setVariantsSavedAtISO] = useState<string | null>(null);

  const [managerReportOpen, setManagerReportOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const expected = (window.localStorage.getItem(STORAGE_KEY_AUDIT_TOKEN) ?? "").trim();
      const provided = (auditTokenParam ?? "").trim();
      const valid = Boolean(provided) && Boolean(expected) && provided === expected;
      setIsAuditorMode(valid);
    } catch {
      setIsAuditorMode(false);
    }
  }, [auditTokenParam]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) {
      setCtx(null);
      setAuditRequestStatus(null);
      setAuditStatus(null);
      setAuditOrderStatus(null);
      setAuditAgreementStatus(null);
      setRoiModelInterestStatus(null);
      setContactStage("NEW");
      setDecisionStage(null);
      return;
    }

    const fromStorage = safeParseContext(window.localStorage.getItem(STORAGE_KEY));
    setCtx(fromStorage);

    const request = window.localStorage.getItem(STORAGE_KEY_AUDIT_REQUEST);
    setAuditRequestStatus(request === "REQUESTED" ? "REQUESTED" : null);

    const status = window.localStorage.getItem(STORAGE_KEY_AUDIT_STATUS);
    setAuditStatus(
      status === "NEW" || status === "READY_FOR_AUDIT" || status === "AUDIT_REQUESTED" ? status : null
    );

    const order = window.localStorage.getItem(STORAGE_KEY_AUDIT_ORDER);
    setAuditOrderStatus(order === "REQUESTED" ? "REQUESTED" : null);

    try {
      const rawDecision = (window.localStorage.getItem(STORAGE_KEY_AUDIT_ORDER) ?? "").trim();
      const parsedDecision: AuditDecisionStage | null =
        rawDecision === "CONTACTED" ||
        rawDecision === "OFFER_SENT" ||
        rawDecision === "DECISION_PENDING" ||
        rawDecision === "ACCEPTED" ||
        rawDecision === "REJECTED"
          ? rawDecision
          : null;
      setDecisionStage(parsedDecision);
    } catch {
      setDecisionStage(null);
    }

    const agreement = window.localStorage.getItem(STORAGE_KEY_AUDIT_AGREEMENT);
    setAuditAgreementStatus(agreement === "ACCEPTED" ? "ACCEPTED" : null);

    const roiInterest = window.localStorage.getItem(STORAGE_KEY_ROI_MODEL_INTEREST);
    setRoiModelInterestStatus(roiInterest === "EXPRESSED" ? "EXPRESSED" : null);

    try {
      const rawStage = (window.localStorage.getItem(STORAGE_KEY_AUDIT_CONTACT_STAGE) ?? "").trim();
      const parsed: AuditContactStage =
        rawStage === "CONTACTED" || rawStage === "TALK_DONE" || rawStage === "OFFER_SENT" || rawStage === "NEW"
          ? rawStage
          : "NEW";
      setContactStage(parsed);
      if (!rawStage) {
        window.localStorage.setItem(STORAGE_KEY_AUDIT_CONTACT_STAGE, parsed);
      }
    } catch {
      setContactStage("NEW");
    }
  }, [isAuditorMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_AUDIT_CONTACT_STAGE, contactStage);
    } catch {
      // UI-only
    }
  }, [contactStage, isAuditorMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) return;
    if (!decisionStage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_AUDIT_ORDER, decisionStage);
    } catch {
      // UI-only
    }
  }, [decisionStage, isAuditorMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) return;
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key !== STORAGE_KEY_AUDIT_ORDER) return;
      const raw = (e.newValue ?? "").trim();
      const parsed: AuditDecisionStage | null =
        raw === "CONTACTED" || raw === "OFFER_SENT" || raw === "DECISION_PENDING" || raw === "ACCEPTED" || raw === "REJECTED"
          ? raw
          : null;
      setDecisionStage(parsed);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuditorMode]);

  useEffect(() => {
    setAuditAgreementAccepted(false);
  }, [auditOrderStatus]);

  const crmLeads = useMemo(() => {
    if (!isAuditorMode) return [] as Array<{
      id: string;
      createdAtMs: number;
      status: LeadStatusCode;
      contactStage: AuditContactStage;
      decisionStage: AuditDecisionStage | null;
      yearlyLoss: number | null;
      lossPercent: number | null;
      yearlySavingsMin: number | null;
      yearlySavingsMax: number | null;
      priority: { label: LeadPriority; sortKey: LeadPrioritySortKey; variant: "outline" | "secondary" | "warning" };
    }>;

    // Źródła: tylko residentCwuAuditContext / residentCwuAuditStatus / residentCwuAuditRequest / cwuAuditVariants
    const hasContext = Boolean(ctx);
    const yearlyLoss = hasContext ? Math.max(0, Number(ctx!.result.yearlyFinancialLoss) || 0) : null;
    const hasYearlyLoss = yearlyLoss !== null && Number.isFinite(yearlyLoss) && yearlyLoss > 0;

    const lossPercent = (() => {
      if (!hasContext) return null;
      const lossGJ = Math.max(0, Number((ctx!.result as any).energyLossPerM3) || 0);
      const usefulGJ = Math.max(0, Number((ctx!.result as any).energyPerM3) || 0);
      const total = lossGJ + usefulGJ;
      if (!Number.isFinite(total) || total <= 0) return null;
      const pct = (lossGJ / total) * 100;
      return Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : null;
    })();

    const hasAuditDoneVariants = (Object.values(variants) as AuditVariant[]).some(
      (v) => v.scopeDescription.trim().length > 0
    );

    const status = leadStatusCode({
      auditStatus,
      auditRequestStatus,
      hasAuditDoneVariants,
      hasContext,
    });

    const priority = leadPriority({ yearlyLoss: hasYearlyLoss ? (yearlyLoss as number) : null, lossPercent });

    const yearlySavings = (() => {
      // Widełki oszczędności liczymy tylko, jeśli istnieje localStorage.cwuAuditVariants (bez domyślnych założeń).
      if (!hasVariantsInStorage) return { min: null as number | null, max: null as number | null };
      if (!hasYearlyLoss) return { min: null as number | null, max: null as number | null };
      const selectedKey = selectedVariantKeyFromState(variants);
      const selected = variants[selectedKey];
      const { minPct, maxPct } = reductionRange(selected.lossReductionPotential);
      return {
        min: Math.max(0, Math.round((yearlyLoss as number) * minPct)),
        max: Math.max(0, Math.round((yearlyLoss as number) * maxPct)),
      };
    })();

    const createdAtMs = leadCreatedAtFallback;

    const leads = [
      {
        id: "resident",
        createdAtMs,
        status,
        contactStage,
        decisionStage,
        yearlyLoss: hasYearlyLoss ? (yearlyLoss as number) : null,
        lossPercent,
        yearlySavingsMin: yearlySavings.min,
        yearlySavingsMax: yearlySavings.max,
        priority,
      },
    ];

    return leads;
  }, [auditRequestStatus, auditStatus, contactStage, ctx, decisionStage, hasVariantsInStorage, isAuditorMode, leadCreatedAtFallback, variants]);

  const crmLeadsSorted = useMemo(() => {
    const copy = [...crmLeads];

    const byContactStageAsc = (a: { contactStage: AuditContactStage }, b: { contactStage: AuditContactStage }) =>
      contactStageSortKey(a.contactStage) - contactStageSortKey(b.contactStage);

    const byYearlyLossDesc = (a: { yearlyLoss: number | null }, b: { yearlyLoss: number | null }) =>
      (b.yearlyLoss ?? -Infinity) - (a.yearlyLoss ?? -Infinity);

    const byLossPercentDesc = (a: { lossPercent: number | null }, b: { lossPercent: number | null }) =>
      (b.lossPercent ?? -Infinity) - (a.lossPercent ?? -Infinity);

    if (leadSort === "YEARLY_LOSS") {
      copy.sort((a, b) => {
        const st = byContactStageAsc(a, b);
        if (st !== 0) return st;
        return byYearlyLossDesc(a, b);
      });
      return copy;
    }

    if (leadSort === "LOSS_PERCENT") {
      copy.sort((a, b) => {
        const st = byContactStageAsc(a, b);
        if (st !== 0) return st;
        return byLossPercentDesc(a, b);
      });
      return copy;
    }

    // Domyślnie: etap kontaktu (NEW→...), następnie priorytet (Wysoki→Niski) i w ramach tego strata malejąco.
    copy.sort((a, b) => {
      const st = byContactStageAsc(a, b);
      if (st !== 0) return st;
      const pr = b.priority.sortKey - a.priority.sortKey;
      if (pr !== 0) return pr;
      return byYearlyLossDesc(a, b);
    });
    return copy;
  }, [crmLeads, leadSort]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) {
      setAssessment(DEFAULT_TECH_ASSESSMENT);
      setAssessmentHydrated(false);
      return;
    }

    const fromStorage = safeParseAssessment(window.localStorage.getItem(STORAGE_KEY_TECH_ASSESSMENT));
    setAssessment(fromStorage ?? DEFAULT_TECH_ASSESSMENT);
    setAssessmentHydrated(true);
  }, [isAuditorMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) {
      setVariants(DEFAULT_VARIANTS);
      setVariantsHydrated(false);
      setHasVariantsInStorage(false);
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY_VARIANTS);
    setHasVariantsInStorage(Boolean(raw && raw.trim().length > 0));

    const fromStorage = safeParseVariants(raw);
    setVariants(fromStorage ?? DEFAULT_VARIANTS);
    setVariantsHydrated(true);
  }, [isAuditorMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) return;
    if (!assessmentHydrated) return;

    window.localStorage.setItem(STORAGE_KEY_TECH_ASSESSMENT, JSON.stringify(assessment));
    setAssessmentSavedAtISO(new Date().toISOString());
  }, [assessment, assessmentHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuditorMode) return;
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

  const auditPotentialView = useMemo(() => {
    if (!view) return null;

    const yearlyLoss = Number(view.yearlyFinancialLoss);
    if (!Number.isFinite(yearlyLoss)) return null;

    const selectedKey = selectedVariantKeyFromState(variants);
    const selected = variants[selectedKey];

    return {
      yearlyLoss: Math.max(0, yearlyLoss),
      savingsRangeLabel: potentialLabel(selected.lossReductionPotential),
      investmentCharacter: investmentCharacterLabel(selected.costLevel),
    };
  }, [variants, view]);

  const auditRequestsView: AuditRequestsView = useMemo(() => {
    if (!auditRequestStatus) return { hasAny: false };

    // Mamy sygnał operacyjny „REQUESTED”, ale dane zgłoszenia mogą być niekompletne.
    if (!view) {
      return {
        hasAny: true,
        isPartial: true,
        yearlyLoss: null,
        monthlyLoss: null,
        lossPercent: null,
      };
    }

    const yearlyLoss = Number(view.yearlyFinancialLoss);
    const monthlyLoss = Number(ctx?.result?.monthlyFinancialLoss);
    const lossPercent = Number(view.lossPercent);

    const yearlyLossSafe = Number.isFinite(yearlyLoss) ? Math.max(0, yearlyLoss) : null;
    const monthlyLossSafe = Number.isFinite(monthlyLoss) ? Math.max(0, monthlyLoss) : null;
    const lossPercentSafe = Number.isFinite(lossPercent) ? Math.min(100, Math.max(0, lossPercent)) : null;

    return {
      hasAny: true,
      isPartial: yearlyLossSafe === null,
      yearlyLoss: yearlyLossSafe,
      monthlyLoss: monthlyLossSafe,
      lossPercent: lossPercentSafe,
    };
  }, [auditRequestStatus, ctx, view]);

  const roiView = useMemo(() => {
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

    return {
      selectedKey,
      yearlySavingsLabel: `~${formatPLN(minSafe)} – ${formatPLN(maxSafe)} zł/rok`,
      investmentCharacter: investmentCharacterLabel(selected.costLevel),
      paybackLabel: roiPaybackDescriptor(selected.costLevel, selected.lossReductionPotential),
    };
  }, [variants, view]);

  const efficiencyView = useMemo(() => {
    if (!isAuditorMode) return null;

    const contexts = (() => {
      try {
        if (typeof window === "undefined") return [] as ResidentCwuAuditContext[];
        return collectResidentContextsFromLocalStorage(window.localStorage);
      } catch {
        return [] as ResidentCwuAuditContext[];
      }
    })();

    const totalCount = contexts.length;
    const totalYearlyLoss = contexts
      .map((c) => toFiniteNumber((c.result as any).yearlyFinancialLoss))
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0)
      .reduce((acc, n) => acc + n, 0);

    const hasReady =
      auditRequestStatus === "REQUESTED" || auditStatus === "READY_FOR_AUDIT" || auditStatus === "AUDIT_REQUESTED";

    const offersStage: AuditDecisionStage[] = ["OFFER_SENT", "DECISION_PENDING", "ACCEPTED", "REJECTED"];
    const offersSent = decisionStage !== null && offersStage.includes(decisionStage);

    const readyCount = hasReady ? totalCount : 0;
    const auditsDoneCount = offersSent ? totalCount : 0;
    const offersSentCount = offersSent ? totalCount : 0;
    const positiveCount = decisionStage === "ACCEPTED" ? totalCount : 0;

    // MVP: widełki oszczędności szacunkowo na bazie strat (bez wariantów/zakresu z audytu).
    const savingsMin = Math.max(0, Math.round(totalYearlyLoss * 0.1));
    const savingsMax = Math.max(0, Math.round(totalYearlyLoss * 0.4));
    const savingsMinSafe = Math.min(savingsMin, savingsMax);
    const savingsMaxSafe = Math.max(savingsMin, savingsMax);

    const offersRatePct = totalCount > 0 ? (offersSentCount / totalCount) * 100 : 0;
    const decisionWinRatePct = offersSentCount > 0 ? (positiveCount / offersSentCount) * 100 : 0;

    return {
      totalCount,
      readyCount,
      auditsDoneCount,
      offersSentCount,
      positiveCount,
      totalYearlyLoss,
      savingsMin: savingsMinSafe,
      savingsMax: savingsMaxSafe,
      offersRatePct,
      decisionWinRatePct,
    };
  }, [auditRequestStatus, auditStatus, decisionStage, isAuditorMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100">Panel Audytora</h1>
            <div className="inline-flex items-center rounded-full border border-slate-400/40 bg-slate-950/40 px-3 py-1 text-xs font-bold tracking-wide text-slate-200">
              {isAuditorMode ? "TRYB AUDYTORA – dostęp autoryzowany" : "TRYB DEMO"}
            </div>
          </div>
          {isAuditorMode ? (
            <p className="text-slate-300">
              Widok roboczy (read-only). Prezentuje kontekst zgłoszenia i dane wejściowe, bez edycji i bez ponownych obliczeń.
            </p>
          ) : (
            <p className="text-slate-300">Widok demonstracyjny — brak danych zgłoszeń.</p>
          )}
        </div>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                  Leady audytowe – priorytet wg strat energii
                </CardTitle>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Kolejność oparta o potencjał finansowy i skalę strat CWU
                </div>
              </div>

              <div className="w-full sm:w-[260px]">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  Sortuj wg
                </div>
                <Select
                  value={leadSort}
                  onValueChange={(v) => {
                    if (v === "PRIORITY" || v === "YEARLY_LOSS" || v === "LOSS_PERCENT") {
                      setLeadSort(v);
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIORITY">Priorytet</SelectItem>
                    <SelectItem value="YEARLY_LOSS">Roczna strata</SelectItem>
                    <SelectItem value="LOSS_PERCENT">% strat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isAuditorMode ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">Tryb DEMO nie prezentuje leadów z localStorage.</div>
            ) : crmLeadsSorted.length === 0 ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Brak danych do priorytetyzacji (wymaga co najmniej residentCwuAuditContext).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      <th className="text-left px-3 py-2">Status</th>
                      <th className="text-left px-3 py-2">Etap kontaktu</th>
                      <th className="text-left px-3 py-2">Etap decyzyjny</th>
                      <th className="text-left px-3 py-2">Roczna strata</th>
                      <th className="text-left px-3 py-2">% strat</th>
                      <th className="text-left px-3 py-2">Potencjał oszczędności</th>
                      <th className="text-left px-3 py-2">Priorytet</th>
                      <th className="text-right px-3 py-2">Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crmLeadsSorted.map((lead) => {
                      const yearlyLossLabel = lead.yearlyLoss !== null ? `~${formatPLN(lead.yearlyLoss)} zł/rok` : "—";
                      const lossPercentLabel = lead.lossPercent !== null ? `~${formatPL(lead.lossPercent, 1)}%` : "—";
                      const savingsLabel =
                        lead.yearlySavingsMin !== null && lead.yearlySavingsMax !== null
                          ? `~${formatPLN(Math.min(lead.yearlySavingsMin, lead.yearlySavingsMax))}–${formatPLN(Math.max(lead.yearlySavingsMin, lead.yearlySavingsMax))} zł/rok`
                          : "—";

                      const stage = contactStageBadge(lead.contactStage);
                      const shouldCallNow = lead.priority.label === "Wysoki" && lead.contactStage === "NEW";
                      const decisionBadge = lead.decisionStage ? decisionStageBadge(lead.decisionStage) : null;

                      return (
                        <tr
                          key={lead.id}
                          className="border-t border-slate-200/60 dark:border-slate-700/60"
                        >
                          <td className="px-3 py-3">
                            <Badge variant={leadStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <Badge variant={stage.variant}>{stage.label}</Badge>
                              {shouldCallNow ? (
                                <Badge variant="warning">DZWOŃ TERAZ – najwyższy potencjał</Badge>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {decisionBadge ? (
                              <Badge variant={decisionBadge.variant} className={decisionBadge.className}>
                                {decisionBadge.label}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                —
                              </Badge>
                            )}
                          </td>
                          <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">
                            {yearlyLossLabel}
                          </td>
                          <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{lossPercentLabel}</td>
                          <td className="px-3 py-3 text-slate-700 dark:text-slate-300">{savingsLabel}</td>
                          <td className="px-3 py-3">
                            <Badge variant={lead.priority.variant}>{lead.priority.label}</Badge>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  try {
                                    const el = document.getElementById("audit-section");
                                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    (el as HTMLElement | null)?.focus?.();
                                  } catch {
                                    // pomijamy
                                  }
                                }}
                              >
                                Otwórz audyt
                              </Button>
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  try {
                                    const el = document.getElementById("audit-report");
                                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                                  } catch {
                                    // pomijamy
                                  }
                                }}
                              >
                                Raport
                              </Button>
                            </div>

                            <div className="mt-2 flex flex-wrap justify-end gap-2">
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setContactStage("CONTACTED");
                                  setDecisionStage((prev) => prev ?? "CONTACTED");
                                }}
                              >
                                Oznacz: Skontaktowano
                              </Button>
                              <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => setContactStage("TALK_DONE")}
                              >
                                Oznacz: Rozmowa odbyta
                              </Button>
                            </div>

                            {lead.decisionStage === "CONTACTED" ? (
                              <div className="mt-2 flex flex-wrap justify-end gap-2">
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                  onClick={() => setDecisionStage("OFFER_SENT")}
                                >
                                  Oznacz: oferta wysłana
                                </Button>
                              </div>
                            ) : lead.decisionStage === "OFFER_SENT" ? (
                              <div className="mt-2 text-right text-sm text-muted-foreground">
                                Oczekuje na decyzję zarządcy
                              </div>
                            ) : lead.decisionStage === "DECISION_PENDING" ? (
                              <div className="mt-2 flex flex-wrap justify-end gap-2">
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                  onClick={() => setDecisionStage("ACCEPTED")}
                                >
                                  Decyzja: TAK
                                </Button>
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                  onClick={() => setDecisionStage("REJECTED")}
                                >
                                  Decyzja: NIE
                                </Button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Zgłoszenia gotowe do audytu</CardTitle>
              <Badge
                variant="outline"
                className="border-slate-300/60 text-slate-700 dark:border-slate-600/60 dark:text-slate-200"
              >
                Oczekuje na audyt techniczny
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!isAuditorMode ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">Brak zgłoszeń gotowych do audytu.</p>
            ) : !auditRequestsView.hasAny ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">Brak zgłoszeń gotowych do audytu.</p>
            ) : (
              <div className="space-y-6">
                {auditRequestsView.isPartial ? (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Dane częściowe – do uzupełnienia audytem
                    </span>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Kontekst zgłoszenia</div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Źródło</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">zgłoszenie mieszkańca</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Analiza</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">straty CWU – orientacyjna</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Charakter danych</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">szacunkowe, do weryfikacji technicznej</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Kluczowe liczby (orientacyjne)
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Roczna strata finansowa</div>
                      <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {auditRequestsView.hasAny && !auditRequestsView.isPartial && auditRequestsView.yearlyLoss !== null
                          ? `~${formatPLN(auditRequestsView.yearlyLoss)} zł/rok`
                          : "—"}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Procent strat</div>
                      <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {auditRequestsView.hasAny && !auditRequestsView.isPartial && auditRequestsView.lossPercent !== null
                          ? `~${formatPL(auditRequestsView.lossPercent, 0)}%`
                          : "—"}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Miesięczna strata</div>
                      <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {auditRequestsView.hasAny && !auditRequestsView.isPartial && auditRequestsView.monthlyLoss !== null
                          ? `~${formatPLN(auditRequestsView.monthlyLoss)} zł/miesiąc`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Znaczenie dla zarządcy</div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Skala strat uzasadnia wykonanie audytu technicznego oraz analizę wariantów modernizacji instalacji CWU.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
              Opłacalność i czas zwrotu inwestycji (ROI)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!roiView ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Brak danych do wyznaczenia ROI</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                    <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Szacowana oszczędność roczna</div>
                    <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {roiView.yearlySavingsLabel}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Dla wariantu {roiView.selectedKey} (widełki orientacyjne)</div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                    <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Charakter inwestycji</div>
                    <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">{roiView.investmentCharacter}</div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                    <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Opisowy czas zwrotu</div>
                    <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">{roiView.paybackLabel}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Rekomendacja</div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Z punktu widzenia koszt–efekt wariant jest potencjalnie uzasadniony do dalszych analiz.
                  </p>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wartości orientacyjne. Dokładne ROI wymaga projektu i ofert wykonawczych.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
              Potencjał audytu – dane ze zgłoszenia mieszkańca
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!auditPotentialView ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Brak danych zgłoszenia</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Roczna strata finansowa CWU
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    ~{formatPLN(auditPotentialView.yearlyLoss)} <span className="text-base font-bold">zł/rok</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Możliwa oszczędność roczna (orientacyjnie)
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {auditPotentialView.savingsRangeLabel}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                  <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Charakter inwestycji
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                    {auditPotentialView.investmentCharacter}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isAuditorMode ? (
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Widok demonstracyjny — brak danych zgłoszeń</CardTitle>
              <div className="text-sm text-slate-600 dark:text-slate-400">Tryb UI-only. W tym trybie nie odczytujemy danych z localStorage.</div>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300">
              <p className="text-sm">Pełny widok jest dostępny wyłącznie z tokenem przekazanym w linku wygenerowanym po stronie mieszkańca.</p>
            </CardContent>
          </Card>
        ) : null}

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
                  {isAuditorMode
                    ? (
                        <>
                          Ten widok oczekuje, że dane zostaną dostarczone w stanie aplikacji (np. przez localStorage) w kluczu: <span className="font-mono">{STORAGE_KEY}</span>.
                        </>
                      )
                    : (
                        <>
                          Tryb DEMO: dane zgłoszenia nie są wczytywane z localStorage.
                        </>
                      )}
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
            {!isAuditorMode ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Sekcja zablokowana w trybie DEMO.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Tryb DEMO nie korzysta z danych zgłoszenia i nie prezentuje kosztów/efektów.</p>
              </div>
            ) : !effectsView ? (
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
            {!isAuditorMode ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Sekcja zablokowana w trybie DEMO.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">W trybie demonstracyjnym warianty nie są dostępne i nie zapisujemy ich do localStorage.</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        <Card id="audit-section" tabIndex={-1} className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
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
            {!isAuditorMode ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Sekcja zablokowana w trybie DEMO.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Tryb demonstracyjny nie prezentuje opłacalności ani oszczędności.</p>
              </div>
            ) : !profitabilityView ? (
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

        <Card id="audit-report" className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Podsumowanie do przekazania zarządcy</CardTitle>
            <div className="text-sm text-slate-600 dark:text-slate-400">Treść raportowa (UI-only), bez backendu</div>
          </CardHeader>
          <CardContent>
            {!isAuditorMode ? (
              <div className="text-slate-700 dark:text-slate-300">
                <p className="font-semibold">Sekcja zablokowana w trybie DEMO.</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Tryb demonstracyjny nie generuje podsumowania i raportu.</p>
              </div>
            ) : !managerSummaryView ? (
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

            {isAuditorMode ? (
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="self-start"
                  onClick={() => {
                    setManagerReportOpen(true);
                    try {
                      if (typeof window !== "undefined") {
                        // UI-only: wykorzystaj drukowanie przeglądarki (Zapisz jako PDF).
                        setTimeout(() => window.print(), 150);
                      }
                    } catch {
                      // pomijamy
                    }
                  }}
                >
                  Pobierz raport PDF
                </Button>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Po wygenerowaniu widoku raportu możesz użyć drukowania w przeglądarce (Ctrl+P) i zapisać jako PDF.
                </div>
              </div>
            ) : null}

            {isAuditorMode && managerReportOpen ? (
              <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-6 text-black dark:bg-white dark:text-black dark:border-slate-300">
                <style>{`\
@media print {\
  .cwu-report-page {\
    padding-bottom: 64px;\
  }\
  .cwu-report-footer {\
    display: block;\
    position: fixed;\
    left: 0;\
    right: 0;\
    bottom: 0;\
    padding: 10px 24px;\
    border-top: 1px solid #d1d5db;\
    background: #ffffff;\
    color: #111827;\
    font-size: 10px;\
  }\
}\
`}</style>

                <div className="cwu-report-page space-y-5">
                  {/* Branding audytora */}
                  <div className="border-b border-slate-200 pb-4">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-1">
                        <div className="text-sm font-bold">Audytor CWU</div>
                        <div className="text-xs text-slate-700">Nr uprawnień/certyfikatu: CWU-0000 (tekst statyczny)</div>
                      </div>
                      <div className="text-xs text-slate-700 text-right">
                        Data wygenerowania: {new Date().toLocaleDateString("pl-PL")}
                      </div>
                    </div>
                    <div className="mt-3 text-2xl font-extrabold tracking-tight">Raport orientacyjny – analiza strat CWU</div>
                    <div className="mt-1 text-sm text-slate-700">
                      Dokument do druku (czarno-biały). Dane orientacyjne, bez backendu i bez ponownych obliczeń.
                    </div>
                  </div>

                  {/* 1) Podsumowanie strat (wyniki) */}
                  <div>
                    <div className="text-sm font-bold">Podsumowanie strat (wyniki)</div>
                    <div className="mt-2 grid sm:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-700">Strata roczna CWU</div>
                        <div className="font-semibold">
                          {managerReportView.yearlyLoss !== null ? `${formatPLN(managerReportView.yearlyLoss)} zł/rok` : "—"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-700">Strata miesięczna</div>
                        <div className="font-semibold">
                          {ctx?.result?.monthlyFinancialLoss !== undefined
                            ? `~${formatPLN(Math.max(0, Number(ctx.result.monthlyFinancialLoss) || 0))} zł/miesiąc`
                            : "—"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-slate-700">Procent strat</div>
                        <div className="font-semibold">{view ? `~${formatPL(view.lossPercent, 0)}%` : "—"}</div>
                      </div>
                    </div>
                  </div>

                  {/* 2) Warianty działań */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-sm font-bold">Warianty działań</div>
                    <div className="mt-2 grid md:grid-cols-3 gap-3 text-sm">
                      {(["A", "B", "C"] as const).map((k) => {
                        const v = variants[k];
                        return (
                          <div key={k} className="border border-slate-200 rounded-xl p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">Wariant {k}</div>
                              <div className="text-xs text-slate-700">{k === managerReportView.selectedKey ? "wybrany" : ""}</div>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-slate-700">Koszt (opisowo)</div>
                                <div className="font-semibold">{costLevelLabel(v.costLevel)}</div>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-slate-700">Potencjał redukcji</div>
                                <div className="font-semibold">{potentialLabel(v.lossReductionPotential)}</div>
                              </div>
                              <div className="mt-2 text-xs text-slate-700">
                                Zakres: {v.scopeDescription.trim().length > 0 ? v.scopeDescription.trim() : "—"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3) Szacunkowe koszty i oszczędności */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-sm font-bold">Szacunkowe koszty i oszczędności</div>
                    {!effectsView ? (
                      <div className="mt-2 text-sm text-slate-700">Brak danych do wyznaczenia efektów finansowych.</div>
                    ) : (
                      <div className="mt-2 grid md:grid-cols-3 gap-3 text-sm">
                        {(["A", "B", "C"] as const).map((k) => {
                          const row = effectsView[k];
                          return (
                            <div key={k} className="border border-slate-200 rounded-xl p-3">
                              <div className="font-semibold">Wariant {k}</div>
                              <div className="mt-1 text-xs text-slate-700">Koszt: {row.cost}</div>
                              <div className="mt-1 text-xs text-slate-700">Oszczędność: {row.effectLabel}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 4) ROI / czas zwrotu */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-sm font-bold">ROI / czas zwrotu</div>
                    {!view ? (
                      <div className="mt-2 text-sm text-slate-700">Brak danych do wyznaczenia ROI.</div>
                    ) : (
                      <div className="mt-2 grid md:grid-cols-3 gap-3 text-sm">
                        {(["A", "B", "C"] as const).map((k) => {
                          const v = variants[k];
                          const yearlyLoss = Math.max(0, Number(view.yearlyFinancialLoss) || 0);
                          const { minPct, maxPct } = reductionRange(v.lossReductionPotential);
                          const minS = Math.max(0, Math.round(yearlyLoss * minPct));
                          const maxS = Math.max(0, Math.round(yearlyLoss * maxPct));
                          const minSafe = Math.max(0, Math.min(minS, maxS));
                          const maxSafe = Math.max(0, Math.max(minS, maxS));

                          return (
                            <div key={k} className="border border-slate-200 rounded-xl p-3">
                              <div className="font-semibold">Wariant {k}</div>
                              <div className="mt-1 text-xs text-slate-700">Oszczędność: ~{formatPLN(minSafe)}–{formatPLN(maxSafe)} zł/rok</div>
                              <div className="mt-1 text-xs text-slate-700">Charakter inwestycji: {investmentCharacterLabel(v.costLevel)}</div>
                              <div className="mt-1 text-xs text-slate-700">Czas zwrotu: {roiPaybackDescriptor(v.costLevel, v.lossReductionPotential)}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-700">
                      Wartości orientacyjne. Dokładne ROI wymaga projektu i ofert wykonawczych.
                    </div>
                  </div>

                  {/* 5) Podsumowanie dla zarządcy */}
                  <div className="border-t border-slate-200 pt-4">
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

                  {/* Stopka ekranowa (dodatkowo) */}
                  <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-700">
                    Raport ma charakter informacyjny i nie stanowi oferty handlowej. Wdrożenie działań wymaga audytu technicznego i projektu.
                  </div>
                </div>

                <div className="cwu-report-footer">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      Raport ma charakter informacyjny i nie stanowi oferty handlowej. Wdrożenie działań wymaga audytu technicznego i projektu.
                    </div>
                    <div className="whitespace-nowrap">System: CWUv6</div>
                  </div>
                </div>
              </div>
            ) : null}

            {isAuditorMode && managerReportOpen ? (
              <Card className="mt-4 border border-slate-300 bg-white text-black shadow-none dark:bg-white dark:text-black dark:border-slate-300 print:hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Co jest potrzebne, aby przejść do realizacji?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-800">
                    <li>audyt/inwentaryzacja instalacji CWU (układ, średnice, izolacje, armatura, pompy)</li>
                    <li>pomiary i weryfikacja pracy układu (temperatury, przepływy, czasy dojścia, nastawy)</li>
                    <li>analiza techniczna wariantów i dobór zakresu prac wraz z kryteriami odbioru</li>
                    <li>zebranie ofert wykonawczych oraz ocena ryzyk i warunków realizacji</li>
                    <li>decyzja zarządcy/wspólnoty oraz uzgodnienie harmonogramu i odpowiedzialności</li>
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Audyt techniczny CWU – kolejny krok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li>Zakres: pomiary, weryfikacja instalacji, raport techniczny</li>
              <li>Efekt: potwierdzenie strat i wariantu modernizacji</li>
              <li>Podstawa do decyzji zarządcy / wspólnoty</li>
            </ul>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Koszt audytu technicznego (orientacyjnie):</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>mały budynek: X–Y zł</li>
                <li>średni: X–Y zł</li>
                <li>duży: X–Y zł</li>
              </ul>
              <div className="text-xs text-slate-600 dark:text-slate-400">Ostateczna wycena po wstępnej kwalifikacji</div>
            </div>

            {!isAuditorMode ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Sekcja informacyjna. Zapis decyzji jest dostępny w trybie audytora.
              </div>
            ) : auditOrderStatus === "REQUESTED" ? (
              <div className="space-y-1">
                <div className="text-sm font-semibold">Audyt zamówiony – oczekuje na kontakt</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Zgłoszenie audytu zapisane. Skontaktujemy się w celu ustalenia zakresu i terminu.
                </div>
              </div>
            ) : (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    try {
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(STORAGE_KEY_AUDIT_ORDER, "REQUESTED");
                      }
                    } catch {
                      // UI-only: jeśli localStorage jest niedostępny, pomijamy
                    }
                    setAuditOrderStatus("REQUESTED");
                  }}
                >
                  Zleć audyt techniczny
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isAuditorMode && auditOrderStatus === "REQUESTED" ? (
          <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Warunki realizacji audytu technicznego CWU</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>audyt wykonywany przez uprawnionego audytora</li>
                <li>zakres zgodny z analizą CWU i raportem strat</li>
                <li>obejmuje oględziny, pomiary i analizę instalacji</li>
                <li>termin realizacji: orientacyjnie X–Y dni roboczych</li>
                <li>rezultat: raport techniczny PDF z wnioskami</li>
                <li>charakter usługi: doradcza (bez robót wykonawczych)</li>
              </ul>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Koszt</div>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>mały budynek: X–Y zł</li>
                  <li>średni: X–Y zł</li>
                  <li>duży: X–Y zł</li>
                </ul>
                <div className="text-xs text-slate-600 dark:text-slate-400">Dokładna cena po potwierdzeniu danych budynku</div>
              </div>

              {auditAgreementStatus === "ACCEPTED" ? (
                <div className="space-y-2">
                  <Badge variant="secondary">Umowa wstępna – etap organizacyjny</Badge>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Warunki zaakceptowane. Audyt w przygotowaniu.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-slate-900 dark:accent-slate-100"
                      checked={auditAgreementAccepted}
                      onChange={(e) => setAuditAgreementAccepted(e.target.checked)}
                    />
                    <span>Akceptuję warunki realizacji audytu technicznego CWU</span>
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={!auditAgreementAccepted}
                    onClick={() => {
                      try {
                        if (typeof window !== "undefined") {
                          window.localStorage.setItem(STORAGE_KEY_AUDIT_AGREEMENT, "ACCEPTED");
                        }
                      } catch {
                        // UI-only
                      }
                      setAuditAgreementStatus("ACCEPTED");
                    }}
                  >
                    Potwierdź chęć realizacji audytu
                  </Button>

                    {!auditAgreementAccepted ? (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Aby przejść dalej, zaznacz akceptację warunków realizacji audytu technicznego CWU.
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600 dark:text-slate-400">Po potwierdzeniu warunków audyt przechodzi do etapu organizacyjnego.</div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Model rozliczenia i zwrot z inwestycji (ROI)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700 dark:text-slate-300">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Na podstawie wyników audytu możliwe jest rozliczenie wdrożenia w modelu opartym o efekt ekonomiczny,
              co ogranicza ryzyko po stronie wspólnoty / spółdzielni.
            </p>

            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4 space-y-2">
                <div className="font-semibold">A) Model klasyczny</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Audyt: płatny</li>
                  <li>Realizacja: według ofert wykonawców</li>
                  <li>Brak success fee</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4 space-y-2">
                <div className="font-semibold">B) Model mieszany</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Audyt: płatny</li>
                  <li>Realizacja: koszt inwestycji</li>
                  <li>Wynagrodzenie: % oszczędności przez X lat (np. 10–20%)</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4 space-y-2">
                <div className="font-semibold">C) Model success fee</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Audyt: płatny</li>
                  <li>Realizacja: minimalny koszt początkowy</li>
                  <li>Wynagrodzenie: % realnych oszczędności (np. 20–40%)</li>
                  <li>Rozliczenie po wdrożeniu</li>
                </ul>
              </div>
            </div>

            {isAuditorMode && view ? (
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Powiązanie z danymi ROI (orientacyjnie)</div>
                {(() => {
                  const selectedKey = selectedVariantKeyFromState(variants);
                  const selected = variants[selectedKey];
                  const yearlyLoss = Math.max(0, Number(view.yearlyFinancialLoss) || 0);
                  if (!Number.isFinite(yearlyLoss) || yearlyLoss <= 0) return null;
                  const { minPct, maxPct } = reductionRange(selected.lossReductionPotential);
                  const minS = Math.max(0, Math.round(yearlyLoss * minPct));
                  const maxS = Math.max(0, Math.round(yearlyLoss * maxPct));
                  const minSafe = Math.max(0, Math.min(minS, maxS));
                  const maxSafe = Math.max(0, Math.max(minS, maxS));

                  return (
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Potencjalna oszczędność roczna</div>
                        <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                          ~{formatPLN(minSafe)}–{formatPLN(maxSafe)} zł
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Dla wariantu {selectedKey} (widełki orientacyjne)</div>
                      </div>
                      <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30">
                        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Orientacyjny okres zwrotu</div>
                        <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                          {roiPaybackDescriptor(selected.costLevel, selected.lossReductionPotential)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Wartości orientacyjne – do potwierdzenia po audycie i ofertach.
                </div>
              </div>
            ) : null}

            {!isAuditorMode ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Sekcja informacyjna. Zapis decyzji jest dostępny w trybie audytora.
              </div>
            ) : roiModelInterestStatus === "EXPRESSED" ? (
              <div className="space-y-1">
                <div className="text-sm font-semibold">Model rozliczenia ROI – do omówienia z zarządcą</div>
              </div>
            ) : (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    try {
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(STORAGE_KEY_ROI_MODEL_INTEREST, "EXPRESSED");
                      }
                    } catch {
                      // UI-only: jeśli localStorage jest niedostępny, pomijamy
                    }
                    setRoiModelInterestStatus("EXPRESSED");
                  }}
                >
                  Rozważ model rozliczenia oparty o efekt
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Efektywność audytów (podsumowanie)</CardTitle>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Dane orientacyjne – na podstawie aktualnych zgłoszeń CWU
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isAuditorMode ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">Tryb DEMO nie prezentuje metryk z localStorage.</div>
            ) : !efficiencyView ? (
              <div className="text-sm text-slate-600 dark:text-slate-400">Brak danych do podsumowania.</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600 dark:text-slate-400">Liczba zgłoszeń ogółem</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{efficiencyView.totalCount}</div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600 dark:text-slate-400">Zgłoszenia gotowe do audytu</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{efficiencyView.readyCount}</div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600 dark:text-slate-400">Audyty zakończone</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{efficiencyView.auditsDoneCount}</div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600 dark:text-slate-400">Oferty wysłane</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{efficiencyView.offersSentCount}</div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600 dark:text-slate-400">Decyzje pozytywne</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{efficiencyView.positiveCount}</div>
                  </div>
                </div>

                <div className="h-px bg-slate-200/70 dark:bg-slate-700/70" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600 dark:text-slate-400">Łączna roczna strata (zł/rok)</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">~{formatPLN(efficiencyView.totalYearlyLoss)} zł/rok</div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-slate-600 dark:text-slate-400">Potencjalna oszczędność (widełki)</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      ~{formatPLN(efficiencyView.savingsMin)}–{formatPLN(efficiencyView.savingsMax)} zł/rok
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-sm text-slate-600 dark:text-slate-400">
                  {formatPL(efficiencyView.offersRatePct, 0)}% zgłoszeń przeszło do etapu oferty. {formatPL(efficiencyView.decisionWinRatePct, 0)}% ofert zakończyło się decyzją pozytywną.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Model rozliczenia audytu technicznego</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-700 dark:text-slate-300">
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              {(() => {
                const yearlyLoss = view ? Math.max(0, Number(view.yearlyFinancialLoss) || 0) : null;

                const blocks = [
                  {
                    key: "A" as const,
                    title: "A) Audyt podstawowy (ryczałt)",
                    bullets: [
                      "stała opłata",
                      "obejmuje analizę CWU + raport",
                      "bez wdrożenia",
                    ],
                    potential: "10-20" as const,
                  },
                  {
                    key: "B" as const,
                    title: "B) Audyt + wsparcie wdrożeniowe",
                    bullets: [
                      "niższa opłata początkowa",
                      "+ % od uzyskanych oszczędności (orientacyjnie)",
                      "rozliczenie po potwierdzeniu efektów",
                    ],
                    potential: "20-40" as const,
                  },
                  {
                    key: "C" as const,
                    title: "C) Model mieszany (rekomendowany)",
                    bullets: [
                      "niewielka opłata startowa",
                      "success fee zależne od realnych oszczędności",
                      "rozliczenie po potwierdzeniu pomiarami",
                    ],
                    potential: "40-60" as const,
                  },
                ];

                return blocks.map((b) => {
                  const payback = paybackMonthsLabel({
                    yearlyLoss: typeof yearlyLoss === "number" && Number.isFinite(yearlyLoss) && yearlyLoss > 0 ? yearlyLoss : null,
                    potential: b.potential,
                    model: b.key,
                  });

                  return (
                    <div
                      key={b.key}
                      className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4 space-y-2"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{b.title}</div>
                      <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                        {b.bullets.map((txt) => (
                          <li key={txt}>{txt}</li>
                        ))}
                      </ul>

                      {payback ? (
                        <div className="pt-2 text-xs text-slate-600 dark:text-slate-400">
                          Przy tej skali strat audyt zwraca się orientacyjnie w: <span className="font-semibold">{payback}</span>.
                        </div>
                      ) : (
                        <div className="pt-2 text-xs text-slate-600 dark:text-slate-400">
                          Zwrot orientacyjny: wymaga danych o rocznej stracie i potencjale redukcji (po potwierdzeniu pomiarami).
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              Informacja robocza (UI-only). Wartości zwrotu są szacunkowe i służą rozmowie techniczno-decyzyjnej, nie stanowią oferty handlowej.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AudytorPage() {
  return (
    <Suspense fallback={null}>
      <AudytorPageInner />
    </Suspense>
  );
}
