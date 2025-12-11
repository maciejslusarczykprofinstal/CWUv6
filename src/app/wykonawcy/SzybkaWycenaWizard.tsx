import React, { useState } from "react";
import Link from "next/link";

// Typ danych formularza
export interface BuildingFormData {
  flats: number;
  risers: number;
  floors: number;
  installationType: "stal ocynk" | "stal czarna" | "miedź" | "PP" | "PVC";
  yearBuilt: number;
  hasCirculation: "TAK" | "NIE";
  levelLength?: number;
}

export interface ModernizationScope {
  wymiana: string[];
  izolacja: string[];
  modernizacja: string[];
  dodatkowe: string[];
  wariantOptymalny: boolean;
}

export interface EstimateResult {
  materialCost: number;
  laborCost: number;
  totalCost: number;
}

const installationTypes = ["stal ocynk", "stal czarna", "miedź", "PP", "PVC"];
const circulationOptions = ["TAK", "NIE"];

const wymianaOptions = [
  "Wymiana pionów CWU",
  "Wymiana cyrkulacji",
  "Wymiana poziomów piwnicznych",
  "Wymiana podejść do mieszkań",
];
const izolacjaOptions = [
  "Nowa izolacja rur CWU",
  "Nowa izolacja pionów i poziomów",
  "Izolacja cyrkulacji",
];
const modernizacjaOptions = [
  "Wymiana wymiennika",
  "Modernizacja pompy cyrkulacji",
  "Modernizacja automatyki węzła",
];
const dodatkoweOptions = [
  "Montaż zaworów podpionowych",
  "Regulacja hydrauliczna cyrkulacji",
  "Usunięcie starych rur i złomu",
  "Prowadzenie rur w szachtach / bruzdach",
];

const defaultFormData: BuildingFormData = {
  flats: 80,
  risers: 20,
  floors: 5,
  installationType: "stal ocynk",
  yearBuilt: 1980,
  hasCirculation: "TAK",
  levelLength: 200,
};

const defaultScope: ModernizationScope = {
  wymiana: [],
  izolacja: [],
  modernizacja: [],
  dodatkowe: [],
  wariantOptymalny: false,
};

function calculateEstimate(formData: BuildingFormData, scope: ModernizationScope): EstimateResult {
  // Przykładowe stawki (do edycji):
  const pionStawka = 1200; // zł za pion
  const mieszkanieStawka = 800; // zł za mieszkanie
  const kondygnacjaStawka = 500; // zł za kondygnację
  const poziomStawka = 100; // zł za metr poziomu
  const uslugaStawka = 1500; // zł za usługę (np. wymiana wymiennika)

  let materialCost = 0;
  let laborCost = 0;

  // Wymiana pionów
  if (scope.wymiana.includes("Wymiana pionów CWU")) {
    materialCost += formData.risers * pionStawka;
    laborCost += formData.risers * 600;
  }
  // Wymiana cyrkulacji
  if (scope.wymiana.includes("Wymiana cyrkulacji")) {
    materialCost += formData.risers * 900;
    laborCost += formData.risers * 500;
  }
  // Wymiana poziomów piwnicznych
  if (scope.wymiana.includes("Wymiana poziomów piwnicznych") && formData.levelLength) {
    materialCost += formData.levelLength * poziomStawka;
    laborCost += formData.levelLength * 80;
  }
  // Wymiana podejść do mieszkań
  if (scope.wymiana.includes("Wymiana podejść do mieszkań")) {
    materialCost += formData.flats * mieszkanieStawka;
    laborCost += formData.flats * 400;
  }
  // Izolacje
  if (scope.izolacja.length > 0) {
    materialCost += scope.izolacja.length * 1200;
    laborCost += scope.izolacja.length * 600;
  }
  // Modernizacje
  if (scope.modernizacja.length > 0) {
    materialCost += scope.modernizacja.length * uslugaStawka;
    laborCost += scope.modernizacja.length * 800;
  }
  // Dodatkowe
  if (scope.dodatkowe.length > 0) {
    materialCost += scope.dodatkowe.length * 500;
    laborCost += scope.dodatkowe.length * 300;
  }

  // Koszt za kondygnacje (opcjonalnie)
  materialCost += formData.floors * kondygnacjaStawka;
  laborCost += formData.floors * 200;

  return {
    materialCost,
    laborCost,
    totalCost: materialCost + laborCost,
  };
}

export const SzybkaWycenaWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BuildingFormData>(defaultFormData);
  const [scope, setScope] = useState<ModernizationScope>(defaultScope);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);

  // Walidacja krok 1
  const isStep1Valid =
    formData.flats > 0 &&
    formData.risers > 0 &&
    formData.floors > 0 &&
    formData.yearBuilt > 0;

  // Handler dla checkboxów
  const handleScopeChange = (group: keyof ModernizationScope, value: string) => {
    if (group === "wariantOptymalny") return;
    setScope((prev) => {
      const arr = prev[group] as string[];
      return {
        ...prev,
        [group]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  // Handler dla wariantu optymalnego
  const handleOptimalVariant = () => {
    setScope((prev) => ({
      ...prev,
      wariantOptymalny: !prev.wariantOptymalny,
      wymiana: !prev.wariantOptymalny
        ? ["Wymiana pionów CWU", "Wymiana cyrkulacji"]
        : [],
      izolacja: !prev.wariantOptymalny
        ? ["Nowa izolacja rur CWU", "Izolacja cyrkulacji"]
        : [],
      dodatkowe: !prev.wariantOptymalny
        ? ["Montaż zaworów podpionowych"]
        : [],
      modernizacja: !prev.wariantOptymalny ? [] : [],
    }));
  };

  // Przejście do kroku 3 i obliczenie wyceny
  const handleCalculate = () => {
    setEstimate(calculateEstimate(formData, scope));
    setStep(3);
  };

  // Pasek postępu
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {[1, 2, 3].map((n) => (
        <div key={n} className={`flex flex-col items-center gap-1 ${step === n ? "" : "opacity-60"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${step === n ? "bg-blue-600 text-white" : "bg-slate-800 text-blue-300"}`}>{n}</div>
          <span className="text-xs font-semibold text-blue-300">
            {n === 1 && "Dane budynku"}
            {n === 2 && "Zakres modernizacji"}
            {n === 3 && "Podsumowanie"}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/80 rounded-3xl shadow-2xl p-6 md:p-10 space-y-8">
      <h2 className="text-2xl md:text-3xl font-bold text-blue-200 mb-2 text-center">Szybka wycena modernizacji instalacji CWU dla wykonawców</h2>
      <p className="text-sm text-slate-300 text-center mb-6">Podaj podstawowe dane budynku, wybierz zakres prac, a my pomożemy Ci przygotować wstępną wycenę, którą pokażesz klientowi.</p>
      <StepIndicator />
      {step === 1 && (
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-1">Liczba mieszkań</label>
              <input type="number" min={1} className="w-full rounded-lg bg-slate-800 text-blue-100 px-3 py-2 border border-blue-700" value={formData.flats} onChange={e => setFormData(f => ({ ...f, flats: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-1">Liczba pionów CWU</label>
              <input type="number" min={1} className="w-full rounded-lg bg-slate-800 text-blue-100 px-3 py-2 border border-blue-700" value={formData.risers} onChange={e => setFormData(f => ({ ...f, risers: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-1">Liczba kondygnacji</label>
              <input type="number" min={1} className="w-full rounded-lg bg-slate-800 text-blue-100 px-3 py-2 border border-blue-700" value={formData.floors} onChange={e => setFormData(f => ({ ...f, floors: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-1">Rodzaj istniejącej instalacji</label>
              <select className="w-full rounded-lg bg-slate-800 text-blue-100 px-3 py-2 border border-blue-700" value={formData.installationType} onChange={e => setFormData(f => ({ ...f, installationType: e.target.value as BuildingFormData["installationType"] }))} required>
                {installationTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-1">Rok budowy</label>
              <input type="number" min={1800} max={2100} className="w-full rounded-lg bg-slate-800 text-blue-100 px-3 py-2 border border-blue-700" value={formData.yearBuilt} onChange={e => setFormData(f => ({ ...f, yearBuilt: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-1">Czy jest cyrkulacja?</label>
              <select className="w-full rounded-lg bg-slate-800 text-blue-100 px-3 py-2 border border-blue-700" value={formData.hasCirculation} onChange={e => setFormData(f => ({ ...f, hasCirculation: e.target.value as BuildingFormData["hasCirculation"] }))} required>
                {circulationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-blue-300 mb-1">Szacowana długość poziomów instalacji [m] <span className="text-xs text-slate-400">(opcjonalnie)</span></label>
              <input type="number" min={0} className="w-full rounded-lg bg-slate-800 text-blue-100 px-3 py-2 border border-blue-700" value={formData.levelLength ?? ""} onChange={e => setFormData(f => ({ ...f, levelLength: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button type="button" className={`px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg transition-all ${isStep1Valid ? "hover:scale-105" : "opacity-50 cursor-not-allowed"}`} disabled={!isStep1Valid} onClick={() => setStep(2)}>
              Dalej
            </button>
          </div>
        </form>
      )}
      {step === 2 && (
        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <fieldset className="border border-blue-800 rounded-xl p-4">
              <legend className="text-blue-400 font-bold mb-2">A) Wymiana instalacji</legend>
              {wymianaOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 mb-2 text-slate-200">
                  <input type="checkbox" checked={scope.wymiana.includes(opt)} onChange={() => handleScopeChange("wymiana", opt)} />
                  {opt}
                </label>
              ))}
            </fieldset>
            <fieldset className="border border-blue-800 rounded-xl p-4">
              <legend className="text-blue-400 font-bold mb-2">B) Izolacja</legend>
              {izolacjaOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 mb-2 text-slate-200">
                  <input type="checkbox" checked={scope.izolacja.includes(opt)} onChange={() => handleScopeChange("izolacja", opt)} />
                  {opt}
                </label>
              ))}
            </fieldset>
            <fieldset className="border border-blue-800 rounded-xl p-4">
              <legend className="text-blue-400 font-bold mb-2">C) Modernizacja węzła</legend>
              {modernizacjaOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 mb-2 text-slate-200">
                  <input type="checkbox" checked={scope.modernizacja.includes(opt)} onChange={() => handleScopeChange("modernizacja", opt)} />
                  {opt}
                </label>
              ))}
            </fieldset>
            <fieldset className="border border-blue-800 rounded-xl p-4">
              <legend className="text-blue-400 font-bold mb-2">D) Dodatkowe prace</legend>
              {dodatkoweOptions.map(opt => (
                <label key={opt} className="flex items-center gap-2 mb-2 text-slate-200">
                  <input type="checkbox" checked={scope.dodatkowe.includes(opt)} onChange={() => handleScopeChange("dodatkowe", opt)} />
                  {opt}
                </label>
              ))}
            </fieldset>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-blue-400 font-bold">
              <input type="checkbox" checked={scope.wariantOptymalny} onChange={handleOptimalVariant} />
              Zaproponuj wariant optymalny
            </label>
          </div>
          <div className="flex justify-between mt-6">
            <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-slate-700 to-blue-700 text-white shadow-lg hover:scale-105 transition-all" onClick={() => setStep(1)}>
              Wstecz
            </button>
            <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={handleCalculate}>
              Oblicz wstępną wycenę
            </button>
          </div>
        </form>
      )}
      {step === 3 && estimate && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Podsumowanie danych budynku</h3>
            <ul className="text-slate-200 text-sm space-y-1">
              <li>Liczba mieszkań: <b>{formData.flats}</b></li>
              <li>Liczba pionów CWU: <b>{formData.risers}</b></li>
              <li>Liczba kondygnacji: <b>{formData.floors}</b></li>
              <li>Typ instalacji: <b>{formData.installationType}</b></li>
              <li>Rok budowy: <b>{formData.yearBuilt}</b></li>
              <li>Cyrkulacja: <b>{formData.hasCirculation}</b></li>
              {formData.levelLength && <li>Długość poziomów: <b>{formData.levelLength} m</b></li>}
            </ul>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Zakres prac</h3>
            <ul className="text-slate-200 text-sm space-y-1">
              {scope.wymiana.map(opt => <li key={opt}>{opt}</li>)}
              {scope.izolacja.map(opt => <li key={opt}>{opt}</li>)}
              {scope.modernizacja.map(opt => <li key={opt}>{opt}</li>)}
              {scope.dodatkowe.map(opt => <li key={opt}>{opt}</li>)}
            </ul>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Wstępna wycena</h3>
            <ul className="text-slate-200 text-sm space-y-1">
              <li>Koszt materiałów (orientacyjnie): <b>{estimate.materialCost.toLocaleString("pl-PL")} zł</b></li>
              <li>Koszt robocizny (orientacyjnie): <b>{estimate.laborCost.toLocaleString("pl-PL")} zł</b></li>
              <li>Koszt całkowity (orientacyjnie): <b>{estimate.totalCost.toLocaleString("pl-PL")} zł</b></li>
            </ul>
            <p className="text-xs text-slate-400 mt-2">To jest wycena wstępna. Pełna wycena możliwa po kontakcie.</p>
          </div>
          <div className="text-center mt-6">
            <Link href="/kontakt" className="inline-block px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all">
              Poproś o szczegółową wycenę
            </Link>
          </div>
          <div className="text-xs text-slate-400 text-center mt-4">
            Kalkulator służy do szacowania kosztów. Finalna oferta wymaga weryfikacji przez specjalistę.
          </div>
        </div>
      )}
    </div>
  );
};

export default SzybkaWycenaWizard;
