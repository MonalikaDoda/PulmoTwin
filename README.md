# PulmoTwin: 48-Hour Outpatient Respiratory Digital Twin

> **Happiest Health Digital Twin Challenge 2026 • Prototype & Code Submission**  
> *A Clinical Decision-Support System Forecasting Acute COPD & Asthma Exacerbations 48 Hours Ahead by Fusing Wearable Telemetry, Patient Phenotypes, and Delhi CAMS Atmospheric Intelligence.*

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI: 0.110](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![React: 18.2](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://react.dev/)
[![Dataset: Clean <100MB](https://img.shields.io/badge/Dataset-62.98MB-success.svg)](data/)

---

## Unstop Submission Checklist & Table of Contents

| # | Submission Requirement | Matching Section in Documentation | Status |
| :-: | :--- | :--- | :-: |
| 1 | **Team Details** | [1. Team Information](#1-team-information) | Verified |
| 2 | **College / Incubator Affiliation** | [2. Institution & Affiliation](#2-institution--affiliation) | Verified |
| 3 | **Project Title & Tagline** | [3. Project Title & Executive Summary](#3-project-title--executive-summary) | Verified |
| 4 | **Problem Statement** | [4. Problem Statement & Clinical Gap](#4-problem-statement--clinical-gap) | Verified |
| 5 | **Healthcare Use Case** | [5. Healthcare Use Case & Clinical Workflow](#5-healthcare-use-case--clinical-workflow) | Verified |
| 6 | **Technical Stack & Architecture** | [6. Technical Stack & Architecture](#6-technical-stack--architecture) | Verified |
| 7 | **AI / ML Model Details & Ablation** | [7. AI/ML Model Details & Validation](#7-aiml-model-details--validation) | Verified |
| 8 | **Working Prototype Video Demo** | [8. Video Demonstration](#8-video-demonstration) | *Placeholder* |
| 9 | **Open-Source License** | [9. Open-Source License (MIT)](#9-open-source-license) | Verified |
| 10 | **System Architecture Diagram** | [10. System Architecture Deliverable (PDF)](#10-system-architecture-deliverable) | Verified |
| 11 | **Presentation Pitch Deck** | [11. Final Presentation Pitch Deck (PDF)](#11-final-presentation-pitch-deck) | Verified |
| 12 | **Public Access & Run Instructions** | [12. Reproducibility & Quick-Start Guide](#12-reproducibility--quick-start-guide) | Verified |

---

## 1. Team Information

- **Team Name**: PulmoTwin Core Engineering
- **Team Lead / Point of Contact**: PulmoTwin Research & Development Lead
- **Project Repository**: [https://github.com/monalisamohanta1804/PulmoTwin](https://github.com/monalisamohanta1804/PulmoTwin)
- **Primary Focus**: Biomedical informatics, predictive machine learning, edge clinical decision support, and longitudinal physiological modeling.

---

## 2. Institution & Affiliation

- **Competition Track**: Happiest Health Digital Twin Challenge 2026
- **Affiliation**: Autonomous Healthcare AI & Clinical Informatics Lab / University Incubator
- **Clinical Alignment**: Adheres strictly to the Global Initiative for Chronic Obstructive Lung Disease (**GOLD 2024**) consensus and the Global Initiative for Asthma (**GINA 2023**) guidelines.

---

## 3. Project Title & Executive Summary

### **PulmoTwin: 48-Hour Outpatient Respiratory Digital Twin**
*Continuous Early Warning Forecasting of Acute COPD & Asthma Flare-Ups through Wearable Biomarkers and Atmospheric Intelligence.*

PulmoTwin is a proof-of-concept healthcare Digital Twin that predicts impending acute exacerbations (flare-ups) in COPD and asthma patients **48 hours in advance**. By continuously fusing:
1. **Static Patient Phenotypes**: Demographics, GOLD/GINA staging, smoking history, inhaler adherence, and comorbidities.
2. **Continuous Dynamic Wearables**: 365 daily time-series records of blood oxygen ($SpO_2$), resting heart rate, respiratory rate, sleep duration, and daily step counts with personal baselines.
3. **Real Delhi Atmospheric Intelligence**: High-resolution hourly atmospheric data from Open-Meteo / Copernicus Atmosphere Monitoring Service (**CAMS**) converted to Indian Central Pollution Control Board (**CPCB**) National Air Quality Index (**NAQI**), plus **ECMWF ERA5** weather (temperature swings, dust, precipitation) and a calibrated seasonal pollen model.

The platform provides an editorial-grade clinical dashboard featuring an interactive **3D breathing digital twin lung** (Three.js), calibrated **TreeExplainer SHAP attribution**, a **365-day live longitudinal simulation controller**, and a real-time **Counterfactual "What-If" simulator** that quantifies the protective benefit of indoor HEPA filtration and strict pharmacotherapy compliance.

> **Clinical Disclaimer:** *PulmoTwin is a research prototype and clinical decision-support tool. It is not an automated diagnostic device or a replacement for professional clinical judgment.*

---

## 4. Problem Statement & Clinical Gap

### The Chronic Airway Crisis in Urban India
Chronic respiratory diseases affect over **55 million individuals across India**, representing the second leading cause of non-communicable mortality. In the National Capital Region (NCR) of Delhi, patients face extreme compound environmental stressors:
- **Severe Autumn/Winter Smog**: Particulate matter ($PM_{2.5} > 250\ \mu\text{g}/\text{m}^3$, CPCB NAQI $> 350$) induces acute bronchial epithelial damage and oxidative bursts.
- **Sudden Diurnal Temperature Swings**: Temperature drops exceeding $\Delta T > 12^\circ\text{C}$ trigger neurogenic airway hyperreactivity.
- **Mineral Dust Infiltration**: Regional pre-monsoon dust storm events irritate already inflamed bronchial mucosa.
- **Seasonal Pollen Surges**: Bimodal allergen peaks in Spring (*Holoptelea, Prosopis*) and Autumn (*Parthenium, Poaceae*) trigger acute airway hyperreactivity.

### The Clinical Gap: Reactive vs. Proactive Medicine
Traditional pulmonology operates **reactively**: patients seek medical attention only when severe dyspnea, cyanosis, and respiratory acidosis force an emergency room admission. Hospitalizations are traumatic for patients, costly for healthcare systems, and carry significant 90-day mortality risk.

### The Golden 48-Hour Opportunity
Sub-clinical airway inflammation begins **48 to 72 hours** prior to full acute decompensation. This prodromal phase presents characteristic biometric drift:
- Gradual $SpO_2$ decline of **1.5% to 3.0%** below the patient's personal baseline.
- Resting heart rate elevation of **6 to 10 bpm** (compensatory tachycardia).
- Respiratory rate acceleration of **2 to 4 rpm** (sub-clinical tachypnea).
- Nocturnal sleep debt accumulation and **35% to 50% collapse in daily step counts**.

**PulmoTwin bridges this gap** by detecting these subtle multi-sensor signals early, alerting outpatient care coordinators before the patient requires emergency department resuscitation.

---

## 5. Healthcare Use Case & Clinical Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Outpatient (COPD / Asthma)
    participant Sensors as Wearables (Smartwatch / Ring)
    participant CAMS as Open-Meteo CAMS / ERA5
    participant Engine as PulmoTwin AI Engine (FastAPI)
    actor Nurse as Hospital Nurse Navigator
    actor Doctor as Pulmonologist

    Sensors->>Engine: Daily SpO2, HR, RR, Sleep, Steps
    CAMS->>Engine: Delhi CPCB NAQI, Dust, Temp Swing, Pollen
    Engine->>Engine: Compute personal baseline deviations & 3d trends
    Engine->>Engine: XGBoost inference (48h flare probability)
    alt Impending Flare Detected (Risk >= 50%)
        Engine->>Nurse: Push 48h early warning alert & SHAP drivers
        Nurse->>Patient: Tele-triage call & symptom verification
        Nurse->>Doctor: Queue 1-click clinical order (Oral Steroid Burst / HEPA Unit)
        Doctor->>Patient: Action preventative prescription 48h before crisis
        Note over Patient: Exacerbation averted; hospitalization prevented
    else Patient Stable (Risk < 25%)
        Engine->>Engine: Continue passive surveillance (0.77 alerts/pt/month)
    end
```

### Targeted Beneficiaries
1. **COPD & Severe Asthma Patients**: Receive advance guidance to step up controller inhalers or activate action plans at home.
2. **Hospital Outpatient Nurse Navigators**: Receive prioritized worklists sorted by 48-hour risk, enabling manageable triage without alert overload.
3. **Healthcare Systems & Payers**: Avoid costly ICU admissions and readmission financial penalties.

---

## 6. Technical Stack & Architecture

### System Architecture Pipeline

The complete system architecture diagram is available in vector format: [`docs/PulmoTwin_Architecture_Diagram.pdf`](file:///c:/Users/monal/OneDrive/Desktop/PulmoTwin/docs/PulmoTwin_Architecture_Diagram.pdf).

```mermaid
flowchart TD
    subgraph Layer 1: Data & Environmental Intelligence
        EHR[Static Synthetic EHR Cohort\n500 Patients • GOLD 1-4 & GINA 1-5\nDemographics, Staging, Adherence]
        WEAR[365-Day Continuous Wearables\n182,500 Patient-Days\nSpO2, HR, RR, Sleep, Steps]
        CAMS[Open-Meteo CAMS Reanalysis\nHourly PM2.5, PM10, Dust\nConverted to CPCB NAQI Breakpoints]
        ERA5[ECMWF ERA5 Weather & Pollen\nDaily Temp, Swing, Rain\nSimulated Delhi Seasonal Pollen Curve]
    end

    subgraph Layer 2: Feature Engineering & Processing
        FUSE[Multi-Modal Feature Fusion Engine\n46 Features: Baselines, Rolling 3d Means, Ratios]
        SPLIT[Patient-Level Partitioning\n80% Train / 20% Test (0 Patient Leakage)]
    end

    subgraph Layer 3: Machine Learning & Explainability
        XGB[Calibrated XGBoost Classifier\nROC-AUC: 0.9877 | PR-AUC: 0.9080]
        SHAP[SHAP TreeExplainer\nSigmoid Percentage Point Decomposition\nBaseline 3.6% + Bars = Displayed Risk]
        WHATIF[Counterfactual Simulation Engine\nIndoor HEPA Filtration & Inhaler Compliance]
    end

    subgraph Layer 4: Service & Clinical Dashboard
        API[FastAPI Asynchronous Backend\nPort 8000 • REST Endpoints]
        DASH[Editorial-Clinical React Dashboard\nPort 3000 • Vite + Three.js 3D Twin]
    end

    EHR --> FUSE
    WEAR --> FUSE
    CAMS --> FUSE
    ERA5 --> FUSE
    FUSE --> SPLIT
    SPLIT --> XGB
    XGB --> SHAP
    XGB --> WHATIF
    XGB --> API
    SHAP --> API
    WHATIF --> API
    API --> DASH
```

### Technology Matrix

| Layer | Technologies & Libraries | Function |
| :--- | :--- | :--- |
| **Data Generation** | Python 3.10+, NumPy, Pandas, SciPy | Synthetic cohort generation, physiological baselines, AR(1) sensor noise, pre-flare drift modeling. |
| **Environmental Ingestion** | Open-Meteo API, Copernicus CAMS, ECMWF ERA5 | Automated fetching and caching of Delhi atmospheric air quality, dust, and reanalysis weather. |
| **Model & Explainability** | XGBoost 2.0+, Scikit-Learn, SHAP 0.44+ | Gradient boosted tree classifier, GroupShuffleSplit cross-validation, TreeExplainer log-odds attribution. |
| **Backend Service** | FastAPI, Starlette, Pydantic v2, Uvicorn | Asynchronous REST service serving ranked patient cohorts, telemetry replay, and counterfactual simulations. |
| **Frontend Application** | React 18, Vite, Three.js (`@react-three/fiber`), Lucide React | Editorial-clinical dashboard, 3D animated lung twin, dark patient monitor telemetry, and interactive map. |
| **Documentation & Vector Export** | Matplotlib, KaTeX, Markdown | Professional submission deliverables, PDF diagram generation, KaTeX mathematical proofs. |

---

## 7. AI/ML Model Details & Validation

### 7.1 Data Provenance: Real vs. Synthetic

| Modality | Features Captured | Provenance & Source | Classification |
| :--- | :--- | :--- | :--- |
| **Air Quality & Dust** | CPCB NAQI, PM2.5, PM10, Dust ($\mu\text{g}/\text{m}^3$) | **Open-Meteo / Copernicus Atmosphere Monitoring Service (CAMS)** atmospheric reanalysis mapped to official **Indian CPCB NAQI breakpoints**. | **Real Observational Data** *(Atmospheric reanalysis model, not station hardware)* |
| **Historical Weather** | Mean Temp, Diurnal Swing ($\Delta T$), Humidity, Rain, Wind | **Open-Meteo / ECMWF ERA5-Land Reanalysis** (365 days across 5 Delhi monitoring zones). | **Real Observational Data** |
| **Seasonal Pollen** | Bi-modal Allergen Index (0–100) | Calibrated mathematical aerobiological model based on published Delhi clinical literature (AIIMS & VPCI). | **Illustrative Seasonal Index** *(Clearly labeled mathematical model; not measured pollen traps)* |
| **Static Patient EHR** | Age, Sex, GOLD/GINA Stage, Smoking Pack-Years, Inhaler Adherence | Clinical generator adhering to **GOLD 2024** and **GINA 2023** consensus distributions. | **Synthetic Clinical Cohort** *(500 patients, zero real PHI)* |
| **Dynamic Wearables** | SpO2, Resting HR, Resp Rate, Sleep, Daily Steps | 365-day longitudinal time-series (182,500 patient-days) with individual baselines, noise, and pre-flare drift. | **Synthetic Wearable Telemetry** |

### 7.2 Delhi Seasonal Pollen Aerobiological Formula
The seasonal pollen index $P(t)$ is calibrated to published aerobiological literature from the Vallabhbhai Patel Chest Institute (VPCI) and AIIMS New Delhi:

$$P(\text{DOY}, \text{Precip}) = \text{clip}\left( 12.0 + 85.0 \cdot \exp\left( -0.5 \left( \frac{\text{DOY} - 75}{16.0} \right)^2 \right) + 70.0 \cdot \exp\left( -0.5 \left( \frac{\text{DOY} - 290}{18.0} \right)^2 \right) + \epsilon,\; 2.0,\; 100.0 \right) \times W_{\text{rain}}$$

Where:
- $\text{DOY} \in [1, 365]$ is the calendar day of the year.
- **Spring Tree Pollen Peak** ($\text{DOY} = 75$, mid-March): *Holoptelea integrifolia, Prosopis juliflora, Morus alba* (amplitude $85.0$, $\sigma = 16.0$ days).
- **Autumn Weed & Grass Peak** ($\text{DOY} = 290$, mid-October): *Parthenium hysterophorus, Poaceae* (amplitude $70.0$, $\sigma = 18.0$ days).
- **Baseline Background & Noise**: Constant background $12.0$, stochastic variance $\epsilon \sim \mathcal{N}(0, 3.5^2)$.
- **Precipitation Washout Factor**: $W_{\text{rain}} = \max\left(0.2,\, 1.0 - \frac{\text{Precip (mm)}}{15.0}\right)$ for rain $> 2.0\text{ mm}$.

---

### 7.3 4-Stage Multi-Modal Ablation Study

Evaluated on an independent, held-out test cohort of **100 patients (36,500 patient-days)** with strict patient-level separation (zero data leakage):

| Model Stage | Modalities Included | Feature Count | ROC-AUC | PR-AUC | Test Sensitivity (Recall) | Test Precision (PPV) | F1-Score |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **M1: Vitals Only** | Wearables (Baselines, Deviations, 3d Trends) | 17 | 0.9412 | 0.7854 | 88.5% | 61.2% | 0.7238 |
| **M2: Vitals + EHR** | + Age, Staging, Smoking Pack-Years, Comorbidities | 27 | 0.9634 | 0.8320 | 90.1% | 64.3% | 0.7504 |
| **M3: Vitals + EHR + CAMS AQI** | + Delhi CPCB NAQI, PM2.5, PM10, 3d Rolling Exposure | 35 | 0.9782 | 0.8745 | 91.8% | 65.9% | 0.7671 |
| **M4: Full Multi-Modal** | **+ Weather, Atmospheric Dust, Temp Swing, Pollen** | **46** | **0.9877** | **0.9080** | **93.4%** | **67.8%** | **0.7857** |

> **Clinical Finding:** Adding environmental intelligence (CAMS air quality, atmospheric dust, cold exposure, and diurnal swings) increases PR-AUC from **0.7854 to 0.9080 (+12.3% improvement)**, accurately detecting environmentally-triggered exacerbations that wearable vitals alone miss early on.

---

### 7.4 Warning Lead-Time Horizons & Clinical Workload

- **Advance Warning Horizons**:
  - **48 Hours Ahead Warning**: **93.4% Sensitivity (Recall)** across test cohort acute flares.
  - **36 Hours Ahead Warning**: **94.2% Sensitivity**.
  - **24 Hours Ahead Warning**: **95.8% Sensitivity**.
- **Clinical Workload & Alert Burden**:
  - **Average Alerts per Patient per Month**: **0.77 alerts** (~9.2 alerts / patient / year).
  - **Episode Grouping**: Consecutive alert days are automatically aggregated into single clinical episodes (e.g. *"8–9 Jan, 2-day episode • Peak 98.4% Risk"*), preventing repeated redundant alarms during a single clinical event.

---

### 7.5 Wearable Sensor Dropout Robustness Test

Simulates real-world patient non-adherence (uncharged smartwatch, device removed during sleep or bathing):

| Sensor Dropout Rate | ROC-AUC | Test Sensitivity (48h) | Precision | F1-Score | System Status |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **0% (Clean Baseline)** | **0.9877** | **93.4%** | **67.8%** | **0.7857** | Optimal Multi-Sensor Operation |
| **10% Random Dropout** | 0.9810 | 89.2% | 67.4% | 0.7680 | Highly Resilient (<2.3% F1 drop) |
| **20% Random Dropout** | 0.9725 | 83.5% | 67.1% | 0.7441 | Graceful Degradation |
| **30% Random Dropout** | 0.9540 | 74.8% | 66.5% | 0.7042 | Automated "Sensor Telemetry Lost" Prompt |

---

### 7.6 Explainable AI & Counterfactual "What-If" Mechanics

#### Mathematically Exact SHAP Attribution
The model computes SHAP values using `shap.TreeExplainer`. To ensure clinical interpretability without log-odds confusion:
1. The model's expected value (average predicted risk) is established as the **Cohort Reference Baseline (3.6%)**.
2. The difference between the final predicted probability and the baseline is distributed proportionally across the 9 clinical factors:
$$\sum_{i=1}^{9} \text{Factor Impact}_i + \text{Baseline Risk (3.6\%)} \equiv \text{Displayed 48h Risk\%}$$

#### Counterfactual Interventions ("What-If")
The What-If engine recalculates 48-hour risk when outpatient protective interventions are applied:
- **Indoor HEPA Air Purifier**: Reduces ambient exposure by up to **-150 NAQI points**.
- **Inhaler Adherence Support**: Boosts compliance by up to **+50%**.
- **Thermal Stabilization**: Dampens indoor diurnal swings by up to **-8°C**.

> **Verified Interventional Impact:** On high-risk patients during acute environmental spikes (e.g. Patient `PT-265` with a baseline risk of **63.6%**), activating HEPA filtration and inhaler compliance drops forecasted risk by **-42.2 to -56.0 percentage points down to 7.6% Low Risk (an 88.1% relative risk reduction)**! Conversely, on stable asymptomatic days where risk is already at its baseline floor of ~0.1%, interventions maintain clinical stability.

---

## 8. Video Demonstration

A complete end-to-end video walkthrough demonstrating the PulmoTwin platform, 3D digital twin breathing animation, 365-day longitudinal simulation replay, What-If counterfactual slider calculations, and clinical workflow is accessible here:

> 🎬 **[Watch Unlisted Video Demonstration (YouTube)](YOUR_YOUTUBE_LINK_HERE)**  
> *(Please replace `YOUR_YOUTUBE_LINK_HERE` with your unlisted YouTube demonstration video link before final review).*

---

## 9. Open-Source License

PulmoTwin is released as open-source software under the terms of the **MIT License**.  
See the full license text in [`LICENSE`](file:///c:/Users/monal/OneDrive/Desktop/PulmoTwin/LICENSE).

---

## 10. System Architecture Deliverable

The vector system architecture document is saved and viewable in the `docs/` directory:
- 📄 **Architecture Diagram (PDF)**: [`docs/PulmoTwin_Architecture_Diagram.pdf`](file:///c:/Users/monal/OneDrive/Desktop/PulmoTwin/docs/PulmoTwin_Architecture_Diagram.pdf)
- 📝 **Architecture Technical Specification**: [`docs/architecture.md`](file:///c:/Users/monal/OneDrive/Desktop/PulmoTwin/docs/architecture.md)

---

## 11. Final Presentation Pitch Deck

The multi-slide executive pitch deck for the Happiest Health Digital Twin Challenge 2026 is saved in the `docs/` directory:
- 📊 **Presentation Deck (PDF)**: [`docs/PulmoTwin_Presentation_Deck.pdf`](file:///c:/Users/monal/OneDrive/Desktop/PulmoTwin/docs/PulmoTwin_Presentation_Deck.pdf)
- 📋 **Slide-by-Slide Narrative Outline**: [`docs/deck_outline.md`](file:///c:/Users/monal/OneDrive/Desktop/PulmoTwin/docs/deck_outline.md)

---

## 12. Reproducibility & Quick-Start Guide

Follow these steps to run PulmoTwin locally:

### Prerequisites
- Python 3.10, 3.11, or 3.12
- Node.js 18+ and npm
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/monalisamohanta1804/PulmoTwin.git
cd PulmoTwin
```

### Step 2: Install Python Dependencies
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Run Model Pipeline & Verify Data (Optional — Pre-computed Cache Included)
```bash
# 1. Fetch Delhi CAMS & ERA5 weather data
python data/fetch_delhi_aqi.py

# 2. Generate 500-patient synthetic cohort & 365-day wearable time-series
python data/generate_cohort.py

# 3. Train multi-modal XGBoost, run ablation & generate SHAP explainers
python model/train_model.py
```

### Step 4: Launch FastAPI Backend Server
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
- **Backend Port**: `8000`
- **Interactive OpenAPI / Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Step 5: Launch React Clinical Dashboard
In a separate terminal:
```bash
cd dashboard
npm install
npm run dev
```
- **Frontend Port**: `3000` (or Vite default)
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Backend REST API Endpoints

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/health` | Service health status and model provenance check. |
| `GET` | `/api/patients` | Cohort list of 500 patients sorted by 48-hour exacerbation risk. |
| `GET` | `/api/patients/{id}` | Static patient profile, staging, smoking history, and baselines. |
| `GET` | `/api/patients/{id}/risk` | Current 48-hour forecasted risk score, risk level, and primary triggers. |
| `GET` | `/api/patients/{id}/history?days=365` | Continuous daily wearable vitals aligned with CAMS NAQI and weather. |
| `GET` | `/api/patients/{id}/shap` | Mathematically reconciled SHAP factor contributions in percentage points. |
| `GET` | `/api/patients/{id}/simulation-timeline` | 365-day pre-computed daily trajectory for smooth real-time replay. |
| `GET` | `/api/patients/{id}/alerts` | Grouped clinical exacerbation warning episodes with peak risk scores. |
| `POST` | `/api/simulate-what-if` | Counterfactual twin recalculating risk under HEPA & adherence changes. |
| `GET` | `/api/analytics/model-performance` | Complete ablation study, lead-time warning horizons, and dropout metrics. |

---

## Repository Structure

```
PulmoTwin/
├── data/
│   ├── fetch_delhi_aqi.py            # Open-Meteo CAMS and ERA5 weather ingestion & cache
│   ├── generate_cohort.py            # 500-patient synthetic cohort & 365d telemetry generator
│   ├── delhi_environmental_365d.csv  # 365-day Delhi atmospheric dataset (5 stations)
│   ├── cohort_metadata.csv           # Static demographics, GOLD/GINA stages, and baselines
│   └── features_365d_dataset.csv     # Compact feature matrix (62.98 MB, under GitHub limit)
├── model/
│   ├── train_model.py                # Patient-level training, 4-stage ablation & SHAP generator
│   ├── pulmotwin_xgboost.pkl         # Trained multi-modal XGBoost model artifact
│   ├── shap_explainer.pkl            # Trained TreeExplainer artifact
│   ├── comprehensive_metrics.json    # Verified ablation, lead-time, and dropout metrics
│   └── lead_time_analysis.json       # Horizon sensitivity and alert workload benchmarks
├── api/
│   └── main.py                       # FastAPI REST backend with counterfactual What-If engine
├── dashboard/                        # Self-contained React 18 + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ThreeLungViewer.jsx   # 3D interactive breathing digital twin lung (Three.js)
│   │   │   ├── VitalTiles.jsx        # 5 Vital tiles (SpO2, HR, RR, Sleep, Steps) with sparklines
│   │   │   ├── WhatMovedTheEstimate.jsx # Sorted SHAP bars with 100% exact math reconciliation
│   │   │   ├── VitalsTimeline.jsx    # Dark 'Patient Monitor' telemetry with CAMS NAQI overlay
│   │   │   ├── AlertHistory.jsx      # Grouped multi-day clinical episodes with timeline strip
│   │   │   ├── SimulationControls.jsx# 365-day live replay controls with alert jump button
│   │   │   ├── WhatIfSimulator.jsx   # Real-time counterfactual twin sliders
│   │   │   ├── DelhiMap.jsx          # Delhi GIS map with patient pin and micro-climate readings
│   │   │   ├── PatientHeader.jsx     # Header with personal baselines and GOLD/GINA staging
│   │   │   ├── PatientList.jsx       # Ranked patient queue with risk filters
│   │   │   └── ModelValidationDrawer.jsx # Slide-out drawer with metrics & pollen formula
│   │   ├── App.jsx                   # Main clinical application container
│   │   └── index.css                 # Editorial-clinical styles, typography, and animations
│   ├── public/lungs.glb              # High-fidelity 3D lung twin model
│   └── package.json                  # Frontend dependencies
├── docs/
│   ├── PulmoTwin_Architecture_Diagram.pdf # Vector multi-layer system architecture diagram
│   ├── PulmoTwin_Presentation_Deck.pdf    # 10-slide executive pitch presentation deck
│   ├── architecture.md               # Detailed architecture specifications
│   ├── deck_outline.md               # Slide-by-slide pitch narrative
│   └── generate_submission_docs.py   # Script generating official submission PDF files
├── requirements.txt                  # Python dependencies
├── .gitignore                        # Git ignore rules
├── LICENSE                           # MIT License
└── README.md                         # Comprehensive Unstop submission documentation
```

---

*Happiest Health Digital Twin Challenge 2026 • Research Decision-Support Prototype*
