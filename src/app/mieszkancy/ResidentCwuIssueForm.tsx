"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function generateAuditToken(): string {
  try {
    if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
  } catch {
    // pomijamy
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function ensureAuditorToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = (window.localStorage.getItem("residentCwuAuditToken") ?? "").trim();
    if (existing.length > 0) return existing;
    const created = generateAuditToken();
    window.localStorage.setItem("residentCwuAuditToken", created);
    return created;
  } catch {
    return null;
  }
}

function buildAuditorPath(token: string): string {
  return `/audytor?auditToken=${encodeURIComponent(token)}`;
}

function notifyPdfGenerationUnavailable() {
  toast.info("Funkcja generowania PDF będzie dostępna w kolejnym etapie", {
    description: "Na tym etapie zapisujemy zgłoszenie i dane obliczeń bez pliku PDF.",
  });
}

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
  buildingApartmentsCount: string;

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

function buildExampleIssueDescription(params: {
  calcInputs: CalcInputsSnapshot;
  calcResult: CalcResultSnapshot | null;
}): string {
  const { calcInputs, calcResult } = params;

  const intro =
    "Zgłaszam prośbę o sprawdzenie zasadności kosztów podgrzewania ciepłej wody użytkowej w moim lokalu. Od dłuższego czasu zauważam, że opłaty za CWU są wyraźnie wyższe niż można by się spodziewać przy normalnym użytkowaniu mieszkania (Kraków, budynek wielorodzinny).\n\n" +
    "Dodatkowo występują problemy użytkowe, takie jak długi czas oczekiwania na ciepłą wodę oraz okresowe wahania jej temperatury. Zdarza się również, że w godzinach porannych i wieczornych dostęp do ciepłej wody jest utrudniony lub wymaga długiego spuszczania.\n\n";

  const numbers = (() => {
    if (!calcResult) {
      return (
        "Na podstawie dostępnych obliczeń wykonanych na tej stronie wynika, że rzeczywiste koszty podgrzewania CWU mogą odbiegać od wartości, które pojawiają się w rozliczeniach. " +
        "Wyniki te zostały automatycznie dołączone do niniejszego zgłoszenia.\n\n"
      );
    }

    const bill = Number(calcInputs.cwuPriceFromBill) || 0;
    const theoretical = Number(calcResult.theoreticalCostPerM3) || 0;
    const lossPerM3 = Number(calcResult.lossPerM3) || 0;
    const monthlyLoss = Math.max(0, Number(calcResult.monthlyFinancialLoss) || 0);
    const yearlyLoss = Math.max(0, Number(calcResult.yearlyFinancialLoss) || 0);

    const lossPct = (() => {
      if (!Number.isFinite(bill) || bill <= 0) return 0;
      const pct = (lossPerM3 / bill) * 100;
      return Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    })();

    const billLabel = bill > 0 ? `${formatNumberPL(bill, 2)} zł/m³` : "—";
    const theoreticalLabel = theoretical > 0 ? `${formatNumberPL(theoretical, 2)} zł/m³` : "—";
    const lossPerM3Label = lossPerM3 > 0 ? `${formatNumberPL(lossPerM3, 2)} zł/m³` : "—";
    const lossPctLabel = lossPct > 0 ? `${formatNumberPL(lossPct, 0)}%` : "—";
    const monthlyLossLabel = `${formatNumberPL(monthlyLoss, 2)} zł/mies.`;
    const yearlyLossLabel = `${formatNumberPL(yearlyLoss, 2)} zł/rok`;

    return (
      "Na podstawie dostępnych obliczeń wykonanych na tej stronie wynika, że rzeczywiste koszty podgrzewania CWU mogą odbiegać od wartości, które pojawiają się w rozliczeniach. " +
      `W moim przypadku koszt z rozliczeń wynosi około ${billLabel}, natomiast wartość porównawcza z obliczeń to około ${theoreticalLabel}. ` +
      `Różnica wynosi orientacyjnie ${lossPerM3Label} na 1 m³, co przekłada się na około ${monthlyLossLabel} miesięcznie i około ${yearlyLossLabel} rocznie. ` +
      `W ujęciu procentowym odpowiada to orientacyjnie około ${lossPctLabel} w relacji do kosztu z rozliczeń. ` +
      "Wyniki te zostały automatycznie dołączone do niniejszego zgłoszenia.\n\n"
    );
  })();

  const closing =
    "Uprzejmie proszę o weryfikację działania instalacji CWU oraz sposobu rozliczania kosztów, a także o przekazanie informacji, czy występują czynniki mogące powodować zwiększone koszty energii związane z przygotowaniem ciepłej wody.\n\n" +
    "Zależy mi na spokojnym wyjaśnieniu sytuacji i na tym, aby koszty CWU były zrozumiałe, racjonalne i przewidywalne dla mieszkańców.";

  return `${intro}${numbers}${closing}`;
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
  onAuditStatusChange?: (status: "READY_FOR_AUDIT") => void;
}) {
  const { calcInputs, calcResult, onAuditStatusChange } = props;

  const exampleDescription = useMemo(
    () => buildExampleIssueDescription({ calcInputs, calcResult }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      calcInputs.cwuPriceFromBill,
      calcInputs.monthlyConsumption,
      calcInputs.coldTempC,
      calcInputs.hotTempC,
      calcInputs.heatPriceFromCity,
      calcResult?.theoreticalCostPerM3,
      calcResult?.lossPerM3,
      calcResult?.monthlyFinancialLoss,
      calcResult?.yearlyFinancialLoss,
    ]
  );

  const baseEmptyForm = useMemo<IssueFormState>(
    () => ({
      fullName: calcInputs.residentName ?? "",
      email: calcInputs.residentEmail ?? "",
      phone: calcInputs.residentPhone ?? "",
      street: calcInputs.buildingAddress ?? "",
      buildingNumber: "",
      apartmentNumber: calcInputs.apartmentNumber ?? "",
      buildingApartmentsCount: "",

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
    }),
    [calcInputs]
  );

  const examplePreset = useMemo<IssueFormState>(
    () => ({
      ...baseEmptyForm,
      // przykładowe dane — edytowalne / usuwalne
      fullName: (baseEmptyForm.fullName ?? "").trim() ? baseEmptyForm.fullName : "Jan Kowalski",
      email: (baseEmptyForm.email ?? "").trim() ? baseEmptyForm.email : "jan.kowalski@example.com",
      street: (baseEmptyForm.street ?? "").trim() ? baseEmptyForm.street : "ul. Przykładowa",
      buildingNumber: (baseEmptyForm.buildingNumber ?? "").trim() ? baseEmptyForm.buildingNumber : "12",
      apartmentNumber: (baseEmptyForm.apartmentNumber ?? "").trim() ? baseEmptyForm.apartmentNumber : "34",
      buildingApartmentsCount: (baseEmptyForm.buildingApartmentsCount ?? "").trim()
        ? baseEmptyForm.buildingApartmentsCount
        : "40",

      problemType: "zawyzony_koszt",
      symptoms: {
        longFlush: true,
        coolsFast: false,
        unstableTemp: true,
        specificHours: true,
        longTime: true,
      },
      goal: "analiza_kosztow",
      description: exampleDescription,

      // zgody zawsze muszą zostać świadomie zaznaczone
      consentContact: false,
      consentShareAnalysis: false,
      confirmTruth: false,
    }),
    [baseEmptyForm, exampleDescription]
  );

  const [form, setForm] = useState<IssueFormState>(() => examplePreset);

  const [submitted, setSubmitted] = useState<{
    id: string;
    createdAtISO: string;
    adminSummary: string;
    payload: unknown;
    pdf: { id: string; filename: string } | null;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  function applyExamplePreset() {
    setForm(examplePreset);
  }

  function clearExamplePreset() {
    setForm(baseEmptyForm);
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

  async function onGeneratePdfOnly() {
    if (isGeneratingPdf || isSubmitting) return;
    notifyPdfGenerationUnavailable();
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

    // Otwieramy okno audytora od razu (żeby ominąć blokadę popupów), a URL podstawimy po zapisie.
    const auditorWindow = typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;

    const buildingApartmentsCount = (() => {
      const raw = (form.buildingApartmentsCount ?? "").trim();
      if (!raw) return null;
      const n = Math.round(Number(raw));
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    })();

    const payload = {
      id,
      createdAtISO,
      kind: "resident_cwu_issue" as const,
      building: {
        apartmentsCount: buildingApartmentsCount,
      },
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

      // PDF generowanie jest celowo wyłączone na tym etapie projektu.
      // Zapisujemy zgłoszenie i kontekst obliczeń bez pliku PDF.

      // 2) Zapisz dane + pdfId w systemie (localStorage)
      try {
        if (typeof window !== "undefined") {
          const record = {
            id,
            createdAtISO,
            inputs: calcInputs,
            result: calcResult,
            pdf: null,
            building: { apartmentsCount: buildingApartmentsCount },
            // Dodatkowe dane (audytor może je odczytać, jeśli potrzeba)
            adminSummary,
            payload,
          };
          window.localStorage.setItem(`residentCwuAuditContext:issue-${id}`, JSON.stringify(record));
          window.localStorage.setItem("residentCwuAuditStatus", "READY_FOR_AUDIT");
        }
      } catch {
        // UI-only: jeśli localStorage jest niedostępny, pomijamy
      }

      setSubmitted({ id, createdAtISO, adminSummary, payload, pdf: null });

      toast.success("Zgłoszenie zapisane w systemie audytowym", {
        description: "Audytor otrzymał dostęp do danych. PDF będzie dostępny w kolejnym etapie.",
      });

      notifyPdfGenerationUnavailable();

      onAuditStatusChange?.("READY_FOR_AUDIT");

      // 3) Otwórz /audytor w nowej karcie (bez przekierowania /mieszkancy)
      try {
        const token = ensureAuditorToken();
        const url = (() => {
          if (typeof window === "undefined") return token ? buildAuditorPath(token) : "/audytor";
          const base = window.location.origin;
          return token ? `${base}${buildAuditorPath(token)}` : `${base}/audytor`;
        })();

        if (auditorWindow) {
          auditorWindow.location.href = url;
        } else if (typeof window !== "undefined") {
          window.open(url, "_blank");
        }
      } catch {
        // pomijamy
      }
    } catch (err) {
      try {
        if (auditorWindow) auditorWindow.close();
      } catch {
        // pomijamy
      }

      toast.error("Nie udało się zapisać zgłoszenia", {
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
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Ile mieszkań znajduje się w Twoim budynku?</label>
            <input
              type="number"
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-2xl border-2 border-blue-400 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600"
              placeholder="np. 40"
              value={form.buildingApartmentsCount}
              onChange={(e) => update("buildingApartmentsCount", e.target.value)}
            />
            <div className="text-xs text-slate-200">
              Przybliżona liczba – pozwala ocenić skalę problemu w całym budynku.
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-blue-800 bg-blue-950/20 text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold">Przykład (edytowalny)</div>
                <div className="text-sm text-slate-200">
                  Pola poniżej są wstępnie wypełnione realistycznym przykładem zgłoszenia dotyczącego zawyżonych kosztów CWU.
                  Możesz je dowolnie edytować lub wyczyścić.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={applyExamplePreset}>
                  Wstaw przykład
                </Button>
                <Button type="button" variant="outline" onClick={clearExamplePreset}>
                  Wyczyść
                </Button>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-200">
              Automatycznie dołączane do zgłoszenia: aktualne wyniki obliczeń CWU z tej strony (snapshot), dane budynku, data utworzenia.
            </div>
          </div>

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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-600/90 text-white"
                disabled={isSubmitting || !form.consentShareAnalysis}
              >
              {isSubmitting ? "Przetwarzanie…" : "Wyślij zgłoszenie"}
              </Button>

              <Button
                type="button"
                className="bg-cyan-600 hover:bg-cyan-600/90 text-white"
                disabled={isSubmitting || isGeneratingPdf}
                onClick={() => void onGeneratePdfOnly()}
              >
                {isGeneratingPdf ? "Generowanie…" : "Zgłoszenie PDF"}
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
            <li>Zgłoszenie zostanie zapisane w systemie audytowym.</li>
            <li>Automatycznie zostanie wygenerowany plik PDF „Zgłoszenie strat CWU”.</li>
            <li>Panel audytora otworzy się w nowej karcie (bez opuszczania tej strony).</li>
            <li>Dalsze działania (kontakt z zarządcą / audyt) odbywają się poza tym formularzem.</li>
          </ol>
        </div>

        {submitted && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-emerald-700 bg-emerald-950/30 text-slate-100">
              <div className="font-semibold">Potwierdzenie zgłoszenia</div>
              <div className="text-sm text-slate-200">
                Zgłoszenie zostało zapisane w systemie audytowym. Audytor otrzymał dostęp do danych i pliku PDF.
              </div>
              <div className="text-sm text-slate-200">Numer zgłoszenia: <strong>{submitted.id}</strong></div>
              <div className="text-sm text-slate-200">Data: {new Date(submitted.createdAtISO).toLocaleString("pl-PL")}</div>
              {submitted.pdf ? (
                <div className="text-xs text-slate-300">PDF ID: {submitted.pdf.id} ({submitted.pdf.filename})</div>
              ) : (
                <div className="text-xs text-slate-300">PDF: niedostępne (funkcja będzie dostępna w kolejnym etapie)</div>
              )}
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
