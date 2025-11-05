"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calculator, DollarSign, Thermometer } from "lucide-react";
import { useState } from "react";

export default function LicznikiPage() {
  // Ścieżka 1: Koszt za m3 z energii i zużycia CWU
  const [result1, setResult1] = useState<{
    pricePerM3: number;
    totalCost: number;
    energyUsedGJ: number;
  } | null>(null);

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

  // Ścieżka 1: Energia cieplna + zużycie CWU → cena za m3
  async function handleSubmit1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const pricePerGJ = Number(fd.get("pricePerGJ1"));
    const cwuGJ = Number(fd.get("cwuGJ1"));
    
    try {
      // Fizyka: grzejemy wodę od 10°C do 55°C
      const deltaT = 55 - 10; // 45 K
      const specificHeat = 4186; // J/(kg·K) = J/(L·K) dla wody
      
      // Energia na 1 m3 (1000 L) wody:
      // E = m * c * ΔT = 1000 kg * 4186 J/(kg·K) * 45 K
      const energyPerM3_J = 1000 * specificHeat * deltaT;
      const energyPerM3_GJ = energyPerM3_J / 1e9; // konwersja J → GJ
      
      // Ile m3 wody podgrzano?
      const waterVolume = cwuGJ / energyPerM3_GJ;
      
      // Całkowity koszt
      const totalCost = cwuGJ * pricePerGJ;
      
      // Cena za m3
      const pricePerM3 = totalCost / waterVolume;
      
      setResult1({
        pricePerM3,
        totalCost,
        energyUsedGJ: cwuGJ,
      });
    } catch (err) {
      alert("Błąd obliczeń: " + (err as Error).message);
    }
  }

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

  // Ścieżka 3: Alternatywna metoda (podobna do ścieżki 1)
  async function handleSubmit3(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const pricePerGJ = Number(fd.get("pricePerGJ3"));
    const cwuGJ = Number(fd.get("cwuGJ3"));
    
    try {
      const deltaT = 55 - 10;
      const specificHeat = 4186;
      const energyPerM3_J = 1000 * specificHeat * deltaT;
      const energyPerM3_GJ = energyPerM3_J / 1e9;
      
      const waterVolume = cwuGJ / energyPerM3_GJ;
      const totalCost = cwuGJ * pricePerGJ;
      const pricePerM3 = totalCost / waterVolume;
      
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analiza liczników CWU
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Trzy metody obliczania kosztów ciepłej wody użytkowej dla budynku.
          </p>
        </header>

        <Tabs defaultValue="path1" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="path1">
              <Thermometer className="h-4 w-4 mr-2" />
              Energia → Cena/m³
            </TabsTrigger>
            <TabsTrigger value="path2">
              <DollarSign className="h-4 w-4 mr-2" />
              Ile zapłacili
            </TabsTrigger>
            <TabsTrigger value="path3">
              <Calculator className="h-4 w-4 mr-2" />
              Metoda alternatywna
            </TabsTrigger>
          </TabsList>

          {/* Ścieżka 1: Energia + zużycie CWU → cena za m3 */}
          <TabsContent value="path1" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
                <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                    <Thermometer className="h-5 w-5" />
                  </span>
                  Oblicz cenę za m³ z energii
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Grzejemy wodę od 10°C do 55°C. Wprowadź cenę energii i zużycie CWU w GJ.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit1} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Energia cieplna – cena [zł/GJ]</Label>
                      <Input 
                        name="pricePerGJ1" 
                        type="number" 
                        step="0.01" 
                        defaultValue="90"
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Zużycie CWU [GJ]</Label>
                      <Input 
                        name="cwuGJ1" 
                        type="number" 
                        step="0.01" 
                        defaultValue="150"
                        placeholder="Dla 80 mieszkań typowo 120-180 GJ/rok"
                        required 
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit">Oblicz</Button>
                    <Button type="button" variant="ghost" onClick={() => setResult1(null)}>
                      Wyczyść
                    </Button>
                  </div>
                </form>

                {result1 && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                      <div className="text-sm text-purple-600 dark:text-purple-400">Cena za m³ wody</div>
                      <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {result1.pricePerM3.toFixed(2)} zł/m³
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Całkowity koszt</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {result1.totalCost.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Energia użyta</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {result1.energyUsedGJ.toFixed(2)} GJ
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ścieżka 2: Rzeczywista ilość wody + cena → ile zapłacili */}
          <TabsContent value="path2" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
                <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
                    <DollarSign className="h-5 w-5" />
                  </span>
                  Ile zapłacili mieszkańcy
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Wprowadź rzeczywistą ilość zużytej wody i cenę za m³.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit2} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Zużyta woda [m³]</Label>
                      <Input 
                        name="waterVolumeM3" 
                        type="number" 
                        step="0.01" 
                        defaultValue="800"
                        placeholder="Dla 80 mieszkań typowo 600-1000 m³/rok"
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Cena za m³ [zł/m³]</Label>
                      <Input 
                        name="pricePerM3_2" 
                        type="number" 
                        step="0.01" 
                        defaultValue="65"
                        required 
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit">Oblicz</Button>
                    <Button type="button" variant="ghost" onClick={() => setResult2(null)}>
                      Wyczyść
                    </Button>
                  </div>
                </form>

                {result2 && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                      <div className="text-sm text-green-600 dark:text-green-400">Mieszkańcy zapłacili</div>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                        {result2.totalPaid.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Zużyta woda</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {result2.waterVolume.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} m³
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ścieżka 3: Alternatywna metoda */}
          <TabsContent value="path3" className="space-y-6">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
              <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
                <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Calculator className="h-5 w-5" />
                  </span>
                  Metoda alternatywna
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Oblicz cenę za m³ na podstawie ceny energii i zużycia CWU (10°C → 55°C).
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit3} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Energia cieplna – cena [zł/GJ]</Label>
                      <Input 
                        name="pricePerGJ3" 
                        type="number" 
                        step="0.01" 
                        defaultValue="90"
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Zużycie CWU [GJ]</Label>
                      <Input 
                        name="cwuGJ3" 
                        type="number" 
                        step="0.01" 
                        defaultValue="150"
                        required 
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit">Oblicz</Button>
                    <Button type="button" variant="ghost" onClick={() => setResult3(null)}>
                      Wyczyść
                    </Button>
                  </div>
                </form>

                {result3 && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-600 dark:text-blue-400">Cena za m³ wody</div>
                      <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                        {result3.pricePerM3.toFixed(2)} zł/m³
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Całkowity koszt</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {result3.totalCost.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div>
          <Button asChild variant="outline">
            <Link href="/audytorzy">← Wróć do wyboru narzędzia</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
