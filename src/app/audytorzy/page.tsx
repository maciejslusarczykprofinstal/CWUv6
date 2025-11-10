import Link from "next/link";
import { Gauge, Activity } from "lucide-react";

export default function AudytorzyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      {/* Dekoracyjne gradientowe blury w tle */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Audytorzy
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Wybierz działanie audytowe lub kalkulacyjne, które chcesz wykonać.
          </p>
        </div>

        {/* Karty nawigacyjne */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Link
            href="/audytorzy/liczniki"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-pink-700/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-700/10 via-purple-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-700 via-purple-700 to-blue-900 text-pink-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-200 group-hover:text-pink-300 transition-colors">
                  Liczniki
                </span>
                <span className="text-sm text-slate-400">
                  Analiza odczytów liczników ciepła
                </span>
              </span>
            </div>
          </Link>

          <Link
            href="/audytorzy/moc-zamowiona"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-blue-700/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/10 via-blue-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 text-cyan-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gauge className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  Oblicz moc zamówioną
                </span>
                <span className="text-sm text-slate-400">
                  Szybki kalkulator mocy z buforem i jednoczesnością
                </span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}