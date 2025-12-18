import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const METHODS = [
  {
    key: "symulacja-programowa",
    label: "Symulacja programowa",
    desc: "Model instalacji CWU z cyrkulacją",
    href: "/audytorzy/moc-zamowiona"
  },
  {
    key: "pn-en-806-3",
    label: "PN-EN 806-3",
    desc: "Norma europejska dla CWU. Uwzględnia jednoczesność, oblicza moc na podstawie sumy FU.",
    href: "/audytorzy/moc-zamowiona"
  },
  {
    key: "bilans-energetyczny",
    label: "Bilans energetyczny CWU",
    desc: "Dla węzłów cieplnych – najbardziej konkretna i najbliższa fizyce",
    href: "/audytorzy/moc-zamowiona"
  },
  {
    key: "hybryda",
    label: "Metoda obliczeń (hybryda)",
    desc: "Łączy bilans energetyczny (fizyka) i peak demand (pomiary) – przyjmujesz wynik bezpieczny i uczciwy finansowo.",
    href: "/metody/hybryda"
  },
  // ...inne metody jeśli trzeba
];

export default function MetodyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
      {/* Lewy panel z przyciskami */}
      <aside className="w-full max-w-xs md:max-w-sm lg:max-w-xs xl:max-w-xs flex flex-col gap-6 p-6 bg-slate-900/90 border-r border-slate-800 shadow-2xl">
        <div className="flex flex-col gap-6 mt-4 w-full md:flex-row md:flex-wrap md:gap-4">
          {METHODS.map((m) => (
            <div key={m.key} className="relative w-full min-w-[220px] max-w-full md:w-[calc(50%-0.5rem)] lg:w-full mb-2 md:mb-0">
              <Button
                asChild
                variant={m.key === "hybryda" ? "default" : "outline"}
                className={`w-full flex flex-col items-start justify-center min-h-[110px] px-6 py-6 rounded-2xl font-semibold text-base transition-all border-2 whitespace-pre-line break-words text-left ${m.key === "hybryda" ? "border-blue-500 bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg" : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700/80"}`}
                style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
              >
                <Link href={m.href}>
                  <span className="font-bold text-base mb-3 w-full block leading-snug break-words whitespace-pre-line text-wrap hyphens-auto">
                    {m.label}
                  </span>
                  <span className="text-xs text-slate-300 leading-tight w-full block break-words whitespace-pre-line text-wrap hyphens-auto" style={{ wordBreak: "break-word" }}>
                    {m.desc}
                  </span>
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
