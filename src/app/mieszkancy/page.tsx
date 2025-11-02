"use client";

import { useState } from "react";
import { Download, Home, Calculator, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Result = {
  needGJ: number;
  purchasedGJ: number;
  circGJ: number;
  usefulGJ: number;
  costPLN: number;
  diffPLN: number;
};

export default function MieszkancyPage() {
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, coerce(v as string)])
    );
    setFormData(payload);
    
    const r = await fetch("/api/calc/resident", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await r.json();
    if (json.ok) setRes(json.result);
    else alert("Błąd: " + JSON.stringify(json.error));
    setLoading(false);
  }

  async function downloadPDF() {
    if (!res || !formData) return;
    const data = { input: formData, result: res };
    const url = `/api/report/resident?data=${encodeURIComponent(JSON.stringify(data))}`;
    window.open(url, '_blank');
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
              Kalkulator analizy kosztów
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Basic Parameters */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Parametry podstawowe
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <Field label="Zużycie wody" unit="m³/miesiąc">
                    <input
                      name="waterM3"
                      defaultValue={12}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </Field>
                  <Field label="Temperatura zimnej wody" unit="°C">
                    <input
                      name="coldTempC"
                      defaultValue={8}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </Field>
                  <Field label="Temperatura CWU" unit="°C">
                    <input
                      name="hotTempC"
                      defaultValue={55}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </Field>
                </div>
              </div>

              {/* Economic Parameters */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Parametry ekonomiczne
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <Field label="Ciepło z MPEC" unit="GJ/miesiąc" optional>
                    <input
                      name="mpecHeatGJ"
                      placeholder="np. 45"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Cena za GJ" unit="zł" optional>
                    <input
                      name="pricePerGJ"
                      placeholder="np. 60"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                  <Field label="Wasze wpłaty" unit="PLN/miesiąc">
                    <input
                      name="residentPaymentsPLN"
                      defaultValue={2400}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                      required
                    />
                  </Field>
                </div>
              </div>

              {/* Technical Parameters */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Parametry techniczne
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <Field label="Straty cyrkulacji" unit="%">
                    <input
                      name="circulationLossPct"
                      defaultValue={25}
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </Field>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Obliczanie...
                    </div>
                  ) : (
                    "Analizuj koszty i straty"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {res && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                Wyniki analizy
              </h2>
              <Button
                onClick={downloadPDF}
                variant="outline"
                className="flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              >
                <Download className="w-4 h-4" />
                Pobierz raport PDF
              </Button>
            </div>
            
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                        Zapotrzebowanie teoretyczne
                      </p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {res.needGJ.toFixed(2)} GJ
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
                        Straty cyrkulacji
                      </p>
                      <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                        {res.circGJ.toFixed(2)} GJ
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`bg-gradient-to-br backdrop-blur-sm ${
                res.diffPLN > 0 
                  ? "from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800" 
                  : "from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800"
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium mb-2 ${
                        res.diffPLN > 0 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}>
                        Różnica (koszt - wpłaty)
                      </p>
                      <p className={`text-3xl font-bold ${
                        res.diffPLN > 0 
                          ? "text-red-900 dark:text-red-100" 
                          : "text-emerald-900 dark:text-emerald-100"
                      }`}>
                        {fmt(Math.round(res.diffPLN))} PLN
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl shadow-lg ${
                      res.diffPLN > 0 ? "bg-red-500" : "bg-emerald-500"
                    }`}>
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
                  <Info label="Ciepło zakupione" value={`${res.purchasedGJ.toFixed(2)} GJ`} />
                  <Info label="Energia użyteczna" value={`${res.usefulGJ.toFixed(2)} GJ`} />
                  <Info label="Koszt energii (MPEC)" value={`${fmt(Math.round(res.costPLN))} PLN`} />
                </div>
              </CardContent>
            </Card>

            {/* Analysis */}
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                  Interpretacja wyników
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          Udział strat cyrkulacji
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {res.purchasedGJ > 0 ? ((res.circGJ / res.purchasedGJ) * 100).toFixed(1) : "0"}% 
                          zakupionego ciepła idzie na straty w cyrkulacji.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          Efektywność systemu
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {res.purchasedGJ > 0 ? ((res.usefulGJ / res.purchasedGJ) * 100).toFixed(1) : "0"}% 
                          zakupionego ciepła trafia do Państwa mieszkania.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {res.diffPLN > 0 ? (
                      <div className="p-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-200 dark:border-red-800 rounded-xl backdrop-blur-sm">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Uwaga - nadpłata!
                        </h4>
                        <p className="text-red-700 dark:text-red-400 leading-relaxed">
                          Rzeczywiste koszty energii są wyższe od wpłat o {fmt(Math.round(res.diffPLN))} PLN/miesiąc.
                          Sugerujemy przeanalizowanie kosztów z zarządcą.
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl backdrop-blur-sm">
                        <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Pozytywnie!
                        </h4>
                        <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed">
                          Wpłaty pokrywają koszty z nadwyżką {fmt(Math.round(-res.diffPLN))} PLN/miesiąc.
                          System działa efektywnie ekonomicznie.
                        </p>
                      </div>
                    )}
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
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

function fmt(n: number) {
  return n.toLocaleString("pl-PL");
}
