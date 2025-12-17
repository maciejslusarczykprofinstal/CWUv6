import { Building, TrendingUp, BarChart3, FileSearch, Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InwestorzyPage() {
  const buildings = [
    // A. Budynki o wysokich kosztach i dużych stratach (ok. połowa)
    { group: "A", name: "Os. Lotnictwa", units: 65, cost: 97500, efficiency: 26 },
    { group: "A", name: "Wieżowiec Centrum", units: 120, cost: 56800, efficiency: 63 },
    { group: "A", name: "Osiedle Północ", units: 88, cost: 41200, efficiency: 58 },
    { group: "A", name: "Bloki Nad Potokiem", units: 74, cost: 35900, efficiency: 61 },
    { group: "A", name: "Zespół Przy Dworcowej", units: 102, cost: 47700, efficiency: 54 },
    { group: "A", name: "Budynek Handlowy", units: 24, cost: 21900, efficiency: 49 },

    // B. Budynki o średnich parametrach
    { group: "B", name: "Apartamenty Park", units: 45, cost: 16700, efficiency: 81 },
    { group: "B", name: "Osiedle Kasztanowe", units: 56, cost: 18900, efficiency: 79 },
    { group: "B", name: "Blok Zachodni", units: 68, cost: 21400, efficiency: 83 },
    { group: "B", name: "Wieża Wschodnia", units: 96, cost: 24900, efficiency: 77 },

    // C. Budynki prawidłowe / dobrze działające (kilka sztuk)
    { group: "C", name: "Nowe Tarasy", units: 52, cost: 9800, efficiency: 92 },
    { group: "C", name: "Osiedle Zielone", units: 61, cost: 11200, efficiency: 89 },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      {/* Dekoracyjne gradientowe blury w tle */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Inwestorzy
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Dashboard zarządzania portfelem nieruchomości – analiza kosztów CWU, monitoring efektywności i raporty ROI
          </p>
        </div>
        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Building className="w-7 h-7 text-cyan-200" />
            </div>
            <p className="text-sm text-slate-400 mb-1">Budynki w portfelu</p>
            <p className="text-2xl font-bold text-slate-100">12</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-green-700 via-green-800 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <TrendingUp className="w-7 h-7 text-green-200" />
            </div>
            <p className="text-sm text-slate-400 mb-1">Koszt CWU/miesiąc</p>
            <p className="text-2xl font-bold text-slate-100">84,200 zł</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-700 via-orange-800 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <BarChart3 className="w-7 h-7 text-orange-200" />
            </div>
            <p className="text-sm text-slate-400 mb-1">Średnie straty</p>
            <p className="text-2xl font-bold text-slate-100">28%</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8 flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-700 via-purple-800 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Users className="w-7 h-7 text-purple-200" />
            </div>
            <p className="text-sm text-slate-400 mb-1">Mieszkańców</p>
            <p className="text-2xl font-bold text-slate-100">847</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8">
              <h2 className="text-2xl font-bold text-cyan-200 mb-6">Przegląd budynków</h2>
              <div className="space-y-4">
                {buildings.map((building, i) => (
                  <div key={`${building.group}-${building.name}`} className="space-y-4">
                    {i > 0 && building.group !== buildings[i - 1].group ? (
                      <div className="h-px bg-slate-800/60" />
                    ) : null}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 hover:bg-blue-900/40 transition-colors">
                      <div>
                        <h4 className="font-medium text-slate-100">{building.name}</h4>
                        {building.name === "Os. Lotnictwa" ? (
                          <>
                            {/* TODO: dane z modułu Audytorzy – moc zamówiona */}
                            <p className="text-sm text-slate-400">Liczba mieszkań: 70</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-400">{building.units} mieszkań</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-100">{building.cost.toLocaleString("pl-PL")} zł/mies.</p>
                        <Badge
                          variant={
                            building.name === "Os. Lotnictwa"
                              ? "success"
                              : building.efficiency > 85
                                ? "success"
                                : building.efficiency > 75
                                  ? "warning"
                                  : "destructive"
                          }
                        >
                          {building.efficiency}% efektywności
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8">
              <h2 className="text-2xl font-bold text-cyan-200 mb-6">Ostatnie raporty</h2>
              <div className="space-y-3">
                {[
                  { title: "Analiza strat Q4 2024", date: "2 dni temu", type: "Analiza" },
                  { title: "Raport miesięczny - Październik", date: "1 tydzień temu", type: "Miesięczny" },
                  { title: "Audit energetyczny - Osiedle A", date: "2 tygodnie temu", type: "Audit" },
                ].map((report, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 hover:bg-blue-900/40 transition-colors cursor-pointer">
                    <FileSearch className="w-5 h-5 text-cyan-300" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-100 text-sm">{report.title}</h4>
                      <p className="text-xs text-slate-400">{report.date}</p>
                    </div>
                    <Badge variant="outline">{report.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8">
              <h2 className="text-2xl font-bold text-cyan-200 mb-6">Szybkie akcje</h2>
              <div className="space-y-3">
                <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 text-slate-400 cursor-not-allowed">
                  <FileSearch className="w-4 h-4 mr-2" /> Nowy raport
                </div>
                <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 text-slate-400 cursor-not-allowed">
                  <Building className="w-4 h-4 mr-2" /> Dodaj budynek
                </div>
                <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 text-slate-400 cursor-not-allowed">
                  <BarChart3 className="w-4 h-4 mr-2" /> Analiza portfela
                </div>
                <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 text-slate-400 cursor-not-allowed">
                  <Clock className="w-4 h-4 mr-2" /> Harmonogram audytów
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-xl backdrop-blur-md p-8">
              <h2 className="text-2xl font-bold text-cyan-200 mb-6">Funkcje w przygotowaniu</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-slate-100">Dashboard analityczny</p>
                    <p className="text-xs text-slate-400">Wykresy trendów i KPI</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-slate-100">Automatyczne raporty</p>
                    <p className="text-xs text-slate-400">Cykliczne analizy kosztów</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-slate-100">Zarządzanie portfelem</p>
                    <p className="text-xs text-slate-400">Dodawanie i edycja budynków</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium text-slate-100">Prognozy ROI</p>
                    <p className="text-xs text-slate-400">Analiza opłacalności inwestycji</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}