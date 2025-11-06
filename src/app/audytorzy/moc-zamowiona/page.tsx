"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Standard = "PN_EN_806_3" | "PN_92_B_01706";
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
    } else {
      let k = 1;
      if (liczbaMieszkan <= 5) k = 1; else if (liczbaMieszkan <= 10) k = 0.9; else if (liczbaMieszkan <= 20) k = 0.7; else if (liczbaMieszkan <= 50) k = 0.5; else if (liczbaMieszkan <= 100) k = 0.35; else k = 0.25;
      const qMax = umywalki * 0.1 + zlewozmywaki * 0.15 + prysznice * 0.2 + wanny * 0.3;
      qd_ls = qMax * k;
      uwagi.push(`PN-92/B-01706: k=${k.toFixed(2)} qMax=${qMax.toFixed(2)} l/s`);
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
              <div className="space-y-2">
                <Label>Norma</Label>
                <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 p-1 gap-0">
                  <Button
                    type="button"
                    variant="ghost"
                    className={
                      (standard === "PN_EN_806_3"
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60") +
                      " rounded-full px-4 py-2 text-sm"
                    }
                    aria-pressed={standard === "PN_EN_806_3"}
                    onClick={() => setStandard("PN_EN_806_3")}
                  >
                    {standard === "PN_EN_806_3" && (
                      <svg
                        className="mr-2 h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                    PN-EN 806-3
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={
                      (standard === "PN_92_B_01706"
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60") +
                      " rounded-full px-4 py-2 text-sm"
                    }
                    aria-pressed={standard === "PN_92_B_01706"}
                    onClick={() => setStandard("PN_92_B_01706")}
                  >
                    {standard === "PN_92_B_01706" && (
                      <svg
                        className="mr-2 h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                    PN-92/B-01706
                  </Button>
                </div>
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
