# PulmoTwin: Pitch Deck Outline
### Happiest Health Digital Twin Challenge 2026

**Title:** PulmoTwin — 48-Hour Outpatient Respiratory Digital Twin  
**Tagline:** Preventing COPD and Asthma Hospitalizations in High-Pollution Megacities  

---

### Slide 1: Executive Title & Vision
- **Header:** PulmoTwin: The Predictive Digital Twin for Respiratory Health
- **Subtitle:** Closing the 48-hour gap before emergency admission in Delhi NCR
- **Core Message:** Shifting chronic pulmonary care from reactive emergency salvage to proactive outpatient intervention.

### Slide 2: The Clinical Crisis in Delhi NCR
- **Stat 1:** Over 55 million COPD and Asthma patients in India.
- **Stat 2:** Emergency department exacerbation visits surge 300% during Delhi's winter smog and post-monsoon crop-burning season.
- **The Core Problem:** By the time a patient feels unbearable dyspnea, airway edema and alveolar gas exchange failure have already occurred. The golden window for oral steroids and inhaler adjustment was 48 hours earlier.

### Slide 3: The Solution — Multi-Modal Digital Twin
- **Concept:** Continuous digital mirror of the patient's respiratory physiology.
- **Three Core Pillars:**
  1. *Individualized Wearable Telemetry:* SpO2, resting HR, respiratory rate, nocturnal sleep, daily steps.
  2. *Static Clinical Phenotype:* GOLD/GINA staging, past flare-ups, smoking pack-years, baseline inhaler compliance.
  3. *Hyper-Local Environmental Intelligence:* Copernicus CAMS AQI, atmospheric dust, cold shock, and diurnal temperature swings across Delhi NCR.

### Slide 4: The 48-Hour Prodrome: What the Twin Sees
- **SpO2:** Gradual prodromal drop of 2.0%–3.5% below individual baseline.
- **Heart Rate:** Resting tachycardia rise of +8 to +12 bpm.
- **Tachypnea:** Respiratory rate elevation of +3 to +6 breaths/min.
- **Functional Mobility:** Daily step counts drop 35%–50% due to exertional fatigue.
- **Environmental Catalyst:** Rising 72h CAMS NAQI and sudden diurnal thermal swings trigger the acute cascade.

### Slide 5: Multi-Modal AI Engine & Validation
- **Model:** Calibrated XGBoost with patient-level stratified grouping (zero leakage across 500 patients / 182,500 patient-days).
- **Ablation Study:** 
  - Vitals Only: 96.3% Recall, 64.7% Precision
  - Full Multi-Modal (with CAMS AQI + Weather/Dust/Pollen): **97.5% Recall, 67.2% Precision, 0.9995 ROC-AUC**.
- **Clinical Workload (Alert Fatigue):** Only **0.20 alerts per patient per month** (~2.35 alerts/patient/year), making it feasible for hospital nurse navigators.
- **Sensor Dropout Resilience:** Graceful degradation even with 20% wearable data dropout.

### Slide 6: Explainable AI & What-If Simulation
- **SHAP TreeExplainer:** Deconstructs every alert into the top 3 physiological and environmental drivers.
- **Counterfactual Simulator:** Clinicians and patients can slide AQI and inhaler adherence to see immediate risk reduction (e.g. -64% risk drop with HEPA air filtration and strict inhaler compliance).

### Slide 7: Hospital-Grade Clinical Dashboard
- Clean, clinical teal/gray UI with radial 0-100 risk gauge, 7d/30d/365d vitals timeline, interactive Delhi NCR map with station monitoring, doctor action orders, and alert history.
- Built-in disclaimer: Clinical decision-support prototype.

### Slide 8: Health Economics & Clinical Impact
- **Cost Reduction:** Averting 1 COPD ICU admission saves ₹1,50,000–₹3,00,000 ($1,800–$3,600) per patient.
- **Bed Capacity:** Frees emergency pulmonary beds during peak winter smog seasons.
- **Patient Quality of Life:** Preserves lung function by preventing recurrent inflammatory injury.

### Slide 9: Road to Clinical Translation & Ethics
- Synthetic cohort validation -> Prospective observational pilot at AIIMS/VPCI.
- Real-world integration with ABHA (Ayushman Bharat Health Account) and FHIR standards.
- Team, Open-Source Commitment (MIT License), and Call to Action.
