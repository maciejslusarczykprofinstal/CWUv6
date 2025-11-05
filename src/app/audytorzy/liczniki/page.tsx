"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";
import { useState } from "react";

export default function LicznikiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    consumption: number;
    averageMonthly: number;
    averageDaily: number;
    cost: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const startReading = Number(fd.get("startReading"));
    const endReading = Number(fd.get("endReading"));
    const days = Number(fd.get("days"));
    const pricePerGJ = Number(fd.get("pricePerGJ"));
    
    try {
      if (endReading <= startReading) {
        throw new Error("Odczyt końcowy musi być większy niż początkowy");
      }
      
      // Obliczenia zużycia
      const consumption = endReading - startReading; // w GJ
      const averageDaily = consumption / days;
      const averageMonthly = averageDaily * 30;
      const cost = consumption * pricePerGJ;
      
      setResult({
        consumption,
        averageMonthly,
        averageDaily,
        cost,
      });
    } catch (err) {
      alert("Błąd obliczeń: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analiza liczników
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Wprowadź odczyty licznika ciepła aby obliczyć zużycie i średnie.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
                  <Activity className="h-5 w-5" />
                </span>
                Odczyty licznika
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Odczyt początkowy [GJ]</Label>
                  <Input 
                    name="startReading" 
                    type="number" 
                    step="0.001" 
                    defaultValue="100.000"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Odczyt końcowy [GJ]</Label>
                  <Input 
                    name="endReading" 
                    type="number" 
                    step="0.001" 
                    defaultValue="150.000"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Okres [dni]</Label>
                  <Input 
                    name="days" 
                    type="number" 
                    step="1" 
                    defaultValue="30"
                    min="1"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cena za GJ [zł/GJ]</Label>
                  <Input 
                    name="pricePerGJ" 
                    type="number" 
                    step="0.01" 
                    defaultValue="75"
                    required 
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Obliczam..." : "Oblicz"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setResult(null)}
                  >
                    Wyczyść
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
              <CardTitle className="text-slate-800 dark:text-slate-200">Wynik</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {result ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
                    <div className="text-sm text-purple-600 dark:text-purple-400">Zużycie w okresie</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {result.consumption.toFixed(3)} GJ
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Koszt: {result.cost.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Średnia dzienna</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {result.averageDaily.toFixed(4)} GJ/dzień
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Średnia miesięczna</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {result.averageMonthly.toFixed(3)} GJ/miesiąc
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Szacunkowy koszt: {(result.averageMonthly * 75).toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł/miesiąc
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">
                  Wyniki pojawią się po wykonaniu obliczeń.
                </p>
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
