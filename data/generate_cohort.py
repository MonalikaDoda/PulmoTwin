"""
Synthetic Patient Cohort & 365-Day Dynamic Longitudinal Telemetry Generator for PulmoTwin.

CLINICAL & CAUSAL RULES:
- 500 Patients (COPD GOLD 1-4 & Asthma GINA 1-5).
- 365 Days of longitudinal wearables (SpO2, Resting HR, RR, Sleep, Steps) per patient = 182,500 patient-days.
- Causal Environmental Triggering: High CAMS AQI, atmospheric dust, cold temperatures (<16C),
  and large diurnal temperature swings causally multiply acute exacerbation risk.
- Simulated Delhi Seasonal Pollen Index (clearly labeled).
- 48-Hour Pre-Flare Prodromal Drift (SpO2 -2 to -3.5%, HR +8 to +12 bpm, RR +3 to +6 rpm, sleep down, steps down).
- Realistic sensor noise and sub-clinical transient mimics (preventing threshold memorization).
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)

FIRST_NAMES_M = [
    "Rajesh", "Amit", "Suresh", "Vikram", "Sunil", "Ramesh", "Deepak", "Anil", "Manoj",
    "Pankaj", "Sanjay", "Vijay", "Pradeep", "Ashok", "Kishore", "Arun", "Gopal", "Dinesh",
    "Mohan", "Harish", "Mukesh", "Rakesh", "Sanjeev", "Santosh", "Virender"
]
FIRST_NAMES_F = [
    "Sunita", "Priya", "Anita", "Geeta", "Shashi", "Rekha", "Meena", "Kavita", "Pooja",
    "Seema", "Kamla", "Neelam", "Suman", "Asha", "Usha", "Manju", "Saroj", "Pushpa",
    "Kusum", "Anjali", "Ritu", "Savita", "Vidya", "Bimla", "Mamta"
]
LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Malhotra", "Kapoor", "Bhatia", "Mehta", "Singh", "Chawla",
    "Aggarwal", "Joshi", "Bansal", "Saxena", "Choudhary", "Khanna", "Mittal", "Nair",
    "Patel", "Reddy", "Mishra", "Trivedi", "Sethi", "Dua", "Bhasin", "Kohli"
]

DELHI_ZONES = ["Anand Vihar", "RK Puram", "Punjabi Bagh", "Mandir Marg", "Bawana"]

ZONE_COORDS = {
    "Anand Vihar": (28.6469, 77.3160),
    "RK Puram": (28.5630, 77.1860),
    "Punjabi Bagh": (28.6720, 77.1260),
    "Mandir Marg": (28.6289, 77.2065),
    "Bawana": (28.7950, 77.0500)
}

COMORBIDITY_POOL = [
    ("Hypertension", 0.45),
    ("Type 2 Diabetes", 0.28),
    ("Coronary Artery Disease", 0.18),
    ("GERD", 0.24),
    ("Anxiety / Depression", 0.16),
    ("Obstructive Sleep Apnea", 0.14)
]

def generate_static_patients(n_patients: int = 500) -> pd.DataFrame:
    """Generates static demographic and clinical EHR profiles for 500 synthetic patients."""
    patients = []
    
    for i in range(1, n_patients + 1):
        pid = f"PT-{i:03d}"
        is_copd = np.random.rand() < 0.60
        condition = "COPD" if is_copd else "Asthma"
        sex = "Male" if np.random.rand() < 0.54 else "Female"
        first_name = np.random.choice(FIRST_NAMES_M if sex == "Male" else FIRST_NAMES_F)
        last_name = np.random.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        
        if is_copd:
            age = int(np.clip(np.random.normal(65, 8), 45, 84))
            smoke_roll = np.random.rand()
            if smoke_roll < 0.15:
                smoking_status = "Never (Biomass/Chulha)"
                pack_years = 0.0
            elif smoke_roll < 0.65:
                smoking_status = "Former Smoker"
                pack_years = round(float(np.clip(np.random.normal(28, 10), 10, 65)), 1)
            else:
                smoking_status = "Current Smoker"
                pack_years = round(float(np.clip(np.random.normal(35, 12), 15, 75)), 1)
                
            stage_roll = np.random.rand()
            if stage_roll < 0.20:
                stage = "GOLD 1 (Mild)"
                stage_num = 1
                fev1_pred = round(float(np.random.uniform(80, 92)), 1)
                meds = ["SABA (Salbutamol prn)", "LAMA (Tiotropium)"]
            elif stage_roll < 0.60:
                stage = "GOLD 2 (Moderate)"
                stage_num = 2
                fev1_pred = round(float(np.random.uniform(50, 79)), 1)
                meds = ["SABA prn", "LABA/LAMA (Formoterol + Glycopyrronium)"]
            elif stage_roll < 0.90:
                stage = "GOLD 3 (Severe)"
                stage_num = 3
                fev1_pred = round(float(np.random.uniform(30, 49)), 1)
                meds = ["SABA prn", "Triple Therapy (ICS + LABA + LAMA)"]
            else:
                stage = "GOLD 4 (Very Severe)"
                stage_num = 4
                fev1_pred = round(float(np.random.uniform(18, 29)), 1)
                meds = ["SABA prn", "Triple Therapy (High-dose ICS/LABA/LAMA)", "Home Oxygen Therapy"]
                
        else: # Asthma
            age = int(np.clip(np.random.normal(44, 13), 20, 74))
            smoke_roll = np.random.rand()
            if smoke_roll < 0.72:
                smoking_status = "Never Smoker"
                pack_years = 0.0
            elif smoke_roll < 0.88:
                smoking_status = "Former Smoker"
                pack_years = round(float(np.clip(np.random.normal(12, 6), 3, 25)), 1)
            else:
                smoking_status = "Current Smoker"
                pack_years = round(float(np.clip(np.random.normal(16, 7), 5, 30)), 1)
                
            stage_roll = np.random.rand()
            if stage_roll < 0.25:
                stage = "GINA Step 1-2 (Mild)"
                stage_num = 1
                fev1_pred = round(float(np.random.uniform(82, 98)), 1)
                meds = ["Low-dose ICS-Formoterol prn"]
            elif stage_roll < 0.70:
                stage = "GINA Step 3 (Moderate)"
                stage_num = 2
                fev1_pred = round(float(np.random.uniform(62, 81)), 1)
                meds = ["Maintenance Low-dose ICS-LABA", "SABA prn"]
            else:
                stage = "GINA Step 4-5 (Severe)"
                stage_num = 3
                fev1_pred = round(float(np.random.uniform(42, 61)), 1)
                meds = ["High-dose ICS-LABA", "LAMA Add-on", "SABA prn"]
                
        lambda_flare = 0.4 + 0.65 * stage_num + (0.5 if smoking_status == "Current Smoker" else 0.0)
        past_flare_ups = int(np.random.poisson(lambda_flare))
        baseline_adherence = round(float(np.clip(np.random.beta(6, 2.5), 0.35, 0.98)), 2)
        
        patient_comorbs = []
        for comorb, prob in COMORBIDITY_POOL:
            if np.random.rand() < prob * (1.15 if age > 60 else 0.9):
                patient_comorbs.append(comorb)
                
        zone = np.random.choice(DELHI_ZONES)
        lat_base, lon_base = ZONE_COORDS[zone]
        lat = round(lat_base + np.random.uniform(-0.02, 0.02), 4)
        lon = round(lon_base + np.random.uniform(-0.02, 0.02), 4)
        
        base_spo2 = round(float(np.clip(97.5 - 1.4 * stage_num + np.random.normal(0, 0.6), 90.5, 98.5)), 1)
        base_hr = round(float(np.clip(70.0 + 2.5 * stage_num + np.random.normal(0, 3.0), 62.0, 88.0)), 1)
        base_rr = round(float(np.clip(15.0 + 1.2 * stage_num + np.random.normal(0, 1.0), 12.0, 22.0)), 1)
        base_sleep = round(float(np.clip(7.4 - 0.35 * stage_num + np.random.normal(0, 0.4), 5.5, 8.5)), 1)
        base_steps = int(np.clip(7500 - 1100 * stage_num + np.random.normal(0, 600), 2200, 10500))
        
        patients.append({
            "patient_id": pid,
            "name": full_name,
            "condition": condition,
            "age": age,
            "sex": sex,
            "smoking_status": smoking_status,
            "pack_years": pack_years,
            "severity_stage": stage,
            "severity_stage_num": stage_num,
            "fev1_percent_predicted": fev1_pred,
            "past_flare_ups_year": past_flare_ups,
            "medications": ", ".join(meds),
            "baseline_adherence": baseline_adherence,
            "comorbidities": ", ".join(patient_comorbs) if patient_comorbs else "None",
            "comorbidity_count": len(patient_comorbs),
            "delhi_zone": zone,
            "latitude": lat,
            "longitude": lon,
            "baseline_spo2": base_spo2,
            "baseline_heart_rate": base_hr,
            "baseline_resp_rate": base_rr,
            "baseline_sleep_hours": base_sleep,
            "baseline_steps": base_steps
        })
        
    return pd.DataFrame(patients)

# ==============================================================================
# SECTION 2: CAUSAL ENVIRONMENTAL RISK FORMULATION (USER REQUIREMENT 2)
# ==============================================================================
def calculate_daily_flare_hazard(
    patient: dict,
    env_row: dict,
    rolling_adherence_7d: float,
    days_since_prior_flare: int
) -> float:
    """
    Explicit causal hazard function linking ambient environment (AQI, Dust, Cold, 
    Diurnal Temperature Swings, Simulated Pollen) directly to flare-up probability.
    
    Clinical Evidence Rationale:
    1. CAMS AQI / PM2.5 > 100: Alveolar inflammation & oxidative burst (60% risk increase per 100 AQI).
    2. Dust > 50 ug/m3: Mucosal irritation & bronchospasm (35% risk increase per 100 ug/m3).
    3. Cold < 16C: Vagal stimulation & reflex bronchoconstriction (8% increase per degree below 16C).
    4. Diurnal Temperature Swing > 11C: Thermal shock triggering mast cell degranulation.
    5. Simulated Pollen > 30: Allergic airway hyperreactivity, primarily affecting asthma.
    6. Medication Adherence: 65% protective risk reduction when taking maintenance inhalers.
    """
    # Refractory period: Minimum 14 days between acute flare-up onsets
    if days_since_prior_flare < 14:
        return 0.0
        
    # Baseline Clinical Susceptibility
    stage_num = patient["severity_stage_num"]
    base_hazard = 0.0012 + 0.0009 * stage_num + 0.0006 * min(patient["past_flare_ups_year"], 4)
    if patient["smoking_status"] == "Current Smoker":
        base_hazard += 0.0008
        
    # (a) Air Quality Multiplier (Copernicus CAMS NAQI)
    aqi_cpcb = env_row.get("aqi_cpcb_mean", 120.0)
    aqi_excess = max(0.0, aqi_cpcb - 100.0)
    aqi_multiplier = 1.0 + 0.60 * (aqi_excess / 100.0)
    
    # (b) Atmospheric Dust Multiplier
    dust = env_row.get("dust_mean", 30.0)
    dust_excess = max(0.0, dust - 50.0)
    dust_multiplier = 1.0 + 0.35 * (dust_excess / 100.0)
    
    # (c) Cold Temperature Multiplier (<16C)
    temp_mean = env_row.get("temperature_2m_mean", 25.0)
    cold_stress = max(0.0, 16.0 - temp_mean)
    cold_multiplier = 1.0 + 0.08 * cold_stress
    
    # (d) Diurnal Temperature Swing Multiplier (>11C swing)
    temp_swing = env_row.get("temp_swing_diurnal", 10.0)
    swing_stress = max(0.0, temp_swing - 11.0)
    swing_multiplier = 1.0 + 0.05 * swing_stress
    
    # (e) Simulated Pollen Multiplier (Condition-weighted)
    pollen = env_row.get("simulated_pollen_index", 15.0)
    pollen_excess = max(0.0, pollen - 30.0)
    condition_weight = 1.0 if patient["condition"] == "Asthma" else 0.40
    pollen_multiplier = 1.0 + (0.012 * pollen_excess * condition_weight)
    
    # (f) Medication Adherence Protective Factor
    # High adherence grants up to 65% risk reduction
    adherence_protection = 1.0 - (0.65 * rolling_adherence_7d)
    
    # Combined Multiplicative Risk
    environmental_load = (
        aqi_multiplier * 
        dust_multiplier * 
        cold_multiplier * 
        swing_multiplier * 
        pollen_multiplier
    )
    
    daily_hazard = base_hazard * environmental_load * adherence_protection
    return float(np.clip(daily_hazard, 0.0001, 0.12))


def generate_365d_longitudinal_timeseries(
    df_patients: pd.DataFrame,
    df_env_365d: pd.DataFrame
) -> pd.DataFrame:
    """
    Generates 365 days of continuous wearable telemetry per patient (182,500 total rows).
    Applies the causal environmental flare hazard model, pre-flare drift, and sensor noise.
    """
    all_rows = []
    
    # Sort dates chronologically
    dates = sorted(df_env_365d["date"].unique())
    n_days = len(dates)
    print(f"[Telemetry 365D] Generating 365 days of multi-modal telemetry for {len(df_patients)} patients...")
    print(f"                 Total records to generate: {len(df_patients) * n_days} patient-days.")
    
    # Group environmental data by (station, date) and (zone, date) for robust lookup
    df_env_copy = df_env_365d.copy()
    df_env_copy["date_str"] = pd.to_datetime(df_env_copy["date"]).dt.strftime("%Y-%m-%d")
    env_indexed = {}
    for _, r in df_env_copy.iterrows():
        d_str = str(r["date_str"])
        env_indexed[(str(r["station"]), d_str)] = r.to_dict()
        env_indexed[(str(r["zone"]), d_str)] = r.to_dict()
    
    for p_idx, patient in df_patients.iterrows():
        pid = patient["patient_id"]
        zone = str(patient["delhi_zone"])
        base_adh = patient["baseline_adherence"]
        
        base_spo2 = patient["baseline_spo2"]
        base_hr = patient["baseline_heart_rate"]
        base_rr = patient["baseline_resp_rate"]
        base_sleep = patient["baseline_sleep_hours"]
        base_steps = patient["baseline_steps"]
        
        # Tracking state
        days_since_flare = 999
        active_flare_days_remaining = 0
        adherence_history = []
        
        # Pre-schedule flare events causally based on environmental stress
        flare_onset_days = set()
        
        # Pass 1: Causal Hazard Evaluation for the Year
        temp_adh_hist = [1 if np.random.rand() < base_adh else 0 for _ in range(7)]
        for d_idx, d in enumerate(dates):
            d_str = pd.to_datetime(d).strftime("%Y-%m-%d")
            env_row = env_indexed.get((zone, d_str), {})
            roll_adh = np.mean(temp_adh_hist[-7:])
            
            hazard = calculate_daily_flare_hazard(patient, env_row, roll_adh, days_since_flare)
            
            # Stochastic trigger
            if np.random.rand() < hazard and d_idx >= 3 and d_idx < (n_days - 3):
                flare_onset_days.add(d_idx + 1)
                days_since_flare = 0
            else:
                days_since_flare += 1
                
            # Random daily adherence
            day_adh = 1 if np.random.rand() < base_adh else 0
            temp_adh_hist.append(day_adh)
            
        # Non-flare physiological transient mimics (25% chance of 1-2 false alarm dips per year)
        mimic_days = set()
        if np.random.rand() < 0.25:
            n_mimics = np.random.choice([1, 2, 3])
            for _ in range(n_mimics):
                cand = np.random.randint(10, n_days - 10)
                if cand not in flare_onset_days and (cand - 1) not in flare_onset_days and (cand + 1) not in flare_onset_days:
                    mimic_days.add(cand)
                    
        # Pass 2: Generate Continuous Multi-Sensor Telemetry
        ar_spo2 = 0.0
        ar_hr = 0.0
        ar_rr = 0.0
        ar_sleep = 0.0
        ar_steps = 0.0
        
        for d_idx, d in enumerate(dates):
            day_num = d_idx + 1
            d_str = pd.to_datetime(d).strftime("%Y-%m-%d")
            env_row = env_indexed.get((zone, d_str), {})
            
            # Daily adherence
            day_adh = 1 if np.random.rand() < base_adh else 0
            adherence_history.append(day_adh)
            
            # Autoregressive continuous sensor noise (AR-1)
            ar_spo2 = 0.45 * ar_spo2 + np.random.normal(0, 0.65)
            ar_hr = 0.45 * ar_hr + np.random.normal(0, 3.8)
            ar_rr = 0.45 * ar_rr + np.random.normal(0, 1.2)
            ar_sleep = 0.35 * ar_sleep + np.random.normal(0, 0.6)
            ar_steps = 0.45 * ar_steps + np.random.normal(0, 650)
            
            # Ambient environmental physiological impact
            aqi_val = env_row.get("aqi_cpcb_mean", 120.0)
            temp_mean = env_row.get("temperature_2m_mean", 25.0)
            aqi_effect_spo2 = -0.0035 * max(0.0, aqi_val - 100.0)
            aqi_effect_hr = 0.018 * max(0.0, aqi_val - 100.0)
            cold_effect_hr = 0.15 * max(0.0, 16.0 - temp_mean)
            
            # Check proximity to scheduled flare-ups
            is_flare_in_next_48h = 0
            is_active_flare_today = 1 if day_num in flare_onset_days else 0
            
            drift_spo2 = 0.0
            drift_hr = 0.0
            drift_rr = 0.0
            drift_sleep = 0.0
            drift_steps = 0.0
            
            # Scan upcoming flare dates
            for f_day in flare_onset_days:
                days_to_flare = f_day - day_num
                if days_to_flare == 3: # 72h ahead: prodrome start
                    drift_spo2 = -0.8 + np.random.normal(0, 0.25)
                    drift_hr = +3.5 + np.random.normal(0, 1.2)
                    drift_rr = +1.4 + np.random.normal(0, 0.5)
                    drift_sleep = -0.6
                    drift_steps = -700
                elif days_to_flare == 2: # 48h ahead: target window active
                    is_flare_in_next_48h = 1
                    drift_spo2 = -1.7 + np.random.normal(0, 0.35)
                    drift_hr = +7.0 + np.random.normal(0, 1.8)
                    drift_rr = +3.0 + np.random.normal(0, 0.6)
                    drift_sleep = -1.4
                    drift_steps = -1800
                elif days_to_flare == 1: # 24h ahead: target window active
                    is_flare_in_next_48h = 1
                    drift_spo2 = -2.6 + np.random.normal(0, 0.45)
                    drift_hr = +10.0 + np.random.normal(0, 2.2)
                    drift_rr = +4.5 + np.random.normal(0, 0.8)
                    drift_sleep = -2.1
                    drift_steps = -2700
                elif days_to_flare == 0: # Flare Day
                    drift_spo2 = -3.6 + np.random.normal(0, 0.55)
                    drift_hr = +13.5 + np.random.normal(0, 2.5)
                    drift_rr = +6.2 + np.random.normal(0, 1.0)
                    drift_sleep = -2.7
                    drift_steps = -3400
                elif days_to_flare in [-1, -2]: # Post-flare recovery
                    drift_spo2 = -1.9
                    drift_hr = +7.5
                    drift_rr = +3.0
                    drift_sleep = -1.1
                    drift_steps = -1900
                    
            # Subclinical non-flare mimic transient
            if day_num in mimic_days:
                drift_spo2 = -1.4 + np.random.normal(0, 0.3)
                drift_hr = +5.5 + np.random.normal(0, 1.8)
                drift_rr = +2.0 + np.random.normal(0, 0.5)
                drift_sleep = -1.2
                drift_steps = -1300
                
            # Synthesize real vitals
            spo2_val = round(float(np.clip(base_spo2 + ar_spo2 + aqi_effect_spo2 + drift_spo2, 82.0, 99.5)), 1)
            hr_val = round(float(np.clip(base_hr + ar_hr + aqi_effect_hr + cold_effect_hr + drift_hr, 50.0, 138.0)), 1)
            rr_val = round(float(np.clip(base_rr + ar_rr + drift_rr, 10.0, 38.0)), 1)
            sleep_val = round(float(np.clip(base_sleep + ar_sleep + drift_sleep, 2.0, 10.5)), 1)
            steps_val = int(np.clip(base_steps + ar_steps + drift_steps, 250, 16500))
            
            all_rows.append({
                "patient_id": pid,
                "date": pd.to_datetime(d).strftime("%Y-%m-%d"),
                "day_number": day_num,
                "delhi_zone": zone,
                "spo2": spo2_val,
                "resting_heart_rate": hr_val,
                "respiratory_rate": rr_val,
                "sleep_hours": sleep_val,
                "steps": steps_val,
                "medication_adherence": day_adh,
                "aqi_cpcb_mean": env_row.get("aqi_cpcb_mean", 120.0),
                "aqi_cpcb_max": env_row.get("aqi_cpcb_max", 150.0),
                "pm2_5_mean": env_row.get("pm2_5_mean", 60.0),
                "pm10_mean": env_row.get("pm10_mean", 110.0),
                "dust_mean": env_row.get("dust_mean", 30.0),
                "temperature_2m_mean": env_row.get("temperature_2m_mean", 25.0),
                "temp_swing_diurnal": env_row.get("temp_swing_diurnal", 10.0),
                "relative_humidity_2m_mean": env_row.get("relative_humidity_2m_mean", 55.0),
                "precipitation_sum": env_row.get("precipitation_sum", 0.0),
                "wind_speed_10m_max": env_row.get("wind_speed_10m_max", 10.0),
                "simulated_pollen_index": env_row.get("simulated_pollen_index", 15.0),
                "flare_up_onset": is_active_flare_today,
                "flare_up_next_48h": is_flare_in_next_48h
            })
            
    df_result = pd.DataFrame(all_rows)
    return df_result

def run_365d_pipeline():
    os.makedirs("data", exist_ok=True)
    
    # 1. Load or generate Environmental 365D data
    env_csv = "data/delhi_environmental_365d.csv"
    if not os.path.exists(env_csv):
        from fetch_delhi_aqi import generate_delhi_365d_dataset
        df_env = generate_delhi_365d_dataset("data")
    else:
        df_env = pd.read_csv(env_csv)
        df_env["date"] = pd.to_datetime(df_env["date"])
        
    # 2. Generate Static Patient Cohort (500 patients)
    print("[Pipeline 365D] Generating 500 static patients...")
    df_static = generate_static_patients(500)
    df_static.to_csv("data/patients_static.csv", index=False)
    print(f"[Pipeline 365D] Saved static EHR dataset: data/patients_static.csv ({len(df_static)} patients)")
    
    # 3. Generate 365-day longitudinal time-series (182,500 rows)
    df_ts_365 = generate_365d_longitudinal_timeseries(df_static, df_env)
    ts_csv = "data/wearables_timeseries_365d.csv"
    df_ts_365.to_csv(ts_csv, index=False)
    print(f"[Pipeline 365D] Saved dynamic 365D telemetry: {ts_csv} ({len(df_ts_365)} rows)")
    
    # Stats
    n_flares = df_ts_365["flare_up_onset"].sum()
    n_pos_windows = df_ts_365["flare_up_next_48h"].sum()
    print(f"[Pipeline 365D] Acute flare-up onsets over 365 days: {n_flares} events across 500 patients")
    print(f"[Pipeline 365D] 48h Warning Window Labels: {n_pos_windows}/{len(df_ts_365)} ({n_pos_windows/len(df_ts_365)*100:.2f}%)")

if __name__ == "__main__":
    run_365d_pipeline()
