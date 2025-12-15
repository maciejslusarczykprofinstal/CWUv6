import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-static";

export default function JakWyceniamyAudytCwuPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Jak wyceniamy audyt CWU</h1>
        <p className="text-slate-700 dark:text-slate-300">
          Od czego zależy koszt audytu CWU i dlaczego nie jest to „stała usługa” – technicznie, spokojnie, bez sprzedaży.
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dlaczego audyt CWU nie ma jednej ceny</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>Różna skala strat: audyt ma inną wagę decyzyjną przy małych i przy dużych stratach.</li>
            <li>Różna złożoność instalacji: układ, liczba obiegów i warunki pracy wpływają na nakład analizy.</li>
            <li>Różny zakres decyzji po audycie: od regulacji po wariantowanie i przygotowanie działań wdrożeniowych.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Co realnie wpływa na koszt audytu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Liczba pionów / węzłów:</span> więcej
              elementów do weryfikacji przepływów i równoważenia.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Sposób przygotowania CWU:</span> różne
              źródła ciepła i logika sterowania zmieniają sposób oceny pracy układu.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Problemy z cyrkulacją:</span> niestabilne
              temperatury, nadmierne przepływy, brak regulacji lub przeciążenie obiegów.
            </li>
            <li>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Konieczność wariantowania rozwiązań:</span>
              gdy trzeba porównać kilka ścieżek technicznych i ich konsekwencje ekonomiczne.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Dlaczego zaczynamy od analizy ekonomicznej</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Koszt audytu zawsze odnosimy do skali strat: chodzi o porównanie nakładu analizy do realnego problemu w budynku.
            </li>
            <li>
              Pierwsza decyzja jest binarna: czy audyt ma sens finansowo. Dopiero potem wybiera się zakres i poziom szczegółowości.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Jak myśleć o koszcie audytu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>Jako procent potencjalnych strat – koszt ma być współmierny do problemu, nie „z sufitu”.</li>
            <li>Jako narzędzie decyzyjne: audyt porządkuje warianty i ryzyka, a nie jest „wydatkiem samym w sobie”.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Kiedy audyt CWU ma sens, a kiedy nie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <div className="space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Ma sens, gdy:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>w budynku występuje istotny koszt CWU i brak jest jasnej przyczyny w samych rachunkach</li>
              <li>instalacja ma objawy rozregulowania (temperatury, cyrkulacja, nierównomierność)</li>
              <li>zarządca potrzebuje techniczno-ekonomicznej podstawy do decyzji (regulacja / modernizacja / projekt)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Może nie mieć sensu, gdy:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>problem jest marginalny i nie ma przesłanek technicznych do szukania strat systemowych</li>
              <li>nie ma danych operacyjnych do weryfikacji (a nie ma możliwości ich uzupełnienia)</li>
              <li>decyzja jest z góry przesądzona niezależnie od wyniku analizy</li>
            </ul>
          </div>

          <div className="pt-2 text-sm">
            <Link href="/mieszkancy" className="underline underline-offset-4 text-slate-900 dark:text-slate-100">
              Sprawdź, czy audyt ma sens w Twoim budynku
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
