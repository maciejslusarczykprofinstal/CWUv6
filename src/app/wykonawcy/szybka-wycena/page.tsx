"use client";

export default function SzybkaWycenaPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-900 via-cyan-900 to-slate-900 px-4 py-12">
      <div className="max-w-2xl w-full bg-slate-900/80 rounded-3xl shadow-2xl p-10 border border-blue-800 mt-4">
        <h1 className="text-3xl font-bold text-cyan-300 mb-6 text-center">Szybka wycena</h1>
        <p className="text-lg text-slate-200 mb-4 text-center">
          Tutaj wkrótce pojawi się kalkulator kosztów materiałów i robocizny dla wykonawców instalacji CWU.
        </p>
        <div className="text-center text-slate-400">Wersja beta już wkrótce!</div>
      </div>
    </div>
  );
}
