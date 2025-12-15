import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-static";

export default function OAudytorzePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">O audytorze</h1>
        <p className="text-slate-700 dark:text-slate-300">
          Dlaczego audyt CWU jest prowadzony przez audytora technicznego, a nie przez automat lub usługę masową.
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dlaczego audyt CWU to nie jest kalkulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Złożoność instalacji: ten sam objaw (np. wysoka strata) może wynikać z różnych przyczyn hydraulicznych i
              sterowania.
            </li>
            <li>
              Kontekst budynku: liczba pionów, sposób przygotowania CWU, nawyki poboru i warunki eksploatacji zmieniają
              interpretację danych.
            </li>
            <li>
              Znaczenie decyzji technicznych: wybór ścieżki działań wpływa na koszty, ryzyka i sposób odbioru efektów.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Rola audytora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Analiza + interpretacja: audytor łączy dane z logiką układu instalacji i sprawdza spójność wniosków.
            </li>
            <li>
              Odpowiedzialność za wnioski: rekomendacje muszą być uzasadnione technicznie i możliwe do zweryfikowania.
            </li>
            <li>
              Brak automatycznych rekomendacji: narzędzie wspiera analizę, ale nie „wydaje decyzji” bez kontekstu.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dlaczego zaczynamy od ekonomii</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>Audyt jest filtrem sensowności: najpierw określa, czy skala strat uzasadnia ingerencję.</li>
            <li>Brak modernizacji „na wiarę”: decyzje wynikają z porównania wariantów i ryzyk, nie z intuicji.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Czego to narzędzie NIE robi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>Nie zastępuje projektu wykonawczego.</li>
            <li>Nie narzuca rozwiązań bez danych i bez omówienia wariantów.</li>
            <li>Nie sprzedaje urządzeń ani usług „w pakiecie” z rekomendacją.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dla kogo to podejście ma sens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>spółdzielnie / wspólnoty, które potrzebują podstawy do decyzji technicznej</li>
            <li>budynki, gdzie audyt ma być punktem startu procesu, a nie usługą masową „jedna odpowiedź dla wszystkich”</li>
          </ul>

          <div className="text-sm">
            <Link href="/mieszkancy" className="underline underline-offset-4 text-slate-900 dark:text-slate-100">
              Sprawdź, czy audyt ma sens w Twoim budynku
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
