"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type EnergyPieChartProps = {
  lossPercent: number;
  usefulEnergyPercent: number;
  className?: string;
};

const COLOR_LOSS = "#ef4444";
const COLOR_USEFUL = "#22c55e";

const TOOLTIP_HELP: Record<string, string> = {
  "Energia użyteczna (%)": "Energia, która faktycznie ogrzewa wodę w Twoim kranie.",
  "Straty energii (%)": "Energia, za którą płacisz, ale która ucieka w instalacji (piony, piwnice, cyrkulacja).",
};

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<any> }) {
  if (!active || !payload?.length) return null;

  const p = payload[0] as any;
  const name = String(p?.name ?? p?.payload?.name ?? "");
  const value = Number(p?.value ?? p?.payload?.value);
  const help = TOOLTIP_HELP[name] ?? "";

  return (
    <div className="max-w-[260px] rounded-xl border border-slate-200/70 bg-white/95 px-3 py-2 text-left shadow-lg backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/95">
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {name}
      </div>
      <div className="text-xs text-slate-700 dark:text-slate-300">
        {Number.isFinite(value) ? `${value.toFixed(1)}%` : "—"}
      </div>
      {help ? (
        <div className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          {help}
        </div>
      ) : null}
    </div>
  );
}

function clampPercent(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

function normalizePercents(lossPercent: number, usefulEnergyPercent: number) {
  const loss = clampPercent(lossPercent);
  const useful = clampPercent(usefulEnergyPercent);
  const sum = loss + useful;

  if (sum <= 0) {
    return { loss: 0, useful: 0 };
  }

  // Normalizacja w razie zaokrągleń/odchyleń — UI ma zawsze pokazać łącznie 100%.
  const lossN = (loss / sum) * 100;
  const usefulN = 100 - lossN;

  return { loss: lossN, useful: usefulN };
}

export function EnergyPieChart({ lossPercent, usefulEnergyPercent, className }: EnergyPieChartProps) {
  const data = useMemo(() => {
    const { loss, useful } = normalizePercents(lossPercent, usefulEnergyPercent);

    return [
      { name: "Straty energii (%)", value: Number(loss.toFixed(1)) },
      { name: "Energia użyteczna (%)", value: Number(useful.toFixed(1)) },
    ];
  }, [lossPercent, usefulEnergyPercent]);

  // Brak sensownych danych -> nie renderuj wykresu (wymóg: brak danych -> null/placeholder).
  if (!data.some((d) => d.value > 0)) return null;

  return (
    <div className={className}>
      <div className="w-full h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              isAnimationActive={false}
              label={({ value }) => `${Number(value).toFixed(1)}%`}
            >
              <Cell fill={COLOR_LOSS} />
              <Cell fill={COLOR_USEFUL} />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200/50 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-slate-200">
        <span className="font-semibold text-red-700 dark:text-red-300">Im większa czerwona część wykresu</span>,
        tym większe prawdopodobieństwo, że instalacja CWU w budynku jest rozregulowana lub przestarzała.
      </div>
    </div>
  );
}
