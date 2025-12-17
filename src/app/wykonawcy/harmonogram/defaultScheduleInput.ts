import type { ScheduleInput } from "@/lib/schedule/scheduleEngine";

// Jak testowac szybko:
// - Zmien `ekipyInstalacyjne` z 1 na 2 i obserwuj skrocenie czasu.
// - Zmien `dostepnoscLokaliPct` na 70% (preset) i zobacz wzrost czasu organizacyjnego.
export const DEFAULT_SCHEDULE_INPUT: ScheduleInput = {
  startDateISO: new Date().toISOString().slice(0, 10),
  budynek: {
    // Typowy blok z lat 80.
    klatki: 2,
    kondygnacje: 10,
    pionyNaKlatke: 2,
    lokale: 80,
  },
  zakres: {
    zw: true,
    cwu: true,
    cyrkulacja: true,
  },
  robotyWspolne: {
    piwnica: true,
    wezel: true,
  },
  organizacja: {
    ekipyInstalacyjne: 1,
    ekipyOdtworzeniowe: 1,
    maxRownoleglychPionow: 2,
    buforCzasowyPct: 10,
  },
  dostepnosc: {
    dostepnoscLokaliPct: 70,
  },
  odtworzenia: {
    odtworzenia: "standard",
  },
};
