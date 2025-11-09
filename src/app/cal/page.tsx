import React from "react";
import { Card } from "@/components/ui";

export default function CalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden py-10 md:py-16">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-cyan-900/60 via-blue-950/80 to-slate-900/80 border border-cyan-800/40 p-8 md:p-16 shadow-2xl max-w-5xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-blue-200 to-blue-500 bg-clip-text text-transparent drop-shadow-xl">
          PROF INSTAL — nasz cel
        </h1>
        <p className="mt-6 text-xl leading-relaxed text-slate-200 max-w-4xl font-medium">
          Ciepła woda w blokach nie powinna być loterią. To inżynieria, którą da się policzyć i naprawić. Łączymy rzetelne obliczenia, czytelne raporty i wspólny język: dla mieszkańców, zarządców oraz samorządów. Cel: mniej strat, niższe rachunki, czystsze powietrze — bez zgadywania.
        </p>
      </section>

      {/* 4 filary odbiorców */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-cyan-200">Komu pomagamy</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-br from-cyan-900/40 to-blue-950/60 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-cyan-100 mb-4">Dla Mieszkańców</h3>
            <ul className="space-y-3 text-slate-200 list-disc pl-5">
              <li>Pokazujemy skąd biorą się koszty CWU i co je podbija.</li>
              <li>Konkrety: co zmienić, by płacić mniej — z uzasadnieniem.</li>
              <li>Jasne pisma/raporty PDF do spółdzielni.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-800/40 bg-gradient-to-br from-blue-900/40 to-indigo-950/60 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-blue-100 mb-4">Dla Zarządców</h3>
            <ul className="space-y-3 text-slate-200 list-disc pl-5">
              <li>Obliczenia: moc zamówiona, straty cyrkulacji, bufory, warianty „co-jeśli".</li>
              <li>Raporty do zarządu/lustracji z podstawą normową.</li>
              <li>Priorytety modernizacji wg efektu (zł/kW, zł/m³).</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-cyan-800/40 bg-gradient-to-br from-cyan-900/40 to-teal-950/60 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-cyan-100 mb-4">Dla Miast i Gmin</h3>
            <ul className="space-y-3 text-slate-200 list-disc pl-5">
              <li>Ujednolicone sprawozdania z budynków — jeden format.</li>
              <li>Mapa hot-spotów strat i potencjału redukcji.</li>
              <li>Załączniki do programów modernizacji i wniosków o finansowanie.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-green-800/40 bg-gradient-to-br from-green-900/40 to-emerald-950/60 p-8 shadow-lg">
            <h3 className="text-xl font-bold text-green-100 mb-4">Dla Ekologii</h3>
            <p className="text-slate-200 leading-relaxed">
              Najczystsza energia to ta, której nie zmarnowaliśmy. Redukujemy straty i niepotrzebnie zamawianą moc — mniej spalania, mniej emisji. Komfort bez przegrzewania instalacji.
            </p>
          </div>
        </div>
      </section>

      {/* Ile wszyscy tracimy */}
      <section className="rounded-3xl border border-red-900/40 p-8 md:p-12 bg-gradient-to-br from-red-900/40 via-orange-900/20 to-slate-900/60 shadow-xl">
        <h2 className="text-3xl font-bold text-red-200 mb-4">Ile wszyscy tracimy?</h2>
        <p className="text-lg text-slate-200 leading-relaxed">
          Straty są rozproszone: tu zawór, tam cyrkulacja, gdzie indziej „na wszelki wypadek" wyższa moc. Dla jednego bloku to „trochę", ale po zsumowaniu osiedli i miast wychodzi duża, publiczna faktura — płacą mieszkańcy, wspólnoty, samorządy i państwo. Pokazujemy gdzie i ile się marnuje oraz co przyniesie największy efekt.
        </p>
      </section>

      {/* Co łączymy */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-cyan-200">Co łączymy</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Inżynierię (normy, wzory, dane)",
            "Język ludzi (prosto o kosztach i korzyściach)",
            "Wspólne raportowanie (budynek → osiedle → gmina)",
            "Proces: parametry → obliczenia → warianty → decyzja → wdrożenie → sprawdzenie efektu",
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/60 to-slate-800/80 p-7 shadow-lg">
              <p className="text-slate-100 font-medium leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Jak to działa (3 kroki) */}
      <section className="rounded-3xl border border-purple-900/40 p-8 md:p-12 bg-gradient-to-br from-purple-900/40 via-fuchsia-900/20 to-slate-900/60 shadow-xl">
        <h2 className="text-3xl font-bold text-purple-200 mb-6">Jak to działa (3 kroki)</h2>
        <ol className="space-y-4 list-decimal pl-8 text-lg text-slate-200 font-medium">
          <li>Zbieramy parametry budynku/instalacji + zużycia.</li>
          <li>Liczymy: moce, straty, bufory, warianty „co-jeśli".</li>
          <li>Wnioski i raporty (mieszkańcy, zarządcy, gminy) + gotowe pisma DOCX.</li>
        </ol>
      </section>

      {/* Nasze zasady */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-cyan-200">Nasze zasady</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            "Zero czarnej skrzynki — każde założenie jest jawne i edytowalne.",
            "Ścieżka audytu — da się odtworzyć cały tok obliczeń.",
            "Decyzje > PDF — wskazujemy priorytety i spodziewany efekt, nie tylko tabelki.",
            "Dane należą do Was — eksport, kopia, usunięcie na życzenie.",
          ].map((t, i) => (
            <div key={i} className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/60 to-slate-800/80 p-8 shadow-lg">
              <p className="text-slate-100 font-medium text-lg leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wezwanie do współpracy */}
      <section className="rounded-3xl border border-cyan-800/40 p-8 md:p-12 bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-slate-900/60 shadow-xl">
        <h2 className="text-3xl font-bold text-cyan-200 mb-6">Wezwanie do współpracy</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 p-7 bg-slate-900/80 shadow-lg">
            <h3 className="text-xl font-bold text-cyan-100 mb-3">Mieszkańcy</h3>
            <p className="text-slate-200 leading-relaxed">Sprawdźcie, za co płacicie — i co można poprawić.</p>
          </div>
          <div className="rounded-2xl border border-slate-700 p-7 bg-slate-900/80 shadow-lg">
            <h3 className="text-xl font-bold text-cyan-100 mb-3">Zarządcy</h3>
            <p className="text-slate-200 leading-relaxed">Zamieńcie dyskusje na decyzje — na liczbach.</p>
          </div>
          <div className="rounded-2xl border border-slate-700 p-7 bg-slate-900/80 shadow-lg">
            <h3 className="text-xl font-bold text-cyan-100 mb-3">Miasta i Gminy</h3>
            <p className="text-slate-200 leading-relaxed">Zobaczcie potencjał oszczędności w skali i planujcie modernizacje tam, gdzie najbardziej się zwrócą.</p>
          </div>
        </div>
      </section>

      {/* Zakończenie */}
      <section className="text-center rounded-3xl p-10 md:p-16 border border-slate-700 bg-gradient-to-br from-slate-900/60 via-slate-800/80 to-slate-950/90 shadow-2xl max-w-4xl mx-auto mt-12">
        <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-200 to-blue-500 bg-clip-text text-transparent mb-6">
          PROF INSTAL — łączymy ludzi, budynki i dane, żeby woda była ciepła, a liczby chłodne.
        </p>
        <p className="text-xl text-slate-200 font-medium">
          Mniej strat, niższe rachunki, czystsze powietrze. Dla mieszkańców, zarządców i gmin — jednym wspólnym językiem.
        </p>
      </section>
    </div>
  );
}
