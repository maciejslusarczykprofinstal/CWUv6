from __future__ import annotations

from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from cwu_time_simulation import LayeredParams, LossInput, TankParams, compare_models


# CORS middleware
app = FastAPI(title="CWU – silnik decyzji mocy zamówionej", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class CWUInput(BaseModel):
    V_tank_l: int = Field(..., ge=1)
    T_set_C: float
    T_min_C: float
    loss_kw: float = Field(..., ge=0)
    cost_kw_month: float = Field(..., ge=0)
    horizon_years: int = Field(..., ge=1)


class CWUResponse(BaseModel):
    Pzam_final: float
    Pmix: float
    Player: float
    delta_P: float
    cost_month: float
    cost_year: float
    cost_horizon: float
    decision: str
    level: Literal["A", "B", "C"]


def _default_demand_profile_24h_lpm(dt_s: int) -> list[float]:
    """Domyślny profil dobowy (24h) w L/min.

    W backendzie potrzebujemy jakiegoś profilu referencyjnego, bo `compare_models()`
    wymaga `demand_lpm`, a model wejściowy API go nie zawiera.

    To jest profil „audytowy demonstracyjny”: dwa krótkie piki rano i wieczorem.
    """

    if dt_s <= 0:
        raise ValueError("dt_s must be > 0")

    steps = int((24 * 3600) / dt_s)
    prof = [0.0] * steps

    def set_peak(start_min: int, duration_min: int, lpm: float) -> None:
        start_i = int((start_min * 60) / dt_s)
        end_i = int(((start_min + duration_min) * 60) / dt_s)
        for i in range(max(0, start_i), min(steps, end_i)):
            prof[i] = float(lpm)

    set_peak(start_min=7 * 60, duration_min=20, lpm=60.0)
    set_peak(start_min=19 * 60, duration_min=20, lpm=50.0)

    return prof


@app.post("/api/cwu/moc-zamowiona", response_model=CWUResponse)
def cwu_moc_zamowiona(payload: CWUInput) -> CWUResponse:
    tank = TankParams(
        volume_l=float(payload.V_tank_l),
        T_init_C=float(payload.T_set_C),
        T_set_C=float(payload.T_set_C),
        T_cold_C=10.0,
        T_min_C=float(payload.T_min_C),
        dt_s=60,
    )

    loss_input = LossInput(loss_kw=float(payload.loss_kw))
    demand_lpm = _default_demand_profile_24h_lpm(dt_s=tank.dt_s)

    res = compare_models(
        tank=tank,
        demand_lpm=demand_lpm,
        loss_input=loss_input,
        allowed_violation_min=0.0,
        layered=LayeredParams(hot_fraction=0.3, mixing_tau_s=3600.0),
    )

    # Wymaganie specyfikacji: delta_P = res.delta_P_kw
    # W silniku pole nazywa się `delta_P_kW` (zachowujemy sens fizyczny, mapujemy nazwę).
    delta_P = float(res.delta_P_kW)

    cost_month = max(0.0, delta_P * float(payload.cost_kw_month))
    cost_year = cost_month * 12.0
    cost_horizon = cost_year * float(payload.horizon_years)

    level = str(res.decision_ui.get("level", "B"))
    if level not in {"A", "B", "C"}:
        level = "B"

    return CWUResponse(
        Pzam_final=float(res.Pzam_final_kw),
        Pmix=float(res.mix.Pzam_kW),
        Player=float(res.layered.Pzam_kW),
        delta_P=delta_P,
        cost_month=cost_month,
        cost_year=cost_year,
        cost_horizon=cost_horizon,
        decision=str(res.final_decision_text),
        level=level,  # type: ignore[arg-type]
    )


# Uruchomienie:
# uvicorn api:app --reload --port 8000
