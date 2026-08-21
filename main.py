from app.graph.workflow import build_workflow
from app.utils.pdf_generator import generate_pdf
import json

def normalize_report(report):
    report.setdefault("summary", "No summary available")
    report.setdefault("risk_assessment", [])
    report.setdefault("explanations", [])
    report.setdefault("recommendation", "No recommendation available")
    report.setdefault("citations", [])

    # -------------------------
    # Risk Assessment
    # -------------------------
    fixed_risk = []
    for r in report["risk_assessment"]:
        if isinstance(r, dict):
            fixed_risk.append({
                "disease": r.get("disease", "Overall Patient Risk"),
                "risk_level": r.get("risk_level", "N/A"),
                "risk_score": r.get("risk_score", "N/A")
            })
        else:
            # if somehow string → convert
            fixed_risk.append({
                "disease": "Overall Patient Risk",
                "risk_level": "N/A",
                "risk_score": "N/A"
            })
    report["risk_assessment"] = fixed_risk

    # -------------------------
    # Explanations
    # -------------------------
    fixed_exp = []
    for e in report["explanations"]:
        if isinstance(e, dict):
            fixed_exp.append({
                "disease": e.get("disease", "Overall Patient Risk"),
                "text": e.get("text") or e.get("reasoning") or e.get("explanation") or "No explanation available"
            })
        else:
            # 🔥 HANDLE STRING CASE
            fixed_exp.append({
                "disease": "Overall Patient Risk",
                "text": str(e)
            })
    report["explanations"] = fixed_exp

    # -------------------------
    # Citations
    # -------------------------
    fixed_cit = []
    for c in report["citations"]:
        if isinstance(c, dict):
            fixed_cit.append({
                "disease": c.get("disease", "Overall Patient Risk"),
                "details": c.get("details", "No data available")
            })
        else:
            fixed_cit.append({
                "disease": "Overall Patient Risk",
                "details": str(c)
            })
    report["citations"] = fixed_cit

    return report
    
def run():
    app = build_workflow()

    # 🔥 MULTIPLE PATIENT INPUT
    patient_ids = [
       	"PT003935"
    ]

    all_reports = []

    print("\n🚀 STARTING BATCH WORKFLOW...\n")

    for pid in patient_ids:
        print(f"\n==============================")
        print(f"🔹 PROCESSING PATIENT: {pid}")
        print(f"==============================\n")

        state = {"patient_id": pid}

        result = app.invoke(state)

        report = result.get("final_output", {}).get("final_report", {})
        
        report = normalize_report(report)
        # store
        all_reports.append({
            "patient_id": pid,
            "report": report
        })

        # optional individual PDF
        generate_pdf(report, f"report_{pid}.pdf")

    # 🔥 SAVE ALL REPORTS (for frontend)
    with open("all_reports.json", "w") as f:
        json.dump(all_reports, f, indent=2)

    print("\n✅ ALL PATIENTS PROCESSED\n")


if __name__ == "__main__":
    run()