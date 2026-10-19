# PulmoTwin System Architecture & Technical Specification

## 1. End-to-End Architectural Overview

PulmoTwin is architected around an asynchronous multi-modal data pipeline connecting environmental intelligence, clinical EHR registries, continuous wearable data streams, an XGBoost predictive engine, a FastAPI microservice, and a decoupled React dashboard.

```mermaid
graph TD
    subgraph Data Sources & Ingestion
        A[Open-Meteo CAMS Air Quality API<br/>Hourly PM2.5, PM10, Dust] -->|Breakpoint Conversion| NAQI[CPCB NAQI Standard]
        B[Open-Meteo ERA5 Historical Weather<br/>Daily Temp, Diurnal Swing, Humidity, Precip] --> ENV[Environmental Repository<br/>delhi_environmental_365d.csv]
        NAQI --> ENV
        C[Simulated Delhi Seasonal Pollen Model<br/>AIIMS Bimodal Curve] --> ENV
        D[Synthetic Patient EHR Generator<br/>GOLD & GINA Guidelines] --> PAT[Static EHR Cohort<br/>patients_static.csv]
        PAT --> TEL[365-Day Longitudinal Telemetry<br/>wearables_timeseries_365d.csv]
        ENV --> TEL
    end

    subgraph Feature Engineering & Machine Learning
        TEL --> FEAT[Feature Engineering Engine<br/>Deviations, 3D Rolling Trends, Lag Shifts]
        FEAT --> SPLIT[Patient-Level GroupShuffleSplit<br/>400 Train / 100 Test]
        SPLIT --> TRAIN[XGBoost Classifier Training<br/>Scale-Pos-Weight Calibrated]
        TRAIN --> MD[Saved Model: pulmotwin_xgboost.joblib]
        TRAIN --> SHAP_EXP[SHAP TreeExplainer<br/>shap_explainer.joblib]
        TRAIN --> BENCH[Validation Suite<br/>Ablation, Lead-Time, Dropout Tests]
    end

    subgraph Backend Microservice
        MD --> FAST[FastAPI Service<br/>api/main.py]
        SHAP_EXP --> FAST
        BENCH --> FAST
        FAST --> ENDP[Endpoints: /patients, /risk, /shap, /what-if, /actions, /environment]
    end

    subgraph Hospital Dashboard
        FAST -->|JSON REST over HTTP| REACT[React 18 Dashboard<br/>dashboard/src]
        REACT --> VIZ1[0-100 Radial Risk Gauge]
        REACT --> VIZ2[Continuous Timeline Canvas]
        REACT --> VIZ3[Delhi NCR Environmental Map]
        REACT --> VIZ4[Why This Alert SHAP Panel]
        REACT --> VIZ5[What-If Counterfactual Sliders]
        REACT --> VIZ6[Doctor Order Panel & History]
    end
```

## 2. API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, dataset sizes, model status, and data provenance disclosures. |
| `GET` | `/api/patients` | Cohort list ranked descending by 48-hour flare-up risk score with search & filter parameters. |
| `GET` | `/api/patients/{id}` | Patient EHR profile, individual physiological baselines, prescribed regimen, and comorbidity log. |
| `GET` | `/api/patients/{id}/history` | Multi-sensor wearable telemetry and environmental overlay for 7, 30, or 365 days. |
| `GET` | `/api/patients/{id}/risk` | Real-time 48-hour exacerbation risk probability, risk tier, and alert threshold evaluation. |
| `GET` | `/api/patients/{id}/shap` | Top 3–5 local SHAP feature attributions with directional arrows and clinical descriptions. |
| `POST` | `/api/patients/{id}/what-if` | Counterfactual simulation calculating risk reduction when adjusting AQI, adherence, or thermal conditions. |
| `GET` | `/api/environment/delhi` | Environmental status across 5 Delhi monitoring locations with current CAMS NAQI, PM2.5, Dust, and Weather. |
| `GET` | `/api/analytics/model-performance` | Comprehensive benchmarking: 4-stage ablation results, lead-time horizon sensitivity, and sensor dropout curves. |
| `POST` | `/api/patients/{id}/actions` | Logs doctor orders (e.g., oral steroid burst, urgent telehealth review, inhaler step-up). |
| `GET` | `/api/patients/{id}/alerts` | 365-day historical alert log with trigger diagnostics and validation outcomes. |
