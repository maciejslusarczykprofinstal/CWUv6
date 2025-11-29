import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

def oblicz_moc_cwu(
    liczba_mieszkan=120,
    liczba_osob=400,
    temp_wew=22.0,
    temp_zew=-5.0,
    U=0.3,
    skutecznosc=0.85
):
    # ========================================
    # DANE WEJŚCIOWE (dla bloku wielorodzinnego)
    # ========================================
    # Dane standardowe z PN-B-02377:2015 — MOC ZAMÓWIONA NA POTRZEBY CWU
    masa_wody = 100 * liczba_osob  # [l] → [kg] (1 l = 1 kg)
    cieplo_wl = 4186               # [J/(kg·K)] = 4,186 kJ/(kg·K)
    temp_wody = 60.0               # [°C] — temperatura wody w CWU
    delta_T = temp_wody - temp_zew # [K]

    # Moc ciepła na potrzeby CWU
    moc_cwu = (masa_wody * cieplo_wl * delta_T) / 86400  # [W]
    # Moc zamówiona MPEC
    moc_zam_mpec = moc_cwu / skutecznosc

    # ========================================
    # WYNIKI
    # ========================================
    print("="*60)
    print("✅ OBLICZENIA MOCY ZAMÓWIONEJ MPEC NA POTRZEBY CWU")
    print("="*60)
    print(f"Liczba mieszkań: {liczba_mieszkan}")
    print(f"Liczba osób: {liczba_osob}")
    print(f"Temperatura wewnątrz: {temp_wew} °C")
    print(f"Temperatura zewnętrzna: {temp_zew} °C")
    print(f"Temperatura wody CWU: {temp_wody} °C")
    print(f"Różnica temperatur (ΔT): {delta_T} K")
    print(f"Straty ciepła na CWU: {moc_cwu:.2f} W")
    print(f"Skuteczność systemu: {skutecznosc * 100:.1f}%")
    print(f"✅ Moc zamówiona MPEC: {moc_zam_mpec:.2f} W")
    print("="*60)

    # ========================================
    # WYKRES (dla różnych temperatur zewnętrznych)
    # ========================================
    temperatury_zew = np.linspace(-15, 5, 100)
    moc_cwu_array = (masa_wody * cieplo_wl * (temp_wody - temperatury_zew)) / 86400
    moc_zam_mpec_array = moc_cwu_array / skutecznosc

    plt.figure(figsize=(10, 6))
    plt.plot(temperatury_zew, moc_cwu_array, label="Straty ciepła CWU [W]", color='blue')
    plt.plot(temperatury_zew, moc_zam_mpec_array, label="Moc zamówiona MPEC [W]", color='red', linestyle='--')
    plt.xlabel("Temperatura zewnętrzna [°C]")
    plt.ylabel("Moc [W]")
    plt.title("Zależność mocy zamówionej MPEC od temperatury zewnętrznej")
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.show()

    # ========================================
    # WYNIKI W POSTACI TABELI
    # ========================================
    wyniki = {
        "Temperatura zewnętrzna [°C]": [temp_zew],
        "Straty ciepła CWU [W]": [moc_cwu],
        "Moc zamówiona MPEC [W]": [moc_zam_mpec]
    }
    df = pd.DataFrame(wyniki)
    print("\n📊 WYNIKI W POSTACI TABELI:")
    print(df.to_string(index=False))

    # ========================================
    # ZAPIS DO PLIKU CSV
    # ========================================
    df.to_csv("moc_zamowiona_mpec_cwu.csv", index=False, encoding='utf-8')
    print("\n💾 Dane zapisano do pliku: 'moc_zamowiona_mpec_cwu.csv'")

if __name__ == "__main__":
    oblicz_moc_cwu()
