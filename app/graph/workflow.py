from langgraph.graph import StateGraph, END
from app.graph.state import GraphState
from app.graph.nodes import (
    load_patient_node,
    checker_node,
    evidence_node,
    analysis_node,
    citation_node,
    risk_service_node,
    risk_engine_node,
    explanation_node,
)


# -------------------------------
# ROUTING LOGIC
# -------------------------------
def route_decision(state: GraphState):
    route = state.get("route")

    print("\n[ROUTER] Decision:", route)

    if route == "VALID":
        return "flow_valid"          # ML FLOW

    elif route == "UNSUPPORTED_HCC":
        return "flow_a"              # RULE/EVIDENCE FLOW

    elif route == "NO_HCC_PRESENT":
        return "flow_b"              # NO HCC FLOW

    else:
        print("[ROUTER] Unknown route → defaulting to flow_a")
        return "flow_a"


# -------------------------------
# BUILD GRAPH
# -------------------------------
def build_workflow():
    graph = StateGraph(GraphState)

    # Nodes
    graph.add_node("load_patient", load_patient_node)
    graph.add_node("checker", checker_node)

    graph.add_node("evidence", evidence_node)
    graph.add_node("analysis", analysis_node)
    graph.add_node("citation", citation_node)
    graph.add_node("risk_service", risk_service_node)

    graph.add_node("risk_engine", risk_engine_node)

    graph.add_node("explanation", explanation_node)

    # Entry
    graph.set_entry_point("load_patient")

    # Base flow
    graph.add_edge("load_patient", "checker")

    # Conditional routing
    graph.add_conditional_edges(
        "checker",
        route_decision,
        {
            "flow_valid": "risk_service",   # ML
            "flow_a": "evidence",           # Evidence → Analysis → Citation → Risk
            "flow_b": "risk_engine",        # No HCC → direct risk
        },
    )

    # Flow A (Evidence pipeline)
    graph.add_edge("evidence", "analysis")
    graph.add_edge("analysis", "citation")
    graph.add_edge("citation", "risk_service")

    # Final flows
    graph.add_edge("risk_service", "explanation")
    graph.add_edge("risk_engine", "explanation")

    graph.add_edge("explanation", END)

    return graph.compile()