import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PROF INSTAL – CWU bez zgadywania",
  description: "Kalkulator CWU + audyt + raporty",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class">
          <header className="sticky top-0 bg-background/95 backdrop-blur-lg border-b z-50 shadow-sm">
            <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg group">
                {/* Logo SVG with gradient */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PROFINSTAL
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/mieszkancy"
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Mieszkańcy
                </Link>
                <Link
                  href="/audytorzy"
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Audytorzy
                </Link>
                <Link
                  href="/wykonawcy"
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Wykonawcy
                </Link>
                <Link
                  href="/inwestorzy"
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Inwestorzy
                </Link>
                <Link
                  href="/pricing"
                  className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Cennik
                </Link>
                <Link
                  href="/komponenty"
                  className="ml-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  Wypróbuj
                </Link>
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-10">{children}</main>
          
          <footer className="border-t bg-gradient-to-b from-background to-slate-50 dark:to-slate-950 mt-20">
            <div className="mx-auto max-w-7xl px-4 py-12">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
                      </svg>
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
              
              <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>© 2025 PROFINSTAL. Wszystkie prawa zastrzeżone.</p>
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
