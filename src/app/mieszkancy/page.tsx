"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Home, Calculator, TrendingDown, Info as InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KatexFormula } from "@/components/ui/katex-formula";

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
  // Dane do pisma (opcjonalne)
  useLetterData?: boolean;
  managerName?: string;
  managerAddress?: string;
  buildingAddress?: string;
  apartmentNumber?: string;
  residentName?: string;
  letterCity?: string;
  residentEmail?: string;
  residentPhone?: string;
};

export default function MieszkancyPage() {
  const [res, setRes] = useState<Result | null>(null);
  const [inputs, setInputs] = useState<Inputs>({
    cwuPriceFromBill: 65,
    monthlyConsumption: 8.6,
    coldTempC: 10,
    hotTempC: 55,
    heatPriceFromCity: 90,
    useLetterData: false,
  });
  const [showBreakdown, setShowBreakdown] = useState(false);

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
      alert(`Nie udało się wygenerować PDF: ${String(e)}`);
    }
  }

  async function onDownloadReport() {
    if (!res || !inputs) return;
    const { ResidentBillPDFDocument } = await import("@/lib/report/resident-bill-pdf-client");
    const doc = <ResidentBillPDFDocument input={inputs} result={res} />;
    void generatePdfClient(doc, "raport-mieszkancy.pdf");
  }

  async function onDownloadLetter() {
    if (!res || !inputs) return;
    const { ResidentLetterPDFDocument } = await import("@/lib/report/resident-letter-pdf-client");
    // Jeśli checkbox nie jest zaznaczony, przekaż puste dane
    const letterInput = inputs.useLetterData ? inputs : { 
      ...inputs, 
      managerName: '', 
      managerAddress: '', 
      buildingAddress: '', 
      apartmentNumber: '', 
      residentName: '', 
      letterCity: '', 
      residentEmail: '', 
      residentPhone: '' 
    };
    const doc = <ResidentLetterPDFDocument input={letterInput} result={res} />;
    void generatePdfClient(doc, "pismo-do-zarzadcy.pdf");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-sm">
            <Home className="w-4 h-4" />
            Analiza kosztów mieszkańca
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
                Sprawdź swoje
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                rachunki CWU
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Czy płacisz za dużo? Odkryj prawdziwe koszty energii i straty cyrkulacji 
              w Twoim budynku dzięki precyzyjnej analizie.
            </p>
          </div>
        </div>

        {/* Calculator Card */}
        <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl shadow-blue-100/50 dark:shadow-blue-950/50">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              Kalkulator strat na przesyle CWU
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
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
                    Dane z rachunku
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Podgrzanie ciepłej wody" unit="zł/m³" numeric hint="Przepisz wartość z rachunku">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Calculator className="w-4 h-4" />
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
                        className="w-full pl-10 pr-16 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500 text-lg font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm font-medium select-none">zł/m³</span>
                    </div>
                  </Field>
                  <Field label="Zużycie CWU w miesiącu" unit="m³" numeric hint="Wprowadź swoje zużycie z rachunku">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Calculator className="w-4 h-4" />
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
                        className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500 text-lg font-semibold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm font-medium select-none">m³</span>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Technical Parameters */}
              <div className="space-y-6 mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Parametry techniczne
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
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
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
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
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
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
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
                Analiza strat na przesyle CWU
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Porównanie kosztów teoretycznych z rzeczywistymi opłatami
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
                      <TrendingDown className="w-6 h-6 text-white" />
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
                      <TrendingDown className="w-6 h-6 text-white" />
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

            {/* Breakdown button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="px-12 py-8 text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                📊 {showBreakdown ? 'Ukryj' : 'Pokaż'} rozbicie strat na zakresy
              </Button>
            </div>

            {/* Breakdown Analysis */}
            {showBreakdown && inputs && (
              <Card className="backdrop-blur-sm bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    Szczegółowa analiza podziału strat energii
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-emerald-200 dark:border-emerald-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Podział energii na m³ CWU:</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <span className="font-semibold text-blue-800 dark:text-blue-300">
                          ✅ Ciepło faktycznie dostarczone do wody w kranie
                        </span>
                        <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {res.energyPerM3.toFixed(3)} GJ/m³
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <span className="font-semibold text-red-800 dark:text-red-300">
                          ❌ Straty wewnątrz budynku (dystrybucja + cyrkulacja + inne)
                        </span>
                        <span className="text-xl font-bold text-red-900 dark:text-red-100">
                          ~{res.energyLossPerM3.toFixed(3)} GJ/m³
                        </span>
                      </div>
                    </div>
                    
                    {/* Percentages */}
                    <div className="mt-6 p-5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-300 dark:border-slate-700">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-3">Udziały procentowe:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                            {((res.energyPerM3 / (res.energyPerM3 + res.energyLossPerM3)) * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">Energia użyteczna</div>
                        </div>
                        <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <div className="text-3xl font-bold text-red-800 dark:text-red-200">
                            {((res.energyLossPerM3 / (res.energyPerM3 + res.energyLossPerM3)) * 100).toFixed(0)}%
                          </div>
                          <div className="text-sm text-red-700 dark:text-red-300 mt-1">Straty</div>
                        </div>
                      </div>
                      <p className="text-center mt-4 text-slate-600 dark:text-slate-400 font-medium">
                        ≈ {(res.energyLossPerM3 / res.energyPerM3).toFixed(1)}× ponad czystą teorię
                      </p>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 rounded">
                      <p className="text-yellow-800 dark:text-yellow-300 font-medium">
                        <strong>⚠️ To bardzo dużo!</strong> Typowo w blokach po modernizacji da się zejść do 0.22–0.35 GJ/m³ energii całkowitej (czyli straty 15–40%, nie {((res.energyLossPerM3 / (res.energyPerM3 + res.energyLossPerM3)) * 100).toFixed(0)}%).
                      </p>
                    </div>
                  </div>

                  {/* Where losses occur */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border border-emerald-200 dark:border-emerald-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">
                      🔍 Gdzie najczęściej ginie te ~{res.energyLossPerM3.toFixed(3)} GJ/m³?
                    </h3>
                    
                    <div className="space-y-4">
                      <LossItem 
                        percentage="30–50%"
                        title="Cyrkulacja CWU (zbyt duży przepływ + zbyt małe ΔT na pętli)"
                        symptom="Wysoka temp. powrotu (np. 52–55°C), brak 'schłodzenia' rurociągów"
                        energyRange={`${(res.energyLossPerM3 * 0.30).toFixed(3)}–${(res.energyLossPerM3 * 0.50).toFixed(3)} GJ/m³`}
                        costRange={`${(res.lossPerM3 * 0.30).toFixed(2)}–${(res.lossPerM3 * 0.50).toFixed(2)} zł/m³`}
                        color="red"
                      />
                      
                      <LossItem 
                        percentage="10–25%"
                        title="Słaba izolacja pionów/gałązek i węzła"
                        symptom="Piwnice 'grzeją' za darmo"
                        energyRange={`${(res.energyLossPerM3 * 0.10).toFixed(3)}–${(res.energyLossPerM3 * 0.25).toFixed(3)} GJ/m³`}
                        costRange={`${(res.lossPerM3 * 0.10).toFixed(2)}–${(res.lossPerM3 * 0.25).toFixed(2)} zł/m³`}
                        color="orange"
                      />
                      
                      <LossItem 
                        percentage="5–15%"
                        title="Ciągła praca pomp 24/7 bez sterowania temp./nocą"
                        symptom="Pompy pracują non-stop bez optymalizacji"
                        energyRange={`${(res.energyLossPerM3 * 0.05).toFixed(3)}–${(res.energyLossPerM3 * 0.15).toFixed(3)} GJ/m³`}
                        costRange={`${(res.lossPerM3 * 0.05).toFixed(2)}–${(res.lossPerM3 * 0.15).toFixed(2)} zł/m³`}
                        color="amber"
                      />
                      
                      <LossItem 
                        percentage="5–15%"
                        title="Zawory zwrotne nieszczelne/przewiązki → mieszanie CWU z zimną"
                        symptom="'Pseudo-cyrkulacja' i mieszanie temperatur"
                        energyRange={`${(res.energyLossPerM3 * 0.05).toFixed(3)}–${(res.energyLossPerM3 * 0.15).toFixed(3)} GJ/m³`}
                        costRange={`${(res.lossPerM3 * 0.05).toFixed(2)}–${(res.lossPerM3 * 0.15).toFixed(2)} zł/m³`}
                        color="yellow"
                      />
                      
                      <LossItem 
                        percentage="5–10%"
                        title="Za wysoka nastawa mieszacza + antylegionella robiona 'za szeroko'"
                        symptom="Temperatura 60–62°C non stop zamiast 55°C"
                        energyRange={`${(res.energyLossPerM3 * 0.05).toFixed(3)}–${(res.energyLossPerM3 * 0.10).toFixed(3)} GJ/m³`}
                        costRange={`${(res.lossPerM3 * 0.05).toFixed(2)}–${(res.lossPerM3 * 0.10).toFixed(2)} zł/m³`}
                        color="lime"
                      />
                      
                      <LossItem 
                        percentage="5–10%"
                        title="Brak równoważenia pętli cyrkulacyjnej"
                        symptom="Część pętli przegrzana, część niedogrzana"
                        energyRange={`${(res.energyLossPerM3 * 0.05).toFixed(3)}–${(res.energyLossPerM3 * 0.10).toFixed(3)} GJ/m³`}
                        costRange={`${(res.lossPerM3 * 0.05).toFixed(2)}–${(res.lossPerM3 * 0.10).toFixed(2)} zł/m³`}
                        color="green"
                      />
                      
                      <LossItem 
                        percentage="5–10%"
                        title="Rzeczywiste ΔT zimnej wody zimą większe niż w obliczeniach"
                        symptom="Zimna woda wchodzi z inną temperaturą niż założono"
                        energyRange={`${(res.energyLossPerM3 * 0.05).toFixed(3)}–${(res.energyLossPerM3 * 0.10).toFixed(3)} GJ/m³`}
                        costRange={`${(res.lossPerM3 * 0.05).toFixed(2)}–${(res.lossPerM3 * 0.10).toFixed(2)} zł/m³`}
                        color="emerald"
                      />
                    </div>

                    <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        <strong>Uwaga:</strong> Procenty są poglądowe i zależą od stanu technicznego instalacji. 
                        W różnych budynkach dominują różne przyczyny strat. Suma nie zawsze wynosi dokładnie 100%, 
                        ponieważ niektóre czynniki się nakładają lub występują jednocześnie.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Dane do pisma (opcjonalne) - przeniesione na koniec strony */}
            <div className="max-w-6xl mx-auto mt-16 mb-8">
        {/* Przyciski PDF przeniesione na koniec strony */}
        {res && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4 mb-12">
            <Button 
              onClick={onDownloadReport} 
              className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              📄 Pobierz raport PDF
            </Button>
            <Button 
              onClick={onDownloadLetter} 
              className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              ✉️ Pismo do Zarządcy (PDF)
            </Button>
          </div>
        )}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-fuchsia-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Dane do pisma (opcjonalne)
                    </h3>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer px-4 py-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all">
                    <input
                      type="checkbox"
                      checked={inputs.useLetterData || false}
                      onChange={(e) => handleInputChange('useLetterData', e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-white dark:bg-slate-800 border-purple-300 dark:border-purple-700 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                      ✓ Wykorzystaj w piśmie do zarządcy
                    </span>
                  </label>
                </div>
                
                {/* Układ dwukolumnowy: Nadawca (lewa) | Odbiorca (prawa) */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Lewa kolumna - Nadawca (Mieszkaniec) */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300">
                        Nadawca (Mieszkaniec)
                      </h4>
                    </div>
                    <Field label="Imię i nazwisko" optional>
                      <input
                        type="text"
                        placeholder="np. Jan Kowalski"
                        value={inputs.residentName || ''}
                        onChange={(e) => handleInputChange('residentName', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                    <Field label="Numer lokalu" optional>
                      <input
                        type="text"
                        placeholder="np. 12"
                        value={inputs.apartmentNumber || ''}
                        onChange={(e) => handleInputChange('apartmentNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                    <Field label="E-mail" optional>
                      <input
                        type="email"
                        placeholder="np. jan.kowalski@example.com"
                        value={inputs.residentEmail || ''}
                        onChange={(e) => handleInputChange('residentEmail', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                    <Field label="Telefon" optional>
                      <input
                        type="tel"
                        placeholder="np. 600 000 000"
                        value={inputs.residentPhone || ''}
                        onChange={(e) => handleInputChange('residentPhone', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                    <Field label="Miejscowość" optional>
                      <input
                        type="text"
                        placeholder="np. Kraków"
                        value={inputs.letterCity || ''}
                        onChange={(e) => handleInputChange('letterCity', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                  </div>

                  {/* Prawa kolumna - Odbiorca (Zarządca) */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-fuchsia-500 rounded-full"></div>
                      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300">
                        Odbiorca (Zarządca)
                      </h4>
                    </div>
                    <Field label="Nazwa zarządcy" optional>
                      <input
                        type="text"
                        placeholder="np. ABC Zarządzanie Nieruchomościami Sp. z o.o."
                        value={inputs.managerName || ''}
                        onChange={(e) => handleInputChange('managerName', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                    <Field label="Adres zarządcy" optional>
                      <input
                        type="text"
                        placeholder="np. ul. Długa 10, 00-001 Warszawa"
                        value={inputs.managerAddress || ''}
                        onChange={(e) => handleInputChange('managerAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                    <Field label="Adres budynku" optional>
                      <input
                        type="text"
                        placeholder="np. ul. Kwiatowa 5, 30-000 Kraków"
                        value={inputs.buildingAddress || ''}
                        onChange={(e) => handleInputChange('buildingAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

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
          <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide">
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

function LossItem({ percentage, title, symptom, energyRange, costRange, color }: { 
  percentage: string; 
  title: string; 
  symptom: string;
  energyRange?: string;
  costRange?: string;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    red: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-300', badge: 'bg-red-500 text-white' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-800 dark:text-orange-300', badge: 'bg-orange-500 text-white' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-300', badge: 'bg-amber-500 text-white' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-300', badge: 'bg-yellow-500 text-white' },
    lime: { bg: 'bg-lime-50 dark:bg-lime-950/20', border: 'border-lime-200 dark:border-lime-800', text: 'text-lime-800 dark:text-lime-300', badge: 'bg-lime-500 text-white' },
    green: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-800 dark:text-green-300', badge: 'bg-green-500 text-white' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-500 text-white' },
  };
  
  const colors = colorClasses[color] || colorClasses.red;
  
  return (
    <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
      <div className="flex items-start gap-3">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${colors.badge} shrink-0`}>
          {percentage}
        </span>
        <div className="flex-1">
          <h4 className={`font-semibold ${colors.text} mb-1`}>{title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">
            <strong>Objaw:</strong> {symptom}
          </p>
          {(energyRange || costRange) && (
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 mt-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded">
              {energyRange && (
                <div>
                  <strong>Energia:</strong> {energyRange}
                </div>
              )}
              {costRange && (
                <div>
                  <strong>Koszt:</strong> {costRange}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
