import Link from "next/link";

export default function KontaktPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 p-6">
      <div className="max-w-lg w-full bg-slate-900/80 rounded-2xl shadow-2xl border border-blue-900 p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-200 mb-4">Kontakt</h1>
        <p className="text-slate-300 text-lg mb-6 text-center">
          Skontaktuj się z nami w sprawie audytów, modernizacji lub współpracy.<br />
          Odpowiadamy szybko i konkretnie!
        </p>
        <div className="w-full flex flex-col gap-2 text-center">
          <div>
            <span className="font-semibold text-blue-400">E-mail:</span> <a href="mailto:maciejslusarczykpi@gmail.com" className="underline text-blue-300">maciejslusarczykpi@gmail.com</a>
          </div>
          <div>
            <span className="font-semibold text-blue-400">Telefon:</span> <a href="tel:+48798513011" className="underline text-blue-300">+48 798 513 011</a>
          </div>
          <div>
            <span className="font-semibold text-blue-400">Adres:</span> 31-455 Kraków ul. Seniorów Lotnictwa 10/55
          </div>
        </div>
        <div className="mt-8">
          <Link href="/" className="text-blue-400 underline hover:text-blue-200">Powrót na stronę główną</Link>
        </div>
      </div>
    </div>
  );
}
