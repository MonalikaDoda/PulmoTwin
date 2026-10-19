from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

print("--- Testing /api/health ---")
r = client.get("/api/health")
print(r.status_code, r.json())

print("\n--- Testing /api/patients ---")
r = client.get("/api/patients")
patients = r.json()
print(f"Total returned: {len(patients)}")
top_p = patients[0]
print(f"Top Risk Patient: {top_p['patient_id']} ({top_p['name']}), Score: {top_p['risk_score']} ({top_p['risk_level']})")

pid = top_p['patient_id']
print(f"\n--- Testing /api/patients/{pid}/shap ---")
r_shap = client.get(f"/api/patients/{pid}/shap")
print(r_shap.status_code, r_shap.json())

print(f"\n--- Testing /api/patients/{pid}/what-if ---")
r_whatif = client.post(f"/api/patients/{pid}/what-if", json={"delta_aqi": -120, "delta_adherence": 0.4})
print(r_whatif.status_code, r_whatif.json())

print("\n--- Testing /api/environment/delhi ---")
r_env = client.get("/api/environment/delhi")
print(r_env.status_code, len(r_env.json().get("monitoring_stations", [])))
