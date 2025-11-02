"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type Result = {
  needGJ: number;
  purchasedGJ: number;
  circGJ: number;
  usefulGJ: number;
  costPLN: number;
  diffPLN: number;
};

export default function MieszkancyPage() {
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, coerce(v as string)])
    );
    setFormData(payload);
    
    const r = await fetch("/api/calc/resident", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await r.json();
    if (json.ok) setRes(json.result);
    else alert("Błąd: " + JSON.stringify(json.error));
    setLoading(false);
  }

  async function downloadPDF() {
    if (!res || !formData) return;
    const data = { input: formData, result: res };
    const url = `/api/report/resident?data=${encodeURIComponent(JSON.stringify(data))}`;
    window.open(url, '_blank');
  }

  return (
    <div className="grid gap-8">
      <div className="text-center space-y-4 pb-4">
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
          💡 Sprawdź swoje rachunki
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Mieszkańcy – Analiza kosztów CWU
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Czy płacisz za dużo? Sprawdź czy Twoje wpłaty odpowiadają rzeczywistym kosztom energii 
          i odkryj straty cyrkulacji w Twoim budynku.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid md:grid-cols-3 gap-4">
        <Field label="Zużycie wody [m³/miesiąc]">
          <input
            name="waterM3"
            defaultValue={12}
            className="border rounded-lg px-3 py-2"
            required
          />
        </Field>
        <Field label="Temperatura zimnej wody [°C]">
          <input
            name="coldTempC"
            defaultValue={8}
            className="border rounded-lg px-3 py-2"
            required
          />
        </Field>
        <Field label="Temperatura CWU [°C]">
          <input
            name="hotTempC"
            defaultValue={55}
            className="border rounded-lg px-3 py-2"
            required
          />
        </Field>

        <Field label="Ciepło z MPEC [GJ/miesiąc] (opcjonalne)">
          <input
            name="mpecHeatGJ"
            placeholder="np. 45"
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="Cena za GJ [zł] (opcjonalne)">
          <input
            name="pricePerGJ"
            placeholder="np. 60"
            className="border rounded-lg px-3 py-2"
          />
        </Field>
        <Field label="Wasze wpłaty [PLN/miesiąc]">
          <input
            name="residentPaymentsPLN"
            defaultValue={2400}
            className="border rounded-lg px-3 py-2"
            required
          />
        </Field>

        <Field label="Straty cyrkulacji [%] (założenie)">
          <input
            name="circulationLossPct"
            defaultValue={25}
            className="border rounded-lg px-3 py-2"
          />
        </Field>

        <div className="md:col-span-3">
          <button
            className="px-5 py-3 rounded-xl bg-black text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Liczenie..." : "Policz koszty i straty"}
          </button>
        </div>
      </form>

      {res && (
        <section className="grid gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Wyniki analizy</h2>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Pobierz raport PDF
            </button>
          </div>
          
          <div className="border rounded-2xl p-4 grid md:grid-cols-3 gap-4">
            <Info label="Zapotrzebowanie teoretyczne" value={`${res.needGJ.toFixed(2)} GJ`} />
            <Info label="Ciepło zakupione" value={`${res.purchasedGJ.toFixed(2)} GJ`} />
            <Info label="Straty cyrkulacji" value={`${res.circGJ.toFixed(2)} GJ`} />
            <Info label="Energia użyteczna" value={`${res.usefulGJ.toFixed(2)} GJ`} />
            <Info label="Koszt energii (MPEC)" value={`${fmt(Math.round(res.costPLN))} PLN`} />
            <Info label="Różnica (koszt - wpłaty)" value={`${fmt(Math.round(res.diffPLN))} PLN`} />
          </div>

          <div className="border rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Interpretacja wyników</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Udział strat cyrkulacji:</strong> {res.purchasedGJ > 0 ? ((res.circGJ / res.purchasedGJ) * 100).toFixed(1) : "0"}% 
                zakupionego ciepła idzie na straty w cyrkulacji.
              </p>
              <p>
                <strong>Efektywność:</strong> {res.purchasedGJ > 0 ? ((res.usefulGJ / res.purchasedGJ) * 100).toFixed(1) : "0"}% 
                zakupionego ciepła trafia do Państwa mieszkania.
              </p>
              {res.diffPLN > 0 && (
                <p className="text-red-600">
                  <strong>Uwaga:</strong> Rzeczywiste koszty energii są wyższe od wpłat o {fmt(Math.round(res.diffPLN))} PLN/miesiąc.
                </p>
              )}
              {res.diffPLN < 0 && (
                <p className="text-green-600">
                  <strong>Pozytywnie:</strong> Wpłaty pokrywają koszty z nadwyżką {fmt(Math.round(-res.diffPLN))} PLN/miesiąc.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>
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
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
}

function fmt(n: number) {
  return n.toLocaleString("pl-PL");
}
