"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Activity, FileText, Gauge, PlayCircle, ShieldCheck, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_FORMSPREE_AUDYTOR_ENDPOINT = "https://formspree.io/f/mpwvbbdl";

export default function AudytorzyPage() {
  const videoUrl = (process.env.NEXT_PUBLIC_AUDYTORZY_VIDEO_URL ?? "").trim();
  const formspreeEndpoint =
    (process.env.NEXT_PUBLIC_FORMSPREE_AUDYTOR_ENDPOINT ?? "").trim() || DEFAULT_FORMSPREE_AUDYTOR_ENDPOINT;

  const [lead, setLead] = useState<{ email: string; phone: string; company: string }>({
    email: "",
    phone: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isEmailValid = useMemo(() => lead.email.trim().includes("@"), [lead.email]);

  async function submitAuditorLead() {
    const email = lead.email.trim();
    if (!email || !email.includes("@")) {
      toast.error("Podaj poprawny adres e-mail");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("type", "auditor_lead");
      formData.set("email", email);
      if (lead.phone.trim()) formData.set("phone", lead.phone.trim());
      if (lead.company.trim()) formData.set("company", lead.company.trim());

      const resp = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (!resp.ok) {
        let details: unknown = null;
        try {
          details = await resp.json();
        } catch {
          // pomijamy
        }
        throw new Error((details as { error?: string } | null)?.error || `Formspree HTTP ${resp.status}`);
      }

      setSubmitted(true);
      toast.success("Dzięki! Skontaktujemy się.");
    } catch (e) {
      toast.error("Nie udało się wysłać", { description: String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 relative z-10">
        <div className="sticky top-0 z-20 -mx-4 px-4">
          <div className="rounded-3xl border border-slate-200/30 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/70 backdrop-blur shadow-xl px-3 py-2 flex flex-wrap gap-2 items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-slate-300">Audytorzy – narzędzia + leady z /mieszkancy</div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/audytor">Zobacz demo panelu</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="#case">Case study</a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="#kontakt">Zostaw kontakt</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Dla audytorów: szybciej, czytelniej, bez chaosu w Excelu
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mt-4">
            Zamieniasz zgłoszenie mieszkańca w gotowy „decision pack” dla zarządcy: liczby, ryzyka, warianty A/B/C i kolejny krok.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild>
              <Link href="/audytor">Wejdź do demo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/mieszkancy">Zobacz, co widzi mieszkaniec</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Timer className="w-5 h-5 text-cyan-400" />
                Czas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              30–60 min na pakiet decyzyjny (typowo), zależnie od kompletności danych.
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <FileText className="w-5 h-5 text-cyan-400" />
                Artefakty
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              PDF do zarządcy + notatki prywatne + historia decyzji – bez mieszania wersji.
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Ryzyko
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              Jasne warunki audytu płatnego i ścieżka „co dalej” – mniej nieporozumień.
            </CardContent>
          </Card>
        </div>

        <Card
          id="case"
          className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur"
        >
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Case study (poglądowe)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Budynek</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">~80 mieszkań</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">zależnie od węzła i cyrkulacji</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Roczne CWU</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">120 000 zł</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">z faktur / rozliczeń</div>
              </div>
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/30 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Straty</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">~28%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">~33 600 zł/rok potencjału</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Przykład pokazuje format decyzji i komunikacji, nie gwarancję wyniku. Realny efekt zależy od instalacji i danych.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              Wideo demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videoUrl ? (
              <div className="w-full overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-black">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={videoUrl}
                    title="Demo" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-700 dark:text-slate-300">
                Brak ustawionego wideo. Jeśli podasz URL, podepnę go pod zmienną `NEXT_PUBLIC_AUDYTORZY_VIDEO_URL`.
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          id="kontakt"
          className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-700/50 shadow-xl rounded-3xl backdrop-blur"
        >
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Zostaw kontakt (dla audytora)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">E-mail</div>
                <Input
                  value={lead.email}
                  onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
                  placeholder="np. audytor@email.com"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Telefon (opcjonalnie)</div>
                <Input
                  value={lead.phone}
                  onChange={(e) => setLead((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="np. 600 000 000"
                  inputMode="tel"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Firma (opcjonalnie)</div>
                <Input
                  value={lead.company}
                  onChange={(e) => setLead((p) => ({ ...p, company: e.target.value }))}
                  placeholder="np. Audyty XYZ"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={submitAuditorLead} disabled={submitting || submitted || !isEmailValid}>
                {submitted ? "Wysłano" : submitting ? "Wysyłanie…" : "Chcę dostęp / rozmowę"}
              </Button>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Uwaga: formularz wysyła dane do Formspree.
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="text-center text-lg text-slate-300 mb-4">Narzędzia (dla audytora)</div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Link
              href="/audytorzy/liczniki"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-pink-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-700/10 via-purple-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-700 via-purple-700 to-blue-900 text-pink-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-7 w-7" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xl font-bold text-slate-200 group-hover:text-pink-300 transition-colors">Liczniki</span>
                  <span className="text-sm text-slate-400">Analiza odczytów liczników ciepła</span>
                </span>
              </div>
            </Link>

            <Link
              href="/audytorzy/moc-zamowiona"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-blue-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/10 via-blue-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 text-cyan-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Gauge className="h-7 w-7" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xl font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    Moc zamówiona CWU
                  </span>
                  <span className="text-sm text-slate-400">Kalkulator mocy zamówionej na CWU</span>
                </span>
              </div>
            </Link>

            <Link
              href="/audytorzy/analiza-finansowa"
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-900/80 via-yellow-700/80 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-yellow-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-700/10 via-orange-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-400 to-orange-900 text-yellow-100 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Gauge className="h-7 w-7" />
                </span>
                <span className="flex flex-col">
                  <span className="text-xl font-bold text-slate-200 group-hover:text-yellow-300 transition-colors">
                    Analiza finansowa
                  </span>
                  <span className="text-sm text-slate-400">Koszty, oszczędności i warianty modernizacji</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}