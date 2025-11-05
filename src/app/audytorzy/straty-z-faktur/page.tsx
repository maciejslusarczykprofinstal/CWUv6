import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function StratyZFakturPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Oblicz straty z faktur
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Moduł w przygotowaniu. Wkrótce dodamy analizę strat cyrkulacji na podstawie danych z faktur.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur p-8">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Co tu będzie?</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Narzędzie do wyznaczania strat cyrkulacji metodą porównania faktur oraz wzorem UA×ΔT×t.
              </p>
            </div>
          </div>
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
