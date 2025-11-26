export const dynamic = "force-dynamic";
// Client Component dla przycisku Link

import { ClientButtonLink } from "@/components/ClientButtonLink";
// "use client";
import Link from "next/link";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AnalizaFinansowaAudytoraPage() {
  // TODO: Pobierz wyniki z panelu Liczniki i Moc Zamówiona (np. przez context, API, query params lub localStorage)
  // Przykład: const wynikiLiczniki = ...; const wynikiMoc = ...;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-800 to-blue-950 px-4 py-12 flex flex-col items-center">
         <Card className="mx-auto max-w-7xl w-full bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-700 shadow-lg mb-12">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-yellow-300">Analiza Finansowa Audytora</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg text-yellow-100 mb-6">
            <span className="block text-2xl font-bold text-yellow-300 mb-2">⭐ Analiza Finansowa Audytora — Twoje centrum dowodzenia modernizacją CWU</span>
            <span className="block mb-4">Nasze narzędzie to zaawansowana platforma analityczna, która łączy wiedzę inżynierską, modele normowe i inteligencję AI, aby pomóc audytorom, projektantom, wspólnotom i spółdzielniom podejmować najlepsze decyzje techniczno-finansowe dotyczące systemów ciepłej wody użytkowej.</span>
            <span className="block mb-4">To nie jest zwykły kalkulator.<br />To pełnoprawny symulator inwestycyjny, który liczy, porównuje i przewiduje.</span>
            <span className="block text-yellow-200 font-bold mb-2">🔍 Co analizuje nasz system?</span>
            <ol className="list-decimal pl-6 mb-4 text-base text-yellow-200">
              <li className="mb-2"><b>Rzeczywiste koszty produkcji CWU</b><br />Program automatycznie przelicza:<br />
                <ul className="list-disc pl-6">
                  <li>koszt podgrzania 1 m³ CWU,</li>
                  <li>koszt energii w GJ i kWh,</li>
                  <li>roczne koszty płacone przez mieszkańców,</li>
                  <li>rzeczywiste straty instalacji (cyrkulacja, przesył, regulacja, postojowe),</li>
                  <li>różnicę między kosztami faktycznymi a tymi wynikającymi z taryf.</li>
                </ul>
                Dzięki temu możesz natychmiast wskazać:<br />
                <ul className="list-disc pl-6">
                  <li>miejsca marnotrawstwa,</li>
                  <li>nieuzasadnione koszty,</li>
                  <li>obszary największych oszczędności.</li>
                </ul>
              </li>
              <li className="mb-2"><b>Pełne modelowanie modernizacji instalacji CWU</b><br />Program symuluje:<br />
                <ul className="list-disc pl-6">
                  <li>nowe współczynniki strat po modernizacji,</li>
                  <li>zużycie energii po poprawie izolacji i regulacji,</li>
                  <li>moc zamówioną po modernizacji,</li>
                  <li>prognozowane obniżenie rachunków.</li>
                </ul>
                <span className="block mt-2">To nie są szacunki "na oko".<br />To obliczenia zgodne z PN-EN 15316 — dokładność metody profesjonalnej.</span>
              </li>
              <li className="mb-2"><b>Koszty inwestycji modernizacyjnych</b><br />Moduł finansowy oblicza:<br />
                <ul className="list-disc pl-6">
                  <li>koszt wymiany izolacji,</li>
                  <li>koszt modernizacji cyrkulacji,</li>
                  <li>koszt automatyki i równoważenia,</li>
                  <li>koszt przebudowy węzła CWU,</li>
                  <li>koszt wymiany przewodów, zasobników lub pomp.</li>
                </ul>
                <span className="block mt-2">Dodatkowo generuje:<br />
                  <ul className="list-disc pl-6">
                    <li>zestawienia kosztowe,</li>
                    <li>warianty inwestycyjne,</li>
                    <li>porównanie scenariuszy „minimum”, „optymalny” i „maksymalny”.</li>
                  </ul>
                </span>
              </li>
              <li className="mb-2"><b>Czas zwrotu inwestycji</b><br />Program oblicza:<br />
                <ul className="list-disc pl-6">
                  <li>roczne oszczędności po modernizacji,</li>
                  <li>zysk energetyczny,</li>
                  <li>różnicę zużycia GJ przed i po,</li>
                  <li>oszczędności finansowe w skali roku,</li>
                  <li>wskaźnik Payback Period (PP),</li>
                  <li>oraz opcjonalnie ROI i NPV.</li>
                </ul>
                <span className="block mt-2">Możesz jednym kliknięciem powiedzieć:<br />„Ta inwestycja zwróci się w 2,7 roku i obniży rachunki o 35%.”</span>
              </li>
              <li className="mb-2"><b>Prognozy na kolejne lata</b><br />Program generuje:<br />
                <ul className="list-disc pl-6">
                  <li>prognozy kosztów energii przy zmianie cen GJ,</li>
                  <li>modele wzrostu taryf,</li>
                  <li>przewidywane koszty eksploatacji po 5 i 10 latach,</li>
                  <li>wykresy trendów i scenariuszy.</li>
                </ul>
                <span className="block mt-2">Dzięki temu audytor może przedstawić klientowi nie tylko stan dziś, ale także realne korzyści w przyszłości.</span>
              </li>
              <li className="mb-2"><b>Zaawansowane porównania</b><br />Moduł umożliwia:<br />
                <ul className="list-disc pl-6">
                  <li>testowanie wielu wariantów modernizacji,</li>
                  <li>porównanie instalacji obecnej i zmodernizowanej,</li>
                  <li>analizę „co jeśli?” dla różnych parametrów,</li>
                  <li>wizualizację wyników w formie wykresów i tabel.</li>
                </ul>
                <span className="block mt-2">Wszystko automatycznie — bez Excela.</span>
              </li>
              <li className="mb-2"><b>Wsparcie sztucznej inteligencji</b><br />Asystent AI:<br />
                <ul className="list-disc pl-6">
                  <li>podpowiada optymalne strategie modernizacji,</li>
                  <li>interpretuje wyniki obliczeń,</li>
                  <li>generuje profesjonalne wnioski techniczne,</li>
                  <li>tworzy raporty gotowe do przedstawienia zarządowi lub inwestorowi.</li>
                </ul>
                <span className="block mt-2">Jest to połączenie inżyniera, kosztorysanta i analityka finansowego — dostępne 24/7.</span>
              </li>
            </ol>
            <span className="block text-yellow-200 font-bold mb-2">🚀 Dlaczego to działa tak dobrze?</span>
            <span className="block mb-4">Bo program jednocześnie:<br />
              <ul className="list-disc pl-6">
                <li>korzysta z norm branżowych (PN-EN 15316),</li>
                <li>stosuje modele inżynierskie,</li>
                <li>integruje dane finansowe,</li>
                <li>analizuje realne zużycia,</li>
                <li>przelicza koszty per mieszkanie,</li>
                <li>przewiduje przyszłe scenariusze,</li>
                <li>oraz automatycznie generuje wnioski, których nie daje żadna inna aplikacja.</li>
              </ul>
            </span>
            <span className="block mb-4">To kompletne narzędzie do podejmowania decyzji w inwestycjach CWU.</span>
            <span className="block text-yellow-200 font-bold mb-2">💼 Adresaci tej funkcji</span>
            <ul className="list-disc pl-6 mb-4 text-base text-yellow-200">
              <li>Audytorzy energetyczni</li>
              <li>Zarządy spółdzielni i wspólnot</li>
              <li>Administratorzy budynków</li>
              <li>Projektanci instalacji</li>
              <li>Firmy audytorskie i eksploatacyjne</li>
              <li>Eksperci branżowi HVAC</li>
              <li>Każdy z nich otrzymuje czytelny, twardy dowód opłacalności modernizacji.</li>
            </ul>
            <span className="block text-yellow-200 font-bold mb-2">🔥 Podsumowanie</span>
            <span className="block mb-2">Analiza Finansowa Audytora to najbardziej kompletne narzędzie do:</span>
            <ul className="list-disc pl-6 mb-2 text-base text-yellow-200">
              <li>💰 liczenia kosztów</li>
              <li>⚙️ modelowania modernizacji</li>
              <li>📉 redukcji strat</li>
              <li>📊 symulacji mocy</li>
              <li>📈 prognozowania oszczędności</li>
              <li>⏳ obliczania czasu zwrotu</li>
              <li>📑 generowania raportów</li>
            </ul>
            <span className="block">— wszystko w jednym miejscu.</span>
          </div>
            <Button asChild variant="outline" className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white border-blue-500 font-semibold shadow px-6 py-3 text-lg">
              <Link href="/audytorzy">← Powrót do wyboru narzędzia</Link>
            </Button>
            <ClientButtonLink href="/audytorzy/wyniki-zbiorcze">
              Wyniki zbiorcze Audytora
            </ClientButtonLink>
        </CardContent>
      </Card>
      {/* ...możliwe dalsze sekcje strony... */}
    </div>
  );
}
