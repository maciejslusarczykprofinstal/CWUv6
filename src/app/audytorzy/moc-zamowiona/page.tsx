
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
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
		desc: `Obliczenia wg normy europejskiej dla instalacji ciepłej wody.\n\nFilozofia\nZamiast „wszyscy odkręcą kran na raz" norma zakłada prawdopodobieństwo jednoczesnego użycia. Im więcej mieszkań, tym mniejsza szansa, że wszyscy potrzebują wody w tym samym momencie.\n\nZastosowanie\nDoskonała do nowych budynków wielorodzinnych, hoteli, obiektów użyteczności publicznej. Mniej konserwatywna niż PN-92, ale wciąż bezpieczna.\n\nAlgorytm (skrót)\nPokaż szczegóły obliczeń\nWyznaczamy jednostki obciążenia (FU) dla każdego punktu czerpania wody (umywalka, prysznic, itd.).\nSumujemy FU: Σ FU.\nObliczamy przepływ obliczeniowy:\nq_d = k · ΣFU\ngdzie k to współczynnik (zazwyczaj 0.5).\nPrzeliczamy na moc:\nP = 1.163 · q_d · ΔT\ngdzie ΔT to różnica temperatur (°C), przyjmujemy podgrzanie od 10°C do 55°C (ΔT = 45°C).`
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
	// Mini kalkulator FU (PN-EN 806-3)

		type FUKey = "umywalki" | "zlewozmywaki" | "prysznice" | "wanny" | "zmywarki" | "pralki";
				const [flats, setFlats] = useState<number>(80);
				const [fuInputs, setFuInputs] = useState<Record<FUKey, number>>({
					umywalki: 80,
					zlewozmywaki: 80,
					prysznice: 80,
					wanny: 24,
					zmywarki: 40,
					pralki: 56,
				});
				// Zapamiętaj, które pola zostały zmienione ręcznie
				const [manual, setManual] = useState<Partial<Record<FUKey, boolean>>>({});

						useEffect(() => {
							setFuInputs(inputs => {
								const updated = { ...inputs };
								if (!manual.umywalki) updated.umywalki = flats;
								if (!manual.zlewozmywaki) updated.zlewozmywaki = flats;
								if (!manual.prysznice) updated.prysznice = flats;
								if (!manual.wanny) updated.wanny = Math.round(flats * 0.3);
								if (!manual.zmywarki) updated.zmywarki = Math.round(flats * 0.5);
								if (!manual.pralki) updated.pralki = Math.round(flats * 0.7);
								return updated;
							});
							// eslint-disable-next-line react-hooks/exhaustive-deps
						}, [flats]);
		const FU_VALUES: Record<FUKey, number> = {
			umywalki: 0.5,
			zlewozmywaki: 0.6,
			prysznice: 0.7,
			wanny: 0.8,
			zmywarki: 0.5,
			pralki: 0.5,
		};
				const fuSum = (Object.entries(fuInputs) as [FUKey, number][]).reduce((sum, [key, val]) => sum + (val * FU_VALUES[key]), 0);
				// Stałe do obliczeń
				const deltaT = 45; // 55°C - 10°C
				const qd = fuSum > 1 ? 0.5 * Math.sqrt(fuSum - 1) : 0; // przepływ obliczeniowy [l/min]
				const orderedPower = 1.163 * qd * deltaT; // moc zamówiona w kW

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
						<div className="text-slate-300 text-lg min-h-[80px] whitespace-pre-line">
							{METHODS.find((m) => m.key === selected)?.desc}
						</div>
						{/* Mini kalkulator FU tylko dla PN-EN 806-3 */}
												{selected === "pn-en-806-3" && (
													<div className="mt-8 p-6 rounded-xl bg-slate-800/80 border border-blue-900 shadow-inner">
														<h3 className="text-lg font-bold text-blue-300 mb-4">Mini kalkulator jednostek obciążenia (FU)</h3>
																		<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
																			{(Object.entries(fuInputs).filter(([key]) => key !== "pralki" && key !== "zmywarki") as [FUKey, number][]).map(([key, val]) => (
																				<div key={key} className="flex flex-col gap-1">
																					<label className="text-slate-200 font-semibold capitalize">
																						{key.charAt(0).toUpperCase() + key.slice(1)}
																						<span className="ml-2 text-xs text-blue-400">({FU_VALUES[key]} FU/szt.)</span>
																					</label>
																					<input
																						type="number"
																						min={0}
																						step={1}
																						value={val}
																						onChange={e => {
																							setFuInputs(inputs => ({ ...inputs, [key]: Number(e.target.value) }));
																							setManual(m => ({ ...m, [key]: true }));
																						}}
																						className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-blue-700 text-blue-200 font-bold text-lg focus:ring-2 focus:ring-blue-500"
																					/>
																				</div>
																			))}
																		</div>
																		<div className="mt-6 text-blue-200 text-lg font-bold text-center">
																			Suma FU: <span className="text-2xl text-blue-400">{fuSum.toFixed(2)}</span>
																		</div>
								{/* Wykres liniowy mocy zamówionej w zależności od sumy FU */}
								<div className="mt-10 bg-slate-900/80 rounded-xl p-6 border border-blue-900 shadow-inner">
									<h4 className="text-blue-300 font-bold mb-4 text-center">Moc zamówiona w zależności od sumy FU</h4>
														<ResponsiveContainer width="100%" height={260}>
															<LineChart
																data={Array.from({ length: 41 }, (_, i) => {
																	const fu = i;
																	const qd = fu > 1 ? 0.5 * Math.sqrt(fu - 1) : 0;
																	const power = 1.163 * qd * deltaT;
																	return { fu, qd, power };
																})}
																margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
															>
																<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
																<XAxis dataKey="fu" stroke="#60a5fa" label={{ value: "Suma FU", position: "insideBottom", offset: -5, fill: '#60a5fa' }} tick={{ fill: '#60a5fa', fontSize: 12 }} />
																<YAxis stroke="#60a5fa" label={{ value: "Moc zamówiona [kW]", angle: -90, position: "insideLeft", fill: '#60a5fa' }} tick={{ fill: '#60a5fa', fontSize: 12 }} />
																<Tooltip formatter={(v: number, name: string, props) => name === 'power' ? v.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " kW" : v.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " l/min"} labelFormatter={l => `Suma FU: ${l}`}/>
																<Line type="monotone" dataKey="power" stroke="#38bdf8" strokeWidth={3} dot={false} name="Moc zamówiona [kW]" />
															</LineChart>
														</ResponsiveContainer>
														<div className="text-xs text-blue-400 text-center mt-2">Wzory: <span className="font-mono">q<sub>d</sub> = 0.5·√(FU−1)</span> &nbsp; <span className="font-mono">P = 1.163·q<sub>d</sub>·ΔT</span></div>
								</div>
														<div className="mt-2 text-blue-300 text-center text-sm">
															ΔT (podgrzanie): <span className="font-bold">45°C</span> (od 10°C do 55°C)
														</div>
														<div className="mt-6 text-blue-100 text-center text-base">
															<div className="mb-1">Przepływ obliczeniowy: <span className="font-bold">q<sub>d</sub> = 0.5·√(FU−1) = {qd.toFixed(2)} l/min</span></div>
															<div className="mb-1">Moc zamówiona: <span className="font-bold text-blue-400">P = 1.163·q<sub>d</sub>·ΔT = {orderedPower.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW</span></div>
															<div className="text-xs text-blue-300 mt-2">Wzory: <span className="font-mono">q<sub>d</sub> = 0.5·√(FU−1)</span> &nbsp; <span className="font-mono">P = 1.163·q<sub>d</sub>·ΔT</span></div>
														</div>
											{/* Ilość mieszkań */}
															<div className="mt-8 flex flex-col items-center">
																<label className="text-slate-200 font-semibold mb-2">Ilość mieszkań</label>
																<input
																	type="number"
																	min={1}
																	step={1}
																	value={flats}
																	onChange={e => setFlats(Number(e.target.value))}
																	className="w-32 px-3 py-2 rounded-lg bg-slate-900 border border-blue-700 text-blue-200 font-bold text-lg focus:ring-2 focus:ring-blue-500 text-center"
																/>
															</div>
															{/* Przybliżone wartości dla ilości mieszkań */}
															{Number.isFinite(flats) && flats > 0 && (
																				<div className="mt-6 p-4 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-100 text-center">
																					<div className="font-semibold mb-1">Przybliżone wartości dla {flats} mieszkań:</div>
																					<div className="text-sm">
																						Umywalki: {flats}
																						<br />Zlewozmywaki: {flats}
																						<br />Prysznice: {flats}
																						<br />Wanny: {Math.round(flats * 0.3)}
																					</div>
																				</div>
															)}
										</div>
									)}
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
