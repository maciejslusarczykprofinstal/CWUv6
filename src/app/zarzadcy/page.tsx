import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-static";

export default function ZarzadcyPage() {
  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800 dark:text-slate-200">
            Straty CWU w budynkach wielorodzinnych – niewidzialny koszt
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700 dark:text-slate-300">
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Gdzie powstają straty:</span> głównie na
              cyrkulacji, nadmiernym przepływie, nieoptymalnych nastawach oraz słabej izolacji i rozregulowaniu instalacji.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Dlaczego są trudne do wykrycia:</span>
              objawem bywa „normalnie działająca” CWU, ale energia jest tracona w tle – bez awarii i bez jednoznacznego sygnału.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Dlaczego rachunki nie pokazują problemu wprost:</span>
              koszty energii i straty mieszają się w rozliczeniu CWU, a różnice między lokalami i sezonowość utrudniają ocenę.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Jak to wykrywamy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <p>
            Audyt CWU to analiza techniczno-ekonomiczna: porządkuje dane, wskazuje gdzie instalacja generuje koszty i jakim
            kosztem można je ograniczyć.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>bez powoływania się na normy jako argument „z urzędu”</li>
            <li>bez straszenia – wnioski wynikają z liczb i logiki układu instalacji</li>
            <li>zero obietnic: audyt ma dostarczyć podstawę do decyzji, nie „gwarancję oszczędności”</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Co daje audyt</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300 text-sm">
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
            <div className="font-semibold text-slate-900 dark:text-slate-100">A) Regulacja / optymalizacja</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>regulacja i korekta nastaw</li>
              <li>porządkowanie pracy instalacji</li>
              <li>działania szybkie, o niskim koszcie</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
            <div className="font-semibold text-slate-900 dark:text-slate-100">B) Modernizacja</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>wymiana elementów instalacji</li>
              <li>przebudowa układu i usprawnienia hydrauliczne</li>
              <li>poprawa izolacji i ograniczanie strat na cyrkulacji</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
            <div className="font-semibold text-slate-900 dark:text-slate-100">C) Projekt + nadzór</div>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>dokumentacja techniczna i wariantowanie rozwiązań</li>
              <li>przygotowanie kryteriów odbioru</li>
              <li>nadzór inwestorski nad wdrożeniem</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Kiedy to ma sens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li>wysoki koszt CWU</li>
            <li>duża liczba lokali</li>
            <li>brak wiedzy, gdzie uciekają pieniądze</li>
          </ul>

          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
            Audyt nie jest obowiązkiem. Jest narzędziem decyzyjnym.
          </div>

          <p className="text-sm">
            Jeśli chcesz sprawdzić problem od strony pojedynczego lokalu – zobacz analizę mieszkańca. {" "}
            <Link href="/mieszkancy" className="underline underline-offset-4 text-slate-900 dark:text-slate-100">
              /mieszkancy
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
