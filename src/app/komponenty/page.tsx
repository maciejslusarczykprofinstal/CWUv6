"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator,
  AlertCircle,
  Info,
  CheckCircle,
  Plus,
  Settings,
} from "lucide-react";

export default function KomponentyPage() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");

  const showToast = (variant: "default" | "destructive" | "success") => {
    toast({
      title:
        variant === "success"
          ? "Sukces!"
          : variant === "destructive"
            ? "Błąd!"
            : "Informacja",
      description: `To jest przykład ${variant === "success" ? "pozytywnego" : variant === "destructive" ? "negatywnego" : "zwykłego"} toasta.`,
      variant: variant,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Galeria komponentów UI</h1>
        <p className="text-muted-foreground">
          Przegląd wszystkich dostępnych komponentów shadcn/ui
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Przyciski</CardTitle>
          <CardDescription>Różne warianty przycisków</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Domyślny</Button>
            <Button variant="secondary">Dodatkowy</Button>
            <Button variant="outline">Konturu</Button>
            <Button variant="ghost">Widmo</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destrukcyjny</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Mały</Button>
            <Button size="default">Domyślny</Button>
            <Button size="lg">Duży</Button>
            <Button size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Elementy formularza</CardTitle>
          <CardDescription>
            Pola wejściowe, etykiety i selektory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="wprowadź email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="select">Wybierz opcję</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz opcję" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Opcja 1</SelectItem>
                  <SelectItem value="option2">Opcja 2</SelectItem>
                  <SelectItem value="option3">Opcja 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Odznaki</CardTitle>
          <CardDescription>Różne warianty odznak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>Domyślny</Badge>
            <Badge variant="secondary">Dodatkowy</Badge>
            <Badge variant="outline">Konturu</Badge>
            <Badge variant="destructive">Destrukcyjny</Badge>
            <Badge variant="success">Sukces</Badge>
            <Badge variant="warning">Ostrzeżenie</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alerty</CardTitle>
          <CardDescription>Różne typy komunikatów</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Informacja</AlertTitle>
            <AlertDescription>
              To jest standardowy alert informacyjny.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ostrzeżenie</AlertTitle>
            <AlertDescription>To jest alert ostrzegawczy.</AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Błąd</AlertTitle>
            <AlertDescription>To jest alert błędu.</AlertDescription>
          </Alert>

          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Sukces</AlertTitle>
            <AlertDescription>To jest alert sukcesu.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Zakładki</CardTitle>
          <CardDescription>Przykład komponentu zakładek</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tab1">Zakładka 1</TabsTrigger>
              <TabsTrigger value="tab2">Zakładka 2</TabsTrigger>
              <TabsTrigger value="tab3">Zakładka 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <p>Zawartość pierwszej zakładki</p>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <p>Zawartość drugiej zakładki</p>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <p>Zawartość trzeciej zakładki</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela</CardTitle>
          <CardDescription>Przykład tabeli z danymi</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wartość</TableHead>
                <TableHead>Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Projekt A</TableCell>
                <TableCell>
                  <Badge variant="success">Aktywny</Badge>
                </TableCell>
                <TableCell>1,234.56 zł</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Edytuj
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Projekt B</TableCell>
                <TableCell>
                  <Badge variant="warning">Oczekuje</Badge>
                </TableCell>
                <TableCell>2,345.67 zł</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Edytuj
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Interactive Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Elementy interaktywne</CardTitle>
          <CardDescription>Dialog, tooltip i toast</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Otwórz Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Przykładowy Dialog</DialogTitle>
                  <DialogDescription>
                    To jest przykład modala/dialogu. Możesz tutaj umieścić
                    dowolną zawartość.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-input">Pole w dialogu</Label>
                    <Input id="dialog-input" placeholder="Wprowadź tekst" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Anuluj</Button>
                    <Button>Zapisz</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>To jest tooltip z pomocną informacją</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button onClick={() => showToast("default")}>Toast Domyślny</Button>
            <Button onClick={() => showToast("success")}>Toast Sukces</Button>
            <Button onClick={() => showToast("destructive")}>Toast Błąd</Button>
          </div>
        </CardContent>
      </Card>

      {/* Example Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Obliczenia CWU</CardTitle>
            <CardDescription>
              Zaawansowane obliczenia instalacji ciepłej wody użytkowej
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Rozpocznij projekt</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Konfiguracja</CardTitle>
            <CardDescription>
              Personalizuj ustawienia aplikacji według swoich potrzeb
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Otwórz ustawienia
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle>Pomoc</CardTitle>
            <CardDescription>
              Dokumentacja i wsparcie techniczne dla użytkowników
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">
              Zobacz dokumentację
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
