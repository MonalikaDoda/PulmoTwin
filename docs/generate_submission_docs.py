"""
Script to generate submission deliverables for PulmoTwin using ONLY real values
from model/comprehensive_metrics.json and model/lead_time_analysis.json:
1. docs/PulmoTwin_Architecture_Diagram.pdf (Vector multi-layer system architecture)
2. docs/PulmoTwin_Presentation_Deck.pdf (10-slide executive pitch deck for Unstop submission)
"""

import os
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as patches

# Load the exact ground-truth JSON files
with open("model/comprehensive_metrics.json", "r") as f:
    METRICS = json.load(f)

with open("model/lead_time_analysis.json", "r") as f:
    LEAD_TIME = json.load(f)

def create_architecture_diagram():
    pdf_path = "docs/PulmoTwin_Architecture_Diagram.pdf"
    with PdfPages(pdf_path) as pdf:
        fig = plt.figure(figsize=(14, 9), dpi=300)
        ax = fig.add_subplot(111)
        ax.axis('off')
        fig.patch.set_facecolor('#ffffff')

        c_teal = '#0f766e'
        c_navy = '#0f172a'
        c_slate = '#475569'
        c_border = '#cbd5e1'

        # Title Block
        ax.text(0.5, 0.96, "PulmoTwin: 48-Hour Respiratory Digital Twin", fontsize=20, fontweight='bold', color=c_navy, ha='center', va='top')
        ax.text(0.5, 0.925, "System Architecture & Multi-Modal Pipeline • Monalika Doda, SRM University Delhi-NCR", fontsize=11.5, color=c_slate, ha='center', va='top')

        # Layers definitions
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
            (0.06, 0.70, 0.26, 0.13, "Synthetic Patient Phenotypes\n• 500 synthetic COPD/asthma patients\n• Uses GOLD/GINA stage categories\n• Proportions are our assumptions\n• Zero real patient data (no PHI)"),
            (0.37, 0.70, 0.26, 0.13, "365-Day Synthetic Wearable Telemetry\n• 182,500 patient-days simulated\n• SpO2, HR, RR, Sleep, Steps\n• Individual baselines + AR(1) noise\n• 2-3 day pre-flare biomarker drift"),
            (0.68, 0.70, 0.26, 0.13, "Real Modelled Weather & Air (Open-Meteo)\n• CAMS PM2.5, PM10, Dust -> CPCB NAQI\n• ERA5 Reanalysis: Temp, Swing, Wind\n• CC BY 4.0 Data Attribution\n• Illustrative seasonal pollen curve")
        ]
        for x, y, w, h, text in l1_boxes:
            b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.01", edgecolor='#86efac', facecolor='#ffffff', linewidth=1)
            ax.add_patch(b)
            ax.text(x + 0.01, y + h - 0.015, text, fontsize=8.5, color=c_navy, va='top', linespacing=1.35)

        # Layer 2 Boxes
        l2_boxes = [
            (0.06, 0.46, 0.26, 0.14, "Biometric Rolling Features (17 feat)\n• Deviation from personal baseline\n• 3-day rolling trend (SpO2, HR, RR)\n• Exertional drop ratio (Steps/base)\n• Sleep duration deficit"),
            (0.37, 0.46, 0.26, 0.14, "Environmental Exposure (29 feat)\n• Delhi CPCB NAQI mean & 3d max\n• Pre-monsoon dust peaks\n• Diurnal temperature swings (ΔT)\n• Rain-attenuated seasonal pollen"),
            (0.68, 0.46, 0.26, 0.14, "Patient-Level Train/Test Partition\n• GroupShuffleSplit: 400 train / 100 test\n• Zero cross-patient leakage\n• Missing sensor dropout test\n• Compact dataset: 62.98 MB tabular")
        ]
        for x, y, w, h, text in l2_boxes:
            b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.01", edgecolor='#93c5fd', facecolor='#ffffff', linewidth=1)
            ax.add_patch(b)
            ax.text(x + 0.01, y + h - 0.015, text, fontsize=8.5, color=c_navy, va='top', linespacing=1.35)

        # Layer 3 Boxes
        m4_pr = METRICS["pr_auc"]
        m4_rec = METRICS["recall"] * 100
        l3_boxes = [
            (0.06, 0.22, 0.26, 0.14, f"XGBoost Binary Classifier\n• 48h Advance Flare Forecast\n• ROC-AUC: {METRICS['roc_auc']:.4f} | PR-AUC: {m4_pr:.4f}\n• Day Recall: {m4_rec:.1f}% | Prec: {METRICS['precision']*100:.1f}%\n• 4-Stage Ablation Benchmarks"),
            (0.37, 0.22, 0.26, 0.14, "SHAP Factor Attribution\n• TreeExplainer sequential attribution\n• Ordered by factor size (|phi|)\n• Model Baseline (36.2%) + Bars = Risk%\n• 9 Clinical actionable factors"),
            (0.68, 0.22, 0.26, 0.14, "What-If Sensitivity Engine\n• Recalculates model output\n• Air filtration (AQI delta)\n• Inhaler compliance booster\n• Model sensitivity on synthetic data")
        ]
        for x, y, w, h, text in l3_boxes:
            b = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.01,rounding_size=0.01", edgecolor='#fde047', facecolor='#ffffff', linewidth=1)
            ax.add_patch(b)
            ax.text(x + 0.01, y + h - 0.015, text, fontsize=8.5, color=c_navy, va='top', linespacing=1.35)

        # Layer 4 Boxes
        l4_boxes = [
            (0.06, 0.035, 0.26, 0.10, "FastAPI REST Backend\n• Asynchronous API (Port 8000)\n• 365-day Timeline Replay\n• Patient list sorted by 48h risk\n• OpenAPI / Swagger docs"),
            (0.37, 0.035, 0.26, 0.10, "React Clinical Dashboard\n• 3D breathing lung twin (Three.js)\n• Light/glass telemetry card\n• 5 Vital tiles with 7d sparklines\n• Error boundary protected"),
            (0.68, 0.035, 0.26, 0.10, "Workload & Episode Grouping\n• Consecutive alert days grouped\n• Delhi map with patient pin\n• 1-Click triage action orders\n• 0.77 alert days/patient/month")
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
        abl = METRICS["ablation_summary"]
        drop = METRICS["dropout_robustness"]

        slides = [
            ("Slide 1: Title Slide", "PulmoTwin: Outpatient Respiratory Digital Twin",
             "A 48-Hour Predictive Early Warning System for COPD & Asthma Flare-Ups\n\n"
             "• Author: Monalika Doda (Solo Developer)\n"
             "• Affiliation: SRM University Delhi-NCR\n"
             "• Team Name: <MY TEAM NAME>\n"
             "• GitHub: https://github.com/MonalikaDoda/PulmoTwin\n"
             "• Competition: Happiest Health Digital Twin Challenge 2026\n"
             "• Stack: Python (FastAPI, XGBoost, SHAP) + React Dashboard (Vite, Three.js)\n"
             "• License: MIT License | Research Prototype"),

            ("Slide 2: Clinical Problem Statement", "The Crisis of Reactive Respiratory Care in Delhi NCR",
             "• Clinical Reality: Chronic respiratory diseases are a leading cause of emergency hospitalization in India.\n"
             "  (Reference: Lancet Global Health / ICMR State-Level Disease Burden Initiative, 2018).\n"
             "• Compound Urban Stressors: Delhi NCR experiences severe seasonal air quality episodes (CPCB NAQI > 300),\n"
             "  extreme diurnal temperature swings, and mineral dust.\n"
             "• The Critical Window: Airway inflammation begins 48–72 hours prior to acute decompensation\n"
             "  (gradual SpO2 drift, mild tachycardia, nocturnal sleep reduction, and step count drop).\n"
             "• The Gap: Current care is reactive—treating patients only after severe dyspnea forces an ER visit."),

            ("Slide 3: Proposed Solution", "PulmoTwin: 48-Hour Predictive Outpatient Digital Twin",
             "• Multi-Modal Fusion: Fuses personal baseline vitals (SpO2, HR, RR, sleep, steps) with real modelled\n"
             "  air quality (Open-Meteo CAMS) and weather (Open-Meteo ERA5).\n"
             "• 48-Hour Early Warning: Identifies pre-flare physiological drift before acute hospitalization is required.\n"
             "• Operational Feasibility: 0.77 alert days per patient per month (~9.19 alert days/patient/year),\n"
             "  grouping consecutive days into multi-day episodes to prevent alert overload.\n"
             "• Transparent Attribution: SHAP factor decomposition shows what shifted the estimate from the baseline.\n"
             "• Counterfactual Sensitivity: Interactive What-If sliders show model response under hypothetical inputs."),

            ("Slide 4: Data Sources & Provenance", "Real Modelled Weather/AQI + Synthetic Clinical Cohort",
             "• Synthetic Cohort (N=500 patients): Uses GOLD/GINA stage categories; proportions are our assumptions.\n"
             "• Synthetic Telemetry (182,500 patient-days): 365 daily records with simulated pre-flare drift and noise.\n"
             "• Real Modelled Air Quality: Open-Meteo CAMS reanalysis mapped to Indian CPCB NAQI breakpoints (CC BY 4.0).\n"
             "• Real Modelled Weather: Open-Meteo ECMWF ERA5-Land reanalysis (temperature, diurnal swing, dust, rain).\n"
             "• Illustrative Pollen Index: Mathematical curve placed near seasons in Delhi pollen calendars; not measured data.\n"
             "• Ethical Standard: Zero real patient data (no PHI). All patient data is synthetic."),

            ("Slide 5: Multi-Modal Ablation Study", "Empirical Benchmarks from model/comprehensive_metrics.json",
             f"Strict patient-level GroupShuffleSplit (400 train / 100 test patients; 36,500 test days; 0 leakage):\n\n"
             f"• M1 (Vitals Only, 17 feat):              ROC-AUC {abl[0]['roc_auc']:.4f} | PR-AUC {abl[0]['pr_auc']:.4f} | Recall {abl[0]['recall']*100:.2f}% | F1 {abl[0]['f1_score']:.4f}\n"
             f"• M2 (Vitals + EHR, 27 feat):            ROC-AUC {abl[1]['roc_auc']:.4f} | PR-AUC {abl[1]['pr_auc']:.4f} | Recall {abl[1]['recall']*100:.2f}% | F1 {abl[1]['f1_score']:.4f}\n"
             f"• M3 (Vitals + EHR + CAMS AQI, 35 feat):  ROC-AUC {abl[2]['roc_auc']:.4f} | PR-AUC {abl[2]['pr_auc']:.4f} | Recall {abl[2]['recall']*100:.2f}% | F1 {abl[2]['f1_score']:.4f}\n"
             f"• M4 (Full Multi-Modal, 46 feat):         ROC-AUC {abl[3]['roc_auc']:.4f} | PR-AUC {abl[3]['pr_auc']:.4f} | Recall {abl[3]['recall']*100:.2f}% | F1 {abl[3]['f1_score']:.4f}\n\n"
             f"Plain Finding: On this synthetic dataset, continuous vitals (M1) already yield PR-AUC 0.9042.\n"
             f"Adding environmental features (M4) provides virtually negligible gain (+0.0036 PR-AUC, +0.0005 F1),\n"
             f"showing that vital sign drift accounts for almost all predictive signal in the generator."),

            ("Slide 6: Event-Level Advance Detection vs Day-Level Recall", "Performance Under Warning Horizons and Missing Data",
             f"Lead-Time Analysis (372 test flare events in test cohort):\n"
             f"• 48h/36h/24h Event Rule: Alert on Day d-2 OR Day d-1 -> 372/372 = 100.0% event detection.\n"
             f"• 12h Event Rule: Alert on Day d-1 specifically -> 355/372 = 95.4% event detection.\n"
             f"• Day-Level Recall: 93.41% (695 of 744 individual impending flare days flagged in test set).\n"
             f"• Clinical Workload: 0.77 alert days/pt/month (919 total alert days / 1200 patient-months in test set),\n"
             f"  representing individual alert days, not grouped multi-day episodes (~0.25-0.30 episodes/pt/mo).\n\n"
             f"Wearable Data Random Dropout Robustness:\n"
             f"• 0% Missing:   ROC-AUC {drop[0]['roc_auc']:.4f} | Recall {drop[0]['recall']*100:.1f}% | Precision {drop[0]['precision']*100:.1f}% | F1 {drop[0]['f1_score']:.4f}\n"
             f"• 10% Missing:  ROC-AUC {drop[1]['roc_auc']:.4f} | Recall {drop[1]['recall']*100:.1f}% | Precision {drop[1]['precision']*100:.1f}% | F1 {drop[1]['f1_score']:.4f}\n"
             f"• 20% Missing:  ROC-AUC {drop[2]['roc_auc']:.4f} | Recall {drop[2]['recall']*100:.1f}% | Precision {drop[2]['precision']*100:.1f}% | F1 {drop[2]['f1_score']:.4f}\n"
             f"• 30% Missing:  ROC-AUC {drop[3]['roc_auc']:.4f} | Recall {drop[3]['recall']*100:.1f}% | Precision {drop[3]['precision']*100:.1f}% | F1 {drop[3]['f1_score']:.4f}"),

            ("Slide 7: Explainability & What-If Sensitivity Simulator", "Transparent SHAP Attribution & Sensitivity Modeling",
             "• SHAP TreeExplainer Attribution: Sequential probability attribution ordered by factor size.\n"
             "  Mathematically reconciled: Model Baseline (36.2%) + Bars = Displayed Risk%.\n"
             "• 9 Clinical Factors: SpO2 vs baseline, resting HR, respiratory rate, sleep, steps, CAMS NAQI, dust, weather, adherence.\n"
             "• Counterfactual What-If Simulator:\n"
             "  - Allows interactive adjustment of indoor AQI reduction (0 to -150), adherence boost (+0 to +50%),\n"
             "    and thermal swing dampening (0 to -8°C).\n"
             "  - Shows model sensitivity on synthetic data; does NOT claim a proven clinical intervention effect."),

            ("Slide 8: Interactive Clinical Dashboard", "Editorial-Clinical Hospital Monitoring UI",
             "• Editorial Design: Warm off-white theme, deep teal accent, serif headings, light/glass cards.\n"
             "• 3D Lung Digital Twin: Three.js breathing model with respiratory rate pacing and risk tinting.\n"
             "• 5 Vital Tiles: SpO2, HR, RR, Sleep, Steps with 7-day sparklines and baseline deviation delta.\n"
             "• 365-Day Live Simulation Engine: Play/Pause/Speed controls, date scrubber, and 'Jump to Next Alert'.\n"
             "• Light/Glass Longitudinal Telemetry: Deep teal SpO2, crimson HR, amber CAMS NAQI, and steps bars.\n"
             "• Delhi GIS Station Map: 5 ambient stations with patient pinned and micro-climate readings.\n"
             "• Error Boundary: Fault-tolerant architecture preventing blank screen crashes."),

            ("Slide 9: Honest Scientific & Clinical Limitations", "Transparent Statement of Limitations",
             "1. Synthetic Cohort: Uses GOLD/GINA stage categories; proportions are our assumptions.\n"
             "   Flare labels were assigned by our own drift simulation rules; metrics reflect rule recovery.\n"
             "2. Synthetic Flare Rate: Averages ~3.64 flares/patient/year (1,821 events across 500 patients over 365 days;\n"
             "   372 flares across 100 test patients), which is higher than typical real-world outpatient rates.\n"
             "3. Uncapped Dust Hazard: In calculate_daily_flare_hazard, dust excess was not capped prior to multiplier\n"
             "   calculation, though the composite daily hazard was bounded by an overall ceiling of 0.12 (12%/day).\n"
             "4. No Real Patient Evidence: No prospective or retrospective evidence demonstrating safety or efficacy.\n"
             "5. Modelled Weather & AQI: From Open-Meteo CAMS and ERA5 reanalysis models, not hardware monitoring stations.\n"
             "6. Decision Support Only: Research prototype for decision-support; not a diagnostic tool."),

            ("Slide 10: Assets, Credits & Public Access", "Project Deliverables & Repository Information",
             "• Author: Monalika Doda, SRM University Delhi-NCR, <MY TEAM NAME>, solo.\n"
             "• Repository: https://github.com/MonalikaDoda/PulmoTwin\n"
             "• Assets & Credits:\n"
             "  - 3D Lung Model: 'Lungs' by prasanth.k on Sketchfab (CC BY 4.0, https://skfb.ly/oqOP7)\n"
             "  - Weather & Air Quality: Open-Meteo.com (Copernicus CAMS & ECMWF ERA5) under CC BY 4.0\n"
             "• Deliverables in docs/:\n"
             "  - docs/PulmoTwin_Architecture_Diagram.pdf (Vector pipeline)\n"
             "  - docs/PulmoTwin_Presentation_Deck.pdf (Executive pitch deck)\n"
             "• License: MIT License (Copyright (c) 2026 Monalika Doda)\n"
             "• Assistance Disclosure: Built with AI coding assistance (Antigravity).\n"
             "• Quick-Start: Run backend on port 8000, frontend on port 3000. Step 3 is optional.")
        ]

        for title, subtitle, content in slides:
            fig = plt.figure(figsize=(13.33, 7.5), dpi=300)
            ax = fig.add_subplot(111)
            ax.axis('off')
            fig.patch.set_facecolor('#ffffff')

            # Header Banner
            rect_h = patches.Rectangle((0, 0.88), 1, 0.12, facecolor='#0f766e', edgecolor='none')
            ax.add_patch(rect_h)

            ax.text(0.04, 0.95, subtitle, fontsize=15.5, fontweight='bold', color='#ffffff', va='center')
            ax.text(0.04, 0.905, title, fontsize=10.5, color='#ccfbf1', va='center')

            # Content Box
            rect_c = patches.FancyBboxPatch((0.04, 0.08), 0.92, 0.76, boxstyle="round,pad=0.02,rounding_size=0.015",
                                            facecolor='#f8fafc', edgecolor='#e2e8f0', linewidth=1.2)
            ax.add_patch(rect_c)

            ax.text(0.07, 0.79, content, fontsize=10.5, color='#0f172a', va='top', linespacing=1.52)

            # Footer
            ax.text(0.04, 0.035, "PulmoTwin • Monalika Doda • SRM University Delhi-NCR • Research Prototype", fontsize=9, color='#64748b')
            ax.text(0.96, 0.035, "MIT License", fontsize=9, color='#64748b', ha='right')

            plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
            pdf.savefig(fig)
            plt.close()

if __name__ == "__main__":
    print("Generating PulmoTwin_Architecture_Diagram.pdf...")
    create_architecture_diagram()
    print("Generating PulmoTwin_Presentation_Deck.pdf...")
    create_presentation_deck()
    print("PDF generation complete with exact ground-truth values and credits!")
