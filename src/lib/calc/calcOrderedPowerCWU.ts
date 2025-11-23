// Obliczanie mocy zamówionej CWU wg podanego schematu
export interface OrderedPowerCWUInput {
  n_mieszkan: number;
  osoby_na_mieszkanie: number;
  zuzycie_jedn_dm3_na_dobe_na_os: number;
  czas_pracy_h_na_dobe: number;
  Nh: number;
  T_c: number;
  T_w: number;
  V_z_l: number;
  eta_z: number;
  t_szczyt_h: number;
}

export interface OrderedPowerCWUResult {
  n_osob: number;
  qd_sr_dm3_na_dobe: number;
  qh_sr_dm3_na_h: number;
  qh_max_dm3_na_h: number;
  Phi_max_kW_bez_zasobnika: number;
  Phi_sr_kW: number;
  Q_z_kWh: number;
  Phi_z_kW: number;
  Phi_wym_kW: number;
}

export function calcOrderedPowerCWU({
  n_mieszkan = 88,
  osoby_na_mieszkanie = 1.5,
  zuzycie_jedn_dm3_na_dobe_na_os = 110,
  czas_pracy_h_na_dobe = 18,
  Nh = 2.5,
  T_c = 10,
  T_w = 55,
  V_z_l = 1000,
  eta_z = 0.8,
  t_szczyt_h = 0.5,
}: Partial<OrderedPowerCWUInput>): OrderedPowerCWUResult {
  // 1. Liczba osób
  const n_osob = n_mieszkan * osoby_na_mieszkanie;

  // 2. Dobowe zapotrzebowanie
  const qd_sr_dm3_na_dobe = n_osob * zuzycie_jedn_dm3_na_dobe_na_os;

  // 3. Średnie godzinowe zużycie
  const qh_sr_dm3_na_h = qd_sr_dm3_na_dobe / czas_pracy_h_na_dobe;
  const qh_sr_m3_na_h = qh_sr_dm3_na_h / 1000;

  // 4. Maksymalne godzinowe zużycie
  const qh_max_dm3_na_h = Nh * qh_sr_dm3_na_h;
  const qh_max_m3_na_h = qh_max_dm3_na_h / 1000;

  // 5. Moc bez zasobnika
  const delta_T = T_w - T_c;
  const c = 4.19; // kJ/(kg*K)
  // przepływ masowy [kg/s]
  const m_dot_max = qh_max_m3_na_h * 1000 / 3600;
  const m_dot_sr = qh_sr_m3_na_h * 1000 / 3600;

  const Phi_max_kW = m_dot_max * c * delta_T;
  const Phi_sr_kW  = m_dot_sr  * c * delta_T;

  // 6. Zasobnik
  const V_z_m3 = V_z_l / 1000;
  // energia w zasobniku [kWh]
  const Q_z_kWh = 1.163 * V_z_m3 * delta_T;
  const Q_z_uzyte_kWh = eta_z * Q_z_kWh;
  const Phi_z_kW = Q_z_uzyte_kWh / t_szczyt_h;

  // 7. Wymagana moc źródła (po uwzględnieniu zasobnika)
  const Phi_wym_kW = Math.max(Phi_sr_kW, Phi_max_kW - Phi_z_kW);

  return {
    n_osob,
    qd_sr_dm3_na_dobe,
    qh_sr_dm3_na_h,
    qh_max_dm3_na_h,
    Phi_max_kW_bez_zasobnika: Phi_max_kW,
    Phi_sr_kW,
    Q_z_kWh,
    Phi_z_kW,
    Phi_wym_kW,
  };
}
