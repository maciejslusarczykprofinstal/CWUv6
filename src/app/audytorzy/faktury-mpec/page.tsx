"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { useState } from "react";

export default function FakturyMPECPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    cwuGJ: number;
    coGJ: number;
    totalGJ: number;
    cwuCost: number;
    coCost: number;
    totalCost: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    
    const totalGJ = Number(fd.get("totalGJ"));
    const cwuPercent = Number(fd.get("cwuPercent"));
    const pricePerGJ = Number(fd.get("pricePerGJ"));
    
    try {
      // Obliczenia proste - podział na CWU i CO
      const cwuGJ = (totalGJ * cwuPercent) / 100;
      const coGJ = totalGJ - cwuGJ;
      const cwuCost = cwuGJ * pricePerGJ;
      const coCost = coGJ * pricePerGJ;
      const totalCost = totalGJ * pricePerGJ;
      
      setResult({
        cwuGJ,
        coGJ,
        totalGJ,
        cwuCost,
        coCost,
        totalCost,
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Obliczenia z faktur MPEC
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Wprowadź dane z faktury MPEC aby obliczyć zużycie CWU i CO.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FileText className="h-5 w-5" />
                </span>
                Dane z faktury
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Łączne zużycie [GJ]</Label>
                  <Input 
                    name="totalGJ" 
                    type="number" 
                    step="0.01" 
                    defaultValue="850"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Udział CWU [%]</Label>
                  <Input 
                    name="cwuPercent" 
                    type="number" 
                    step="0.1" 
                    defaultValue="35"
                    min="0"
                    max="100"
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
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Zużycie CWU</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {result.cwuGJ.toFixed(2)} GJ/rok
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Koszt: {result.cwuCost.toLocaleString("pl-PL")} zł/rok
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Zużycie CO</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {result.coGJ.toFixed(2)} GJ/rok
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Koszt: {result.coCost.toLocaleString("pl-PL")} zł/rok
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-600 dark:text-blue-400">Łącznie</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {result.totalGJ.toFixed(2)} GJ/rok
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Koszt: {result.totalCost.toLocaleString("pl-PL")} zł/rok
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
