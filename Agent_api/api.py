from fastapi import FastAPI
from pydantic import BaseModel

from app.graph.workflow import build_workflow

app = FastAPI()

# Load workflow once
workflow = build_workflow()


# -------------------------------
# Request Schema
# -------------------------------
class PatientRequest(BaseModel):
    patient_ids: list[str]


# -------------------------------
# Health Check
# -------------------------------
@app.get("/")
def home():
    return {"message": "Agentic HCC API is running 🚀"}


# -------------------------------
# Run Pipeline
# -------------------------------
@app.post("/run-pipeline")
def run_pipeline(request: PatientRequest):
    try:
        global workflow

        if workflow is None:
            print("🔥 Building workflow...")
            workflow = build_workflow()

        results = []

        for pid in request.patient_ids:
            print(f"🔹 Processing {pid}")

            state = {
                "patient_id": pid
            }

            result = workflow.invoke(state)

            results.append({
                "patient_id": pid,
                "output": result.get("final_output", {})
            })

        return {
            "status": "success",
            "data": results
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }