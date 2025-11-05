"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Percent, Thermometer, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

type LastMethod = { method: "percent"; purchasedGJ: number; circulationPct: number; pricePerGJ: number } | { method: "ua"; UA_WK: number; dT_circ: number; hours_circ: number; pricePerGJ: number };

export default function StratyZFakturPage() {
  const [result, setResult] = useState<{ circGJ: number; costPLN: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [percentDefaults, setPercentDefaults] = useState({ purchasedGJ: 850, circulationPct: 35, pricePerGJ: 75 });
  const [uaDefaults, setUaDefaults] = useState({ UA_WK: 420, dT_circ: 25, hours_circ: 8760, pricePerGJ: 75 });
  const [lastMethod, setLastMethod] = useState<LastMethod | null>(null);
  
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

  // Load last values
  useEffect(() => {
    const savedP = localStorage.getItem("audytorzy-straty-percent");
    if (savedP) {
      try {
        setPercentDefaults(JSON.parse(savedP));
      } catch {
        // ignore
      }
    }
    const savedU = localStorage.getItem("audytorzy-straty-ua");
    if (savedU) {
      try {
        setUaDefaults(JSON.parse(savedU));
      } catch {
        // ignore
      }
    }
  }, []);

  async function submitPercent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const purchasedGJ = Number(fd.get("purchasedGJ"));
    const circulationPct = Number(fd.get("circulationPct"));
    const pricePerGJ = Number(fd.get("pricePerGJ"));
    
    // Save to localStorage
    localStorage.setItem("audytorzy-straty-percent", JSON.stringify({ purchasedGJ, circulationPct, pricePerGJ }));
    
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
      setLastMethod({ method: "percent", purchasedGJ, circulationPct, pricePerGJ });
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
    
    // Save to localStorage
    localStorage.setItem("audytorzy-straty-ua", JSON.stringify({ UA_WK, dT_circ, hours_circ, pricePerGJ }));
    
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
      setLastMethod({ method: "ua", UA_WK, dT_circ, hours_circ, pricePerGJ });
    } catch (err) {
      alert("Błąd: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function downloadPDF(res: { circGJ: number; costPLN: number }) {
    if (!lastMethod) return;
    const pdfData = {
      ...lastMethod,
      circGJ: res.circGJ,
      costPLN: res.costPLN,
    };
    const params = new URLSearchParams({ data: JSON.stringify(pdfData) });
    window.open(`/api/report/losses?${params}`, "_blank");
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
                  <Field label="Ciepło zakupione [GJ]" hint="Z rocznych faktur, typowo 500–2000 GJ">
                    <Input name="purchasedGJ" type="number" step="1" defaultValue={percentDefaults.purchasedGJ} />
                  </Field>
                  <Field label="Udział strat [%]" hint="Z audytu lub szacunek 20–50%">
                    <Input name="circulationPct" type="number" step="1" defaultValue={percentDefaults.circulationPct} />
                  </Field>
                  <Field label="Cena [zł/GJ]" hint="Zgodnie z cennikiem dostawcy">
                    <Input name="pricePerGJ" type="number" step="1" defaultValue={percentDefaults.pricePerGJ} />
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
                  <Field label="UA [W/K]" hint="Z inwentaryzacji, typowo 200–800 W/K">
                    <Input name="UA_WK" type="number" step="1" defaultValue={uaDefaults.UA_WK} />
                  </Field>
                  <Field label="ΔT cyrkulacji [K]" hint="Różnica T między podajnikiem a powrotem, zwykle 20–30 K">
                    <Input name="dT_circ" type="number" step="1" defaultValue={uaDefaults.dT_circ} />
                  </Field>
                  <Field label="Godziny/rok [h]" hint="Zwykle 8760 (cały rok non-stop)">
                    <Input name="hours_circ" type="number" step="1" defaultValue={uaDefaults.hours_circ} />
                  </Field>
                  <Field label="Cena [zł/GJ]" hint="Zgodnie z cennikiem dostawcy">
                    <Input name="pricePerGJ" type="number" step="1" defaultValue={uaDefaults.pricePerGJ} />
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
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Straty cyrkulacji" value={`${result.circGJ.toFixed(2)} GJ/rok`} />
                  <Info label="Koszt strat" value={`${result.costPLN.toLocaleString("pl-PL")} zł/rok`} />
                </div>
                <Button 
                  onClick={() => downloadPDF(result)} 
                  variant="outline" 
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" /> Pobierz raport PDF
                </Button>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">Wprowadź dane i użyj przycisku „Oblicz".</p>
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {hint && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
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
