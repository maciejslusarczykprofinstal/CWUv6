export default function HybridMethodContent() {
  return (
    <div className="mt-8 p-6 rounded-xl bg-slate-800/80 border border-blue-900 shadow-inner text-slate-200 text-base whitespace-pre-line">
      <h3 className="text-xl font-bold text-blue-300 mb-4">Metoda obliczeń (hybryda)</h3>
      <div className="space-y-3">
        <div>
          <b>Idea:</b> liczysz moc zamówioną dwoma niezależnymi podejściami ("fizyka" i "pomiary"), a potem przyjmujesz wynik konserwatywny.
        </div>
        <div>
          <b>Kroki:</b>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li><b>Bilans energetyczny CWU</b> – wyznacz <span className="font-mono">P<sub>zam</sub><sup>bilans</sup></span> na podstawie energii i strat (węzeł/źródło).</li>
            <li><b>Peak demand</b> – wyznacz <span className="font-mono">P<sub>zam</sub><sup>peak</sup></span> z danych pomiarowych/rachunków (maksima sezonowe, profil dobowy).</li>
            <li><b>Wynik hybrydowy</b> – przyjmij wartość bezpieczną (najczęściej maksimum):
              <div className="flex justify-center mt-2">
                {/* Tu można dodać KaTeXFormula jeśli jest dostępny */}
                <span className="font-mono">P<sub>zam</sub><sup>hyb</sup> = max(P<sub>zam</sub><sup>bilans</sup>, P<sub>zam</sub><sup>peak</sup>)</span>
              </div>
            </li>
          </ol>
        </div>
        <div className="text-sm text-slate-300">
          <b>Kiedy ma sens:</b> gdy dane są niepełne (np. brak profilu chwilowego, ale są rachunki) albo gdy chcesz zderzyć "to, co wychodzi z obliczeń" z "tym, co wychodzi z eksploatacji".
        </div>
      </div>
    </div>
  );
}
