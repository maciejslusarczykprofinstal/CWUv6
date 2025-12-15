import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Audyt CWU jako narzędzie decyzyjne</h1>
        <p className="text-slate-700 dark:text-slate-300">Dla mieszkańców, zarządców i audytorów technicznych</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/mieszkancy" className="block">
          <Card className="h-full backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Analiza strat CWU w mieszkaniu</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
              <div>sprawdzenie, czy CWU generuje realne straty</div>
              <div>bez logowania, bez zobowiązań</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/zarzadcy" className="block">
          <Card className="h-full backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Audyt CWU jako decyzja techniczna</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-5 space-y-1">
                <li>kiedy audyt ma sens</li>
                <li>co z niego wynika</li>
                <li>jakie są możliwe ścieżki działań</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/audytor" className="block">
          <Card className="h-full backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 border-0 shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Panel audytora CWU</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 dark:text-slate-300">
              <ul className="list-disc pl-5 space-y-1">
                <li>analiza zgłoszeń</li>
                <li>argumenty techniczno-ekonomiczne</li>
                <li>przygotowanie ofert i decyzji</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
