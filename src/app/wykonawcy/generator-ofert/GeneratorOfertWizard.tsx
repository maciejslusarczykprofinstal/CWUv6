import React, { useState } from "react";

// Typy danych
export interface ContractorData {
  companyName: string;
  contactName: string;
  nip?: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
}
export interface ClientData {
  name: string;
  address: string;
  contactName: string;
  phone: string;
  email: string;
}
export interface BuildingData {
  address?: string;
  flats?: number;
  risers?: number;
  floors?: number;
  installationType?: string;
  yearBuilt?: number;
  hasCirculation?: string;
  levelLength?: number;
}
export interface OfferScopeItem {
  label: string;
  included: boolean;
  description: string;
  cost: number;
}
export interface OfferVariant {
  name: string;
  items: OfferScopeItem[];
}
export interface OfferSettings {
  vatRate: number;
  realizationTime: string;
  validity: string;
  paymentTerms: string;
  notes: string;
}
export interface OfferData {
  contractor: ContractorData;
  client: ClientData;
  building: BuildingData;
  scope: OfferScopeItem[];
  pricing: {
    variants: OfferVariant[];
    activeVariant: number;
  };
  settings: OfferSettings;
}

const defaultOfferData: OfferData = {
  contractor: {
    companyName: "Instal-Bud Sp. z o.o.",
    contactName: "Jan Kowalski",
    nip: "123-456-32-18",
    address: "ul. Przykładowa 12, 00-123 Warszawa",
    phone: "+48 501 234 567",
    email: "biuro@instal-bud.pl",
    logoUrl: "https://placehold.co/120x40?text=LOGO",
  },
  client: {
    name: "Wspólnota Mieszkaniowa Zielona 8",
    address: "ul. Zielona 8, 00-234 Warszawa",
    contactName: "Anna Nowak",
    phone: "+48 502 345 678",
    email: "zarzad@zielona8.pl",
  },
  building: {
    address: "ul. Zielona 8, 00-234 Warszawa",
    flats: 80,
    risers: 20,
    floors: 5,
    installationType: "stal ocynk",
    yearBuilt: 1980,
    hasCirculation: "TAK",
    levelLength: 200,
  },
  scope: [],
  pricing: {
    variants: [
      {
        name: "Wariant podstawowy",
        items: [],
      },
      {
        name: "Wariant rozszerzony",
        items: [],
      },
    ],
    activeVariant: 0,
  },
  settings: {
    vatRate: 23,
    realizationTime: "4–6 tygodni od podpisania umowy",
    validity: "30 dni od daty wystawienia",
    paymentTerms: "30% zaliczki, 70% po odbiorze",
    notes: "",
  },
};

const defaultScopeOptions: OfferScopeItem[] = [
  {
    label: "Wymiana pionów instalacji CWU",
    included: false,
    description: "Wymiana pionów instalacji CWU na nowe, zgodnie z projektem.",
    cost: 0,
  },
  {
    label: "Wymiana cyrkulacji CWU",
    included: false,
    description: "Wymiana rur cyrkulacyjnych na nowe, poprawa efektywności.",
    cost: 0,
  },
  {
    label: "Wymiana poziomów piwnicznych",
    included: false,
    description: "Wymiana poziomych odcinków instalacji w piwnicy.",
    cost: 0,
  },
  {
    label: "Wymiana podejść do mieszkań",
    included: false,
    description: "Wymiana podejść do mieszkań na nowe rury.",
    cost: 0,
  },
  {
    label: "Montaż nowej izolacji na rurach CWU i cyrkulacji",
    included: false,
    description: "Montaż nowej izolacji termicznej na rurach CWU i cyrkulacji.",
    cost: 0,
  },
  {
    label: "Modernizacja węzła cieplnego (wymiana wymiennika / pompy / automatyki)",
    included: false,
    description: "Modernizacja węzła cieplnego: wymiana wymiennika, pompy, automatyki.",
    cost: 0,
  },
  {
    label: "Montaż zaworów podpionowych i regulacja hydrauliczna",
    included: false,
    description: "Montaż zaworów podpionowych oraz regulacja hydrauliczna cyrkulacji.",
    cost: 0,
  },
  {
    label: "Demontaż i utylizacja starej instalacji",
    included: false,
    description: "Demontaż i utylizacja starej instalacji oraz złomu.",
    cost: 0,
  },
  {
    label: "Prace odtworzeniowe (tynki, malowanie, zabudowy)",
    included: false,
    description: "Prace odtworzeniowe po wymianie instalacji: tynki, malowanie, zabudowy.",
    cost: 0,
  },
];

function calculateTotals(offerData: OfferData): {net: number; vat: number; gross: number} {
  const items = offerData.pricing.variants[offerData.pricing.activeVariant].items;
  const net = items.filter(i => i.included).reduce((sum, i) => sum + (i.cost || 0), 0);
  const vat = Math.round(net * (offerData.settings.vatRate / 100));
  const gross = net + vat;
  return { net, vat, gross };
}

export const GeneratorOfertWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [offerData, setOfferData] = useState<OfferData>({
    ...defaultOfferData,
    scope: defaultScopeOptions,
    pricing: {
      variants: [
        { name: "Wariant podstawowy", items: defaultScopeOptions.map(o => ({ ...o })) },
        { name: "Wariant rozszerzony", items: defaultScopeOptions.map(o => ({ ...o })) },
      ],
      activeVariant: 0,
    },
  });
  const [editBothVariants, setEditBothVariants] = useState(true);

  // Stub funkcji wczytania danych z szybkiej wyceny
  function loadFromQuickEstimate() {
    // TODO: integracja z kalkulatorem SzybkaWycenaWizard
    alert("Funkcja wczytywania danych z szybkiej wyceny będzie dostępna w przyszłości.");
  }

  // Stub eksportu PDF
  function handleExportPDF() {
    // TODO: integracja z generatorem PDF
    alert("Eksport PDF będzie dostępny w przyszłości.");
  }

  // Stub wysyłki maila
  function handleSendEmail() {
    // TODO: integracja z backendem/mailgun
    alert("Wysyłka e-mail będzie dostępna w przyszłości.");
  }

  // Pasek kroków
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={`flex flex-col items-center gap-1 ${step === n ? "" : "opacity-60"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${step === n ? "bg-green-600 text-white" : "bg-slate-800 text-green-300"}`}>{n}</div>
          <span className="text-xs font-semibold text-green-300">
            {n === 1 && "Dane"}
            {n === 2 && "Zakres"}
            {n === 3 && "Ceny"}
            {n === 4 && "Podgląd"}
          </span>
        </div>
      ))}
    </div>
  );

  // Krok 1: Dane wykonawcy i klienta
  const Step1 = () => (
    <form className="space-y-6" onSubmit={e => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <fieldset className="border border-green-800 rounded-xl p-4">
          <legend className="text-green-400 font-bold mb-2">Dane wykonawcy</legend>
          <label className="block text-sm font-semibold text-green-300 mb-1">Nazwa firmy</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.contractor.companyName} onChange={e => setOfferData(d => ({ ...d, contractor: { ...d.contractor, companyName: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">Imię i nazwisko osoby kontaktowej</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.contractor.contactName} onChange={e => setOfferData(d => ({ ...d, contractor: { ...d.contractor, contactName: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">NIP <span className="text-xs text-slate-400">(opcjonalnie)</span></label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.contractor.nip} onChange={e => setOfferData(d => ({ ...d, contractor: { ...d.contractor, nip: e.target.value } }))} />
          <label className="block text-sm font-semibold text-green-300 mb-1">Adres firmy</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.contractor.address} onChange={e => setOfferData(d => ({ ...d, contractor: { ...d.contractor, address: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">Telefon</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.contractor.phone} onChange={e => setOfferData(d => ({ ...d, contractor: { ...d.contractor, phone: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">E-mail</label>
          <input type="email" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.contractor.email} onChange={e => setOfferData(d => ({ ...d, contractor: { ...d.contractor, email: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">Logo firmy <span className="text-xs text-slate-400">(URL, TODO: upload)</span></label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={offerData.contractor.logoUrl} onChange={e => setOfferData(d => ({ ...d, contractor: { ...d.contractor, logoUrl: e.target.value } }))} />
        </fieldset>
        <fieldset className="border border-green-800 rounded-xl p-4">
          <legend className="text-green-400 font-bold mb-2">Dane klienta</legend>
          <label className="block text-sm font-semibold text-green-300 mb-1">Nazwa / Wspólnota / Spółdzielnia / Gmina</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.client.name} onChange={e => setOfferData(d => ({ ...d, client: { ...d.client, name: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">Adres budynku</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.client.address} onChange={e => setOfferData(d => ({ ...d, client: { ...d.client, address: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">Osoba kontaktowa</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.client.contactName} onChange={e => setOfferData(d => ({ ...d, client: { ...d.client, contactName: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">Telefon</label>
          <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700 mb-2" value={offerData.client.phone} onChange={e => setOfferData(d => ({ ...d, client: { ...d.client, phone: e.target.value } }))} required />
          <label className="block text-sm font-semibold text-green-300 mb-1">E-mail</label>
          <input type="email" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={offerData.client.email} onChange={e => setOfferData(d => ({ ...d, client: { ...d.client, email: e.target.value } }))} required />
        </fieldset>
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg transition-all hover:scale-105" onClick={loadFromQuickEstimate}>
          Wczytaj dane z poprzedniej wyceny
        </button>
        <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg transition-all hover:scale-105" onClick={() => setStep(2)}>
          Dalej
        </button>
      </div>
    </form>
  );

  // Krok 2: Zakres prac i warianty
  const Step2 = () => (
    <form className="space-y-6" onSubmit={e => e.preventDefault()}>
      <div className="mb-4">
        <label className="flex items-center gap-2 text-green-400 font-bold">
          <input type="checkbox" checked={editBothVariants} onChange={() => setEditBothVariants(e => !e)} />
          Zastosuj te same pozycje dla wariantu rozszerzonego (edytuj tylko ceny i opisy)
        </label>
      </div>
      <div className="flex gap-4 mb-4">
        {[0, 1].map(idx => (
          <button
            key={idx}
            type="button"
            className={`px-4 py-2 rounded-xl font-bold border ${offerData.pricing.activeVariant === idx ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-300 border-slate-700"}`}
            onClick={() => setOfferData(d => ({ ...d, pricing: { ...d.pricing, activeVariant: idx } }))}
          >
            {offerData.pricing.variants[idx].name}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {offerData.pricing.variants[offerData.pricing.activeVariant].items.map((item, i) => (
          <div key={item.label} className="border border-green-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
            <label className="flex items-center gap-2 font-semibold text-green-300">
              <input
                type="checkbox"
                checked={item.included}
                onChange={e => {
                  setOfferData(d => {
                    const variants = d.pricing.variants.map((v, idx) => {
                      if (editBothVariants || idx === d.pricing.activeVariant) {
                        const items = v.items.map((it, j) =>
                          j === i ? { ...it, included: e.target.checked } : it
                        );
                        return { ...v, items };
                      }
                      return v;
                    });
                    return { ...d, pricing: { ...d.pricing, variants } };
                  });
                }}
              />
              {item.label}
            </label>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700"
                value={item.description}
                onChange={e => {
                  setOfferData(d => {
                    const variants = d.pricing.variants.map((v, idx) => {
                      if (editBothVariants || idx === d.pricing.activeVariant) {
                        const items = v.items.map((it, j) =>
                          j === i ? { ...it, description: e.target.value } : it
                        );
                        return { ...v, items };
                      }
                      return v;
                    });
                    return { ...d, pricing: { ...d.pricing, variants } };
                  });
                }}
              />
              <span className="text-xs text-green-400 whitespace-nowrap">opis</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                className="w-32 rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700"
                value={item.cost}
                onChange={e => {
                  setOfferData(d => {
                    const variants = d.pricing.variants.map((v, idx) => {
                      if (editBothVariants || idx === d.pricing.activeVariant) {
                        const items = v.items.map((it, j) =>
                          j === i ? { ...it, cost: Number(e.target.value) } : it
                        );
                        return { ...v, items };
                      }
                      return v;
                    });
                    return { ...d, pricing: { ...d.pricing, variants } };
                  });
                }}
              />
              <span className="text-xs text-green-400 whitespace-nowrap">zł</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-slate-700 to-green-700 text-white shadow-lg hover:scale-105 transition-all" onClick={() => setStep(1)}>
          Wstecz
        </button>
        <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={() => setStep(3)}>
          Dalej
        </button>
      </div>
    </form>
  );

  // Krok 3: Podsumowanie cen i warunki
  const Step3 = () => {
    const totals = calculateTotals(offerData);
    return (
      <div className="space-y-6">
        <div className="flex gap-4 mb-4">
          {[0, 1].map(idx => (
            <button
              key={idx}
              type="button"
              className={`px-4 py-2 rounded-xl font-bold border ${offerData.pricing.activeVariant === idx ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-300 border-slate-700"}`}
              onClick={() => setOfferData(d => ({ ...d, pricing: { ...d.pricing, activeVariant: idx } }))}
            >
              {offerData.pricing.variants[idx].name}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-green-800 rounded-xl mb-4">
            <thead>
              <tr className="bg-green-900 text-green-200">
                <th className="px-3 py-2">Pozycja</th>
                <th className="px-3 py-2">Opis</th>
                <th className="px-3 py-2">Cena netto</th>
              </tr>
            </thead>
            <tbody>
              {offerData.pricing.variants[offerData.pricing.activeVariant].items.filter(i => i.included).map(item => (
                <tr key={item.label} className="border-b border-green-800">
                  <td className="px-3 py-2 font-semibold text-green-300">{item.label}</td>
                  <td className="px-3 py-2 text-green-100">{item.description}</td>
                  <td className="px-3 py-2 text-green-100">{item.cost.toLocaleString("pl-PL")} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:gap-8">
            <div className="mb-2 md:mb-0">
              <span className="font-bold text-green-300">Suma netto:</span> {totals.net.toLocaleString("pl-PL")} zł
            </div>
            <div className="mb-2 md:mb-0">
              <span className="font-bold text-green-300">VAT:</span>
              <select className="ml-2 rounded bg-slate-900 text-green-200 px-2 py-1 border border-green-700" value={offerData.settings.vatRate} onChange={e => setOfferData(d => ({ ...d, settings: { ...d.settings, vatRate: Number(e.target.value) } }))}>
                {[23, 8].map(rate => <option key={rate} value={rate}>{rate}%</option>)}
              </select>
            </div>
            <div>
              <span className="font-bold text-green-300">Suma brutto:</span> {totals.gross.toLocaleString("pl-PL")} zł
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-green-300 mb-1">Termin realizacji</label>
            <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={offerData.settings.realizationTime} onChange={e => setOfferData(d => ({ ...d, settings: { ...d.settings, realizationTime: e.target.value } }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-300 mb-1">Termin ważności oferty</label>
            <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={offerData.settings.validity} onChange={e => setOfferData(d => ({ ...d, settings: { ...d.settings, validity: e.target.value } }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-300 mb-1">Warunki płatności</label>
            <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={offerData.settings.paymentTerms} onChange={e => setOfferData(d => ({ ...d, settings: { ...d.settings, paymentTerms: e.target.value } }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-300 mb-1">Uwagi techniczne / dodatkowe</label>
            <textarea className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" rows={3} value={offerData.settings.notes} onChange={e => setOfferData(d => ({ ...d, settings: { ...d.settings, notes: e.target.value } }))} />
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-slate-700 to-green-700 text-white shadow-lg hover:scale-105 transition-all" onClick={() => setStep(2)}>
            Wstecz
          </button>
          <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={() => setStep(4)}>
            Przejdź do podglądu oferty
          </button>
        </div>
      </div>
    );
  };

  // Krok 4: Podgląd oferty + eksport
  const Step4 = () => {
    const totals = calculateTotals(offerData);
    const variant = offerData.pricing.variants[offerData.pricing.activeVariant];
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 text-slate-900 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:gap-8 mb-6">
          {offerData.contractor.logoUrl && (
            <img src={offerData.contractor.logoUrl} alt="Logo firmy" className="h-16 mb-4 md:mb-0" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-1">{offerData.contractor.companyName}</h2>
            <div className="text-sm text-slate-700">{offerData.contractor.address}</div>
            <div className="text-sm text-slate-700">Tel: {offerData.contractor.phone} | E-mail: {offerData.contractor.email}</div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-700 mb-1">Dane klienta</h3>
          <div className="text-sm text-slate-700">{offerData.client.name}</div>
          <div className="text-sm text-slate-700">{offerData.client.address}</div>
          <div className="text-sm text-slate-700">Osoba kontaktowa: {offerData.client.contactName}</div>
          <div className="text-sm text-slate-700">Tel: {offerData.client.phone} | E-mail: {offerData.client.email}</div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-700 mb-1">Oferta na modernizację instalacji ciepłej wody użytkowej</h3>
          {offerData.building.address && (
            <div className="text-sm text-slate-700 mb-1">Adres budynku: {offerData.building.address}</div>
          )}
          {offerData.building.flats && (
            <div className="text-sm text-slate-700">Liczba mieszkań: {offerData.building.flats}</div>
          )}
          {offerData.building.risers && (
            <div className="text-sm text-slate-700">Liczba pionów CWU: {offerData.building.risers}</div>
          )}
          {offerData.building.floors && (
            <div className="text-sm text-slate-700">Liczba kondygnacji: {offerData.building.floors}</div>
          )}
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-700 mb-1">Zakres prac</h3>
          <ul className="list-disc pl-6 text-slate-700">
            {variant.items.filter(i => i.included).map(item => (
              <li key={item.label}><b>{item.label}:</b> {item.description}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-700 mb-1">Koszty</h3>
          <table className="w-full text-sm text-left border border-green-800 rounded-xl mb-4">
            <thead>
              <tr className="bg-green-100 text-green-700">
                <th className="px-3 py-2">Pozycja</th>
                <th className="px-3 py-2">Cena netto</th>
              </tr>
            </thead>
            <tbody>
              {variant.items.filter(i => i.included).map(item => (
                <tr key={item.label} className="border-b border-green-200">
                  <td className="px-3 py-2 font-semibold text-green-700">{item.label}</td>
                  <td className="px-3 py-2 text-green-700">{item.cost.toLocaleString("pl-PL")} zł</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col md:flex-row md:items-center md:gap-8">
            <div className="mb-2 md:mb-0">
              <span className="font-bold text-green-700">Suma netto:</span> {totals.net.toLocaleString("pl-PL")} zł
            </div>
            <div className="mb-2 md:mb-0">
              <span className="font-bold text-green-700">VAT:</span> {totals.vat.toLocaleString("pl-PL")} zł
            </div>
            <div>
              <span className="font-bold text-green-700">Suma brutto:</span> {totals.gross.toLocaleString("pl-PL")} zł
            </div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-bold text-green-700 mb-1">Warunki</h3>
          <div className="text-sm text-slate-700">Termin realizacji: {offerData.settings.realizationTime}</div>
          <div className="text-sm text-slate-700">Termin ważności oferty: {offerData.settings.validity}</div>
          <div className="text-sm text-slate-700">Warunki płatności: {offerData.settings.paymentTerms}</div>
          {offerData.settings.notes && (
            <div className="text-sm text-slate-700">Uwagi: {offerData.settings.notes}</div>
          )}
        </div>
        <div className="mb-6 text-sm text-slate-500">
          Oferta została wygenerowana automatycznie na podstawie danych budynku i zakresu prac. Finalna oferta wymaga weryfikacji przez specjalistę.
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={() => window.print()}>
            Drukuj ofertę
          </button>
          <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={handleExportPDF}>
            Eksportuj do PDF
          </button>
          <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={handleSendEmail}>
            Wyślij ofertę e-mailem
          </button>
          <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-slate-700 to-green-700 text-white shadow-lg hover:scale-105 transition-all" onClick={() => setStep(2)}>
            Edytuj ofertę
          </button>
        </div>
        <div className="mt-8 text-xs text-slate-400 text-center">
          Generator ofert dla wykonawców – przygotuj profesjonalną ofertę na modernizację instalacji CWU w kilka minut.
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/80 rounded-3xl shadow-2xl p-6 md:p-10 space-y-8">
      <h2 className="text-2xl md:text-3xl font-bold text-green-200 mb-2 text-center">Generator ofert dla wykonawców</h2>
      <p className="text-sm text-green-300 text-center mb-6">Przygotuj profesjonalną ofertę na modernizację instalacji CWU w kilka minut.</p>
      <StepIndicator />
      <div className="text-xs text-slate-400 text-center mb-6">Na podstawie danych budynku i zakresu prac wygenerujemy dla Ciebie ofertę, którą możesz od razu wysłać klientowi.</div>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </div>
  );
};

export default GeneratorOfertWizard;
