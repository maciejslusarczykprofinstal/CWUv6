import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-math",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PROF INSTAL – CWU bez zgadywania",
  description: "Kalkulator CWU + audyt + raporty. © 2025 PROF INSTAL Maciej Ślusarczyk. Wszystkie prawa zastrzeżone.",
  authors: [{ name: "PROF INSTAL Maciej Ślusarczyk" }],
  creator: "PROF INSTAL Maciej Ślusarczyk",
  publisher: "PROF INSTAL Maciej Ślusarczyk",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${inter.className} ${jetbrainsMono.variable} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <header className="sticky top-0 bg-background/95 backdrop-blur-lg border-b z-50 shadow-sm">
            <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg group">
                {/* Logo image from GitHub */}
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                  <Image
                    src="https://avatars.githubusercontent.com/u/222444241?s=48&v=4"
                    alt="PROFINSTAL Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PROFINSTAL
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <Link href="/mieszkancy" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">Mieszkańcy</Link>
                <Link href="/audytorzy" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">Audytorzy</Link>
                <Link href="/wykonawcy" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">Wykonawcy</Link>
                <Link href="/inwestorzy" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">Inwestorzy</Link>
                <Link href="/pricing" className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium">Cennik</Link>
                <Link href="/cal" className="ml-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105">CEL</Link>
              </div>
              <div className="flex items-center ml-2"><ThemeToggleButton /></div>
            </nav>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-10">{children}</main>
          <footer style={{padding: 8, fontSize: 12, opacity: 0.7}}>
            build: {process.env.NEXT_PUBLIC_COMMIT_SHA}
          </footer>
          <footer className="border-t bg-gradient-to-b from-background to-slate-50 dark:to-slate-950 mt-20">
            <div className="mx-auto max-w-7xl px-4 py-12">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shadow-md">
                      <Image
                        src="https://avatars.githubusercontent.com/u/222444241?s=48&v=4"
                        alt="PROFINSTAL Logo"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      PROFINSTAL
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Profesjonalne narzędzia do kalkulacji systemów CWU dla branży budowlanej.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Produkty</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/mieszkancy" className="hover:text-foreground transition-colors">Kalkulator mieszkańca</Link></li>
                    <li><Link href="/audytorzy" className="hover:text-foreground transition-colors">Narzędzia audytora</Link></li>
                    <li><Link href="/wykonawcy" className="hover:text-foreground transition-colors">Panel wykonawcy</Link></li>
                    <li><Link href="/inwestorzy" className="hover:text-foreground transition-colors">Dashboard inwestora</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Firma</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/pricing" className="hover:text-foreground transition-colors">Cennik</Link></li>
                    <li><Link href="#" className="hover:text-foreground transition-colors">O nas</Link></li>
                    <li><Link href="#" className="hover:text-foreground transition-colors">Kontakt</Link></li>
                    <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Prawne</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="#" className="hover:text-foreground transition-colors">Polityka prywatności</Link></li>
                    <li><Link href="#" className="hover:text-foreground transition-colors">Regulamin</Link></li>
                    <li><Link href="#" className="hover:text-foreground transition-colors">Cookies</Link></li>
                    <li><Link href="#" className="hover:text-foreground transition-colors">RODO</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t pt-8 flex flex-col items-center gap-4 text-sm text-muted-foreground">
                <div className="text-center">
                  <p className="font-semibold text-base">© 2025 PROF INSTAL Maciej Ślusarczyk</p>
                  <p className="mb-2">Wszystkie prawa zastrzeżone.</p>
                  <p className="text-xs max-w-2xl mx-auto leading-relaxed">
                    Kalkulator CWU, algorytmy obliczeniowe, metodologia analizy strat i interfejs użytkownika 
                    są chronione prawem autorskim. Wszelkie próby kopiowania, modyfikacji lub dystrybucji 
                    bez pisemnej zgody autora są zabronione.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span>Wykonane z ❤️ w Polsce</span>
                </div>
              </div>
            </div>
          </footer>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
