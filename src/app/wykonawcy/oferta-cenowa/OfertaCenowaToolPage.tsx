"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { CostEstimateInput } from "@/lib/costing/costEstimateEngine";
import { generateCostEstimate } from "@/lib/costing/costEstimateEngine";
import type { BasePriceList } from "@/lib/costing/basePriceList";
import { BASE_PRICE_TRANSPARENCY_NOTE, DEFAULT_BASE_PRICE_LIST } from "@/lib/costing/basePriceList";
import { applyCostEstimateOverrides } from "@/lib/costing/applyOverrides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function pln(value: number) {
  return value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function qtyFmt(value: number) {
  return value.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}

function scopeLabel(scope: CostEstimateInput["scope"]) {
  const parts: string[] = [];
  if (scope.zw) parts.push("ZW");
  if (scope.cwu) parts.push("CWU");
  if (scope.cyrkulacja) parts.push("Cyrkulacja");
  return parts.length > 0 ? parts.join(" + ") : "—";
}

function infoBadge(label: string, value: string) {
  return (
    <div className="rounded-xl border bg-background px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function parseNonNegativeFloat(raw: string) {
  if (raw.trim() === "") return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

const BASE_PRICE_FIELDS: Array<{ key: keyof BasePriceList; label: string; unit: string }> = [
  { key: "pipe25", label: "Rura PP-R DN25", unit: "zł/mb" },
  { key: "pipe20", label: "Rura PP-R DN20", unit: "zł/mb" },
  { key: "insulation", label: "Izolacja termiczna", unit: "zł/mb" },
  { key: "elbow", label: "Kształtka: kolano", unit: "zł/szt" },
  { key: "tee", label: "Kształtka: trójnik", unit: "zł/szt" },
  { key: "coupling", label: "Kształtka: mufa", unit: "zł/szt" },
  { key: "reducer", label: "Kształtka: redukcja", unit: "zł/szt" },
  { key: "ballValve", label: "Zawór kulowy odcinający", unit: "zł/szt" },
  { key: "riserValve", label: "Zawór podpionowy (piwnica)", unit: "zł/szt" },
  { key: "balanceValve", label: "Zawór równoważący cyrkulacji", unit: "zł/szt" },
  { key: "clamp", label: "Obejma (z gumą) / mocowania", unit: "zł/szt" },
  { key: "railFixing", label: "Szyny/kołki/drobnica (system)", unit: "zł/mb" },
  { key: "sealingConsumables", label: "Materiały pomocnicze", unit: "zł/kpl" },
];

const DEFAULT_INPUT: CostEstimateInput = {
  klatki: 2,
  kondygnacje: 5,
  piony: 20,
  lokale: 80,
  scope: { zw: true, cwu: true, cyrkulacja: true },
  vatRatePct: 8,
};

function toIntFromQuery(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function toBoolFromQuery(value: string | null, fallback: boolean) {
  if (value === null) return fallback;
  return value === "1" || value.toLowerCase() === "true" || value.toLowerCase() === "tak";
}

export default function OfertaCenowaToolPage() {
  const searchParams = useSearchParams();
  const sp = useMemo(() => searchParams ?? new URLSearchParams(), [searchParams]);
  const [value, setValue] = useState<CostEstimateInput>(DEFAULT_INPUT);
  const [didInitFromQuery, setDidInitFromQuery] = useState(false);

  const [basePriceList, setBasePriceList] = useState<BasePriceList>({ ...DEFAULT_BASE_PRICE_LIST });

  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>({});
  const [unitNetOverrides, setUnitNetOverrides] = useState<Record<string, number>>({});

  const fromQuery = useMemo<CostEstimateInput>(() => {
    const qKlatki = toIntFromQuery(sp.get("klatki"), DEFAULT_INPUT.klatki);
    const qKondygnacje = toIntFromQuery(sp.get("kondygnacje"), DEFAULT_INPUT.kondygnacje);
    const qPiony = toIntFromQuery(sp.get("piony"), DEFAULT_INPUT.piony);
    const qLokale = toIntFromQuery(sp.get("lokale"), DEFAULT_INPUT.lokale);
    const qVat = toIntFromQuery(sp.get("vat"), DEFAULT_INPUT.vatRatePct);

    const qZw = toBoolFromQuery(sp.get("zw"), DEFAULT_INPUT.scope.zw);
    const qCwu = toBoolFromQuery(sp.get("cwu"), DEFAULT_INPUT.scope.cwu);
    const qCyrk = toBoolFromQuery(sp.get("cyrkulacja"), DEFAULT_INPUT.scope.cyrkulacja);

    return {
      klatki: qKlatki,
      kondygnacje: qKondygnacje,
      piony: qPiony,
      lokale: qLokale,
      scope: { zw: qZw, cwu: qCwu, cyrkulacja: qCyrk },
      vatRatePct: qVat,
    };
  }, [sp]);

  useEffect(() => {
    if (didInitFromQuery) return;

    const hasAnyQuery =
      sp.size > 0 &&
      (sp.get("kondygnacje") !== null ||
        sp.get("piony") !== null ||
        sp.get("lokale") !== null ||
        sp.get("zw") !== null ||
        sp.get("cwu") !== null ||
        sp.get("cyrkulacja") !== null);

    if (!hasAnyQuery) {
      setDidInitFromQuery(true);
      return;
    }

    setValue(fromQuery);
    setDidInitFromQuery(true);
  }, [didInitFromQuery, fromQuery, sp]);

  const baseEstimate = useMemo(() => generateCostEstimate(value, basePriceList), [value, basePriceList]);

  const baseMaterialByCode = useMemo(() => {
    const sectionA = baseEstimate.sections.find((s) => s.id === "A");
    const map = new Map<string, { qty: number; unitNet: number }>();
    for (const it of sectionA?.items ?? []) {
      map.set(it.code, { qty: it.qty, unitNet: it.unitNet });
    }
    return map;
  }, [baseEstimate]);

  const estimate = useMemo(
    () =>
      applyCostEstimateOverrides(baseEstimate, {
        qtyByCode: quantityOverrides,
        unitNetByCode: unitNetOverrides,
      }),
    [baseEstimate, quantityOverrides, unitNetOverrides],
  );

  const resetMaterialQtyOverride = (code: string) => {
    setQuantityOverrides((prev) => {
      if (!(code in prev)) return prev;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [code]: _, ...rest } = prev;
      return rest;
    });
  };

  const resetAllMaterialQtyOverrides = () => {
    setQuantityOverrides({});
  };

  const headerSubtitle = useMemo(() => {
    return `Budynek: ${value.klatki} kl. · ${value.kondygnacje} kond. · ${value.piony} pionów · ${value.lokale} lokali · Zakres: ${scopeLabel(
      value.scope,
    )} · VAT: ${value.vatRatePct}%`;
  }, [value]);

  return (
    <div className="space-y-8">
      {/* A. Nagłówek */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Oferta cenowa – instalacja CWU</h1>
        <div className="text-sm text-muted-foreground">{headerSubtitle}</div>
      </div>

      {/* B. Dane wejściowe (read-only) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">Dane wejściowe</CardTitle>
            <Badge variant="outline">read-only</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {infoBadge("Klatki", String(value.klatki))}
            {infoBadge("Kondygnacje", String(value.kondygnacje))}
            {infoBadge("Piony", String(value.piony))}
            {infoBadge("Lokale", String(value.lokale))}
            {infoBadge("Zakres", scopeLabel(value.scope))}
            {infoBadge("VAT", `${value.vatRatePct}%`)}
          </div>
          <div className="text-xs text-muted-foreground">
            Parametry wejściowe są pobierane z URL (np. z „Szybkiej wyceny"). Edytowalne są pozycje materiałowe w tabeli.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* C. Tabela kosztorysowa (core) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-lg">Tabela kosztorysowa</CardTitle>
                <div className="text-xs text-muted-foreground">Sekcje A–E z wyraźnymi nagłówkami i sumami.</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetAllMaterialQtyOverrides}
                disabled={Object.keys(quantityOverrides).length === 0}
              >
                Resetuj ilości (materiały)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Kod</TableHead>
                  <TableHead>Nazwa</TableHead>
                  <TableHead className="w-[70px]">j.m.</TableHead>
                  <TableHead className="w-[150px] text-right">Ilość</TableHead>
                  <TableHead className="w-[160px] text-right">Cena jedn. (netto)</TableHead>
                  <TableHead className="w-[150px] text-right">Wartość (netto)</TableHead>
                  <TableHead className="w-[110px] text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimate.sections.map((section) => {
                  const isMaterialsSection = section.id === "A";
                  const sectionNet = section.items.reduce((acc, it) => acc + it.net, 0);

                  return (
                    <Fragment key={section.id}>
                      <TableRow className="bg-muted/40">
                        <TableCell colSpan={7} className="font-semibold">
                          {section.title}
                        </TableCell>
                      </TableRow>

                      {section.items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-sm text-muted-foreground">
                            Brak pozycji dla wybranego zakresu.
                          </TableCell>
                        </TableRow>
                      ) : (
                        section.items.map((it) => {
                          const canEdit = isMaterialsSection;
                          const baseMaterial = baseMaterialByCode.get(it.code);

                          const hasQtyOverride = canEdit && Object.prototype.hasOwnProperty.call(quantityOverrides, it.code);
                          const hasUnitNetOverride = canEdit && Object.prototype.hasOwnProperty.call(unitNetOverrides, it.code);
                          const isEdited = hasQtyOverride || hasUnitNetOverride;

                          const displayQty = canEdit
                            ? hasQtyOverride
                              ? quantityOverrides[it.code] ?? it.qty
                              : baseMaterial?.qty ?? it.qty
                            : it.qty;
                          const displayUnitNet = canEdit
                            ? hasUnitNetOverride
                              ? unitNetOverrides[it.code] ?? it.unitNet
                              : baseMaterial?.unitNet ?? it.unitNet
                            : it.unitNet;

                          return (
                            <TableRow key={it.code} className={isEdited ? "bg-muted/20" : undefined}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div>{it.code}</div>
                                  {isEdited ? <Badge variant="outline">EDYT.</Badge> : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{it.name}</div>
                                  {it.note ? <div className="text-xs text-muted-foreground">{it.note}</div> : null}
                                </div>
                              </TableCell>
                              <TableCell>{it.unit}</TableCell>

                              <TableCell className="text-right">
                                {canEdit ? (
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    step="any"
                                    value={Number.isFinite(displayQty) ? String(displayQty) : "0"}
                                    onChange={(e) => {
                                      const next = parseNonNegativeFloat(e.target.value);
                                      const baseQty = baseMaterial?.qty;
                                      if (Number.isFinite(baseQty) && Math.abs(next - (baseQty as number)) < 1e-9) {
                                        resetMaterialQtyOverride(it.code);
                                        return;
                                      }
                                      setQuantityOverrides((prev) => ({ ...prev, [it.code]: next }));
                                    }}
                                    className="h-9 text-right"
                                  />
                                ) : (
                                  <div className="tabular-nums">{qtyFmt(it.qty)}</div>
                                )}
                              </TableCell>

                              <TableCell className="text-right">
                                {canEdit ? (
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    step="any"
                                    value={Number.isFinite(displayUnitNet) ? String(displayUnitNet) : "0"}
                                    onChange={(e) => {
                                      const next = parseNonNegativeFloat(e.target.value);
                                      const baseUnitNet = baseMaterial?.unitNet;
                                      if (Number.isFinite(baseUnitNet) && Math.abs(next - (baseUnitNet as number)) < 1e-9) {
                                        setUnitNetOverrides((prev) => {
                                          if (!(it.code in prev)) return prev;
                                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                          const { [it.code]: _, ...rest } = prev;
                                          return rest;
                                        });
                                        return;
                                      }
                                      setUnitNetOverrides((prev) => ({ ...prev, [it.code]: next }));
                                    }}
                                    className="h-9 text-right"
                                  />
                                ) : (
                                  <div className="tabular-nums">{pln(it.unitNet)} zł</div>
                                )}
                              </TableCell>

                              <TableCell className="text-right font-semibold tabular-nums">{pln(it.net)} zł</TableCell>

                              <TableCell className="text-right">
                                {canEdit ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      resetMaterialQtyOverride(it.code);
                                      setUnitNetOverrides((prev) => {
                                        if (!(it.code in prev)) return prev;
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const { [it.code]: _, ...rest } = prev;
                                        return rest;
                                      });
                                    }}
                                    disabled={!isEdited}
                                  >
                                    Reset
                                  </Button>
                                ) : (
                                  <div className="text-xs text-muted-foreground">—</div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}

                      <TableRow className="border-t">
                        <TableCell colSpan={5} className="text-right font-medium text-muted-foreground">
                          Suma sekcji (netto)
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{pln(sectionNet)} zł</TableCell>
                        <TableCell />
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* D. Podsumowanie finansowe */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Podsumowanie finansowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Materiały (netto)</div>
                <div className="font-semibold tabular-nums">{pln(estimate.totals.materialsNet)} zł</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Robocizna (netto)</div>
                <div className="font-semibold tabular-nums">{pln(estimate.totals.laborNet)} zł</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Sprzęt (netto)</div>
                <div className="font-semibold tabular-nums">{pln(estimate.totals.toolsNet)} zł</div>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Koszty bezpośrednie (netto)</div>
                <div className="font-semibold tabular-nums">{pln(estimate.totals.directNet)} zł</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Narzuty i ryzyka (netto)</div>
                <div className="font-semibold tabular-nums">{pln(estimate.totals.overheadsNet)} zł</div>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Wartość netto</div>
                <div className="text-lg font-semibold tabular-nums">{pln(estimate.totals.subtotalNet)} zł</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">VAT {estimate.totals.vatRatePct}%</div>
                <div className="font-semibold tabular-nums">{pln(estimate.totals.vatNet)} zł</div>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Wartość brutto</div>
                <div className="text-xl font-semibold tabular-nums">{pln(estimate.totals.gross)} zł</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Budynek zamieszkały: niepewność (dostępy, niespodzianki w szachtach) jest ujęta w pozycji ryzyka.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* E. Założenia i wyłączenia (accordion) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Założenia i wyłączenia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="rounded-xl border bg-background p-4">
            <summary className="cursor-pointer select-none text-sm font-medium">Pokaż / ukryj założenia i standard wyłączeń</summary>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Założenia</div>
                <ul className="space-y-2 text-sm">
                  {estimate.assumptions.map((a) => (
                    <li key={a} className="rounded-xl border p-3 text-muted-foreground">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border p-3 text-sm">
                  <div className="font-semibold">Wyłączenia (standard oferty)</div>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>- prace elektryczne i automatyka węzła (jeśli wymagane) – poza zakresem</li>
                    <li>- prace budowlane ponad standard odtworzeń uśrednionych – rozliczane po obmiarze</li>
                    <li>- usuwanie azbestu / prace specjalistyczne – poza zakresem</li>
                  </ul>
                </div>

                <div className="rounded-xl border p-3 text-sm">
                  <div className="font-semibold">Uzasadnienie kosztorysowe (techniczne)</div>
                  <div className="mt-2 text-muted-foreground space-y-2">
                    <p>
                      Roboty w budynku z lat 80. (stare stalowe piony, brak pełnej dokumentacji) wymagają przyjęcia konserwatywnych ilości
                      materiałów i dodatkowego czasu na wejścia do lokali, zabezpieczenia i sekcjonowanie.
                    </p>
                    <p>
                      Największe ryzyka kosztowe to dostęp do lokali, niespodzianki w szachtach (kolizje, niewidoczne odejścia) oraz konieczność
                      powrotów serwisowych po uruchomieniu. Pozycje ryzyka i gwarancji są po to, żeby oferta była obroniona przed zarządem
                      i inspektorem oraz przewidywała realne warunki.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </details>

          <details className="rounded-xl border bg-background p-4">
            <summary className="cursor-pointer select-none text-sm font-medium">Ceny bazowe (netto) – edytuj w razie potrzeby</summary>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Lista cen bazowych</div>
                <Button type="button" variant="outline" size="sm" onClick={() => setBasePriceList({ ...DEFAULT_BASE_PRICE_LIST })}>
                  Resetuj
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {BASE_PRICE_FIELDS.map((f) => (
                  <div key={f.key} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{f.label}</div>
                        <div className="text-xs text-muted-foreground">{f.unit}</div>
                      </div>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        value={String(basePriceList[f.key])}
                        onChange={(e) => {
                          const next = parseNonNegativeFloat(e.target.value);
                          setBasePriceList((prev) => ({ ...prev, [f.key]: next }));
                        }}
                        className="h-9 w-[140px] text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">{BASE_PRICE_TRANSPARENCY_NOTE}</div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
