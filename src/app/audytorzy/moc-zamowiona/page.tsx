"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Gauge } from "lucide-react";
import { useState } from "react";

const FormSchema = z.object({
  flats: z.coerce.number().int().positive(),
  risers: z.coerce.number().int().positive(),
  coldTempC: z.coerce.number(),
  hotTempC: z.coerce.number(),
  drawPeakLpm: z.coerce.number().positive(),
  simultProfile: z.enum(["low", "med", "high"]).default("high"),
  bufferL: z.coerce.number().nonnegative().default(0),
  bufferDeltaC: z.coerce.number().nonnegative().default(0),
  peakDurationSec: z.coerce.number().positive().default(600),
});

type FormValues = z.infer<typeof FormSchema>;

type PowerResult = {
  PkW: number;
  PnetkW: number;
  jednocz: number;
  dT: number;
  Ebufor_kWh: number;
};

export default function MocZamowionaPage() {
  const [result, setResult] = useState<PowerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      flats: 120,
      risers: 24,
      coldTempC: 6,
      hotTempC: 55,
      drawPeakLpm: 200,
      simultProfile: "high",
      bufferL: 1500,
      bufferDeltaC: 15,
      peakDurationSec: 600,
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setLoading(true);
    try {
      const r = await fetch("/api/calc/auditor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await r.json();
      if (!json.ok) {
        throw new Error(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
      }
      const power = json.result?.power as PowerResult | undefined;
      if (power) setResult(power);
    } catch (e) {
      alert("Nie udało się wykonać obliczeń: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Oblicz moc zamówioną
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Wprowadź parametry budynku i instalacji CWU. Wynik obejmuje moc szczytową oraz moc po buforze.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Gauge className="h-5 w-5" />
                </span>
                Dane wejściowe
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Liczba mieszkań" error={form.formState.errors.flats?.message}>
                    <Input type="number" step="1" {...form.register("flats", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Liczba pionów" error={form.formState.errors.risers?.message}>
                    <Input type="number" step="1" {...form.register("risers", { valueAsNumber: true })} />
                  </Field>
                  <Field label="T. zimnej [°C]" error={form.formState.errors.coldTempC?.message}>
                    <Input type="number" step="0.1" {...form.register("coldTempC", { valueAsNumber: true })} />
                  </Field>
                  <Field label="T. CWU [°C]" error={form.formState.errors.hotTempC?.message}>
                    <Input type="number" step="0.1" {...form.register("hotTempC", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Szczytowy pobór [L/min]" error={form.formState.errors.drawPeakLpm?.message}>
                    <Input type="number" step="1" {...form.register("drawPeakLpm", { valueAsNumber: true })} />
                  </Field>
                  <div className="space-y-2">
                    <Label>Profil jednoczesności</Label>
                    <Select
                      value={form.watch("simultProfile")}
                      onValueChange={(v) => form.setValue("simultProfile", v as FormValues["simultProfile"])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz profil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Niski</SelectItem>
                        <SelectItem value="med">Średni</SelectItem>
                        <SelectItem value="high">Wysoki</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.simultProfile && (
                      <p className="text-sm text-red-600">{form.formState.errors.simultProfile.message}</p>
                    )}
                  </div>
                  <Field label="Bufor [L]" error={form.formState.errors.bufferL?.message}>
                    <Input type="number" step="1" {...form.register("bufferL", { valueAsNumber: true })} />
                  </Field>
                  <Field label="ΔT bufora [K]" error={form.formState.errors.bufferDeltaC?.message}>
                    <Input type="number" step="1" {...form.register("bufferDeltaC", { valueAsNumber: true })} />
                  </Field>
                  <Field label="Czas piku [s]" error={form.formState.errors.peakDurationSec?.message}>
                    <Input type="number" step="1" {...form.register("peakDurationSec", { valueAsNumber: true })} />
                  </Field>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="px-8">
                    {loading ? "Liczenie…" : "Oblicz moc"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { form.reset(); setResult(null); }}>
                    Wyczyść
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200/70 dark:border-slate-700/60">
              <CardTitle className="text-slate-800 dark:text-slate-200">Wyniki</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {result ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Moc szczytowa" value={`${result.PkW.toFixed(1)} kW`} />
                  <Info label="Moc po buforze" value={`${result.PnetkW.toFixed(1)} kW`} />
                  <Info label="Jednoczesność" value={result.jednocz.toFixed(2)} />
                  <Info label="ΔT" value={`${result.dT.toFixed(1)} K`} />
                  <Info label="Energia bufora" value={`${result.Ebufor_kWh.toFixed(2)} kWh`} />
                </div>
              ) : (
                <p className="text-slate-600 dark:text-slate-400">Wyniki pojawią się po wykonaniu obliczeń.</p>
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
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
