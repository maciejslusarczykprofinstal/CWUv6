import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-static";

export default function ProduktPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">CWU Decision Pack</h1>
        <p className="text-slate-700 dark:text-slate-300">
          Strona opisuje produkt jako narzędzie analityczne: porządkuje dane i przygotowuje pakiet decyzyjny, bez
          przejmowania odpowiedzialności za realizację.
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Czym jest CWU Decision Pack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <p>
            CWU Decision Pack to narzędzie do standaryzacji kwalifikacji problemów CWU w budynkach: zbiera i porządkuje
            informacje tak, aby rozmowa techniczna i decyzja organizacyjna opierały się na danych, a nie na intuicji.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>To nie jest audyt wykonawczy.</li>
            <li>To nie jest projekt techniczny ani dokumentacja wykonawcza.</li>
            <li>To jest pakiet decyzyjny: opis problemu, skala strat, warianty i status sprawy.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Co dokładnie daje narzędzie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>uporządkowanie strat CWU w kategoriach: skala kosztowa (PLN) oraz skala procentowa (%)</li>
            <li>warianty działań technicznych, które można porównywać i omawiać</li>
            <li>status decyzyjny sprawy (czy można przechodzić dalej, czy potrzebna jest decyzja organizacyjna)</li>
            <li>gotowy materiał do rozmowy technicznej (argumenty, podsumowanie i kolejność kroków)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Czego narzędzie NIE robi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>nie podejmuje decyzji inwestycyjnych ani nie zastępuje odpowiedzialności zarządu</li>
            <li>nie zastępuje audytora i nie udaje automatycznej oceny technicznej obiektu</li>
            <li>nie zna ograniczeń konkretnego obiektu (dostęp, stan instalacji, uwarunkowania formalne i wykonawcze)</li>
            <li>nie generuje zobowiązań: nie jest zamówieniem, umową ani wyceną realizacji</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Gdzie kończy się rola aplikacji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <p>
            Aplikacja kończy swoją rolę na etapie kwalifikacji i uporządkowania decyzji. Dalej proces przechodzi do rozmowy
            techniczno-organizacyjnej poza aplikacją.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              „WYMAGA DECYZJI ZARZĄDCY” – dane i uzasadnienie są przygotowane, a potrzebna jest decyzja organizacyjna.
            </li>
            <li>„GOTOWA DO REALIZACJI” – warunki kwalifikacyjne są spełnione, możliwe jest przejście do działań operacyjnych.</li>
          </ul>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Dalsze działania (ustalenie zakresu, terminów, odpowiedzialności, warunków dostępu) są realizowane wyłącznie poza
            aplikacją.
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dla kogo to rozwiązanie ma sens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">audytor</span> – zyskuje spójny standard
              prowadzenia sprawy i materiał roboczy do rozmowy.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">zarząd / spółdzielnia</span> – dostaje
              podstawę do decyzji i jasną granicę odpowiedzialności narzędzia.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">mieszkaniec (inicjator)</span> – może
              ustrukturyzować problem tak, aby dało się go przekazać do formalnej ścieżki decyzyjnej.
            </li>
          </ul>

          <div className="text-sm">
            <Link href="/mieszkancy" className="underline underline-offset-4 text-slate-900 dark:text-slate-100">
              Przejdź do analizy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
