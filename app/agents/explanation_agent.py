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
    # HELPER: Flatten citations
    # -------------------------------
    def _flatten_citations(self, citations):
        flat = []
        for c in citations:
            if isinstance(c, list):
                flat.extend(c)
            else:
                flat.append(str(c))
        return flat

    # -------------------------------
    # FORMAT FLOW A (HCC)
    # -------------------------------
    def _format_analysis(self, analysis):
        formatted = []

        for item in analysis:
            citations = self._flatten_citations(item.get("citations", []))
            citations_str = "\n".join(citations) if citations else "No evidence available"

            block = f"""
HCC Code: {item.get('hcc_code')}
Status: {item.get('status')}
Risk Level: {item.get('risk_level')}
Risk Score: {item.get('risk_score')}

Reasoning:
{item.get('reasoning')}

[CITATION_BLOCK]
{citations_str}
"""
            formatted.append(block)

        return "\n".join(formatted)

    # -------------------------------
    # FORMAT FLOW B (NO HCC)
    # -------------------------------
    def _format_risk(self, data):
        return f"""
Risk Level: {data.get("risk_level")}
Risk Score: {data.get("risk_score")}

Key Factors:
{data.get("risk_factors")}
"""


    def safe_json_parse(self, text):
        try:
            return json.loads(text)
        except:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise ValueError("Invalid JSON from LLM")
    # -------------------------------
    # MAIN RUN METHOD
    # -------------------------------
    def run(self, data):
        patient_id = data.get("patient_id")

        # =========================================
        # FLOW A → HCC PRESENT
        # =========================================
        if "analysis" in data and "hcc_code" in str(data["analysis"][0]):

            formatted_analysis = self._format_analysis(data["analysis"])

            prompt = f"""
You are a Clinical Audit Report Generator.

STRICT RULES:
- Use ONLY the provided data
- Do NOT hallucinate
- Do NOT explain diseases medically
- Use reasoning exactly as given (rephrase only)
- HCC = Hierarchical Condition Category (NOT cancer)

-------------------------------------

Patient ID: {patient_id}

Analysis:
{formatted_analysis}

-------------------------------------

LOGIC:

- HCC is PRESENT
- Each item represents an HCC-backed condition
- Use "HCC-based Explanation" (NOT condition-wise)

-------------------------------------

Generate output in EXACT format:

**Clinical Audit Report**

1. Overall Summary
- Clearly state HCC is PRESENT
- Mention number of HCC conditions

-------------------------------------

2. Risk Assessment

List ALL items:

Format:
- <HCC Code / Disease> → <Risk Level> (<Risk Score>)

(MUST include real values)

-------------------------------------

3. HCC-based Explanation

For EACH item:

- Use its reasoning
- Rephrase into simple human language
- Make it slightly descriptive (2–3 lines max)
- DO NOT repeat same sentence
- DO NOT explain disease medically

Example:
"This risk is based on how frequently the diagnosis appears, how recent it is, and how often the patient had related medical encounters."

-------------------------------------

4. Final Recommendation

- Practical and slightly detailed
- Mention monitoring, follow-up, or review

-------------------------------------

5. Citations

STRICT FORMAT:

- <HCC Code / Disease>
  • <Citation 1>
  • <Citation 2 if exists>

RULES:
- No empty bullets
- No mixing with explanation
- Keep clean

-------------------------------------

FINAL RULES:
- No empty sections
- No placeholders
- No repetition
- Clean formatting
- Keep language simple (non-technical)
- Slightly descriptive (not one-liners)

-------------------------------------

OUTPUT FORMAT (STRICT JSON):

Return ONLY valid JSON:

{{
  "summary": "...",
  "risk_assessment": [
    {{
      "disease": "...",
      "risk_level": "...",
      "risk_score": 0.0
    }}
  ],
  "explanations": [
    {{
      "disease": "...",
      "text": "..."
    }}
  ],
  "recommendation": "...",
  "citations": [
    {{
      "disease": "...",
      "details": "..."
    }}
  ]
}}

NO markdown
NO extra text
ONLY JSON
"""

        # =========================================
        # FLOW B → NO HCC PRESENT
        # =========================================
        else:

            formatted_analysis = self._format_analysis(data["analysis"])
            prompt = f"""
You are a Clinical Audit Report Generator.

STRICT RULES:
- Use ONLY the provided data
- Do NOT hallucinate or add medical knowledge
- Do NOT explain diseases medically
- Use reasoning EXACTLY as given (only rephrase)
- Output MUST be valid JSON only

-------------------------------------

Patient ID: {patient_id}

Analysis:
{formatted_analysis}

-------------------------------------

TASK:

Generate a structured clinical report that is:
- Clear
- Human-readable
- Slightly descriptive (not robotic)
- Easy for a non-medical person to understand

-------------------------------------

OUTPUT FORMAT (STRICT JSON ONLY):

{{
  "summary": "...",
  "risk_assessment": [...],
  "explanations": [...],
  "recommendation": "...",
  "citations": [...]
}}

-------------------------------------

SECTION RULES:

1. SUMMARY
- Clearly state if HCC is present or NOT
- Add 1–2 lines describing overall risk pattern (e.g., mixed low/medium risk)

-------------------------------------

2. RISK ASSESSMENT
For EACH item:

Format:
- disease
- risk_level
- risk_score

RULES:
- Use exact values from input
- Keep concise
- Do NOT add explanation here

-------------------------------------

3. EXPLANATIONS (MOST IMPORTANT)

For EACH item:

- Write 2–3 lines (NOT 1 line)
- Rephrase the provided reasoning
- Explain WHY risk exists using:
  - frequency
  - encounters
  - recency
  - patterns (only if present in reasoning)

STRICT:
- Do NOT explain disease medically
- Do NOT repeat same sentence structure
- Vary wording naturally
- Make it readable for common users

GOOD EXAMPLE:
"This condition shows a moderate risk level because the patient’s historical records and encounter frequency indicate recurring patterns that require attention."

BAD EXAMPLE (DO NOT DO):
"Risk computed using hybrid model..."

-------------------------------------

4. RECOMMENDATION

- Write 2–3 short practical suggestions
- Keep it general (monitoring, follow-up, evaluation)
- Human-friendly tone

-------------------------------------

5. CITATIONS

For EACH item:

Format:
- disease
- details (clean: Year | ICD)

RULES:
- Extract from input only
- No formatting errors
- No missing entries

-------------------------------------

FINAL RULES:

- No empty fields
- No placeholders
- No repeated sentences
- No markdown
- No extra text
- ONLY JSON output
"""
        response = self.llm.invoke([HumanMessage(content=prompt)])

        raw_output = response.content.strip()

        print("\n[DEBUG] RAW LLM OUTPUT:\n", raw_output)

        parsed_output = self.safe_json_parse(raw_output)

        return {
            "final_report": parsed_output
        }