import json
from app.models.patient_model import Patient
from app.agents.checker_agent import CheckerAgent
from app.services.evidence_service import EvidenceService
from app.services.analysis_service import AnalysisService
from app.services.citation_service import CitationService
from app.services.risk_service import RiskService
from app.services.risk_engine import RiskEngine
from app.agents.explanation_agent import ExplanationAgent
from app.services.ml_risk_model import MLRiskModel
from app.services.ml_feature_builder import build_ml_features


ml_model = MLRiskModel("/Users/vishal/Desktop/agentic_system/app/ML_model/risk_model.pkl")

# -------------------------------
# LOAD PATIENT
# -------------------------------
def load_patient_node(state):
    print("\n--- LOAD PATIENT NODE ---")

    with open("data/processed/patient_history.json") as f:
        data = json.load(f)

    patient = Patient(state["patient_id"], data[state["patient_id"]])

    print("Patient loaded:", state["patient_id"])

    return {**state, "patient": patient}


# -------------------------------
# CHECKER
# -------------------------------
def checker_node(state):
    agent = CheckerAgent()

    result = agent.run(state["patient"])

    state["route"] = result["route"]
    state["hcc_summary"] = result["hcc_summary"]

    return state


# -------------------------------
# FLOW A → EVIDENCE
# -------------------------------
def evidence_node(state):
    print("\n--- EVIDENCE NODE ---")

    service = EvidenceService()
    output = service.run(state["patient"])

    print("Evidence Output:", output)

    return {**state, "evidence_output": output}


# -------------------------------
# FLOW A → ANALYSIS
# -------------------------------
def analysis_node(state):
    print("\n--- ANALYSIS NODE ---")

    service = AnalysisService()
    output = service.run(state["evidence_output"])

    print("Analysis Output:", output)

    return {**state, "analysis_output": output}


# -------------------------------
# FLOW A → CITATION
# -------------------------------
def citation_node(state):
    print("\n--- CITATION NODE ---")

    service = CitationService()
    output = service.run(state["analysis_output"])

    print("Citation Output:", output)

    return {**state, "citation_output": output}


# -------------------------------
# FLOW A → RISK (HCC BASED)
# -------------------------------
def risk_service_node(state):
    print("\n--- RISK NODE (FLOW A) ---")

    route = state.get("route")   # from checker
    patient = state["patient"]
    print("[TRACE] ROUTE:", route)

    # ===============================
    # ✅ CASE 1: VALID → USE ML MODEL
    # ===============================
    if route == "VALID":
        print("Using ML Model for VALID case")

        features = build_ml_features(patient)
        print("[DEBUG] ML Features:", features)

        score, level = ml_model.predict(features)

        output = {
            "patient_id": patient.patient_id,
            "analysis": [{
                "status": "VALID",
                "risk_score": score,
                "risk_level": level,
                "reasoning": "Risk computed using ML model based on patient history and encounter patterns",
                "citations": []
            }]
        }

        print("Risk Output (ML):", output)
        return {**state, "risk_output": output}

    # ===============================
    # ❌ CASE 2: UNSUPPORTED → OLD FLOW
    # ===============================
    else:
        print("Using Rule-based RiskService (UNSUPPORTED)")

        service = RiskService()
        output = service.run(state["citation_output"])

        print("Risk Output (Flow A - Rule):", output)

        return {**state, "risk_output": output}

# -------------------------------
# FLOW B → RISK ENGINE (NO HCC)
# -------------------------------
def risk_engine_node(state):
    print("\n--- RISK NODE (FLOW B) ---")

    patient = state["patient"]

    engine = RiskEngine()
    output = engine.run(patient)

    print("Risk Output (Flow B):", output)

    return {**state, "risk_output": output}


# -------------------------------
# EXPLANATION NODE (COMMON)
# -------------------------------
def explanation_node(state):
    print("\n--- EXPLANATION NODE ---")

    agent = ExplanationAgent()

    # ✅ PASS FULL CONTEXT
    input_data = {
        "patient": state.get("patient"),
        "risk_output": state.get("risk_output"),
        "route": state.get("route"),              # 🔥 VERY IMPORTANT
        "hcc_summary": state.get("hcc_summary", [])  # 🔥 for Flow A
    }

    output = agent.run(input_data)

    print("Final Report Generated")

    return {**state, "final_output": output}