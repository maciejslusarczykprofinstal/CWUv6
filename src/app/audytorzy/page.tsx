"use client";

import { useState } from "react";

type Result = {
  power: {
    PkW: number;
    PnetkW: number;
    jednocz: number;
    dT: number;
    Ebufor_kWh: number;
    assumptions: unknown;
  };
  circGJ: number;
  variants: Array<{
    name: string;
    capexPLN: number;
    savedGJ: number;
    savedPLN: number;
    paybackYears: number;
  }>;
};

export default function Page() {
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, coerce(v as string)]),
    );
    const r = await fetch("/api/calc/auditor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await r.json();
    if (json.ok) setRes(json.result);
    else alert("Błąd: " + JSON.stringify(json.error));
    setLoading(false);
  }

  return (
    <div className="grid gap-8">
      <div className="text-center space-y-4 pb-4">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full text-sm font-medium text-indigo-700 dark:text-indigo-300">
          🔧 Narzędzia profesjonalisty
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Audytorzy – Moc zamówiona CWU
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Precyzyjne obliczenia mocy z uwzględnieniem bufora i jednoczesności. 
          Szczegółowa analiza strat cyrkulacji z wariantami modernizacji.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid md:grid-cols-4 gap-4">
        <Field label="Liczba mieszkań">
          <input
            name="flats"
            defaultValue={65}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="Liczba pionów">
          <input
            name="risers"
            defaultValue={18}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="T. zimnej [°C]">
          <input
            name="coldTempC"
            defaultValue={8}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="T. CWU [°C]">
          <input
            name="hotTempC"
            defaultValue={55}
            className="border rounded-lg px-3 py-2"
          />
        </Field>

        <Field label="Szczytowy pobór [L/min]">
          <input
            name="drawPeakLpm"
            defaultValue={120}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="Profil jednoczesności">
          <select
            name="simultProfile"
            defaultValue="med"
            className="border rounded-lg px-3 py-2"
          >
            <option value="low">low</option>
            <option value="med">med</option>
            <option value="high">high</option>
          </select>
        </Field>
        <Field label="Bufor [L]">
          <input
            name="bufferL"
            defaultValue={1000}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="ΔT bufora [K]">
          <input
            name="bufferDeltaC"
            defaultValue={10}
            className="border rounded-lg px-3 py-2"
          />
        </Field>

        <Field label="Czas piku [s]">
          <input
            name="peakDurationSec"
            defaultValue={300}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="% strat cyrkulacji (opc.)">
          <input
            name="circulationPct"
            placeholder="np. 25"
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="Ciepło zakupione [GJ] (opc.)">
          <input
            name="purchasedGJ"
            placeholder="np. 610"
            className="border rounded-lg px-3 py-2"
          />
        </Field>

        <Field label="UA cyrkulacji [W/K] (opc.)">
          <input
            name="UA_WK"
            placeholder="np. 240"
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="ΔT cyrkulacji [K]">
          <input
            name="dT_circ"
            defaultValue={20}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="Godziny/rok">
          <input
            name="hours_circ"
            defaultValue={8760}
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="Cena [zł/GJ]">
          <input
            name="pricePerGJ"
            defaultValue={60}
            className="border rounded-lg px-3 py-2"
          />
        </Field>

        <div className="md:col-span-4">
          <button
            className="px-5 py-3 rounded-xl bg-black text-white"
            disabled={loading}
          >
            {loading ? "Liczenie..." : "Policz moc i straty"}
          </button>
        </div>
      </form>

      {res && (
        <section className="grid gap-6">
          <div className="border rounded-2xl p-4 grid md:grid-cols-3 gap-4">
            <Info label="Jednoczesność" value={res.power.jednocz.toFixed(2)} />
            <Info label="ΔT [K]" value={res.power.dT.toFixed(1)} />
            <Info label="Bufor [kWh]" value={res.power.Ebufor_kWh.toFixed(2)} />
            <Info label="P (szczyt) [kW]" value={res.power.PkW.toFixed(1)} />
            <Info
              label="P po buforze [kW]"
              value={res.power.PnetkW.toFixed(1)}
            />
            <Info
              label="Straty cyrkulacji [GJ/rok]"
              value={res.circGJ.toFixed(2)}
            />
          </div>

          <div className="border rounded-2xl p-4">
            <h3 className="font-semibold mb-2">
              Warianty modernizacji (szacunek)
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2">Wariant</th>
                  <th>CAPEX [PLN]</th>
                  <th>Oszcz. [GJ/rok]</th>
                  <th>Oszcz. [PLN/rok]</th>
                  <th>Payback [lata]</th>
                </tr>
              </thead>
              <tbody>
                {res.variants.map((v, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2">{v.name}</td>
                    <td>{fmt(v.capexPLN)}</td>
                    <td>{v.savedGJ.toFixed(1)}</td>
                    <td>{fmt(v.savedPLN)}</td>
                    <td>{v.paybackYears.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label>{label}</label>
      {children}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-[hsl(var(--muted))]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
function coerce(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}
function fmt(n: number) {
  return n.toLocaleString("pl-PL");
}
