export type ReasonKey =
  | "billingOpacity"
  | "cwuPriceTooHigh"
  | "circulation24h"
  | "noBalancing"
  | "poorInsulation"
  | "tooHighTemps";

export const REASONS: Array<{ key: ReasonKey; label: string }> = [
  {
    key: "cwuPriceTooHigh",
    label: "Znaczna rozbieżność między kosztem teoretycznym a ceną CWU na rachunku",
  },
  { key: "billingOpacity", label: "Brak transparentnego rozbicia składowych opłat CWU" },
  { key: "circulation24h", label: "Podejrzenie pracy cyrkulacji/pomp 24h (zbędne straty)" },
  { key: "noBalancing", label: "Podejrzenie braku równoważenia hydraulicznego instalacji" },
  { key: "poorInsulation", label: "Podejrzenie niewystarczającej izolacji przewodów CWU/cyrkulacji" },
  { key: "tooHighTemps", label: "Podejrzenie nieoptymalnych nastaw temperatur i parametrów pracy" },
];
