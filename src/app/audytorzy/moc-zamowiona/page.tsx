
"use client";


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const METHODS = [
  {
    key: "symulacja-programowa",
    label: "Symulacja programowa",
    desc: "Model instalacji CWU z cyrkulacją"
  },
  {
    key: "pn-en-806-3",
    label: "PN-EN 806-3",
    desc: "Obliczenia wg normy europejskiej dla instalacji ciepłej wody."
  },
  {
    key: "bilans-energetyczny",
    label: "Bilans energetyczny CWU",
    desc: "Dla węzłów cieplnych – najbardziej konkretna i najbliższa fizyce"
  },
  {
    key: "moc-czas-rozbioru",
    label: "Moc / czas rozbioru",
    desc: "Maksymalny jednorazowy rozbiór – niezależnie od norm"
  },
  {
    key: "peak-demand",
    label: "Peak demand (pomiary)",
    desc: "Najbardziej uczciwa finansowo – oparta na realnym zużyciu"
  },
  {
    key: "krzywa-mocy",
    label: "Krzywa mocy + sezon",
    desc: "Histogram obciążenia – brzmi jak magia Excela, ale działa"
  },
  {
    key: "metoda-kosztowa",
    label: "Metoda kosztowa",
    desc: "Ekonomiczna optymalizacja mocy zamówionej"
  },
  {
    key: "pn-92-b-01706",
    label: "PN-92/B-01706",
    desc: "Norma Polska wycofana\n„Bezpieczniej będzie przewymiarować.”"
  },
];

export default function MocZamowionaPage() {
	const [selected, setSelected] = useState(METHODS[0].key);
	return (
		<div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
			{/* Lewy panel z przyciskami */}
					<aside className="w-full max-w-xs md:max-w-sm lg:max-w-xs xl:max-w-xs flex flex-col gap-3 p-6 bg-slate-900/80 border-r border-slate-800 shadow-2xl">
						<h2 className="text-lg font-bold text-slate-200 mb-4 tracking-tight">Wybierz metodę obliczeniową</h2>
						<div className="flex flex-col gap-3">
							{METHODS.map((m) => (
								<Button
									key={m.key}
									variant={selected === m.key ? "default" : "outline"}
									className={`flex flex-col items-start justify-center min-h-[90px] h-auto min-w-0 w-full px-5 py-4 rounded-2xl font-semibold text-base transition-all border-2 whitespace-normal break-words text-left ${selected === m.key ? "border-blue-500 bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg" : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/80"}`}
									style={{ wordBreak: "break-word", whiteSpace: "normal" }}
									onClick={() => setSelected(m.key)}
								>
									<span className="font-bold text-base mb-1 w-full block leading-snug break-words whitespace-normal">{m.label}</span>
									<span className="text-xs text-slate-400 leading-tight w-full block break-words whitespace-normal">{m.desc}</span>
								</Button>
							))}
						</div>
					</aside>

			{/* Prawy panel na treść */}
			<main className="flex-1 flex items-center justify-center p-8">
				<Card className="w-full max-w-2xl bg-slate-900/70 border-blue-900 shadow-2xl">
					<CardHeader>
						<CardTitle className="text-2xl text-slate-100 font-bold tracking-tight">
							{METHODS.find((m) => m.key === selected)?.label}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-slate-300 text-lg min-h-[80px]">
							{METHODS.find((m) => m.key === selected)?.desc}
						</div>
						<div className="mt-8 text-center text-slate-500 text-xs">
							(Tu pojawi się kalkulator i opis wybranej metody)
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

// Funkcja Stat do ewentualnego użycia:
// function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
//   return (
//     <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
//       <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
//       <div className="font-semibold text-slate-900 dark:text-slate-100">{typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : "-"} {unit}</div>
//     </div>
//   );
// }
