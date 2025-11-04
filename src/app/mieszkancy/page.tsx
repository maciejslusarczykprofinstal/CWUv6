"use client";

import { useState, type ReactNode } from "react";
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
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<Inputs | null>(null);

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
    const doc = <ResidentLetterPDFDocument input={inputs} result={res} />;
    void generatePdfClient(doc, "pismo-do-zarzadcy.pdf");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const cwuPriceFromBill = Number(form.get("cwuPriceFromBill"));
    const monthlyConsumption = Number(form.get("monthlyConsumption"));
    const coldTempC = Number(form.get("coldTempC"));
    const hotTempC = Number(form.get("hotTempC"));
    const heatPriceFromCity = Number(form.get("heatPriceFromCity"));
  // Opcjonalne dane do pisma
  const managerName = String(form.get("managerName") ?? "").trim();
  const managerAddress = String(form.get("managerAddress") ?? "").trim();
  const buildingAddress = String(form.get("buildingAddress") ?? "").trim();
  const apartmentNumber = String(form.get("apartmentNumber") ?? "").trim();
  const residentName = String(form.get("residentName") ?? "").trim();
  const letterCity = String(form.get("letterCity") ?? "").trim();
  const residentEmail = String(form.get("residentEmail") ?? "").trim();
  const residentPhone = String(form.get("residentPhone") ?? "").trim();

    try {
      const deltaT = hotTempC - coldTempC; // K
      const energyPerM3 = 0.004186 * deltaT; // GJ/m³
      const theoreticalCostPerM3 = energyPerM3 * heatPriceFromCity; // zł/m³
      const lossPerM3 = cwuPriceFromBill - theoreticalCostPerM3; // zł/m³
      const energyLossPerM3 = lossPerM3 / heatPriceFromCity; // GJ/m³

      const monthlyFinancialLoss = lossPerM3 * monthlyConsumption; // zł/miesiąc
      const monthlyEnergyLoss = energyLossPerM3 * monthlyConsumption; // GJ/miesiąc
      const yearlyFinancialLoss = monthlyFinancialLoss * 12; // zł/rok
      const yearlyEnergyLoss = monthlyEnergyLoss * 12; // GJ/rok

      const theoreticalMonthlyPayment = theoreticalCostPerM3 * monthlyConsumption;
      const actualMonthlyPayment = cwuPriceFromBill * monthlyConsumption;

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
      setInputs({
        cwuPriceFromBill,
        monthlyConsumption,
        coldTempC,
        hotTempC,
        heatPriceFromCity,
        managerName,
        managerAddress,
        buildingAddress,
        apartmentNumber,
        residentName,
        letterCity,
        residentEmail,
        residentPhone,
      });
    } catch (error) {
      alert("Błąd obliczeń: " + error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
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
            <form onSubmit={onSubmit} className="space-y-8">
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
                        name="cwuPriceFromBill"
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        placeholder="np. 65.00"
                        defaultValue={65}
                        aria-label="Podgrzanie ciepłej wody w zł za metr sześcienny"
                        className="w-full pl-10 pr-16 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500 text-lg font-semibold"
                        required
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
                        name="monthlyConsumption"
                        type="number"
                        step="0.1"
                        min="0"
                        inputMode="decimal"
                        placeholder="np. 3.5"
                        defaultValue={3.5}
                        aria-label="Zużycie CWU w metrach sześciennych na miesiąc"
                        className="w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500 text-lg font-semibold"
                        required
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
                  <Field label="Temperatura zimnej wody" unit="°C" hint="zgodnie z PN-92/B-01706 oraz PN-EN 15316-3-1">
                    <input
                      name="coldTempC"
                      type="number"
                      step="0.1"
                      defaultValue={10}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </Field>
                  <Field label="Temperatura CWU" unit="°C">
                    <input
                      name="hotTempC"
                      type="number"
                      step="0.1"
                      defaultValue={55}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </Field>
                  <Field label="Cena ciepła od miasta" unit="zł/GJ">
                    <input
                      name="heatPriceFromCity"
                      type="number"
                      step="0.01"
                      defaultValue={82.13}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </Field>
                </div>
              </div>

              {/* Dane do pisma (opcjonalne) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-fuchsia-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Dane do pisma (opcjonalne)
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Miejscowość" optional>
                    <input
                      name="letterCity"
                      type="text"
                      placeholder="np. Kraków"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Zarządca — nazwa" optional>
                    <input
                      name="managerName"
                      type="text"
                      placeholder="np. ABC Zarządzanie Nieruchomościami Sp. z o.o."
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Zarządca — adres" optional>
                    <input
                      name="managerAddress"
                      type="text"
                      placeholder="np. ul. Długa 10, 00-001 Warszawa"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Adres budynku" optional>
                    <input
                      name="buildingAddress"
                      type="text"
                      placeholder="np. ul. Kwiatowa 5, 30-000 Kraków"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Numer lokalu" optional>
                    <input
                      name="apartmentNumber"
                      type="text"
                      placeholder="np. 12"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Imię i nazwisko mieszkańca" optional>
                    <input
                      name="residentName"
                      type="text"
                      placeholder="np. Jan Kowalski"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="E-mail mieszkańca" optional>
                    <input
                      name="residentEmail"
                      type="email"
                      placeholder="np. jan.kowalski@example.com"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Telefon mieszkańca" optional>
                    <input
                      name="residentPhone"
                      type="tel"
                      placeholder="np. 600 000 000"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                </div>
              </div>

              {/* Przycisk analizuj koszty i straty */}
              <div className="pt-8">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full px-10 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg rounded-xl transition-all hover:scale-[1.02] shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Obliczanie...
                    </div>
                  ) : (
                    <div className="text-center leading-tight">
                      <div>OBLICZ SWOJE STRATY</div>
                      <div>I POTENCJALNE OSZCZĘDNOŚCI</div>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {res && (
          <div className="space-y-8">
            {/* Action bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-4">
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
                    label="Koszt teoretyczny za m³" 
                    value={`${res.theoreticalCostPerM3.toFixed(2)} zł/m³`} 
                    formula={"C_{teor,m^3} = E_{m^3} \\times C_{GJ}"}
                    substitution={inputs ? `= ${res.energyPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} × ${inputs.heatPriceFromCity.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${res.theoreticalCostPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł/m³` : undefined}
                    unitsNote={"zł/m³ — koszt w złotych za 1 m³ wody (energia [GJ/m³] × cena [zł/GJ])."}
                  />
                  <Info 
                    label="TEORETYCZNA ENERGIA POTRZEBNA DO PODGRZANIA 1 m³ WODY" 
                    value={`${res.energyPerM3.toFixed(4)} GJ/m³`} 
                    formula={"E_{m^3} = 0{,}004186 \\times (T_{CWU} - T_{zimna})"}
                    substitution={inputs ? `= 0,004186 × (${inputs.hotTempC.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} − ${inputs.coldTempC.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}) = ${res.energyPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} GJ/m³` : undefined}
                    unitsNote={"GJ/m³ — energia w gigadżulach potrzebna na podgrzanie 1 m³ wody."}
                  />
                  <Info 
                    label="Strata energii na m³" 
                    value={`${res.energyLossPerM3.toFixed(4)} GJ/m³`} 
                    formula={"E_{strata,m^3} = \\frac{C_{CWU,m^3} - C_{teor,m^3}}{C_{GJ}}"}
                    substitution={inputs ? `= (${inputs.cwuPriceFromBill.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} − ${res.theoreticalCostPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) / ${inputs.heatPriceFromCity.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = ${res.energyLossPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} GJ/m³` : undefined}
                    unitsNote={"GJ/m³ — energia utracona na przesyle na 1 m³ ciepłej wody."}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <Info 
                    label="Płatność teoretyczna (miesiąc)" 
                    value={`${res.theoreticalMonthlyPayment.toFixed(2)} zł`} 
                    formula={"P_{teor} = C_{teor,m^3} \\times V_{mies}"}
                    substitution={inputs ? `= ${res.theoreticalCostPerM3.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${inputs.monthlyConsumption.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} = ${res.theoreticalMonthlyPayment.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł` : undefined}
                    unitsNote={"zł — kwota oszacowana dla miesięcznego zużycia."}
                  />
                  <Info 
                    label="Rzeczywista płatność (miesiąc)" 
                    value={`${res.actualMonthlyPayment.toFixed(2)} zł`} 
                    formula={"P_{rzecz} = C_{CWU,m^3} \\times V_{mies}"}
                    substitution={inputs ? `= ${inputs.cwuPriceFromBill.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × ${inputs.monthlyConsumption.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} = ${res.actualMonthlyPayment.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł` : undefined}
                    unitsNote={"zł — faktyczna kwota dla miesięcznego zużycia."}
                  />
                </div>
              </CardContent>
            </Card>

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

function Info({ label, value, formula, substitution, unitsNote }: { label: string; value: string; formula?: string; substitution?: string; unitsNote?: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">
        {label}
      </div>
      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
        {value}
      </div>
      {(formula || substitution || unitsNote) && (
        <details className="mt-2">
          <summary className="cursor-pointer select-none text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <InfoIcon className="w-3.5 h-3.5" />
            Szczegóły obliczeń
          </summary>
          <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            {formula && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-slate-700 dark:text-slate-300 shrink-0">Wzór:</span>
                <div className="inline-block px-3 py-1.5 rounded border border-slate-200/60 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/60">
                  <KatexFormula formula={formula} />
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

// (brak dodatkowych helperów)
