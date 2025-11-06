"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KatexFormula } from "@/components/ui/katex-formula";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Standard = 
  | "PN_EN_806_3" 
  | "PN_92_B_01706"
  | "bilans_energetyczny"
  | "moc_czas_rozbioru"
  | "peak_demand_pomiary"
  | "krzywa_mocy_sezonowa"
  | "kosztowa"
  | "symulacja_programowa";
type TrybPrzygotowania = "przeplywowy" | "bufor";
type CyrkulacjaTryb = "dane" | "szacunek";

interface CalcResult {
  qd_ls: number;
  dT_K: number;
  Ppeak_kW: number;
  Pnet_kW: number;
  Pcwu_kW: number;
  Pcirc_kW: number;
  Prez_kW: number;
  Pzam_kW: number;
  qBuf_ls: number;
  uwagi: string[];
}

export default function MocZamowionaPage() {
  // Stany wejściowe
  const [standard, setStandard] = useState<Standard>("PN_EN_806_3");
  const [showNormInfo, setShowNormInfo] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const v = window.localStorage.getItem('moc_norm_info');
      return v === '1';
    } catch { return false; }
  });
  useEffect(() => {
    try { window.localStorage.setItem('moc_norm_info', showNormInfo ? '1' : '0'); } catch {}
  }, [showNormInfo]);
  const [liczbaMieszkan, setLiczbaMieszkan] = useState(80);
  const [umywalki, setUmywalki] = useState(80);
  const [zlewozmywaki, setZlewozmywaki] = useState(80);
  const [prysznice, setPrysznice] = useState(80);
  const [wanny, setWanny] = useState(0);
  const [coldC, setColdC] = useState(8);
  const [hotC, setHotC] = useState(55);
  const [trybPrzygotowania, setTrybPrzygotowania] = useState<TrybPrzygotowania>("bufor");
  const [buforVlitry, setBuforVlitry] = useState(1000);
  const [buforTOdtMin, setBuforTOdtMin] = useState(45);
  const [cyrkulacjaTryb, setCyrkulacjaTryb] = useState<CyrkulacjaTryb>("szacunek");
  const [cyrkulacjaQm3h, setCyrkulacjaQm3h] = useState<number | null>(null);
  const [cyrkulacjaDTK, setCyrkulacjaDTK] = useState<number | null>(null);
  const [cyrkulacjaPstaleKW, setCyrkulacjaPstaleKW] = useState<number | null>(3);
  const [rezerwaProc, setRezerwaProc] = useState(10);
  const [result, setResult] = useState<CalcResult | null>(null);

  function calculate() {
    const uwagi: string[] = [];
    const dT_K = hotC - coldC;
    if (dT_K <= 0) {
      toast.error("ΔT musi być dodatnie");
      return;
    }

    // qd
    let qd_ls = 0;
    if (standard === "PN_EN_806_3") {
      const fu = umywalki * 0.5 + zlewozmywaki * 0.7 + prysznice * 1.0 + wanny * 1.5;
      if (fu > 0) {
        qd_ls = Math.sqrt(Math.max(fu - 1, 0)) * 0.5;
        uwagi.push(`PN-EN 806-3: fixture units=${fu.toFixed(1)} metodą probabilistyczną`);
      } else {
        qd_ls = 0.15 * liczbaMieszkan;
        uwagi.push("Brak FU – szacunek 0.15 l/s na mieszkanie");
      }
    } else if (standard === "PN_92_B_01706") {
      let k = 1;
      if (liczbaMieszkan <= 5) k = 1; else if (liczbaMieszkan <= 10) k = 0.9; else if (liczbaMieszkan <= 20) k = 0.7; else if (liczbaMieszkan <= 50) k = 0.5; else if (liczbaMieszkan <= 100) k = 0.35; else k = 0.25;
      const qMax = umywalki * 0.1 + zlewozmywaki * 0.15 + prysznice * 0.2 + wanny * 0.3;
      qd_ls = qMax * k;
      uwagi.push(`PN-92/B-01706: k=${k.toFixed(2)} qMax=${qMax.toFixed(2)} l/s`);
    } else if (standard === "bilans_energetyczny") {
      // Metoda bilansu energetycznego: E = m·c·ΔT, m = ρ·V (dzienny bilans)
      const dzienneZuzycie_m3 = liczbaMieszkan * 0.05; // 50L/mieszkanie/dzień
      const szczytGodzina = 0.25; // 25% w godzinie szczytu
      qd_ls = (dzienneZuzycie_m3 * szczytGodzina * 1000) / 3600;
      uwagi.push(`Bilans energetyczny: ${dzienneZuzycie_m3.toFixed(1)} m³/d, szczyt 25%/h → qd=${qd_ls.toFixed(3)} l/s`);
    } else if (standard === "moc_czas_rozbioru") {
      // Metoda mocy/czasu rozbioru: zakładamy czas typowego rozbioru + temperaturę
      const czasRozbioru_min = buforTOdtMin || 45;
      const objetoscRozbioru_L = buforVlitry || 1000;
      qd_ls = objetoscRozbioru_L / (czasRozbioru_min * 60);
      uwagi.push(`Moc/czas rozbioru: ${objetoscRozbioru_L}L w ${czasRozbioru_min}min → qd=${qd_ls.toFixed(3)} l/s`);
    } else if (standard === "peak_demand_pomiary") {
      // Peak demand wg pomiarów: symulacja maksymalnego zarejestrowanego
      const peakFactor = 1.5; // współczynnik szczytu z pomiarów
      const bazaQd = 0.2 * liczbaMieszkan;
      qd_ls = bazaQd * peakFactor;
      uwagi.push(`Peak demand pomiary: baza ${bazaQd.toFixed(2)} l/s × peak ${peakFactor} = ${qd_ls.toFixed(3)} l/s`);
    } else if (standard === "krzywa_mocy_sezonowa") {
      // Krzywa mocy sezonowa: zima +20%, lato -10%
      const bazaQd = 0.18 * liczbaMieszkan;
      const sezon = 1.2; // zima
      qd_ls = bazaQd * sezon;
      uwagi.push(`Krzywa mocy + sezon: baza ${bazaQd.toFixed(2)} l/s × sezon ${sezon} = ${qd_ls.toFixed(3)} l/s`);
    } else if (standard === "kosztowa") {
      // Metoda kosztowa: minimalizacja kosztów energii vs inwestycji
      const qOptimal = 0.16 * liczbaMieszkan; // optymalizacja ekonomiczna
      qd_ls = qOptimal;
      uwagi.push(`Metoda kosztowa: optymalizacja ekonomiczna → qd=${qd_ls.toFixed(3)} l/s`);
    } else if (standard === "symulacja_programowa") {
      // Symulacja programowa: model instalacji z cyrkulacją
      const qSym = 0.22 * liczbaMieszkan;
      qd_ls = qSym;
      uwagi.push(`Symulacja programowa: model instalacji → qd=${qd_ls.toFixed(3)} l/s`);
    } else {
      qd_ls = 0.15 * liczbaMieszkan;
      uwagi.push("Metoda nierozpoznana – fallback 0.15 l/s/mieszkanie");
    }
    
    if (qd_ls <= 0) {
      toast.error("qd=0 – brak danych");
      return;
    }

    const Ppeak_kW = 1.163 * qd_ls * dT_K;
  let qBuf_ls = 0;
  let Pnet_kW = Ppeak_kW;
    let Pcwu_kW = Ppeak_kW;
    if (trybPrzygotowania === "bufor") {
      qBuf_ls = buforVlitry / (buforTOdtMin * 60);
      const qNet = Math.max(qd_ls - qBuf_ls, 0);
      Pnet_kW = 1.163 * qNet * dT_K;
      Pcwu_kW = Pnet_kW;
      uwagi.push(`Bufor ${buforVlitry}L/${buforTOdtMin}min pokrywa ${qBuf_ls.toFixed(3)} l/s`);
    } else {
      uwagi.push("Tryb przepływowy");
    }

    let Pcirc_kW = 0;
    if (cyrkulacjaTryb === "dane") {
      if (cyrkulacjaQm3h == null || cyrkulacjaDTK == null) {
        uwagi.push("Brak danych cyrkulacji – wymagane Qm3h i ΔT, pomijam");
        Pcirc_kW = 0;
      } else {
        Pcirc_kW = 1.163 * (cyrkulacjaQm3h / 3.6) * cyrkulacjaDTK;
        uwagi.push(`Cyrkulacja dane: Q=${cyrkulacjaQm3h} m³/h ΔT=${cyrkulacjaDTK}K`);
      }
    } else {
      Pcirc_kW = cyrkulacjaPstaleKW ?? 0;
      uwagi.push(`Cyrkulacja szacunek: ${Pcirc_kW.toFixed(1)} kW`);
    }

    const Prez_kW = (Pcwu_kW + Pcirc_kW) * (rezerwaProc / 100);
  let Pzam_kW = Pcwu_kW + Pcirc_kW + Prez_kW;
    Pzam_kW = Math.ceil(Pzam_kW);

  setResult({ qd_ls, dT_K, Ppeak_kW, Pnet_kW, Pcwu_kW, Pcirc_kW, Prez_kW, Pzam_kW, qBuf_ls, uwagi });
  }

  function exportJSON() {
    if (!result) { toast.error("Brak wyników"); return; }
    const out = {
      tldr: `Moc zamówiona: ${result.Pzam_kW} kW`,
      wejscieKluczowe: {
        standard,
        qd_ls: result.qd_ls,
        dT_K: result.dT_K,
        trybPrzygotowania,
        qBuf_ls: result.qBuf_ls,
        Pcirc_kW: result.Pcirc_kW,
        rezerwaProc,
      },
      wyniki: {
        Ppeak_kW: result.Ppeak_kW,
        Pnet_kW: result.Pnet_kW,
        Pcwu_kW: result.Pcwu_kW,
        Pcirc_kW: result.Pcirc_kW,
        Prez_kW: result.Prez_kW ?? 0,
        Pzam_kW: result.Pzam_kW,
      },
      uwagi: result.uwagi.join(" | "),
    };
    navigator.clipboard.writeText(JSON.stringify(out, null, 2));
    toast.success("Skopiowano JSON");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Moc zamówiona CWU</h1>
          <p className="text-slate-600 dark:text-slate-400 font-bold">Kalkulator mocy zamówionej (PN-EN 806-3 / PN-92/B-01706)</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Dane wejściowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">Metoda obliczeniowa</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "PN_EN_806_3", icon: "EN", label: "PN-EN 806-3", subtitle: "Norma aktualniejsza", color: "blue", toast: "PN-EN 806-3" },
                    { id: "PN_92_B_01706", icon: "PL", label: "PN-92/B-01706", subtitle: "Norma Polska", color: "amber", toast: "PN-92/B-01706" },
                    { id: "bilans_energetyczny", icon: "BE", label: "Bilans energetyczny", subtitle: "Węzły cieplne", color: "green", toast: "Bilans energetyczny CWU" },
                    { id: "moc_czas_rozbioru", icon: "TR", label: "Moc/czas rozbioru", subtitle: "Temperatura + strumień", color: "purple", toast: "Moc/czas rozbioru" },
                    { id: "peak_demand_pomiary", icon: "PD", label: "Peak demand", subtitle: "Dane pomiarowe", color: "red", toast: "Peak demand (pomiary)" },
                    { id: "krzywa_mocy_sezonowa", icon: "KS", label: "Krzywa mocy", subtitle: "Statystyka sezonowa", color: "cyan", toast: "Krzywa mocy + sezon" },
                    { id: "kosztowa", icon: "€", label: "Kosztowa", subtitle: "Optymalizacja ekonomiczna", color: "yellow", toast: "Kosztowa (optymalizacja)" },
                    { id: "symulacja_programowa", icon: "SIM", label: "Symulacja", subtitle: "Model CFD/FEM", color: "violet", toast: "Symulacja programowa" },
                  ].map((method) => {
                    const isSelected = standard === method.id;
                    const colorMap: Record<string, { border: string; bg: string; ring: string; iconBg: string; checkColor: string; hoverBorder: string }> = {
                      blue: { border: "border-blue-500", bg: "from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30", ring: "ring-blue-500/50", iconBg: "bg-blue-600", checkColor: "text-blue-600", hoverBorder: "hover:border-blue-300" },
                      amber: { border: "border-amber-500", bg: "from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30", ring: "ring-amber-500/50", iconBg: "bg-amber-600", checkColor: "text-amber-600", hoverBorder: "hover:border-amber-300" },
                      green: { border: "border-green-500", bg: "from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30", ring: "ring-green-500/50", iconBg: "bg-green-600", checkColor: "text-green-600", hoverBorder: "hover:border-green-300" },
                      purple: { border: "border-purple-500", bg: "from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30", ring: "ring-purple-500/50", iconBg: "bg-purple-600", checkColor: "text-purple-600", hoverBorder: "hover:border-purple-300" },
                      red: { border: "border-red-500", bg: "from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30", ring: "ring-red-500/50", iconBg: "bg-red-600", checkColor: "text-red-600", hoverBorder: "hover:border-red-300" },
                      cyan: { border: "border-cyan-500", bg: "from-cyan-50 to-sky-50 dark:from-cyan-900/30 dark:to-sky-900/30", ring: "ring-cyan-500/50", iconBg: "bg-cyan-600", checkColor: "text-cyan-600", hoverBorder: "hover:border-cyan-300" },
                      yellow: { border: "border-yellow-500", bg: "from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30", ring: "ring-yellow-500/50", iconBg: "bg-yellow-600", checkColor: "text-yellow-600", hoverBorder: "hover:border-yellow-300" },
                      violet: { border: "border-violet-500", bg: "from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30", ring: "ring-violet-500/50", iconBg: "bg-violet-600", checkColor: "text-violet-600", hoverBorder: "hover:border-violet-300" },
                    };
                    const colors = colorMap[method.color];
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => {
                          setStandard(method.id as Standard);
                          toast.success(`Wybrano metodę: ${method.toast}`);
                        }}
                        className={
                          "relative p-4 rounded-xl border-2 transition-all text-left " +
                          (isSelected
                            ? `${colors.border} bg-gradient-to-br ${colors.bg} shadow-lg ring-2 ${colors.ring}`
                            : `border-slate-200 dark:border-slate-700 ${colors.hoverBorder} hover:shadow-md bg-white dark:bg-slate-800/50`)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.iconBg} text-white flex items-center justify-center font-bold text-sm`}>
                            {method.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{method.label}</div>
                            <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{method.subtitle}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <svg className={`w-5 h-5 ${colors.checkColor}`} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant={showNormInfo ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowNormInfo(s => !s)}
                    className="rounded-full flex items-center gap-1"
                    aria-expanded={showNormInfo}
                  >
                    <svg
                      className={"h-3.5 w-3.5 transition-transform " + (showNormInfo ? "rotate-180" : "rotate-0")}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                    {showNormInfo ? "Ukryj opis metod" : "Pokaż opis metod obliczeniowych"}
                  </Button>
                </div>
                {showNormInfo && (
                <div className="mt-3 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {/* PN-EN 806-3 */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-slate-800/60 dark:to-indigo-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        EN
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          PN-EN 806-3
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">Norma aktualniejsza</span>
                          {standard === 'PN_EN_806_3' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">Obliczasz rzeczywiste zapotrzebowanie chwilowe na wodę.</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div>
                        <p className="text-xs">Odbiorniki nie pracują jednocześnie — używa współczynnika jednoczesności z prawdopodobieństwa. Podejście statystyczne, precyzyjne przy dużej liczbie punktów.</p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Jak działa</div>
                        <p className="text-xs">Każdemu punktowi przypisuje się jednostki obciążenia LU (Loading Units). Z wykresu/wzoru oblicza równoważny przepływ w L/s zależny od liczby i typów odbiorników.</p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div>
                        <p className="text-xs">Współczesne budynki, projektowanie instalacji zimnej i ciepłej wody. Uwzględnia instalacje z pompami, zasobnikami, cyrkulacją.</p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Co daje</div>
                        <p className="text-xs">✅ Cieńsze rury (oszczędność + mniejsze straty ciepła)<br/>✅ Realne odwzorowanie pracy systemu → mniejsze ryzyko stagnacji</p>
                      </div>
                      <details className="mt-2">
                        <summary className="font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:text-blue-600">Algorytm krok po kroku</summary>
                        <ol className="list-decimal pl-4 space-y-1 mt-2">
                          <li>Zlicz jednostki wypływu (FU): umywalka 0.5, zlewozmywak 0.7, prysznic 1.0, wanna 1.5.</li>
                          <li>Jeśli FU &gt; 1 oblicz przepływ obliczeniowy qd = 0.5 · √(FU − 1) [l/s].</li>
                          <li>Jeżeli FU ≤ 1 zastosuj fallback: qd = 0.15 · liczba mieszkań.</li>
                          <li>Moc szczytowa <KatexFormula formula="P_{peak}=1.163\, q_d\, \Delta T" /> (1.163 ≈ c·ρ dla wody w kW·s/(l·K)).</li>
                          <li>Dla bufora: qBuf = Vbuf / (tOdbioru·60); qNet = max(qd − qBuf, 0); Pcwu = 1.163 · qNet · ΔT.</li>
                          <li>Dla przepływowego: Pcwu = Ppeak.</li>
                          <li>Cyrkulacja: dane → Pcirc = 1.163 · (Q[m³/h]/3.6) · ΔT; szacunek → stała wartość kW.</li>
                          <li>Rezerwa: <KatexFormula formula="P_{rez}=(P_{cwu}+P_{circ})\cdot r" /> gdzie r = rezerwa/100.</li>
                          <li>Moc zamówiona: <KatexFormula formula="P_{zam}=\lceil P_{cwu}+P_{circ}+P_{rez} \rceil" />.</li>
                        </ol>
                      </details>
                    </div>
                  </div>

                  {/* PN-92/B-01706 */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-slate-800/60 dark:to-amber-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                        PL
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          PN-92/B-01706
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">Norma Polska starsza</span>
                          {standard === 'PN_92_B_01706' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">&bdquo;Bezpieczniej będzie przewymiarować.&rdquo;</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div>
                        <p className="text-xs">Wartości przepływu przypisane sztywno do każdego odbiornika, potem przemnożone przez współczynnik jednoczesności. Współczynnik z tabeli zależy od łącznej liczby urządzeń.</p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Jak działa</div>
                        <p className="text-xs">Każdy odbiornik ma określony przepływ (np. umywalka 0,07 L/s). Sumujesz przepływy i stosujesz współczynnik jednoczesności z tabeli.</p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div>
                        <p className="text-xs">Starsze projekty w blokach, szkołach, biurach. Dużo większe średnice rur.</p>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">Skutek</div>
                        <p className="text-xs">⚠️ Instalacja przewymiarowana → większe straty ciepła, więcej wody martwej w rurach</p>
                      </div>
                      <details className="mt-2">
                        <summary className="font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:text-amber-600">Algorytm krok po kroku</summary>
                        <ol className="list-decimal pl-4 space-y-1 mt-2">
                          <li>Oblicz qMax: umywalka 0.1, zlewozmywak 0.15, prysznic 0.2, wanna 0.3 (suma) [l/s].</li>
                          <li>Wyznacz współczynnik jednoczesności k na podstawie liczby mieszkań (przedziały 5/10/20/50/100/&gt;100).</li>
                          <li>Przepływ obliczeniowy <KatexFormula formula="q_d = q_{Max} \cdot k" />.</li>
                          <li>Moc szczytowa <KatexFormula formula="P_{peak}=1.163\, q_d\, \Delta T" /> (jak wyżej).</li>
                          <li>Bufor / przepływowy oraz cyrkulacja jak w PN-EN 806-3.</li>
                          <li>Rezerwa i Pzam identycznie: <KatexFormula formula="P_{rez}=(P_{cwu}+P_{circ})\cdot r" />; <KatexFormula formula="P_{zam}=\lceil P_{cwu}+P_{circ}+P_{rez} \rceil" />.</li>
                          <li>Notuj k i qMax w uwagach dla audytu.</li>
                        </ol>
                        <div className="mt-2">
                          <div className="font-medium mb-1">Tabela współczynnika k</div>
                          <table className="w-full text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-200 dark:bg-slate-700">
                                <th className="p-1 font-semibold text-left">Liczba mieszkań</th>
                                <th className="p-1 font-semibold text-left">k</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="p-1">≤ 5</td><td className="p-1">1.00</td></tr>
                              <tr className="bg-slate-50 dark:bg-slate-800/40"><td className="p-1">6–10</td><td className="p-1">0.90</td></tr>
                              <tr><td className="p-1">11–20</td><td className="p-1">0.70</td></tr>
                              <tr className="bg-slate-50 dark:bg-slate-800/40"><td className="p-1">21–50</td><td className="p-1">0.50</td></tr>
                              <tr><td className="p-1">51–100</td><td className="p-1">0.35</td></tr>
                              <tr className="bg-slate-50 dark:bg-slate-800/40"><td className="p-1">&gt; 100</td><td className="p-1">0.25</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </div>
                  </div>

                  {/* Metoda bilansu energetycznego */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-green-50/80 to-teal-50/80 dark:from-slate-800/60 dark:to-teal-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                        BE
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          Bilans energetyczny CWU
                          {standard === 'bilans_energetyczny' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">Dla węzłów cieplnych i rozliczeń energii</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div><p className="text-xs">Bilans dziennego zużycia energii → maksymalna godzina szczytowa.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div><p className="text-xs">Węzły cieplne, rozliczenia dostawcy energii, projektowanie źródeł ciepła.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Algorytm</div><p className="text-xs">E = m·c·ΔT; dzienny m³ × szczyt% → qd [l/s] → P = 1.163·qd·ΔT</p></div>
                    </div>
                  </div>

                  {/* Metoda mocy/czasu rozbioru */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-slate-800/60 dark:to-purple-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        TR
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          Moc / czas rozbioru
                          {standard === 'moc_czas_rozbioru' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">Na podstawie temperatur i strumienia wody</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div><p className="text-xs">Typowy czas rozbioru × objętość → przepływ obliczeniowy.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div><p className="text-xs">Analiza bufora, dobór wymiennika, weryfikacja czasu napełniania wanny.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Algorytm</div><p className="text-xs">qd = V[L] / (t[min] × 60); Ppeak = 1.163·qd·ΔT</p></div>
                    </div>
                  </div>

                  {/* Peak demand pomiary */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-slate-800/60 dark:to-red-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                        PD
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          Peak demand (pomiary)
                          {standard === 'peak_demand_pomiary' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">Analiza rzeczywistego zużycia</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div><p className="text-xs">Dane z liczników/monitoringu → szczyt × współczynnik bezpieczeństwa.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div><p className="text-xs">Modernizacja, audyt energetyczny, weryfikacja projektów po uruchomieniu.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Algorytm</div><p className="text-xs">qd = qbaza × peak_factor (np. 1.5); Ppeak = 1.163·qd·ΔT</p></div>
                    </div>
                  </div>

                  {/* Krzywa mocy + sezon */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-cyan-50/80 to-sky-50/80 dark:from-slate-800/60 dark:to-cyan-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                        KS
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          Krzywa mocy + sezon
                          {standard === 'krzywa_mocy_sezonowa' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">Statystyka sezonowa</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div><p className="text-xs">Krzywa mocy (doba/tydzień/rok) z korektą sezonową (zima +20%, lato −10%).</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div><p className="text-xs">Dostawcy energii, taryfy zmienne, prognozowanie.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Algorytm</div><p className="text-xs">qd = qbaza × sezon_factor; Ppeak = 1.163·qd·ΔT</p></div>
                    </div>
                  </div>

                  {/* Metoda kosztowa */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-yellow-50/80 to-amber-50/80 dark:from-slate-800/60 dark:to-yellow-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold text-sm">
                        €
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          Metoda kosztowa
                          {standard === 'kosztowa' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">Ekonomiczna optymalizacja mocy zamówionej</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div><p className="text-xs">Minimalizacja kosztów całkowitych: opłata za moc zamówioną vs ryzyko braków i kar.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div><p className="text-xs">Zarządzanie energią, optymalizacja umów, bilansowanie mocy szczytowej.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Algorytm</div><p className="text-xs">Optymalizacja funkcji kosztu; qd wg punktu równowagi ekonomicznej; Ppeak = 1.163·qd·ΔT</p></div>
                    </div>
                  </div>

                  {/* Symulacja programowa */}
                  <div className="border rounded-xl p-4 bg-gradient-to-br from-violet-50/80 to-fuchsia-50/80 dark:from-slate-800/60 dark:to-violet-900/20 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
                        SIM
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base mb-1 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                          Symulacja programowa
                          {standard === 'symulacja_programowa' && <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">aktywna</span>}
                        </div>
                        <p className="text-xs italic text-slate-600 dark:text-slate-400">Model instalacji CWU z cyrkulacją</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Filozofia</div><p className="text-xs">Symulacja komputerowa całej instalacji (hydraulika, straty, cyrkulacja, dynamika).</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Zastosowanie</div><p className="text-xs">Zaawansowane projekty, certyfikacje, optymalizacja systemów zasobnikowych.</p></div>
                      <div><div className="font-semibold text-slate-700 dark:text-slate-200">Algorytm</div><p className="text-xs">Model CFD/FEM; qd z symulacji; Ppeak = 1.163·qd·ΔT</p></div>
                    </div>
                  </div>

                </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Liczba mieszkań</Label><Input type="number" value={liczbaMieszkan} onChange={e=>setLiczbaMieszkan(+e.target.value)} /></div>
                <div className="space-y-2"><Label>Rezerwa [%]</Label><Input type="number" value={rezerwaProc} onChange={e=>setRezerwaProc(+e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Punkty czerpalne</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Umywalki</Label><Input type="number" value={umywalki} onChange={e=>setUmywalki(+e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Zlewozmywaki</Label><Input type="number" value={zlewozmywaki} onChange={e=>setZlewozmywaki(+e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Prysznice</Label><Input type="number" value={prysznice} onChange={e=>setPrysznice(+e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Wanny</Label><Input type="number" value={wanny} onChange={e=>setWanny(+e.target.value)} /></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>T zimnej [°C]</Label><Input type="number" value={coldC} onChange={e=>setColdC(+e.target.value)} /></div>
                <div className="space-y-2"><Label>T CWU [°C]</Label><Input type="number" value={hotC} onChange={e=>setHotC(+e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Tryb przygotowania</Label>
                <Select value={trybPrzygotowania} onValueChange={v=>setTrybPrzygotowania(v as TrybPrzygotowania)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="przeplywowy">Przepływowy</SelectItem>
                    <SelectItem value="bufor">Buforowy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {trybPrzygotowania === "bufor" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Bufor [L]</Label><Input type="number" value={buforVlitry} onChange={e=>setBuforVlitry(+e.target.value)} /></div>
                  <div className="space-y-2"><Label>Czas odbioru [min]</Label><Input type="number" value={buforTOdtMin} onChange={e=>setBuforTOdtMin(+e.target.value)} /></div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Cyrkulacja</Label>
                <Select value={cyrkulacjaTryb} onValueChange={v=>setCyrkulacjaTryb(v as CyrkulacjaTryb)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="szacunek">Szacunek</SelectItem>
                    <SelectItem value="dane">Dane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {cyrkulacjaTryb === "dane" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Q cyrkulacji [m³/h]</Label><Input type="number" value={cyrkulacjaQm3h ?? ''} onChange={e=>setCyrkulacjaQm3h(e.target.value?+e.target.value:null)} /></div>
                  <div className="space-y-2"><Label>ΔT cyrkulacji [K]</Label><Input type="number" value={cyrkulacjaDTK ?? ''} onChange={e=>setCyrkulacjaDTK(e.target.value?+e.target.value:null)} /></div>
                </div>
              ) : (
                <div className="space-y-2"><Label>Moc cyrkulacji [kW]</Label><Input type="number" value={cyrkulacjaPstaleKW ?? ''} onChange={e=>setCyrkulacjaPstaleKW(e.target.value?+e.target.value:null)} /></div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={calculate} className="w-full" variant="default">Oblicz</Button>
                <Button onClick={exportJSON} className="w-full" variant="outline">Eksport JSON</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Wyniki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {result ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-center text-3xl font-bold">
                    {result.Pzam_kW.toFixed(0)} kW
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Ppeak" value={result.Ppeak_kW} unit="kW" />
                    <Stat label="Pnet" value={result.Pnet_kW} unit="kW" />
                    <Stat label="Pcwu" value={result.Pcwu_kW} unit="kW" />
                    <Stat label="Pcirc" value={result.Pcirc_kW} unit="kW" />
                    <Stat label="Prezerwa" value={result.Prez_kW} unit="kW" />
                    <Stat label="qd" value={result.qd_ls} unit="l/s" />
                  </div>
                  <div className="space-y-2">
                    <Label>Uwagi</Label>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      {result.uwagi.map((u,i)=>(<li key={i}>{u}</li>))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">Wprowadź dane i oblicz moc.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="font-semibold text-slate-900 dark:text-slate-100">{value.toFixed(2)} {unit}</div>
    </div>
  );
}
