export type BasePriceList = {
  // rury (zł/mb netto)
  pipe25: number;
  pipe20: number;
  pipe16: number;

  // izolacje (zł/mb netto)
  insulation: number;

  // kształtki (zł/szt netto)
  elbow: number;
  tee: number;
  coupling: number;
  reducer: number;

  // armatura (zł/szt netto)
  ballValve: number;
  riserValve: number;
  balanceValve: number;

  // mocowania i drobnica
  clamp: number; // zł/szt netto
  railFixing: number; // zł/mb netto (szyny/kołki/drobnica jako „m systemu”)
  sealingConsumables: number; // zł/kpl netto
};

/**
 * Ceny bazowe (netto) – poziom orientacyjny PL, Q1/Q2 2025.
 * Założenie: publiczne cenniki sklepów branżowych + uśrednienie.
 * Uwaga: realne ceny (rabaty wykonawcy, region, marka) mogą się istotnie różnić.
 */
export const DEFAULT_BASE_PRICE_LIST: BasePriceList = {
  // PP-R (średnia z pozycji standard/STABI z publicznych cenników)
  pipe25: 4.8,
  pipe20: 3.05,

  // nieużywane obecnie w silniku, zostawione dla spójności
  pipe16: 2.4,

  // otuliny/izolacje: typowo wyższy koszt niż sama rura
  insulation: 12.6,

  // kształtki PP-R (uśrednienie; w praktyce dochodzą przejścia gwintowane itd.)
  elbow: 1.5,
  tee: 2.0,
  coupling: 1.2,
  reducer: 1.5,

  // armatura – zależna od średnic i klas, tu poziom „środka rynku”
  ballValve: 85.0,
  riserValve: 140.0,
  balanceValve: 220.0,

  // mocowania (obejmy z gumą potrafią kosztować kilka zł netto)
  clamp: 6.5,
  railFixing: 12.0,
  sealingConsumables: 1800.0,
};

export const BASE_PRICE_TRANSPARENCY_NOTE =
  "Ceny bazowe (netto) przyjęto jako średnie rynkowe (PL, Q1/Q2 2025) na podstawie publicznych cenników sklepów branżowych; w praktyce zależą od rabatów, regionu i marki – możesz je edytować.";
