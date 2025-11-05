import React from "react";
import { Card } from "@/components/ui";

export default function CalPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800 p-8 md:p-12 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          PROF INSTAL — nasz cel
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300 max-w-4xl">
          Ciepła woda w blokach nie powinna być loterią. To inżynieria, którą da się policzyć i naprawić. Łączymy rzetelne obliczenia, czytelne raporty i wspólny język: dla mieszkańców, zarządców oraz samorządów. Cel: mniej strat, niższe rachunki, czystsze powietrze — bez zgadywania.
        </p>
      </section>

      {/* 4 filary odbiorców */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Komu pomagamy</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Dla Mieszkańców</h3>
            <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-5">
              <li>Pokazujemy skąd biorą się koszty CWU i co je podbija.</li>
              <li>Konkrety: co zmienić, by płacić mniej — z uzasadnieniem.</li>
              <li>Jasne pisma/raporty PDF do spółdzielni.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Dla Zarządców</h3>
            <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-5">
              <li>Obliczenia: moc zamówiona, straty cyrkulacji, bufory, warianty „co-jeśli".</li>
              <li>Raporty do zarządu/lustracji z podstawą normową.</li>
              <li>Priorytety modernizacji wg efektu (zł/kW, zł/m³).</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Dla Miast i Gmin</h3>
            <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-5">
              <li>Ujednolicone sprawozdania z budynków — jeden format.</li>
              <li>Mapa hot-spotów strat i potencjału redukcji.</li>
              <li>Załączniki do programów modernizacji i wniosków o finansowanie.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Dla Ekologii</h3>
            <p className="mt-3 text-slate-700 dark:text-slate-300">
              Najczystsza energia to ta, której nie zmarnowaliśmy. Redukujemy straty i niepotrzebnie zamawianą moc — mniej spalania, mniej emisji. Komfort bez przegrzewania instalacji.
            </p>
          </div>
        </div>
      </section>

      {/* Ile wszyscy tracimy */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ile wszyscy tracimy?</h2>
        <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">
          Straty są rozproszone: tu zawór, tam cyrkulacja, gdzie indziej „na wszelki wypadek" wyższa moc. Dla jednego bloku to „trochę", ale po zsumowaniu osiedli i miast wychodzi duża, publiczna faktura — płacą mieszkańcy, wspólnoty, samorządy i państwo. Pokazujemy gdzie i ile się marnuje oraz co przyniesie największy efekt.
        </p>
      </section>

      {/* Co łączymy */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Co łączymy</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Inżynierię (normy, wzory, dane)",
            "Język ludzi (prosto o kosztach i korzyściach)",
            "Wspólne raportowanie (budynek → osiedle → gmina)",
            "Proces: parametry → obliczenia → warianty → decyzja → wdrożenie → sprawdzenie efektu",
          ].map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
              <p className="text-slate-800 dark:text-slate-200">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jak to działa (3 kroki) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 bg-white dark:bg-slate-900 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Jak to działa (3 kroki)</h2>
        <ol className="mt-4 space-y-3 list-decimal pl-6 text-slate-700 dark:text-slate-300">
          <li>Zbieramy parametry budynku/instalacji + zużycia.</li>
          <li>Liczymy: moce, straty, bufory, warianty „co-jeśli".</li>
          <li>Wnioski i raporty (mieszkańcy, zarządcy, gminy) + gotowe pisma DOCX.</li>
        </ol>
      </section>

      {/* Nasze zasady */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Nasze zasady</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Zero czarnej skrzynki — każde założenie jest jawne i edytowalne.",
            "Ścieżka audytu — da się odtworzyć cały tok obliczeń.",
            "Decyzje > PDF — wskazujemy priorytety i spodziewany efekt, nie tylko tabelki.",
            "Dane należą do Was — eksport, kopia, usunięcie na życzenie.",
          ].map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
              <p className="text-slate-800 dark:text-slate-200">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wezwanie do współpracy */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Wezwanie do współpracy</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Mieszkańcy</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300">Sprawdźcie, za co płacicie — i co można poprawić.</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Zarządcy</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300">Zamieńcie dyskusje na decyzje — na liczbach.</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Miasta i Gminy</h3>
            <p className="mt-2 text-slate-700 dark:text-slate-300">Zobaczcie potencjał oszczędności w skali i planujcie modernizacje tam, gdzie najbardziej się zwrócą.</p>
          </div>
        </div>
      </section>

      {/* Zakończenie */}
      <section className="text-center rounded-2xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          PROF INSTAL — łączymy ludzi, budynki i dane, żeby woda była ciepła, a liczby chłodne.
        </p>
        <p className="mt-3 text-slate-700 dark:text-slate-300">
          Mniej strat, niższe rachunki, czystsze powietrze. Dla mieszkańców, zarządców i gmin — jednym wspólnym językiem.
        </p>
      </section>
    </div>
  );
}
