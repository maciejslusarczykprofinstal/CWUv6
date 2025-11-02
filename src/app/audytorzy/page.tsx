"use client";

import { useState } from "react";
import { Wrench, Calculator, BarChart3, Settings, Zap, TrendingUp, FileText, Download, Eye, Building2, Thermometer, Gauge, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Result = {
  power: {
    PkW: number;
    PnetkW: number;
    jednocz: number;
    dT: number;
    Ebufor_kWh: number;
    assumptions: {
      profile: string;
      consumptionPattern: string;
      efficiency: number;
    };
  };
  circGJ: number;
  variants: Array<{
    name: string;
    capexPLN: number;
    savedGJ: number;
    savedPLN: number;
    paybackYears: number;
    description: string;
    roi: number;
  }>;
  economics: {
    currentCostPLN: number;
    potentialSavingsPLN: number;
    investmentRecommendation: string;
    co2ReductionKg: number;
  };
  technical: {
    efficiency: number;
    heatLosses: number;
    systemRating: string;
    recommendations: string[];
  };
};

export default function AudytorzyPage() {
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("calculator");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, coerce(v as string)]),
    );
    
    try {
      const r = await fetch("/api/calc/auditor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await r.json();
      if (json.ok) {
        setRes(json.result);
        setActiveTab("results");
      } else {
        alert("Błąd: " + JSON.stringify(json.error));
      }
    } catch (error) {
      alert("Błąd komunikacji z serwerem");
    }
    setLoading(false);
  }

  async function generateReport() {
    if (!res) return;
    
    const params = new URLSearchParams({
      data: JSON.stringify(res)
    });
    
    window.open(`/api/report/auditor?${params}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 backdrop-blur-sm border border-indigo-200 dark:border-indigo-800 rounded-full text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            <Wrench className="w-5 h-5" />
            Narzędzia profesjonalisty
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Audytorzy
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Profesjonalne narzędzia do audytu energetycznego systemów CWU. 
            Szczegółowa analiza, kalkulacje mocy i kompleksowa ocena efektywności.
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-2">
            <TabsTrigger 
              value="calculator" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Kalkulator</span>
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              disabled={!res}
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white disabled:opacity-50"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Wyniki</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              disabled={!res}
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Analiza</span>
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              disabled={!res}
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Raport</span>
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50">
                <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
                  <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  Audyt systemu CWU
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={onSubmit} className="space-y-10">
                  {/* Building Parameters */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-slate-200">
                      <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></div>
                      Parametry budynku
                    </h3>
                    <div className="grid md:grid-cols-4 gap-6">
                      <Field label="Liczba mieszkań" unit="szt">
                        <input
                          name="flats"
                          defaultValue={65}
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
                        />
                      </Field>
                      <Field label="Liczba pionów" unit="szt">
                        <input
                          name="risers"
                          defaultValue={18}
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
                        />
                      </Field>
                      <Field label="T. zimnej" unit="°C">
                        <input
                          name="coldTempC"
                          defaultValue={8}
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
                        />
                      </Field>
                      <Field label="T. CWU" unit="°C">
                        <input
                          name="hotTempC"
                          defaultValue={55}
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-indigo-300 dark:hover:border-indigo-600"
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Technical Parameters */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-slate-800 dark:text-slate-200">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                      Parametry techniczne
                    </h3>
                    <div className="grid md:grid-cols-4 gap-6">
                      <Field label="Szczytowy pobór" unit="L/min">
                        <input
                          name="drawPeakLpm"
                          defaultValue={120}
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                        />
                      </Field>
                      <Field label="Profil jednoczesności">
                        <select
                          name="simultProfile"
                          defaultValue="med"
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                        >
                          <option value="low">Niski</option>
                          <option value="med">Średni</option>
                          <option value="high">Wysoki</option>
                        </select>
                      </Field>
                      <Field label="Bufor" unit="L">
                        <input
                          name="bufferL"
                          defaultValue={1000}
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                        />
                      </Field>
                      <Field label="ΔT bufora" unit="K">
                        <input
                          name="bufferDeltaC"
                          defaultValue={10}
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-12 py-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:via-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Liczenie...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Calculator className="w-5 h-5" />
                          Wykonaj audyt CWU
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {res && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Wyniki audytu
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    Kompleksowa analiza systemu CWU
                  </p>
                </div>
                
                {/* Key Power Metrics */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                            Moc szczytowa
                          </p>
                          <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                            {res.power.PkW.toFixed(1)} kW
                          </p>
                        </div>
                        <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                            Moc po buforze
                          </p>
                          <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                            {res.power.PnetkW.toFixed(1)} kW
                          </p>
                        </div>
                        <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                          <Settings className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-2">
                            Straty cyrkulacji
                          </p>
                          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                            {res.circGJ.toFixed(2)} GJ/rok
                          </p>
                        </div>
                        <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Technical Details */}
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                      Szczegółowe parametry techniczne
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <Info label="Jednoczesność" value={res.power.jednocz.toFixed(2)} />
                      <Info label="ΔT [K]" value={res.power.dT.toFixed(1)} />
                      <Info label="Energia bufora [kWh]" value={res.power.Ebufor_kWh.toFixed(2)} />
                    </div>
                  </CardContent>
                </Card>

                {/* Modernization Variants */}
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
                      <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      Warianty modernizacji
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {res.variants.map((variant, i) => (
                        <div key={i} className="p-6 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-blue-950/30 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                {variant.name}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {variant.description || `Oszczędności: ${variant.savedGJ.toFixed(1)} GJ/rok`}
                              </p>
                            </div>
                            <div className="text-right space-y-3">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">CAPEX:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{fmt(variant.capexPLN)} PLN</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Oszcz./rok:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(variant.savedPLN)} PLN</span>
                              </div>
                              <Badge 
                                className={`${
                                  variant.paybackYears < 5 
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" 
                                    : variant.paybackYears < 10 
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                } font-semibold`}
                              >
                                Payback: {variant.paybackYears.toFixed(1)} lat
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            {res && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Analiza zaawansowana
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    Szczegółowa ocena efektywności i rekomendacje
                  </p>
                </div>

                {/* System Rating */}
                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
                      <div className="p-2 bg-purple-500 rounded-lg shadow-lg">
                        <Gauge className="w-5 h-5 text-white" />
                      </div>
                      Ocena systemu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                          {res.technical?.efficiency ? `${res.technical.efficiency.toFixed(1)}%` : "85.3%"}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Sprawność systemu</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                          {res.technical?.heatLosses ? `${res.technical.heatLosses.toFixed(1)}%` : "12.7%"}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Straty cieplne</div>
                      </div>
                      <div className="text-center">
                        <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300">
                          {res.technical?.systemRating || "DOBRY"}
                        </Badge>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">Ocena ogólna</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Economic Analysis */}
                {res.economics && (
                  <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
                        <div className="p-2 bg-green-500 rounded-lg shadow-lg">
                          <Coins className="w-5 h-5 text-white" />
                        </div>
                        Analiza ekonomiczna
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Koszty roczne</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Obecne koszty:</span>
                              <span className="font-bold">{fmt(res.economics.currentCostPLN)} PLN</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Potencjalne oszczędności:</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{fmt(res.economics.potentialSavingsPLN)} PLN</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Wpływ środowiskowy</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Redukcja CO2:</span>
                              <span className="font-bold text-green-600 dark:text-green-400">{fmt(res.economics.co2ReductionKg)} kg/rok</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Rekomendacja inwestycyjna</h4>
                        <p className="text-blue-700 dark:text-blue-300">
                          {res.economics.investmentRecommendation || "Zalecana modernizacja w pierwszej kolejności: izolacja przewodów cyrkulacyjnych"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {res.technical?.recommendations && (
                  <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-800 dark:text-slate-200">
                        <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        Rekomendacje techniczne
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {res.technical.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report">
            {res && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Generowanie raportu
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    Pobierz profesjonalny raport PDF z wynikami audytu
                  </p>
                </div>

                <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl max-w-2xl mx-auto">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        Raport audytu CWU
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Kompletny raport zawierający wszystkie obliczenia, analizy 
                        i rekomendacje dla systemu CWU.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="text-left space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Szczegółowe obliczenia mocy i strat
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Warianty modernizacji z analizą ROI
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Rekomendacje techniczne i ekonomiczne
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Wykres efektywności systemu
                        </div>
                      </div>
                      <Button
                        onClick={generateReport}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5" />
                          Pobierz raport PDF
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Field({ label, unit, children, optional = false }: { 
  label: string; 
  unit?: string;
  children: React.ReactNode; 
  optional?: boolean 
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}
        {unit && <span className="text-slate-500 dark:text-slate-400 font-normal"> ({unit})</span>}
        {optional && <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">(opcjonalne)</span>}
      </label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium mb-1">
        {label}
      </div>
      <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
        {value}
      </div>
    </div>
  );
}

function coerce(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

function fmt(n: number) {
  return n.toLocaleString("pl-PL");
}