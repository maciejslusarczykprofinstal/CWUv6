import {
  ArrowRight,
  Calculator,
  Zap,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 -z-10" />

      <div className="container-responsive py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            <Badge
              variant="secondary"
              className="mb-6 inline-flex items-center"
            >
              <Zap className="w-3 h-3 mr-1" />
              Najnowsza technologia
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block">PROF INSTAL</span>
              <span className="block text-primary mt-2">
                CWU bez zgadywania
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              Profesjonalne obliczenia instalacji ciepłej wody użytkowej.
              Precyzyjne wyniki, oszczędność czasu, pewność wykonania.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" className="text-lg px-8 py-6">
                <Calculator className="w-5 h-5 mr-2" />
                Zacznij obliczenia
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Zobacz demo
              </Button>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Zgodność z normami</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Automatyczne obliczenia</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Eksport do PDF</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">Wsparcie eksperta</span>
              </div>
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {/* Main card */}
              <Card className="col-span-2 p-6 shadow-xl">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Projekt CWU #2024-001
                    </h3>
                    <Badge variant="success">Zakończony</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Przepływ:</span>
                      <span className="font-medium">2.4 l/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperatura:</span>
                      <span className="font-medium">55°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Średnica:</span>
                      <span className="font-medium">Ø 15mm</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-medium">
                          Oszczędności:
                        </span>
                        <span className="text-green-800 font-bold">15%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats cards */}
              <Card className="p-4 shadow-lg">
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-sm text-gray-600">Projektów</div>
                </CardContent>
              </Card>

              <Card className="p-4 shadow-lg">
                <CardContent className="p-0 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-gray-600">Precyzja</div>
                </CardContent>
              </Card>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-200 rounded-full opacity-60" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-blue-200 rounded-full opacity-40" />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-8">
            Zaufało nam ponad 1000 instalatorów w całej Polsce
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">INSTALTECH</div>
            <div className="text-2xl font-bold text-gray-400">HYDRO-TERM</div>
            <div className="text-2xl font-bold text-gray-400">AQUA-SYSTEM</div>
            <div className="text-2xl font-bold text-gray-400">TERMO-PLUS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
