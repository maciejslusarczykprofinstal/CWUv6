import type { CostEstimate, CostLineItem, CostSection } from "./costEstimateEngine";

export type CostEstimateOverrides = {
  qtyByCode?: Record<string, number>;
  unitNetByCode?: Record<string, number>;
};

function roundMoney(value: number) {
  const v = Number.isFinite(value) ? value : 0;
  return Math.round(v * 100) / 100;
}

function sumNet(items: CostLineItem[]) {
  return roundMoney(items.reduce((acc, it) => acc + (Number.isFinite(it.net) ? it.net : 0), 0));
}

function getPctOf(base: number, value: number) {
  if (!Number.isFinite(base) || base <= 0) return 0;
  if (!Number.isFinite(value)) return 0;
  return value / base;
}

function applyItemOverrides(item: CostLineItem, overrides: CostEstimateOverrides): CostLineItem {
  const qtyOverride = overrides.qtyByCode?.[item.code];
  const unitNetOverride = overrides.unitNetByCode?.[item.code];

  const qty = Number.isFinite(qtyOverride) ? Math.max(0, qtyOverride as number) : item.qty;
  const unitNet = Number.isFinite(unitNetOverride) ? Math.max(0, unitNetOverride as number) : item.unitNet;
  const net = roundMoney(qty * unitNet);

  return { ...item, qty, unitNet, net };
}

function findSection(sections: CostSection[], id: CostSection["id"]) {
  return sections.find((s) => s.id === id);
}

function findItemByCode(section: CostSection | undefined, code: string) {
  return section?.items.find((it) => it.code === code);
}

export function applyCostEstimateOverrides(base: CostEstimate, overrides: CostEstimateOverrides): CostEstimate {
  const baseSections = base.sections;

  const baseA = findSection(baseSections, "A");
  const baseB = findSection(baseSections, "B");
  const baseC = findSection(baseSections, "C");
  const baseD = findSection(baseSections, "D");
  const baseE = findSection(baseSections, "E");

  const materialsItems = (baseA?.items ?? []).map((it) => applyItemOverrides(it, overrides));
  const laborItems = (baseB?.items ?? []).map((it) => applyItemOverrides(it, overrides));
  const toolsItems = (baseC?.items ?? []).map((it) => applyItemOverrides(it, overrides));

  const materialsNet = sumNet(materialsItems);
  const laborNet = sumNet(laborItems);
  const toolsNet = sumNet(toolsItems);
  const directNet = roundMoney(materialsNet + laborNet + toolsNet);

  const baseDirectNet = base.totals.directNet;

  const overheadBase = findItemByCode(baseD, "D1");
  const orgBase = findItemByCode(baseD, "D2");
  const riskBase = findItemByCode(baseE, "E1");
  const warrantyBase = findItemByCode(baseE, "E2");
  const profitBaseItem = findItemByCode(baseE, "E3");

  const overheadFactor = overheadBase ? getPctOf(baseDirectNet, overheadBase.unitNet) : 0;
  const orgFactor = orgBase ? getPctOf(baseDirectNet, orgBase.unitNet) : 0;
  const riskFactor = riskBase ? getPctOf(baseDirectNet, riskBase.unitNet) : 0;
  const warrantyFactor = warrantyBase ? getPctOf(baseDirectNet, warrantyBase.unitNet) : 0;

  const overheadNew = overheadBase
    ? { ...overheadBase, unitNet: roundMoney(directNet * overheadFactor), net: roundMoney(directNet * overheadFactor), qty: 1 }
    : undefined;
  const orgNew = orgBase
    ? { ...orgBase, unitNet: roundMoney(directNet * orgFactor), net: roundMoney(directNet * orgFactor), qty: 1 }
    : undefined;
  const riskNew = riskBase
    ? { ...riskBase, unitNet: roundMoney(directNet * riskFactor), net: roundMoney(directNet * riskFactor), qty: 1 }
    : undefined;
  const warrantyNew = warrantyBase
    ? { ...warrantyBase, unitNet: roundMoney(directNet * warrantyFactor), net: roundMoney(directNet * warrantyFactor), qty: 1 }
    : undefined;

  const baseProfitBaseValue = roundMoney(
    baseDirectNet +
      (overheadBase?.net ?? 0) +
      (orgBase?.net ?? 0) +
      (riskBase?.net ?? 0) +
      (warrantyBase?.net ?? 0),
  );
  const profitFactor = profitBaseItem ? getPctOf(baseProfitBaseValue, profitBaseItem.unitNet) : 0;

  const profitBaseValue = roundMoney(
    directNet +
      (overheadNew?.net ?? 0) +
      (orgNew?.net ?? 0) +
      (riskNew?.net ?? 0) +
      (warrantyNew?.net ?? 0),
  );

  const profitNew = profitBaseItem
    ? { ...profitBaseItem, unitNet: roundMoney(profitBaseValue * profitFactor), net: roundMoney(profitBaseValue * profitFactor), qty: 1 }
    : undefined;

  const overheadsItems: CostLineItem[] = [overheadNew, orgNew].filter(Boolean) as CostLineItem[];
  const narzutyItems: CostLineItem[] = [riskNew, warrantyNew, profitNew].filter(Boolean) as CostLineItem[];

  const overheadsNet = roundMoney(sumNet(overheadsItems) + sumNet(narzutyItems));
  const subtotalNet = roundMoney(directNet + overheadsNet);
  const vatNet = roundMoney((subtotalNet * base.totals.vatRatePct) / 100);
  const gross = roundMoney(subtotalNet + vatNet);

  const sections: CostSection[] = base.sections.map((s) => {
    if (s.id === "A") return { ...s, items: materialsItems };
    if (s.id === "B") return { ...s, items: laborItems };
    if (s.id === "C") return { ...s, items: toolsItems };
    if (s.id === "D") return { ...s, items: overheadsItems };
    if (s.id === "E") return { ...s, items: narzutyItems };
    return s;
  });

  return {
    ...base,
    sections,
    totals: {
      ...base.totals,
      materialsNet,
      laborNet,
      toolsNet,
      directNet,
      overheadsNet,
      subtotalNet,
      vatNet,
      gross,
    },
  };
}
