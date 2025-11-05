"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign } from "lucide-react";
import { useMemo, useState } from "react";

export default function LicznikiPage() {
  // Helpers
  const coerce = (n: unknown): number => {
    const v = typeof n === "number" ? n : Number(n);
    return Number.isFinite(v) ? v : 0;
  };

  // Klienckie generowanie PDF (jak u mieszkańca)
  async function generatePdfClient(docComponent: React.ReactElement, filename: string) {
    if (typeof window === "undefined") return;
    try {
      const { pdf } = await import("@react-pdf/renderer");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(docComponent as any).toBlob();
      const objectUrl = URL.createObjectURL(blob);
      const w = window.open(objectUrl, "_blank");
      if (!w) {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
    } catch (e) {
      alert(`Nie udało się wygenerować PDF: ${String(e)}`);
    }
  }

  async function onDownloadSummary(payload: Record<string, unknown>) {
    const { LicznikiSummaryPDF } = await import("@/lib/report/liczniki-summary-pdf");
    const doc = <LicznikiSummaryPDF data={payload as any} />;
    void generatePdfClient(doc, "raport-liczniki.pdf");
  }

  // Ścieżka 2: controlled inputs
  const [waterVolumeM3_2, setWaterVolumeM3_2] = useState<number>(800);
  const [pricePerM3_2, setPricePerM3_2] = useState<number>(65);

  const result2 = useMemo(() => {
    const w = coerce(waterVolumeM3_2);
    const p = coerce(pricePerM3_2);
    return {
      totalPaid: w * p,
      waterVolume: w,
    };
  }, [waterVolumeM3_2, pricePerM3_2]);

  // Ścieżka 3: controlled inputs
  const [pricePerGJ3, setPricePerGJ3] = useState<number>(90);
  const [waterVolumeM3_3, setWaterVolumeM3_3] = useState<number>(800);

  const result3 = useMemo(() => {
    // Fizyka: grzejemy wodę od 10°C do 55°C
    const deltaT = 55 - 10; // 45 K
    const specificHeat = 4186; // J/(kg·K)
    const energyPerM3_J = 1000 * specificHeat * deltaT;
    const energyPerM3_GJ = energyPerM3_J / 1e9; // ~0.18837 GJ/m3

    const pricePerGJ = coerce(pricePerGJ3);
    const w = coerce(waterVolumeM3_3);
    const totalEnergyGJ = w * energyPerM3_GJ;
    const totalCost = totalEnergyGJ * pricePerGJ;
    const pricePerM3 = w > 0 ? totalCost / w : 0;
    return { pricePerM3, totalCost };
  }, [pricePerGJ3, waterVolumeM3_3]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analiza liczników CWU
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Dwie metody obliczania kosztów ciepłej wody użytkowej dla budynku. Wszystkie obliczenia działają równolegle i aktualizują się na żywo.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Ścieżka 2: Rzeczywista ilość wody + cena → ile zapłacili */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-base">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white flex-shrink-0">
                  <DollarSign className="h-5 w-5" />
                </span>
                <span>Ile zapłacili</span>
              </CardTitle>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Rzeczywista ilość × cena
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label className="text-sm">Zużyta woda [m³]</Label>
                  <Input 
                    name="waterVolumeM3"
                    type="number"
                    step="0.01"
                    value={waterVolumeM3_2}
                    onChange={(e) => setWaterVolumeM3_2(Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0)}
                    required
                  />
                  <p className="text-xs text-slate-500">80 mieszkań: 600-1000 m³/rok</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Cena [zł/m³]</Label>
                  <Input 
                    name="pricePerM3_2"
                    type="number"
                    step="0.01"
                    value={pricePerM3_2}
                    onChange={(e) => setPricePerM3_2(Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0)}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setWaterVolumeM3_2(800);
                      setPricePerM3_2(65);
                    }}
                  >
                    Wyczyść
                  </Button>
                </div>
              </form>

              {result2 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="text-xs text-green-600 dark:text-green-400">Zapłacili</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {result2.totalPaid.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-600 dark:text-slate-400">Zużyta woda</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {result2.waterVolume.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} m³
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ścieżka 3: Energia → Cena/m³ */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-base">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white flex-shrink-0">
                  <Calculator className="h-5 w-5" />
                </span>
                <span>Energia → Cena/m³</span>
              </CardTitle>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                m³ wody → Koszt podgrzania (10°C → 55°C)
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label className="text-sm">Energia [zł/GJ]</Label>
                  <Input 
                    name="pricePerGJ3"
                    type="number"
                    step="0.01"
                    value={pricePerGJ3}
                    onChange={(e) => setPricePerGJ3(Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Zużycie CWU [m³]</Label>
                  <Input 
                    name="waterVolumeM3_3"
                    type="number"
                    step="0.01"
                    value={waterVolumeM3_3}
                    onChange={(e) => setWaterVolumeM3_3(Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0)}
                    required
                  />
                  <p className="text-xs text-slate-500">80 mieszkań: 600-1000 m³/rok</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPricePerGJ3(90);
                      setWaterVolumeM3_3(800);
                    }}
                  >
                    Wyczyść
                  </Button>
                </div>
              </form>

              {result3 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-600 dark:text-blue-400">Koszt całkowity podgrzania</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {result3.totalCost.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-xs text-slate-600 dark:text-slate-400">Cena za m³</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {result3.pricePerM3.toFixed(2)} zł/m³
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Różnica: Zapłacili − Koszt całkowity podgrzania (live) */}
        {Number.isFinite(result2.totalPaid) && Number.isFinite(result3.totalCost) && (
          (() => {
            const diff = result2.totalPaid - result3.totalCost;
            const isOverpay = diff > 0; // nadpłata
            const isUnderpay = diff < 0; // niedopłata
            const bgClass = isOverpay
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
              : isUnderpay
              ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800"
              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
            const textMain = isOverpay
              ? "text-emerald-900 dark:text-emerald-100"
              : isUnderpay
              ? "text-rose-900 dark:text-rose-100"
              : "text-slate-900 dark:text-slate-100";
            const textSub = isOverpay
              ? "text-emerald-700 dark:text-emerald-300"
              : isUnderpay
              ? "text-rose-700 dark:text-rose-300"
              : "text-slate-600 dark:text-slate-300";

            return (
              <Card className={`border ${bgClass} shadow-lg`}> 
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <span className={`font-semibold ${textSub}`}>Różnica</span>
                    <Badge
                      className={
                        isOverpay
                          ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                          : isUnderpay
                          ? "bg-rose-600 text-white hover:bg-rose-600/90"
                          : "bg-slate-600 text-white hover:bg-slate-600/90"
                      }
                    >
                      {isOverpay ? "nadpłata" : isUnderpay ? "niedopłata" : "0 zł"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`text-3xl md:text-4xl font-bold ${textMain}`}>
                    {Math.abs(diff).toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                  </div>
                  <div className={`mt-2 text-xs ${textSub}`}>
                    Zapłacili − Koszt całkowity podgrzania
                  </div>
                  <div className="mt-4">
                    {(() => {
                      const payload = {
                        waterVolumeM3: waterVolumeM3_3,
                        paidVolumeM3: waterVolumeM3_2,
                        theoreticalVolumeM3: waterVolumeM3_3,
                        pricePerM3: pricePerM3_2,
                        pricePerGJ: pricePerGJ3,
                        totalPaid: result2.totalPaid,
                        totalCost: result3.totalCost,
                        createdAt: new Date().toISOString(),
                      };
                      return (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDownloadSummary(payload)}
                        >
                          📄 Pobierz PDF podsumowania
                        </Button>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            );
          })()
        )}

        <div>
          <Button asChild variant="outline">
            <Link href="/audytorzy">← Wróć do wyboru narzędzia</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
