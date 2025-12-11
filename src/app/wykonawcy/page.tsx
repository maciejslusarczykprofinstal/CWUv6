"use client";
import { Wrench, Calculator, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WykonawcyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      {/* Dekoracyjne gradientowe blury w tle */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Wykonawcy
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Narzędzia dla wykonawców instalacji CWU – szybkie wyceny, kosztorysy i dokumentacja techniczna
          </p>
        </div>

        {/* Karty narzędzi */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-green-700/30 cursor-pointer"
            onClick={() => window.location.href = '/wykonawcy/harmonogram'}
            role="button"
            tabIndex={0}
            aria-label="Planowanie prac i terminy realizacji"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-700/10 via-green-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 via-green-800 to-blue-900 text-green-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-7 w-7" />
              </span>
              <span className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-200 group-hover:text-green-300 transition-colors">
                  Planowanie prac i terminy realizacji
                </span>
                <span className="text-sm text-slate-400 text-center">
                  Harmonogram modernizacji instalacji CWU
                </span>
                <Badge variant="secondary" className="mt-2">Nowość</Badge>
              </span>
            </div>
          </div>
          <div
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-blue-700/30 cursor-pointer"
            onClick={() => window.location.href = '/wykonawcy/szybka-wycena'}
            role="button"
            tabIndex={0}
            aria-label="Szybka wycena"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/10 via-blue-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 text-cyan-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Calculator className="h-7 w-7" />
              </span>
              <span className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  Szybka wycena
                </span>
                <span className="text-sm text-slate-400 text-center">
                  Kalkulator kosztów materiałów i robocizny
                </span>
                <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
              </span>
            </div>
          </div>

          <div
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-green-700/30 cursor-pointer"
            onClick={() => window.location.href = '/wykonawcy/generator-ofert'}
            role="button"
            tabIndex={0}
            aria-label="Generator ofert"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-700/10 via-green-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 via-green-800 to-blue-900 text-green-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-7 w-7" />
              </span>
              <span className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-200 group-hover:text-green-300 transition-colors">
                  Generator ofert
                </span>
                <span className="text-sm text-slate-400 text-center">
                  Automatyczne tworzenie ofert PDF
                </span>
                <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
              </span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-purple-700/30 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-700/10 via-purple-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 via-purple-800 to-blue-900 text-purple-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Wrench className="h-7 w-7" />
              </span>
              <span className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                  Narzędzia tech.
                </span>
                <span className="text-sm text-slate-400 text-center">
                  Kalkulatory przepływów, strat ciepła
                </span>
                <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
              </span>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-orange-700/30 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-700/10 via-orange-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-700 via-orange-800 to-blue-900 text-orange-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-7 w-7" />
              </span>
              <span className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-200 group-hover:text-orange-300 transition-colors">
                  Harmonogram
                </span>
                <span className="text-sm text-slate-400 text-center">
                  Planowanie prac i terminy realizacji
                </span>
                <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
              </span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8">
            <h2 className="text-2xl font-bold text-cyan-200 mb-6">Funkcje dla wykonawców</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-slate-200">Szybkie wyceny</h4>
                  <p className="text-sm text-slate-400">
                    Automatyczne kalkulacje materiałów na podstawie parametrów instalacji
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-slate-200">Generowanie dokumentacji</h4>
                  <p className="text-sm text-slate-400">
                    Profesjonalne oferty, kosztorysy i raporty PDF
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-slate-200">Narzędzia techniczne</h4>
                  <p className="text-sm text-slate-400">
                    Kalkulatory mocy, przepływów i strat cieplnych
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8">
            <h2 className="text-2xl font-bold text-cyan-200 mb-6">Rozpocznij pracę</h2>
            <div className="space-y-4">
              <p className="text-slate-400">
                Sekcja wykonawców jest w trakcie rozwoju. Dostępne będą narzędzia do:
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Szybkich wyliczeń materiałów i kosztów</li>
                <li>• Automatycznego generowania ofert</li>
                <li>• Planowania harmonogramów prac</li>
                <li>• Zarządzania projektami CWU</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}