"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, FileText, Gauge, PlayCircle, ShieldCheck, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateCwuLoss, type CwuLossInputs } from "@/lib/calc/calculateCwuLoss";

const DEFAULT_FORMSPREE_AUDYTOR_ENDPOINT = "https://formspree.io/f/mpwvbbdl";

const DEFAULT_APARTMENTS_RANGE = { min: 20, max: 60 };

type AuditPotentialLevel = "niski" | "średni" | "wysoki";

type LeadRecommendedStep = "OBSERWACJA" | "ROZMOWA" | "AUDYT";
type LeadStatus = "NEW" | "OBSERVATION" | "CONTACT" | "READY_FOR_AUDIT";
type LeadPriority = "niski" | "średni" | "wysoki";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readPath(root: unknown, path: string[]): unknown {
  let current: unknown = root;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function classifyLeadRecommendedStep(lossesPlnPerYearBuilding: number): LeadRecommendedStep {
  const loss = Number.isFinite(lossesPlnPerYearBuilding) ? Math.max(0, lossesPlnPerYearBuilding) : 0;
  if (loss < 10_000) return "OBSERWACJA";
  if (loss <= 30_000) return "ROZMOWA";
  return "AUDYT";
}

function classifyLeadPriority(lossesPlnPerYearBuilding: number): LeadPriority {
  const loss = Number.isFinite(lossesPlnPerYearBuilding) ? Math.max(0, lossesPlnPerYearBuilding) : 0;
  if (loss < 10_000) return "niski";
  if (loss <= 30_000) return "średni";
  return "wysoki";
}

function priorityRank(priority: LeadPriority): number {
  if (priority === "wysoki") return 0;
  if (priority === "średni") return 1;
  return 2;
}

function priorityBadge(priority: LeadPriority): { label: string; variant: "outline" | "warning" | "destructive" } {
  if (priority === "wysoki") return { label: "Wysoki", variant: "destructive" };
  if (priority === "średni") return { label: "Średni", variant: "warning" };
  return { label: "Niski", variant: "outline" };
}

function recommendedStepBadge(step: LeadRecommendedStep): {
  label: string;
  variant: "outline" | "warning" | "destructive";
} {
  if (step === "OBSERWACJA") return { label: "Obserwacja", variant: "outline" };
  if (step === "ROZMOWA") return { label: "Rozmowa z zarządcą", variant: "warning" };
  return { label: "Audyt techniczny", variant: "destructive" };
}

function mapRecommendedStepToLeadStatus(step: LeadRecommendedStep): LeadStatus {
  if (step === "OBSERWACJA") return "OBSERVATION";
  if (step === "ROZMOWA") return "CONTACT";
  return "READY_FOR_AUDIT";
}

function statusBadge(status: LeadStatus): { label: string; variant: "outline" | "secondary" | "warning" | "success" } {
  if (status === "NEW") return { label: "NEW", variant: "outline" };
  if (status === "OBSERVATION") return { label: "OBSERVATION", variant: "secondary" };
  if (status === "CONTACT") return { label: "CONTACT", variant: "warning" };
  return { label: "READY_FOR_AUDIT", variant: "success" };
}

function formatMoneyPL(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  const rounded = Math.round(Math.max(0, value));
  return `~${rounded.toLocaleString("pl-PL")} zł/rok`;
}

function formatMoneyPLRange(range: { min: number; max: number } | null): string {
  if (!range) return "—";
  const min = Math.round(Math.max(0, range.min));
  const max = Math.round(Math.max(0, range.max));
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "—";
  if (min === max) return `~${min.toLocaleString("pl-PL")} zł/rok`;
  return `~${min.toLocaleString("pl-PL")}–${max.toLocaleString("pl-PL")} zł/rok`;
}

function classifyAuditPotential(input: { lossesPercent: number; lossesPlnPerYear: number }): {
  level: AuditPotentialLevel;
  label: string;
  helper: string;
  nextStep: string;
  badgeVariant: "outline" | "warning" | "success";
} {
  const lossesPercent = Number.isFinite(input.lossesPercent) ? input.lossesPercent : 0;
  const lossesPlnPerYear = Number.isFinite(input.lossesPlnPerYear) ? input.lossesPlnPerYear : 0;

  const LOW_PLN_PER_YEAR = 5_000;
  const HIGH_PLN_PER_YEAR = 20_000;

  const isLow = lossesPercent < 20 || lossesPlnPerYear <= LOW_PLN_PER_YEAR;
  const isHigh = lossesPercent > 35 || lossesPlnPerYear >= HIGH_PLN_PER_YEAR;

  if (isHigh) {
    return {
      level: "wysoki",
      label: "Wysoki",
      helper: "Audyt ma sens – są pieniądze i ryzyko.",
      nextStep: "Do natychmiastowego audytu",
      badgeVariant: "success",
    };
  }

  if (isLow) {
    return {
      level: "niski",
      label: "Niski",
      helper: "Raczej obserwacja niż audyt.",
      nextStep: "Do obserwacji",
      badgeVariant: "outline",
    };
  }

  return {
    level: "średni",
    label: "Średni",
    helper: "Warto policzyć dokładniej i przygotować argumenty.",
    nextStep: "Do rozmowy z zarządcą",
    badgeVariant: "warning",
  };
}

export default function AudytorzyPage() {
  const videoUrl = (process.env.NEXT_PUBLIC_AUDYTORZY_VIDEO_URL ?? "").trim();
  const formspreeEndpoint =
    (process.env.NEXT_PUBLIC_FORMSPREE_AUDYTOR_ENDPOINT ?? "").trim() || DEFAULT_FORMSPREE_AUDYTOR_ENDPOINT;

  const [buildingApartmentsCount, setBuildingApartmentsCount] = useState<number | null>(null);

  const [leads, setLeads] = useState<
    Array<{
      id: string;
      createdAtISO: string;
      residentEmail: string | null;
      apartmentsCount: number | null;
      lossesPlnPerYearBuilding: number;
      lossesPlnPerYearBuildingRange: { min: number; max: number } | null;
      lossesPercent: number;
      priority: LeadPriority;
      recommendedStep: LeadRecommendedStep;
      status: LeadStatus;
    }>
  >([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [lead, setLead] = useState<{ email: string; phone: string; company: string }>({
    email: "",
    phone: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const keys = Object.keys(window.localStorage).filter((k) => k.startsWith("residentCwuAuditContext:issue-"));

      const loaded: Array<{
        id: string;
        createdAtISO: string;
        residentEmail: string | null;
        apartmentsCount: number | null;
        lossesPlnPerYearBuilding: number;
        lossesPlnPerYearBuildingRange: { min: number; max: number } | null;
        lossesPercent: number;
        priority: LeadPriority;
        recommendedStep: LeadRecommendedStep;
        status: LeadStatus;
        createdAtMs: number;
      }> = [];

      for (const key of keys) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;

        let parsed: unknown = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }

        if (!isRecord(parsed)) continue;

        const idCandidate = readPath(parsed, ["id"]);
        const id = typeof idCandidate === "string" ? idCandidate : key.replace("residentCwuAuditContext:issue-", "");
        const createdAtISOCandidate = readPath(parsed, ["createdAtISO"]);
        const createdAtISO = typeof createdAtISOCandidate === "string" ? createdAtISOCandidate : "";
        const createdAtMsRaw = Date.parse(createdAtISO);
        const createdAtMs = Number.isFinite(createdAtMsRaw) ? createdAtMsRaw : 0;

        const apartmentsCountCandidate =
          readPath(parsed, ["building", "apartmentsCount"]) ?? readPath(parsed, ["payload", "building", "apartmentsCount"]) ?? null;
        const apartmentsCount =
          typeof apartmentsCountCandidate === "number" && Number.isFinite(apartmentsCountCandidate) && apartmentsCountCandidate > 0
            ? Math.round(apartmentsCountCandidate)
            : null;

        // Źródło prawdy: liczymy zawsze z inputów (a nie z zapisanych wyników UI mieszkańca).
        const inputsCandidate =
          readPath(parsed, ["payload", "calcSnapshot", "inputs"]) ??
          readPath(parsed, ["calcSnapshot", "inputs"]) ??
          readPath(parsed, ["inputs"]) ??
          null;
        const inputsObj = isRecord(inputsCandidate) ? inputsCandidate : null;
        const inputs: CwuLossInputs | null = inputsObj
          ? {
              cwuPriceFromBill: Number(inputsObj["cwuPriceFromBill"]),
              monthlyConsumption: Number(inputsObj["monthlyConsumption"]),
              coldTempC: Number(inputsObj["coldTempC"]),
              hotTempC: Number(inputsObj["hotTempC"]),
              heatPriceFromCity: Number(inputsObj["heatPriceFromCity"]),
            }
          : null;

        const hasValidInputs =
          !!inputs &&
          Number.isFinite(inputs.cwuPriceFromBill) &&
          Number.isFinite(inputs.monthlyConsumption) &&
          Number.isFinite(inputs.coldTempC) &&
          Number.isFinite(inputs.hotTempC) &&
          Number.isFinite(inputs.heatPriceFromCity) &&
          inputs.monthlyConsumption > 0 &&
          inputs.heatPriceFromCity > 0;

        let yearlyLossPerApartment = 0;
        let lossesPercent = 0;
        if (hasValidInputs && inputs) {
          const calc = calculateCwuLoss(inputs);
          yearlyLossPerApartment = Math.max(0, Number(calc.yearlyFinancialLoss) || 0);

          const energyLossPerM3 = Math.max(0, Number(calc.energyLossPerM3) || 0);
          const energyPerM3 = Math.max(0, Number(calc.energyPerM3) || 0);
          const energyTotal = energyLossPerM3 + energyPerM3;
          lossesPercent = energyTotal > 0 ? (energyLossPerM3 / energyTotal) * 100 : 0;
        } else {
          // Fallback dla starszych/niepełnych wpisów: użyj zapisanych wyników, jeśli istnieją.
          const yearlyLossPerApartmentCandidate =
            readPath(parsed, ["result", "yearlyFinancialLoss"]) ??
            readPath(parsed, ["payload", "calcSnapshot", "result", "yearlyFinancialLoss"]) ??
            null;
          yearlyLossPerApartment =
            typeof yearlyLossPerApartmentCandidate === "number" && Number.isFinite(yearlyLossPerApartmentCandidate)
              ? Math.max(0, yearlyLossPerApartmentCandidate)
              : 0;

          const energyLossPerM3Candidate =
            readPath(parsed, ["result", "energyLossPerM3"]) ??
            readPath(parsed, ["payload", "calcSnapshot", "result", "energyLossPerM3"]) ??
            null;
          const energyPerM3Candidate =
            readPath(parsed, ["result", "energyPerM3"]) ?? readPath(parsed, ["payload", "calcSnapshot", "result", "energyPerM3"]) ?? null;
          const energyLossPerM3 =
            typeof energyLossPerM3Candidate === "number" && Number.isFinite(energyLossPerM3Candidate)
              ? Math.max(0, energyLossPerM3Candidate)
              : 0;
          const energyPerM3 =
            typeof energyPerM3Candidate === "number" && Number.isFinite(energyPerM3Candidate)
              ? Math.max(0, energyPerM3Candidate)
              : 0;
          const energyTotal = energyLossPerM3 + energyPerM3;
          lossesPercent = energyTotal > 0 ? (energyLossPerM3 / energyTotal) * 100 : 0;
        }

        const lossesPlnPerYearBuildingRange =
          !apartmentsCount && yearlyLossPerApartment > 0
            ? {
                min: yearlyLossPerApartment * DEFAULT_APARTMENTS_RANGE.min,
                max: yearlyLossPerApartment * DEFAULT_APARTMENTS_RANGE.max,
              }
            : null;

        const lossesPlnPerYearBuilding = apartmentsCount
          ? yearlyLossPerApartment * apartmentsCount
          : yearlyLossPerApartment * ((DEFAULT_APARTMENTS_RANGE.min + DEFAULT_APARTMENTS_RANGE.max) / 2);

        const recommendedStep = classifyLeadRecommendedStep(lossesPlnPerYearBuilding);
        const priority = classifyLeadPriority(lossesPlnPerYearBuilding);

        const residentEmailCandidate =
          readPath(parsed, ["payload", "resident", "email"]) ?? readPath(parsed, ["inputs", "residentEmail"]) ?? null;
        const residentEmail = typeof residentEmailCandidate === "string" && residentEmailCandidate.includes("@") ? residentEmailCandidate : null;

        loaded.push({
          id,
          createdAtISO,
          residentEmail,
          apartmentsCount,
          lossesPlnPerYearBuilding,
          lossesPlnPerYearBuildingRange,
          lossesPercent: Number.isFinite(lossesPercent) ? Math.max(0, Math.min(100, lossesPercent)) : 0,
          priority,
          recommendedStep,
          status: "NEW",
          createdAtMs,
        });
      }

      loaded.sort((a, b) => {
        const pr = priorityRank(a.priority) - priorityRank(b.priority);
        if (pr !== 0) return pr;
        const loss = (b.lossesPlnPerYearBuilding || 0) - (a.lossesPlnPerYearBuilding || 0);
        if (loss !== 0) return loss;
        return b.createdAtMs - a.createdAtMs;
      });
      setLeads(
        loaded.map(({ createdAtMs: _createdAtMs, ...rest }) => rest),
      );

      const bestApartments = loaded.find((l) => typeof l.apartmentsCount === "number" && l.apartmentsCount > 0)?.apartmentsCount ?? null;
      setBuildingApartmentsCount(bestApartments);
      setSelectedLeadId((prev) => prev ?? (loaded.length ? loaded[0].id : null));
    } catch {
      // UI-only: jeśli localStorage jest niedostępny, pomijamy
    }
  }, []);

  const selectedLead = useMemo(() => {
    if (!selectedLeadId) return null;
    return leads.find((l) => l.id === selectedLeadId) ?? null;
  }, [leads, selectedLeadId]);

  const caseStudy = useMemo(
    () => ({
      annualCwuPln: 120_000,
      lossesPercent: 28,
      lossesPlnPerYear: 33_600,
    }),
    [],
  );

  const activeDecisionNumbers = useMemo(() => {
    if (selectedLead) {
      return {
        source: "lead" as const,
        lossesPercent: Number.isFinite(selectedLead.lossesPercent) ? Math.max(0, Math.min(100, selectedLead.lossesPercent)) : 0,
        lossesPlnPerYear: Number.isFinite(selectedLead.lossesPlnPerYearBuilding)
          ? Math.max(0, selectedLead.lossesPlnPerYearBuilding)
          : 0,
        lossesPlnPerYearRange: selectedLead.lossesPlnPerYearBuildingRange,
        apartmentsCount: typeof selectedLead.apartmentsCount === "number" ? selectedLead.apartmentsCount : null,
      };
    }

    return {
      source: "demo" as const,
      lossesPercent: caseStudy.lossesPercent,
      lossesPlnPerYear: caseStudy.lossesPlnPerYear,
      lossesPlnPerYearRange: null,
      apartmentsCount: buildingApartmentsCount,
    };
  }, [buildingApartmentsCount, caseStudy.lossesPercent, caseStudy.lossesPlnPerYear, selectedLead]);

  const auditPotential = useMemo(
    () =>
      classifyAuditPotential({
        lossesPercent: activeDecisionNumbers.lossesPercent,
        lossesPlnPerYear: activeDecisionNumbers.lossesPlnPerYear,
      }),
    [activeDecisionNumbers.lossesPercent, activeDecisionNumbers.lossesPlnPerYear],
  );

  const buildingScale = useMemo(() => {
    if (!buildingApartmentsCount || buildingApartmentsCount <= 0) return null;

    if (buildingApartmentsCount < 20) {
      return {
        label: `Liczba mieszkań w budynku: ~${buildingApartmentsCount}`,
        interpretation: "Mały budynek – decyzja szybka, mniejsza skala finansowa.",
      };
    }

    if (buildingApartmentsCount <= 60) {
      return {
        label: `Liczba mieszkań w budynku: ~${buildingApartmentsCount}`,
        interpretation: "Średni budynek – potencjał audytu dla całej wspólnoty.",
      };
    }

    return {
      label: `Liczba mieszkań w budynku: ~${buildingApartmentsCount}`,
      interpretation: "Duży budynek – istotna skala kosztowa i negocjacyjna.",
    };
  }, [buildingApartmentsCount]);

  const argumentsForManager = useMemo(() => {
    const money = activeDecisionNumbers.lossesPlnPerYearRange
      ? formatMoneyPLRange(activeDecisionNumbers.lossesPlnPerYearRange)
      : `~${Math.round(activeDecisionNumbers.lossesPlnPerYear).toLocaleString("pl-PL")} zł/rok`;

    if (auditPotential.level === "niski") {
      return {
        text:
          "Na tym etapie audyt nie jest priorytetem. Warto obserwować koszty i wrócić do tematu, jeśli problem się utrzyma lub skala strat wzrośnie.",
        action: "Monitoring / obserwacja",
        accent: `Skala strat: ${money}`,
      };
    }

    if (auditPotential.level === "średni") {
      return {
        text:
          "Obecne dane wskazują na realne koszty, które warto zweryfikować. Audyt pozwoli potwierdzić skalę strat i przygotować argumenty do decyzji zarządczej.",
        action: "Rozmowa z zarządcą + audyt wstępny",
        accent: `Skala strat: ${money}`,
      };
    }

    return {
      text:
        "Skala strat i ryzyko kosztowe są istotne. Audyt ma sens ekonomiczny i pozwala przygotować decyzję o działaniach naprawczych lub inwestycyjnych.",
      action: "Audyt pełny – decyzja pilna",
      accent: `Ryzyko kosztowe: ${money}`,
    };
  }, [activeDecisionNumbers.lossesPlnPerYear, activeDecisionNumbers.lossesPlnPerYearRange, auditPotential.level]);

  const preliminaryBuildingAnalysis = useMemo(() => {
    if (activeDecisionNumbers.source === "lead" && !selectedLead) return null;

    const annualLoss = Math.max(0, Number(activeDecisionNumbers.lossesPlnPerYear) || 0);
    const monthlyLoss = annualLoss / 12;
    const annualLossLabel = activeDecisionNumbers.lossesPlnPerYearRange
      ? formatMoneyPLRange(activeDecisionNumbers.lossesPlnPerYearRange)
      : `~${Math.round(annualLoss).toLocaleString("pl-PL")} zł/rok`;
    const monthlyLossLabel = activeDecisionNumbers.lossesPlnPerYearRange
      ? "(widełki roczne — brak liczby mieszkań)"
      : `~${Math.round(monthlyLoss).toLocaleString("pl-PL")} zł/mies.`;

    const financialScale =
      annualLoss < 10_000 ? "Skala marginalna" : annualLoss <= 30_000 ? "Skala zauważalna" : "Skala istotna";

    const lossesPercent = Math.max(0, Math.min(100, Number(activeDecisionNumbers.lossesPercent) || 0));
    const lossesPercentLabel = lossesPercent ? `~${Math.round(lossesPercent)}%` : "—";

    const technical = (() => {
      if (lossesPercent < 20) {
        return { label: "Bliska poprawnej", variant: "outline" as const };
      }
      if (lossesPercent <= 35) {
        return { label: "Wymaga weryfikacji", variant: "warning" as const };
      }
      return { label: "Nieprawidłowości systemowe", variant: "destructive" as const };
    })();

    const riskLevel = annualLoss < 10_000 ? "niskie" : annualLoss <= 30_000 ? "średnie" : "wysokie";
    const riskSentence = `Przy tej skali strat ryzyko sporów i presji na zarządcę jest ${riskLevel}.`;

    const recommendation = (() => {
      if (annualLoss < 10_000) {
        return {
          label: "Obserwacja / monitoring",
          variant: "outline" as const,
        };
      }
      if (annualLoss <= 30_000) {
        return {
          label: "Audyt wstępny / rozmowa z zarządcą",
          variant: "warning" as const,
        };
      }
      return {
        label: "Pełny audyt techniczny – rekomendowany",
        variant: "destructive" as const,
      };
    })();

    return {
      annualLossLabel,
      monthlyLossLabel,
      financialScale,
      lossesPercentLabel,
      technical,
      riskSentence,
      recommendation,
    };
  }, [
    activeDecisionNumbers.lossesPercent,
    activeDecisionNumbers.lossesPlnPerYear,
    activeDecisionNumbers.lossesPlnPerYearRange,
    activeDecisionNumbers.source,
    selectedLead,
  ]);

  const isEmailValid = useMemo(() => lead.email.trim().includes("@"), [lead.email]);

  async function copyTextToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "true");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  const managerCta = useMemo(() => {
    if (auditPotential.level === "niski") {
      return {
        label: "Obserwuj i wróć do analizy",
        href: "/audytorzy/analiza-finansowa",
      };
    }
    if (auditPotential.level === "średni") {
      return {
        label: "Przygotuj rozmowę z zarządcą",
        href: "/audytorzy/analiza-finansowa",
      };
    }
    return {
      label: "Przejdź do audytu",
      href: "/audytor",
    };
  }, [auditPotential.level]);

  const copyPayload = useMemo(() => {
    return [
      "Na podstawie obecnych danych dotyczących CWU:",
      "",
      argumentsForManager.text,
      "",
      `Sugestia działania: ${argumentsForManager.action}`,
      argumentsForManager.accent,
    ].join("\n");
  }, [argumentsForManager.accent, argumentsForManager.action, argumentsForManager.text]);

  async function submitAuditorLead() {
    const email = lead.email.trim();
    if (!email || !email.includes("@")) {
      toast.error("Podaj poprawny adres e-mail");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("type", "auditor_lead");
      formData.set("email", email);
      if (lead.phone.trim()) formData.set("phone", lead.phone.trim());
      if (lead.company.trim()) formData.set("company", lead.company.trim());

      const resp = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!resp.ok) {
        let details: unknown = null;
        try {
          details = await resp.json();
        } catch {
          // pomijamy
        }
        throw new Error((details as { error?: string } | null)?.error || `Formspree HTTP ${resp.status}`);
      }

      setSubmitted(true);
      toast.success("Dzięki! Skontaktujemy się.");
    } catch (e) {
      toast.error("Nie udało się wysłać", { description: String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 relative z-10">
        <div className="sticky top-0 z-20 -mx-4 px-4">
          <div className="rounded-3xl border border-slate-200/30 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/70 backdrop-blur shadow-xl px-3 py-2 flex flex-wrap gap-2 items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-slate-300">Audytorzy – skala strat, ryzyko, priorytet, następny krok</div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/audytor">Zobacz demo panelu</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="#case">Case study</a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="#kontakt">Zostaw kontakt</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Dla audytorów: szybciej, czytelniej, bez chaosu w Excelu
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mt-4">
            Zamieniasz zgłoszenie mieszkańca w gotowy „decision pack” dla zarządcy: liczby, ryzyka, warianty A/B/C i kolejny krok.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild>
              <Link href="/audytor">Wejdź do demo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/mieszkancy">Zobacz, co widzi mieszkaniec</Link>
            </Button>
          </div>

          <div className="pt-4">
            <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
              <CardContent className="p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant={auditPotential.badgeVariant} className="text-xs">
                    Potencjał audytu: {auditPotential.label}
                  </Badge>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Skala strat: <span className="font-semibold">~{Math.round(activeDecisionNumbers.lossesPercent)}%</span> (ok.{" "}
                    <span className="font-semibold">
                      {activeDecisionNumbers.lossesPlnPerYearRange
                        ? formatMoneyPLRange(activeDecisionNumbers.lossesPlnPerYearRange)
                        : `~${Math.round(activeDecisionNumbers.lossesPlnPerYear).toLocaleString("pl-PL")} zł/rok`}
                    </span>
                    )
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Przy tej skali budynku potencjał audytu dotyczy nie jednego lokalu, ale całej nieruchomości.
                  </div>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Na podstawie obecnych danych audyt ma <span className="font-semibold">{auditPotential.level}</span> sens z punktu widzenia kosztów i ryzyka. {" "}
                  <span className="font-semibold">Kolejny krok:</span> {auditPotential.nextStep}.
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{auditPotential.helper}</div>
              </CardContent>
            </Card>

            <Card className="mt-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-900 dark:text-slate-100">Automatyczna analiza strat budynku (wstępna)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {selectedLead ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">A. Skala finansowa</div>
                        <Badge variant={preliminaryBuildingAnalysis?.recommendation.variant ?? "outline"} className="text-xs">
                          {preliminaryBuildingAnalysis?.financialScale ?? "—"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                        {preliminaryBuildingAnalysis?.annualLossLabel ?? "—"} · {preliminaryBuildingAnalysis?.monthlyLossLabel ?? "—"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">B. Skala techniczna (heurystyka)</div>
                        <Badge variant={preliminaryBuildingAnalysis?.technical.variant ?? "outline"} className="text-xs">
                          {preliminaryBuildingAnalysis?.technical.label ?? "—"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                        Udział strat: <span className="font-semibold">{preliminaryBuildingAnalysis?.lossesPercentLabel ?? "—"}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4 md:col-span-2">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">C. Ryzyko zarządcze</div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                        {preliminaryBuildingAnalysis?.riskSentence ?? "—"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4 md:col-span-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">D. Rekomendacja audytorska (automat)</div>
                        <Badge variant={preliminaryBuildingAnalysis?.recommendation.variant ?? "outline"} className="text-xs">
                          {preliminaryBuildingAnalysis?.recommendation.label ?? "—"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                        Decyzja oparta o zł/rok i ryzyko — bez ręcznego liczenia.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4 md:col-span-2">
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        Uwaga: to estymacje orientacyjne (zależne od danych wejściowych i liczby mieszkań). Jeśli brakuje liczby mieszkań, pokazujemy widełki dla
                        typowego zakresu {DEFAULT_APARTMENTS_RANGE.min}–{DEFAULT_APARTMENTS_RANGE.max} lokali.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Brak danych ze zgłoszenia mieszkańca. Ta sekcja uzupełni się automatycznie po zapisaniu zgłoszenia w <Link href="/mieszkancy" className="underline">/mieszkancy</Link>.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-900 dark:text-slate-100">Skala budynku</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {buildingScale ? (
                  <>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{buildingScale.label}</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{buildingScale.interpretation}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-slate-700 dark:text-slate-300">Liczba mieszkań w budynku: —</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      Brak danych ze zgłoszenia mieszkańca (pole jest opcjonalne).
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-900 dark:text-slate-100">Argumenty dla zarządcy</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={auditPotential.badgeVariant} className="text-xs">
                    {argumentsForManager.action}
                  </Badge>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{argumentsForManager.accent}</span>
                  </div>
                </div>

                <div className="text-sm text-slate-700 dark:text-slate-300">
                  {argumentsForManager.text}
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      const ok = await copyTextToClipboard(copyPayload);
                      if (ok) toast.success("Skopiowano argumenty do schowka");
                      else toast.error("Nie udało się skopiować");
                    }}
                  >
                    Skopiuj argumenty do rozmowy
                  </Button>

                  <Button asChild variant="secondary">
                    <Link href={managerCta.href}>{managerCta.label}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900 dark:text-slate-100">Kolejka audytów wg priorytetu finansowego</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  Ta kolejka pokazuje, gdzie audyt ma sens finansowy — nie gdzie jest najwięcej zgłoszeń.
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Dane są orientacyjne. Audyt techniczny potwierdza przyczynę i zakres działań.
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Panel prezentuje wyłącznie zgłoszenia o realnym potencjale finansowym. Dostęp pełny wymaga aktywnego planu audytora.
                </div>

                {/*
                  PRICING (v0.6.x, bez blokowania funkcji):
                  - FREE: podgląd ograniczony / demo
                  - PAID: pełna kolejka, sortowanie, historia
                  (placeholder pod przyszłe wdrożenie planów audytora)
                */}

                {leads.length ? (
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-950/30 overflow-hidden">
                    <Table className="text-slate-900 dark:text-slate-100">
                      <TableHeader className="bg-slate-100/90 dark:bg-slate-900/50">
                        <TableRow className="border-slate-200/80 dark:border-slate-700/80">
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">ID</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">Data</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">Priorytet</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">Mieszkań</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">Strata budynku</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">% strat</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">Status decyzyjny</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200">Status</TableHead>
                          <TableHead className="h-12 px-5 text-xs font-semibold text-slate-800 dark:text-slate-200 text-right">Akcja</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="[&_tr:nth-child(odd)]:bg-slate-50/60 dark:[&_tr:nth-child(odd)]:bg-slate-950/20">
                        {leads.map((l) => {
                          const rec = recommendedStepBadge(l.recommendedStep);
                          const pr = priorityBadge(l.priority);
                          const st = statusBadge(l.status);
                          const isSelected = selectedLeadId === l.id;

                          const lossesPercentLabel = l.lossesPercent ? `${Math.round(l.lossesPercent)}%` : "—";
                          const lossesPercentVariant = !l.lossesPercent
                            ? "outline"
                            : l.lossesPercent >= 35
                              ? "destructive"
                              : l.lossesPercent >= 25
                                ? "warning"
                                : "outline";

                          return (
                            <TableRow
                              key={l.id}
                              data-state={isSelected ? "selected" : undefined}
                              className={
                                isSelected
                                  ? "bg-slate-200/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-700/80"
                                  : "border-slate-200/70 dark:border-slate-800/70"
                              }
                            >
                              <TableCell className="px-5 py-4 font-mono text-xs text-slate-700 dark:text-slate-300">{l.id}</TableCell>
                              <TableCell className="px-5 py-4 text-xs text-slate-800 dark:text-slate-200">
                                {l.createdAtISO ? new Date(l.createdAtISO).toLocaleString("pl-PL") : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={pr.variant} className="text-xs whitespace-nowrap">
                                  {pr.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-5 py-4 text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                                {typeof l.apartmentsCount === "number" ? `~${l.apartmentsCount}` : "—"}
                              </TableCell>
                              <TableCell className="px-5 py-4 text-xs tabular-nums">
                                <span className="font-bold text-red-700 dark:text-red-200">
                                  {typeof l.apartmentsCount === "number"
                                    ? formatMoneyPL(l.lossesPlnPerYearBuilding)
                                    : l.lossesPlnPerYearBuildingRange
                                      ? formatMoneyPLRange(l.lossesPlnPerYearBuildingRange)
                                      : formatMoneyPL(l.lossesPlnPerYearBuilding)}
                                </span>
                              </TableCell>
                              <TableCell className="px-5 py-4">
                                <Badge
                                  variant={lossesPercentVariant}
                                  className="text-xs tabular-nums border-slate-300/80 dark:border-slate-600/80"
                                >
                                  {lossesPercentLabel}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={rec.variant} className="text-xs whitespace-nowrap">
                                  {rec.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={st.variant} className="text-xs whitespace-nowrap">
                                  {st.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-5 py-4 text-right">
                                <Button type="button" size="sm" variant="outline" onClick={() => setSelectedLeadId(l.id)}>
                                  Szczegóły
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Brak leadów w localStorage. Otwórz <Link href="/mieszkancy" className="underline">/mieszkancy</Link>, uzupełnij formularz i zapisz zgłoszenie.
                  </div>
                )}

                {selectedLead ? (
                  <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-slate-900 dark:text-slate-100">Szczegóły leadu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-semibold">ID:</span> {selectedLead.id}
                        {selectedLead.residentEmail ? (
                          <> · <span className="font-semibold">E-mail:</span> {selectedLead.residentEmail}</>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Mieszkań</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {typeof selectedLead.apartmentsCount === "number" ? `~${selectedLead.apartmentsCount}` : "—"}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Strata budynku</div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {typeof selectedLead.apartmentsCount === "number"
                              ? formatMoneyPL(selectedLead.lossesPlnPerYearBuilding)
                              : selectedLead.lossesPlnPerYearBuildingRange
                                ? formatMoneyPLRange(selectedLead.lossesPlnPerYearBuildingRange)
                                : formatMoneyPL(selectedLead.lossesPlnPerYearBuilding)}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Rekomendowany krok</div>
                          {(() => {
                            const rec = recommendedStepBadge(selectedLead.recommendedStep);
                            return (
                              <div className="mt-1">
                                <Badge variant={rec.variant}>{rec.label}</Badge>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">Rekomendowany kolejny krok</div>
                        <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                          {selectedLead.recommendedStep === "OBSERWACJA"
                            ? "Na tym etapie rekomendowana jest obserwacja kosztów i kontakt informacyjny. Lead o niskim priorytecie."
                            : selectedLead.recommendedStep === "ROZMOWA"
                              ? "Skala strat uzasadnia rozmowę z zarządcą i zebranie danych do decyzji."
                              : "Skala strat uzasadnia audyt techniczny. Lead o wysokim potencjale finansowym."}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={
                              selectedLead.recommendedStep === "AUDYT"
                                ? "default"
                                : selectedLead.recommendedStep === "ROZMOWA"
                                  ? "secondary"
                                  : "outline"
                            }
                            onClick={() => {
                              const nextStatus = mapRecommendedStepToLeadStatus(selectedLead.recommendedStep);
                              setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, status: nextStatus } : l)));
                            }}
                          >
                            {selectedLead.recommendedStep === "OBSERWACJA"
                              ? "Oznacz jako: obserwacja"
                              : selectedLead.recommendedStep === "ROZMOWA"
                                ? "Przygotuj rozmowę z zarządcą"
                                : "Przejdź do audytu technicznego"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Timer className="w-5 h-5 text-cyan-400" />
                Czas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              30–60 min na pakiet decyzyjny (typowo), zależnie od kompletności danych.
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <FileText className="w-5 h-5 text-cyan-400" />
                Artefakty
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              PDF do zarządcy + notatki prywatne + historia decyzji – bez mieszania wersji.
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Ryzyko
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              Jasne warunki audytu płatnego i ścieżka „co dalej” – mniej nieporozumień.
            </CardContent>
          </Card>
        </div>

        <Card
          id="case"
          className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur"
        >
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Case study (poglądowe)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Budynek</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">~80 mieszkań</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">zależnie od węzła i cyrkulacji</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Roczne CWU</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{caseStudy.annualCwuPln.toLocaleString("pl-PL")} zł</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">z faktur / rozliczeń</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Straty</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">~{caseStudy.lossesPercent}%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Skala strat:{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    ~{caseStudy.lossesPlnPerYear.toLocaleString("pl-PL")} zł/rok
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={auditPotential.badgeVariant}>Potencjał audytu: {auditPotential.label}</Badge>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Decyzja: {auditPotential.nextStep}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Przykład pokazuje format decyzji i komunikacji, nie gwarancję wyniku. Realny efekt zależy od instalacji i danych.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Sygnał decyzyjny: potencjał audytu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="text-slate-700 dark:text-slate-300">
              Łączysz <span className="font-semibold">skalę strat (zł/rok)</span> z prostą decyzją biznesową — bez sporu o detale.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Niski</div>
                  <Badge variant="outline">Potencjał audytu</Badge>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Raczej obserwacja niż audyt. <span className="font-semibold">Kolejny krok:</span> do obserwacji.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Średni</div>
                  <Badge variant="secondary">Potencjał audytu</Badge>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Warto policzyć dokładniej i przygotować argumenty. <span className="font-semibold">Kolejny krok:</span> do rozmowy z zarządcą.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Wysoki</div>
                  <Badge variant="success">Potencjał audytu</Badge>
                </div>
                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Audyt ma sens – są pieniądze i ryzyko. <span className="font-semibold">Kolejny krok:</span> do natychmiastowego audytu.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              Wideo demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videoUrl ? (
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-black">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={videoUrl}
                    title="Demo" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-700 dark:text-slate-300">
                Brak ustawionego wideo. Jeśli podasz URL, podepnę go pod zmienną `NEXT_PUBLIC_AUDYTORZY_VIDEO_URL`.
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          id="kontakt"
          className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur"
        >
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Zostaw kontakt (dla audytora)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">E-mail</div>
                <Input
                  value={lead.email}
                  onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
                  placeholder="np. audytor@email.com"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Telefon (opcjonalnie)</div>
                <Input
                  value={lead.phone}
                  onChange={(e) => setLead((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="np. 600 000 000"
                  inputMode="tel"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Firma (opcjonalnie)</div>
                <Input
                  value={lead.company}
                  onChange={(e) => setLead((p) => ({ ...p, company: e.target.value }))}
                  placeholder="np. Audyty XYZ"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={submitAuditorLead} disabled={submitting || submitted || !isEmailValid}>
                {submitted ? "Wysłano" : submitting ? "Wysyłanie…" : "Chcę dostęp / rozmowę"}
              </Button>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Uwaga: formularz wysyła dane do Formspree.
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur p-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Kolejny krok</h2>
            <div className="text-sm md:text-base text-slate-700 dark:text-slate-300">
              Celem audytu nie jest spór techniczny, lecz decyzja finansowa i plan działania.
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-900 dark:text-slate-100">Kiedy audyt ma sens</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                Gdy straty są istotne w skali zł/rok lub problem się powtarza
                <br />
                i nie da się go wyjaśnić wyłącznie sezonowością.
              </CardContent>
            </Card>

            <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-900 dark:text-slate-100">Kiedy warto iść do zarządcy / spółdzielni</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                Gdy masz liczby, które można obronić:
                <br />
                szacunek strat, prostą interpretację i listę danych do potwierdzenia.
              </CardContent>
            </Card>

            <Card className="bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-700/60 rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-900 dark:text-slate-100">Kiedy wchodzi wykonawca</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 dark:text-slate-300">
                Po audycie, gdy zakres jest porównywalny i można zebrać oferty
                <br />
                bez chaosu — wykonawca jest naturalnym kolejnym etapem.
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/metodologia-audytu-cwu">Przygotuj argumenty do rozmowy</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/audytor">Zrób szybką ocenę sensu audytu</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/audytorzy/analiza-finansowa">Przejdź do narzędzi finansowych</Link>
            </Button>
          </div>
        </section>

        <div>
          <div className="text-center text-lg text-slate-300 mb-4">Analiza finansowa CWU (narzędzia decyzyjne)</div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Link
              href="/audytorzy/liczniki"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-pink-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-700/10 via-purple-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-700 via-purple-700 to-blue-900 text-pink-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-7 w-7" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xl font-bold text-slate-200 group-hover:text-pink-300 transition-colors">Liczniki</span>
                  <span className="text-sm text-slate-400">Analiza odczytów liczników ciepła</span>
                </span>
              </div>
            </Link>

            <Link
              href="/audytorzy/moc-zamowiona"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-blue-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/10 via-blue-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 text-cyan-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Gauge className="h-7 w-7" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xl font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    Moc zamówiona CWU
                  </span>
                  <span className="text-sm text-slate-400">Kalkulator mocy zamówionej na CWU</span>
                </span>
              </div>
            </Link>

            <Link
              href="/audytorzy/analiza-finansowa"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-900/80 via-yellow-700/80 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-yellow-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-700/10 via-orange-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-400 to-orange-900 text-yellow-100 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Gauge className="h-7 w-7" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xl font-bold text-slate-200 group-hover:text-yellow-300 transition-colors">
                    Analiza finansowa
                  </span>
                  <span className="text-sm text-slate-400">Koszty, oszczędności i warianty modernizacji</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}