import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 
export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="space-y-8 text-[15px] md:text-base leading-relaxed">
      <div className="space-y-3 relative before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:content-[''] before:bg-[linear-gradient(rgba(0,0,0,0.65),rgba(0,0,0,0.65))]">
        <div className="relative z-10">
          <Image
            src="/LOGO512x512.png"
            alt="Logo"
            width={512}
            height={512}
            priority
            className="w-16 sm:w-20 md:w-28 h-auto"
          />
        </div>
        <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-[#FFFFFF]">Audyt CWU jako narzędzie decyzyjne</h1>
        <p className="relative z-10 text-[#E5E7EB]">Dla mieszkańców, zarządców i audytorów technicznych</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/mieszkancy" className="block">
          <Card className="h-full bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Analiza strat CWU w mieszkaniu</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-800 dark:text-slate-200 space-y-2 leading-relaxed">
              <div>sprawdzenie, czy CWU generuje realne straty</div>
              <div>bez logowania, bez zobowiązań</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/zarzadcy" className="block">
          <Card className="h-full bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Audyt CWU jako decyzja techniczna</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
                <li>kiedy audyt ma sens</li>
                <li>co z niego wynika</li>
                <li>jakie są możliwe ścieżki działań</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/audytor" className="block">
          <Card className="h-full bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Panel audytora CWU</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              <ul className="list-disc pl-5 space-y-2">
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
