"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ResidentReportInput, ResidentReportResult } from "@/lib/report/types";

type ResidentCwuAuditContext = {
  inputs: ResidentReportInput;
  result: ResidentReportResult;
};

type BuildingStatus = "Brak audytu" | "Audyt w toku" | "Wymaga decyzji";
type RowStatus = "gotowe do audytu" | "po audycie" | "do decyzji";
type LossScale = "niska" | "średnia" | "wysoka";

type AuditRequestStatus = "REQUESTED";
type AuditStatus = "NEW" | "READY_FOR_AUDIT" | "AUDIT_REQUESTED";
type AuditOrderStatus = "REQUESTED" | "CONTACTED" | "OFFER_SENT" | "DECISION_PENDING" | "ACCEPTED" | "REJECTED";
type AuditAgreementStatus = "ACCEPTED";
type RoiModelInterestStatus = "EXPRESSED";

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

function simplifiedStatusForManager(params: {
  auditRequest: AuditRequestStatus | null;
  auditStatus: AuditStatus | null;
  buildingStatus: BuildingStatus;
}): SimplifiedLeadBadgeStatus | null {
  const { auditRequest, auditStatus, buildingStatus } = params;

  // Prezentacyjnie: jeśli są przygotowane warianty (Wymaga decyzji), traktujemy jako „Audyt wykonany”.
  if (buildingStatus === "Wymaga decyzji") return "AUDIT_DONE";

  if (auditStatus === "NEW") return "NEW";

  if (auditRequest === "REQUESTED" || auditStatus === "READY_FOR_AUDIT" || auditStatus === "AUDIT_REQUESTED") {
    return "READY";
  }

  return null;
}

type ManagerRow = {
  id: string;
  source: "zgłoszenie mieszkańca";
  yearlyLoss: number | null;
  lossScale: LossScale;
  status: RowStatus;
};

const STORAGE_KEY_CTX = "residentCwuAuditContext";
const STORAGE_KEY_AUDIT_REQUEST = "residentCwuAuditRequest";
const STORAGE_KEY_AUDIT_STATUS = "residentCwuAuditStatus";
const STORAGE_KEY_AUDIT_ORDER = "residentCwuAuditOrder";
const STORAGE_KEY_AUDIT_AGREEMENT = "residentCwuAuditAgreement";
const STORAGE_KEY_AUDIT_CONTACT_STAGE = "residentCwuAuditContactStage";
const STORAGE_KEY_ROI_MODEL_INTEREST = "residentCwuRoiModelInterest";
const STORAGE_KEY_TECH_ASSESSMENT = "residentCwuTechnicalAssessment";
const STORAGE_KEY_VARIANTS = "cwuAuditVariants";

function formatPLN(value: number | null): string {
  if (value === null) return "—";
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("pl-PL", { maximumFractionDigits: 0 });
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
  const maybe = obj as Partial<ResidentCwuAuditContext>;
  const inputs = maybe.inputs as ResidentReportInput | undefined;
  const result = maybe.result as ResidentReportResult | undefined;
  if (!inputs || !result) return null;

  if (toFiniteNumber((inputs as any).monthlyConsumption) === null) return null;
  if (toFiniteNumber((inputs as any).cwuPriceFromBill) === null) return null;

  if (toFiniteNumber((result as any).theoreticalCostPerM3) === null) return null;
  if (toFiniteNumber((result as any).lossPerM3) === null) return null;
  if (toFiniteNumber((result as any).yearlyFinancialLoss) === null) return null;

  return { inputs, result };
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
    .filter((k) => k === STORAGE_KEY_CTX || k.startsWith(`${STORAGE_KEY_CTX}:`) || k.startsWith(`${STORAGE_KEY_CTX}_`) || k.startsWith(`${STORAGE_KEY_CTX}-`))
    .sort();

  const out: ResidentCwuAuditContext[] = [];
  for (const key of ctxKeys) {
    const raw = storage.getItem(key);
    const parsed = safeParseContextsFromRaw(raw);
    out.push(...parsed);
  }

  return out;
}

function lossScaleFromYearlyLoss(yearlyLoss: number | null): LossScale {
  if (yearlyLoss === null || !Number.isFinite(yearlyLoss) || yearlyLoss <= 0) return "niska";
  if (yearlyLoss < 3_000) return "niska";
  if (yearlyLoss < 12_000) return "średnia";
  return "wysoka";
}

function buildingStatusFromAuditorData(storage: Storage): BuildingStatus {
  const rawAssessment = storage.getItem(STORAGE_KEY_TECH_ASSESSMENT);
  const rawVariants = storage.getItem(STORAGE_KEY_VARIANTS);

  const hasAssessment = (() => {
    if (!rawAssessment) return false;
    try {
      const parsed = JSON.parse(rawAssessment) as any;
      const risk = parsed?.riskLevel;
      const checklist = parsed?.checklist;
      const validRisk = risk === "niska" || risk === "srednia" || risk === "wysoka";
      const validChecklist = checklist && typeof checklist === "object";
      return Boolean(validRisk && validChecklist);
    } catch {
      return false;
    }
  })();

  const hasVariants = (() => {
    if (!rawVariants) return false;
    try {
      const parsed = JSON.parse(rawVariants) as any;
      const A = parsed?.A;
      const B = parsed?.B;
      const C = parsed?.C;
      const hasAnyScope =
        typeof A?.scopeDescription === "string" && A.scopeDescription.trim().length > 0 ||
        typeof B?.scopeDescription === "string" && B.scopeDescription.trim().length > 0 ||
        typeof C?.scopeDescription === "string" && C.scopeDescription.trim().length > 0;
      return Boolean(hasAnyScope);
    } catch {
      return false;
    }
  })();

  if (!hasAssessment && !hasVariants) return "Brak audytu";
  if (hasVariants) return "Wymaga decyzji";
  return "Audyt w toku";
}

function rowStatusFromBuildingStatus(buildingStatus: BuildingStatus): RowStatus {
  switch (buildingStatus) {
    case "Brak audytu":
      return "gotowe do audytu";
    case "Audyt w toku":
      return "po audycie";
    case "Wymaga decyzji":
      return "do decyzji";
  }
}

function badgeVariantForScale(scale: LossScale): "secondary" | "warning" | "destructive" {
  switch (scale) {
    case "niska":
      return "secondary";
    case "średnia":
      return "warning";
    case "wysoka":
      return "destructive";
  }
}

export default function ZarzadcaPage() {
  const [contexts, setContexts] = useState<ResidentCwuAuditContext[]>([]);
  const [auditRequest, setAuditRequest] = useState<AuditRequestStatus | null>(null);
  const [auditStatus, setAuditStatus] = useState<AuditStatus | null>(null);
  const [auditOrder, setAuditOrder] = useState<AuditOrderStatus | null>(null);
  const [auditAgreement, setAuditAgreement] = useState<AuditAgreementStatus | null>(null);
  const [roiModelInterest, setRoiModelInterest] = useState<RoiModelInterestStatus | null>(null);
  const [buildingStatus, setBuildingStatus] = useState<BuildingStatus>("Brak audytu");
  const [hasAuditContactStage, setHasAuditContactStage] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storage = window.localStorage;

      setContexts(collectResidentContextsFromLocalStorage(storage));

      const req = storage.getItem(STORAGE_KEY_AUDIT_REQUEST);
      setAuditRequest(req === "REQUESTED" ? "REQUESTED" : null);

      const status = storage.getItem(STORAGE_KEY_AUDIT_STATUS);
      setAuditStatus(
        status === "NEW" || status === "READY_FOR_AUDIT" || status === "AUDIT_REQUESTED" ? status : null
      );

      const order = storage.getItem(STORAGE_KEY_AUDIT_ORDER);
      const parsedOrder: AuditOrderStatus | null =
        order === "REQUESTED" ||
        order === "CONTACTED" ||
        order === "OFFER_SENT" ||
        order === "DECISION_PENDING" ||
        order === "ACCEPTED" ||
        order === "REJECTED"
          ? order
          : null;

      // UI-only: wejście zarządcy oznacza, że proces decyzyjny został uruchomiony.
      if (parsedOrder === "OFFER_SENT") {
        try {
          storage.setItem(STORAGE_KEY_AUDIT_ORDER, "DECISION_PENDING");
        } catch {
          // pomijamy
        }
        setAuditOrder("DECISION_PENDING");
      } else {
        setAuditOrder(parsedOrder);
      }

      const agreement = storage.getItem(STORAGE_KEY_AUDIT_AGREEMENT);
      setAuditAgreement(agreement === "ACCEPTED" ? "ACCEPTED" : null);

      const roiInterest = storage.getItem(STORAGE_KEY_ROI_MODEL_INTEREST);
      setRoiModelInterest(roiInterest === "EXPRESSED" ? "EXPRESSED" : null);

      setHasAuditContactStage(storage.getItem(STORAGE_KEY_AUDIT_CONTACT_STAGE) !== null);

      setBuildingStatus(buildingStatusFromAuditorData(storage));
    } catch {
      setContexts([]);
      setAuditRequest(null);
      setAuditStatus(null);
      setAuditOrder(null);
      setAuditAgreement(null);
      setRoiModelInterest(null);
      setBuildingStatus("Brak audytu");
      setHasAuditContactStage(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return;
      if (e.key === STORAGE_KEY_AUDIT_ORDER) {
        const raw = (e.newValue ?? "").trim();
        const parsed: AuditOrderStatus | null =
          raw === "REQUESTED" ||
          raw === "CONTACTED" ||
          raw === "OFFER_SENT" ||
          raw === "DECISION_PENDING" ||
          raw === "ACCEPTED" ||
          raw === "REJECTED"
            ? (raw as AuditOrderStatus)
            : null;
        setAuditOrder(parsed);
      }
      if (e.key === STORAGE_KEY_AUDIT_CONTACT_STAGE) {
        setHasAuditContactStage((e.newValue ?? null) !== null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const summary = useMemo(() => {
    const validLosses = contexts
      .map((c) => toFiniteNumber((c.result as any).yearlyFinancialLoss))
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);

    const total = validLosses.reduce((acc, n) => acc + n, 0);

    return {
      count: contexts.length,
      totalYearlyLoss: validLosses.length > 0 ? total : null,
    };
  }, [contexts]);

  const rows: ManagerRow[] = useMemo(() => {
    const baseStatus = rowStatusFromBuildingStatus(buildingStatus);

    // Sygnały operacyjne z warstwy mieszkańca: traktujemy jako „gotowe do audytu”, ale bez nadpisywania decyzji jeśli audyt już istnieje.
    const operationalReady = Boolean(
      auditRequest === "REQUESTED" || auditStatus === "READY_FOR_AUDIT" || auditStatus === "AUDIT_REQUESTED"
    );

    return contexts.map((ctx, idx) => {
      const yearlyLoss = toFiniteNumber((ctx.result as any).yearlyFinancialLoss);
      const lossScale = lossScaleFromYearlyLoss(yearlyLoss);

      const status: RowStatus =
        buildingStatus === "Brak audytu" && operationalReady ? "gotowe do audytu" : baseStatus;

      return {
        id: `${idx + 1}`,
        source: "zgłoszenie mieszkańca",
        yearlyLoss,
        lossScale,
        status,
      };
    });
  }, [auditRequest, auditStatus, buildingStatus, contexts]);

  const hasAnyData = summary.count > 0;

  const portfolioView = useMemo(() => {
    const validLosses = contexts
      .map((c) => toFiniteNumber((c.result as any).yearlyFinancialLoss))
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);

    if (contexts.length === 0 || validLosses.length === 0) {
      return { hasEnough: false as const };
    }

    const totalLoss = validLosses.reduce((acc, n) => acc + n, 0);
    const savingsMin = Math.max(0, Math.round(totalLoss * 0.1));
    const savingsMax = Math.max(0, Math.round(totalLoss * 0.4));

    return {
      hasEnough: true as const,
      count: contexts.length,
      totalLoss,
      savingsMin: Math.min(savingsMin, savingsMax),
      savingsMax: Math.max(savingsMin, savingsMax),
    };
  }, [contexts]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Panel Zarządcy – analiza CWU w budynku</h1>
          <p className="text-sm text-muted-foreground">
            Widok decyzyjny (UI-only). Dane pochodzą wyłącznie z localStorage.
          </p>
        </div>

        {!hasAnyData ? (
          <Card>
            <CardHeader>
              <CardTitle>Brak zgłoszeń do analizy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              W localStorage nie znaleziono żadnych zgłoszeń CWU (residentCwuAuditContext).
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Sekcja 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Podsumowanie zbiorcze</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="text-muted-foreground">Liczba zgłoszeń CWU:</div>
                  <div className="font-medium">{summary.count}</div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="text-muted-foreground">Szacowana łączna strata roczna:</div>
                  <div className="font-medium">{formatPLN(summary.totalYearlyLoss)} zł/rok</div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="text-muted-foreground">Status budynku:</div>
                  <Badge variant="outline">{buildingStatus}</Badge>
                </div>

                {(() => {
                  const simplified = simplifiedStatusForManager({ auditRequest, auditStatus, buildingStatus });
                  if (!simplified) return null;
                  const badge = simplifiedLeadBadge(simplified);

                  return (
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="text-muted-foreground">Zgłoszenie CWU:</div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      {simplified === "NEW" ? (
                        <div className="text-sm text-muted-foreground">Dane zostały wprowadzone przez mieszkańca (etap wstępny).</div>
                      ) : simplified === "READY" ? (
                        <div className="text-sm text-muted-foreground">
                          Dane są gotowe do weryfikacji technicznej (audyt) lub audyt został przygotowany przez mieszkańca.
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Dostępne są materiały poaudytowe do podjęcia decyzji.</div>
                      )}
                    </div>
                  );
                })()}

                {auditOrder === "REQUESTED" ? (
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="text-muted-foreground">Audyt techniczny:</div>
                      <Badge variant="secondary">złożono wniosek</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">Dla części zgłoszeń złożono wniosek o audyt techniczny (etap ofertowy).</div>
                  </div>
                ) : null}

                {auditOrder === "OFFER_SENT" || auditOrder === "DECISION_PENDING" ? (
                  <div className="text-sm text-muted-foreground">
                    Audyt techniczny zakończony. Trwa proces decyzyjny dotyczący realizacji.
                  </div>
                ) : null}

                {auditOrder === "ACCEPTED" ? (
                  <div className="text-sm text-muted-foreground">
                    Podjęto decyzję o realizacji działań modernizacyjnych.
                  </div>
                ) : null}

                {auditOrder === "REJECTED" ? (
                  <div className="text-sm text-muted-foreground">
                    Zarządca nie zdecydował się na realizację w obecnym zakresie.
                  </div>
                ) : null}

                {auditAgreement === "ACCEPTED" ? (
                  <div className="text-sm text-muted-foreground">Audyt techniczny CWU: warunki zaakceptowane (etap organizacyjny).</div>
                ) : null}

                {roiModelInterest === "EXPRESSED" ? (
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="text-muted-foreground">Rozważany model:</div>
                      <Badge variant="secondary">rozliczenie oparte o efekt (ROI)</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Część zgłoszeń posiada potencjał realizacji w modelu opartym o efekt (ROI).
                    </div>
                  </div>
                ) : null}

                {hasAuditContactStage ? (
                  <div className="text-sm text-muted-foreground">Proces audytowy w toku – etap kontaktowy</div>
                ) : null}
              </CardContent>
            </Card>

            {/* Sekcja 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Lista zgłoszeń</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Źródło</TableHead>
                      <TableHead>Skala strat</TableHead>
                      <TableHead>Szacowana strata roczna</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.source}</TableCell>
                        <TableCell>
                          <Badge variant={badgeVariantForScale(r.lossScale)}>{r.lossScale}</Badge>
                        </TableCell>
                        <TableCell>{formatPLN(r.yearlyLoss)} zł/rok</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sekcja 3 */}
            <Card>
              <CardHeader>
                <CardTitle>Znaczenie decyzyjne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>Powtarzalność zgłoszeń wskazuje na problem systemowy.</p>
                <p>Skala strat uzasadnia analizę na poziomie całego budynku.</p>
                <p>
                  Decyzja o audycie lub modernizacji ma charakter ekonomiczny, a nie indywidualny.
                </p>
              </CardContent>
            </Card>

            {/* Sekcja 4 */}
            <Card>
              <CardHeader>
                <CardTitle>Co dalej?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>audyt techniczny instalacji CWU</li>
                  <li>analiza wariantów modernizacji</li>
                  <li>przygotowanie kosztorysu</li>
                  <li>decyzja wspólnoty / zarządu</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sekcja 5 (ostatnia) */}
            <Card>
              <CardHeader>
                <CardTitle>Obsługa wielu zgłoszeń – tryb portfela</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {!portfolioView.hasEnough ? (
                  <div className="text-muted-foreground">Brak wystarczających danych do agregacji</div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-muted-foreground">Liczba zgłoszeń CWU w systemie</div>
                      <div className="font-semibold">{portfolioView.count}</div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-muted-foreground">Łączna roczna strata</div>
                      <div className="font-semibold">~{formatPLN(portfolioView.totalLoss)} zł/rok</div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-muted-foreground">Zakres potencjalnych oszczędności (widełki)</div>
                      <div className="font-semibold">
                        ~{formatPLN(portfolioView.savingsMin)}–{formatPLN(portfolioView.savingsMax)} zł/rok
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-muted-foreground">
                  W docelowym modelu każde zgłoszenie dotyczy osobnego budynku lub węzła. Agregacja pozwala zarządcy ocenić skalę problemu w całym portfelu.
                </div>

                <div className="space-y-1">
                  <div className="font-semibold">Ograniczenia MVP</div>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>dane lokalne (przeglądarka)</li>
                    <li>brak centralnej bazy</li>
                    <li>brak porównań między obiektami</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
