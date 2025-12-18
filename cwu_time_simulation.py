from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Sequence, Tuple


DemandProfile = Sequence[float]  # l/min, w kolejnych krokach dt


@dataclass(frozen=True)
class TankParams:
    """Parametry wspólne.

    Założenie audytowe:
    - demand_lpm oznacza strumień wody dostarczanej użytkownikowi (po zmieszaniu),
      o temperaturze T_delivery ≈ T_set (przyjmujemy stałe T_set).

    Zasobnik ma energię liczona względem T_cold:
      E = ρ c V (T - T_cold)
    """

    volume_l: float
    T_init_C: float
    T_set_C: float
    T_cold_C: float
    T_min_C: float
    dt_s: int = 60


@dataclass(frozen=True)
class LayeredParams:
    """Uproszczony zasobnik 2-strefowy.

    hot_fraction:
      Udział objętości górnej strefy (hot). Pozostała część to strefa dolna (cold).

    mixing_tau_s:
      Stała czasowa "powolnego mieszania" (relaksacja do temperatury równowagi).
      Duża wartość => dobra stratyfikacja.

    losses_split:
      Podział strat między strefy. "by_volume" jest stabilne i czytelne.
    """

    hot_fraction: float = 0.3
    mixing_tau_s: float = 3600.0
    losses_split: str = "by_volume"  # future: "all_hot", "by_area"


@dataclass(frozen=True)
class LossInput:
    """Definicja strat zgodna audytowo.

    Straty w symulacji muszą być stałą mocą loss_kw odejmowaną w każdym kroku,
    niezależnie od chwilowego poboru CWU.

    Dopuszczalne wejścia:
    - loss_kw (bezpośrednio)
    - loss_percent_of_pavg: procent średniej mocy CWU w okresie symulacji
      loss_kw = %/100 * P_avg_CWU
    - UA_W_per_K + deltaT_K: stała moc strat UA*ΔT

    UWAGA: % od Pmax jest niedopuszczalne audytowo i celowo nie jest wspierane.
    """

    loss_kw: Optional[float] = None
    loss_percent_of_pavg: Optional[float] = None
    UA_W_per_K: Optional[float] = None
    deltaT_K: Optional[float] = None

    def validate(self) -> None:
        if self.loss_kw is None and self.loss_percent_of_pavg is None and self.UA_W_per_K is None:
            raise ValueError("Podaj loss_kw lub loss_percent_of_pavg lub UA_W_per_K+deltaT_K.")
        if self.UA_W_per_K is not None and self.deltaT_K is None:
            raise ValueError("Dla UA_W_per_K musisz podać deltaT_K (stałą różnicę temperatur).")
        if self.deltaT_K is not None and self.UA_W_per_K is None:
            raise ValueError("Jeśli podajesz deltaT_K, musisz podać UA_W_per_K.")
        if self.loss_kw is not None and self.loss_kw < 0:
            raise ValueError("loss_kw musi być >= 0")
        if self.loss_percent_of_pavg is not None and self.loss_percent_of_pavg < 0:
            raise ValueError("loss_percent_of_pavg musi być >= 0")


@dataclass(frozen=True)
class ModelRunResult:
    model: str
    Pzam_kW: float
    loss_kw: float
    time_s: List[int]
    T_primary_C: List[float]  # mix: T_tank, layered: T_hot
    P_in_kW: List[float]
    violation_minutes: float
    regen_to_Tmin_s: Optional[int]
    regen_to_Tset_s: Optional[int]
    t_min_temp_s: int
    T_min_reached_C: float

    # Dodatkowe serie (opcjonalne)
    T_secondary_C: Optional[List[float]] = None  # layered: T_cold


@dataclass(frozen=True)
class ComparisonResult:
    P_avg_CWU_kW: float
    E_CWU_kWh: float
    mix: ModelRunResult
    layered: ModelRunResult
    delta_P_kW: float
    delta_P_percent: float

    # Rekomendacja (doradcza, nie normatywna)
    recommendation_level: str  # A / B / C
    recommendation_title: str
    recommendation_text: str
    economic_hint: Optional[str]

    # Metryki pomocnicze (do GUI/raportu)
    metrics: dict

    # Analiza finansowa skutków zawyżenia mocy (koszt decyzji technicznej)
    extra_cost_month_zl: float
    extra_cost_year_zl: float
    extra_cost_total_zl: float
    economic_commentary: str

    # Decyzja końcowa (propozycja mocy zamówionej)
    Pzam_final_kw: float
    decision_basis: str  # "techniczna" | "techniczno-finansowa"
    final_decision_text: str

    # Dane gotowe pod blok decyzji w GUI
    decision_ui: dict

    # Dane gotowe pod GUI/raport
    series_for_plot: dict
    bar_chart: List[dict]
    commentary: str

    # Dane pod wykres kosztów (np. rocznych)
    cost_bar_chart_year: List[dict]


@dataclass(frozen=True)
class RecommendationThresholds:
    """Jawne, edytowalne progi decyzji.

    Filozofia: to narzędzie doradcze – progi są parametrami, nie "prawdą".
    """

    deltaP_abs_threshold_kw: float = 5.0
    deltaP_percent_threshold: float = 10.0

    # Progi pomocnicze (heurystyki)
    peak_threshold_fraction_of_max: float = 0.5  # pik = >= 50% max
    peak_threshold_min_lpm: float = 10.0         # i co najmniej 10 l/min
    short_peak_max_minutes: float = 30.0

    tank_hours_threshold: float = 1.0  # V_tank / (avg_lpm*60) >= 1h => "duży zasobnik" w relacji do poboru
    stratification_good_tau_s: float = 1800.0


@dataclass(frozen=True)
class CostParams:
    """Parametry do analizy finansowej.

    - Jeśli podany jest koszt miesięczny, koszt roczny liczony jest jako *12.
    - Jeśli ΔP <= 0, koszty dodatkowe = 0.
    """

    cost_per_kw_month_zl: Optional[float] = None
    cost_per_kw_year_zl: Optional[float] = None
    analysis_horizon_years: int = 10

    def normalized(self) -> "CostParams":
        month = self.cost_per_kw_month_zl
        year = self.cost_per_kw_year_zl

        if month is None and year is None:
            # Brak analizy finansowej – zostaw None, a koszty będą 0
            return self

        if month is not None and month < 0:
            raise ValueError("cost_per_kw_month_zl musi być >= 0")
        if year is not None and year < 0:
            raise ValueError("cost_per_kw_year_zl musi być >= 0")
        if self.analysis_horizon_years <= 0:
            raise ValueError("analysis_horizon_years musi być > 0")

        if year is None and month is not None:
            year = month * 12.0
        if month is None and year is not None:
            month = year / 12.0

        return CostParams(
            cost_per_kw_month_zl=month,
            cost_per_kw_year_zl=year,
            analysis_horizon_years=self.analysis_horizon_years,
        )


def _financial_impact(
    *,
    delta_P_kW: float,
    cost: CostParams,
) -> Tuple[float, float, float, str, List[dict]]:
    """Liczy koszt nadmiarowej mocy (ΔP) i przygotowuje dane do wykresu.

    Zgodnie z wymaganiem:
    - jeśli ΔP <= 0 => koszty = 0 i jasny komunikat o braku potencjału
    - jeśli brak stawek => koszty = 0 i komunikat "brak danych"
    """

    cost_n = cost.normalized()
    month_rate = cost_n.cost_per_kw_month_zl
    year_rate = cost_n.cost_per_kw_year_zl

    # Dla GUI/raportu: koszty roczne "mix" i "layer" (stałe opłaty mocy)
    cost_bar_year = [
        {"label": "Model idealnie mieszany", "value_zl": 0.0, "note": "Koszt roczny mocy (stałe)"},
        {"label": "Model warstwowy (2-strefowy)", "value_zl": 0.0, "note": "Koszt roczny mocy (stałe)"},
    ]

    if delta_P_kW <= 0:
        text = (
            "W analizowanym przypadku nie występuje dodatnia różnica mocy (ΔP ≤ 0), "
            "więc nie ma policzalnego kosztu nadmiarowej mocy wynikającego z modelu idealnie mieszanego."
        )
        return 0.0, 0.0, 0.0, text, cost_bar_year

    if month_rate is None or year_rate is None:
        text = (
            "Dodatnia różnica mocy (ΔP > 0) wskazuje potencjał redukcji mocy zamówionej, "
            "ale nie podano stawek kosztu mocy (zł/kW/miesiąc lub zł/kW/rok), więc nie wyliczono skutków finansowych."
        )
        return 0.0, 0.0, 0.0, text, cost_bar_year

    extra_month = delta_P_kW * float(month_rate)
    extra_year = delta_P_kW * float(year_rate)
    extra_total = extra_year * float(cost_n.analysis_horizon_years)

    text = (
        f"Przyjęcie uproszczonego modelu idealnie mieszanego skutkuje zawyżeniem mocy zamówionej o {delta_P_kW:.2f} kW, "
        f"co przekłada się na dodatkowy koszt stały ok. {extra_month:.0f} zł miesięcznie "
        f"(ok. {extra_year:.0f} zł rocznie). "
        f"W horyzoncie {cost_n.analysis_horizon_years} lat daje to koszt rzędu {extra_total:.0f} zł."
    )

    # Wykres kosztów rocznych (porównanie): tutaj pokazujemy koszt *różnicy* jako słupek.
    # Jeśli w przyszłości dojdzie pełna taryfa, można dodać koszty bezwzględne.
    cost_bar_year = [
        {"label": "Koszt nadmiarowej mocy (mix vs layer)", "value_zl": extra_year, "note": "Rocznie"},
    ]

    return extra_month, extra_year, extra_total, text, cost_bar_year


def _decision_color(level: str) -> str:
    # Do GUI: proste mapowanie A/B/C -> zielony/żółty/czerwony
    if level == "A":
        return "green"
    if level == "B":
        return "yellow"
    return "red"


def _build_final_decision(
    *,
    recommendation_level: str,
    Pzam_mix_kW: float,
    Pzam_layer_kW: float,
    delta_P_kW: float,
    delta_P_percent: float,
    extra_cost_year_zl: float,
    extra_cost_total_zl: float,
    horizon_years: Optional[int],
) -> Tuple[float, str, str, dict]:
    """Buduje jednoznaczną propozycję Pzam_final + tekst raportowy.

    Zasady:
    - A => Pzam_final = Pzam_mix
    - B/C => Pzam_final = Pzam_layer
    - Nie narzuca "modelu" – uzasadnia wybór i pokazuje koszt alternatywy.
    """

    level = recommendation_level

    if level == "A":
        P_final = Pzam_mix_kW
        basis = "techniczna"
        lines = [
            "Na podstawie przeprowadzonej analizy porównawczej modeli CWU rekomenduje się przyjęcie mocy zamówionej:",
            f"Pzam = {P_final:.1f} kW.",
            "",
            "W analizowanym przypadku uproszczony model idealnie mieszany jest wystarczający jako model referencyjny, "+
            "ponieważ różnica względem modelu warstwowego nie ma istotnego wpływu na wynik doboru mocy.",
        ]
        alt = (
            f"Dla porównania model warstwowy daje Pzam = {Pzam_layer_kW:.1f} kW (ΔP = {delta_P_kW:.1f} kW, ≈ {delta_P_percent:.1f}%)."
        )
        lines.append(alt)
        text = "\n".join(lines)
    else:
        P_final = Pzam_layer_kW
        # Jeśli policzono koszty i ΔP>0, decyzja jest techniczno-finansowa; inaczej techniczna
        basis = "techniczno-finansowa" if (delta_P_kW > 0 and extra_cost_year_zl > 0) else "techniczna"

        lines = [
            "Na podstawie przeprowadzonej analizy porównawczej modeli CWU rekomenduje się przyjęcie mocy zamówionej:",
            f"Pzam = {P_final:.1f} kW.",
            "",
            "Model idealnie mieszany traktowany jest jako konserwatywna referencja. W analizowanym przypadku prowadziłby do "+
            f"zawyżenia mocy o {delta_P_kW:.2f} kW (≈ {delta_P_percent:.1f}%) względem modelu warstwowego.",
        ]

        if level == "C":
            lines.append("Różnica jest istotna – wskazuje realną możliwość obniżenia mocy zamówionej bez pogorszenia kryterium komfortu CWU.")
        else:
            lines.append("Różnica przekracza przyjęte progi decyzyjne, dlatego zaleca się przyjęcie wyniku z modelu warstwowego.")

        if delta_P_kW > 0 and extra_cost_year_zl > 0:
            if horizon_years is not None and horizon_years > 0:
                lines.append(
                    f"Pozostanie przy Pzam_mix oznaczałoby dodatkowy koszt stały ok. {extra_cost_year_zl:.0f} zł rocznie "
                    f"(rzędu {extra_cost_total_zl:.0f} zł w horyzoncie {horizon_years} lat)."
                )
            else:
                lines.append(
                    f"Pozostanie przy Pzam_mix oznaczałoby dodatkowy koszt stały ok. {extra_cost_year_zl:.0f} zł rocznie."
                )
        else:
            lines.append(
                "Skutki finansowe decyzji można policzyć po podaniu stawek kosztu mocy (zł/kW/miesiąc lub zł/kW/rok)."
            )

        lines.append("Przyjęta wartość zapewnia zachowanie komfortu CWU oraz transparentne uzasadnienie techniczne decyzji.")
        text = "\n".join(lines)

    ui = {
        "level": level,
        "color": _decision_color(level),
        "title": "REKOMENDOWANA MOC ZAMÓWIONA",
        "Pzam_mix_kW": Pzam_mix_kW,
        "Pzam_layer_kW": Pzam_layer_kW,
        "Pzam_final_kW": P_final,
        "rows": [
            {"label": "Pzam (model idealnie mieszany)", "value_kW": Pzam_mix_kW},
            {"label": "Pzam (model warstwowy)", "value_kW": Pzam_layer_kW},
            {"label": "Pzam (rekomendowana)", "value_kW": P_final},
        ],
    }

    return P_final, basis, text, ui


def _mean(values: Sequence[float]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def _profile_peak_metrics(
    demand_lpm: DemandProfile,
    dt_s: int,
    thresholds: RecommendationThresholds,
) -> dict:
    """Metryki profilu poboru (jawne i proste do wyjaśnienia audytorowi)."""

    max_lpm = max((float(x) for x in demand_lpm), default=0.0)
    avg_lpm = _mean([float(x) for x in demand_lpm])

    peak_thr = max(thresholds.peak_threshold_min_lpm, thresholds.peak_threshold_fraction_of_max * max_lpm)

    # Segmenty pików (ciągi kroków z demand >= peak_thr)
    segments_steps: List[int] = []
    current = 0
    peak_sum = 0.0
    total_sum = 0.0

    for x in demand_lpm:
        v = max(0.0, float(x))
        total_sum += v
        if v >= peak_thr:
            peak_sum += v
            current += 1
        else:
            if current > 0:
                segments_steps.append(current)
                current = 0
    if current > 0:
        segments_steps.append(current)

    max_peak_steps = max(segments_steps, default=0)
    max_peak_minutes = (max_peak_steps * dt_s) / 60.0
    peaks_count = len(segments_steps)

    # Udział energii w pikach (przy stałym T_set i T_cold proporcjonalny do sumy lpm w pikach)
    peak_energy_share = (peak_sum / total_sum) if total_sum > 0 else 0.0

    return {
        "demand_max_lpm": max_lpm,
        "demand_avg_lpm": avg_lpm,
        "peak_threshold_lpm": peak_thr,
        "peaks_count": peaks_count,
        "peak_max_duration_min": max_peak_minutes,
        "peak_energy_share": peak_energy_share,
    }


def _build_recommendation(
    *,
    tank: TankParams,
    layered_params: LayeredParams,
    thresholds: RecommendationThresholds,
    profile_metrics: dict,
    delta_P_kW: float,
    delta_P_percent: float,
) -> Tuple[str, str, str, Optional[str], dict]:
    """Zwraca (level, title, text, economic_hint, metrics)."""

    # Podstawowe kryteria progowe
    significant_abs = delta_P_kW >= thresholds.deltaP_abs_threshold_kw
    significant_pct = delta_P_percent >= thresholds.deltaP_percent_threshold
    significant = significant_abs or significant_pct

    # Heurystyki pomocnicze
    avg_lpm = float(profile_metrics.get("demand_avg_lpm", 0.0))
    peak_max_duration_min = float(profile_metrics.get("peak_max_duration_min", 0.0))
    peak_energy_share = float(profile_metrics.get("peak_energy_share", 0.0))

    capacity_hours = (tank.volume_l / (avg_lpm * 60.0)) if avg_lpm > 0 else float("inf")
    is_large_tank = capacity_hours >= thresholds.tank_hours_threshold
    is_short_peaks = peak_max_duration_min > 0 and peak_max_duration_min <= thresholds.short_peak_max_minutes
    strat_good = layered_params.mixing_tau_s >= thresholds.stratification_good_tau_s

    # Stopień "siły" różnicy
    strong_delta = (
        delta_P_kW >= 2.0 * thresholds.deltaP_abs_threshold_kw
        or delta_P_percent >= 2.0 * thresholds.deltaP_percent_threshold
    )

    # Decyzja A/B/C
    if not significant:
        level = "A"
        title = "Model idealnie mieszany wystarczający"
    else:
        # "Krytyczny" gdy różnica jest duża i warunki sprzyjają stratyfikacji/pikom
        if strong_delta and (is_short_peaks or peak_energy_share >= 0.35) and (is_large_tank or strat_good):
            level = "C"
            title = "Model warstwowy krytyczny"
        else:
            level = "B"
            title = "Model warstwowy zalecany"

    # Tekst raportowy (neutralny, doradczy)
    thr_abs = thresholds.deltaP_abs_threshold_kw
    thr_pct = thresholds.deltaP_percent_threshold

    base = (
        f"W analizowanym przypadku uproszczony model idealnie mieszany daje moc zamówioną wyższą o "
        f"{delta_P_percent:.1f}% ({delta_P_kW:.2f} kW) względem modelu warstwowego (2‑strefowego)."
    )

    if level == "A":
        reason = (
            f"Różnica ΔP nie przekracza przyjętych progów decyzyjnych "
            f"({thr_abs:.0f} kW lub {thr_pct:.0f}%). "
            f"W tym układzie koszt uproszczenia jest mały, więc model idealnie mieszany jest wystarczający jako referencyjny."
        )
    elif level == "B":
        reason_parts: List[str] = [
            f"Różnica ΔP przekracza co najmniej jeden z progów ({thr_abs:.0f} kW / {thr_pct:.0f}%)."
        ]
        if is_short_peaks:
            reason_parts.append(
                f"Profil zawiera krótkotrwałe piki (maks. {peak_max_duration_min:.0f} min powyżej progu piku)."
            )
        if is_large_tank:
            reason_parts.append(
                f"Pojemność zasobnika jest duża w relacji do średniego poboru (≈ {capacity_hours:.2f} h ekwiwalentu)."
            )
        if strat_good:
            reason_parts.append(
                f"Założona stratyfikacja jest dobra (mixing_tau_s={layered_params.mixing_tau_s:.0f} s)."
            )
        reason_parts.append(
            "Zastosowanie modelu warstwowego jest zasadne, aby ilościowo pokazać koszt uproszczenia i umożliwić świadomą decyzję."
        )
        reason = " ".join(reason_parts)
    else:  # C
        reason_parts = [
            f"Różnica ΔP jest znacząca i wskazuje realny potencjał ograniczenia mocy zamówionej bez pogorszenia kryterium komfortu."
        ]
        if is_short_peaks:
            reason_parts.append("Dominują krótkie, intensywne piki poboru.")
        if peak_energy_share > 0:
            reason_parts.append(f"Udział energii pobranej w pikach wynosi około {peak_energy_share*100:.0f}%. ")
        if is_large_tank:
            reason_parts.append("Duży zasobnik sprzyja wykorzystaniu stratyfikacji do pokrywania pików.")
        if strat_good:
            reason_parts.append("Dobra stratyfikacja dodatkowo zwiększa różnicę między modelami.")
        reason_parts.append(
            "W tej sytuacji warto oprzeć decyzję projektowo‑eksploatacyjną o wynik modelu warstwowego i traktować model mieszany jako konserwatywną referencję."
        )
        reason = " ".join(reason_parts)

    text = base + " " + reason

    economic_hint = None
    if delta_P_kW > 0:
        economic_hint = f"Potencjał redukcji mocy zamówionej: ~{delta_P_kW:.1f} kW (≈ {delta_P_percent:.1f}%)."

    metrics = {
        **profile_metrics,
        "tank_capacity_hours_at_avg": capacity_hours,
        "stratification_tau_s": layered_params.mixing_tau_s,
        "is_short_peaks": is_short_peaks,
        "is_large_tank": is_large_tank,
        "stratification_good": strat_good,
        "thresholds": {
            "deltaP_abs_threshold_kw": thresholds.deltaP_abs_threshold_kw,
            "deltaP_percent_threshold": thresholds.deltaP_percent_threshold,
            "short_peak_max_minutes": thresholds.short_peak_max_minutes,
            "tank_hours_threshold": thresholds.tank_hours_threshold,
            "stratification_good_tau_s": thresholds.stratification_good_tau_s,
        },
    }

    return level, title, text, economic_hint, metrics


# --- Fizyka / pre-pass ---

def prepass_energy_and_pavg(
    demand_lpm: DemandProfile,
    dt_s: int,
    T_cold_C: float,
    T_delivery_C: float,
) -> Tuple[float, float]:
    """Obowiązkowy pre-pass.

    demand_lpm jest zdefiniowane jako wypływ na punktach czerpalnych o temperaturze
    T_delivery ≈ T_set (tu przyjmujemy T_delivery_C = T_set_C).
    """

    if dt_s <= 0:
        raise ValueError("dt_s must be > 0")
    if len(demand_lpm) == 0:
        raise ValueError("Demand profile cannot be empty.")
    if T_delivery_C <= T_cold_C:
        raise ValueError("T_delivery_C musi być > T_cold_C")

    rho_kg_per_l = 1.0
    cp_J_per_kgK = 4180.0
    dT = T_delivery_C - T_cold_C

    total_J = 0.0
    for lpm in demand_lpm:
        v_delivery_l = max(0.0, float(lpm)) * (dt_s / 60.0)
        m_kg = v_delivery_l * rho_kg_per_l
        total_J += m_kg * cp_J_per_kgK * dT

    total_kWh = total_J / 3_600_000.0
    total_h = (len(demand_lpm) * dt_s) / 3600.0
    p_avg_kW = (total_kWh / total_h) if total_h > 0 else 0.0

    return total_kWh, p_avg_kW


def derive_loss_kw(loss_input: LossInput, P_avg_CWU_kW: float) -> float:
    loss_input.validate()

    if loss_input.loss_kw is not None:
        return float(loss_input.loss_kw)

    if loss_input.UA_W_per_K is not None and loss_input.deltaT_K is not None:
        return float(loss_input.UA_W_per_K) * float(loss_input.deltaT_K) / 1000.0

    if loss_input.loss_percent_of_pavg is not None:
        return (float(loss_input.loss_percent_of_pavg) / 100.0) * max(0.0, float(P_avg_CWU_kW))

    raise RuntimeError("Nie udało się wyznaczyć loss_kw (sprawdź wejścia).")


# --- Narzędzia wspólne ---

def _energy_capacity_J(volume_l: float, T_target_C: float, T_cold_C: float) -> float:
    rho_kg_per_l = 1.0
    cp_J_per_kgK = 4180.0
    m_kg = volume_l * rho_kg_per_l
    return m_kg * cp_J_per_kgK * max(0.0, (T_target_C - T_cold_C))


def _temp_from_energy_J(E_J: float, volume_l: float, T_cold_C: float) -> float:
    rho_kg_per_l = 1.0
    cp_J_per_kgK = 4180.0
    m_kg = volume_l * rho_kg_per_l
    if m_kg <= 0:
        return T_cold_C
    return T_cold_C + (max(0.0, E_J) / (m_kg * cp_J_per_kgK))


def _regen_time_s(time_s: List[int], temp_C: List[float], t_min_temp_s: int, threshold_C: float, dt_s: int) -> Optional[int]:
    if not time_s:
        return None
    start_idx = min(len(time_s) - 1, max(0, t_min_temp_s // dt_s))
    for j in range(start_idx, len(time_s)):
        if temp_C[j] >= threshold_C:
            return time_s[j] - t_min_temp_s
    return None


# --- Model A: idealnie mieszany ---

def simulate_mixed(
    tank: TankParams,
    demand_lpm: DemandProfile,
    pmax_kW: float,
    loss_kw: float,
    allowed_violation_min: float,
    hysteresis_C: float = 0.0,
) -> ModelRunResult:
    if tank.volume_l <= 0:
        raise ValueError("volume_l must be > 0")
    if pmax_kW < 0:
        raise ValueError("pmax_kW must be >= 0")
    if loss_kw < 0:
        raise ValueError("loss_kw must be >= 0")

    dt = tank.dt_s
    if dt <= 0:
        raise ValueError("dt_s must be > 0")

    E_cap_J = _energy_capacity_J(tank.volume_l, tank.T_set_C, tank.T_cold_C)
    E_J = _energy_capacity_J(tank.volume_l, tank.T_init_C, tank.T_cold_C)

    dT_delivery = tank.T_set_C - tank.T_cold_C
    if dT_delivery <= 0:
        raise ValueError("T_set_C musi być > T_cold_C")

    time_s: List[int] = []
    temps_C: List[float] = []
    pin_series: List[float] = []

    violation_s = 0
    Tmin_reached = _temp_from_energy_J(E_J, tank.volume_l, tank.T_cold_C)
    t_min_temp_s = 0

    heater_on = Tmin_reached < tank.T_set_C

    for i, lpm in enumerate(demand_lpm):
        t_s = i * dt
        T_now = _temp_from_energy_J(E_J, tank.volume_l, tank.T_cold_C)

        time_s.append(t_s)
        temps_C.append(T_now)

        v_delivery_l = max(0.0, float(lpm)) * (dt / 60.0)
        E_draw_J = _energy_capacity_J(v_delivery_l, tank.T_set_C, tank.T_cold_C)

        E_loss_J = loss_kw * 1000.0 * dt

        # zdejmij energię poboru i strat
        E_J = max(0.0, E_J - E_draw_J)
        E_J = max(0.0, E_J - E_loss_J)

        T_after = _temp_from_energy_J(E_J, tank.volume_l, tank.T_cold_C)

        # sterowanie
        if hysteresis_C > 0:
            if heater_on and T_after >= tank.T_set_C:
                heater_on = False
            elif (not heater_on) and T_after <= (tank.T_set_C - hysteresis_C):
                heater_on = True
        else:
            heater_on = T_after < tank.T_set_C

        p_in = pmax_kW if heater_on else 0.0
        pin_series.append(p_in)

        E_J = min(E_cap_J, E_J + p_in * 1000.0 * dt)

        T_end = _temp_from_energy_J(E_J, tank.volume_l, tank.T_cold_C)
        if T_end < tank.T_min_C:
            violation_s += dt

        if T_end < Tmin_reached:
            Tmin_reached = T_end
            t_min_temp_s = t_s + dt

    violation_minutes = violation_s / 60.0

    regen_to_Tmin_s = _regen_time_s(time_s, temps_C, t_min_temp_s, tank.T_min_C, dt)
    regen_to_Tset_s = _regen_time_s(time_s, temps_C, t_min_temp_s, tank.T_set_C, dt)

    return ModelRunResult(
        model="mixed",
        Pzam_kW=pmax_kW,
        loss_kw=loss_kw,
        time_s=time_s,
        T_primary_C=temps_C,
        P_in_kW=pin_series,
        violation_minutes=violation_minutes,
        regen_to_Tmin_s=regen_to_Tmin_s,
        regen_to_Tset_s=regen_to_Tset_s,
        t_min_temp_s=t_min_temp_s,
        T_min_reached_C=Tmin_reached,
        T_secondary_C=None,
    )


# --- Model B: warstwowy 2-strefowy ---

def simulate_layered_2zone(
    tank: TankParams,
    layered: LayeredParams,
    demand_lpm: DemandProfile,
    pmax_kW: float,
    loss_kw: float,
    allowed_violation_min: float,
    hysteresis_C: float = 0.0,
) -> ModelRunResult:
    if tank.volume_l <= 0:
        raise ValueError("volume_l must be > 0")
    if pmax_kW < 0:
        raise ValueError("pmax_kW must be >= 0")
    if loss_kw < 0:
        raise ValueError("loss_kw must be >= 0")

    dt = tank.dt_s
    if dt <= 0:
        raise ValueError("dt_s must be > 0")

    hot_fraction = float(layered.hot_fraction)
    if not (0.05 <= hot_fraction <= 0.95):
        raise ValueError("hot_fraction powinno być w rozsądnym zakresie (np. 0.05..0.95)")

    V_total = tank.volume_l
    V_hot = V_total * hot_fraction
    V_cold = V_total - V_hot

    # Pojemność energii do T_set w hot
    E_hot_cap_J = _energy_capacity_J(V_hot, tank.T_set_C, tank.T_cold_C)

    # Start: oba segmenty w tej samej temperaturze początkowej (uproszczenie)
    E_hot_J = _energy_capacity_J(V_hot, tank.T_init_C, tank.T_cold_C)
    E_cold_J = _energy_capacity_J(V_cold, tank.T_init_C, tank.T_cold_C)

    time_s: List[int] = []
    Th_series: List[float] = []
    Tc_series: List[float] = []
    pin_series: List[float] = []

    violation_s = 0
    Tmin_reached = _temp_from_energy_J(E_hot_J, V_hot, tank.T_cold_C)
    t_min_temp_s = 0

    heater_on = Tmin_reached < tank.T_set_C

    for i, lpm in enumerate(demand_lpm):
        t_s = i * dt
        T_hot = _temp_from_energy_J(E_hot_J, V_hot, tank.T_cold_C)
        T_cold = _temp_from_energy_J(E_cold_J, V_cold, tank.T_cold_C)

        time_s.append(t_s)
        Th_series.append(T_hot)
        Tc_series.append(T_cold)

        # (1) Pobór energii zgodnie z definicją audytową (woda na kranie o T_set)
        v_delivery_l = max(0.0, float(lpm)) * (dt / 60.0)
        E_out_J = _energy_capacity_J(v_delivery_l, tank.T_set_C, tank.T_cold_C)

        # Wyjście następuje z górnej strefy.
        E_hot_J = max(0.0, E_hot_J - E_out_J)

        # (1b) Ubytek objętości w hot jest uzupełniany wodą z dolnej strefy (plug-flow).
        # Energię przenosimy proporcjonalnie do udziału objętości.
        if v_delivery_l > 0 and V_cold > 0:
            frac_cold_moved = min(1.0, v_delivery_l / V_cold)
            E_transfer_J = E_cold_J * frac_cold_moved
            E_cold_J = max(0.0, E_cold_J - E_transfer_J)
            E_hot_J = min(E_hot_cap_J, E_hot_J + E_transfer_J)

        # (2) Straty stałą mocą, identyczne w sumie jak w modelu mieszanym.
        E_loss_total_J = loss_kw * 1000.0 * dt
        if layered.losses_split == "by_volume":
            E_loss_hot = E_loss_total_J * (V_hot / V_total)
            E_loss_cold = E_loss_total_J * (V_cold / V_total)
        elif layered.losses_split == "all_hot":
            E_loss_hot = E_loss_total_J
            E_loss_cold = 0.0
        else:
            # domyślnie bezpiecznie
            E_loss_hot = E_loss_total_J * (V_hot / V_total)
            E_loss_cold = E_loss_total_J * (V_cold / V_total)

        E_hot_J = max(0.0, E_hot_J - E_loss_hot)
        E_cold_J = max(0.0, E_cold_J - E_loss_cold)

        # (3) Powolne mieszanie między strefami (relaksacja do Teq) – stabilne i zachowuje energię.
        tau = float(layered.mixing_tau_s)
        if tau > 0:
            alpha = max(0.0, min(1.0, dt / tau))
            # temperatury chwilowe
            Th = _temp_from_energy_J(E_hot_J, V_hot, tank.T_cold_C)
            Tc = _temp_from_energy_J(E_cold_J, V_cold, tank.T_cold_C)
            # temperatura równowagi (ważona masami = objętościami)
            Teq = (Th * V_hot + Tc * V_cold) / V_total
            Th2 = Th + alpha * (Teq - Th)
            Tc2 = Tc + alpha * (Teq - Tc)
            E_hot_J = min(E_hot_cap_J, _energy_capacity_J(V_hot, Th2, tank.T_cold_C))
            E_cold_J = _energy_capacity_J(V_cold, Tc2, tank.T_cold_C)

        # (4) Sterowanie i dogrzewanie – najpierw podnosi T_hot.
        T_hot_after = _temp_from_energy_J(E_hot_J, V_hot, tank.T_cold_C)

        if hysteresis_C > 0:
            if heater_on and T_hot_after >= tank.T_set_C:
                heater_on = False
            elif (not heater_on) and T_hot_after <= (tank.T_set_C - hysteresis_C):
                heater_on = True
        else:
            heater_on = T_hot_after < tank.T_set_C

        p_in = pmax_kW if heater_on else 0.0
        pin_series.append(p_in)
        E_hot_J = min(E_hot_cap_J, E_hot_J + p_in * 1000.0 * dt)

        # (5) Komfort dotyczy tylko strefy górnej.
        T_hot_end = _temp_from_energy_J(E_hot_J, V_hot, tank.T_cold_C)
        if T_hot_end < tank.T_min_C:
            violation_s += dt

        if T_hot_end < Tmin_reached:
            Tmin_reached = T_hot_end
            t_min_temp_s = t_s + dt

    violation_minutes = violation_s / 60.0

    regen_to_Tmin_s = _regen_time_s(time_s, Th_series, t_min_temp_s, tank.T_min_C, dt)
    regen_to_Tset_s = _regen_time_s(time_s, Th_series, t_min_temp_s, tank.T_set_C, dt)

    return ModelRunResult(
        model="layered_2zone",
        Pzam_kW=pmax_kW,
        loss_kw=loss_kw,
        time_s=time_s,
        T_primary_C=Th_series,
        P_in_kW=pin_series,
        violation_minutes=violation_minutes,
        regen_to_Tmin_s=regen_to_Tmin_s,
        regen_to_Tset_s=regen_to_Tset_s,
        t_min_temp_s=t_min_temp_s,
        T_min_reached_C=Tmin_reached,
        T_secondary_C=Tc_series,
    )


# --- Szukanie minimalnej mocy Pzam ---

def _find_min_pmax(
    simulate_fn,
    pmax_start_kW: float,
    pmax_max_kW: float,
    tol_kW: float,
    allowed_violation_min: float,
) -> ModelRunResult:
    if tol_kW <= 0:
        raise ValueError("tol_kW must be > 0")

    def ok(p_kW: float) -> Tuple[bool, ModelRunResult]:
        res = simulate_fn(p_kW)
        return (res.violation_minutes <= allowed_violation_min), res

    p_hi = max(0.0, float(pmax_start_kW))
    hi_ok, res_hi = ok(p_hi)
    while (not hi_ok) and p_hi < pmax_max_kW:
        p_hi *= 2.0
        hi_ok, res_hi = ok(p_hi)

    if not hi_ok:
        raise RuntimeError(f"Nie znaleziono Pmax spełniającego warunek do {pmax_max_kW} kW.")

    p_lo = 0.0
    while (p_hi - p_lo) > tol_kW:
        p_mid = 0.5 * (p_lo + p_hi)
        mid_ok, res_mid = ok(p_mid)
        if mid_ok:
            p_hi = p_mid
            res_hi = res_mid
        else:
            p_lo = p_mid

    return res_hi


def compare_models(
    tank: TankParams,
    demand_lpm: DemandProfile,
    loss_input: LossInput,
    allowed_violation_min: float,
    layered: Optional[LayeredParams] = None,
    thresholds: Optional[RecommendationThresholds] = None,
    cost_params: Optional[CostParams] = None,
    pmax_start_kW: float = 10.0,
    pmax_max_kW: float = 5000.0,
    tol_kW: float = 0.1,
) -> ComparisonResult:
    """Porównuje model idealnie mieszany vs warstwowy 2-strefowy.

    Zwraca strukturę gotową do GUI/raportu:
    - serie T(t) i P_in(t)
    - wartości Pzam w formie danych słupkowych
    - ΔP i ΔP_%
    - komentarz inżynierski
    """

    layered_params = layered or LayeredParams()
    thr = thresholds or RecommendationThresholds()

    # Pre-pass (obowiązkowy): energia i P_avg_CWU wg definicji demand_lpm
    E_CWU_kWh, P_avg_CWU_kW = prepass_energy_and_pavg(
        demand_lpm=demand_lpm,
        dt_s=tank.dt_s,
        T_cold_C=tank.T_cold_C,
        T_delivery_C=tank.T_set_C,
    )

    loss_kw = derive_loss_kw(loss_input=loss_input, P_avg_CWU_kW=P_avg_CWU_kW)

    profile_metrics = _profile_peak_metrics(demand_lpm=demand_lpm, dt_s=tank.dt_s, thresholds=thr)

    mix_res = _find_min_pmax(
        simulate_fn=lambda p: simulate_mixed(
            tank=tank,
            demand_lpm=demand_lpm,
            pmax_kW=p,
            loss_kw=loss_kw,
            allowed_violation_min=allowed_violation_min,
        ),
        pmax_start_kW=pmax_start_kW,
        pmax_max_kW=pmax_max_kW,
        tol_kW=tol_kW,
        allowed_violation_min=allowed_violation_min,
    )

    layered_res = _find_min_pmax(
        simulate_fn=lambda p: simulate_layered_2zone(
            tank=tank,
            layered=layered_params,
            demand_lpm=demand_lpm,
            pmax_kW=p,
            loss_kw=loss_kw,
            allowed_violation_min=allowed_violation_min,
        ),
        pmax_start_kW=pmax_start_kW,
        pmax_max_kW=pmax_max_kW,
        tol_kW=tol_kW,
        allowed_violation_min=allowed_violation_min,
    )

    delta_P = mix_res.Pzam_kW - layered_res.Pzam_kW
    delta_pct = (delta_P / layered_res.Pzam_kW * 100.0) if layered_res.Pzam_kW > 0 else 0.0

    rec_level, rec_title, rec_text, econ_hint, rec_metrics = _build_recommendation(
        tank=tank,
        layered_params=layered_params,
        thresholds=thr,
        profile_metrics=profile_metrics,
        delta_P_kW=delta_P,
        delta_P_percent=delta_pct,
    )

    extra_month_zl, extra_year_zl, extra_total_zl, econ_commentary, cost_bar_year = _financial_impact(
        delta_P_kW=delta_P,
        cost=cost_params or CostParams(),
    )

    cost_norm = (cost_params or CostParams()).normalized()
    horizon_years = cost_norm.analysis_horizon_years if (cost_norm.cost_per_kw_year_zl is not None or cost_norm.cost_per_kw_month_zl is not None) else None

    P_final, decision_basis, final_text, decision_ui = _build_final_decision(
        recommendation_level=rec_level,
        Pzam_mix_kW=mix_res.Pzam_kW,
        Pzam_layer_kW=layered_res.Pzam_kW,
        delta_P_kW=delta_P,
        delta_P_percent=delta_pct,
        extra_cost_year_zl=extra_year_zl,
        extra_cost_total_zl=extra_total_zl,
        horizon_years=horizon_years,
    )

    series_for_plot = {
        "time_s": mix_res.time_s,
        "T_tank_mix_C": mix_res.T_primary_C,
        "T_hot_layer_C": layered_res.T_primary_C,
        "T_cold_layer_C": layered_res.T_secondary_C,
        "P_in_mix_kW": mix_res.P_in_kW,
        "P_in_layer_kW": layered_res.P_in_kW,
    }

    bar_chart = [
        {
            "label": "Model idealnie mieszany",
            "value_kW": mix_res.Pzam_kW,
            "note": "Referencyjny (konserwatywny)",
        },
        {
            "label": "Model warstwowy (2-strefowy)",
            "value_kW": layered_res.Pzam_kW,
            "note": "Uproszczona stratyfikacja",
        },
    ]

    commentary = _engineering_commentary(
        delta_P_kW=delta_P,
        delta_P_percent=delta_pct,
        layered_params=layered_params,
    )

    return ComparisonResult(
        P_avg_CWU_kW=P_avg_CWU_kW,
        E_CWU_kWh=E_CWU_kWh,
        mix=mix_res,
        layered=layered_res,
        delta_P_kW=delta_P,
        delta_P_percent=delta_pct,
        recommendation_level=rec_level,
        recommendation_title=rec_title,
        recommendation_text=rec_text,
        economic_hint=econ_hint,
        metrics=rec_metrics,
        extra_cost_month_zl=extra_month_zl,
        extra_cost_year_zl=extra_year_zl,
        extra_cost_total_zl=extra_total_zl,
        economic_commentary=econ_commentary,
        Pzam_final_kw=P_final,
        decision_basis=decision_basis,
        final_decision_text=final_text,
        decision_ui=decision_ui,
        series_for_plot=series_for_plot,
        bar_chart=bar_chart,
        commentary=commentary,
        cost_bar_chart_year=cost_bar_year,
    )


def _engineering_commentary(delta_P_kW: float, delta_P_percent: float, layered_params: LayeredParams) -> str:
    # Krótko, "raportowo" – gotowe do wklejenia do GUI/raportu.
    lines: List[str] = []

    lines.append(
        "Model idealnie mieszany jest konserwatywny, bo rozprowadza spadek temperatury po całej objętości zasobnika, "
        "czyli szybciej obniża temperaturę referencyjną (T_tank) w odpowiedzi na pik poboru."
    )

    lines.append(
        "Model warstwowy (2-strefowy) utrzymuje warstwę gorącą u góry: pobór obciąża głównie strefę hot, "
        "a strefa cold działa jak bufor, dzięki czemu T_hot dłużej utrzymuje się powyżej Tmin."
    )

    if delta_P_kW >= 0:
        lines.append(
            f"W tym układzie uproszczenie (mieszanie idealne) zawyża wymaganą moc o około {delta_P_kW:.2f} kW "
            f"(≈ {delta_P_percent:.1f}%)."
        )
    else:
        # rzadkie, ale możliwe przy ekstremalnych parametrach
        lines.append(
            f"W tym układzie model warstwowy wyszedł bardziej wymagający o {abs(delta_P_kW):.2f} kW "
            f"(≈ {abs(delta_P_percent):.1f}%). Sprawdź parametry stratyfikacji (hot_fraction, mixing_tau_s) i profil pików."
        )

    lines.append(
        "Największa różnica ΔP zwykle występuje przy: krótkich, ostrych pikach poboru; dużym zasobniku; dobrej stratyfikacji "
        f"(tu: mixing_tau_s={layered_params.mixing_tau_s:.0f}s); oraz gdy strefa hot stanowi sensowną część objętości "
        f"(tu: hot_fraction={layered_params.hot_fraction:.2f})."
    )

    lines.append(
        "Uproszczenie mieszania idealnego jest akceptowalne, gdy pobór jest rozłożony w czasie (brak pików), zasobnik jest mały, "
        "albo stratyfikacja w praktyce jest słaba (np. mieszanie przez cyrkulację, niewłaściwe wpięcia, wysoki przepływ)."
    )

    return "\n".join(lines)


# --- Minimalny przykład uruchomienia (bez wykresów) ---

if __name__ == "__main__":
    def build_profile_24h(dt_s: int, peaks: List[Tuple[int, int, float]]) -> List[float]:
        """Buduje prosty profil dobowy w krokach dt.

        peaks: lista (start_min, duration_min, lpm)
        """
        steps = int((24 * 3600) / dt_s)
        prof = [0.0] * steps
        for start_min, dur_min, lpm in peaks:
            start_i = int((start_min * 60) / dt_s)
            end_i = int(((start_min + dur_min) * 60) / dt_s)
            for i in range(max(0, start_i), min(steps, end_i)):
                prof[i] = float(lpm)
        return prof

    thr = RecommendationThresholds(deltaP_abs_threshold_kw=5.0, deltaP_percent_threshold=10.0)
    loss_input = LossInput(loss_percent_of_pavg=30.0)
    layered_params = LayeredParams(hot_fraction=0.3, mixing_tau_s=3600.0)
    cost = CostParams(cost_per_kw_month_zl=50.0, analysis_horizon_years=10)

    scenarios = [
        {
            "name": "Mały zasobnik / łagodny pobór",
            "tank": TankParams(volume_l=200.0, T_init_C=55.0, T_set_C=55.0, T_cold_C=10.0, T_min_C=45.0, dt_s=60),
            "demand": build_profile_24h(60, peaks=[(7 * 60, 60, 10.0), (19 * 60, 60, 8.0)]),
        },
        {
            "name": "Duży zasobnik / typowe piki",
            "tank": TankParams(volume_l=1000.0, T_init_C=55.0, T_set_C=55.0, T_cold_C=10.0, T_min_C=45.0, dt_s=60),
            "demand": build_profile_24h(60, peaks=[(7 * 60, 45, 35.0), (19 * 60, 45, 30.0)]),
        },
        {
            "name": "Ostre piki / dobra stratyfikacja",
            "tank": TankParams(volume_l=800.0, T_init_C=55.0, T_set_C=55.0, T_cold_C=10.0, T_min_C=45.0, dt_s=60),
            "demand": build_profile_24h(60, peaks=[(7 * 60, 15, 80.0), (19 * 60, 10, 70.0)]),
        },
    ]

    for s in scenarios:
        res = compare_models(
            tank=s["tank"],
            demand_lpm=s["demand"],
            loss_input=loss_input,
            allowed_violation_min=0.0,
            layered=layered_params,
            thresholds=thr,
            cost_params=cost,
            pmax_start_kW=10.0,
            tol_kW=0.1,
        )

        print("=" * 72)
        print(s["name"])
        print("Pzam_mix [kW]   :", round(res.mix.Pzam_kW, 2))
        print("Pzam_layer [kW] :", round(res.layered.Pzam_kW, 2))
        print("ΔP [kW]         :", round(res.delta_P_kW, 2))
        print("ΔP_%            :", round(res.delta_P_percent, 1))
        print("Rekomendacja    :", f"{res.recommendation_level} — {res.recommendation_title}")
        if res.economic_hint:
            print("Wskazówka       :", res.economic_hint)
        print("Koszt/mies. [zł] :", round(res.extra_cost_month_zl, 0))
        print("Koszt/rok [zł]   :", round(res.extra_cost_year_zl, 0))
        print("Koszt/horyzont   :", round(res.extra_cost_total_zl, 0), f"(lat: {cost.analysis_horizon_years})")
        print("\nTekst do raportu:\n" + res.recommendation_text)
        print("\nKomentarz ekonomiczny (raport):\n" + res.economic_commentary)

        print("\nDECYZJA KOŃCOWA (do raportu):")
        print("Podstawa decyzji :", res.decision_basis)
        print("Pzam_final [kW]   :", round(res.Pzam_final_kw, 2))
        print("\n" + res.final_decision_text)

        print("\nTabela (Technika → Decyzja):")
        for row in res.decision_ui.get("rows", []):
            print(f"- {row['label']}: {row['value_kW']:.2f} kW")
