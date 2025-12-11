import Link from "next/link";
import { ArrowRight, Users, BarChart3, Zap, Building } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      {/* Dekoracyjne gradientowe blury w tle */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            CWU bez zgadywania
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Profesjonalne obliczenia mocy zamówionej, analiza strat cyrkulacji i automatyczne raporty PDF. Wszystko w jednym miejscu.
          </p>
          {/* Przyciski usunięte na życzenie */}
        </div>
        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 flex flex-col items-center">
            <div className="text-5xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Tysiące</div>
            <div className="text-sm font-medium text-slate-400">Obliczeń dziennie</div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 flex flex-col items-center">
            <div className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">98%</div>
            <div className="text-sm font-medium text-slate-400">Zadowolonych klientów</div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 flex flex-col items-center">
            <div className="text-5xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Miliony zł</div>
            <div className="text-sm font-medium text-slate-400">Zaoszczędzone rocznie</div>
          </div>
        </div>
        {/* Features Section */}
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Dedykowane narzędzia dla <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">każdej roli</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Wybierz moduł dopasowany do Twoich potrzeb i zacznij oszczędzać już dziś
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Link href="/mieszkancy" className="group relative p-8 rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md flex flex-col items-center hover:scale-105 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-200">Mieszkańcy</h3>
            <p className="text-sm text-slate-400 mb-4 text-center">Sprawdź czy Twoje wpłaty odpowiadają rzeczywistym kosztom energii</p>
            <span className="text-blue-400 font-bold">Sprawdź <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>
          <Link href="/audytorzy" className="group relative p-8 rounded-3xl bg-gradient-to-br from-indigo-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md flex flex-col items-center hover:scale-105 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-indigo-200">Audytorzy</h3>
            <p className="text-sm text-slate-400 mb-4 text-center">Precyzyjne obliczenia mocy i strat cyrkulacji z wariantami modernizacji</p>
            <span className="text-indigo-400 font-bold">Sprawdź <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>
          <Link href="/wykonawcy" className="group relative p-8 rounded-3xl bg-gradient-to-br from-purple-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md flex flex-col items-center hover:scale-105 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-pink-200">Wykonawcy</h3>
            <p className="text-sm text-slate-400 mb-4 text-center">Błyskawiczne wyceny i profesjonalne oferty dla Twoich klientów</p>
            <span className="text-pink-400 font-bold">Sprawdź <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>
          <Link href="/inwestorzy" className="group relative p-8 rounded-3xl bg-gradient-to-br from-pink-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md flex flex-col items-center hover:scale-105 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Building className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-rose-200">Inwestorzy</h3>
            <p className="text-sm text-slate-400 mb-4 text-center">Zarządzaj wieloma budynkami i monitoruj koszty w czasie rzeczywistym</p>
            <span className="text-rose-400 font-bold">Sprawdź <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>
        </div>
        {/* CTA Section - nowy tekst reklamowy */}
        <div className="max-w-3xl mx-auto py-12 px-4 rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 shadow-2xl backdrop-blur-md text-slate-100 space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl text-center mb-4">
            Oblicz, ile naprawdę możesz zaoszczędzić na ciepłej wodzie. Szybko. Precyzyjnie. Bez zgadywania.
          </h2>
          <p className="text-lg text-slate-300 text-center mb-6">
            Witaj w narzędziu, które wreszcie robi to, czego wszyscy potrzebowaliśmy: pokazuje prawdziwe straty ciepła na instalacji CWU – i zamienia je na konkretne złotówki.<br />
            Dla mieszkańców to odpowiedź na pytanie: „Dlaczego płacę tak dużo?”<br />
            Dla zarządców, wspólnot, spółdzielni i gmin – gotowy plan na realne oszczędności i modernizacje, które mają sens.<br />
            A dla audytorów i inżynierów? Czysta ulga. Wreszcie można odetchnąć – nasz program policzy to szybciej, dokładniej i bezwzględnie cierpliwie.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-gradient-to-br from-blue-800/60 via-blue-900/80 to-slate-900/80 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-blue-200 mb-2">Dla mieszkańców</h3>
              <p className="text-sm text-slate-300">Twoje rachunki za ciepłą wodę nie muszą być zagadką.<br />Narzędzie w prosty sposób pokaże, gdzie uciekają pieniądze, ile realnie kosztują straty cyrkulacji i ile możesz zyskać po modernizacji. Jasno, klarownie, bez technicznego bełkotu.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-cyan-800/60 via-blue-900/80 to-slate-900/80 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-cyan-200 mb-2">Dla spółdzielni, wspólnot, miast i gmin</h3>
              <p className="text-sm text-slate-300">Masz pod opieką budynki?<br />Program wskaże, które instalacje generują największe straty, jakie są koszty ich utrzymania i ile da się zaoszczędzić po wdrożeniu działań poprawiających efektywność.<br />To szybka diagnoza i gotowy argument do decyzji finansowych — bez ryzyka i bez długich analiz.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-800/60 via-blue-900/80 to-slate-900/80 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-purple-200 mb-2">Dla audytorów i inżynierów</h3>
              <p className="text-sm text-slate-300">Dość liczenia godzinami.<br />Nasz algorytm wykonuje za Ciebie wszystkie obliczenia strat, mocy, efektywności i kosztów — automatycznie, w kilka sekund.<br />Ty skupiasz się na wnioskach i strategii.<br />On robi żmudną robotę.<br />Prosto, powtarzalnie, zawsze zgodnie z parametrami, które ustawisz.</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold text-cyan-300 mb-2">Wiedza inżynierska zamknięta w jednym narzędziu</h3>
            <p className="text-sm text-slate-300 mb-4">A to dopiero początek. Tworzymy również dedykowane programy inżynierskie, dostosowane do potrzeb:<br />– instalacji HVAC,<br />– zarządców nieruchomości,<br />– branży energetycznej,<br />– firm serwisowych i wykonawców.<br /><br />Masz pomysł na rozwiązanie, które usprawni Twoją pracę?<br />Zaprojektujemy je i zautomatyzujemy.</p>
            <div className="font-bold text-lg text-blue-200 mt-4">
              <span className="block mb-2">Oszczędności zaczynają się od wiedzy.</span>
              <span className="block mb-2">A wiedza zaczyna się tutaj.</span>
            </div>
            <p className="text-md text-slate-200 mt-4">Poznaj swoją instalację, zobacz realne koszty i zyskaj narzędzie, które pracuje dla Ciebie — niezależnie od tego, czy jesteś mieszkańcem, zarządcą, audytorem czy inżynierem.<br /><br />Twój czas jest cenny. Twoje pieniądze też.<br />Nasz program dba o jedno i drugie.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
