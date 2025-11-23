// ...usunięto starą deklarację komponentu...
import React, { useState } from "react";

type InputState = {
  n_mieszkan: number;
  osoby_na_mieszkanie: number;
  zuzycie_jedn_dm3_na_dobe_na_os: number;
  czas_pracy_h_na_dobe: number;
  Nh: number;
  T_c: number;
  T_w: number;
  V_z_l: number;
  eta_z: number;
  t_szczyt_h: number;
};

type ResultState = {
  n_osob: number;
  qd_sr_dm3_na_dobe: number;
  qd_sr_m3_na_dobe: number;
  qh_sr_dm3_na_h: number;
  qh_sr_m3_na_h: number;
  qh_max_dm3_na_h: number;
  qh_max_m3_na_h: number;
  Phi_sr_kW: number;
  Phi_max_kW: number;
  Q_z_kWh: number;
  Phi_z_kW: number;
  Phi_wym_kW: number;
};

function calculateCwuWithTank(input: InputState): ResultState {
  const { n_mieszkan, osoby_na_mieszkanie, zuzycie_jedn_dm3_na_dobe_na_os, czas_pracy_h_na_dobe, Nh, T_c, T_w, V_z_l, eta_z, t_szczyt_h } = input;
  // 1. Liczba osób
  const n_osob = n_mieszkan * osoby_na_mieszkanie;
  // 2. Dobowe zapotrzebowanie
  const qd_sr_dm3_na_dobe = n_osob * zuzycie_jedn_dm3_na_dobe_na_os;
  const qd_sr_m3_na_dobe = qd_sr_dm3_na_dobe / 1000;
  // 3. Średnie godzinowe zużycie
  const qh_sr_dm3_na_h = qd_sr_dm3_na_dobe / czas_pracy_h_na_dobe;
  const qh_sr_m3_na_h = qh_sr_dm3_na_h / 1000;
  // 4. Maksymalne godzinowe zużycie
  const qh_max_dm3_na_h = Nh * qh_sr_dm3_na_h;
  const qh_max_m3_na_h = qh_max_dm3_na_h / 1000;
  // 5. Moc cieplna bez zasobnika
  const delta_T = T_w - T_c;
  const c = 4.19;
  const m_dot_max_kg_s = qh_max_m3_na_h * 1000 / 3600;
  const m_dot_sr_kg_s = qh_sr_m3_na_h * 1000 / 3600;
  const Phi_max_kW = m_dot_max_kg_s * c * delta_T;
  const Phi_sr_kW = m_dot_sr_kg_s * c * delta_T;
  // 6. Zasobnik
  const V_z_m3 = V_z_l / 1000;
  const Q_z_kWh = 1.163 * V_z_m3 * delta_T;
  const Q_z_uzyte_kWh = eta_z * Q_z_kWh;
  const Phi_z_kW = Q_z_uzyte_kWh / t_szczyt_h;
  // 7. Moc wymagana źródła
  const Phi_wym_kW = Math.max(Phi_sr_kW, Phi_max_kW - Phi_z_kW);
  return {
    n_osob,
    qd_sr_dm3_na_dobe,
    qd_sr_m3_na_dobe,
    qh_sr_dm3_na_h,
    qh_sr_m3_na_h,
    qh_max_dm3_na_h,
    qh_max_m3_na_h,
    Phi_sr_kW,
    Phi_max_kW,
    Q_z_kWh,
    Phi_z_kW,
    Phi_wym_kW,
  };
}

export const CwuSimpleOrderedPowerPanel: React.FC = () => {
  const [input, setInput] = useState<InputState>({
    n_mieszkan: 88,
    osoby_na_mieszkanie: 1.5,
    zuzycie_jedn_dm3_na_dobe_na_os: 110,
    czas_pracy_h_na_dobe: 18,
    Nh: 2.5,
    T_c: 10,
    T_w: 55,
    V_z_l: 1000,
    eta_z: 0.8,
    t_szczyt_h: 0.5,
  });
  const [result, setResult] = useState<ResultState | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: name === "eta_z" ? parseFloat(value) : parseFloat(value) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(calculateCwuWithTank(input));
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-2 text-indigo-700">Kalkulator mocy zamówionej CWU z zasobnikiem</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="font-semibold">Liczba mieszkań</label>
            <input type="number" name="n_mieszkan" value={input.n_mieszkan} min={1} step={1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Średnia liczba osób w mieszkaniu</label>
            <input type="number" name="osoby_na_mieszkanie" value={input.osoby_na_mieszkanie} min={0.1} step={0.1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Zużycie jednostkowe [dm³/dobę/osobę]</label>
            <input type="number" name="zuzycie_jedn_dm3_na_dobe_na_os" value={input.zuzycie_jedn_dm3_na_dobe_na_os} min={1} step={1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Czas pracy instalacji [h/dobę]</label>
            <input type="number" name="czas_pracy_h_na_dobe" value={input.czas_pracy_h_na_dobe} min={1} step={1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Współczynnik nierówności Nh</label>
            <input type="number" name="Nh" value={input.Nh} min={1} step={0.1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Temperatura wody zimnej [°C]</label>
            <input type="number" name="T_c" value={input.T_c} min={0} step={1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Temperatura ciepłej wody [°C]</label>
            <input type="number" name="T_w" value={input.T_w} min={1} step={1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Pojemność zasobnika [litry]</label>
            <input type="number" name="V_z_l" value={input.V_z_l} min={1} step={1} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Współczynnik wykorzystania zasobnika</label>
            <input type="number" name="eta_z" value={input.eta_z} min={0} max={1} step={0.01} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div>
            <label className="font-semibold">Czas krytycznego rozbioru [h]</label>
            <input type="number" name="t_szczyt_h" value={input.t_szczyt_h} min={0.1} step={0.01} onChange={handleChange} className="input w-full mt-1" />
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow font-semibold w-full">Oblicz moc do zamówienia</button>
          </div>
        </form>
        {result && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2 text-indigo-700">Wyniki kalkulacji</h3>
            <table className="min-w-full text-sm border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow">
              <tbody>
                <tr><td className="px-3 py-2 font-semibold">Liczba osób</td><td className="px-3 py-2">{result.n_osob.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} os.</td></tr>
                <tr><td className="px-3 py-2 font-semibold">Dobowe zapotrzebowanie qd_śr</td><td className="px-3 py-2">{result.qd_sr_dm3_na_dobe.toLocaleString("pl-PL", { maximumFractionDigits: 1 })} dm³/dobę<br />{result.qd_sr_m3_na_dobe.toLocaleString("pl-PL", { maximumFractionDigits: 3 })} m³/dobę</td></tr>
                <tr><td className="px-3 py-2 font-semibold">Średnie godzinowe zużycie qh_śr</td><td className="px-3 py-2">{result.qh_sr_dm3_na_h.toLocaleString("pl-PL", { maximumFractionDigits: 1 })} dm³/h<br />{result.qh_sr_m3_na_h.toLocaleString("pl-PL", { maximumFractionDigits: 3 })} m³/h</td></tr>
                <tr><td className="px-3 py-2 font-semibold">Maksymalne godzinowe zużycie qh_max</td><td className="px-3 py-2">{result.qh_max_dm3_na_h.toLocaleString("pl-PL", { maximumFractionDigits: 1 })} dm³/h<br />{result.qh_max_m3_na_h.toLocaleString("pl-PL", { maximumFractionDigits: 3 })} m³/h</td></tr>
                <tr><td className="px-3 py-2 font-semibold">Moc średnia Phi_śr</td><td className="px-3 py-2">{result.Phi_sr_kW.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
                <tr><td className="px-3 py-2 font-semibold">Moc wymagana bez zasobnika Phi_max</td><td className="px-3 py-2">{result.Phi_max_kW.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
                <tr><td className="px-3 py-2 font-semibold">Energia zmagazynowana w zasobniku Q_z</td><td className="px-3 py-2">{result.Q_z_kWh.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kWh</td></tr>
                <tr><td className="px-3 py-2 font-semibold">Równoważna moc zasobnika Phi_z</td><td className="px-3 py-2">{result.Phi_z_kW.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
                <tr><td className="px-3 py-2 font-semibold font-bold text-indigo-700">Moc wymagana źródła po uwzględnieniu zasobnika</td><td className="px-3 py-2 font-bold text-indigo-700">{result.Phi_wym_kW.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
              </tbody>
            </table>
            <div className="mt-6 text-sm text-slate-700 dark:text-slate-200">
              <h4 className="font-bold mb-2 text-indigo-700">Wzory użyte w obliczeniach:</h4>
              <ul className="list-disc pl-6">
                <li><b>Liczba osób:</b> <span className="font-mono">n_osob = n_mieszkan × osoby_na_mieszkanie</span></li>
                <li><b>Dobowe zapotrzebowanie:</b> <span className="font-mono">qd_śr = n_osob × zużycie_jedn_dm3_na_dobe_na_os</span></li>
                <li><b>Średnie godzinowe zużycie:</b> <span className="font-mono">qh_śr = qd_śr / czas_pracy_h_na_dobe</span></li>
                <li><b>Maksymalne godzinowe zużycie:</b> <span className="font-mono">qh_max = Nh × qh_śr</span></li>
                <li><b>Moc średnia:</b> <span className="font-mono">Φ_śr = ṁ_śr × c × ΔT</span>, gdzie <span className="font-mono">ṁ_śr = qh_śr_m3_na_h × 1000 / 3600</span></li>
                <li><b>Moc maksymalna:</b> <span className="font-mono">Φ_max = ṁ_max × c × ΔT</span>, gdzie <span className="font-mono">ṁ_max = qh_max_m3_na_h × 1000 / 3600</span></li>
                <li><b>Energia zmagazynowana w zasobniku:</b> <span className="font-mono">Q_z = 1.163 × V_z_m3 × ΔT</span></li>
                <li><b>Równoważna moc zasobnika:</b> <span className="font-mono">Φ_z = η_z × Q_z / t_szczyt_h</span></li>
                <li><b>Moc wymagana źródła:</b> <span className="font-mono">Φ_wym = max(Φ_śr, Φ_max - Φ_z)</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
