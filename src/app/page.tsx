import Link from "next/link";
import { ArrowRight, Calculator, Users, BarChart3, Zap, Building, CheckCircle, Shield, Clock, TrendingDown } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero z gradientem w tle */}
      <section className="relative text-center space-y-8 py-20 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 -z-10" />
        
        <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full text-sm font-semibold text-blue-700 dark:text-blue-300 mb-6 shadow-lg border border-blue-200/50 dark:border-blue-800/50">
          <span className="text-lg">⚡</span>
          Platforma #1 dla instalacji CWU w Polsce
          <span className="text-lg">🏆</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight px-4">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CWU bez zgadywania
          </span>
          <br />
          <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-slate-200 mt-2 block">
            Dane. Precyzja. Oszczędności.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
          Profesjonalne obliczenia mocy zamówionej, analiza strat cyrkulacji 
          i automatyczne raporty PDF. <span className="font-semibold text-slate-700 dark:text-slate-300">Wszystko w jednym miejscu.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all hover:scale-105"
            href="/mieszkancy"
          >
            Rozpocznij za darmo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-semibold text-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:scale-105 shadow-lg"
            href="/audytorzy"
          >
            Zobacz demo
          </Link>
        </div>

        {/* Stats cards z efektami */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-16 px-4">
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-5xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">15,000+</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Obliczeń dziennie</div>
            </div>
          </div>
          
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">98%</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Zadowolonych klientów</div>
            </div>
          </div>
          
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-purple-950/30 border border-purple-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-5xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">2.4M zł</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Zaoszczędzone rocznie</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section z lepszym nagłówkiem */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Dedykowane narzędzia dla{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">każdej roli</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Wybierz moduł dopasowany do Twoich potrzeb i zacznij oszczędzać już dziś
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/mieszkancy"
            className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Mieszkańcy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Sprawdź czy Twoje wpłaty odpowiadają rzeczywistym kosztom energii
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                Sprawdź <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            href="/audytorzy"
            className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Audytorzy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Precyzyjne obliczenia mocy i strat cyrkulacji z wariantami modernizacji
              </p>
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                Sprawdź <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            href="/wykonawcy"
            className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-purple-950/20 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Wykonawcy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Błyskawiczne wyceny i profesjonalne oferty dla Twoich klientów
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-bold">
                Sprawdź <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            href="/inwestorzy"
            className="group relative p-8 rounded-3xl bg-gradient-to-br from-white to-pink-50/50 dark:from-slate-900 dark:to-pink-950/20 border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600 transition-all hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Building className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Inwestorzy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Zarządzaj wieloma budynkami i monitoruj koszty w czasie rzeczywistym
              </p>
              <div className="flex items-center text-pink-600 dark:text-pink-400 text-sm font-bold">
                Sprawdź <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* CTA Section z gradientem */}
      <section className="relative text-center space-y-8 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 -z-10" />
        
        <div className="space-y-6 px-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Gotowy na <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">oszczędności?</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Dołącz do tysięcy zadowolonych użytkowników i zacznij optymalizować instalacje CWU już dziś
          </p>
          
          <Link
            className="inline-flex items-center gap-2 px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
            href="/mieszkancy"
          >
            Zacznij za darmo
            <ArrowRight className="w-6 h-6" />
          </Link>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 pt-4">
            Nie wymagamy karty kredytowej • Pełna funkcjonalność • Wsparcie 24/7
          </p>
        </div>
      </section>
    </div>
  );
}
