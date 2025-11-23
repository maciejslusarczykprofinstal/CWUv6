import React, { useState } from "react";

// Typy wejścia/wyjścia
export interface CwuOrderedPowerInput {
  liczbaMieszkan: number;
  sredniaOsob: number;
  szczytoweZuzycieNaOsobe: number;
  tempCwu: number;
  tempZimnej: number;
  stratyCyrkulacji: number;
  zapasBezpieczenstwa: number;
}

export interface CwuOrderedPowerResult {
  V_szczyt_m3_h: number;
  Q_CWU_kW: number;
  Q_cyrk_kW: number;
  Q_CWU_calk_kW: number;
  Q_zam_CWU_kW: number;
}

// Funkcja obliczeniowa
export function obliczMocZamowionaCwu(input: CwuOrderedPowerInput): CwuOrderedPowerResult {
  // Liczba osób
  const liczba_osob = input.liczbaMieszkan * input.sredniaOsob;
  // Szczytowy przepływ w l/h
  const V_szczyt_l_h = liczba_osob * input.szczytoweZuzycieNaOsobe;
  // Szczytowy przepływ w m3/h
  const V_szczyt_m3_h = V_szczyt_l_h / 1000;
  // Moc na podgrzanie CWU (bez strat)
  const Q_CWU_kW = 1.16 * V_szczyt_m3_h * (input.tempCwu - input.tempZimnej); // 1.16 = ciepło właściwe wody
  // Moc odpowiadająca stratom na cyrkulacji
  const Q_cyrk_kW = Q_CWU_kW * (input.stratyCyrkulacji / 100);
  // Suma mocy CWU
  const Q_CWU_calk_kW = Q_CWU_kW + Q_cyrk_kW;
  // Dodanie zapasu bezpieczeństwa
  const Q_zam_CWU_kW = Math.ceil(Q_CWU_calk_kW * (1 + input.zapasBezpieczenstwa / 100) / 5) * 5;
  return {
    V_szczyt_m3_h,
    Q_CWU_kW,
    Q_cyrk_kW,
    Q_CWU_calk_kW,
    Q_zam_CWU_kW,
  };
}

export const CwuOrderedPowerPanel: React.FC = () => {
  const [input, setInput] = useState<CwuOrderedPowerInput>({
    liczbaMieszkan: 50,
    sredniaOsob: 2.7,
    szczytoweZuzycieNaOsobe: 30,
    tempCwu: 55,
    tempZimnej: 8,
    stratyCyrkulacji: 20,
    zapasBezpieczenstwa: 15,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<CwuOrderedPowerResult | null>(null);

  // Walidacja pól
  function validate(): boolean {
    const newErrors: { [key: string]: string } = {};
    if (!input.liczbaMieszkan || input.liczbaMieszkan <= 0) newErrors.liczbaMieszkan = "Podaj dodatnią liczbę";
    if (!input.sredniaOsob || input.sredniaOsob <= 0) newErrors.sredniaOsob = "Podaj dodatnią liczbę";
    if (!input.szczytoweZuzycieNaOsobe || input.szczytoweZuzycieNaOsobe <= 0) newErrors.szczytoweZuzycieNaOsobe = "Podaj dodatnią liczbę";
    if (!input.tempCwu || input.tempCwu <= 0) newErrors.tempCwu = "Podaj dodatnią liczbę";
    if (!input.tempZimnej || input.tempZimnej < 0) newErrors.tempZimnej = "Podaj liczbę >= 0";
    if (input.tempCwu <= input.tempZimnej) newErrors.tempCwu = "Tcw musi być większa niż Tzw";
    if (input.stratyCyrkulacji < 0) newErrors.stratyCyrkulacji = "Podaj wartość >= 0";
    if (input.zapasBezpieczenstwa < 0) newErrors.zapasBezpieczenstwa = "Podaj wartość >= 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value.replace(",", ".")) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      setResult(obliczMocZamowionaCwu(input));
    } else {
      setResult(null);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-2 text-indigo-700">Kalkulator mocy zamówionej CWU</h2>
        <p className="mb-6 text-slate-700 dark:text-slate-200">Podaj podstawowe dane budynku i instalacji. Kalkulator pozwala oszacować wymaganą moc zamówioną z sieci ciepłowniczej na potrzeby ciepłej wody użytkowej. Wynik uwzględnia straty cyrkulacji i zapas bezpieczeństwa.</p>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold">Liczba mieszkań</label>
            <input type="number" name="liczbaMieszkan" value={input.liczbaMieszkan} onChange={handleChange} min={1} className="input w-full mt-1" />
            {errors.liczbaMieszkan && <div className="text-xs text-red-600 mt-1">{errors.liczbaMieszkan}</div>}
          </div>
          <div>
            <label className="font-semibold">Średnia liczba osób w mieszkaniu</label>
            <input type="number" name="sredniaOsob" value={input.sredniaOsob} onChange={handleChange} min={0.1} step={0.1} className="input w-full mt-1" />
            {errors.sredniaOsob && <div className="text-xs text-red-600 mt-1">{errors.sredniaOsob}</div>}
          </div>
          <div>
            <label className="font-semibold">Szczytowe zużycie CWU na osobę [l/h]</label>
            <input type="number" name="szczytoweZuzycieNaOsobe" value={input.szczytoweZuzycieNaOsobe} onChange={handleChange} min={1} className="input w-full mt-1" />
            {errors.szczytoweZuzycieNaOsobe && <div className="text-xs text-red-600 mt-1">{errors.szczytoweZuzycieNaOsobe}</div>}
          </div>
          <div>
            <label className="font-semibold">Temperatura ciepłej wody Tcw [°C]</label>
            <input type="number" name="tempCwu" value={input.tempCwu} onChange={handleChange} min={1} className="input w-full mt-1" />
            {errors.tempCwu && <div className="text-xs text-red-600 mt-1">{errors.tempCwu}</div>}
          </div>
          <div>
            <label className="font-semibold">Temperatura zimnej wody Tzw [°C]</label>
            <input type="number" name="tempZimnej" value={input.tempZimnej} onChange={handleChange} min={0} className="input w-full mt-1" />
            {errors.tempZimnej && <div className="text-xs text-red-600 mt-1">{errors.tempZimnej}</div>}
          </div>
          <div>
            <label className="font-semibold">Straty na cyrkulacji [%]</label>
            <input type="number" name="stratyCyrkulacji" value={input.stratyCyrkulacji} onChange={handleChange} min={0} className="input w-full mt-1" />
            {errors.stratyCyrkulacji && <div className="text-xs text-red-600 mt-1">{errors.stratyCyrkulacji}</div>}
          </div>
          <div>
            <label className="font-semibold">Zapas bezpieczeństwa [%]</label>
            <input type="number" name="zapasBezpieczenstwa" value={input.zapasBezpieczenstwa} onChange={handleChange} min={0} className="input w-full mt-1" />
            {errors.zapasBezpieczenstwa && <div className="text-xs text-red-600 mt-1">{errors.zapasBezpieczenstwa}</div>}
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow font-semibold w-full disabled:opacity-50" disabled={Object.keys(errors).length > 0}>Oblicz moc zamówioną</button>
          </div>
        </form>
        {result && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2 text-indigo-700">Wyniki kalkulacji</h3>
            <table className="min-w-full text-sm border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow">
              <tbody>
                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Szczytowy przepływ</td>
                  <td className="px-3 py-2 text-indigo-900 dark:text-indigo-100">{result.V_szczyt_m3_h.toFixed(2)} m³/h</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Moc na podgrzanie wody bez strat</td>
                  <td className="px-3 py-2 text-indigo-900 dark:text-indigo-100">{result.Q_CWU_kW.toFixed(2)} kW</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Moc odpowiadająca stratom cyrkulacji</td>
                  <td className="px-3 py-2 text-indigo-900 dark:text-indigo-100">{result.Q_cyrk_kW.toFixed(2)} kW</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Całkowita moc CWU przed zapasem</td>
                  <td className="px-3 py-2 text-indigo-900 dark:text-indigo-100">{result.Q_CWU_calk_kW.toFixed(2)} kW</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 font-bold">Proponowana moc zamówiona CWU</td>
                  <td className="px-3 py-2 text-indigo-900 dark:text-indigo-100 font-bold">{result.Q_zam_CWU_kW} kW</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Kalkulator pokazuje szacunkową moc zamówioną CWU na podstawie podanych założeń. Wartości mogą różnić się od danych przyjętych przez dostawcę ciepła.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
