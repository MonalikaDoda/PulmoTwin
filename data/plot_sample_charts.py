"""
Generates publication-quality sample patient trajectory charts for PulmoTwin.
Displays multi-sensor vitals drift (SpO2, HR, RR, Sleep, Steps) alongside Delhi AQI
and personal baselines, highlighting the 48-hour pre-flare window.
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

def generate_sample_charts():
    static_df = pd.read_csv("data/patients_static.csv")
    ts_df = pd.read_csv("data/wearables_timeseries.csv")
    
    # Find a patient with a clear flare-up onset
    flare_patients = ts_df[ts_df["flare_up_onset"] == 1]["patient_id"].unique()
    stable_patients = ts_df[~ts_df["patient_id"].isin(flare_patients)]["patient_id"].unique()
    
    print(f"Total patients with flare-up: {len(flare_patients)}")
    print(f"Total stable patients: {len(stable_patients)}")
    
    # Pick a representative flare-up patient (e.g. flare around day 18-22)
    selected_flare_pid = None
    for pid in flare_patients:
        p_ts = ts_df[ts_df["patient_id"] == pid]
        onset_day = p_ts[p_ts["flare_up_onset"] == 1]["day_number"].values[0]
        if 16 <= onset_day <= 22:
            selected_flare_pid = pid
            break
    if selected_flare_pid is None:
        selected_flare_pid = flare_patients[0]
        
    selected_stable_pid = stable_patients[0]
    
    # Create Detailed Chart for Flare Patient
    plot_single_patient_deepdive(selected_flare_pid, static_df, ts_df, "data/sample_patient_flare_trajectory.png")
    
    # Create Side-by-Side Comparison Chart (Flare vs Stable)
    plot_comparative_cohort_trajectories(selected_flare_pid, selected_stable_pid, static_df, ts_df, "data/sample_patient_comparison.png")
    
    print("[Charts] Successfully generated sample patient charts in /data")

def plot_single_patient_deepdive(pid, static_df, ts_df, save_path):
    p_static = static_df[static_df["patient_id"] == pid].iloc[0]
    p_ts = ts_df[ts_df["patient_id"] == pid].sort_values("day_number").copy()
    
    flare_row = p_ts[p_ts["flare_up_onset"] == 1]
    flare_day = flare_row["day_number"].values[0] if len(flare_row) > 0 else None
    
    fig, axes = plt.subplots(4, 1, figsize=(14, 11), sharex=True, dpi=180)
    plt.subplots_adjust(hspace=0.22)
    
    days = p_ts["day_number"]
    
    # Title & Clinical Header
    fig.suptitle(
        f"PulmoTwin Digital Twin Telemetry — Patient {p_static['patient_id']} ({p_static['name']}, Age {p_static['age']})\n"
        f"Diagnosis: {p_static['condition']} ({p_static['severity_stage']}) | Zone: {p_static['delhi_zone']} | "
        f"Meds: {p_static['medications'][:45]}... | Baseline Adherence: {int(p_static['baseline_adherence']*100)}%",
        fontsize=13, fontweight='bold', y=0.98
    )
    
    # 1. SpO2 Panel
    ax1 = axes[0]
    ax1.plot(days, p_ts["spo2"], color="#0284c7", lw=2.2, marker="o", markersize=4, label="Daily Resting SpO2 (%)")
    ax1.axhline(p_static["baseline_spo2"], color="#0369a1", linestyle="--", alpha=0.7, 
                label=f"Personal Baseline ({p_static['baseline_spo2']}%)")
    ax1.axhline(90.0, color="#ef4444", linestyle=":", alpha=0.6, label="Clinical Hypoxia Alert (<90%)")
    ax1.set_ylabel("SpO2 (%)", fontweight="semibold")
    ax1.set_ylim(87, 100)
    ax1.grid(True, alpha=0.25)
    ax1.legend(loc="lower left", framealpha=0.9, fontsize=9)
    
    # 2. Resting Heart Rate Panel
    ax2 = axes[1]
    ax2.plot(days, p_ts["resting_heart_rate"], color="#dc2626", lw=2.2, marker="s", markersize=4, label="Resting HR (bpm)")
    ax2.axhline(p_static["baseline_heart_rate"], color="#b91c1c", linestyle="--", alpha=0.7, 
                label=f"Personal Baseline ({p_static['baseline_heart_rate']} bpm)")
    ax2.set_ylabel("Heart Rate (bpm)", fontweight="semibold")
    ax2.grid(True, alpha=0.25)
    ax2.legend(loc="upper left", framealpha=0.9, fontsize=9)
    
    # 3. Respiratory Rate & Sleep Panel (Dual Y)
    ax3 = axes[2]
    ax3_twin = ax3.twinx()
    l1 = ax3.plot(days, p_ts["respiratory_rate"], color="#d97706", lw=2, marker="^", markersize=4, label="Resp Rate (breaths/min)")
    ax3.axhline(p_static["baseline_resp_rate"], color="#b45309", linestyle="--", alpha=0.6)
    l2 = ax3_twin.plot(days, p_ts["sleep_hours"], color="#7c3aed", lw=2, marker="d", markersize=4, label="Sleep Duration (hrs)")
    ax3_twin.axhline(p_static["baseline_sleep_hours"], color="#6d28d9", linestyle="--", alpha=0.6)
    ax3.set_ylabel("Resp Rate (rpm)", fontweight="semibold", color="#d97706")
    ax3_twin.set_ylabel("Sleep (Hours)", fontweight="semibold", color="#7c3aed")
    ax3.grid(True, alpha=0.25)
    
    lines = l1 + l2
    labels = [l.get_label() for l in lines]
    ax3.legend(lines, labels, loc="upper left", framealpha=0.9, fontsize=9)
    
    # 4. Delhi AQI & Daily Steps Panel (Dual Y)
    ax4 = axes[3]
    ax4_twin = ax4.twinx()
    b1 = ax4.bar(days, p_ts["steps"], color="#64748b", alpha=0.45, width=0.6, label="Daily Steps")
    l3 = ax4_twin.plot(days, p_ts["aqi_mean"], color="#ea580c", lw=2.4, marker="o", markersize=4, label=f"Delhi AQI ({p_static['delhi_zone']})")
    ax4_twin.axhline(200, color="#f97316", linestyle=":", alpha=0.7, label="CPCB Poor Threshold (200)")
    ax4.set_ylabel("Daily Steps", fontweight="semibold", color="#475569")
    ax4_twin.set_ylabel("CPCB AQI Index", fontweight="semibold", color="#ea580c")
    ax4.set_xlabel("Monitoring Timeline (Day 1 to 30)", fontweight="semibold")
    ax4.set_xticks(range(1, 31, 2))
    ax4.grid(True, alpha=0.25)
    
    # Highlight 48-Hour Pre-Flare Window & Onset Day across all axes
    if flare_day is not None:
        for ax in [ax1, ax2, ax3, ax4]:
            # 48h pre-flare window
            ax.axvspan(flare_day - 2.5, flare_day - 0.5, color="#fef08a", alpha=0.45, zorder=1)
            # Acute flare-up onset line
            ax.axvline(flare_day, color="#b91c1c", linestyle="-", lw=2.5, zorder=5)
            
        ax1.text(flare_day - 1.5, 98.8, "48h PREDICTION WINDOW\n(Vitals Drift Observed)", 
                 color="#854d0e", fontsize=8.5, fontweight="bold", ha="center",
                 bbox=dict(boxstyle="round,pad=0.2", facecolor="#fef9c3", edgecolor="#ca8a04", alpha=0.9))
        ax1.text(flare_day + 0.2, 91.5, f"Day {flare_day}: Acute\nFlare-Up Onset", 
                 color="#b91c1c", fontsize=9, fontweight="bold")
                 
    plt.tight_layout(rect=[0, 0.02, 1, 0.94])
    plt.savefig(save_path, bbox_inches="tight")
    plt.close()

def plot_comparative_cohort_trajectories(flare_pid, stable_pid, static_df, ts_df, save_path):
    fig, axes = plt.subplots(2, 2, figsize=(16, 9), dpi=180)
    plt.subplots_adjust(wspace=0.18, hspace=0.28)
    
    fig.suptitle("PulmoTwin Digital Twin: Exacerbation Trajectory vs Stable Controlled Trajectory", 
                 fontsize=14, fontweight="bold")
    
    for col_idx, (pid, title_tag) in enumerate([(flare_pid, "PATIENT WITH IMPENDING FLARE-UP"), 
                                               (stable_pid, "STABLE CONTROLLED PATIENT")]):
        p_static = static_df[static_df["patient_id"] == pid].iloc[0]
        p_ts = ts_df[ts_df["patient_id"] == pid].sort_values("day_number")
        flare_row = p_ts[p_ts["flare_up_onset"] == 1]
        flare_day = flare_row["day_number"].values[0] if len(flare_row) > 0 else None
        
        # Row 0: SpO2 and Heart Rate
        ax_top = axes[0, col_idx]
        ax_top_twin = ax_top.twinx()
        
        days = p_ts["day_number"]
        l1 = ax_top.plot(days, p_ts["spo2"], color="#0284c7", lw=2.2, label="SpO2 (%)")
        ax_top.axhline(p_static["baseline_spo2"], color="#0284c7", linestyle="--", alpha=0.5)
        l2 = ax_top_twin.plot(days, p_ts["resting_heart_rate"], color="#dc2626", lw=2.2, label="Resting HR (bpm)")
        ax_top_twin.axhline(p_static["baseline_heart_rate"], color="#dc2626", linestyle="--", alpha=0.5)
        
        ax_top.set_title(f"{title_tag}\n{p_static['patient_id']} ({p_static['condition']}, {p_static['severity_stage']})", 
                         fontweight="bold", fontsize=11)
        ax_top.set_ylabel("SpO2 (%)", color="#0284c7", fontweight="semibold")
        ax_top_twin.set_ylabel("Heart Rate (bpm)", color="#dc2626", fontweight="semibold")
        ax_top.set_ylim(87, 100)
        ax_top_twin.set_ylim(55, 125)
        ax_top.grid(True, alpha=0.25)
        
        if flare_day is not None:
            ax_top.axvspan(flare_day - 2.5, flare_day - 0.5, color="#fef08a", alpha=0.45)
            ax_top.axvline(flare_day, color="#b91c1c", linestyle="-", lw=2)
            
        # Row 1: Sleep & AQI
        ax_bot = axes[1, col_idx]
        ax_bot_twin = ax_bot.twinx()
        
        l3 = ax_bot.plot(days, p_ts["sleep_hours"], color="#7c3aed", lw=2, label="Sleep (hrs)")
        ax_bot.axhline(p_static["baseline_sleep_hours"], color="#7c3aed", linestyle="--", alpha=0.5)
        l4 = ax_bot_twin.plot(days, p_ts["aqi_mean"], color="#ea580c", lw=2, linestyle="-.", label="Delhi AQI")
        
        ax_bot.set_ylabel("Sleep Duration (Hours)", color="#7c3aed", fontweight="semibold")
        ax_bot_twin.set_ylabel("Delhi CPCB AQI", color="#ea580c", fontweight="semibold")
        ax_bot.set_xlabel("Timeline (Days)", fontweight="semibold")
        ax_bot.set_ylim(2, 10.5)
        ax_bot_twin.set_ylim(50, 350)
        ax_bot.grid(True, alpha=0.25)
        
        if flare_day is not None:
            ax_bot.axvspan(flare_day - 2.5, flare_day - 0.5, color="#fef08a", alpha=0.45)
            ax_bot.axvline(flare_day, color="#b91c1c", linestyle="-", lw=2)
            
    plt.tight_layout(rect=[0, 0.02, 1, 0.95])
    plt.savefig(save_path, bbox_inches="tight")
    plt.close()

if __name__ == "__main__":
    generate_sample_charts()
