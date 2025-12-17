import type { BasePriceList } from "@/lib/costing/basePriceList";
import { DEFAULT_BASE_PRICE_LIST } from "@/lib/costing/basePriceList";

export type CostingScope = {
  zw: boolean;
  cwu: boolean;
  cyrkulacja: boolean;
};

export type CostEstimateInput = {
  klatki: number;
  kondygnacje: number;
  piony: number;
  lokale: number;
  scope: CostingScope;
  vatRatePct: number; // 0..100
};

export type CostLineItem = {
  code: string;
  name: string;
  unit: "m" | "szt" | "kpl" | "lok" | "pion";
  qty: number;
  unitNet: number;
  net: number;
  note?: string;
};

export type CostSection = {
  id: "A" | "B" | "C" | "D" | "E";
  title: string;
  items: CostLineItem[];
};

export type CostTotals = {
  materialsNet: number;
  laborNet: number;
  toolsNet: number;
  directNet: number;
  overheadsNet: number;
  subtotalNet: number;
  vatRatePct: number;
  vatNet: number;
  gross: number;
};

export type CostEstimate = {
  input: CostEstimateInput;
  assumptions: string[];
  sections: CostSection[];
  totals: CostTotals;
};

function clampInt(value: number, min: number, max: number) {
  const v = Number.isFinite(value) ? Math.round(value) : min;
  return Math.min(max, Math.max(min, v));
}

function clampPct(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function roundQty(value: number) {
  const v = Math.max(0, value);
  return Math.round(v * 100) / 100;
}

function roundMoney(value: number) {
  const v = Number.isFinite(value) ? value : 0;
  return Math.round(v * 100) / 100;
}

function line(args: Omit<CostLineItem, "net">): CostLineItem {
  return {
    ...args,
    qty: roundQty(args.qty),
    unitNet: roundMoney(args.unitNet),
    net: roundMoney(args.qty * args.unitNet),
  };
}

function sum(items: CostLineItem[]) {
  return roundMoney(items.reduce((acc, it) => acc + it.net, 0));
}

export function generateCostEstimate(
  raw: CostEstimateInput,
  basePriceList?: Partial<BasePriceList>,
): CostEstimate {
  const input: CostEstimateInput = {
    klatki: clampInt(raw.klatki, 1, 20),
    kondygnacje: clampInt(raw.kondygnacje, 1, 30),
    piony: clampInt(raw.piony, 1, 200),
    lokale: clampInt(raw.lokale, 1, 2000),
    scope: {
      zw: !!raw.scope?.zw,
      cwu: !!raw.scope?.cwu,
      cyrkulacja: !!raw.scope?.cyrkulacja,
    },
    vatRatePct: clampPct(raw.vatRatePct),
  };

  const assumptions: string[] = [];

  assumptions.push(
    "Ilości materiałów obliczono na podstawie liczby klatek, kondygnacji, pionów i lokali, przy założeniu typowej geometrii budynku z lat 80.",
  );

  // Założenia geometryczne: typowy budynek z lat 80.
  // Wysokość kondygnacji stała: 2.8 m (zgodnie z wymaganiami).
  const floorHeightM = 2.8;
  // Wzór: długość jednego pionu (m) = kondygnacje × 2.8
  const riserVerticalM = input.kondygnacje * floorHeightM;
  assumptions.push(`Wysokość kondygnacji przyjęta ${floorHeightM.toFixed(1)} m; długość pionu = kondygnacje × 2,8 m = ${roundQty(riserVerticalM)} m.`);

  const riserCount = input.piony;
  const flats = input.lokale;

  // Podejścia do lokali: przyjmujemy kosztorysową średnią długość podejścia na lokal.
  // Wzór: długość podejść (m) = lokale × branchPerFlatM (na medium)
  const branchPerFlatM = 6.0;
  assumptions.push(`Podejścia do lokali: przyjęto średnio ${branchPerFlatM.toFixed(0)} m na lokal na medium (bez tras nietypowych).`);

  const price: BasePriceList = { ...DEFAULT_BASE_PRICE_LIST, ...(basePriceList ?? {}) };

  const hasZW = input.scope.zw;
  const hasCWU = input.scope.cwu;
  const hasCyrk = input.scope.cyrkulacja;

  // Liczba aktywnych instalacji pionowych (ZW/CWU/Cyrkulacja).
  const activeVerticalSystems = (hasZW ? 1 : 0) + (hasCWU ? 1 : 0) + (hasCyrk ? 1 : 0);
  // Liczba aktywnych instalacji z odejściami do lokali (ZW/CWU).
  const activeBranchSystems = (hasZW ? 1 : 0) + (hasCWU ? 1 : 0);

  if (!hasZW && !hasCWU && !hasCyrk) {
    assumptions.push("Zakres: brak zaznaczonych mediów – kosztorys pokazuje wyłącznie pozycje organizacyjne i narzuty.");
  }

  // Długości rur – skaluje się z pionami i kondygnacjami.
  // Wzór (piony): piony × kondygnacje × 2.8 m (dla każdej aktywnej instalacji)
  const vertical25M = riserCount * riserVerticalM; // DN25 – pion dla ZW/CWU
  // Wzór (odejścia): lokale × branchPerFlatM (dla każdej aktywnej instalacji z odejściami)
  const branch20M = flats * branchPerFlatM; // DN20 – podejścia do lokali dla ZW/CWU
  // Cyrkulacja: osobne piony DN20, bez odejść do lokali.
  const cyrkVertical20M = riserCount * riserVerticalM;

  // Kształtki – logika budynku.
  // Kolana: ~2 szt / pion / kondygnację / aktywna instalacja pionowa
  const elbows = riserCount * input.kondygnacje * 2 * activeVerticalSystems;
  // Trójniki: ~1 szt / lokal / aktywna instalacja z odejściami (ZW/CWU)
  const tees = flats * activeBranchSystems;
  // Mufy: łączniki pionowe i podejściowe – kosztorysowo 1 szt / pion / kondygnację / aktywna instalacja pionowa
  const couplings = riserCount * input.kondygnacje * 1 * activeVerticalSystems;
  // Redukcje: pojawiają się na przejściach średnic – kosztorysowo 0.5 szt / pion / aktywna instalacja pionowa
  const reducers = riserCount * 0.5 * activeVerticalSystems;

  // Zawory – logika lokali i sekcjonowania.
  // Na lokal: 1 zawór dla ZW, 1 zawór dla CWU (cyrkulacja nie wchodzi do lokalu)
  const valvesPerLocal = (hasZW ? 1 : 0) + (hasCWU ? 1 : 0);
  // W piwnicy/na sekcjach: 1 zawór na pion dla każdej aktywnej instalacji pionowej
  const subriserValves = riserCount * activeVerticalSystems;

  // Obejmy i mocowania: kosztorysowo ~1.5 szt / 1 mb rury (piony + podejścia).
  const totalPipeMApprox =
    (hasZW ? vertical25M + branch20M : 0) +
    (hasCWU ? vertical25M + branch20M : 0) +
    (hasCyrk ? cyrkVertical20M : 0);
  const clamps = totalPipeMApprox * 1.5;

  const materials: CostLineItem[] = [];

  if (hasZW) {
    materials.push(
      // Wzór: qty = piony × (kondygnacje × 2.8)
      line({
        code: "A1",
        name: "Rura ZW (piony) PP-R DN25",
        unit: "m",
        qty: vertical25M,
        unitNet: price.pipe25,
        note: "Piony ZW – długość szacunkowa.",
      }),
    );
    materials.push(
      // Wzór: qty = lokale × branchPerFlatM
      line({
        code: "A2",
        name: "Rura ZW (podejścia) PP-R DN20",
        unit: "m",
        qty: branch20M,
        unitNet: price.pipe20,
        note: "Podejścia do lokali – średnia długość.",
      }),
    );
  }

  if (hasCWU) {
    materials.push(
      // Wzór: qty = piony × (kondygnacje × 2.8)
      line({
        code: "A3",
        name: "Rura CWU (piony) PP-R DN25",
        unit: "m",
        qty: vertical25M,
        unitNet: price.pipe25,
        note: "Piony CWU – długość szacunkowa.",
      }),
    );
    materials.push(
      // Wzór: qty = lokale × branchPerFlatM
      line({
        code: "A4",
        name: "Rura CWU (podejścia) PP-R DN20",
        unit: "m",
        qty: branch20M,
        unitNet: price.pipe20,
        note: "Podejścia do lokali – średnia długość.",
      }),
    );
    materials.push(
      // Wzór: qty = piony × (kondygnacje × 2.8)
      line({
        code: "A5",
        name: "Izolacja termiczna CWU (piony + poziomy)",
        unit: "m",
        qty: vertical25M,
        unitNet: price.insulation,
        note: "Zakładamy izolację pionów; podejścia zależnie od standardu wykończenia.",
      }),
    );
  }

  if (hasCyrk) {
    materials.push(
      // Wzór: qty = piony × (kondygnacje × 2.8)
      line({
        code: "A6",
        name: "Rura cyrkulacji (piony) PP-R DN20",
        unit: "m",
        qty: cyrkVertical20M,
        unitNet: price.pipe20,
        note: "Piony cyrkulacji – długość szacunkowa.",
      }),
    );
    materials.push(
      // Wzór: qty = piony × (kondygnacje × 2.8)
      line({
        code: "A7",
        name: "Izolacja termiczna cyrkulacji (piony)",
        unit: "m",
        qty: cyrkVertical20M,
        unitNet: price.insulation,
        note: "Izolacja pionów cyrkulacji.",
      }),
    );
  }

  if (hasZW || hasCWU || hasCyrk) {
    materials.push(
      line({
        code: "A8",
        name: "Kształtki (kolana) – 2 szt/pion/kondygnację/instalację",
        unit: "szt",
        // Wzór: qty = piony × kondygnacje × 2 × (ZW+CWU+Cyrk)
        qty: elbows,
        unitNet: price.elbow,
        note: "Ilość zależna od pionów, kondygnacji i aktywnego zakresu.",
      }),
    );
    materials.push(
      line({
        code: "A9",
        name: "Kształtki (trójniki) – odejścia do lokali",
        unit: "szt",
        // Wzór: qty = lokale × (ZW+CWU)
        qty: tees,
        unitNet: price.tee,
        note: "Odejścia do lokali dla instalacji zasilających (ZW/CWU).",
      }),
    );
    materials.push(
      line({
        code: "A10",
        name: "Kształtki (mufy) – łączniki pionów i podejść",
        unit: "szt",
        // Wzór: qty = piony × kondygnacje × 1 × (ZW+CWU+Cyrk)
        qty: couplings,
        unitNet: price.coupling,
      }),
    );
    materials.push(
      line({
        code: "A11",
        name: "Kształtki (redukcje) – uśrednione",
        unit: "szt",
        // Wzór: qty = piony × 0.5 × (ZW+CWU+Cyrk)
        qty: reducers,
        unitNet: price.reducer,
      }),
    );

    materials.push(
      line({
        code: "A12",
        name: "Zawory kulowe odcinające (lokale) – wg zakresu",
        unit: "szt",
        // Wzór: qty = lokale × (ZW?1:0 + CWU?1:0)
        qty: flats * Math.max(0, valvesPerLocal),
        unitNet: price.ballValve,
        note: "1 zawór/lokal dla ZW oraz 1 zawór/lokal dla CWU (cyrkulacja nie wchodzi do lokalu).",
      }),
    );
    materials.push(
      line({
        code: "A13",
        name: "Zawory podpionowe / odcinające w piwnicy",
        unit: "szt",
        qty: subriserValves,
        unitNet: price.riserValve,
        note: "Sekcjonowanie: 1 zawór na pion dla każdej aktywnej instalacji (ZW/CWU/Cyrkulacja).",
      }),
    );

    if (hasCyrk) {
      materials.push(
        line({
          code: "A14",
          name: "Zawory równoważące cyrkulacji (sekcje/piony)",
          unit: "szt",
          qty: riserCount,
          unitNet: price.balanceValve,
          note: "1 szt/pion (wariant konserwatywny dla stabilnej pracy cyrkulacji).",
        }),
      );
    }

    materials.push(
      line({
        code: "A15",
        name: "Obejmy, kołki, szyny montażowe (obejmy ~1.5 szt/m)",
        unit: "szt",
        qty: clamps,
        unitNet: price.clamp,
      }),
    );

    materials.push(
      line({
        code: "A16",
        name: "System mocowań – drobnica (szyny, kołki, wkręty) – uśrednienie",
        unit: "m",
        qty: Math.max(1, totalPipeMApprox * 0.12),
        unitNet: price.railFixing,
      }),
    );

    materials.push(
      line({
        code: "A17",
        name: "Materiały pomocnicze (uszczelnienia, środki czyszczące, oznaczenia)",
        unit: "kpl",
        qty: 1,
        unitNet: price.sealingConsumables,
      }),
    );
  }

  // Robocizna – rozbijamy na pozycje kosztorysowe.
  const labor: CostLineItem[] = [];

  if (hasZW || hasCWU || hasCyrk) {
    labor.push(
      line({
        code: "B1",
        name: "Demontaż starej instalacji w pionach i piwnicy",
        unit: "pion",
        qty: riserCount,
        unitNet: 520,
        note: "Stal ocynk / stare PP, praca w budynku zamieszkałym.",
      }),
    );

    labor.push(
      line({
        code: "B2",
        name: "Wykonanie nowych pionów (montaż + przelączenia) – średnio",
        unit: "pion",
        qty: riserCount,
        unitNet: 1850,
        note: "Bez odtworzeń budowlanych (osobna pozycja).",
      }),
    );

    labor.push(
      line({
        code: "B3",
        name: "Podłączenia do lokali / podejścia (ZW/CWU) – średnio",
        unit: "lok",
        qty: flats,
        unitNet: 420,
        note: "Wejścia, zabezpieczenia, praca w mieszkaniach.",
      }),
    );

    labor.push(
      line({
        code: "B4",
        name: "Próby szczelności, płukanie i uruchomienie (piony/sekcje)",
        unit: "kpl",
        qty: 1,
        unitNet: 2600,
      }),
    );

    labor.push(
      line({
        code: "B5",
        name: "Roboty w piwnicy / węźle (przepięcia, armatura, sekcjonowanie)",
        unit: "kpl",
        qty: 1,
        unitNet: 6900,
      }),
    );

    labor.push(
      line({
        code: "B6",
        name: "Odtworzenia budowlane po pracach (bruzdy, szachty, tynki) – średnio",
        unit: "lok",
        qty: flats,
        unitNet: 260,
        note: "Po stronie wykonawcy sanit., zakres zależny od standardu wykończenia.",
      }),
    );
  }

  // Sprzęt i narzędzia
  const tools: CostLineItem[] = [];
  if (hasZW || hasCWU || hasCyrk) {
    tools.push(
      line({
        code: "C1",
        name: "Sprzęt: rusztowania, zabezpieczenia, odkurzanie/odpylanie, transport wewn.",
        unit: "kpl",
        qty: 1,
        unitNet: 3200,
      }),
    );
    tools.push(
      line({
        code: "C2",
        name: "Utylizacja/wywóz złomu i odpadów (kontener/transport) – uśrednienie",
        unit: "kpl",
        qty: 1,
        unitNet: 2400,
      }),
    );
  }

  const materialsNet = sum(materials);
  const laborNet = sum(labor);
  const toolsNet = sum(tools);
  const directNet = roundMoney(materialsNet + laborNet + toolsNet);

  // Narzuty – obowiązkowe.
  // Przyjęte procenty są „kosztorysowe” dla robót w budynku zamieszkałym.
  const overheadPct = 15;
  const orgPct = 5;
  const riskPct = 8;
  const warrantyPct = 3;
  const profitPct = 10;

  assumptions.push(
    `Narzuty (od kosztów bezpośrednich): Kp ${overheadPct}%, organizacja robót ${orgPct}%, ryzyko ${riskPct}%, gwarancja/odpowiedzialność ${warrantyPct}%, zysk ${profitPct}%.`,
  );

  const overheads = line({
    code: "D1",
    name: `Koszty pośrednie (Kp) ${overheadPct}%` ,
    unit: "kpl",
    qty: 1,
    unitNet: roundMoney((directNet * overheadPct) / 100),
    note: "Zaplecze, kierowanie robotami, koszty ogólne budowy.",
  });

  const organization = line({
    code: "D2",
    name: `Organizacja robót w budynku zamieszkałym ${orgPct}%`,
    unit: "kpl",
    qty: 1,
    unitNet: roundMoney((directNet * orgPct) / 100),
    note: "Komunikacja z mieszkańcami, okna wyłączeń, zabezpieczenia.",
  });

  const risk = line({
    code: "E1",
    name: `Ryzyko (brak dostępu do lokali, niespodzianki w szachtach) ${riskPct}%`,
    unit: "kpl",
    qty: 1,
    unitNet: roundMoney((directNet * riskPct) / 100),
    note: "Uwzględnia roboty dodatkowe i przestoje wejść.",
  });

  const warranty = line({
    code: "E2",
    name: `Gwarancja i odpowiedzialność wykonawcy ${warrantyPct}%`,
    unit: "kpl",
    qty: 1,
    unitNet: roundMoney((directNet * warrantyPct) / 100),
    note: "Ryzyko serwisu, napraw i odpowiedzialności za szkody.",
  });

  const profitBase = roundMoney(directNet + overheads.net + organization.net + risk.net + warranty.net);
  const profit = line({
    code: "E3",
    name: `Zysk wykonawcy ${profitPct}%`,
    unit: "kpl",
    qty: 1,
    unitNet: roundMoney((profitBase * profitPct) / 100),
    note: "Marża przedsiębiorstwa.",
  });

  const overheadsNet = roundMoney(overheads.net + organization.net + risk.net + warranty.net + profit.net);
  const subtotalNet = roundMoney(directNet + overheadsNet);
  const vatNet = roundMoney((subtotalNet * input.vatRatePct) / 100);
  const gross = roundMoney(subtotalNet + vatNet);

  const sections: CostSection[] = [
    { id: "A", title: "A. Materiały", items: materials },
    { id: "B", title: "B. Robocizna", items: labor },
    { id: "C", title: "C. Sprzęt i narzędzia", items: tools },
    { id: "D", title: "D. Koszty pośrednie", items: [overheads, organization] },
    { id: "E", title: "E. Narzuty i ryzyka", items: [risk, warranty, profit] },
  ];

  return {
    input,
    assumptions,
    sections,
    totals: {
      materialsNet,
      laborNet,
      toolsNet,
      directNet,
      overheadsNet,
      subtotalNet,
      vatRatePct: input.vatRatePct,
      vatNet,
      gross,
    },
  };
}
