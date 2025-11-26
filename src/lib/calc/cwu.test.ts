import { describe, it, expect } from "vitest";
import { calcModernizedLossAndEnergy } from "./cwu";

// Przykład kontrolny z wymagań
// x = 74, redukcja = 50, Edzis = 600
// x_po = 74 * (1 - 0.5) = 37
// Epo = 600 * (1 + 37/100) / (1 + 74/100) ≈ 472.41

describe("calcModernizedLossAndEnergy", () => {
  it("poprawnie liczy x_po i E_po wg PN-EN 15316-3-2", () => {
    const x = 74;
    const reduction = 50;
    const Edzis = 600;
    const { x_po, E_po } = calcModernizedLossAndEnergy(x, reduction, Edzis);
    expect(x_po).toBeCloseTo(37, 2);
    expect(E_po).toBeCloseTo(472.41, 2);
  });

  it("zwraca 0 gdy redukcja 100%", () => {
    const x = 74;
    const reduction = 100;
    const Edzis = 600;
    const { x_po, E_po } = calcModernizedLossAndEnergy(x, reduction, Edzis);
    expect(x_po).toBeCloseTo(0, 2);
    expect(E_po).toBeCloseTo(344.83, 2); // 600 * (1+0) / (1+0.74)
  });

  it("waliduje dane wejściowe (NaN, null, undefined)", () => {
    // x
    expect(() => calcModernizedLossAndEnergy(NaN, 50, 600)).toThrow();
    expect(() => calcModernizedLossAndEnergy(undefined as any, 50, 600)).toThrow();
    // reduction
    expect(() => calcModernizedLossAndEnergy(74, NaN, 600)).toThrow();
    expect(() => calcModernizedLossAndEnergy(74, undefined as any, 600)).toThrow();
    // Edzis
    expect(() => calcModernizedLossAndEnergy(74, 50, NaN)).toThrow();
    expect(() => calcModernizedLossAndEnergy(74, 50, undefined as any)).toThrow();
  });
});
