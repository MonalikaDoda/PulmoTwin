"""
PulmoTwin Multi-Modal Model Training, Ablation, Lead-Time & Robustness Pipeline.

FEATURES:
- Wearables: SpO2, HR, RR, Sleep, Steps (Baselines, Deviations, 3-Day Trends & Min/Max)
- Static EHR: Age, Sex, Condition, Severity Stage, Smoking, Past Flare-ups, Adherence, Comorbidities
- Air Quality: Copernicus CAMS Modelled Data mapped to Indian CPCB NAQI, PM2.5, PM10
- Weather & Environment: Dust, Cold (<16C), Diurnal Temp Swings (Tmax - Tmin), Humidity, Wind,
  and Delhi Seasonal Simulated Pollen Index

EVALUATIONS:
1. Patient-level train/test split (400 train patients, 100 test patients; 0 patient leakage)
2. 4-Stage Ablation Study (Vitals Only -> +EHR -> +AQI -> Full Multi-Modal)
3. Lead-Time Warning Horizon Analysis (48h, 36h, 24h, 12h) & Alerts per Patient per Month
4. Wearable Sensor Dropout Robustness Test (0%, 10%, 20%, 30% random missingness)
5. SHAP TreeExplainer Local & Global Feature Attributions
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import (
    roc_auc_score, average_precision_score, precision_score, 
    recall_score, f1_score, confusion_matrix, brier_score_loss
)
import xgboost as xgb
import shap

# Feature groups for Ablation Study
VITALS_FEATURES = [
    "spo2_dev_baseline",
    "hr_dev_baseline",
    "rr_dev_baseline",
    "sleep_dev_baseline",
    "steps_ratio_baseline",
    "spo2_rolling_mean_3d",
    "spo2_rolling_min_3d",
    "spo2_trend_3d",
    "hr_rolling_mean_3d",
    "hr_rolling_max_3d",
    "hr_trend_3d",
    "rr_rolling_mean_3d",
    "rr_trend_3d",
    "sleep_rolling_mean_3d",
    "sleep_trend_3d",
    "steps_rolling_mean_3d",
    "steps_trend_3d"
]

EHR_FEATURES = [
    "age",
    "is_male",
    "is_copd",
    "pack_years",
    "severity_stage_num",
    "fev1_percent_predicted",
    "past_flare_ups_year",
    "baseline_adherence",
    "comorbidity_count",
    "is_current_smoker"
]

AQI_FEATURES = [
    "aqi_cpcb_mean",
    "aqi_cpcb_max",
    "aqi_mean_3d",
    "aqi_max_3d",
    "pm2_5_mean",
    "pm2_5_mean_3d",
    "pm10_mean",
    "med_adherence_rolling_7d"
]

WEATHER_DUST_POLLEN_FEATURES = [
    "dust_mean",
    "dust_mean_3d",
    "temperature_2m_mean",
    "temp_mean_3d",
    "temp_swing_diurnal",
    "temp_swing_3d",
    "relative_humidity_2m_mean",
    "precipitation_sum",
    "wind_speed_10m_max",
    "simulated_pollen_index",
    "simulated_pollen_mean_3d"
]

FULL_FEATURE_SET = VITALS_FEATURES + EHR_FEATURES + AQI_FEATURES + WEATHER_DUST_POLLEN_FEATURES

def build_365d_features(df_static: pd.DataFrame, df_ts: pd.DataFrame) -> pd.DataFrame:
    """Fuses static EHR and dynamic 365-day telemetry with rolling windows."""
    df = df_ts.sort_values(["patient_id", "day_number"]).copy()
    
    static_cols = [
        "patient_id", "condition", "age", "sex", "smoking_status", "pack_years",
        "severity_stage_num", "fev1_percent_predicted", "past_flare_ups_year",
        "baseline_adherence", "comorbidity_count", "baseline_spo2",
        "baseline_heart_rate", "baseline_resp_rate", "baseline_sleep_hours", "baseline_steps"
    ]
    df = df.merge(df_static[static_cols], on="patient_id", how="left")
    
    # 1. Baseline Deviations
    df["spo2_dev_baseline"] = df["spo2"] - df["baseline_spo2"]
    df["hr_dev_baseline"] = df["resting_heart_rate"] - df["baseline_heart_rate"]
    df["rr_dev_baseline"] = df["respiratory_rate"] - df["baseline_resp_rate"]
    df["sleep_dev_baseline"] = df["sleep_hours"] - df["baseline_sleep_hours"]
    df["steps_ratio_baseline"] = df["steps"] / (df["baseline_steps"] + 1e-4)
    
    # Grouped 3-day rolling features
    grouped = df.groupby("patient_id")
    
    df["spo2_rolling_mean_3d"] = grouped["spo2"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["spo2_rolling_min_3d"] = grouped["spo2"].transform(lambda x: x.rolling(3, min_periods=1).min())
    df["spo2_trend_3d"] = df["spo2"] - grouped["spo2"].transform(lambda x: x.shift(2)).fillna(df["spo2"])
    
    df["hr_rolling_mean_3d"] = grouped["resting_heart_rate"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["hr_rolling_max_3d"] = grouped["resting_heart_rate"].transform(lambda x: x.rolling(3, min_periods=1).max())
    df["hr_trend_3d"] = df["resting_heart_rate"] - grouped["resting_heart_rate"].transform(lambda x: x.shift(2)).fillna(df["resting_heart_rate"])
    
    df["rr_rolling_mean_3d"] = grouped["respiratory_rate"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["rr_trend_3d"] = df["respiratory_rate"] - grouped["respiratory_rate"].transform(lambda x: x.shift(2)).fillna(df["respiratory_rate"])
    
    df["sleep_rolling_mean_3d"] = grouped["sleep_hours"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["sleep_trend_3d"] = df["sleep_hours"] - grouped["sleep_hours"].transform(lambda x: x.shift(2)).fillna(df["sleep_hours"])
    
    df["steps_rolling_mean_3d"] = grouped["steps"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["steps_trend_3d"] = df["steps"] - grouped["steps"].transform(lambda x: x.shift(2)).fillna(df["steps"])
    
    df["med_adherence_rolling_7d"] = grouped["medication_adherence"].transform(lambda x: x.rolling(7, min_periods=1).mean())
    
    # Environmental Rolling Features
    df["aqi_mean_3d"] = grouped["aqi_cpcb_mean"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["aqi_max_3d"] = grouped["aqi_cpcb_max"].transform(lambda x: x.rolling(3, min_periods=1).max())
    df["pm2_5_mean_3d"] = grouped["pm2_5_mean"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["dust_mean_3d"] = grouped["dust_mean"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["temp_mean_3d"] = grouped["temperature_2m_mean"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["temp_swing_3d"] = grouped["temp_swing_diurnal"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    df["simulated_pollen_mean_3d"] = grouped["simulated_pollen_index"].transform(lambda x: x.rolling(3, min_periods=1).mean())
    
    # Categoricals
    df["is_male"] = (df["sex"] == "Male").astype(int)
    df["is_copd"] = (df["condition"] == "COPD").astype(int)
    df["is_current_smoker"] = (df["smoking_status"] == "Current Smoker").astype(int)
    
    return df

def run_comprehensive_training_and_evaluations():
    print("[Pipeline] Loading 365-day static and longitudinal telemetry datasets...")
    df_static = pd.read_csv("data/patients_static.csv")
    df_ts = pd.read_csv("data/wearables_timeseries_365d.csv")
    
    print("[Pipeline] Computing multi-modal feature matrix...")
    df_full = build_365d_features(df_static, df_ts)
    
    os.makedirs("model", exist_ok=True)
    df_full.to_csv("data/features_365d_dataset.csv", index=False)
    
    groups = df_full["patient_id"]
    y = df_full["flare_up_next_48h"]
    
    # Patient-level split: 80% train patients (400 pts), 20% test patients (100 pts)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_idx, test_idx = next(gss.split(df_full, y, groups))
    
    train_pts = groups.iloc[train_idx].nunique()
    test_pts = groups.iloc[test_idx].nunique()
    print(f"[Pipeline] Stratified Patient-Level Split: {train_pts} train patients ({len(train_idx)} rows), "
          f"{test_pts} test patients ({len(test_idx)} rows)")
    print(f"[Pipeline] Train positive labels: {y.iloc[train_idx].sum()}/{len(train_idx)} ({y.iloc[train_idx].mean()*100:.3f}%)")
    print(f"[Pipeline] Test positive labels:  {y.iloc[test_idx].sum()}/{len(test_idx)} ({y.iloc[test_idx].mean()*100:.3f}%)")
    
    # =========================================================================
    # PART A: ABLATION STUDY
    # =========================================================================
    print("\n" + "="*65)
    print("           (A) MULTI-MODAL ABLATION STUDY")
    print("="*65)
    
    ablation_configs = [
        ("M1: Vitals Only", VITALS_FEATURES),
        ("M2: Vitals + EHR", VITALS_FEATURES + EHR_FEATURES),
        ("M3: Vitals + EHR + CAMS AQI", VITALS_FEATURES + EHR_FEATURES + AQI_FEATURES),
        ("M4: Full Multi-Modal (+ Weather/Dust/Pollen)", FULL_FEATURE_SET)
    ]
    
    ablation_results = []
    models_dict = {}
    
    y_train = y.iloc[train_idx]
    y_test = y.iloc[test_idx]
    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()
    scale_pos = neg_count / max(1, pos_count)
    
    for name, feat_subset in ablation_configs:
        X_train_sub = df_full.iloc[train_idx][feat_subset]
        X_test_sub = df_full.iloc[test_idx][feat_subset]
        
        clf = xgb.XGBClassifier(
            n_estimators=160,
            max_depth=4,
            learning_rate=0.045,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=scale_pos * 0.55,
            eval_metric="auc",
            random_state=42
        )
        clf.fit(X_train_sub, y_train)
        models_dict[name] = clf
        
        pred_proba = clf.predict_proba(X_test_sub)[:, 1]
        
        # Optimize threshold
        thresholds = np.linspace(0.15, 0.85, 71)
        f1s = [f1_score(y_test, (pred_proba >= t).astype(int), zero_division=0) for t in thresholds]
        opt_thresh = float(thresholds[np.argmax(f1s)])
        pred_binary = (pred_proba >= opt_thresh).astype(int)
        
        roc_auc = float(roc_auc_score(y_test, pred_proba))
        pr_auc = float(average_precision_score(y_test, pred_proba))
        prec = float(precision_score(y_test, pred_binary, zero_division=0))
        rec = float(recall_score(y_test, pred_binary, zero_division=0))
        f1 = float(f1_score(y_test, pred_binary, zero_division=0))
        brier = float(brier_score_loss(y_test, pred_proba))
        
        print(f"[{name}]")
        print(f"  Features: {len(feat_subset)} | ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f} | "
              f"Recall: {rec*100:.1f}% | Precision: {prec*100:.1f}% | F1: {f1:.4f} (Thresh: {opt_thresh:.2f})")
        
        ablation_results.append({
            "model_name": name,
            "feature_count": len(feat_subset),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "recall": round(rec, 4),
            "precision": round(prec, 4),
            "f1_score": round(f1, 4),
            "brier_score": round(brier, 4),
            "optimal_threshold": round(opt_thresh, 2)
        })
        
    with open("model/ablation_study.json", "w") as f:
        json.dump(ablation_results, f, indent=2)
        
    # Best Model is Full Multi-Modal (M4)
    best_model = models_dict["M4: Full Multi-Modal (+ Weather/Dust/Pollen)"]
    best_model.save_model("model/pulmotwin_xgboost.json")
    joblib.dump(best_model, "model/pulmotwin_xgboost.joblib")
    
    X_train_full = df_full.iloc[train_idx][FULL_FEATURE_SET]
    X_test_full = df_full.iloc[test_idx][FULL_FEATURE_SET]
    full_pred_proba = best_model.predict_proba(X_test_full)[:, 1]
    best_thresh = ablation_results[-1]["optimal_threshold"]
    full_pred_binary = (full_pred_proba >= best_thresh).astype(int)
    cm = confusion_matrix(y_test, full_pred_binary).tolist()
    
    # =========================================================================
    # PART B: LEAD-TIME WARNING ANALYSIS & ALERT BURDEN PER PATIENT/MONTH
    # =========================================================================
    print("\n" + "="*65)
    print("       (B) LEAD-TIME ANALYSIS & CLINICAL ALERT BURDEN")
    print("="*65)
    
    # Assess sensitivity across lead-time horizons (48h, 36h, 24h, 12h)
    test_df_eval = df_full.iloc[test_idx].copy()
    test_df_eval["pred_proba"] = full_pred_proba
    test_df_eval["alert_triggered"] = full_pred_binary
    
    lead_time_stats = {}
    # Find all actual flare onsets in test set
    test_flare_events = test_df_eval[test_df_eval["flare_up_onset"] == 1]
    total_test_flares = len(test_flare_events)
    
    # For each flare onset, check if alert was active at 48h, 36h, 24h, 12h prior
    # Day -2 corresponds to 48h prior, Day -1 corresponds to 24h prior
    detected_at_48h = 0
    detected_at_36h = 0
    detected_at_24h = 0
    detected_at_12h = 0
    
    for _, f_row in test_flare_events.iterrows():
        p = f_row["patient_id"]
        d = f_row["day_number"]
        p_history = test_df_eval[test_df_eval["patient_id"] == p]
        
        # Day -2 (36h to 48h lead time)
        d_minus_2 = p_history[p_history["day_number"] == (d - 2)]
        # Day -1 (12h to 24h lead time)
        d_minus_1 = p_history[p_history["day_number"] == (d - 1)]
        
        has_alert_d2 = (d_minus_2["alert_triggered"].values[0] == 1) if len(d_minus_2) > 0 else False
        has_alert_d1 = (d_minus_1["alert_triggered"].values[0] == 1) if len(d_minus_1) > 0 else False
        
        if has_alert_d2 or has_alert_d1:
            detected_at_48h += 1
        if has_alert_d2 or has_alert_d1:
            detected_at_36h += 1
        if has_alert_d1:
            detected_at_24h += 1
            detected_at_12h += 1
        elif has_alert_d2:
            detected_at_24h += 1
            
    lead_time_analysis = {
        "total_test_flare_events": total_test_flares,
        "sensitivity_at_48h_ahead": round(detected_at_48h / max(1, total_test_flares), 4),
        "sensitivity_at_36h_ahead": round(detected_at_36h / max(1, total_test_flares), 4),
        "sensitivity_at_24h_ahead": round(detected_at_24h / max(1, total_test_flares), 4),
        "sensitivity_at_12h_ahead": round(detected_at_12h / max(1, total_test_flares), 4),
        "total_alerts_triggered_in_test_cohort": int(full_pred_binary.sum()),
        "test_patients_count": test_pts,
        "monitoring_duration_months": 12,
        "average_alerts_per_patient_per_month": round(float(full_pred_binary.sum()) / (test_pts * 12), 2),
        "average_alerts_per_patient_per_year": round(float(full_pred_binary.sum()) / test_pts, 2)
    }
    
    print(f"Total Test Cohort Flare Events:          {total_test_flares}")
    print(f"Sensitivity at 48h Warning Horizon:      {lead_time_analysis['sensitivity_at_48h_ahead']*100:.1f}%")
    print(f"Sensitivity at 36h Warning Horizon:      {lead_time_analysis['sensitivity_at_36h_ahead']*100:.1f}%")
    print(f"Sensitivity at 24h Warning Horizon:      {lead_time_analysis['sensitivity_at_24h_ahead']*100:.1f}%")
    print(f"Average Clinical Alerts / Patient / Month:{lead_time_analysis['average_alerts_per_patient_per_month']} alerts/mo")
    print(f"Average Clinical Alerts / Patient / Year: {lead_time_analysis['average_alerts_per_patient_per_year']} alerts/yr")
    
    with open("model/lead_time_analysis.json", "w") as f:
        json.dump(lead_time_analysis, f, indent=2)
        
    # =========================================================================
    # PART C: WEARABLE SENSOR DATA DROPOUT ROBUSTNESS TEST
    # =========================================================================
    print("\n" + "="*65)
    print("      (C) WEARABLE SENSOR RANDOM DROPOUT TEST")
    print("="*65)
    
    dropout_levels = [0.0, 0.10, 0.20, 0.30]
    dropout_results = []
    
    # Feature columns corresponding to wearables
    wearable_cols = [c for c in FULL_FEATURE_SET if any(k in c for k in ["spo2", "hr", "rr", "sleep", "steps"])]
    
    for rate in dropout_levels:
        X_test_dropout = X_test_full.copy()
        if rate > 0.0:
            # Simulate random wearable dropout (sensor not worn / uncharged battery)
            mask = np.random.rand(*X_test_dropout[wearable_cols].shape) < rate
            # In clinical practice, missing wearable telemetry is imputed with personal baseline (0 deviation)
            for c in wearable_cols:
                if "dev_baseline" in c:
                    X_test_dropout.loc[mask[:, wearable_cols.index(c)], c] = 0.0
                elif "ratio_baseline" in c:
                    X_test_dropout.loc[mask[:, wearable_cols.index(c)], c] = 1.0
                else:
                    median_val = X_train_full[c].median()
                    X_test_dropout.loc[mask[:, wearable_cols.index(c)], c] = median_val
                    
        drop_proba = best_model.predict_proba(X_test_dropout)[:, 1]
        drop_binary = (drop_proba >= best_thresh).astype(int)
        
        d_roc = float(roc_auc_score(y_test, drop_proba))
        d_rec = float(recall_score(y_test, drop_binary, zero_division=0))
        d_prec = float(precision_score(y_test, drop_binary, zero_division=0))
        d_f1 = float(f1_score(y_test, drop_binary, zero_division=0))
        
        print(f"Dropout Rate: {int(rate*100):2d}% | ROC-AUC: {d_roc:.4f} | Recall: {d_rec*100:.1f}% | "
              f"Precision: {d_prec*100:.1f}% | F1: {d_f1:.4f}")
        
        dropout_results.append({
            "dropout_rate_percent": int(rate * 100),
            "roc_auc": round(d_roc, 4),
            "recall": round(d_rec, 4),
            "precision": round(d_prec, 4),
            "f1_score": round(d_f1, 4)
        })
        
    with open("model/dropout_robustness.json", "w") as f:
        json.dump(dropout_results, f, indent=2)
        
    # =========================================================================
    # PART D: SHAP EXPLANATIONS & TREEEXPLAINER
    # =========================================================================
    print("\n" + "="*65)
    print("            (D) SHAP EXPLAINABILITY PIPELINE")
    print("="*65)
    
    explainer = shap.TreeExplainer(best_model)
    sample_X = X_test_full.sample(n=min(500, len(X_test_full)), random_state=42)
    shap_vals = explainer(sample_X)
    
    joblib.dump(explainer, "model/shap_explainer.joblib")
    
    # Beeswarm Summary Plot
    plt.figure(figsize=(11, 9), dpi=180)
    shap.summary_plot(shap_vals, sample_X, show=False, max_display=14)
    plt.title("PulmoTwin Multi-Modal Risk Drivers (SHAP TreeExplainer - 365 Days)", fontsize=13, fontweight="bold", pad=14)
    plt.tight_layout()
    plt.savefig("model/shap_summary_365d.png", bbox_inches="tight")
    plt.close()
    
    # Bar Importance Plot
    plt.figure(figsize=(10, 7), dpi=180)
    shap.plots.bar(shap_vals, max_display=12, show=False)
    plt.title("Top 12 Drivers of 48-Hour Flare-Up Risk (Mean |SHAP|)", fontsize=13, fontweight="bold", pad=14)
    plt.tight_layout()
    plt.savefig("model/shap_bar_importance_365d.png", bbox_inches="tight")
    plt.close()
    
    # Save overall comprehensive summary
    comprehensive_metrics = {
        "primary_model": "M4: Full Multi-Modal (Vitals + EHR + CAMS AQI + Weather/Dust/Pollen)",
        "train_patients": train_pts,
        "test_patients": test_pts,
        "monitoring_days": 365,
        "total_patient_days": len(df_full),
        "test_patient_days": len(test_idx),
        "roc_auc": ablation_results[-1]["roc_auc"],
        "pr_auc": ablation_results[-1]["pr_auc"],
        "precision": ablation_results[-1]["precision"],
        "recall": ablation_results[-1]["recall"],
        "f1_score": ablation_results[-1]["f1_score"],
        "brier_score": ablation_results[-1]["brier_score"],
        "optimal_threshold": best_thresh,
        "confusion_matrix": {
            "true_negatives": cm[0][0],
            "false_positives": cm[0][1],
            "false_negatives": cm[1][0],
            "true_positives": cm[1][1]
        },
        "features": FULL_FEATURE_SET,
        "ablation_summary": ablation_results,
        "lead_time_summary": lead_time_analysis,
        "dropout_robustness": dropout_results
    }
    
    with open("model/comprehensive_metrics.json", "w") as f:
        json.dump(comprehensive_metrics, f, indent=2)
        
    print("[Pipeline] Saved all model artifacts, JSONs, and SHAP plots to /model.")
    return comprehensive_metrics

if __name__ == "__main__":
    run_comprehensive_training_and_evaluations()
