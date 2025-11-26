
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useAuditResults } from "@/hooks/useAuditResults";

export default function WynikiZbiorczeAudytoraPage() {

  // Dynamiczne dane z kalkulatora
  const { residentsCost, lossCost, systemEfficiency } = useAuditResults();

  // Funkcje formatowania
  const formatPLNPerYear = (value: number) =>
    value.toLocaleString("pl-PL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " zł/rok";

  const formatPercent = (value: number) =>
    value.toLocaleString("pl-PL", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " %";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-blue-950 px-4 py-12 flex flex-col items-center">
      <Card className="mx-auto max-w-7xl w-full bg-gradient-to-br from-green-900 to-green-700 border-green-700 shadow-lg mb-12">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold text-green-300">Wyniki zbiorcze Audytora</CardTitle>
          <button
            className="ml-4 px-6 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-lg shadow transition"
            type="button"
            onClick={() => window.location.href = '/wykonawcy/szybka-wycena'}
          >
            Koszty inwestycyjne
          </button>
        </CardHeader>
        <CardContent>
          <div className="text-lg text-green-100 mb-6">
            <span className="block text-xl font-bold text-green-300 mb-2">Panel podsumowujący wyniki z wszystkich narzędzi Audytora</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-green-800/80 rounded-xl p-6 shadow-lg flex flex-col items-center">
                <span className="text-lg font-bold text-green-200 mb-2">Koszt mieszkańców</span>
                <span className="text-3xl font-extrabold text-green-300">{formatPLNPerYear(residentsCost)}</span>
                <span className="text-sm text-green-200 mt-2">(suma rocznych opłat mieszkańców za CWU)</span>
              </div>
              <div className="bg-red-800/80 rounded-xl p-6 shadow-lg flex flex-col items-center">
                <span className="text-lg font-bold text-red-200 mb-2">Koszt strat</span>
                <span className="text-3xl font-extrabold text-red-300">{formatPLNPerYear(lossCost)}</span>
                <span className="text-sm text-red-200 mt-2">(koszt energii utraconej w instalacji)</span>
              </div>
              <div className="bg-blue-800/80 rounded-xl p-6 shadow-lg flex flex-col items-center">
                <span className="text-lg font-bold text-blue-200 mb-2">Sprawność systemu budynkowego</span>
                <span className="text-3xl font-extrabold text-blue-300">{formatPercent(systemEfficiency)}</span>
                <span className="text-sm text-blue-200 mt-2">(stosunek energii użytecznej do całkowitej)</span>
              </div>
            </div>
            <span className="block mb-4">W tym miejscu pojawią się:
              <ul className="list-disc pl-6 mt-2 text-base text-green-200">
                <li>Wyniki z Liczników (koszty, zużycie, straty)</li>
                <li>Wyniki z kalkulatora mocy zamówionej</li>
                <li>Warianty modernizacji, oszczędności, payback</li>
                <li>Wizualizacje, wykresy, PDF do pobrania</li>
              </ul>
            </span>
            <span className="block mt-4">Integracja z pozostałymi panelami nastąpi w kolejnych krokach.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
