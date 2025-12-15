"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_FORMSPREE_CWU_ENDPOINT = "https://formspree.io/f/mpwvbbdl";

type CalcInputsSnapshot = {
  cwuPriceFromBill: number;
  monthlyConsumption: number;
  coldTempC: number;
  hotTempC: number;
  heatPriceFromCity: number;
  residentName?: string;
  residentEmail?: string;
  residentPhone?: string;
  buildingAddress?: string;
  apartmentNumber?: string;
};

type CalcResultSnapshot = {
  energyLossPerM3: number;
  lossPerM3: number;
  monthlyFinancialLoss: number;
  monthlyEnergyLoss: number;
  yearlyFinancialLoss: number;
  yearlyEnergyLoss: number;
  theoreticalCostPerM3: number;
  theoreticalMonthlyPayment: number;
  actualMonthlyPayment: number;
  energyPerM3: number;
};

type IssueFormState = {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;

  problemType:
    | "brak_cwu"
    | "niska_temp"
    | "dlugi_czas"
    | "wahania"
    | "zawyzony_koszt"
    | "inne";
  otherProblem: string;

  symptoms: {
    longFlush: boolean;
    coolsFast: boolean;
    unstableTemp: boolean;
    specificHours: boolean;
    longTime: boolean;
  };

  description: string;

  goal: "sprawdzenie" | "interwencja" | "analiza_kosztow" | "informacja";

  consentContact: boolean;
  consentShareAnalysis: boolean;
  confirmTruth: boolean;
};

function formatNumberPL(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function buildAdminSummary(params: {
  id: string;
  createdAtISO: string;
  form: IssueFormState;
  technical: {
    cwuTempC: number;
    estimatedArrival: string;
    circulationLossPct: number;
    sourcePowerkW: number;
    deviation: { isDeviation: boolean; reasons: string[] };
  };
  calcInputs: CalcInputsSnapshot;
  calcResult: CalcResultSnapshot;
}): string {
  const { id, createdAtISO, form, technical, calcInputs, calcResult } = params;

  const problemLabelMap: Record<IssueFormState["problemType"], string> = {
    brak_cwu: "Brak ciepłej wody",
    niska_temp: "Zbyt niska temperatura ciepłej wody",
    dlugi_czas: "Długi czas oczekiwania na ciepłą wodę",
    wahania: "Duże wahania temperatury",
    zawyzony_koszt: "Podejrzenie zawyżonych kosztów CWU",
    inne: "Inny problem",
  };

  const goalLabelMap: Record<IssueFormState["goal"], string> = {
    sprawdzenie: "Prośba o sprawdzenie instalacji",
    interwencja: "Prośba o interwencję techniczną",
    analiza_kosztow: "Prośba o analizę kosztów CWU",
    informacja: "Informacja do administracji",
  };

  const symptomsList: Array<[boolean, string]> = [
    [form.symptoms.longFlush, "Ciepła woda pojawia się dopiero po długim spuszczaniu"],
    [form.symptoms.coolsFast, "Woda szybko stygnie"],
    [form.symptoms.unstableTemp, "Temperatura jest niestabilna"],
    [form.symptoms.specificHours, "Problem występuje tylko w określonych godzinach"],
    [form.symptoms.longTime, "Problem występuje od dłuższego czasu"],
  ];

  const pickedSymptoms = symptomsList.filter(([v]) => v).map(([, label]) => `- ${label}`);

  const header = [
    `ZGŁOSZENIE CWU (mieszkaniec)`,
    `ID: ${id}`,
    `Data: ${new Date(createdAtISO).toLocaleString("pl-PL")}`,
  ].join("\n");

  const residentBlock = [
    `DANE MIESZKAŃCA`,
    `Imię i nazwisko: ${form.fullName}`,
    `E-mail: ${form.email}`,
    `Telefon: ${form.phone || "—"}`,
    `Adres lokalu: ${form.street}, bud. ${form.buildingNumber}, m. ${form.apartmentNumber}`,
  ].join("\n");

  const problemBlock = [
    `PROBLEM`,
    `Rodzaj: ${problemLabelMap[form.problemType]}`,
    form.problemType === "inne" && form.otherProblem.trim()
      ? `Doprecyzowanie: ${form.otherProblem.trim()}`
      : null,
    pickedSymptoms.length ? `Objawy (zaznaczone):\n${pickedSymptoms.join("\n")}` : `Objawy (zaznaczone): —`,
    `Opis mieszkańca:\n${form.description.trim()}`,
    `Cel zgłoszenia: ${goalLabelMap[form.goal]}`,
  ]
    .filter(Boolean)
    .join("\n");

  const technicalBlock = [
    `DANE TECHNICZNE (z obliczeń programu / szacunki)`,
    `Temperatura CWU (w obliczeniach): ${formatNumberPL(technical.cwuTempC, 1)} °C`,
    `Szacowany czas dojścia ciepłej wody: ${technical.estimatedArrival}`,
    `Straty na cyrkulacji (szacunek): ${formatNumberPL(technical.circulationLossPct, 1)} %`,
    `Moc źródła ciepła (szacunek na podstawie danych): ${formatNumberPL(technical.sourcePowerkW, 2)} kW`,
    `Odchylenia od zaleceń: ${technical.deviation.isDeviation ? "TAK" : "NIE"}`,
    technical.deviation.isDeviation && technical.deviation.reasons.length
      ? `Powody: ${technical.deviation.reasons.join("; ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const calcBlock = [
    `ZAŁĄCZONE WYNIKI OBLICZEŃ (snapshot)`,
    `Cena z rachunku (podgrzanie CWU): ${formatNumberPL(calcInputs.cwuPriceFromBill, 2)} zł/m³`,
    `Zużycie miesięczne CWU: ${formatNumberPL(calcInputs.monthlyConsumption, 1)} m³`,
    `Tzimna: ${formatNumberPL(calcInputs.coldTempC, 1)} °C, Tcwu: ${formatNumberPL(calcInputs.hotTempC, 1)} °C`,
    `Cena ciepła (sieć): ${formatNumberPL(calcInputs.heatPriceFromCity, 2)} zł/GJ`,
    `Koszt teoretyczny 1 m³: ${formatNumberPL(calcResult.theoreticalCostPerM3, 2)} zł/m³`,
    `Różnica (strata) 1 m³: ${formatNumberPL(calcResult.lossPerM3, 2)} zł/m³`,
    `Strata miesięczna: ${formatNumberPL(calcResult.monthlyFinancialLoss, 2)} zł/mies.`,
    `Strata roczna: ${formatNumberPL(calcResult.yearlyFinancialLoss, 2)} zł/rok`,
  ].join("\n");

  return [header, "", residentBlock, "", problemBlock, "", technicalBlock, "", calcBlock].join("\n");
}

export function ResidentCwuIssueForm(props: {
  calcInputs: CalcInputsSnapshot;
  calcResult: CalcResultSnapshot | null;
}) {
  const { calcInputs, calcResult } = props;

  const formspreeEndpoint =
    (process.env.NEXT_PUBLIC_FORMSPREE_CWU_ENDPOINT && process.env.NEXT_PUBLIC_FORMSPREE_CWU_ENDPOINT.trim()) ||
    DEFAULT_FORMSPREE_CWU_ENDPOINT;

  const [form, setForm] = useState<IssueFormState>(() => ({
    fullName: calcInputs.residentName ?? "",
    email: calcInputs.residentEmail ?? "",
    phone: calcInputs.residentPhone ?? "",
    street: calcInputs.buildingAddress ?? "",
    buildingNumber: "",
    apartmentNumber: calcInputs.apartmentNumber ?? "",

    problemType: "brak_cwu",
    otherProblem: "",

    symptoms: {
      longFlush: false,
      coolsFast: false,
      unstableTemp: false,
      specificHours: false,
      longTime: false,
    },

    description: "",

    goal: "sprawdzenie",

    consentContact: false,
    consentShareAnalysis: false,
    confirmTruth: false,
  }));

  const [submitted, setSubmitted] = useState<{
    id: string;
    createdAtISO: string;
    adminSummary: string;
    payload: unknown;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const technical = useMemo(() => {
    const cwuTempC = Number.isFinite(calcInputs.hotTempC) ? calcInputs.hotTempC : 0;

    const circulationLossPct = (() => {
      if (!calcResult) return 0;
      const denom = calcInputs.cwuPriceFromBill;
      if (!Number.isFinite(denom) || denom <= 0) return 0;
      const pct = (calcResult.lossPerM3 / denom) * 100;
      if (!Number.isFinite(pct)) return 0;
      return Math.max(0, Math.min(100, pct));
    })();

    const sourcePowerkW = (() => {
      if (!calcResult) return 0;
      const GJmonth = calcResult.energyPerM3 * calcInputs.monthlyConsumption;
      const kWhMonth = GJmonth * 277.78;
      const hoursMonth = 30 * 24;
      const kWavg = kWhMonth / hoursMonth;
      return Number.isFinite(kWavg) ? Math.max(kWavg, 0) : 0;
    })();

    const deviationReasons: string[] = [];

    if (cwuTempC < 50) deviationReasons.push("Tcwu < 50°C (ryzyko komfortu i higieny) ");
    if (cwuTempC > 60) deviationReasons.push("Tcwu > 60°C (ryzyko oparzeń / nastawy zawyżone)");
    if (circulationLossPct > 30) deviationReasons.push("wysokie straty (udział kosztów strat > 30%)");

    const deviation = {
      isDeviation: deviationReasons.length > 0,
      reasons: deviationReasons,
    };

    return {
      cwuTempC,
      estimatedArrival: "Brak danych (wymaga pomiaru w lokalu)",
      circulationLossPct,
      sourcePowerkW,
      deviation,
    };
  }, [calcInputs, calcResult]);

  function update<K extends keyof IssueFormState>(key: K, value: IssueFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSymptoms<K extends keyof IssueFormState["symptoms"]>(key: K, value: boolean) {
    setForm((prev) => ({ ...prev, symptoms: { ...prev.symptoms, [key]: value } }));
  }

  function downloadJson(filename: string, data: unknown) {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      toast.error("Nie udało się pobrać pliku JSON", { description: String(e) });
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Skopiowano podsumowanie do schowka");
    } catch {
      toast.error("Nie udało się skopiować do schowka");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    if (!calcResult) {
      toast.error("Brak wyników obliczeń CWU", {
        description: "Najpierw wykonaj obliczenia w kalkulatorze (wyniki są dołączane do zgłoszenia).",
      });
      return;
    }

    if (!form.consentContact || !form.consentShareAnalysis || !form.confirmTruth) {
      toast.error("Wymagane zgody", {
        description:
          "Zaznacz zgodę na kontakt, zgodę na przekazanie wyników analizy do zarządcy / spółdzielni oraz potwierdzenie prawdziwości danych.",
      });
      return;
    }

    if (form.problemType === "inne" && !form.otherProblem.trim()) {
      toast.error("Uzupełnij pole: Inny problem", {
        description: "Wpisz krótko, co dokładnie chcesz zgłosić.",
      });
      return;
    }

    const id = `CWU-${Date.now().toString(36).toUpperCase()}`;
    const createdAtISO = new Date().toISOString();

    const payload = {
      id,
      createdAtISO,
      kind: "resident_cwu_issue" as const,
      resident: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: {
          street: form.street.trim(),
          buildingNumber: form.buildingNumber.trim(),
          apartmentNumber: form.apartmentNumber.trim(),
        },
      },
      issue: {
        problemType: form.problemType,
        otherProblem: form.problemType === "inne" ? form.otherProblem.trim() : null,
        symptoms: { ...form.symptoms },
        description: form.description.trim(),
        goal: form.goal,
      },
      technical,
      calcSnapshot: {
        inputs: calcInputs,
        result: calcResult,
      },
    };

    const adminSummary = buildAdminSummary({
      id,
      createdAtISO,
      form,
      technical,
      calcInputs,
      calcResult,
    });

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.set("type", "resident_cwu_issue");
      formData.set("id", id);
      formData.set("createdAtISO", createdAtISO);
      formData.set("fullName", form.fullName.trim());
      formData.set("email", form.email.trim());
      formData.set("phone", form.phone.trim());
      formData.set("addressStreet", form.street.trim());
      formData.set("addressBuildingNumber", form.buildingNumber.trim());
      formData.set("addressApartmentNumber", form.apartmentNumber.trim());
      formData.set("problemType", form.problemType);
      formData.set("otherProblem", form.problemType === "inne" ? form.otherProblem.trim() : "");
      formData.set("symptoms", JSON.stringify(form.symptoms));
      formData.set("description", form.description.trim());
      formData.set("goal", form.goal);
      formData.set("technical", JSON.stringify(technical));
      formData.set("calcInputs", JSON.stringify(calcInputs));
      formData.set("calcResult", JSON.stringify(calcResult));
      formData.set("adminSummary", adminSummary);
      formData.set("payloadJson", JSON.stringify(payload));

      const resp = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!resp.ok) {
        const details = await resp.json().catch(() => null);
        throw new Error(details?.error || `Formspree HTTP ${resp.status}`);
      }

      setSubmitted({ id, createdAtISO, adminSummary, payload });
      toast.success("Zgłoszenie wysłane", {
        description: `Numer zgłoszenia: ${id}. Poniżej znajdziesz podsumowanie dla administracji.`,
      });
    } catch (err) {
      toast.error("Nie udało się wysłać zgłoszenia", {
        description: String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl rounded-3xl backdrop-blur-md">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-extrabold text-cyan-200">Zgłoszenie usterki / nieprawidłowości CWU</CardTitle>
        <p className="text-slate-300 mt-2">
          Chcę zgłosić problem z ciepłą wodą lub rozliczeniem CWU. Wypełniam formularz spokojnie i rzeczowo — tak, żeby
          administracja mogła szybko zdiagnozować sytuację. Do zgłoszenia automatycznie dołączane są aktualne wyniki
          obliczeń CWU z tej strony.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <form onSubmit={onSubmit} className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-slate-100">1) Dane mieszkańca</legend>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Imię i nazwisko (wymagane)</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Adres e-mail (wymagany)</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Telefon kontaktowy (opcjonalnie)</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Ulica (wymagane)</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                  value={form.street}
                  onChange={(e) => update("street", e.target.value)}
                  required
                  autoComplete="street-address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Nr budynku (wymagane)</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                  value={form.buildingNumber}
                  onChange={(e) => update("buildingNumber", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Nr mieszkania (wymagane)</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                  value={form.apartmentNumber}
                  onChange={(e) => update("apartmentNumber", e.target.value)}
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-slate-100">2) Rodzaj problemu</legend>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Wybieram opis najlepiej pasujący do sytuacji</label>
              <select
                className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                value={form.problemType}
                onChange={(e) => update("problemType", e.target.value as IssueFormState["problemType"])}
              >
                <option value="brak_cwu">Brak ciepłej wody</option>
                <option value="niska_temp">Zbyt niska temperatura ciepłej wody</option>
                <option value="dlugi_czas">Długi czas oczekiwania na ciepłą wodę</option>
                <option value="wahania">Duże wahania temperatury</option>
                <option value="zawyzony_koszt">Podejrzenie zawyżonych kosztów CWU</option>
                <option value="inne">Inny problem</option>
              </select>
            </div>

            {form.problemType === "inne" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Inny problem (doprecyzuj)</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
                  value={form.otherProblem}
                  onChange={(e) => update("otherProblem", e.target.value)}
                  required
                />
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-slate-100">3) Objawy zauważone przeze mnie</legend>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.symptoms.longFlush}
                  onChange={(e) => updateSymptoms("longFlush", e.target.checked)}
                />
                <span>Ciepła woda pojawia się dopiero po długim spuszczaniu</span>
              </label>
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.symptoms.coolsFast}
                  onChange={(e) => updateSymptoms("coolsFast", e.target.checked)}
                />
                <span>Woda szybko stygnie</span>
              </label>
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.symptoms.unstableTemp}
                  onChange={(e) => updateSymptoms("unstableTemp", e.target.checked)}
                />
                <span>Temperatura jest niestabilna</span>
              </label>
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.symptoms.specificHours}
                  onChange={(e) => updateSymptoms("specificHours", e.target.checked)}
                />
                <span>Problem występuje tylko w określonych godzinach</span>
              </label>
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.symptoms.longTime}
                  onChange={(e) => updateSymptoms("longTime", e.target.checked)}
                />
                <span>Problem występuje od dłuższego czasu</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-slate-100">4) Opis problemu</legend>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Opisuję własnymi słowami, co się dzieje i od kiedy</label>
              <textarea
                className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 min-h-[130px]"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-slate-100">5) Dane techniczne (do odczytu)</legend>
            <p className="text-sm text-slate-300">
              Te wartości są pobierane z aktualnych obliczeń CWU na tej stronie (lub wyliczane jako szacunki). Są dołączane
              do zgłoszenia, żeby ułatwić diagnozę.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-blue-800 bg-blue-950/30">
                <div className="text-xs text-slate-300 uppercase tracking-wide">Obliczona temperatura CWU w budynku</div>
                <div className="text-lg font-bold text-slate-100">{formatNumberPL(technical.cwuTempC, 1)} °C</div>
              </div>
              <div className="p-4 rounded-2xl border border-blue-800 bg-blue-950/30">
                <div className="text-xs text-slate-300 uppercase tracking-wide">Szacowany czas dojścia ciepłej wody</div>
                <div className="text-lg font-bold text-slate-100">{technical.estimatedArrival}</div>
              </div>
              <div className="p-4 rounded-2xl border border-blue-800 bg-blue-950/30">
                <div className="text-xs text-slate-300 uppercase tracking-wide">Obliczone straty na cyrkulacji (%)</div>
                <div className="text-lg font-bold text-slate-100">{formatNumberPL(technical.circulationLossPct, 1)}%</div>
                <div className="text-xs text-slate-300 mt-1">Szacunek na podstawie różnicy kosztów z rachunku.</div>
              </div>
              <div className="p-4 rounded-2xl border border-blue-800 bg-blue-950/30">
                <div className="text-xs text-slate-300 uppercase tracking-wide">Moc źródła ciepła przypisana do budynku</div>
                <div className="text-lg font-bold text-slate-100">{formatNumberPL(technical.sourcePowerkW, 2)} kW</div>
                <div className="text-xs text-slate-300 mt-1">Szacunek (średnia moc wynikająca z Twojego zużycia).</div>
              </div>
              <div className="p-4 rounded-2xl border border-blue-800 bg-blue-950/30 md:col-span-2">
                <div className="text-xs text-slate-300 uppercase tracking-wide">Czy parametry odbiegają od wartości zalecanych</div>
                <div className="text-lg font-bold text-slate-100">{technical.deviation.isDeviation ? "Tak" : "Nie"}</div>
                {technical.deviation.isDeviation && (
                  <div className="text-sm text-slate-300 mt-1">{technical.deviation.reasons.join(" • ")}</div>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-lg font-bold text-slate-100">6) Cel zgłoszenia</legend>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="radio"
                  name="goal"
                  className="mt-1"
                  checked={form.goal === "sprawdzenie"}
                  onChange={() => update("goal", "sprawdzenie")}
                />
                <span>Prośba o sprawdzenie instalacji</span>
              </label>
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="radio"
                  name="goal"
                  className="mt-1"
                  checked={form.goal === "interwencja"}
                  onChange={() => update("goal", "interwencja")}
                />
                <span>Prośba o interwencję techniczną</span>
              </label>
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="radio"
                  name="goal"
                  className="mt-1"
                  checked={form.goal === "analiza_kosztow"}
                  onChange={() => update("goal", "analiza_kosztow")}
                />
                <span>Prośba o analizę kosztów CWU</span>
              </label>
              <label className="flex items-start gap-3 text-slate-200">
                <input
                  type="radio"
                  name="goal"
                  className="mt-1"
                  checked={form.goal === "informacja"}
                  onChange={() => update("goal", "informacja")}
                />
                <span>Informacja do administracji</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-slate-100">7) Zgody i potwierdzenia</legend>
            <label className="flex items-start gap-3 text-slate-200">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.consentContact}
                onChange={(e) => update("consentContact", e.target.checked)}
                required
              />
              <span>Wyrażam zgodę na kontakt w sprawie tego zgłoszenia.</span>
            </label>
            <label className="flex items-start gap-3 text-slate-200">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.consentShareAnalysis}
                onChange={(e) => update("consentShareAnalysis", e.target.checked)}
                required
              />
              <span>Wyrażam zgodę na przekazanie wyników analizy CWU do zarządcy / spółdzielni w celu weryfikacji instalacji.</span>
            </label>
            <label className="flex items-start gap-3 text-slate-200">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.confirmTruth}
                onChange={(e) => update("confirmTruth", e.target.checked)}
                required
              />
              <span>Potwierdzam, że podane informacje są zgodne ze stanem faktycznym (według mojej wiedzy).</span>
            </label>
          </fieldset>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-600/90 text-white"
                disabled={isSubmitting || !form.consentShareAnalysis}
              >
              {isSubmitting ? "Wysyłanie…" : "Wyślij zgłoszenie"}
              </Button>
              {!calcResult && (
                <span className="text-sm text-amber-200">
                  Uwaga: brak wyników obliczeń — zgłoszenie dołączy je automatycznie po wykonaniu kalkulacji.
                </span>
              )}
            </div>

            {!form.consentShareAnalysis && (
              <div className="text-sm text-slate-300">
                Aby wysłać zgłoszenie, zaznacz zgodę na przekazanie wyników analizy CWU do zarządcy / spółdzielni.
              </div>
            )}
          </div>
        </form>

        <div className="p-4 rounded-2xl border border-blue-800 bg-blue-950/20 text-slate-100">
          <div className="text-base font-bold">Co stanie się po zgłoszeniu?</div>
          <ol className="mt-2 space-y-1 text-sm text-slate-200 list-decimal pl-5">
            <li>Zarządca otrzyma analizę strat CWU z tego zgłoszenia.</li>
            <li>Może zlecić audyt instalacji CWU w budynku.</li>
            <li>Audytor oceni możliwe warianty napraw i oszczędności.</li>
            <li>Mieszkańcy otrzymają informację o możliwych działaniach i efektach.</li>
          </ol>
        </div>

        {submitted && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-emerald-700 bg-emerald-950/30 text-slate-100">
              <div className="font-semibold">Potwierdzenie zgłoszenia</div>
              <div className="text-sm text-slate-200">Numer zgłoszenia: <strong>{submitted.id}</strong></div>
              <div className="text-sm text-slate-200">Data: {new Date(submitted.createdAtISO).toLocaleString("pl-PL")}</div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void copyToClipboard(submitted.adminSummary)}
                >
                  Skopiuj podsumowanie dla administracji
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadJson(`zgloszenie-${submitted.id}.json`, submitted.payload)}
                >
                  Pobierz zgłoszenie (JSON)
                </Button>
              </div>
              <textarea
                className="w-full min-h-[260px] px-4 py-3 rounded-2xl border border-blue-800 bg-slate-950/40 text-slate-100 font-mono text-xs"
                readOnly
                value={submitted.adminSummary}
                aria-label="Podsumowanie zgłoszenia dla administracji"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
