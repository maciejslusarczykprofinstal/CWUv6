import streamlit as st
import matplotlib.pyplot as plt
from cwu_time_simulation import LayeredParams, LossInput, TankParams, compare_models

st.set_page_config(
    page_title="CWU – decyzja mocy zamówionej",
    layout="wide"
)

st.title("CWU – decyzja mocy zamówionej")

st.markdown("Demo lokalne (localhost) – model idealnie mieszany vs warstwowy")

# ===== SIDEBAR =====
st.sidebar.header("Parametry instalacji")

V_tank = st.sidebar.slider("Pojemność zasobnika [l]", 300, 1500, 800, 50)
T_set = st.sidebar.slider("Temperatura zadana CWU [°C]", 50, 60, 55)
T_min = st.sidebar.slider("Temperatura minimalna [°C]", 40, 50, 45)
loss_kw = st.sidebar.number_input("Straty CWU [kW]", value=3.0, step=0.5)

st.sidebar.header("Parametry kosztowe")
koszt_kw_mies = st.sidebar.number_input(
    "Koszt mocy [zł/kW/miesiąc]",
    min_value=10,
    max_value=150,
    value=50,
    step=1,
)

lata = st.sidebar.selectbox(
    "Horyzont analizy [lata]",
    options=[5, 10, 15],
    index=1,
)

run = st.sidebar.button("Oblicz")

# ===== MAIN =====
if run:
    # Silnik oczekuje obiektów konfiguracyjnych oraz profilu poboru demand_lpm.
    # demand_lpm jest zdefiniowane jako wypływ "na kranie" (po zmieszaniu) o T_delivery ≈ T_set.

    tank = TankParams(
        volume_l=float(V_tank),
        T_init_C=float(T_set),
        T_set_C=float(T_set),
        T_cold_C=10.0,
        T_min_C=float(T_min),
        dt_s=60,
    )

    loss_input = LossInput(loss_kw=float(loss_kw))

    # Prosty profil dobowy (24h, dt=60s => 1440 kroków): dwa piki rano i wieczorem.
    demand_lpm = [0.0] * 1440
    for i in range(7 * 60, 7 * 60 + 20):
        demand_lpm[i] = 60.0
    for i in range(19 * 60, 19 * 60 + 20):
        demand_lpm[i] = 50.0

    res = compare_models(
        tank=tank,
        demand_lpm=demand_lpm,
        loss_input=loss_input,
        allowed_violation_min=0.0,
        layered=LayeredParams(hot_fraction=0.3, mixing_tau_s=3600.0),
    )

    st.subheader("Rekomendowana moc zamówiona")
    st.metric("Pzam final [kW]", round(res.Pzam_final_kw, 1))

    col1, col2, col3 = st.columns(3)
    col1.metric("Model mix [kW]", round(res.mix.Pzam_kW, 1))
    col2.metric("Model warstwowy [kW]", round(res.layered.Pzam_kW, 1))
    col3.metric("ΔP [kW]", round(res.delta_P_kW, 1))

    # ===== WYKRES (matplotlib) – tylko po kliknięciu "Oblicz" =====
    delta_P_kw = res.delta_P_kW
    percent_over = (delta_P_kw / res.mix.Pzam_kW * 100.0) if res.mix.Pzam_kW > 0 else 0.0

    st.markdown("**Zawyżenie mocy przez model idealnie mieszany:**")
    st.text(
        f"ΔP = {delta_P_kw:.1f} kW\n"
        f"({percent_over:.1f} %)"
    )

    labels = ["Model idealnie mieszany", "Model warstwowy", "Rekomendowana moc"]
    values = [float(res.mix.Pzam_kW), float(res.layered.Pzam_kW), float(res.Pzam_final_kw)]
    colors = ["#ff7f7f", "#1f77b4", "#2ca02c"]  # mix / warstwowy / final

    fig, ax = plt.subplots(figsize=(8, 3.6))
    bars = ax.bar(labels, values, color=colors)

    ax.set_ylabel("kW")
    ax.set_ylim(0, max(values) * 1.25 if max(values) > 0 else 1.0)
    ax.grid(axis="y", linestyle="--", linewidth=0.6, alpha=0.5)
    ax.set_axisbelow(True)

    for bar, val in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2.0,
            bar.get_height(),
            f"{val:.1f} kW",
            ha="center",
            va="bottom",
            fontsize=10,
        )

    ax.tick_params(axis="x", labelrotation=0)
    fig.tight_layout()

    st.pyplot(fig, clear_figure=True)

    # ===== SKUTKI FINANSOWE – tylko po kliknięciu "Oblicz" =====
    st.subheader("Skutki finansowe zawyżenia mocy")

    if delta_P_kw <= 0:
        koszt_mies = 0.0
        koszt_rok = 0.0
        koszt_horyzont = 0.0
        st.info("ΔP ≤ 0: brak nadmiarowej mocy do wyceny (koszty = 0).")
    else:
        koszt_mies = float(delta_P_kw) * float(koszt_kw_mies)
        koszt_rok = koszt_mies * 12.0
        koszt_horyzont = koszt_rok * float(lata)

    c1, c2, c3 = st.columns(3)
    c1.metric("💰 Koszt miesięczny", f"{koszt_mies:,.0f} zł/miesiąc".replace(",", " "))
    c2.metric("💰 Koszt roczny", f"{koszt_rok:,.0f} zł/rok".replace(",", " "))
    c3.metric("💰 Koszt w horyzoncie analizy", f"{koszt_horyzont:,.0f} zł".replace(",", " "))

    st.markdown(
        "Przy pozostaniu przy modelu idealnie mieszanym i koszcie mocy\n"
        f"{koszt_kw_mies} zł/kW/miesiąc, zawyżenie mocy o {delta_P_kw:.1f} kW\n"
        f"powoduje dodatkowy koszt rzędu {koszt_rok:.0f} zł rocznie\n"
        f"oraz {koszt_horyzont:.0f} zł w horyzoncie {lata} lat."
    )

    level = res.decision_ui["level"]

    if level == "A":
        st.success(res.final_decision_text)
    elif level == "B":
        st.warning(res.final_decision_text)
    else:
        st.error(res.final_decision_text)
