import Link from "next/link";
import { Check, Zap, Sparkles, Crown, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300 mb-4">
          💎 Proste, przejrzyste ceny
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Wybierz plan idealny<br />dla Twojego biznesu
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Bez ukrytych opłat. Bez zobowiązań. Anuluj w każdej chwili.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-3xl border-2 border-foreground/10 p-8 space-y-6 hover:border-foreground/20 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Zap className="w-5 h-5" />
              <h3 className="text-xl font-bold">Starter</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">0 zł</span>
              <span className="text-muted-foreground">/miesiąc</span>
            </div>
            <p className="text-muted-foreground">Idealny na start</p>
          </div>

          <ul className="space-y-3">
            <Feature>10 obliczeń dziennie</Feature>
            <Feature>Podstawowe raporty PDF</Feature>
            <Feature>Kalkulator dla mieszkańców</Feature>
            <Feature>Wsparcie email</Feature>
          </ul>

          <Link
            href="/mieszkancy"
            className="block w-full text-center px-6 py-3 rounded-xl border-2 border-foreground/20 hover:border-foreground/40 font-semibold transition-all hover:scale-105"
          >
            Rozpocznij za darmo
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="rounded-3xl border-2 border-indigo-500 p-8 space-y-6 relative shadow-xl bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent scale-105">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-bold rounded-full">
            ⭐ Najpopularniejszy
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-xl font-bold">Professional</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">199 zł</span>
              <span className="text-muted-foreground">/miesiąc</span>
            </div>
            <p className="text-muted-foreground">Dla profesjonalistów</p>
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

          <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
            Wybierz Pro
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="rounded-3xl border-2 border-foreground/10 p-8 space-y-6 hover:border-foreground/20 transition-all">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-600">
              <Crown className="w-5 h-5" />
              <h3 className="text-xl font-bold">Enterprise</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">Indywidualnie</span>
            </div>
            <p className="text-muted-foreground">Dla dużych organizacji</p>
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

          <button className="w-full px-6 py-3 rounded-xl border-2 border-foreground/20 hover:border-foreground/40 font-semibold transition-all hover:scale-105">
            Skontaktuj się
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold text-center">Często zadawane pytania</h2>
        
        <div className="space-y-4">
          <FAQItem
            question="Czy mogę anulować w każdej chwili?"
            answer="Tak! Możesz anulować subskrypcję w dowolnym momencie bez żadnych kar. Nie ma okresu wypowiedzenia."
          />
          <FAQItem
            question="Czy mogę zmienić plan później?"
            answer="Oczywiście! Możesz przejść na wyższy lub niższy plan w każdej chwili. Różnica zostanie proporcjonalnie rozliczona."
          />
          <FAQItem
            question="Jakie metody płatności akceptujecie?"
            answer="Akceptujemy karty kredytowe/debetowe, przelewy bankowe oraz faktury dla firm. Wszystkie płatności są bezpieczne i szyfrowane."
          />
          <FAQItem
            question="Czy dane są bezpieczne?"
            answer="Tak! Wszystkie dane są szyfrowane SSL/TLS, przechowywane w europejskich data center i zgodne z RODO. Bezpieczeństwo jest naszym priorytetem."
          />
          <FAQItem
            question="Czy oferujecie wsparcie techniczne?"
            answer="Tak! Plan Starter ma wsparcie email (odpowiedź w 48h), Pro ma priorytetowe wsparcie 24/7, a Enterprise dedykowanego account managera."
          />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6 py-12 px-6 rounded-3xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
        <h2 className="text-3xl md:text-4xl font-bold">
          Gotowy żeby zacząć oszczędzać?
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Dołącz do setek zadowolonych profesjonalistów już dziś
        </p>
        <Link
          href="/mieszkancy"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          Wypróbuj za darmo
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="p-6 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-all">
      <h3 className="font-bold text-lg mb-2">{question}</h3>
      <p className="text-muted-foreground">{answer}</p>
    </div>
  );
}
