"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, Thermometer } from "lucide-react";
import { useState } from "react";

export default function LicznikiPage() {
  // Ścieżka 2: Ile zapłacili mieszkańcy
  const [result2, setResult2] = useState<{
    totalPaid: number;
    waterVolume: number;
  } | null>(null);

  // Ścieżka 3: Druga metoda kosztu za m3
  const [result3, setResult3] = useState<{
    pricePerM3: number;
    totalCost: number;
  } | null>(null);

  // Ścieżka 2: Rzeczywista ilość wody + cena za m3 → ile zapłacili
  async function handleSubmit2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const waterVolumeM3 = Number(fd.get("waterVolumeM3"));
    const pricePerM3 = Number(fd.get("pricePerM3_2"));
    
    try {
      const totalPaid = waterVolumeM3 * pricePerM3;
      
      setResult2({
        totalPaid,
        waterVolume: waterVolumeM3,
      });
    } catch (err) {
      alert("Błąd obliczeń: " + (err as Error).message);
    }
  }

  // Ścieżka 3: Alternatywna metoda (m³ wody → koszt całkowity)
  async function handleSubmit3(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const pricePerGJ = Number(fd.get("pricePerGJ3"));
    const waterVolumeM3 = Number(fd.get("waterVolumeM3_3"));
    
    try {
      // Fizyka: grzejemy wodę od 10°C do 55°C
      const deltaT = 55 - 10; // 45 K
      const specificHeat = 4186; // J/(kg·K) = J/(L·K) dla wody
      
      // Energia na 1 m3 (1000 L) wody:
      // E = m * c * ΔT = 1000 kg * 4186 J/(kg·K) * 45 K
      const energyPerM3_J = 1000 * specificHeat * deltaT;
      const energyPerM3_GJ = energyPerM3_J / 1e9; // konwersja J → GJ
      
      // Całkowita energia potrzebna do podgrzania waterVolumeM3
      const totalEnergyGJ = waterVolumeM3 * energyPerM3_GJ;
      
      // Koszt całkowity
      const totalCost = totalEnergyGJ * pricePerGJ;
      
      // Cena za m3
      const pricePerM3 = totalCost / waterVolumeM3;
      
      setResult3({
        pricePerM3,
        totalCost,
      });
    } catch (err) {
      alert("Błąd obliczeń: " + (err as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analiza liczników CWU
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Trzy metody obliczania kosztów ciepłej wody użytkowej dla budynku. Wszystkie obliczenia działają równolegle.
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
              <form onSubmit={handleSubmit2} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Zużyta woda [m³]</Label>
                  <Input 
                    name="waterVolumeM3" 
                    type="number" 
                    step="0.01" 
                    defaultValue="800"
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
                    defaultValue="65"
                    required 
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1">Oblicz</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setResult2(null)}>
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
              <form onSubmit={handleSubmit3} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Energia [zł/GJ]</Label>
                  <Input 
                    name="pricePerGJ3" 
                    type="number" 
                    step="0.01" 
                    defaultValue="90"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Zużycie CWU [m³]</Label>
                  <Input 
                    name="waterVolumeM3_3" 
                    type="number" 
                    step="0.01" 
                    defaultValue="800"
                    required 
                  />
                  <p className="text-xs text-slate-500">80 mieszkań: 600-1000 m³/rok</p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1">Oblicz</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setResult3(null)}>
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

        <div>
          <Button asChild variant="outline">
            <Link href="/audytorzy">← Wróć do wyboru narzędzia</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
