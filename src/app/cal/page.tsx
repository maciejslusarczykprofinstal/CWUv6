import React from "react";
import { Card } from "@/components/ui";

export default function CalPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-100 via-cyan-100 to-indigo-100 dark:from-blue-950 dark:via-indigo-950 dark:to-slate-900 border-2 border-blue-200/80 dark:border-blue-800/60 p-10 md:p-16 shadow-xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
          PROF INSTAL — nasz cel
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-slate-800 dark:text-slate-200 max-w-4xl font-medium">
          Ciepła woda w blokach nie powinna być loterią. To inżynieria, którą da się policzyć i naprawić. Łączymy rzetelne obliczenia, czytelne raporty i wspólny język: dla mieszkańców, zarządców oraz samorządów. Cel: mniej strat, niższe rachunki, czystsze powietrze — bez zgadywania.
        </p>
      </section>

      {/* 4 filary odbiorców */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Komu pomagamy</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-slate-900 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Dla Mieszkańców</h3>
            <ul className="space-y-3 text-slate-800 dark:text-slate-200 list-disc pl-5">
              <li>Pokazujemy skąd biorą się koszty CWU i co je podbija.</li>
              <li>Konkrety: co zmienić, by płacić mniej — z uzasadnieniem.</li>
              <li>Jasne pisma/raporty PDF do spółdzielni.</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-slate-900 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">Dla Zarządców</h3>
            <ul className="space-y-3 text-slate-800 dark:text-slate-200 list-disc pl-5">
              <li>Obliczenia: moc zamówiona, straty cyrkulacji, bufory, warianty „co-jeśli".</li>
              <li>Raporty do zarządu/lustracji z podstawą normową.</li>
              <li>Priorytety modernizacji wg efektu (zł/kW, zł/m³).</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/50 dark:to-slate-900 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-cyan-900 dark:text-cyan-100 mb-4">Dla Miast i Gmin</h3>
            <ul className="space-y-3 text-slate-800 dark:text-slate-200 list-disc pl-5">
              <li>Ujednolicone sprawozdania z budynków — jeden format.</li>
              <li>Mapa hot-spotów strat i potencjału redukcji.</li>
              <li>Załączniki do programów modernizacji i wniosków o finansowanie.</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-slate-900 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4">Dla Ekologii</h3>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
              Najczystsza energia to ta, której nie zmarnowaliśmy. Redukujemy straty i niepotrzebnie zamawianą moc — mniej spalania, mniej emisji. Komfort bez przegrzewania instalacji.
            </p>
          </div>
        </div>
      </section>

      {/* Ile wszyscy tracimy */}
      <section className="rounded-3xl border-2 border-red-200 dark:border-red-800 p-8 md:p-12 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-slate-900 shadow-xl">
        <h2 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-4">Ile wszyscy tracimy?</h2>
        <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
          Straty są rozproszone: tu zawór, tam cyrkulacja, gdzie indziej „na wszelki wypadek" wyższa moc. Dla jednego bloku to „trochę", ale po zsumowaniu osiedli i miast wychodzi duża, publiczna faktura — płacą mieszkańcy, wspólnoty, samorządy i państwo. Pokazujemy gdzie i ile się marnuje oraz co przyniesie największy efekt.
        </p>
      </section>

      {/* Co łączymy */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Co łączymy</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Inżynierię (normy, wzory, dane)",
            "Język ludzi (prosto o kosztach i korzyściach)",
            "Wspólne raportowanie (budynek → osiedle → gmina)",
            "Proces: parametry → obliczenia → warianty → decyzja → wdrożenie → sprawdzenie efektu",
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 p-7 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg">
              <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jak to działa (3 kroki) */}
      <section className="rounded-3xl border-2 border-purple-200 dark:border-purple-800 p-8 md:p-12 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950/50 dark:via-fuchsia-950/50 dark:to-slate-900 shadow-xl">
        <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-6">Jak to działa (3 kroki)</h2>
        <ol className="space-y-4 list-decimal pl-8 text-lg text-slate-800 dark:text-slate-200 font-medium">
          <li>Zbieramy parametry budynku/instalacji + zużycia.</li>
          <li>Liczymy: moce, straty, bufory, warianty „co-jeśli".</li>
          <li>Wnioski i raporty (mieszkańcy, zarządcy, gminy) + gotowe pisma DOCX.</li>
        </ol>
      </section>

      {/* Nasze zasady */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Nasze zasady</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            "Zero czarnej skrzynki — każde założenie jest jawne i edytowalne.",
            "Ścieżka audytu — da się odtworzyć cały tok obliczeń.",
            "Decyzje > PDF — wskazujemy priorytety i spodziewany efekt, nie tylko tabelki.",
            "Dane należą do Was — eksport, kopia, usunięcie na życzenie.",
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border-2 border-slate-300 dark:border-slate-700 p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-lg">
              <p className="text-slate-900 dark:text-slate-100 font-medium text-lg leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wezwanie do współpracy */}
      <section className="rounded-3xl border-2 border-indigo-200 dark:border-indigo-800 p-8 md:p-12 bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 dark:from-indigo-950 dark:via-blue-950 dark:to-slate-900 shadow-xl">
        <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-6">Wezwanie do współpracy</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border-2 border-white/50 dark:border-slate-700 p-7 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Mieszkańcy</h3>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">Sprawdźcie, za co płacicie — i co można poprawić.</p>
          </div>
          <div className="rounded-2xl border-2 border-white/50 dark:border-slate-700 p-7 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Zarządcy</h3>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">Zamieńcie dyskusje na decyzje — na liczbach.</p>
          </div>
          <div className="rounded-2xl border-2 border-white/50 dark:border-slate-700 p-7 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Miasta i Gminy</h3>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">Zobaczcie potencjał oszczędności w skali i planujcie modernizacje tam, gdzie najbardziej się zwrócą.</p>
          </div>
        </div>
      </section>

      {/* Zakończenie */}
      <section className="text-center rounded-3xl p-10 md:p-16 border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 shadow-2xl">
        <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">
          PROF INSTAL — łączymy ludzi, budynki i dane, żeby woda była ciepła, a liczby chłodne.
        </p>
        <p className="text-xl text-slate-800 dark:text-slate-200 font-medium">
          Mniej strat, niższe rachunki, czystsze powietrze. Dla mieszkańców, zarządców i gmin — jednym wspólnym językiem.
        </p>
      </section>
    </div>
  );
}
