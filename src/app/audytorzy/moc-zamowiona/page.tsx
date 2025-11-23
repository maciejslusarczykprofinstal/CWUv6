"use client";


import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { KatexFormula } from "@/components/ui/katex-formula";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Wspólna funkcja obliczająca moc zamówioną CWU

// Wspólna funkcja obliczająca moc zamówioną CWU (identyczny algorytm dla 'przed' i 'po')
function obliczMocZamowiona({
	E_dzis,
	x,
	x_po,
	t_inst,
	k_szczyt,
	bufor,
	f_u
}: {
	E_dzis: number;
	x: number; // straty [%] przed
	x_po: number; // straty [%] po
	t_inst: number;
	k_szczyt: number;
	bufor: number;
	f_u: number;
}) {
	// Zamiana na ułamki
	const x_frac = x / 100;
	const x_po_frac = x_po / 100;
	// Energia po modernizacji
	const E_po = E_dzis * (1 + x_po_frac) / (1 + x_frac);
	// Sprawność po modernizacji
	const eta_po = 1 / (1 + x_po_frac);
	// Średnia moc pierwotna
	const P_sr_prim = E_po * 277.78 / (365 * t_inst);
	// Średnia moc użyteczna
	const P_sr_uz = P_sr_prim * eta_po;
	// Moc szczytowa użyteczna
	const P_szczyt_uz = k_szczyt * P_sr_uz / f_u;
	// Moc szczytowa pierwotna
	const P_szczyt_prim = P_szczyt_uz / eta_po;
	// Moc zamówiona
	const P_zam = bufor * P_szczyt_prim;
	return {
		E_po,
		eta_po,
		P_sr_prim,
		P_sr_uz,
		P_szczyt_uz,
		P_szczyt_prim,
		P_zam
	};
}

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
			// Parametry do obliczeń mocy po modernizacji
			const [tinstMod, setTinstMod] = useState<number>(18);
			const [etaMod, setEtaMod] = useState<number>(0.55);
			const [kszczytMod, setKszczytMod] = useState<number>(1.3);
			const [buforMod, setBuforMod] = useState<number>(1.1);
			const [fu, setFu] = useState<number>(0.3);
		// Qrok oryginalny do obliczeń po modernizacji
		const [qrokOriginal, setQrokOriginal] = useState<number>(600);
	const [selected, setSelected] = useState(METHODS[0].key);
	// Mini kalkulator FU (PN-EN 806-3)
	// Straty i redukcja strat
	const [loss, setLoss] = useState<number>(74);
	const [reduction, setReduction] = useState<number>(50);

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
						{/* Opis symulacji programowej – tylko dla tej metody */}
						{selected === "symulacja-programowa" && (
							<div className="mt-8 p-6 rounded-xl bg-slate-800/80 border border-blue-900 shadow-inner text-slate-200 text-base whitespace-pre-line">
								<h3 className="text-xl font-bold text-blue-300 mb-4">Opis symulacji programowej mocy zamówionej CWU</h3>
								<ol className="list-decimal pl-6 space-y-2">
									<li>
										<b>Jakie dane potrzebujesz z rachunków?</b><br />
										<ul className="list-disc pl-6">
											<li>Zużycie energii na CWU (nie na CO!) – najlepiej miesięczne <b>Q<sub>i</sub></b> [GJ/m-c] lub roczne <b>Q<sub>rok</sub></b> [GJ/rok]</li>
											<li>Czas pracy instalacji, np. <b>t<sub>inst</sub></b> = 18 h/dobę</li>
											<li>Sprawność instalacji CWU – <b>η</b> (przyjęta lub wyliczona z danych o zużyciu wody)</li>
										</ul>
									</li>
									<li>
										<b>Jak wyznaczyć sprawność z realnych danych?</b><br />
										<ul className="list-disc pl-6">
											<li>Roczne zużycie wody ciepłej z wodomierza: <b>V<sub>rok</sub></b> [m³/rok]</li>
											<li>Temperatura CWU <b>T<sub>w</sub></b> (np. 55°C), temperatura wody zimnej <b>T<sub>c</sub></b> (np. 10°C)</li>
											<li>Energia użyteczna: <span className="font-mono">Q<sub>użyteczne</sub> [kWh] = 1,163 · V<sub>rok</sub> · (T<sub>w</sub> − T<sub>c</sub>)</span></li>
											<li>Z rachunków: <span className="font-mono">Q<sub>rach,kWh</sub> = Q<sub>rach</sub> · 277,78</span></li>
											<li>Sprawność sezonowa: <span className="font-mono">η = Q<sub>użyteczne</sub> / Q<sub>rach,kWh</sub></span></li>
										</ul>
									</li>
									<li>
										<b>Średnia moc z rachunków</b><br />
										<ul className="list-disc pl-6">
											<li>Dla każdego miesiąca: <b>Q<sub>i</sub></b> [GJ/m-c], <b>n<sub>i</sub></b> – liczba dni w miesiącu</li>
											<li>Średnia moc „na liczniku”: <span className="font-mono">P<sub>i,sr,prim</sub> [kW] = Q<sub>i</sub> · 277,78 / (n<sub>i</sub> · t<sub>inst</sub>)</span></li>
											<li>Moc użyteczna: <span className="font-mono">P<sub>i,sr,uż</sub> = P<sub>i,sr,prim</sub> · η</span></li>
											<li>Największa miesięczna średnia moc: <span className="font-mono">P<sub>mies,max,uż</sub> = max(P<sub>i,sr,uż</sub>)</span></li>
										</ul>
									</li>
									<li>
										<b>Od średniej do szczytowej</b><br />
										<ul className="list-disc pl-6">
											<li>Współczynnik „pikowania” <b>k<sub>szczyt</sub></b> (analogiczny do Nh): <span className="font-mono">P<sub>szczyt,uż</sub> = k<sub>szczyt</sub> · P<sub>mies,max,uż</sub></span></li>
											<li>Typowe wartości: z zasobnikiem 1,2–1,4; bez zasobnika 1,5–1,8</li>
										</ul>
									</li>
									<li>
										<b>Moc zamówiona po stronie dostawcy</b><br />
										<ul className="list-disc pl-6">
											<li><span className="font-mono">P<sub>szczyt,prim</sub> = P<sub>szczyt,uż</sub> / η</span></li>
											<li><span className="font-mono">P<sub>zam</sub> = 1,05 · P<sub>szczyt,prim</sub></span></li>
										</ul>
									</li>
									<li>
										<b>Szybszy wariant „od razu z roku”</b><br />
										<ul className="list-disc pl-6">
											<li><span className="font-mono">P<sub>sr,prim</sub> = Q<sub>rok</sub> · 277,78 / (365 · t<sub>inst</sub>)</span></li>
											<li><span className="font-mono">P<sub>sr,uż</sub> = P<sub>sr,prim</sub> · η</span></li>
											<li>Współczynnik wykorzystania mocy <b>f<sub>u</sub></b> (np. 0,3): <span className="font-mono">P<sub>szczyt,uż</sub> = P<sub>sr,uż</sub> / f<sub>u</sub></span></li>
											<li><span className="font-mono">P<sub>szczyt,prim</sub> = P<sub>szczyt,uż</sub> / η</span></li>
											<li><span className="font-mono">P<sub>zam</sub> ≈ 1,05 · P<sub>szczyt,prim</sub></span></li>
										</ul>
									</li>
								</ol>
								{/* Panel danych wejściowych - wariant roczny */}
								<KalkulatorMocyZamowionej />
							</div>
						)}
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
<<<<<<< HEAD
														<ResponsiveContainer width="100%" height={260}>
															<LineChart
																data={Array.from({ length: 41 }, (_, i) => {
																	const fu = i;
																	const qd = fu > 1 ? 0.5 * Math.sqrt(fu - 1) : 0;
																	const power = 1.163 * qd * deltaT;
																	return { fu, qd, power };
																})}
																margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
															>
																<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
																<XAxis dataKey="fu" stroke="#60a5fa" label={{ value: "Suma FU", position: "insideBottom", offset: -5, fill: '#60a5fa' }} tick={{ fill: '#60a5fa', fontSize: 12 }} />
																<YAxis stroke="#60a5fa" label={{ value: "Moc zamówiona [kW]", angle: -90, position: "insideLeft", fill: '#60a5fa' }} tick={{ fill: '#60a5fa', fontSize: 12 }} />
																<Tooltip formatter={(v: number, name: string, props) => name === 'power' ? v.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " kW" : v.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " l/min"} labelFormatter={l => `Suma FU: ${l}`}/>
																<Line type="monotone" dataKey="power" stroke="#38bdf8" strokeWidth={3} dot={false} name="Moc zamówiona [kW]" />
															</LineChart>
														</ResponsiveContainer>
=======
																		<ResponsiveContainer width="100%" height={260}>
																								<LineChart
																															data={(() => {
																																const xMin = 0;
																																const xMax = Math.max(40, Math.ceil(fuSum / 5) * 5, fuSum + 20);
																																return Array.from({ length: xMax - xMin + 1 }, (_, i) => {
																																	const fu = i + xMin;
																																	const qd = fu > 1 ? 0.5 * Math.sqrt(fu - 1) : 0;
																																	const power = 1.163 * qd * deltaT;
																																	return { fu, qd, power };
																																});
																															})()}
																									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
																								>
																				<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
																														<XAxis
																															dataKey="fu"
																															stroke="#60a5fa"
																															label={{ value: "Suma FU", position: "insideBottom", offset: -5, fill: '#60a5fa' }}
																															tick={{ fill: '#60a5fa', fontSize: 12 }}
																															domain={[
																																Math.max(0, fuSum - 20),
																																fuSum + 20
																															]}
																															type="number"
																														/>
																														<YAxis
																															stroke="#60a5fa"
																															label={{ value: "Moc zamówiona [kW]", angle: -90, position: "insideLeft", fill: '#60a5fa' }}
																															tick={{ fill: '#60a5fa', fontSize: 12 }}
																															domain={[0, Math.max(orderedPower * 1.2, 10)]}
																														/>
																				<Tooltip formatter={(v: number, name: string, props) => name === 'power' ? v.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " kW" : v.toLocaleString("pl-PL", { minimumFractionDigits: 2 }) + " l/min"} labelFormatter={l => `Suma FU: ${l}`}/>
																				<Line type="monotone" dataKey="power" stroke="#38bdf8" strokeWidth={3} dot={false} name="Moc zamówiona [kW]" />
																				{/* Kropka na wykresie dla aktualnej sumy FU */}
																														<Line
																															dataKey="power"
																															stroke="none"
																															dot={(props: any) => {
																																// Kropka na środku osi X
																																const centerX = 220; // połowa szerokości wykresu (przy 100% width=440px)
																																if (Math.abs(props.cx - centerX) < 6) {
																																	return (
																																		<circle
																																			cx={props.cx}
																																			cy={props.cy}
																																			r={8}
																																			fill="#fbbf24"
																																			stroke="#f59e42"
																																			strokeWidth={3}
																																			style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }}
																																		/>
																																	);
																																}
																																return <g />;
																															}}
																															legendType="none"
																														/>
																			</LineChart>
																		</ResponsiveContainer>
>>>>>>> f67f7c48a0713dba4d7a80022d1ec8069d6235fc
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
						<div className="mt-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
							<label className="mb-1 text-base text-slate-400 font-semibold">Straty obliczone w panelu Liczniki:</label>
							<div className="flex items-center gap-2 mb-2">
								<input
									type="number"
									min={0}
									max={100}
									step={0.01}
									placeholder="Wpisz wartość"
									value={loss}
									onChange={e => setLoss(Number(e.target.value))}
									className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg text-center"
								/>
								<span className="text-blue-400 font-semibold text-base">%</span>
							</div>
							<label className="mt-2 mb-1 text-base text-red-400 font-bold">REDUKCJA STRAT O</label>
							<div className="flex items-center gap-2">
								<input
									type="number"
									min={0}
									max={100}
									step={0.01}
									placeholder="Wpisz wartość"
									value={reduction}
									onChange={e => setReduction(Number(e.target.value))}
									className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-red-400 text-red-300 font-bold text-lg text-center"
								/>
								<span className="text-red-400 font-semibold text-base">%</span>
							</div>
							{/* STRATY PO MODERNIZACJI */}
							<label className="mt-4 mb-1 text-base text-green-400 font-bold">STRATY PO MODERNIZACJI</label>
							<div className="flex items-center gap-2">
								<input
									type="number"
									value={((loss * reduction) / 100).toFixed(2)}
									readOnly
									className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-green-400 text-green-300 font-bold text-lg text-center"
								/>
								<span className="text-green-400 font-semibold text-base">%</span>
							</div>


							{/* Wzór normowy PN-EN 15316-3-2 nad wynikiem */}
							<div className="w-full text-blue-300 text-xs mb-2 text-center">
								<span className="font-bold">Wzór normowy PN-EN 15316-3-2:</span><br />
								<div className="flex justify-center mt-1">
									<KatexFormula formula={"E_{po} = E_{dzis'} \\cdot \\frac{1 + x_{po}}{1 + x}"} />
								</div>
								<div className="mt-2 text-blue-200 text-xs text-left mx-auto max-w-md">
									<b>x<sub>po</sub></b> = <span className="text-green-400 font-bold">STRATY PO MODERNIZACJI</span><br />
									<b>x</b> = <span className="text-blue-400 font-bold">Straty obliczone w panelu Liczniki</span><br />
									<b>E<sub>dzis'</sub></b> = <span className="text-blue-400 font-bold">Podaj oryginalne Q<sub>rok</sub> [GJ/rok]</span><br />
									<b>E<sub>po</sub></b> = <span className="text-blue-400 font-bold">Zużycie energii na CWU (Q<sub>rok</sub>) [GJ/rok] po modernizacji</span>
								</div>
							</div>
							{/* Zużycie energii po modernizacji i moc */}
							<label className="mt-4 mb-1 text-base text-blue-400 font-bold">Zużycie energii na CWU (Q<sub>rok</sub>) [GJ/rok] po modernizacji:</label>
							<div className="flex items-center gap-2 mb-2">
											<input
												type="number"
												value={(() => {
													const x = loss;
													const x_po = (loss * reduction) / 100;
													const wyniki = obliczMocZamowiona({
														E_dzis: qrokOriginal,
														x,
														x_po,
														t_inst: tinstMod,
														k_szczyt: kszczytMod,
														bufor: buforMod,
														f_u: fu
													});
													return wyniki.E_po.toFixed(2);
												})()}
												readOnly
												className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-blue-400 text-blue-300 font-bold text-lg text-center"
											/>
											<span className="text-blue-400 font-semibold text-base">GJ/rok</span>
							</div>

							{/* Wykres liniowy E(x) */}


							<label className="mb-1 text-xs text-slate-400">Podaj E<sub>dzis'</sub> [GJ/rok]:</label>
							<div className="flex items-center gap-2 mb-2">
								<input
									type="number"
									value={qrokOriginal}
									onChange={e => setQrokOriginal(Number(e.target.value))}
									className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-blue-400 text-blue-300 font-bold text-lg text-center"
								/>
								<span className="text-blue-400 font-semibold text-base">GJ/rok</span>
							</div>
							<label className="mb-1 text-base text-blue-400 font-semibold">Moc zamówiona dla instalacji po modernizacji:</label>
							<div className="flex items-center gap-2 mb-2">
											<input
												type="number"
												value={(() => {
													const x = loss;
													const x_po = (loss * reduction) / 100;
													const wyniki = obliczMocZamowiona({
														E_dzis: qrokOriginal,
														x,
														x_po,
														t_inst: tinstMod,
														k_szczyt: kszczytMod,
														bufor: buforMod,
														f_u: fu
													});
													return wyniki.P_zam.toFixed(2);
												})()}
												readOnly
												className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-blue-400 text-blue-300 font-bold text-lg text-center"
											/>
											<span className="text-blue-400 font-semibold text-base">kW</span>
							</div>
							{/* Szczegółowy tok obliczeń z podstawieniem liczbowym – poprawiona logika i symbolika */}
							<div className="w-full bg-slate-900/80 border border-blue-700 rounded-lg p-4 mt-2 text-blue-200 text-sm">
								<div className="font-bold mb-2 text-blue-400">Szczegółowy tok obliczeń:</div>
											{(() => {
  const x = loss;
  const x_po = (loss * reduction) / 100;
	const wyniki = obliczMocZamowiona({
		E_dzis: qrokOriginal,
		x,
		x_po,
		t_inst: tinstMod,
		k_szczyt: kszczytMod,
		bufor: buforMod,
		f_u: fu
	});
  const eta_po = wyniki.eta_po;
  const P_sr_uz_po = wyniki.P_sr_prim * eta_po;
  const P_szczyt_uz_po = wyniki.P_szczyt_prim * eta_po;
  return (
    <ol className="list-decimal pl-6 space-y-2">
      <li>
        <b>E<sub>po</sub> = E<sub>dzis'</sub> · (1 + x<sub>po</sub>) / (1 + x)</b><br />
        <span className="font-mono">
          E<sub>po</sub> = {qrokOriginal} · (1 + {(x_po.toFixed(2))}%) / (1 + {(x.toFixed(2))}%) = {wyniki.E_po.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} GJ/rok
        </span>
      </li>
      <li>
        <b>P<sub>sr,prim,po</sub> = E<sub>po</sub> × 277,78 / (365 × t<sub>inst</sub>)</b><br />
        <span className="font-mono">P<sub>sr,prim,po</sub> = {wyniki.E_po.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} × 277,78 / (365 × {tinstMod}) = {wyniki.P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
      </li>
      <li>
        <b>P<sub>sr,uż,po</sub> = P<sub>sr,prim,po</sub> × η<sub>po</sub></b><br />
        <span className="font-mono">η<sub>po</sub> = 1 / (1 + x<sub>po</sub>) = {eta_po.toLocaleString("pl-PL", { maximumFractionDigits: 4 })}<br />
        P<sub>sr,uż,po</sub> = {wyniki.P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} × {eta_po.toLocaleString("pl-PL", { maximumFractionDigits: 4 })} = {P_sr_uz_po.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
      </li>
      <li>
        <b>P<sub>szczyt,prim,po</sub> = k<sub>szczyt</sub> × P<sub>sr,prim,po</sub></b><br />
        <span className="font-mono">P<sub>szczyt,prim,po</sub> = {kszczytMod} × {wyniki.P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} = {wyniki.P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
      </li>
      <li>
        <b>P<sub>szczyt,uż,po</sub> = P<sub>szczyt,prim,po</sub> × η<sub>po</sub></b><br />
        <span className="font-mono">P<sub>szczyt,uż,po</sub> = {wyniki.P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} × {eta_po.toLocaleString("pl-PL", { maximumFractionDigits: 4 })} = {P_szczyt_uz_po.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
      </li>
      <li>
        <b>P<sub>zam,po</sub> = bufor × P<sub>szczyt,prim,po</sub></b><br />
        <span className="font-mono">P<sub>zam,po</sub> = {buforMod} × {wyniki.P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} = <span className="font-bold text-blue-400">{wyniki.P_zam.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span></span>
      </li>
    </ol>
  );
})()}
							</div>
							<div className="grid grid-cols-2 gap-2 mb-2">
								<div>
									<label className="text-xs text-slate-400">t<sub>inst</sub> [h/dobę]</label>
									<input type="number" min={1} step={1} value={tinstMod} onChange={e => setTinstMod(Number(e.target.value))} className="w-full px-2 py-1 rounded bg-slate-800 border border-blue-400 text-blue-300 font-bold text-sm text-center" />
								</div>
								<div>
									<label className="text-xs text-slate-400">η<sub>po</sub> (sprawność po modernizacji)</label>
									<input type="number" value={(() => {
										const x_po = (loss * reduction) / 10000;
										return (1 / (1 + x_po)).toLocaleString("pl-PL", { maximumFractionDigits: 4 });
									})()} readOnly className="w-full px-2 py-1 rounded bg-slate-800 border border-blue-400 text-blue-300 font-bold text-sm text-center" />
								</div>
								<div>
									<label className="text-xs text-slate-400">k<sub>szczyt</sub></label>
									<input type="number" min={1} max={2} step={0.01} value={kszczytMod} onChange={e => setKszczytMod(Number(e.target.value))} className="w-full px-2 py-1 rounded bg-slate-800 border border-blue-400 text-blue-300 font-bold text-sm text-center" />
								</div>
								<div>
									<label className="text-xs text-slate-400">Bufor</label>
									<input type="number" min={1} max={1.2} step={0.01} value={buforMod} onChange={e => setBuforMod(Number(e.target.value))} className="w-full px-2 py-1 rounded bg-slate-800 border border-blue-400 text-blue-300 font-bold text-sm text-center" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

// Funkcja Stat do ewentualnego użycia:
// Interaktywny kalkulator symulacji programowej
// ...usunięto podwójny import useState...

function CwuSimulationCalculator() {
	// Dane wejściowe
	const [Qi, setQi] = useState<number>(12); // energia na CWU [GJ/m-c]
	const [ni, setNi] = useState<number>(30); // liczba dni w miesiącu
	const [tinst, setTinst] = useState<number>(18); // czas pracy instalacji [h/dobę]
	const [eta, setEta] = useState<number>(0.55); // sprawność instalacji
	const [kszczyt, setKszczyt] = useState<number>(1.3); // współczynnik pikowania
	const [bufor, setBufor] = useState<number>(1.05); // bufor mocy zamówionej

	// Obliczenia
	const Qrach_kWh = Qi * 277.78;
	const Pi_sr_prim = Qrach_kWh / (ni * tinst);
	const Pi_sr_uz = Pi_sr_prim * eta;
	const Pmies_max_uz = Pi_sr_uz; // dla uproszczenia: 1 miesiąc
	const Pszczyt_uz = kszczyt * Pmies_max_uz;
	const Pszczyt_prim = Pszczyt_uz / eta;
	const Pzam = bufor * Pszczyt_prim;

	return (
		<div className="space-y-6">
			<form className="grid gap-4 md:grid-cols-2 mb-6">
				<div>
					<label className="font-semibold">Zużycie energii na CWU (Q<sub>i</sub>) [GJ/m-c]</label>
					<input type="number" value={Qi} min={0.1} step={0.01} onChange={e => setQi(Number(e.target.value))} className="input w-full mt-1" />
				</div>
				<div>
					<label className="font-semibold">Liczba dni w miesiącu (n<sub>i</sub>)</label>
					<input type="number" value={ni} min={1} step={1} onChange={e => setNi(Number(e.target.value))} className="input w-full mt-1" />
				</div>
				<div>
					<label className="font-semibold">Czas pracy instalacji (t<sub>inst</sub>) [h/dobę]</label>
					<input type="number" value={tinst} min={1} step={1} onChange={e => setTinst(Number(e.target.value))} className="input w-full mt-1" />
				</div>
				<div>
					<label className="font-semibold">Sprawność instalacji (η)</label>
					<input type="number" value={eta} min={0.1} max={1} step={0.01} onChange={e => setEta(Number(e.target.value))} className="input w-full mt-1" />
				</div>
				<div>
					<label className="font-semibold">Współczynnik pikowania (k<sub>szczyt</sub>)</label>
					<input type="number" value={kszczyt} min={1} max={2} step={0.01} onChange={e => setKszczyt(Number(e.target.value))} className="input w-full mt-1" />
				</div>
				<div>
					<label className="font-semibold">Bufor mocy zamówionej</label>
					<input type="number" value={bufor} min={1} max={1.2} step={0.01} onChange={e => setBufor(Number(e.target.value))} className="input w-full mt-1" />
				</div>
			</form>
			<div className="mt-4">
				<h4 className="text-lg font-bold text-blue-300 mb-2">Wyniki kalkulacji</h4>
				<table className="min-w-full text-sm border rounded-xl overflow-hidden bg-slate-900 shadow">
					<tbody>
						<tr><td className="px-3 py-2 font-semibold">Q<sub>rach,kWh</sub></td><td className="px-3 py-2">{Qrach_kWh.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kWh</td></tr>
						<tr><td className="px-3 py-2 font-semibold">P<sub>i,sr,prim</sub></td><td className="px-3 py-2">{Pi_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
						<tr><td className="px-3 py-2 font-semibold">P<sub>i,sr,uż</sub></td><td className="px-3 py-2">{Pi_sr_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
						<tr><td className="px-3 py-2 font-semibold">P<sub>mies,max,uż</sub></td><td className="px-3 py-2">{Pmies_max_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
						<tr><td className="px-3 py-2 font-semibold">P<sub>szczyt,uż</sub></td><td className="px-3 py-2">{Pszczyt_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
						<tr><td className="px-3 py-2 font-semibold">P<sub>szczyt,prim</sub></td><td className="px-3 py-2">{Pszczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
						<tr><td className="px-3 py-2 font-semibold font-bold text-blue-300">Moc zamówiona P<sub>zam</sub></td><td className="px-3 py-2 font-bold text-blue-300">{Pzam.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td></tr>
					</tbody>
				</table>
				<div className="mt-4 p-4 rounded-lg bg-slate-800/70 border border-blue-700 text-blue-200 text-sm">
					<div className="font-bold mb-2 text-blue-400">Wzory użyte w kalkulacji:</div>
					<div className="font-mono leading-relaxed">
						P<sub>sr,prim</sub> = Q<sub>rok</sub> · 277,78 / (365 · t<sub>inst</sub>)<br />
						P<sub>sr,uż</sub> = P<sub>sr,prim</sub> · η<br />
						P<sub>szczyt,uż</sub> = P<sub>sr,uż</sub> / f<sub>u</sub><br />
						P<sub>szczyt,prim</sub> = P<sub>szczyt,uż</sub> / η<br />
						P<sub>zam</sub> ≈ 1,05 · P<sub>szczyt,prim</sub>
					</div>
				</div>
			</div>
		</div>
	);
}

// Kalkulator mocy zamówionej na podstawie danych rocznych
function KalkulatorMocyZamowionej() {
	const [qrok, setQrok] = useState(600); // GJ/rok
  const [tinst, setTinst] = useState(18); // h/dobę
  const [eta, setEta] = useState(0.55);
  const [fu, setFu] = useState(0.3);
  const [kszczyt, setKszczyt] = useState(1.3);
	const [bufor, setBufor] = useState(1.1);

  // Poprawione obliczenia: eta wpływa na wynik końcowy
  // P_sr,prim = Q_rok * 277,78 / (365 * t_inst)
  const P_sr_prim = qrok * 277.78 / (365 * tinst);
  // P_sr,uż = P_sr,prim * eta
  const P_sr_uz = P_sr_prim * eta;
  // P_szczyt,uż = k_szczyt * P_sr,uż / f_u
  const P_szczyt_uz = kszczyt * P_sr_uz / fu;
  // P_szczyt,prim = P_szczyt,uż / eta
  const P_szczyt_prim = P_szczyt_uz / eta;
  // P_zam ≈ bufor · P_szczyt,prim
  const P_zam = bufor * P_szczyt_prim;

  return (
    <div className="mt-8 p-6 rounded-xl bg-slate-900/80 border border-blue-700 shadow-inner">
      <h4 className="text-lg font-bold text-blue-400 mb-4">Dane wejściowe do obliczeń (roczne)</h4>
      <form className="grid gap-4 md:grid-cols-2 mb-6">
        <div>
          <label className="font-semibold">Zużycie energii na CWU (Q<sub>rok</sub>) [GJ/rok]</label>
          <input type="number" min={0.1} step={0.01} value={qrok} onChange={e => setQrok(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </div>
				{/* Szczegółowy opis obliczeń krok po kroku */}
				<div className="mt-6 p-4 rounded-lg bg-slate-900/70 border border-blue-800 text-blue-100 text-sm">
					<div className="font-bold mb-2 text-blue-400">Szczegółowy tok obliczeń:</div>
					<ol className="list-decimal pl-6 space-y-2">
						<li>
							<b>Obliczenie średniej mocy pierwotnej:</b><br />
							<span className="font-mono">P<sub>sr,prim</sub> = Q<sub>rok</sub> · 277,78 / (365 · t<sub>inst</sub>)</span><br />
							<span className="font-mono">P<sub>sr,prim</sub> = {qrok} · 277,78 / (365 · {tinst}) = {P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
						</li>
						<li>
							<b>Obliczenie średniej mocy użytecznej:</b><br />
							<span className="font-mono">P<sub>sr,uż</sub> = P<sub>sr,prim</sub> · η</span><br />
							<span className="font-mono">P<sub>sr,uż</sub> = {P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} · {eta} = {P_sr_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
						</li>
						<li>
							<b>Obliczenie mocy szczytowej użytecznej:</b><br />
							<span className="font-mono">P<sub>szczyt,uż</sub> = k<sub>szczyt</sub> · P<sub>sr,uż</sub> / f<sub>u</sub></span><br />
							<span className="font-mono">P<sub>szczyt,uż</sub> = {kszczyt} · {P_sr_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} / {fu} = {P_szczyt_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
						</li>
						<li>
							<b>Obliczenie mocy szczytowej pierwotnej:</b><br />
							<span className="font-mono">P<sub>szczyt,prim</sub> = P<sub>szczyt,uż</sub> / η</span><br />
							<span className="font-mono">P<sub>szczyt,prim</sub> = {P_szczyt_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} / {eta} = {P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
						</li>
						<li>
							<b>Obliczenie mocy zamówionej:</b><br />
							<span className="font-mono">P<sub>zam</sub> = bufor · P<sub>szczyt,prim</sub></span><br />
							<span className="font-mono">P<sub>zam</sub> = {bufor} · {P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} = {P_zam.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</span>
						</li>
					</ol>
				</div>
        <div>
          <label className="font-semibold">Czas pracy instalacji (t<sub>inst</sub>) [h/dobę]</label>
          <input type="number" min={1} step={1} value={tinst} onChange={e => setTinst(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </div>
        <div>
          <label className="font-semibold">Sprawność instalacji (η)</label>
          <input type="number" min={0.1} max={1} step={0.01} value={eta} onChange={e => setEta(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </div>
        <div>
          <label className="font-semibold">Współczynnik wykorzystania mocy (f<sub>u</sub>)</label>
          <input type="number" min={0.1} max={1} step={0.01} value={fu} onChange={e => setFu(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </div>
        <div>
          <label className="font-semibold">Współczynnik pikowania (k<sub>szczyt</sub>)</label>
          <input type="number" min={1} max={2} step={0.01} value={kszczyt} onChange={e => setKszczyt(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </div>
        <div>
		  <label className="font-semibold">Bufor mocy zamówionej <span className="text-xs text-blue-400">(%)</span></label>
          <input type="number" min={1} max={1.2} step={0.01} value={bufor} onChange={e => setBufor(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-blue-700 text-blue-200 font-bold text-lg" />
        </div>
      </form>
      <div className="mt-6">
        <h5 className="text-blue-300 font-bold mb-2">Wyniki kalkulacji</h5>
        <table className="min-w-full text-sm border rounded-xl overflow-hidden bg-slate-900 shadow">
          <tbody>
						<tr>
							<td className="px-3 py-2 font-semibold">P<sub>sr,prim</sub></td>
							<td className="px-3 py-2">{P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td>
						</tr>
						<tr>
							<td colSpan={2} className="px-3 pb-2 pt-0 text-xs text-blue-300 font-mono">
								P<sub>sr,prim</sub> = Q<sub>rok</sub> · 277,78 / (365 · t<sub>inst</sub>)<br />
								P<sub>sr,prim</sub> = {qrok} · 277,78 / (365 · {tinst}) = {P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW
							</td>
						</tr>
						<tr>
							<td className="px-3 py-2 font-semibold">P<sub>sr,uż</sub></td>
							<td className="px-3 py-2">{P_sr_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td>
						</tr>
						<tr>
							<td colSpan={2} className="px-3 pb-2 pt-0 text-xs text-blue-300 font-mono">
								P<sub>sr,uż</sub> = P<sub>sr,prim</sub> · η<br />
								P<sub>sr,uż</sub> = {P_sr_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} · {eta} = {P_sr_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW
							</td>
						</tr>
						<tr>
							<td className="px-3 py-2 font-semibold">P<sub>szczyt,uż</sub></td>
							<td className="px-3 py-2">{P_szczyt_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td>
						</tr>
						<tr>
							<td colSpan={2} className="px-3 pb-2 pt-0 text-xs text-blue-300 font-mono">
								P<sub>szczyt,uż</sub> = k<sub>szczyt</sub> · P<sub>sr,uż</sub> / f<sub>u</sub><br />
								P<sub>szczyt,uż</sub> = {kszczyt} · {P_sr_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} / {fu} = {P_szczyt_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW
							</td>
						</tr>
						<tr>
							<td className="px-3 py-2 font-semibold">P<sub>szczyt,prim</sub></td>
							<td className="px-3 py-2">{P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td>
						</tr>
						<tr>
							<td colSpan={2} className="px-3 pb-2 pt-0 text-xs text-blue-300 font-mono">
								P<sub>szczyt,prim</sub> = P<sub>szczyt,uż</sub> / η<br />
								P<sub>szczyt,prim</sub> = {P_szczyt_uz.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} / {eta} = {P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW
							</td>
						</tr>
						<tr>
							<td className="px-3 py-2 font-semibold font-bold text-blue-300">Moc zamówiona P<sub>zam</sub></td>
							<td className="px-3 py-2 font-bold text-blue-300">{P_zam.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW</td>
						</tr>
						<tr>
							<td colSpan={2} className="px-3 pb-2 pt-0 text-xs text-blue-300 font-mono">
								P<sub>zam</sub> = bufor · P<sub>szczyt,prim</sub><br />
								P<sub>zam</sub> = {bufor} · {P_szczyt_prim.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} = {P_zam.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} kW
							</td>
						</tr>
          </tbody>
        </table>
        <div className="mt-4 p-4 rounded-lg bg-slate-800/70 border border-blue-700 text-blue-200 text-sm">
          <div className="font-bold mb-2 text-blue-400">Wzory użyte w kalkulacji:</div>
          <div className="font-mono leading-relaxed">
            P<sub>sr,prim</sub> = Q<sub>rok</sub> · 277,78 / (365 · t<sub>inst</sub>)<br />
            P<sub>sr,uż</sub> = P<sub>sr,prim</sub> · η<br />
            P<sub>szczyt,uż</sub> = k<sub>szczyt</sub> · P<sub>sr,uż</sub> / f<sub>u</sub><br />
            P<sub>szczyt,prim</sub> = P<sub>szczyt,uż</sub> / η<br />
            P<sub>zam</sub> ≈ bufor · P<sub>szczyt,prim</sub>
          </div>
        </div>
      </div>
    </div>
  );
}
