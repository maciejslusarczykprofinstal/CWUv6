export default function SponsorzyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 p-8">
      <div className="max-w-xl w-full bg-white/80 rounded-2xl shadow-2xl p-8 border border-blue-900">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">Sponsorzy</h1>
        <p className="text-lg text-slate-700 text-center mb-6">
          Dziękujemy wszystkim sponsorom i partnerom wspierającym rozwój portalu oraz branży instalacyjnej!
        </p>
        <div className="flex flex-col gap-4 items-center">
          <a
            href="/astaned"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg text-lg transition-colors duration-200"
          >
            AtaNed
          </a>
          <div className="text-sm text-slate-500">Jeśli chcesz dołączyć do grona sponsorów, skontaktuj się z nami.</div>
        </div>
      </div>
    </main>
  );
}
