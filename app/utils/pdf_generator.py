from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet


def generate_pdf(report, filename="report.pdf"):
    doc = SimpleDocTemplate(filename)
    styles = getSampleStyleSheet()

    elements = []

    # -------------------
    # TITLE
    # -------------------
    elements.append(Paragraph("Clinical Audit Report", styles["Title"]))
    elements.append(Spacer(1, 12))

    # -------------------
    # SUMMARY
    # -------------------
    elements.append(Paragraph("1. Summary", styles["Heading2"]))
    elements.append(Paragraph(report["summary"], styles["BodyText"]))
    elements.append(Spacer(1, 12))

    # -------------------
    # RISK ASSESSMENT
    # -------------------
    elements.append(Paragraph("2. Risk Assessment", styles["Heading2"]))

    for r in report["risk_assessment"]:
        text = f"{r['disease']} → {r['risk_level']} ({r['risk_score']})"
        elements.append(Paragraph(text, styles["BodyText"]))

    elements.append(Spacer(1, 12))

    # -------------------
    # EXPLANATION
    # -------------------
    elements.append(Paragraph("3. Explanation", styles["Heading2"]))

    for e in report["explanations"]:
        elements.append(Paragraph(f"<b>{e.get('disease', 'Unknown')}</b>", styles["BodyText"]))

        explanation_text = (
            e.get("text")
            or e.get("reasoning")
            or e.get("explanation")
            or "No explanation available"
        )

        elements.append(Paragraph(explanation_text, styles["BodyText"]))
        elements.append(Spacer(1, 8))

    # -------------------
    # RECOMMENDATION
    # -------------------
    elements.append(Paragraph("4. Recommendation", styles["Heading2"]))
    elements.append(Paragraph(report["recommendation"], styles["BodyText"]))
    elements.append(Spacer(1, 12))

    # -------------------
    # CITATIONS
    # -------------------
    elements.append(Paragraph("5. Citations", styles["Heading2"]))

    for c in report["citations"]:
        elements.append(
            Paragraph(f"{c['disease']} → {c['details']}", styles["BodyText"])
        )

    # BUILD PDF
    doc.build(elements)