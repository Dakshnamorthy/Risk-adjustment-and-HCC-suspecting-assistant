from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from app.config.settings import NVIDIA_API_KEY, NVIDIA_BASE_URL, NVIDIA_MODEL
import re
import json


class ExplanationAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=NVIDIA_API_KEY,
            base_url=NVIDIA_BASE_URL,
            model=NVIDIA_MODEL,
            temperature=0
        )

    # -------------------------------
    # SAFE JSON PARSER
    # -------------------------------
    def safe_json_parse(self, text):
        try:
            return json.loads(text)
        except:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise ValueError("Invalid JSON from LLM")

    # -------------------------------
    # 🔥 FIXED: BETTER ANALYSIS BUILDER
    # -------------------------------
    def _prepare_analysis(self, data):
        route = data.get("route")
        risk_output = data.get("risk_output", {})
        hcc_summary = data.get("hcc_summary", [])
        patient = data.get("patient")

        # -------------------------------
        # ✅ VALID (ML FLOW)
        # -------------------------------
        if route == "VALID":
            return risk_output.get("analysis", [])

        # -------------------------------
        # ✅ FLOW A (HCC PRESENT BUT WEAK DOCS)
        # -------------------------------
        elif route == "UNSUPPORTED_HCC":
    # ✅ USE REAL PIPELINE OUTPUT (VERY IMPORTANT)
            return risk_output.get("analysis", [])

            
        # -------------------------------
        # ✅ FLOW B (NO HCC)
        # -------------------------------
        elif route == "NO_HCC_PRESENT":
             return risk_output.get("analysis", [])

        return []

    # -------------------------------
    # MAIN RUN
    # -------------------------------
    def run(self, data):
        # 🔥 FIX: safe patient_id extraction
        patient_id = data.get("patient_id")

        if not patient_id:
            patient_obj = data.get("patient")
            if patient_obj:
                patient_id = getattr(patient_obj, "patient_id", "UNKNOWN")

        # 🔥 FIX: correct analysis building
        analysis = self._prepare_analysis(data)

        if not analysis:
            analysis = [{
                "status": "UNKNOWN",
                "risk_level": "LOW",
                "risk_score": 0,
                "reasoning": "No analysis data available"
            }]

        first_item = analysis[0]

        # =====================================================
        # ✅ CASE 1: VALID
        # =====================================================
        if first_item.get("status") == "VALID" and "hcc_code" not in first_item:

            formatted = f"""
Risk Level: {first_item.get("risk_level")}
Risk Score: {first_item.get("risk_score")}

Reasoning:
{first_item.get("reasoning")}

Citations:
{first_item.get('citations')}
"""

            prompt = f"""
You are a Clinical Audit Report Generator.

STRICT RULES:
- Use ONLY provided data
- Do NOT add medical knowledge
- Do NOT hallucinate
- Rephrase reasoning into clear human explanation
- ALWAYS include "disease" field
- If no disease → use "Overall Patient Risk"

-------------------------------------

Patient ID: {patient_id}

Analysis:
{formatted}

-------------------------------------

TASK:

Generate a professional but HUMAN-FRIENDLY clinical audit report.
Make the summary with three to four lines,explaining the risk score and risk level with the help of the formated risk score and risk level,dont provide on your own.
In citations dont just overall patient risk instead add two to three lines of reasoning for the citations, based on the reasoning provided in the analysis.
In risk assessment, provide the risk level and risk score for overall patient risk, based on the reasoning provided in the analysis.
Give recommendations also in the same way.
-------------------------------------

OUTPUT JSON:

{{
  "summary": "...",
  "risk_assessment": [
    {{
      "disease": "Overall Patient Risk",
      "risk_level": "...",
      "risk_score": 0.0
    }}
  ],
  "explanations": [
    {{
      "disease": "Overall Patient Risk",
      "text": "..."
    }}
  ],
  "recommendation": "...",
  "citations": [
    {{
      "disease": "Overall Patient Risk",
      "details": "ML Model Based Assessment"
    }}
  ]
}}

-------------------------------------

WRITING RULES:

SUMMARY:
- Say HCC is PRESENT
- Mention risk level clearly
- Add 1 more line describing overall condition (high/moderate concern)
-Write 3-4 lines

-------------------------------------

EXPLANATION (IMPORTANT):

- Write 3–4 lines
- Make it natural and human readable
- Explain using:
  • patient history
  • repeated visits
  • pattern over time
- Do NOT say "ML model computed"
- Do NOT be robotic

-------------------------------------

RECOMMENDATION:

- 3–4 clear actions
- Monitoring
- Follow-up
- Risk reassessment

-------------------------------------

FINAL RULES:
- No one-line answers
- No repetition
- No technical jargon
- Keep it human-friendly

ONLY JSON OUTPUT
START YOUR RESPONSE WITH {{ AND END WITH }}
"""

        # =====================================================
        # ✅ CASE 2: FLOW A
        # =====================================================
        elif "hcc_code" in str(first_item):

            formatted_analysis = ""
            for item in analysis:
                formatted_analysis += f"""
HCC Code: {item.get('hcc_code')}
Risk Level: {item.get('risk_level')}
Risk Score: {item.get('risk_score')}

Reasoning:
{item.get('reasoning')}
{item.get('citations')}
"""

            prompt = f"""
You are a Clinical Audit Report Generator.

Patient ID: {patient_id}

Analysis:
{formatted_analysis}

-------------------------------------

RULES:

- HCC is PRESENT
- Each item is a condition
- ALWAYS include "disease" field
- If no disease → use "Overall Patient Risk"

-------------------------------------

OUTPUT JSON:

{{
  "summary": "...",
  "risk_assessment": [...],
  "explanations": [...],
  "recommendation": "...",
  "citations": [...]
}}

-------------------------------------

EXPLANATION RULE:
- MUST mention:
  • disease (if available)
  • frequency or repetition (if available)
  • year (if available)
  • risk score (if available)

- DO NOT say:
  "no data", "no analysis", "no HCC" unless explicitly true

- Write like a real audit explanation:
  Explain WHY the condition is valid or unsupported

GOOD EXAMPLE:
"The patient's records in 2025 show repeated diagnosis of this condition with a frequency of 4. This consistent pattern across visits indicates that the condition is clinically relevant and not incidental. The associated risk score of 0.744 further supports a moderate level of concern, suggesting the need for monitoring."

BAD EXAMPLE:
"No data available. Risk is low."

CRITICAL:
- Output MUST be STRICT JSON
- NO markdown
- NO headings
- NO explanations outside JSON

START YOUR RESPONSE WITH {{ AND END WITH }}
"""
        # =====================================================
        # ✅ CASE 3: FLOW B
        # =====================================================
        else:

            formatted_analysis = ""
            for item in analysis:
                formatted_analysis += f"""
Risk Level: {item.get('risk_level')}
Risk Score: {item.get('risk_score')}

Reasoning:
{item.get('reasoning')}
"""

            prompt = f"""
You are a Clinical Audit Report Generator.

Patient ID: {patient_id}

Analysis:
{formatted_analysis}

-------------------------------------

RULES:
- ALWAYS include "disease" field
- If no disease → use "Overall Patient Risk"
- HCC is NOT PRESENT

-------------------------------------

OUTPUT JSON:

{{
  "summary": "...",
  "risk_assessment": [...],
  "explanations": [...],
  "recommendation": "...",
  "citations": [...]
}}

-------------------------------------

SUMMARY:
- Say NO HCC
- Describe overall risk

EXPLANATION:
- 2–3 lines
- Based on reasoning
- Human friendly

RECOMMENDATION:
- Monitoring
- Follow-up

CRITICAL:
- Output MUST be STRICT JSON
- NO markdown
- NO headings
- NO explanations outside JSON

START YOUR RESPONSE WITH {{ AND END WITH }}
"""
        # -------------------------------
        # CALL LLM
        # -------------------------------
        response = self.llm.invoke([HumanMessage(content=prompt)])

        raw_output = response.content.strip()

        print("\n[DEBUG] RAW LLM OUTPUT:\n", raw_output)

        parsed_output = self.safe_json_parse(raw_output)

        return {
            "final_report": parsed_output
        }