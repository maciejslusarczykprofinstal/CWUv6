"use client";

export default function MocZamowionaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Moc zamówiona CWU
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kalkulator mocy zamówionej dla systemów ciepłej wody użytkowej
          </p>
        </header>
      </div>
    </div>
  );
}
