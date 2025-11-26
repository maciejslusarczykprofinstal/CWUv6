import Link from "next/link";
import { Gauge, Activity } from "lucide-react";

export default function AudytorzyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 relative overflow-x-hidden">
      {/* Dekoracyjne gradientowe blury w tle */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-blue-800/40 via-cyan-700/20 to-slate-900/0 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 right-0 w-[320px] h-[320px] bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-slate-900/0 rounded-full blur-2xl pointer-events-none z-0" />
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-blue-600 bg-clip-text text-transparent drop-shadow-xl">
            Audytorzy
          </h1>
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-blue-900/80 via-cyan-900/70 to-slate-900/80 border border-cyan-700 shadow-lg text-left">
            <h3 className="text-xl font-extrabold text-cyan-300 mb-2">Przepisy, Normy, Rzeczywistość - krótki wstęp</h3>
            <hr className="my-2 border-cyan-700" />
            <div className="text-sm text-blue-100 leading-relaxed space-y-3">
              <b>1️⃣ Przepisy dot. obliczania energii na podgrzanie CWU</b><br />
              Tu nie ma jednego magicznego paragrafu z wzorem, ale są akty, które wskazują metody i normy, z których masz korzystać.<br />
              <b>a) Metodologia charakterystyki energetycznej – CWU</b><br />
              Rozporządzenie MIiR z 3 czerwca 2014 r. w sprawie metodologii obliczania charakterystyki energetycznej budynku… – z późn. zmianami.<br />
              Tam, w załącznikach, masz opisaną metodę obliczania energii na CWU, profile użytkowania, wartości domyślne itp.<br />
              To rozporządzenie mówi: jak liczyć energię użytkową, końcową i pierwotną, w tym na ciepłą wodę – i odsyła do norm PN-EN (np. PN-EN ISO 52016-1) i wartości domyślnych w załącznikach.<br />
              <b>b) Norma projektowa do CWU – przepływy i moc</b><br />
              W praktyce wszyscy jadą na tej PN-ce: PN-92/B-01706 „Instalacje wodociągowe. Wymiarowanie”<br />
              Wprost ją przywołują np. wytyczne projektowania węzłów cieplnych:<br />
              „Obliczenia zapotrzebowania na ciepło dla potrzeb ciepłej wody użytkowej w budynkach mieszkalnych należy wykonać na podstawie normy PN-92/B-01706”<br />
              Tam masz metody wyznaczania: godzinowego i maksymalnego zapotrzebowania na CWU, przepływu obliczeniowego, co potem przekładasz na moc:<br />
              <span className="font-mono text-cyan-200">Q˙=ρ⋅c⋅ΔT⋅V˙</span><br />
              I to jest de facto normatywna podstawa do wyznaczania mocy na CWU dla węzłów.<br />
              <b>c) Normy zużycia wody (gdy brak pomiarów)</b><br />
              Jeżeli brakuje danych o realnym zużyciu, wchodzą normy zużycia wody:<br />
              Rozporządzenie Ministra Infrastruktury z 14.01.2002 r. w sprawie określenia przeciętnych norm zużycia wody.<br />
              To rozporządzenie daje l/ osobę / dobę dla różnych typów budynków. Potem z tego + ΔT + c·ρ wyciągasz energię/GJ/rok na CWU.<br />
              <b>d) Warunki techniczne – temperatura CWU</b><br />
              Rozporządzenie w sprawie warunków technicznych (MI z 12.04.2002 – WT):<br />
              – wymaga, aby temperatura CWU w punktach czerpalnych była 55–60°C.<br />
              Czyli nie mówi „jak liczyć”, ale ustala warunek brzegowy do obliczeń (ΔT).<br />
              <hr className="my-2 border-cyan-700" />
              <b>2️⃣ Przepisy i normy dot. mocy zamówionej (w tym na CWU)</b><br />
              Tutaj jest jeszcze bardziej „okołoprawnie” niż czysto technicznie.<br />
              <b>a) Ustawa – poziom ogólny</b><br />
              Prawo energetyczne – ustawa z 10 kwietnia 1997 r. (tekst jednolity aktualny).<br />
              Ona ogólnie reguluje: zasady zaopatrzenia w ciepło, obowiązek sporządzania taryf, relacje odbiorca–przedsiębiorstwo.<br />
              Nie daje wzoru na kW, ale jest „parasolem” dla rozporządzenia taryfowego.<br />
              <b>b) Rozporządzenie taryfowe – definicja mocy zamówionej</b><br />
              Rozporządzenie Ministra Klimatu z 7 kwietnia 2020 r. w sprawie szczegółowych zasad kształtowania i kalkulacji taryf oraz rozliczeń za ciepło (Dz.U. 2020 poz. 718 – aktualne „taryfowe”).<br />
              Tam masz klucz:<br />
              „Zamówiona moc cieplna” – to największa moc cieplna, jaka w danym obiekcie wystąpi w warunkach obliczeniowych, niezbędna do:<br />
              1. pokrycia strat ciepła (utrzymanie normatywnej temperatury i wymiany powietrza),<br />
              2. utrzymania normatywnej temperatury ciepłej wody w punktach czerpalnych,<br />
              3. pracy innych instalacji / technologii.<br />
              Czyli CWU jest wprost w definicji mocy zamówionej.<br />
              Rozporządzenie nie podaje wzoru, ale mówi: masz przyjąć taką moc, która zapewni ww. warunki.<br />
              Rozporządzenie taryfowe też dzieli opłatę stałą na: część za moc na CO, osobno za moc na podgrzanie wody.<br />
              <b>c) Jak z tego wychodzi „ile kW zamówić na CWU”?</b><br />
              Prawo mówi co ma być zapewnione, a jak policzyć – odsyła do norm i warunków technicznych. W praktyce wygląda to tak:<br />
              1. Przepływ i zapotrzebowanie na CWU – PN-92/B-01706 + ew. normy zużycia wody z rozporządzenia z 14.01.2002, gdy brak pomiarów.<br />
              2. Parametry temperatury – WT (55–60°C CWU, typowo 10°C woda zimna).<br />
              3. Z tego liczysz moc obliczeniową na CWU (kW) i sumujesz z CO (PN-EN 12831 dla ogrzewania) – to daje Ci moc techniczną.<br />
              4. Moc zamówiona w umowie – na podstawie tej mocy technicznej, ale już pod postacią jednej liczby w umowie z dostawcą ciepła, rozbitą finansowo na CO i CWU wg rozporządzenia taryfowego.<br />
              Dodatkowo wielu dostawców ciepła (MPEC, ECS, itp.) wydaje własne „Wytyczne do projektowania węzłów cieplnych”, gdzie na twardo piszą, że:<br />
              • CWU liczyć wg PN-92/B-01706,<br />
              • temperatury jak w WT,<br />
              • i to jest dla nich benchmark przy weryfikacji Twojej mocy zamówionej.<br />
              To nie jest ustawa, ale w praktyce – quasi-prawo przez warunki przyłączenia.<br />
              <hr className="my-2 border-cyan-700" />
              <b>3️⃣ Czy jest przepis typu „na mieszkanie 0,25 kW na CWU”?</b><br />
              Nie. I tu jest haczyk, który pewnie wyczuwasz:<br />
              • Żaden akt rangi ustawy/rozporządzenia nie mówi wprost: „dla budynku X zamów moc Y kW na CWU”.<br />
              • Masz: definicję mocy zamówionej (rozporządzenie taryfowe), metodykę liczenia energii CWU (rozporządzenie o charakterystyce energetycznej), normy projektowe (PN-92/B-01706, PN-EN, WT), i lokalne wytyczne dostawców.<br />
              Reszta to już Twoja robota inżynierska + ewentualny audyt energetyczny jako podkład przy zmianie mocy zamówionej.<br />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-700 via-blue-700 to-blue-900 text-white text-lg font-bold shadow-lg border-2 border-cyan-400">
              Nasz program radykalnie przyspieszy Twoje obliczenia, wyeliminuje ryzyko błędów i pokaże realne oszczędności dla inwestora i mieszkańców — szybko, pewnie i transparentnie.
            </div>
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-blue-900/80 via-cyan-900/70 to-slate-900/80 border border-blue-700 shadow-lg text-left">
              <h4 className="text-lg font-bold text-cyan-300 mb-2">PROF INSTAL CWU</h4>
              <p className="text-base text-blue-100 leading-relaxed">
                PROF INSTAL CWU to zaawansowane narzędzie inżynierskie, które automatyzuje cały proces analizy instalacji ciepłej wody użytkowej. Program nie tylko oblicza moc zamówioną, straty cyrkulacyjne i realne zużycie energii — on przeprowadza pełną diagnostykę techniczno-finansową budynku.<br /><br />
                Generuje raporty eksperckie, wykresy, analizy efektywności, wskazuje ukryte straty energetyczne, a także pokazuje konkretne możliwości oszczędności w skali roku i całego okresu eksploatacji.<br /><br />
                Dzięki modułowi ekonomicznemu program wylicza koszty modernizacji, czas zwrotu inwestycji, a także wpływ zmian na emisję CO₂ i korzyści ekologiczne wynikające z poprawy efektywności systemu.<br /><br />
                To kompletne rozwiązanie dla spółdzielni, wspólnot, zarządców i audytorów — od szybkiej diagnozy aż po profesjonalny dokument gotowy do przedstawienia mieszkańcom lub organom nadzorczym.
              </p>
            </div>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Wybierz działanie audytowe lub kalkulacyjne, które chcesz wykonać.
          </p>
        </div>

        {/* Karty nawigacyjne */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Link
            href="/audytorzy/liczniki"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-pink-700/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-700/10 via-purple-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-700 via-purple-700 to-blue-900 text-pink-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-200 group-hover:text-pink-300 transition-colors">
                  Liczniki
                </span>
                <span className="text-sm text-slate-400">
                  Analiza odczytów liczników ciepła
                </span>
              </span>
            </div>
          </Link>

          <Link
            href="/audytorzy/moc-zamowiona"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-blue-700/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-700/10 via-blue-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 text-cyan-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gauge className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  Moc zamówiona CWU
                </span>
                <span className="text-sm text-slate-400">
                  Kalkulator mocy zamówionej na CWU
                </span>
              </span>
            </div>
          </Link>

          <Link
            href="/audytorzy/analiza-finansowa"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-900/80 via-yellow-700/80 to-blue-950/80 border-0 shadow-2xl backdrop-blur-md p-8 transition-all duration-300 hover:scale-105 hover:shadow-yellow-700/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-700/10 via-orange-700/10 to-slate-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-400 to-orange-900 text-yellow-100 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Gauge className="h-7 w-7" />
              </span>
              <span className="flex flex-col">
                <span className="text-xl font-bold text-slate-200 group-hover:text-yellow-300 transition-colors">
                  Analiza Finansowa Audytora
                </span>
                <span className="text-sm text-slate-400">
                  Pełna analiza kosztów, oszczędności i wariantów modernizacji
                </span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}