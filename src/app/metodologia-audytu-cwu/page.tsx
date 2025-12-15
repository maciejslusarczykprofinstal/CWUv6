import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-static";

export default function MetodologiaAudytuCwuPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Metodologia audytu CWU</h1>
        <p className="text-slate-700 dark:text-slate-300">
          Jak działa audyt techniczno-ekonomiczny CWU: co sprawdzamy, dlaczego w tej kolejności i czego z tego wynika.
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dlaczego audyt CWU jest potrzebny</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Straty CWU często są niewidoczne w rachunkach: koszt energii „miesza się” z kosztem komfortu i eksploatacji,
              a rozliczenia nie rozdzielają przyczyn.
            </li>
            <li>
              Audyt rozróżnia <span className="font-semibold text-slate-900 dark:text-slate-100">zużycie</span> (to, co jest
              potrzebne do zapewnienia CWU) od <span className="font-semibold text-slate-900 dark:text-slate-100">straty systemowej</span>
              (to, co ucieka przez cyrkulację, nastawy, hydraulikę i izolację).
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Co dokładnie analizujemy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Źródło ciepła</span> – parametry zasilania,
              stabilność temperatury, logika pracy.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Przygotowanie CWU</span> – sposób podgrzewu,
              wymiana ciepła, magazynowanie.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Cyrkulacja</span> – przepływy, czasy,
              punktowe przegrzewanie i wychładzanie.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Regulacja</span> – nastawy pomp i zaworów,
              równoważenie, stabilność działania.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Zachowanie instalacji w czasie</span> –
              zmienność dobowo-sezonowa, reakcje na szczyty poboru i okresy postoju.
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
            <li>Decyzje techniczne bez ROI są losowe: trudno porównać warianty i ustalić priorytety.</li>
            <li>
              Audyt porządkuje skalę problemu: najpierw określa „ile to kosztuje”, dopiero potem „co i jak zmienić”, żeby
              uzyskać efekt.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Co NIE jest celem audytu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>To nie jest sprzedaż.</li>
            <li>To nie jest projekt wykonawczy.</li>
            <li>To nie jest modernizacja „na wszelki wypadek” – bez uzasadnienia technicznego i ekonomicznego.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dla kogo to ma sens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>wspólnoty</li>
            <li>spółdzielnie</li>
            <li>budynki z realnym zużyciem CWU, gdzie brak wiedzy „gdzie uciekają pieniądze”</li>
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