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


def route_decision(state: GraphState):
    route = state.get("route")

    if route == "UNSUPPORTED_HCC":
        return "flow_a"
    elif route == "NO_HCC_PRESENT":
        return "flow_b"
    else:
        return "direct"


def build_workflow():
    graph = StateGraph(GraphState)

    graph.add_node("load_patient", load_patient_node)
    graph.add_node("checker", checker_node)

    graph.add_node("evidence", evidence_node)
    graph.add_node("analysis", analysis_node)
    graph.add_node("citation", citation_node)
    graph.add_node("risk_service", risk_service_node)

    graph.add_node("risk_engine", risk_engine_node)

    graph.add_node("explanation", explanation_node)

    graph.set_entry_point("load_patient")

    graph.add_edge("load_patient", "checker")

    graph.add_conditional_edges(
        "checker",
        route_decision,
        {
            "flow_a": "evidence",
            "flow_b": "risk_engine",
            "direct": "explanation",
        },
    )

    graph.add_edge("evidence", "analysis")
    graph.add_edge("analysis", "citation")
    graph.add_edge("citation", "risk_service")

    graph.add_edge("risk_service", "explanation")
    graph.add_edge("risk_engine", "explanation")

    graph.add_edge("explanation", END)

    return graph.compile()