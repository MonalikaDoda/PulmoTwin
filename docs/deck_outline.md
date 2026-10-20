# PulmoTwin: Pitch Deck Outline
### Happiest Health Digital Twin Challenge 2026

**Project:** PulmoTwin — 48-Hour Outpatient Respiratory Digital Twin  
**Author:** Monalika Doda (Solo Developer)  
**Affiliation:** SRM University Delhi-NCR  
**Team Name:** `<MY TEAM NAME>`  
**Repository:** [https://github.com/MonalikaDoda/PulmoTwin](https://github.com/MonalikaDoda/PulmoTwin)  
**License:** MIT License (Copyright (c) 2026 Monalika Doda)  

---

### Slide 1: Executive Title & Vision
- **Header:** PulmoTwin: 48-Hour Outpatient Respiratory Digital Twin
- **Subtitle:** Predictive Early Warning for COPD and Asthma Flare-Ups in Delhi NCR
- **Core Message:** Shifting chronic pulmonary care from reactive emergency salvage to proactive outpatient intervention.

### Slide 2: Clinical Problem & Healthcare Context
- **Clinical Reality:** Chronic respiratory diseases are a major driver of avoidable hospitalization in India (Reference: Lancet Global Health / ICMR State-Level Disease Burden Initiative, 2018).
- **Compound Environmental Exposure:** Delhi NCR experiences severe seasonal air quality episodes (CPCB NAQI > 300), extreme diurnal thermal swings, and mineral dust.
- **The Critical Window:** Airway inflammation develops 48–72 hours prior to acute decompensation (SpO2 drift, mild compensatory tachycardia, sleep disturbance, and mobility decline).
- **The Gap:** Conventional care is reactive—treating patients only after severe respiratory distress forces an emergency room visit.

### Slide 3: The Multi-Modal Digital Twin Solution
- **Core Principle:** In silico patient model continuously tracking individual physiological baselines.
- **Three Data Streams:**
  1. *Individualized Wearable Telemetry:* SpO2, resting HR, respiratory rate, sleep hours, daily steps (synthetic 365-day time-series).
  2. *Patient Phenotypes:* Uses GOLD/GINA stage categories; proportions are our assumptions (synthetic EHR cohort).
  3. *Hyper-Local Environmental Intelligence:* Real modelled CAMS air quality (converted to Indian CPCB NAQI) and ERA5 weather from Open-Meteo (CC BY 4.0).

### Slide 4: Data Engineering & Grounded Provenance
- **Synthetic Cohort (N=500 patients):** Uses GOLD/GINA stage categories; proportions are our assumptions.
- **Synthetic Telemetry (182,500 patient-days):** 365 daily records with simulated pre-flare drift and noise. Zero real patient health information (PHI).
- **Real Modelled Atmospheric Data:** Hourly Open-Meteo CAMS data and daily ERA5 weather reanalysis.
- **Illustrative Pollen Curve:** Mathematical seasonal curve placed near seasons in Delhi pollen calendars; not fitted to measured aerobiological data.

### Slide 5: Multi-Modal AI Engine & Real Benchmarks
- **Model:** Calibrated XGBoost with patient-level GroupShuffleSplit (400 train / 100 test patients; 0 data leakage).
- **Ablation Study (from model/comprehensive_metrics.json):**
  - M1 (Vitals Only, 17 features): ROC-AUC 0.9982 | PR-AUC 0.9042 | Recall 94.09% | Precision 75.11% | F1 0.8353
  - M2 (Vitals + EHR, 27 features): ROC-AUC 0.9981 | PR-AUC 0.9020 | Recall 93.82% | Precision 76.03% | F1 0.8400
  - M3 (Vitals + EHR + CAMS AQI, 35 features): ROC-AUC 0.9982 | PR-AUC 0.9068 | Recall 93.82% | Precision 75.62% | F1 0.8374
  - M4 (Full Multi-Modal, 46 features): ROC-AUC 0.9982 | PR-AUC 0.9078 | Recall 93.41% | Precision 75.63% | F1 0.8358
- **Honest Ablation Finding:** On this synthetic dataset, continuous vitals (M1) already yield PR-AUC 0.9042. Adding environmental features (M4) provides virtually negligible gain (+0.0036 PR-AUC, +0.0005 F1), showing that vital sign drift accounts for nearly all predictive signal in the generator.

### Slide 6: Event-Level Advance Detection vs. Day-Level Recall
- **Lead-Time Analysis (from model/lead_time_analysis.json):**
  - **48h/36h/24h Event Rule:** An event is counted as detected if an alert fired on either Day $d-2$ or Day $d-1$. Every test flare was detected (372/372 = 100.0%).
  - **12h Event Rule:** Checked strictly on Day $d-1$ specifically (355/372 = 95.4%).
  - **Day-Level Test Recall (93.41%):** Evaluated across all 744 individual impending flare days in the test set (695 true positives, 49 false negatives).
  - **Clinical Workload (0.77 alert days/patient/month):** Counts **individual alert days** (919 total alert days / 1200 patient-months in test set), *not* grouped episodes. Grouped episodes average ~0.25–0.30 per patient per month.
- **Wearable Sensor Random Dropout Test:**
  - 0% Missing: ROC-AUC 0.9982 | Recall 93.41% | Precision 75.63% | F1 0.8358
  - 10% Missing: ROC-AUC 0.9963 | Recall 78.76% | Precision 75.32% | F1 0.7700
  - 20% Missing: ROC-AUC 0.9925 | Recall 61.02% | Precision 78.68% | F1 0.6874
  - 30% Missing: ROC-AUC 0.9861 | Recall 37.90% | Precision 78.55% | F1 0.5113

### Slide 7: Explainability & What-If Sensitivity Simulator
- **SHAP TreeExplainer:** Converts log-odds to probability percentage points. Reconciled: Cohort Reference Baseline (3.6%) + Bars = Displayed Risk%.
- **9 Clinical Factors:** SpO2 vs baseline, resting HR, respiratory rate, sleep, steps, CAMS NAQI, dust, weather, adherence.
- **Counterfactual What-If Simulator:** Interactive sliders (indoor AQI reduction 0 to -150, adherence boost +0 to +50%, thermal swing dampening 0 to -8°C).
- **Scientific Clarity:** Shows model sensitivity on synthetic data; does not claim a proven clinical intervention effect.

### Slide 8: Editorial-Clinical Dashboard UI
- **Light/Glass Surface:** Calm off-white theme, deep teal accent, serif headings, light/glass cards.
- **3D Animated Lung Twin:** Three.js model breathing at patient's respiratory rate, dynamically tinted by risk tier.
- **5 Vital Tiles:** SpO2, HR, RR, Sleep, Steps with 7-day sparklines and baseline deviation indicators.
- **365-Day Live Simulation Engine:** Play/Pause/Speed controls, date scrubber, and "Jump to Next Alert".
- **Light/Glass Longitudinal Telemetry:** Deep teal SpO2, crimson HR, amber CAMS NAQI, and steps bars.
- **Delhi GIS Map:** 5 ambient stations with patient pinned and local micro-climate readings.
- **Error Boundary:** Fault-tolerant architecture preventing blank screen crashes.

### Slide 9: Honest Scientific & Clinical Limitations
1. **Synthetic Cohort:** All patient records are synthetic; uses GOLD/GINA stage categories (proportions are our assumptions). Flare labels were assigned by our own drift simulation rules. High metrics reflect rule recovery on synthetic data rather than clinical efficacy.
2. **Synthetic Flare Frequency:** The cohort averages **~3.64 flare-up events per patient per year** (1,821 events across 500 patients over 365 days; 372 flares across 100 test patients). In real-world outpatient populations, annual flare rates are typically lower.
3. **Uncapped Dust Hazard:** In `calculate_daily_flare_hazard`, dust excess was not capped prior to multiplier calculation. While composite daily hazard was capped at 0.12 (12%/day), extreme dust peaks produced large multiplier spikes.
4. **No Real Patient Evidence:** No prospective or retrospective evidence demonstrating safety or efficacy on real patients.
5. **Modelled Weather & AQI:** Data is from Open-Meteo CAMS and ERA5 reanalysis models, not physical hardware monitoring stations.
6. **Illustrative Pollen Curve:** Mathematical seasonal model; not measured pollen trap counts.
7. **Decision Support Only:** Designed for risk review; not an autonomous diagnostic or treatment tool.

### Slide 10: Deliverables, Assets & Public Access
- **Author:** Monalika Doda, SRM University Delhi-NCR, `<MY TEAM NAME>`, solo.
- **Repository:** [https://github.com/MonalikaDoda/PulmoTwin](https://github.com/MonalikaDoda/PulmoTwin)
- **PDF Deliverables:**
  - `docs/PulmoTwin_Architecture_Diagram.pdf`
  - `docs/PulmoTwin_Presentation_Deck.pdf`
- **Assets & Credits:**
  - 3D Lung Model: "Lungs" by prasanth.k on Sketchfab ([https://skfb.ly/oqOP7](https://skfb.ly/oqOP7)) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
  - Atmospheric & Weather Data: [Open-Meteo.com](https://open-meteo.com/) (Copernicus CAMS & ECMWF ERA5) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- **License:** MIT License (Copyright (c) 2026 Monalika Doda).
- **Assistance Disclosure:** Built with AI coding assistance (Antigravity).
- **Quick-Start:** Run backend on port 8000 (`uvicorn api.main:app`), frontend on port 3000 (`npm run dev`). Step 3 is optional.
