"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Result = {
  energyLossPerM3: number;
  lossPerM3: number;
  monthlyFinancialLoss: number;
  yearlyFinancialLoss: number;
  theoreticalCostPerM3: number;
  actualMonthlyPayment: number;
  theoreticalMonthlyPayment: number;
  energyPerM3: number;
};

type Inputs = {
  cwuPriceFromBill: number;
  monthlyConsumption: number;
  coldTempC: number;
  hotTempC: number;
  heatPriceFromCity: number;
};

type ReasonKey =
  | "billingOpacity"
  | "cwuPriceTooHigh"
  | "circulation24h"
  | "noBalancing"
  | "poorInsulation"
  | "tooHighTemps";

const REASONS: Array<{ key: ReasonKey; label: string }> = [
  {
    key: "cwuPriceTooHigh",
    label: "Znaczna rozbieżność między kosztem teoretycznym a ceną CWU na rachunku",
  },
  { key: "billingOpacity", label: "Brak transparentnego rozbicia składowych opłat CWU" },
  { key: "circulation24h", label: "Podejrzenie pracy cyrkulacji/pomp 24h (zbędne straty)" },
  { key: "noBalancing", label: "Podejrzenie braku równoważenia hydraulicznego instalacji" },
  { key: "poorInsulation", label: "Podejrzenie niewystarczającej izolacji przewodów CWU/cyrkulacji" },
  { key: "tooHighTemps", label: "Podejrzenie nieoptymalnych nastaw temperatur i parametrów pracy" },
];

export function ResidentCwuComplaintLetterSection({
  inputs,
  result,
  generatePdf,
}: {
  inputs: Inputs;
  result: Result;
  generatePdf: (doc: React.ReactElement, filename: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Record<ReasonKey, boolean>>({
    billingOpacity: true,
    cwuPriceTooHigh: true,
    circulation24h: false,
    noBalancing: false,
    poorInsulation: false,
    tooHighTemps: false,
  });
  const [otherReason, setOtherReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedReasons = useMemo(() => {
    return REASONS.filter((r) => selected[r.key]).map((r) => ({ id: r.key, label: r.label }));
  }, [selected]);

  async function onGenerate() {
    setIsGenerating(true);
    try {
            const { ResidentCwuIssueLetterPDFDocument } = await import(
        "@/lib/report/resident-cwu-complaint-letter-pdf-client"
      );

      const doc = (
              <ResidentCwuIssueLetterPDFDocument
          input={inputs as any}
          result={result}
          complaint={{
            reasons: selectedReasons,
            otherReason,
            description,
          }}
        />
      );

            await generatePdf(doc, "zgloszenie-wysokich-kosztow-cwu.pdf");
            toast.success("Wygenerowano zgłoszenie (PDF)");
    } catch (e) {
      toast.error("Nie udało się wygenerować pisma", { description: String(e) });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl text-purple-800 dark:text-purple-200 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl shadow-lg">
            ✉️
          </div>
                Pismo: zgłoszenie wysokich kosztów CWU
        </CardTitle>
        <p className="text-slate-700 dark:text-slate-300 mt-2">
          Zaznacz przyczyny, dodaj krótki opis i wygeneruj gotowe pismo do zarządcy.
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="bg-white/70 dark:bg-slate-900/60 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <div className="font-semibold mb-2">Pismo będzie zawierać m.in.:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                nadpłatę na m³: <span className="font-bold">{result.lossPerM3.toFixed(2)} zł/m³</span>
              </li>
              <li>
                ekwiwalent strat energii: <span className="font-bold">{result.energyLossPerM3.toFixed(4)} GJ/m³</span>
              </li>
              <li>
                skutki finansowe: <span className="font-bold">{result.monthlyFinancialLoss.toFixed(2)} zł/mies.</span> oraz{" "}
                <span className="font-bold">{result.yearlyFinancialLoss.toFixed(2)} zł/rok</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Zaznacz przyczyny / wątpliwości
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {REASONS.map((r) => (
              <label
                key={r.key}
                className="flex gap-3 items-start p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5"
                  checked={selected[r.key]}
                  onChange={(e) => setSelected((prev) => ({ ...prev, [r.key]: e.target.checked }))}
                />
                <span className="text-sm text-slate-800 dark:text-slate-200 leading-snug">{r.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Inne (opcjonalnie)
            </label>
            <input
              type="text"
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="np. wahania temperatury CWU, brak równych odczytów, itp."
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Opis sytuacji (opcjonalnie)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Opisz krótko problem: kiedy występuje, jak wygląda, co już było zgłaszane, itp."
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#101828] text-[#101828] dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-end">
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-8 py-6 text-lg font-extrabold bg-gradient-to-r from-purple-700 to-fuchsia-500 hover:from-purple-800 hover:to-fuchsia-600 text-white rounded-2xl shadow-2xl hover:shadow-fuchsia-400/40 transition-all hover:scale-[1.02] border-4 border-fuchsia-300 dark:border-fuchsia-700"
          >
            {isGenerating ? "Generowanie…" : "📄 Generuj zgłoszenie (PDF)"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
