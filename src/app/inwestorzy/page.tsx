import { Building, TrendingUp, BarChart3, FileSearch, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InwestorzyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Inwestorzy</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Dashboard zarządzania portfelem nieruchomości - analiza kosztów CWU, monitoring efektywności i raporty ROI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Budynki w portfelu
                </p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Koszt CWU/miesiąc
                </p>
                <p className="text-2xl font-bold">84,200 zł</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Średnie straty
                </p>
                <p className="text-2xl font-bold">28%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Mieszkańców
                </p>
                <p className="text-2xl font-bold">847</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Przegląd budynków</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Osiedle Słoneczne A", units: 65, cost: 12400, efficiency: 85 },
                  { name: "Wieżowiec Centrum", units: 120, cost: 18200, efficiency: 72 },
                  { name: "Apartamenty Park", units: 45, cost: 8900, efficiency: 91 },
                  { name: "Budynek Handlowy", units: 24, cost: 5200, efficiency: 78 },
                ].map((building, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h4 className="font-medium">{building.name}</h4>
                      <p className="text-sm text-muted-foreground">{building.units} mieszkań</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{building.cost.toLocaleString("pl-PL")} zł/mies.</p>
                      <Badge variant={building.efficiency > 85 ? "success" : building.efficiency > 75 ? "warning" : "destructive"}>
                        {building.efficiency}% efektywności
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ostatnie raporty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Analiza strat Q4 2024", date: "2 dni temu", type: "Analiza" },
                  { title: "Raport miesięczny - Październik", date: "1 tydzień temu", type: "Miesięczny" },
                  { title: "Audit energetyczny - Osiedle A", date: "2 tygodnie temu", type: "Audit" },
                ].map((report, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <FileSearch className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{report.title}</h4>
                      <p className="text-xs text-muted-foreground">{report.date}</p>
                    </div>
                    <Badge variant="outline">{report.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" disabled>
                <FileSearch className="w-4 h-4 mr-2" />
                Nowy raport
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Building className="w-4 h-4 mr-2" />
                Dodaj budynek
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analiza portfela
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Clock className="w-4 h-4 mr-2" />
                Harmonogram audytów
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funkcje w przygotowaniu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium">Dashboard analityczny</p>
                    <p className="text-muted-foreground text-xs">Wykresy trendów i KPI</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium">Automatyczne raporty</p>
                    <p className="text-muted-foreground text-xs">Cykliczne analizy kosztów</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium">Zarządzanie portfelem</p>
                    <p className="text-muted-foreground text-xs">Dodawanie i edycja budynków</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                  <div>
                    <p className="font-medium">Prognozy ROI</p>
                    <p className="text-muted-foreground text-xs">Analiza opłacalności inwestycji</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}