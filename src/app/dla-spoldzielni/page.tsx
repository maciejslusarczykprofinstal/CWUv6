import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-static";

export default function DlaSpoldzielniPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Dla spółdzielni / zarządu</h1>
        <p className="text-slate-700 dark:text-slate-300">
          Strona porządkuje odpowiedzialności: czym jest audyt CWU jako narzędzie decyzyjne, a czym nie jest, i gdzie kończy
          się rola aplikacji.
        </p>
      </div>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Z czym realnie mierzy się spółdzielnia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Straty CWU to ryzyko kosztowe: energia i praca instalacji zużywane są bez proporcjonalnej wartości użytkowej.
            </li>
            <li>
              Straty CWU to ryzyko organizacyjne: spory o zasadność działań, trudność w porównaniu wariantów i brak wspólnego
              języka między administracją a techniką.
            </li>
            <li>
              Problem bywa „niewidoczny”: instalacja działa, komfort jest zachowany, a koszt ucieka w tle – bez jednej awarii,
              która jasno wskazuje przyczynę.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Co daje audyt CWU zarządowi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>uporządkowanie decyzji (co jest faktem z danych, co jest hipotezą, co jest ryzykiem)</li>
            <li>warianty techniczne działań i ich konsekwencje operacyjne</li>
            <li>uzasadnienie ekonomiczne jako kryterium priorytetyzacji i wyboru ścieżki</li>
          </ul>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Audyt jest narzędziem decyzyjnym: redukuje niepewność i porządkuje rozmowę, ale nie przenosi odpowiedzialności za
            decyzję inwestycyjną.
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Czego audyt NIE zastępuje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>nie podejmuje decyzji inwestycyjnej za zarząd / spółdzielnię</li>
            <li>nie jest projektem (brak dokumentacji wykonawczej)</li>
            <li>nie jest wykonawstwem (brak robót, harmonogramu, wyceny realizacji)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Moment decyzji zarządu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <p>
            W aplikacji pojawiają się statusy operacyjne, które sygnalizują, że analiza jest domknięta na poziomie
            kwalifikacji, a dalszy etap wymaga decyzji organizacyjnej.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              „WYMAGA DECYZJI ZARZĄDU” – uzasadnienie jest przygotowane, ale brak potwierdzenia organizacyjnego po stronie
              zarządu.
            </li>
            <li>
              „GOTOWA DO REALIZACJI” – warunki kwalifikacyjne są spełnione i możliwe jest przejście do działań operacyjnych
              poza aplikacją.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Jak korzystać z wyników audytu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <ul className="list-disc pl-5 space-y-2">
            <li>traktuj wynik jako materiał do rozmowy techniczno-organizacyjnej, a nie „kliknięcie decyzji” w aplikacji</li>
            <li>porównuj warianty pod kątem ryzyk, ograniczeń obiektu i możliwości wdrożenia</li>
            <li>ustalenia operacyjne (zakres, terminy, dostęp, odpowiedzialność) są realizowane poza aplikacją</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl">
        <CardContent className="space-y-3 text-slate-700 dark:text-slate-300 text-sm">
          <div className="text-sm">
            <Link href="/mieszkancy" className="underline underline-offset-4 text-slate-900 dark:text-slate-100">
              Przejdź do analizy CWU
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
