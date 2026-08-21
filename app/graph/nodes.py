import json
from app.models.patient_model import Patient
from app.agents.checker_agent import CheckerAgent
from app.services.evidence_service import EvidenceService
from app.services.analysis_service import AnalysisService
from app.services.citation_service import CitationService
from app.services.risk_service import RiskService
from app.services.risk_engine import RiskEngine
from app.agents.explanation_agent import ExplanationAgent


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
    print("\n--- CHECKER NODE ---")

    agent = CheckerAgent()
    route = agent.run(state["patient"])

    print("Route decided:", route)

    return {**state, "route": route}


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

    service = RiskService()
    output = service.run(state["citation_output"])

    print("Risk Output (Flow A):", output)

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

    # 🔥 Always prefer pipeline output
    if "risk_output" in state:
        input_data = state["risk_output"]

    else:
        raise ValueError("No input found for explanation node")

    output = agent.run(input_data)

    print("Final Report Generated")

    return {**state, "final_output": output}