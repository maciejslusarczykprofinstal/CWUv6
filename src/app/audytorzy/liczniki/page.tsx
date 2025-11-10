"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign } from "lucide-react";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { toast } from "sonner";

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-semibold text-slate-900 dark:text-slate-100">{typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : "-"} {unit}</div>
    </div>
  );
}


export default function LicznikiPage() {
  const { theme, setTheme } = useTheme();
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
      toast.error("Nie udało się wygenerować PDF", { description: String(e) });
    }
  }

  async function onDownloadSummary(payload: Record<string, unknown>) {
    const { LicznikiSummaryPDF } = await import("@/lib/report/liczniki-summary-pdf");
    const doc = <LicznikiSummaryPDF data={payload as any} />;
    void generatePdfClient(doc, "raport-liczniki.pdf");
  }

  // Wspólna wartość zużycia wody dla obu ścieżek
  const [waterVolumeM3, setWaterVolumeM3] = useState<number>(1500);
  // Ścieżka 2: controlled inputs
  const [pricePerM3_2, setPricePerM3_2] = useState<number>(65);
  const result2 = useMemo(() => {
    const w = coerce(waterVolumeM3);
    const p = coerce(pricePerM3_2);
    return {
      totalPaid: w * p,
      waterVolume: w,
    };
  }, [waterVolumeM3, pricePerM3_2]);
  // Ścieżka 3: controlled inputs
  const [pricePerGJ3, setPricePerGJ3] = useState<number>(90);
  const result3 = useMemo(() => {
    // Fizyka: grzejemy wodę od 10°C do 55°C
    const deltaT = 55 - 10; // 45 K
    const specificHeat = 4186; // J/(kg·K)
    const energyPerM3_J = 1000 * specificHeat * deltaT;
    const energyPerM3_GJ = energyPerM3_J / 1e9; // ~0.18837 GJ/m3
    const pricePerGJ = coerce(pricePerGJ3);
    const w = coerce(waterVolumeM3);
    const totalEnergyGJ = w * energyPerM3_GJ;
    const totalCost = totalEnergyGJ * pricePerGJ;
    const pricePerM3 = w > 0 ? totalCost / w : 0;
    return { pricePerM3, totalCost };
  }, [pricePerGJ3, waterVolumeM3]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-xl">
              Analiza strat wg. liczników CWU lub faktur
            </h1>
            <p className="text-slate-300">
              Dwie metody obliczania kosztów ciepłej wody użytkowej dla budynku. Wszystkie obliczenia działają równolegle i aktualizują się na żywo.
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Ścieżka 2: Rzeczywista ilość wody + cena → ile zapłacili */}
          <Card className="bg-white/10 dark:bg-slate-900/80 backdrop-blur border-0 shadow-2xl">
            <CardHeader className="border-b border-slate-700/60">
              <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 via-emerald-400 to-cyan-500 text-white flex-shrink-0 shadow-lg">
                  <DollarSign className="h-5 w-5" />
                </span>
                <span>Koszty i zużycie CWU mieszkańców</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-2">
                Rzeczywista ilość × cena
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-200">Zużyta zimna woda do podgrzania (odczyt z wodomierza głównego) [m³], lub z faktury w przeciągu roku</Label>
                  <Input 
                    name="waterVolumeM3"
                    type="number"
                    step="0.01"
                    value={waterVolumeM3}
                    onChange={(e) => setWaterVolumeM3(Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0)}
                    required
                  />
                  <p className="text-xs text-slate-400">80 mieszkań: 1000-2000 m³/rok</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-200">Cena [zł/m³]</Label>
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
                      setWaterVolumeM3(800);
                      setPricePerM3_2(65);
                    }}
                  >
                    Wyczyść
                  </Button>
                </div>
              </form>
              {result2 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-400/20 via-emerald-400/10 to-cyan-400/10 border border-emerald-700">
                    <div className="text-xs text-emerald-400">Tyle zapłacili mieszkańcy za podgrzanie CWU</div>
                    <div className="text-2xl font-bold text-emerald-200">
                      {result2.totalPaid.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/60">
                    <div className="text-xs text-slate-400">Zużyta woda</div>
                    <div className="text-sm font-semibold text-slate-200">
                      {result2.waterVolume.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} m³
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ścieżka 3: Energia → Cena/m³ */}
          <Card className="bg-white/10 dark:bg-slate-900/80 backdrop-blur border-0 shadow-2xl">
            <CardHeader className="border-b border-slate-700/60">
              <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white flex-shrink-0 shadow-lg">
                  <Calculator className="h-5 w-5" />
                </span>
                <span>Energia → Cena/m³</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-2">
                m³ wody → Koszt podgrzania (10°C → 55°C)
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-200">Energia [zł/GJ] wg cennika dostawcy ciepła Kraków https://www.mpec.krakow.pl/taryfy-i-cenniki</Label>
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
                  <Label className="text-sm text-slate-200">Zużycie CWU [m³]</Label>
                  <Input 
                    name="waterVolumeM3"
                    type="number"
                    step="0.01"
                    value={waterVolumeM3}
                    onChange={(e) => setWaterVolumeM3(Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0)}
                    required
                  />
                  <p className="text-xs text-slate-400">80 mieszkań: 600-1000 m³/rok</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPricePerGJ3(90);
                      setWaterVolumeM3(800);
                    }}
                  >
                    Wyczyść
                  </Button>
                </div>
              </form>
              {result3 && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-400/20 via-indigo-400/10 to-fuchsia-400/10 border border-indigo-700">
                    <div className="text-xs text-blue-400">Koszt użytecznego podgrzania CWU</div>
                    <div className="text-2xl font-bold text-blue-200">
                      {result3.totalCost.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/60">
                    <div className="text-xs text-slate-400">Cena za m³</div>
                    <div className="text-sm font-semibold text-slate-200">
                      {result3.pricePerM3.toFixed(2)} zł/m³
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Straty budynku za rok na energi zmiennej GJ (live) + wykres kołowy */}
        {Number.isFinite(result2.totalPaid) && Number.isFinite(result3.totalCost) && (
          (() => {
            const diff = result2.totalPaid - result3.totalCost;
            const bgClass = "bg-gradient-to-r from-fuchsia-700/10 via-blue-900/20 to-slate-900/40 border-fuchsia-800";
            const textMain = "text-fuchsia-200";
            const textSub = "text-fuchsia-400";
            const pieData = [
              {
                name: "Koszt użytecznego podgrzania CWU",
                value: result3.totalCost,
                color: "#38bdf8", // niebieski
              },
              {
                name: "Straty budynku za rok",
                value: Math.abs(diff),
                color: "#a21caf", // fioletowy
              },
            ];
            return (
              <div className="flex flex-col lg:flex-row justify-center items-stretch gap-8 py-8">
                <Card className={`border ${bgClass} shadow-2xl w-full max-w-xl mx-auto`}> 
                  <CardHeader className="pb-2 flex flex-col items-center">
                    <CardTitle className="text-center text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      straty budynku za rok za zakup energi zmiennej GJ (tzw. opłata zmienna)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex flex-col items-center">
                    <div className={`text-4xl md:text-5xl font-extrabold ${textMain} text-center`}
                      style={{ letterSpacing: "0.02em" }}>
                      {Math.abs(diff).toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                    <div className={`mt-2 text-xs ${textSub} text-center`}
                      style={{ letterSpacing: "0.04em" }}>
                      Tyle mieszkańcy zapłacili za straty wewnętrzne instalacji w przeciągu roku
                    </div>
                    <div className="mt-6 flex justify-center">
                      {(() => {
                        const payload = {
                          waterVolumeM3: waterVolumeM3,
                          paidVolumeM3: waterVolumeM3,
                          theoreticalVolumeM3: waterVolumeM3,
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
                {/* Wykres kołowy */}
                <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto bg-slate-900/60 rounded-2xl shadow-xl p-6">
                  <h3 className="text-base font-bold text-slate-200 mb-4 text-center">Udział kosztów w rocznym rachunku mieszkańców</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        label={({ name, percent, index }) =>
                          index === 1
                            ? `STRATY ${((percent as number) * 100).toFixed(0)}%`
                            : `${name}: ${((percent as number) * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-xs text-slate-400 text-center">
                    Całość = koszt mieszkańców za podgrzanie CWU i straty budynku
                  </div>
                </div>
              </div>
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
