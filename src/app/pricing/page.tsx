import Link from "next/link";
import { Zap, Sparkles, Crown, ArrowRight } from "lucide-react";

function Feature({ children }: { children: React.ReactNode }) {
  return <li className="flex items-center gap-2 text-slate-300"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />{children}</li>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      {/* Dekoracyjne gradientowe blury w tle */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-700/20 to-blue-700/20 rounded-full text-sm font-medium text-cyan-200 mb-4">
            💎 Proste, przejrzyste ceny
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Wybierz plan idealny<br />dla Twojego biznesu
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Bez ukrytych opłat. Bez zobowiązań. Anuluj w każdej chwili.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 space-y-6 hover:scale-105 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <Zap className="w-5 h-5" />
                <h3 className="text-xl font-bold">Starter</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-100">0 zł</span>
                <span className="text-slate-400">/miesiąc</span>
              </div>
              <p className="text-slate-400">Idealny na start</p>
            </div>

            <ul className="space-y-3">
              <Feature>10 obliczeń dziennie</Feature>
              <Feature>Podstawowe raporty PDF</Feature>
              <Feature>Kalkulator dla mieszkańców</Feature>
              <Feature>Wsparcie email</Feature>
            </ul>

            <Link
              href="/mieszkancy"
              className="block w-full text-center px-6 py-3 rounded-xl border-2 border-cyan-700/30 hover:border-cyan-400 font-semibold transition-all hover:scale-105 text-cyan-200"
            >
              Rozpocznij za darmo
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-950/90 border-2 border-cyan-500 p-8 space-y-6 relative shadow-2xl scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-bold rounded-full">
              ⭐ Najpopularniejszy
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-xl font-bold">Professional</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-100">199 zł</span>
                <span className="text-slate-400">/miesiąc</span>
              </div>
              <p className="text-slate-400">Dla profesjonalistów</p>
            </div>

            <ul className="space-y-3">
              <Feature>Nielimitowane obliczenia</Feature>
              <Feature>Wszystkie kalkulatory</Feature>
              <Feature>Zaawansowane raporty PDF/Excel</Feature>
              <Feature>Branding firmy w raportach</Feature>
              <Feature>Analiza strat cyrkulacji</Feature>
              <Feature>Warianty modernizacji</Feature>
              <Feature>Wsparcie priorytetowe 24/7</Feature>
              <Feature>API access</Feature>
            </ul>

            <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
              Wybierz Pro
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 space-y-6 hover:scale-105 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-300">
                <Crown className="w-5 h-5" />
                <h3 className="text-xl font-bold">Enterprise</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-100">Indywidualnie</span>
              </div>
              <p className="text-slate-400">Dla dużych organizacji</p>
            </div>

            <ul className="space-y-3">
              <Feature>Wszystko z Pro +</Feature>
              <Feature>Dedykowany account manager</Feature>
              <Feature>Własna instancja</Feature>
              <Feature>SLA 99.9%</Feature>
              <Feature>Integracje na zamówienie</Feature>
              <Feature>Szkolenia zespołu</Feature>
              <Feature>White-label rozwiązanie</Feature>
              <Feature>Wsparcie on-site</Feature>
            </ul>

            <button className="w-full px-6 py-3 rounded-xl border-2 border-cyan-700/30 hover:border-cyan-400 font-semibold transition-all hover:scale-105 text-cyan-200">
              Skontaktuj się
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold text-center text-cyan-200">Często zadawane pytania</h2>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-cyan-900/30 bg-slate-900/60">
              <h3 className="font-bold text-lg mb-2 text-cyan-200">Czy mogę anulować w każdej chwili?</h3>
              <p className="text-slate-300">Tak! Możesz anulować subskrypcję w dowolnym momencie bez żadnych kar. Nie ma okresu wypowiedzenia.</p>
            </div>
            <div className="p-6 rounded-2xl border border-cyan-900/30 bg-slate-900/60">
              <h3 className="font-bold text-lg mb-2 text-cyan-200">Czy mogę zmienić plan później?</h3>
              <p className="text-slate-300">Oczywiście! Możesz przejść na wyższy lub niższy plan w każdej chwili. Różnica zostanie proporcjonalnie rozliczona.</p>
            </div>
            <div className="p-6 rounded-2xl border border-cyan-900/30 bg-slate-900/60">
              <h3 className="font-bold text-lg mb-2 text-cyan-200">Jakie metody płatności akceptujecie?</h3>
              <p className="text-slate-300">Akceptujemy karty kredytowe/debetowe, przelewy bankowe oraz faktury dla firm. Wszystkie płatności są bezpieczne i szyfrowane.</p>
            </div>
            <div className="p-6 rounded-2xl border border-cyan-900/30 bg-slate-900/60">
              <h3 className="font-bold text-lg mb-2 text-cyan-200">Czy dane są bezpieczne?</h3>
              <p className="text-slate-300">Tak! Wszystkie dane są szyfrowane SSL/TLS, przechowywane w europejskich data center i zgodne z RODO. Bezpieczeństwo jest naszym priorytetem.</p>
            </div>
            <div className="p-6 rounded-2xl border border-cyan-900/30 bg-slate-900/60">
              <h3 className="font-bold text-lg mb-2 text-cyan-200">Czy oferujecie wsparcie techniczne?</h3>
              <p className="text-slate-300">Tak! Plan Starter ma wsparcie email (odpowiedź w 48h), Pro ma priorytetowe wsparcie 24/7, a Enterprise dedykowanego account managera.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 py-12 px-6 rounded-3xl bg-gradient-to-r from-cyan-900/40 to-blue-900/30">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-200">
            Gotowy żeby zacząć oszczędzać?
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Dołącz do setek zadowolonych profesjonalistów już dziś
          </p>
          <Link
            href="/mieszkancy"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Wypróbuj za darmo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
