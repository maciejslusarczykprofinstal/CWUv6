import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gauge, FileText } from "lucide-react";

export default function AudytorzyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <header className="text-center space-y-4 mb-10">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Audytorzy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Zaczynamy od nowa. Wybierz działanie, które chcesz wykonać.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Button
            asChild
            size="lg"
            className="h-auto py-8 px-8 rounded-2xl text-left bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white hover:bg-none"
          >
            <Link href="/audytorzy/moc-zamowiona" className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Gauge className="h-6 w-6" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold">Oblicz moc zamówioną</span>
                <span className="text-sm opacity-90">Szybki kalkulator mocy z buforem i jednoczesnością</span>
              </span>
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="h-auto py-8 px-8 rounded-2xl text-left bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:bg-none"
          >
            <Link href="/audytorzy/straty-z-faktur" className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <FileText className="h-6 w-6" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold">Oblicz straty z faktur</span>
                <span className="text-sm opacity-90">Analiza strat cyrkulacji na podstawie danych z faktur</span>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}