from app.graph.workflow import build_workflow
from app.utils.pdf_generator import generate_pdf

def run():
    app = build_workflow()

    state = {
        "patient_id":"PT007018"
    }
    result = app.invoke(state)

    print("\n========== FINAL REPORT ==========\n")

    report = result["final_output"]
    
    if "final_report" in report:
        report = report["final_report"]

    generate_pdf(report, "patient_report.pdf")


if __name__ == "__main__":
    run()