import { Wrench, Calculator, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WykonawcyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Wykonawcy</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Narzędzia dla wykonawców instalacji CWU - szybkie wyceny, kosztorysy i dokumentacja techniczna
        </p>
      </div>

      {/* Quick Tools */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Szybka wycena</h3>
            <p className="text-sm text-muted-foreground">
              Kalkulator kosztów materiałów i robocizny
            </p>
            <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Generator ofert</h3>
            <p className="text-sm text-muted-foreground">
              Automatyczne tworzenie ofert PDF
            </p>
            <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Narzędzia tech.</h3>
            <p className="text-sm text-muted-foreground">
              Kalkulatory przepływów, strat ciepła
            </p>
            <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Harmonogram</h3>
            <p className="text-sm text-muted-foreground">
              Planowanie prac i terminy realizacji
            </p>
            <Badge variant="secondary" className="mt-2">Wkrótce</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Funkcje dla wykonawców</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Szybkie wyceny</h4>
                <p className="text-sm text-muted-foreground">
                  Automatyczne kalkulacje materiałów na podstawie parametrów instalacji
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Generowanie dokumentacji</h4>
                <p className="text-sm text-muted-foreground">
                  Profesjonalne oferty, kosztorysy i raporty PDF
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Narzędzia techniczne</h4>
                <p className="text-sm text-muted-foreground">
                  Kalkulatory mocy, przepływów i strat cieplnych
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rozpocznij pracę</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sekcja wykonawców jest w trakcie rozwoju. Dostępne będą narzędzia do:
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Szybkich wyliczeń materiałów i kosztów</li>
              <li>• Automatycznego generowania ofert</li>
              <li>• Planowania harmonogramów prac</li>
              <li>• Zarządzania projektami CWU</li>
            </ul>
            <Button className="w-full" disabled>
              Funkcje w przygotowaniu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}