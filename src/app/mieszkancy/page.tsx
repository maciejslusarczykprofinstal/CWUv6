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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
          <Home className="w-4 h-4" />
          Sprawdź swoje rachunki
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Mieszkańcy
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Czy płacisz za dużo? Sprawdź czy Twoje wpłaty odpowiadają rzeczywistym kosztom energii 
          i odkryj straty cyrkulacji w Twoim budynku.
        </p>
      </div>

      {/* Calculator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Kalkulator kosztów CWU
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Basic Parameters */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Podstawowe parametry
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Zużycie wody [m³/miesiąc]">
                  <input
                    name="waterM3"
                    defaultValue={12}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </Field>
                <Field label="Temperatura zimnej wody [°C]">
                  <input
                    name="coldTempC"
                    defaultValue={8}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </Field>
                <Field label="Temperatura CWU [°C]">
                  <input
                    name="hotTempC"
                    defaultValue={55}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Economic Parameters */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Parametry ekonomiczne
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Ciepło z MPEC [GJ/miesiąc]" optional>
                  <input
                    name="mpecHeatGJ"
                    placeholder="np. 45"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="Cena za GJ [zł]" optional>
                  <input
                    name="pricePerGJ"
                    placeholder="np. 60"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="Wasze wpłaty [PLN/miesiąc]">
                  <input
                    name="residentPaymentsPLN"
                    defaultValue={2400}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Technical Parameters */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Parametry techniczne
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Straty cyrkulacji [%]">
                  <input
                    name="circulationLossPct"
                    defaultValue={25}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              {loading ? "Liczenie..." : "Policz koszty i straty"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {res && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Wyniki analizy</h2>
            <Button
              onClick={downloadPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Pobierz raport PDF
            </Button>
          </div>
          
          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Zapotrzebowanie teoretyczne
                    </p>
                    <p className="text-2xl font-bold">{res.needGJ.toFixed(2)} GJ</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Straty cyrkulacji
                    </p>
                    <p className="text-2xl font-bold text-orange-600">{res.circGJ.toFixed(2)} GJ</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Różnica (koszt - wpłaty)
                    </p>
                    <p className={`text-2xl font-bold ${res.diffPLN > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmt(Math.round(res.diffPLN))} PLN
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${res.diffPLN > 0 ? 'bg-red-100' : 'bg-green-100'} rounded-2xl flex items-center justify-center`}>
                    <TrendingDown className={`w-6 h-6 ${res.diffPLN > 0 ? 'text-red-600' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Szczegółowe wyniki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Info label="Ciepło zakupione" value={`${res.purchasedGJ.toFixed(2)} GJ`} />
                <Info label="Energia użyteczna" value={`${res.usefulGJ.toFixed(2)} GJ`} />
                <Info label="Koszt energii (MPEC)" value={`${fmt(Math.round(res.costPLN))} PLN`} />
              </div>
            </CardContent>
          </Card>

          {/* Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Interpretacja wyników</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Udział strat cyrkulacji</h4>
                      <p className="text-sm text-muted-foreground">
                        {res.purchasedGJ > 0 ? ((res.circGJ / res.purchasedGJ) * 100).toFixed(1) : "0"}% 
                        zakupionego ciepła idzie na straty w cyrkulacji.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Efektywność systemu</h4>
                      <p className="text-sm text-muted-foreground">
                        {res.purchasedGJ > 0 ? ((res.usefulGJ / res.purchasedGJ) * 100).toFixed(1) : "0"}% 
                        zakupionego ciepła trafia do Państwa mieszkania.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  {res.diffPLN > 0 ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Uwaga - nadpłata!</h4>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Rzeczywiste koszty energii są wyższe od wpłat o {fmt(Math.round(res.diffPLN))} PLN/miesiąc.
                        Sugerujemy przeanalizowanie kosztów z zarządcą.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Pozytywnie!</h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
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
  );
}

function Field({ label, children, optional = false }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label} {optional && <span className="text-muted-foreground">(opcjonalne)</span>}
      </label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-muted/50 border">
      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
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
