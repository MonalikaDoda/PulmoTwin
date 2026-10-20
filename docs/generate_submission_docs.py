"""
Script to generate submission deliverables for PulmoTwin:
1. docs/PulmoTwin_Architecture_Diagram.pdf (Vector multi-layer system architecture)
2. docs/PulmoTwin_Presentation_Deck.pdf (10-slide executive pitch deck for Unstop submission)
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as patches
import numpy as np

def create_architecture_diagram():
    pdf_path = "docs/PulmoTwin_Architecture_Diagram.pdf"
    with PdfPages(pdf_path) as pdf:
        fig = plt.figure(figsize=(14, 9), dpi=300)
        ax = fig.add_subplot(111)
        ax.axis('off')
        fig.patch.set_facecolor('#ffffff')

        # Colors
        c_teal = '#0f766e'
        c_teal_light = '#f0fdfa'
        c_navy = '#0f172a'
        c_slate = '#475569'
        c_amber = '#d97706'
        c_coral = '#e11d48'
        c_bg = '#f8fafc'
        c_border = '#cbd5e1'

        # Title Block
        ax.text(0.5, 0.96, "PulmoTwin: 48-Hour Respiratory Digital Twin", fontsize=20, fontweight='bold', color=c_navy, ha='center', va='top')
        ax.text(0.5, 0.925, "System Architecture & End-to-End Multi-Modal Data Flow Pipeline", fontsize=12, color=c_slate, ha='center', va='top')

        # Layers definitions (y_bottom, height, label, color)
        layers = [
            (0.68, 0.20, "1. INGESTION & COHORT SYNTHESIS LAYER", "#f0fdf4", "#166534"),
            (0.44, 0.21, "2. TIME-SERIES FEATURE ENGINEERING & ENVIRONMENTAL FUSION", "#eff6ff", "#1e40af"),
            (0.20, 0.21, "3. PREDICTIVE AI ENGINE & SHAP ATTRIBUTION", "#fefce8", "#854d0e"),
            (0.02, 0.15, "4. CLINICAL DECISION SUPPORT & DASHBOARD INTERFACE", "#fdf2f8", "#9d174d")
        ]

        for y_b, h, label, bg_col, text_col in layers:
            rect = patches.FancyBboxPatch((0.03, y_b), 0.94, h, boxstyle="round,pad=0.015,rounding_size=0.015",
                                          edgecolor=c_border, facecolor=bg_col, linewidth=1.2)
            ax.add_patch(rect)
            ax.text(0.05, y_b + h - 0.025, label, fontsize=11, fontweight='bold', color=text_col, va='top')

        # Layer 1 Boxes
        l1_boxes = [
            (0.06, 0.70, 0.26, 0.13, "Static EHR Modality (N=500)\n• Synthea COPD/Asthma cohort\n• Age (42-84y), Sex, Staging\n• Smoking status & pack-years\n• Maintenance inhaler adherence"),
            (0.37, 0.70, 0.26, 0.13, "Continuous Wearable Vitals\n• 365 Days per patient (182.5k records)\n• SpO2, HR, RR, Sleep, Steps\n• Individual physiological baselines\n• 2-3 Day pre-flare biomarker drift"),
            (0.68, 0.70, 0.26, 0.13, "Atmospheric & Weather (Delhi)\n• Open-Meteo CAMS Air Quality\n• CPCB NAQI conversion (PM2.5, PM10)\n• ECMWF ERA5: Dust, Temp, Humidity\n• Delhi Seasonal Pollen Formula (AIIMS)")
        ]
        for x, y, w, h, text in l1_boxes:
            b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.01", edgecolor='#86efac', facecolor='#ffffff', linewidth=1)
            ax.add_patch(b)
            ax.text(x + 0.01, y + h - 0.015, text, fontsize=8.5, color=c_navy, va='top', linespacing=1.35)

        # Layer 2 Boxes
        l2_boxes = [
            (0.06, 0.46, 0.26, 0.14, "Biometric Rolling Signals\n• Deviation from personal baseline\n• 3-day rolling trend (SpO2, HR, RR)\n• Exertional drop ratio (Steps/base)\n• Nocturnal sleep debt accumulation"),
            (0.37, 0.46, 0.26, 0.14, "Atmospheric Exposure Align.\n• Delhi CPCB NAQI mean & 3d max\n• Pre-monsoon dust storm peaks\n• Diurnal temperature swings (ΔT)\n• Rain washout attenuated pollen"),
            (0.68, 0.46, 0.26, 0.14, "Patient-Level Splitting & Scaling\n• 80/20 Cohort Split (0 patient leakage)\n• 400 Train / 100 Test patients\n• Missing sensor dropout augmentation\n• Robust 62.98 MB tabular matrix")
        ]
        for x, y, w, h, text in l2_boxes:
            b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.01", edgecolor='#93c5fd', facecolor='#ffffff', linewidth=1)
            ax.add_patch(b)
            ax.text(x + 0.01, y + h - 0.015, text, fontsize=8.5, color=c_navy, va='top', linespacing=1.35)

        # Layer 3 Boxes
        l3_boxes = [
            (0.06, 0.22, 0.26, 0.14, "Calibrated XGBoost Classifier\n• 48h Advance Flare-Up Forecast\n• ROC-AUC: 0.9877 | PR-AUC: 0.9080\n• 93.4% Recall @ Optimal Threshold\n• 4-Stage Multi-Modal Ablation"),
            (0.37, 0.22, 0.26, 0.14, "TreeExplainer Attribution\n• Local SHAP factor attribution\n• Sigmoid-shared percentage points\n• Baseline (3.6%) + Bars = Risk%\n• 9 Clinical actionable factors"),
            (0.68, 0.22, 0.26, 0.14, "Counterfactual Simulation Engine\n• Real-time What-If calculations\n• HEPA filtration (AQI delta: -150)\n• Inhaler compliance booster (+50%)\n• Thermal swing mitigation (-8°C)")
        ]
        for x, y, w, h, text in l3_boxes:
            b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.01", edgecolor='#fde047', facecolor='#ffffff', linewidth=1)
            ax.add_patch(b)
            ax.text(x + 0.01, y + h - 0.015, text, fontsize=8.5, color=c_navy, va='top', linespacing=1.35)

        # Layer 4 Boxes
        l4_boxes = [
            (0.06, 0.035, 0.26, 0.10, "FastAPI High-Perf Backend\n• Asynchronous REST API (Port 8000)\n• Dynamic 365d Timeline Replay\n• Patient list sorted by 48h risk\n• Full OpenAPI / Swagger documentation"),
            (0.37, 0.035, 0.26, 0.10, "3D Twin & Clinical React Dashboard\n• Three.js breathing lung twin\n• Dynamic tinting & AQI particles\n• Dark 'Patient Monitor' telemetry\n• 5 Vital tiles with 7-day sparklines"),
            (0.68, 0.035, 0.26, 0.10, "Hospital EHR & Dispatch Workflow\n• Grouped multi-day clinical episodes\n• Delhi GIS station map with patient pin\n• 1-Click nurse action orders\n• Workload control: 0.77 alerts/pt/mo")
        ]
        for x, y, w, h, text in l4_boxes:
            b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.01", edgecolor='#f472b6', facecolor='#ffffff', linewidth=1)
            ax.add_patch(b)
            ax.text(x + 0.01, y + h - 0.015, text, fontsize=8.5, color=c_navy, va='top', linespacing=1.35)

        # Arrows between layers
        for arrow_x in [0.19, 0.50, 0.81]:
            ax.annotate("", xy=(arrow_x, 0.68), xytext=(arrow_x, 0.65), arrowprops=dict(arrowstyle="->", color=c_teal, lw=2))
            ax.annotate("", xy=(arrow_x, 0.44), xytext=(arrow_x, 0.41), arrowprops=dict(arrowstyle="->", color=c_teal, lw=2))
            ax.annotate("", xy=(arrow_x, 0.20), xytext=(arrow_x, 0.17), arrowprops=dict(arrowstyle="->", color=c_teal, lw=2))

        plt.subplots_adjust(left=0.02, right=0.98, top=0.98, bottom=0.02)
        pdf.savefig(fig)
        plt.close()

def create_presentation_deck():
    pdf_path = "docs/PulmoTwin_Presentation_Deck.pdf"
    with PdfPages(pdf_path) as pdf:
        slides = [
            ("Slide 1: Title Slide", "PulmoTwin: Outpatient Respiratory Digital Twin",
             "A 48-Hour Predictive Early Warning System for COPD & Asthma Exacerbations\n\n"
             "• Team: PulmoTwin Engineering Group\n"
             "• Competition: Happiest Health Digital Twin Challenge 2026\n"
             "• Modality: Static EHR + Continuous Wearables + Open-Meteo CAMS Air Quality\n"
             "• Open Source: MIT License | Decision-Support Research Prototype"),

            ("Slide 2: Clinical Problem Statement", "The High-Cost Crisis of Respiratory Exacerbations",
             "• Clinical Reality: COPD and severe asthma affect >500 million people globally, causing >3.2 million annual deaths.\n"
             "• The Critical Window: Acute flare-ups are treated reactively in emergency departments when airways have already failed.\n"
             "• Physiological Drift: Airway inflammation begins 48–72 hours prior to severe symptoms (micro-drops in SpO2, tachycardia, mobility declines).\n"
             "• Environmental Catalysts: Delhi NCR's severe winter smog (AQI > 400) and spring tree pollen trigger acute hospitalization cascades.\n"
             "• The Gap: No current clinical tool fuses personal physiological baselines with real-time atmospheric exposure for advance warning."),

            ("Slide 3: Proposed Healthcare Digital Twin", "PulmoTwin: Patient-Specific Predictive Outpatient Twin",
             "• Dynamic In Silico Twin: Maintains longitudinal personal baseline for SpO2, heart rate, respiration, sleep, and daily steps.\n"
             "• Multi-Modal Fusion: Automatically aligns continuous wearable telemetry with local CAMS atmospheric air quality and ERA5 weather.\n"
             "• 48-Hour Advance Warning: Predicts impending acute exacerbations before severe respiratory decompensation occurs.\n"
             "• Counterfactual Simulation ('What-If'): Allows clinicians to quantify the precise risk reduction of air filtration and medication compliance.\n"
             "• Workload Feasible: Designed for hospital nurse navigators with controlled alert burden (0.77 alerts/patient/month)."),

            ("Slide 4: Data Engineering & Provenance", "365-Day Cohort & Multi-Modal Dataset Architecture",
             "• Synthetic Static Cohort (N=500): Clinically grounded COPD & asthma cohort (age 42–84, sex, smoking pack-years, staging, adherence).\n"
             "• Longitudinal Vitals (182,500 patient-days): 365 daily records per patient with physiological drift modeled on published literature.\n"
             "• Real Delhi Air Quality: Hourly CAMS data from 5 Delhi stations (Mandir Marg, Anand Vihar, Punjabi Bagh, RK Puram, IGI Airport).\n"
             "• Weather & Dust (ERA5): Daily mean temperature, diurnal swing (ΔT), wind speed, precipitation, and atmospheric dust.\n"
             "• Delhi Seasonal Pollen Model: Bimodal aerobiological curve calibrated to AIIMS & VPCI literature (tree & grass pollen peaks).\n"
             "• Strict Compliance: Synthetic, anonymized, and open data only. No real patient health information (PHI) utilized."),

            ("Slide 5: Machine Learning & Ablation Study", "XGBoost Classifier Benchmarking Across 4 Modalities",
             "• Train/Test Strategy: Strict patient-level 80/20 split (400 train / 100 test patients; 0 data leakage).\n"
             "• Evaluation Metrics (Stage 4 Multi-Modal):\n"
             "  - ROC-AUC: 0.9877 | PR-AUC: 0.9080\n"
             "  - Test Sensitivity (Recall): 93.4% @ optimal decision threshold\n"
             "  - Test Precision (PPV): 67.8% | F1-Score: 0.7857\n"
             "• 4-Stage Ablation Progression:\n"
             "  - M1 (Wearable Vitals Only): ROC-AUC 0.9412 | PR-AUC 0.7854\n"
             "  - M2 (+ Static EHR Staging & Smoking): ROC-AUC 0.9634 | PR-AUC 0.8320\n"
             "  - M3 (+ CAMS AQI & PM2.5 Exposure): ROC-AUC 0.9782 | PR-AUC 0.8745\n"
             "  - M4 (+ Full Multi-Modal Weather, Dust, Pollen): ROC-AUC 0.9877 | PR-AUC 0.9080 (+12.3% PR-AUC gain)"),

            ("Slide 6: Lead-Time Warning & Workload", "Clinical Operational Feasibility Analysis",
             "• Warning Horizon Sensitivity:\n"
             "  - 48 Hours Ahead: 93.4% Sensitivity (Recall)\n"
             "  - 36 Hours Ahead: 94.2% Sensitivity\n"
             "  - 24 Hours Ahead: 95.8% Sensitivity\n"
             "• Clinical Workload & Workload Feasibility:\n"
             "  - Average Alerts per Patient per Month: 0.77 alerts\n"
             "  - Consecutive Alert Days Grouped: Multi-day alerts combined into single clinical episodes (e.g. '8–9 Jan, 2-day episode').\n"
             "• Sensor Dropout Robustness Test:\n"
             "  - At 10% wearable data dropout: PR-AUC remains 0.892 (98.2% retention).\n"
             "  - At 30% wearable data dropout: PR-AUC remains 0.854 (94.1% retention)."),

            ("Slide 7: Explainable AI & SHAP Decomposition", "Clinically Transparent TreeExplainer Attribution",
             "• TreeExplainer Log-Odds to Sigmoid Probability Attribution:\n"
             "  - Shared percentage points mathematically reconcile: Baseline (3.6%) + Net Bars = Displayed Risk%.\n"
             "• 9 Actionable Clinical Factors:\n"
             "  1. SpO2 vs personal baseline (primary physiological trigger)\n"
             "  2. Resting heart rate elevation (sub-clinical tachycardia)\n"
             "  3. Respiratory rate acceleration (tachypnea)\n"
             "  4. Sleep duration & nocturnal fragmentation\n"
             "  5. Daily mobility reduction (step count collapse)\n"
             "  6. CAMS NAQI exposure (ambient Delhi smog)\n"
             "  7. Atmospheric dust concentration\n"
             "  8. Weather & seasonal pollen index\n"
             "  9. Inhaler adherence history"),

            ("Slide 8: Interactive React Clinical Dashboard", "Hospital-Grade Monitoring Interface",
             "• Editorial-Clinical Aesthetic: Calm warm surface, deep teal accent, large hero risk numeral, zero visual clutter.\n"
             "• 3D Respiratory Digital Twin: Interactive Three.js lung model breathing at patient's respiratory rate, tinted teal->amber->coral.\n"
             "• 365-Day Live Simulation Engine: Play/Pause/Speed controls, date scrubber, and 'Jump to Next Alert' button.\n"
             "• Dark 'Patient Monitor' Telemetry: Deep navy card, glowing teal SpO2, soft coral HR, amber CAMS NAQI, and steps bars.\n"
             "• 5 Vital Tiles: SpO2, HR, RR, Sleep, Steps with 7-day sparklines and baseline deviation indicators.\n"
             "• Interactive Delhi GIS Map: 5 ambient stations with patient pinned and local micro-climate readings.\n"
             "• 1-Click Nurse Actions: Dispatch oral steroids, arrange telemedicine triage, or deliver air purifier units."),

            ("Slide 9: Counterfactual Digital Twin ('What-If')", "Simulating Outpatient Preventive Interventions",
             "• Interventions Simulated in Real-Time:\n"
             "  - Indoor HEPA Air Filtration (AQI reduction: 0 to -150 points)\n"
             "  - Pharmacotherapy Adherence Support (+0% to +50% compliance)\n"
             "  - Indoor Thermal Swing Stabilization (0 to -8°C swing dampening)\n"
             "• Clinical Impact on High-Risk Days:\n"
             "  - On high-risk patients (e.g. PT-265 at 63.6% baseline risk), HEPA air cleaning + inhaler support drops risk by 42.2–56.0 points down to 7.6% Low Risk (88.1% relative risk reduction)!\n"
             "  - On stable days (~0.1% baseline floor), verifies that protective regimens maintain ongoing stability."),

            ("Slide 10: Summary & Submission Verification", "Project Deliverables & Public Access Guarantee",
             "• Repository Stack: Python 3.10+ (FastAPI, XGBoost, SHAP, Pandas, Scikit-Learn) + React 18 (Vite, Lucide, Three.js).\n"
             "• Full Documentation: /docs/architecture.md, /docs/deck_outline.md, and comprehensive README.md.\n"
             "• Vector PDF Deliverables in /docs:\n"
             "  - docs/PulmoTwin_Architecture_Diagram.pdf (Vector multi-layer pipeline)\n"
             "  - docs/PulmoTwin_Presentation_Deck.pdf (10-slide executive pitch deck)\n"
             "• Video Walkthrough: [Unlisted YouTube Video Demo Link](YOUR_YOUTUBE_LINK_HERE)\n"
             "• Open Source: MIT License | Clean working tree under GitHub 100MB limit (dataset: 62.98 MB).\n"
             "• Disclaimer: Decision-support research prototype. Not a diagnostic medical device.")
        ]

        for title, subtitle, content in slides:
            fig = plt.figure(figsize=(13.33, 7.5), dpi=300)
            ax = fig.add_subplot(111)
            ax.axis('off')
            fig.patch.set_facecolor('#ffffff')

            # Header Banner
            rect_h = patches.Rectangle((0, 0.88), 1, 0.12, facecolor='#0f766e', edgecolor='none')
            ax.add_patch(rect_h)

            ax.text(0.04, 0.95, subtitle, fontsize=17, fontweight='bold', color='#ffffff', va='center')
            ax.text(0.04, 0.905, title, fontsize=10.5, color='#ccfbf1', va='center')

            # Content Box
            rect_c = patches.FancyBboxPatch((0.04, 0.08), 0.92, 0.76, boxstyle="round,pad=0.02,rounding_size=0.015",
                                            facecolor='#f8fafc', edgecolor='#e2e8f0', linewidth=1.2)
            ax.add_patch(rect_c)

            ax.text(0.07, 0.79, content, fontsize=11, color='#0f172a', va='top', linespacing=1.6)

            # Footer
            ax.text(0.04, 0.035, "PulmoTwin • Happiest Health Digital Twin Challenge 2026 • Research Prototype", fontsize=9, color='#64748b')
            ax.text(0.96, 0.035, "MIT License", fontsize=9, color='#64748b', ha='right')

            plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
            pdf.savefig(fig)
            plt.close()

if __name__ == "__main__":
    print("Generating PulmoTwin_Architecture_Diagram.pdf...")
    create_architecture_diagram()
    print("Generating PulmoTwin_Presentation_Deck.pdf...")
    create_presentation_deck()
    print("PDF generation complete!")
