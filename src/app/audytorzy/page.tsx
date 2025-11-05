import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gauge, FileText, Activity } from "lucide-react";

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link 
            href="/audytorzy/moc-zamowiona" 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-indigo-500 dark:hover:border-indigo-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gauge className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Oblicz moc zamówioną
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Szybki kalkulator mocy z buforem i jednoczesnością
                </span>
              </span>
            </div>
          </Link>

          <Link 
            href="/audytorzy/faktury-mpec" 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-cyan-500 dark:hover:border-cyan-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Obliczenia z faktur MPEC
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Analiza zużycia i kosztów na podstawie faktur
                </span>
              </span>
            </div>
          </Link>

          <Link 
            href="/audytorzy/liczniki" 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-pink-500 dark:hover:border-pink-400"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  Liczniki
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Analiza odczytów liczników ciepła
                </span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}