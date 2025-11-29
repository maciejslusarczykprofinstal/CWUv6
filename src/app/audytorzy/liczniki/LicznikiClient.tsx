"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Calculator, DollarSign } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

export default function LicznikiClient() {
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

  // Ścieżka 2: controlled inputs
  const [waterVolumeM3, setWaterVolumeM3] = useState<number>(1500);
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
  const [waterVolumeM3_3, setWaterVolumeM3_3] = useState<number>(800);

  // Synchronizacja: zmiana w panelu 1 ustawia panel 2
  useEffect(() => {
    setWaterVolumeM3_3(waterVolumeM3);
  }, [waterVolumeM3]);

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
  }, [pricePerGJ3, waterVolumeM3_3]);

  // Zapisuj wyniki do localStorage na każdą zmianę
  useEffect(() => {
    if (typeof window !== "undefined") {
      const kosztMieszkancow = result2?.totalPaid ?? 0;
      const kosztStrat = result2?.totalPaid && result3?.totalCost ? result2.totalPaid - result3.totalCost : 0;
      const sprawnosc = result2?.totalPaid && result3?.totalCost ? (result3.totalCost / result2.totalPaid) * 100 : 0;
      window.localStorage.setItem("licznikiWyniki", JSON.stringify({ kosztMieszkancow, kosztStrat, sprawnosc }));
    }
  }, [result2, result3]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const kosztMieszkancow = result2?.totalPaid ?? 0;
      const kosztStrat = result2?.totalPaid && result3?.totalCost ? result2.totalPaid - result3.totalCost : 0;
      const sprawnosc = result2?.totalPaid && result3?.totalCost ? (result3.totalCost / result2.totalPaid) * 100 : 0;
      window.localStorage.setItem("licznikiWyniki", JSON.stringify({ kosztMieszkancow, kosztStrat, sprawnosc }));
    }
  }, [result2, result3]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const kosztMieszkancow = result2?.totalPaid ?? 0;
      const kosztStrat = result2?.totalPaid && result3?.totalCost ? result2.totalPaid - result3.totalCost : 0;
      const sprawnosc = result2?.totalPaid && result3?.totalCost ? (result3.totalCost / result2.totalPaid) * 100 : 0;
      window.localStorage.setItem("licznikiWyniki", JSON.stringify({ kosztMieszkancow, kosztStrat, sprawnosc }));
    }
  }, [result2, result3]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-12 flex flex-col gap-10">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 drop-shadow-lg">
            Analiza liczników CWU
          </h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Dwie metody obliczania kosztów ciepłej wody użytkowej dla budynku. Wszystkie obliczenia działają równolegle i aktualizują się na żywo.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Ścieżka 2: Rzeczywista ilość wody + cena → ile zapłacili */}
          <Card className="bg-slate-900/70 border border-blue-900 shadow-2xl">
            <CardHeader className="border-b border-blue-900">
              <CardTitle className="flex items-center gap-2 text-blue-200 text-lg font-bold">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white flex-shrink-0 shadow-lg">
                  <DollarSign className="h-5 w-5" />
                </span>
                <span>Ile zapłacili</span>
              </CardTitle>
              <p className="text-xs text-blue-400 mt-2">
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
                    value={waterVolumeM3}
                    onChange={(e) => {
                      const val = Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0;
                      setWaterVolumeM3(val);
                    }}
                    required
                  />
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
                    variant="outline"
                    className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white border-blue-500 font-semibold shadow"
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
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-700 to-emerald-600 border border-green-400 shadow-lg">
                    <div className="text-xs text-green-100">Koszt mieszkańców</div>
                    <div className="text-2xl font-bold text-white">
                      {result2.totalPaid.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-800 border border-blue-900">
                    <div className="text-xs text-blue-300">Zużyta woda</div>
                    <div className="text-sm font-semibold text-blue-100">
                      {result2.waterVolume.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} m³
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ścieżka 3: Energia → Cena/m³ */}
          <Card className="bg-slate-900/70 border border-blue-900 shadow-2xl">
            <CardHeader className="border-b border-blue-900">
              <CardTitle className="flex items-center gap-2 text-blue-200 text-lg font-bold">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex-shrink-0 shadow-lg">
                  <Calculator className="h-5 w-5" />
                </span>
                <span>Energia → Cena/m³ - Tyle Wspólnota/Spółdzielnia zapłaciła</span>
              </CardTitle>
              <p className="text-xs text-blue-400 mt-2">
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
                    onChange={(e) => {
                      const val = Number.isFinite(e.currentTarget.valueAsNumber) ? e.currentTarget.valueAsNumber : 0;
                      setWaterVolumeM3_3(val);
                    }}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white border-blue-500 font-semibold shadow"
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
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-700 to-cyan-600 border border-blue-400 shadow-lg">
                    <div className="text-xs text-blue-100">
                      Koszt podgrzania {Number(result3 && !isNaN(result3.pricePerM3) ? result3.pricePerM3 : 0) > 0 ? waterVolumeM3_3.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) : "..."} m³ wody bez strat wewnątrzbudynkowych od temperatury początkowej do wymaganych 55°C.
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {result3.totalCost.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-800 border border-blue-900">
                    <div className="text-xs text-blue-300">Cena za m³</div>
                    <div className="text-sm font-semibold text-blue-100">
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
              <Card className={`border ${bgClass} shadow-2xl bg-slate-900/80`}> 
                <CardHeader className="pb-2 border-b border-blue-900">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <span className={`font-semibold flex items-center gap-2 ${isOverpay ? "text-red-500" : "text-blue-200"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.591c.75 1.334-.213 2.31-1.743 2.31H3.482c-1.53 0-2.493-.976-1.743-2.31L8.257 3.1zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-2a1 1 0 01-1-1V9a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
                      KOSZT STRAT
                    </span>
                    <Badge
                      className={
                        isOverpay
                          ? "bg-red-600 text-white hover:bg-red-700 border border-red-700"
                          : isUnderpay
                          ? "bg-rose-600 text-white hover:bg-rose-600/90"
                          : "bg-blue-600 text-white hover:bg-blue-600/90"
                      }
                    >
                      {isOverpay ? <span className="text-white font-bold">nadpłata</span> : isUnderpay ? "niedopłata" : "0 zł"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`text-3xl md:text-4xl font-bold ${isOverpay ? "text-red-500" : textMain}`}>
                    {Math.abs(diff).toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                  </div>
                  {result2.totalPaid > 0 && result3.totalCost > 0 && (
                    <>
                      <div className={`mt-1 text-sm font-semibold ${isOverpay ? "text-red-400" : textSub}`}>
                        {`(${((Math.abs(diff) / result2.totalPaid) * 100).toFixed(1)}% kosztów mieszkańców)`}
                      </div>
                      <div className="w-full max-w-xs mx-auto mt-4">
                        <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 shadow-xl p-4 border border-blue-400">
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={[{ name: "STRATY", value: Math.abs(diff) }, { name: "ENERGIA UŻYTECZNA", value: result2.totalPaid - Math.abs(diff) }]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={90}
                                startAngle={90}
                                endAngle={450}
                                isAnimationActive={true}
                                animationDuration={1400}
                                animationEasing="ease-in-out"
                                cornerRadius={16}
                                stroke="#fff"
                                strokeWidth={3}
                              >
                                <Cell key="straty" fill="#ef4444" />
                                <Cell key="energia" fill="#10b981" />
                              </Pie>
                              {/* Centralna etykieta z procentem strat */}
                              <text
                                x={"50%"}
                                y={"50%"}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={28}
                                fontWeight={700}
                                fill="#ef4444"
                                style={{ filter: "drop-shadow(0 2px 6px #ef4444aa)" }}
                              >
                                {((Math.abs(diff) / result2.totalPaid) * 100).toFixed(1)}%
                              </text>
                              <RechartsTooltip
                                formatter={(value, name) => [`${Number(value).toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł`, name]}
                                contentStyle={{ borderRadius: 12, background: "#fff", boxShadow: "0 2px 12px #0001", fontWeight: 500 }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                            <span className="font-bold text-red-400 flex items-center gap-1">
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9H16M16 9L12 5M16 9L12 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              STRATY
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              ENERGIA UŻYTECZNA
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 9H2M2 9L6 5M2 9L6 13" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                          </span>
                        </div>
                      <div className="mt-8 text-center">
                        <div className="text-lg font-bold tracking-wide text-blue-200 mb-2">SPRAWNOŚĆ SYSTEMU BUDYNKOWEGO</div>
                        <div className="text-4xl font-extrabold text-emerald-400 drop-shadow-lg">
                          {result2.totalPaid > 0 ? (100 - ((Math.abs(diff) / result2.totalPaid) * 100)).toFixed(1) : "-"}%
                        </div>
                      </div>
                      </div>
                    </>
                  )}
                  <div className={`mt-2 text-xs ${textSub}`}>
                    Koszt mieszkańców − Koszt całkowity podgrzania
                  </div>
                  <div className="mt-4">
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
                          className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white border-blue-500 font-semibold shadow"
                          onClick={() => {
                            onDownloadSummary(payload);
                            // Dodatkowy zapis na żądanie
                            if (typeof window !== "undefined") {
                              const kosztMieszkancow = result2?.totalPaid ?? 0;
                              const kosztStrat = result2?.totalPaid && result3?.totalCost ? result2.totalPaid - result3.totalCost : 0;
                              const sprawnosc = result2?.totalPaid && result3?.totalCost ? (result3.totalCost / result2.totalPaid) * 100 : 0;
                              window.localStorage.setItem("licznikiWyniki", JSON.stringify({ kosztMieszkancow, kosztStrat, sprawnosc }));
                            }
                          }}
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

        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline" className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white border-blue-500 font-semibold shadow px-6 py-3 text-lg">
            <Link href="/audytorzy">← Wróć do wyboru narzędzia</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
