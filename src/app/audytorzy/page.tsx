"use client";

import { useState } from "react";
import { Wrench, Calculator, BarChart3, Settings, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Result = {
  power: {
    PkW: number;
    PnetkW: number;
    jednocz: number;
    dT: number;
    Ebufor_kWh: number;
    assumptions: unknown;
  };
  circGJ: number;
  variants: Array<{
    name: string;
    capexPLN: number;
    savedGJ: number;
    savedPLN: number;
    paybackYears: number;
  }>;
};

export default function AudytorzyPage() {
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, coerce(v as string)]),
    );
    const r = await fetch("/api/calc/auditor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await r.json();
    if (json.ok) setRes(json.result);
    else alert("Błąd: " + JSON.stringify(json.error));
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full text-sm font-medium text-indigo-700 dark:text-indigo-300">
          <Wrench className="w-4 h-4" />
          Narzędzia profesjonalisty
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Audytorzy
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Precyzyjne obliczenia mocy z uwzględnieniem bufora i jednoczesności. 
          Szczegółowa analiza strat cyrkulacji z wariantami modernizacji.
        </p>
      </div>

      {/* Calculator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            Kalkulator mocy zamówionej CWU
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Building Parameters */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Parametry budynku
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <Field label="Liczba mieszkań">
                  <input
                    name="flats"
                    defaultValue={65}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="Liczba pionów">
                  <input
                    name="risers"
                    defaultValue={18}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="T. zimnej [°C]">
                  <input
                    name="coldTempC"
                    defaultValue={8}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="T. CWU [°C]">
                  <input
                    name="hotTempC"
                    defaultValue={55}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
              </div>
            </div>

            {/* Technical Parameters */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Parametry techniczne
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <Field label="Szczytowy pobór [L/min]">
                  <input
                    name="drawPeakLpm"
                    defaultValue={120}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="Profil jednoczesności">
                  <select
                    name="simultProfile"
                    defaultValue="med"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="low">Niski</option>
                    <option value="med">Średni</option>
                    <option value="high">Wysoki</option>
                  </select>
                </Field>
                <Field label="Bufor [L]">
                  <input
                    name="bufferL"
                    defaultValue={1000}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="ΔT bufora [K]">
                  <input
                    name="bufferDeltaC"
                    defaultValue={10}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
              </div>
            </div>

            {/* Advanced Parameters */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Parametry zaawansowane
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <Field label="Czas piku [s]">
                  <input
                    name="peakDurationSec"
                    defaultValue={300}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="% strat cyrkulacji" optional>
                  <input
                    name="circulationPct"
                    placeholder="np. 25"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="Ciepło zakupione [GJ]" optional>
                  <input
                    name="purchasedGJ"
                    placeholder="np. 610"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="UA cyrkulacji [W/K]" optional>
                  <input
                    name="UA_WK"
                    placeholder="np. 240"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
              </div>
            </div>

            {/* Economic Parameters */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Parametry ekonomiczne
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <Field label="ΔT cyrkulacji [K]">
                  <input
                    name="dT_circ"
                    defaultValue={20}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="Godziny/rok">
                  <input
                    name="hours_circ"
                    defaultValue={8760}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
                <Field label="Cena [zł/GJ]">
                  <input
                    name="pricePerGJ"
                    defaultValue={60}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </Field>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              {loading ? "Liczenie..." : "Policz moc i straty"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {res && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Wyniki obliczeń</h2>
          
          {/* Key Power Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      P (szczyt)
                    </p>
                    <p className="text-2xl font-bold">{res.power.PkW.toFixed(1)} kW</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      P po buforze
                    </p>
                    <p className="text-2xl font-bold text-green-600">{res.power.PnetkW.toFixed(1)} kW</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-green-600" />
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
                    <p className="text-2xl font-bold text-orange-600">{res.circGJ.toFixed(2)} GJ/rok</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Technical Results */}
          <Card>
            <CardHeader>
              <CardTitle>Szczegółowe parametry techniczne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Info label="Jednoczesność" value={res.power.jednocz.toFixed(2)} />
                <Info label="ΔT [K]" value={res.power.dT.toFixed(1)} />
                <Info label="Energia bufora [kWh]" value={res.power.Ebufor_kWh.toFixed(2)} />
              </div>
            </CardContent>
          </Card>

          {/* Modernization Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Warianty modernizacji (szacunek)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {res.variants.map((variant, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-medium">{variant.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Oszczędności: {variant.savedGJ.toFixed(1)} GJ/rok
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">CAPEX:</span>
                        <span className="font-medium">{fmt(variant.capexPLN)} PLN</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Oszcz./rok:</span>
                        <span className="font-medium text-green-600">{fmt(variant.savedPLN)} PLN</span>
                      </div>
                      <Badge variant={variant.paybackYears < 5 ? "success" : variant.paybackYears < 10 ? "warning" : "destructive"}>
                        Payback: {variant.paybackYears.toFixed(1)} lat
                      </Badge>
                    </div>
                  </div>
                ))}
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
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

function fmt(n: number) {
  return n.toLocaleString("pl-PL");
}
