"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type CWUPayload = {
  V_tank_l: number;
  T_set_C: number;
  T_min_C: number;
  loss_kw: number;
  cost_kw_month: number;
  horizon_years: number;
};

export type CWUApiResult = {
  Pzam_final: number;
  Pmix: number;
  Player: number;
  delta_P: number;
  cost_month: number;
  cost_year: number;
  cost_horizon: number;
  decision: string;
  level: "A" | "B" | "C";
};

async function calculateCWU(payload: CWUPayload): Promise<CWUApiResult> {
  const res = await fetch("http://localhost:8000/api/cwu/moc-zamowiona", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      V_tank_l: payload.V_tank_l,
      T_set_C: payload.T_set_C,
      T_min_C: payload.T_min_C,
      loss_kw: payload.loss_kw,
      cost_kw_month: payload.cost_kw_month,
      horizon_years: payload.horizon_years,
    }),
  });
  console.log("CWU fetch response:", res);
  if (!res.ok) {
    const errText = await res.text();
    console.error("CWU API error:", errText);
    throw new Error("Błąd silnika CWU");
  }
  const data = await res.json();
  console.log("CWU API data:", data);
  return data;
}

export default function CwuHybridSimulation() {
  const [params, setParams] = useState<CWUPayload>({
    V_tank_l: 800,
    T_set_C: 55,
    T_min_C: 45,
    loss_kw: 3,
    cost_kw_month: 50,
    horizon_years: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CWUApiResult | null>(null);

  // Dla uproszczenia: P_bilans = Player, P_peak = Pmix (w realnej wersji można rozdzielić)
  // Tu: P_bilans = Player (warstwowy), P_peak = Pmix (mieszany)
  const P_bilans = result?.Player ?? 0;
  const P_peak = result?.Pmix ?? 0;
  const P_hyb = Math.max(P_bilans, P_peak);
  const deltaP = Math.abs(P_bilans - P_peak);
  const deltaPct = P_bilans > 0 ? (deltaP / P_bilans) * 100 : 0;

  const handleChange = (field: keyof CWUPayload, value: number) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalc = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await calculateCWU(params);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd silnika CWU");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      {/* Lewa kolumna: parametry */}
      <div className="w-full max-w-xs flex flex-col gap-4 bg-slate-900/80 p-6 rounded-xl border border-blue-900">
        <label className="font-semibold text-blue-200">Pojemność zasobnika [l]
          <input type="number" min={1} step={1} value={params.V_tank_l} onChange={e => handleChange("V_tank_l", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </label>
        <label className="font-semibold text-blue-200">Temperatura zadana CWU [°C]
          <input type="number" step={0.1} value={params.T_set_C} onChange={e => handleChange("T_set_C", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </label>
        <label className="font-semibold text-blue-200">Temperatura minimalna [°C]
          <input type="number" step={0.1} value={params.T_min_C} onChange={e => handleChange("T_min_C", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </label>
        <label className="font-semibold text-blue-200">Straty CWU [kW]
          <input type="number" min={0} step={0.1} value={params.loss_kw} onChange={e => handleChange("loss_kw", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </label>
        <label className="font-semibold text-blue-200">Koszt mocy [zł/kW/miesiąc]
          <input type="number" min={0} step={1} value={params.cost_kw_month} onChange={e => handleChange("cost_kw_month", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </label>
        <label className="font-semibold text-blue-200">Horyzont analizy [lata]
          <select value={params.horizon_years} onChange={e => handleChange("horizon_years", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </label>
        <Button onClick={handleCalc} disabled={loading}>{loading ? "Liczenie…" : "Oblicz"}</Button>
        {error && <div className="mt-2 p-2 rounded bg-red-900/30 border border-red-700 text-red-200">{error}</div>}
      </div>
      {/* Prawa kolumna: wyniki i wykresy */}
      <div className="flex-1 flex flex-col gap-6">
        {result && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/70 border border-slate-700">
                <div className="text-xs text-slate-300">Bilans energetyczny</div>
                <div className="text-xl font-bold text-slate-100">{P_bilans.toFixed(1)} kW</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/70 border border-slate-700">
                <div className="text-xs text-slate-300">Peak demand</div>
                <div className="text-xl font-bold text-slate-100">{P_peak.toFixed(1)} kW</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/70 border border-blue-700">
                <div className="text-xs text-blue-300 font-bold">Wynik hybrydowy (rekomendacja)</div>
                <div className="text-xl font-bold text-blue-200">{P_hyb.toFixed(1)} kW</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/70 border border-slate-700">
                <div className="text-xs text-slate-300">ΔP</div>
                <div className="text-xl font-bold text-slate-100">{deltaP.toFixed(1)} kW ({deltaPct.toFixed(1)}%)</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/70 border border-slate-700">
                <div className="text-xs text-slate-300">Koszt miesięczny</div>
                <div className="text-xl font-bold text-slate-100">{result.cost_month.toFixed(0)} zł</div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-blue-900">
              <div className="text-blue-300 font-bold mb-3">Porównanie mocy (hybrydowa)</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={[
                    { name: "Bilans", value: P_bilans },
                    { name: "Peak", value: P_peak },
                    { name: "Rekomendacja", value: P_hyb },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#60a5fa" tick={{ fill: "#60a5fa", fontSize: 12 }} />
                  <YAxis stroke="#60a5fa" tick={{ fill: "#60a5fa", fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${Number(v).toFixed(1)} kW`} />
                  <Bar dataKey="value" name="Moc" radius={[6, 6, 0, 0]}>
                    <Cell fill="#60a5fa" />
                    <Cell fill="#f87171" />
                    <Cell fill="#22c55e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
