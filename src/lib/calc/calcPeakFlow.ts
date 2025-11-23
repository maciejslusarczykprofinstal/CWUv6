// Obliczanie szczytowego poboru CWU [L/min]
export function calcPeakFlow(apartments: number, hasBathtubs: boolean): number {
  // jednostkowy pobór
  const unitFlow = hasBathtubs ? 16 : 12;
  // współczynnik jednoczesności φ
  const phi = apartments > 40 ? 0.20 : 0.25;
  // wzór: L_szczyt = liczba_mieszkań × jednostkowy_pobór × φ
  return apartments * unitFlow * phi;
}
