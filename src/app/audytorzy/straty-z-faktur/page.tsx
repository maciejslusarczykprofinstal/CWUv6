"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Percent, Thermometer } from "lucide-react";
import { useState } from "react";

export default function StratyZFakturPage() {
  const [result, setResult] = useState<{ circGJ: number; costPLN: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const defaultPower = {
    flats: 120,
    risers: 24,
    coldTempC: 6,
    hotTempC: 55,
    drawPeakLpm: 200,
    simultProfile: "high" as const,
    bufferL: 0,
    bufferDeltaC: 0,
    peakDurationSec: 600,
  };

  async function submitPercent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const purchasedGJ = Number(fd.get("purchasedGJ"));
    const circulationPct = Number(fd.get("circulationPct"));
    const pricePerGJ = Number(fd.get("pricePerGJ"));
    try {
      const r = await fetch("/api/calc/auditor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...defaultPower,
          purchasedGJ,
          circulationPct,
          pricePerGJ,
          dT_circ: 25,
          hours_circ: 8760,
        }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(JSON.stringify(json.error));
      const circGJ: number = json.result?.circGJ ?? 0;
      setResult({ circGJ, costPLN: Math.round(circGJ * pricePerGJ) });
    } catch (err) {
      alert("Błąd: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submitUA(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const UA_WK = Number(fd.get("UA_WK"));
    const dT_circ = Number(fd.get("dT_circ"));
    const hours_circ = Number(fd.get("hours_circ"));
    const pricePerGJ = Number(fd.get("pricePerGJ"));
    try {
      const r = await fetch("/api/calc/auditor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...defaultPower,
          UA_WK,
          dT_circ,
          hours_circ,
          pricePerGJ,
        }),
      });
      const json = await r.json();
      if (!json.ok) throw new Error(JSON.stringify(json.error));
      const circGJ: number = json.result?.circGJ ?? 0;
      setResult({ circGJ, costPLN: Math.round(circGJ * pricePerGJ) });
    } catch (err) {
      alert("Błąd: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Oblicz straty z faktur
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Dwa sposoby: z udziału [%] w zakupionym cieple lub z parametrów cyrkulacji (UA×ΔT×t).
          </p>
        </header>

        <Tabs defaultValue="percent" className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-md">
            <TabsTrigger value="percent" className="flex items-center gap-2">
              <Percent className="h-4 w-4" /> Z faktur (%)
            </TabsTrigger>
            <TabsTrigger value="ua" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" /> UA×ΔT×t
            </TabsTrigger>
          </TabsList>

          <TabsContent value="percent">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <FileText className="h-5 w-5" /> Wariant: z udziału w fakturach
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={submitPercent} className="grid gap-4 md:grid-cols-3">
                  <Field label="Ciepło zakupione [GJ]">
                    <Input name="purchasedGJ" type="number" step="1" defaultValue={850} />
                  </Field>
                  <Field label="Udział strat [%]">
                    <Input name="circulationPct" type="number" step="1" defaultValue={35} />
                  </Field>
                  <Field label="Cena [zł/GJ]">
                    <Input name="pricePerGJ" type="number" step="1" defaultValue={75} />
                  </Field>
                  <div className="md:col-span-3 flex gap-3 pt-2">
                    <Button type="submit" disabled={loading}>Oblicz</Button>
                    <Button type="button" variant="ghost" onClick={() => setResult(null)}>Wyczyść</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ua">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Thermometer className="h-5 w-5" /> Wariant: UA×ΔT×t
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={submitUA} className="grid gap-4 md:grid-cols-4">
                  <Field label="UA [W/K]">
                    <Input name="UA_WK" type="number" step="1" defaultValue={420} />
                  </Field>
                  <Field label="ΔT cyrkulacji [K]">
                    <Input name="dT_circ" type="number" step="1" defaultValue={25} />
                  </Field>
                  <Field label="Godziny/rok [h]">
                    <Input name="hours_circ" type="number" step="1" defaultValue={8760} />
                  </Field>
                  <Field label="Cena [zł/GJ]">
                    <Input name="pricePerGJ" type="number" step="1" defaultValue={75} />
                  </Field>
                  <div className="md:col-span-4 flex gap-3 pt-2">
                    <Button type="submit" disabled={loading}>Oblicz</Button>
                    <Button type="button" variant="ghost" onClick={() => setResult(null)}>Wyczyść</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
            <CardTitle className="text-slate-800 dark:text-slate-200">Wynik</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {result ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Info label="Straty cyrkulacji" value={`${result.circGJ.toFixed(2)} GJ/rok`} />
                <Info label="Koszt strat" value={`${result.costPLN.toLocaleString("pl-PL")} zł/rok`} />
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">Wprowadź dane i użyj przycisku „Oblicz”.</p>
            )}
          </CardContent>
        </Card>

        <div>
          <Button asChild variant="outline">
            <Link href="/audytorzy">← Wróć do wyboru narzędzia</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
