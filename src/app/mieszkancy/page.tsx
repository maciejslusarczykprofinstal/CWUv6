"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Home, Calculator, ArrowDown, Info as InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KatexFormula } from "@/components/ui/katex-formula";
import { toast } from "sonner";
import { ResidentCwuIssueForm } from "./ResidentCwuIssueForm";
import { ResidentCwuComplaintLetterSection } from "./ResidentCwuComplaintLetterSection";

type Result = {
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

type Inputs = {
  cwuPriceFromBill: number;
  monthlyConsumption: number;
  coldTempC: number;
  hotTempC: number;
  heatPriceFromCity: number;
};

export default function MieszkancyPage() {
  const [res, setRes] = useState<Result | null>(null);
  const [inputs, setInputs] = useState<Inputs>({
    cwuPriceFromBill: 65,
    monthlyConsumption: 8.6,
    coldTempC: 10,
    hotTempC: 55,
    heatPriceFromCity: 90,
  });

  // Automatyczna kalkulacja przy zmianie inputów
  function calculateResults(inp: Inputs) {
    try {
      const deltaT = inp.hotTempC - inp.coldTempC; // K
      const energyPerM3 = 0.004186 * deltaT; // GJ/m³
      const theoreticalCostPerM3 = energyPerM3 * inp.heatPriceFromCity; // zł/m³
      const lossPerM3 = inp.cwuPriceFromBill - theoreticalCostPerM3; // zł/m³
      const energyLossPerM3 = lossPerM3 / inp.heatPriceFromCity; // GJ/m³

      const monthlyFinancialLoss = lossPerM3 * inp.monthlyConsumption; // zł/miesiąc
      const monthlyEnergyLoss = energyLossPerM3 * inp.monthlyConsumption; // GJ/miesiąc
      const yearlyFinancialLoss = monthlyFinancialLoss * 12; // zł/rok
      const yearlyEnergyLoss = monthlyEnergyLoss * 12; // GJ/rok

      const theoreticalMonthlyPayment = theoreticalCostPerM3 * inp.monthlyConsumption;
      const actualMonthlyPayment = inp.cwuPriceFromBill * inp.monthlyConsumption;

      const result: Result = {
        energyLossPerM3: Number(energyLossPerM3.toFixed(4)),
        lossPerM3: Number(lossPerM3.toFixed(2)),
        monthlyFinancialLoss: Number(monthlyFinancialLoss.toFixed(2)),
        monthlyEnergyLoss: Number(monthlyEnergyLoss.toFixed(3)),
        yearlyFinancialLoss: Number(yearlyFinancialLoss.toFixed(2)),
        yearlyEnergyLoss: Number(yearlyEnergyLoss.toFixed(3)),
        theoreticalCostPerM3: Number(theoreticalCostPerM3.toFixed(2)),
        theoreticalMonthlyPayment: Number(theoreticalMonthlyPayment.toFixed(2)),
        actualMonthlyPayment: Number(actualMonthlyPayment.toFixed(2)),
        energyPerM3: Number(energyPerM3.toFixed(4)),
      };

      setRes(result);
    } catch (error) {
      console.error("Błąd obliczeń:", error);
      setRes(null);
    }
  }

  // Wykonaj kalkulację przy montowaniu i przy zmianie inputs
  useEffect(() => {
    calculateResults(inputs);
  }, [inputs]);

  function handleInputChange(field: keyof Inputs, value: number | string | boolean) {
    setInputs(prev => ({ ...prev, [field]: value }));
  }

  async function generatePdfClient(docComponent: React.ReactElement, filename: string) {
    if (typeof window === "undefined") return;
    try {
      // Dynamiczny import @react-pdf/renderer po stronie klienta
      const { pdf } = await import("@react-pdf/renderer");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(docComponent as any).toBlob();
      const objectUrl = URL.createObjectURL(blob);
      // Spróbuj otworzyć w nowej karcie
      const w = window.open(objectUrl, "_blank");
      if (!w) {
        // Fallback: wymuś pobranie przez tymczasowe <a download>
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      // Sprzątanie po chwili
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    } catch (e) {
      toast.error("Nie udało się wygenerować PDF", { description: String(e) });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      {/* Dekoracyjne gradientowe blury w tle */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Mieszkańcy Analiza strat CWU
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mt-4">
            Płacisz za ciepło, którego nawet nie używasz. Serio.<br />
            W wielu blokach nawet 2/3 kosztów ogrzewania wody znika w ścianach, piwnicach i źle ustawionej cyrkulacji. A Ty dostajesz tylko jedno: coraz wyższe rachunki. Podwyżki? Będą. Bo jeśli instalacja marnuje energię, to ktoś za to musi zapłacić — i zwykle są to mieszkańcy.<br /><br />
            A teraz najlepsze: te straty da się ograniczyć. I to nie kosmetycznie.<br />
            Dobrze przeprowadzona termomodernizacja, regulacja przepływów i modernizacja instalacji CWU potrafią obniżyć koszty nawet o 20–60%. To realne pieniądze, które mogą zostać w Twojej kieszeni zamiast uciekać do sieci ciepłowniczej.<br /><br />
            Co więcej — zarządcy i spółdzielnie mają obowiązek dbać o efektywność instalacji i minimalizację strat. Prawo jest tu jasne. Jeśli budynek przepłaca, to nie jest „naturalny koszt ciepła”, tylko brak działań po stronie administracji.<br /><br />
            Jeśli chcesz wiedzieć, ile Twój blok traci i ile można odzyskać, sprawdzimy to za Ciebie.<br />
            Konkretnie, szybko i technicznie — ale w sposób zrozumiały dla mieszkańców.<br /><br />
            Zatrzymaj straty. Zatrzymaj podwyżki. Zacznij oszczędzać.
          </p>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {/* usunięto drugi opis zgodnie z nową wersją tekstu */}
          </p>
        </div>

        {/* Calculator Card */}
  <Card className="bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl rounded-3xl backdrop-blur-md">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-extrabold text-cyan-200">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator className="w-7 h-7 text-cyan-200" />
              </div>
              Kalkulator strat na przesyle CWU
            </CardTitle>
            <p className="text-slate-400 mt-2">
              Oblicz straty finansowe na przesyle ciepłej wody użytkowej w budynku
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-8">
              {/* Basic Parameters */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    <span className="text-cyan-200">Dane z rachunku</span>
                  </h3>
                  <p className="text-base font-medium text-white bg-blue-900/80 rounded-xl px-4 py-3 mt-2 shadow-md">
                    Przepisz dane z rachunku. Interesuje nas tylko ile płacisz za podgrzanie ciepłej wody użytkowej. Podaj również swoje zużycie miesięczne, a obliczymy ile płacisz za ciepłą wodę, którą masz w kranie, a ile procent z Twoich opłat idzie na pokrycie strat wewnątrzbudynkowych.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Podgrzanie ciepłej wody" unit="zł/m³" numeric hint="Przepisz wartość z rachunku">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Calculator className="w-4 h-4 text-cyan-200" />
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        placeholder="np. 65.00"
                        value={inputs.cwuPriceFromBill}
                        onChange={(e) => handleInputChange('cwuPriceFromBill', Number(e.target.value))}
                        aria-label="Podgrzanie ciepłej wody w zł za metr sześcienny"
                        className="w-full pl-10 pr-16 py-3 border-2 border-blue-400 dark:border-blue-400 rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-400 dark:focus:border-blue-400 transition-all placeholder-slate-400 dark:placeholder-slate-400 text-lg font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-sm font-medium select-none">zł/m³</span>
                    </div>
                  </Field>
                  <Field label="Zużycie CWU w miesiącu" unit="m³" numeric hint="Wprowadź swoje zużycie z rachunku">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Calculator className="w-4 h-4 text-cyan-200" />
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        inputMode="decimal"
                        placeholder="np. 8.6"
                        value={inputs.monthlyConsumption}
                        onChange={(e) => handleInputChange('monthlyConsumption', Number(e.target.value))}
                        aria-label="Zużycie CWU w metrach sześciennych na miesiąc"
                        className="w-full pl-10 pr-12 py-3 border-2 border-blue-400 dark:border-blue-400 rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-400 dark:focus:border-blue-400 transition-all placeholder-slate-400 dark:placeholder-slate-400 text-lg font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-sm font-medium select-none">m³</span>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Technical Parameters */}
              <div className="space-y-6 mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    <span className="text-cyan-200">Parametry techniczne</span>
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <Field 
                    label="Temperatura zimnej wody" 
                    unit="°C" 
                    hint="Wartość zalecana: 10°C (zgodnie z PN-92/B-01706 oraz PN-EN 15316-3-1)"
                  >
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.coldTempC}
                      onChange={(e) => handleInputChange('coldTempC', Number(e.target.value))}
                      placeholder="Zalecane: 10°C"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-400"
                    />
                  </Field>
                  <Field 
                    label="Temperatura CWU" 
                    unit="°C" 
                    hint="Wartość obowiązkowa: min 55°C (zgodnie z Rozporządzeniem Ministra Infrastruktury z dnia 12 kwietnia 2002 r. w sprawie warunków technicznych, jakim powinny odpowiadać budynki i ich usytuowanie - WT)"
                  >
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.hotTempC}
                      onChange={(e) => handleInputChange('hotTempC', Number(e.target.value))}
                      placeholder="Obowiązkowo: min 55°C"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-400"
                    />
                  </Field>
                  <Field 
                    label="Cena ciepła od miasta" 
                    unit="zł/GJ" 
                    hint="Wartość z cennika: 90 zł/GJ (źródło: https://www.mpec.krakow.pl/taryfy-i-cenniki - MPEC Kraków 2025)"
                  >
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.heatPriceFromCity}
                      onChange={(e) => handleInputChange('heatPriceFromCity', Number(e.target.value))}
                      placeholder="Z cennika: 90 zł/GJ"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-400"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {res && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl text-4xl font-extrabold tracking-tight">
                  WYNIKI
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                <span className="bg-gradient-to-r from-white via-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-xl text-xl font-extrabold tracking-tight">
                  Porównanie kosztów teoretycznych z rzeczywistymi opłatami
                </span>
              </p>
            </div>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                        Strata na m³
                      </p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {res.lossPerM3.toFixed(2)} zł/m³
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-2">
                        Strata miesięczna
                      </p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                        {res.monthlyFinancialLoss.toFixed(2)} zł
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                      <ArrowDown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                        Strata roczna
                      </p>
                      <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                        {res.yearlyFinancialLoss.toFixed(2)} zł
                      </p>
                    </div>
                    <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                      <ArrowDown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                  Szczegółowe wyniki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <Info 
                    label="Koszt teoretyczny za podgrzanie 1 m³ ciepłej wody" 
                    value={`${res.theoreticalCostPerM3.toFixed(2)} zł/m³`} 
                    formula={"C_{teor,m^3} = E_{m^3} \\times C_{GJ}"}
                    symbolsExplanation={"C_teor,m³ — koszt teoretyczny podgrzania 1 m³ wody [zł/m³]\nE_m³ — energia potrzebna do podgrzania 1 m³ wody [GJ/m³]\nC_GJ — cena ciepła od dostawcy [zł/GJ]"}
                    substitution={inputs ? `= ${res.energyPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} × ${inputs.heatPriceFromCity.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${res.theoreticalCostPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł/m³` : undefined}
                    unitsNote={"zł/m³ — koszt w złotych za 1 m³ wody (energia [GJ/m³] × cena [zł/GJ])."}
                  />
                  <Info 
                    label="TEORETYCZNA ENERGIA POTRZEBNA DO PODGRZANIA 1 m³ WODY" 
                    value={`${res.energyPerM3.toFixed(4)} GJ/m³`} 
                    formula={"E_{m^3} = 0{,}004186 \\times (T_{CWU} - T_{zimna})"}
                    symbolsExplanation={"E_m³ — energia potrzebna do podgrzania 1 m³ wody [GJ/m³]\n0,004186 — współczynnik konwersji (ciepło właściwe wody × gęstość) [GJ/(m³·K)]\nT_CWU — temperatura ciepłej wody użytkowej [°C]\nT_zimna — temperatura wody zimnej [°C]"}
                    substitution={inputs ? `= 0,004186 × (${inputs.hotTempC.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} − ${inputs.coldTempC.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}) = ${res.energyPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} GJ/m³` : undefined}
                    unitsNote={"GJ/m³ — energia w gigadżulach potrzebna na podgrzanie 1 m³ wody."}
                  />
                  <Info 
                    label="Strata energii na m³" 
                    value={`${res.energyLossPerM3.toFixed(4)} GJ/m³`} 
                    formula={"E_{strata,m^3} = \\frac{C_{CWU,m^3} - C_{teor,m^3}}{C_{GJ}}"}
                    symbolsExplanation={"E_strata,m³ — energia stracona na przesyle na 1 m³ [GJ/m³]\nC_CWU,m³ — cena CWU z rachunku [zł/m³]\nC_teor,m³ — koszt teoretyczny podgrzania [zł/m³]\nC_GJ — cena ciepła od dostawcy [zł/GJ]"}
                    substitution={inputs ? `= (${inputs.cwuPriceFromBill.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} − ${res.theoreticalCostPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) / ${inputs.heatPriceFromCity.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${res.energyLossPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} GJ/m³` : undefined}
                    unitsNote={"GJ/m³ — energia utracona na przesyle na 1 m³ ciepłej wody."}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <Info 
                    label="Płatność teoretyczna (miesiąc)" 
                    value={`${res.theoreticalMonthlyPayment.toFixed(2)} zł`} 
                    formula={"P_{teor} = C_{teor,m^3} \\times V_{mies}"}
                    symbolsExplanation={"P_teor — płatność teoretyczna miesięczna [zł]\nC_teor,m³ — koszt teoretyczny za 1 m³ [zł/m³]\nV_mies — zużycie CWU w miesiącu [m³]"}
                    substitution={inputs ? `= ${res.theoreticalCostPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${inputs.monthlyConsumption.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} = ${res.theoreticalMonthlyPayment.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł` : undefined}
                    unitsNote={"zł — kwota oszacowana dla miesięcznego zużycia."}
                  />
                  <Info 
                    label="Rzeczywista płatność (miesiąc)" 
                    value={`${res.actualMonthlyPayment.toFixed(2)} zł`} 
                    formula={"P_{rzecz} = C_{CWU,m^3} \\times V_{mies}"}
                    symbolsExplanation={"P_rzecz — płatność rzeczywista miesięczna [zł]\nC_CWU,m³ — cena CWU z rachunku [zł/m³]\nV_mies — zużycie CWU w miesiącu [m³]"}
                    substitution={inputs ? `= ${inputs.cwuPriceFromBill.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${inputs.monthlyConsumption.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} = ${res.actualMonthlyPayment.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł` : undefined}
                    unitsNote={"zł — faktyczna kwota dla miesięcznego zużycia."}
                  />
                </div>
              </CardContent>
            </Card>

            {/* ...przyciski PDF przeniesione na koniec strony... */}


            {/* Energy Loss Analysis */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                  Analiza strat energii
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          Miesięczne straty energii
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {res.monthlyEnergyLoss.toFixed(3)} GJ trafia na straty w przesyle wewnątrz budynku.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          Roczne straty energii
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {res.yearlyEnergyLoss.toFixed(3)} GJ rocznie marnuje się w systemie przesyłu CWU.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-xl backdrop-blur-sm">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Zasada zachowania energii
                      </h4>
                      <p className="text-blue-700 dark:text-blue-400 leading-relaxed text-sm">
                        Różnica między ceną płaconą przez mieszkańca ({res.actualMonthlyPayment.toFixed(2)} zł) 
                        a kosztem teoretycznym ({res.theoreticalMonthlyPayment.toFixed(2)} zł) 
                        odpowiada stracie energii w systemie przesyłu CWU w budynku.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ResidentCwuComplaintLetterSection
              inputs={inputs}
              result={res}
              generatePdf={generatePdfClient}
            />

            <ResidentCwuIssueForm calcInputs={inputs} calcResult={res} />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, unit, children, optional = false, numeric = false, hint }: { 
  label: string; 
  unit?: string;
  children: ReactNode; 
  optional?: boolean;
  numeric?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
        {unit && <span className="text-slate-500 dark:text-slate-400 font-normal"> ({unit})</span>}
        {optional && <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">(opcjonalne)</span>}
        {numeric && (
          <span
            className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide border border-blue-400 dark:border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 shadow-sm"
          >
            WARTOŚĆ Z RACHUNKU
          </span>
        )}
      </label>
      {hint && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {children}
    </div>
  );
}

function Info({ label, value, formula, substitution, unitsNote, symbolsExplanation }: { 
  label: string; 
  value: string; 
  formula?: string; 
  substitution?: string; 
  unitsNote?: string;
  symbolsExplanation?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">
        {label}
      </div>
      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
        {value}
      </div>
      {(formula || substitution || unitsNote || symbolsExplanation) && (
        <details className="mt-2">
          <summary className="cursor-pointer select-none text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <InfoIcon className="w-3.5 h-3.5" />
            Szczegóły obliczeń
          </summary>
          <div className="mt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {formula && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-slate-700 dark:text-slate-300 shrink-0">Wzór:</span>
                <div className="inline-block px-3 py-1.5 rounded border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/60">
                  <KatexFormula formula={formula} />
                </div>
              </div>
            )}
            {symbolsExplanation && (
              <div className="pl-2 border-l-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-2 rounded-r">
                <span className="font-medium text-blue-800 dark:text-blue-300 block mb-1">Objaśnienie symboli:</span>
                <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {symbolsExplanation}
                </div>
              </div>
            )}
            {substitution && (
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Podstawienie:</span>{" "}
                <code
                  className="align-middle inline-block px-2 py-1 rounded border border-slate-200/60 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/40 tabular-nums"
                  style={{ fontFamily: "var(--font-math)" }}
                >
                  {substitution}
                </code>
              </div>
            )}
            {unitsNote && (
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Jednostki:</span> {unitsNote}
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
