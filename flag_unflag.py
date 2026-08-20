import pandas as pd
# ============================================================
# STEP 2: LOAD THE DATASET
# ============================================================

# Load the structured HCC dataset from the same folder
df = pd.read_csv(r"D:\CTS_ML\final_hcc_mapped_dataset.csv")

# Display basic dataset information
print("Dataset loaded successfully")
print("Number of rows:", len(df))
print("Number of columns:", len(df.columns))
# ============================================================
# STEP 3: CHECK HCC MAPPING STATUS
# ============================================================

# Display the mapping status available in the dataset
print("\nHCC Mapping Status:")
print(df["HCC_Mapping_Status"].value_counts())
# ============================================================
# STEP 4: DEFINE REQUIRED PATIENT INPUT FIELDS
# ============================================================

# These are the structured fields that should be available
# when a patient record is uploaded.
#
# Derived fields such as Calculated_HCC_Codes,
# Calculated_Risk_Score and HCC_Mapping_Status are NOT
# included because our system should calculate/check them.

required_fields = [
    "Age",
    "Sex",
    "Year",
    "Number_of_Encounters",
    "Number_of_Diagnoses",
    "Chronic_Condition_Count",
    "Unique_ICD10_Count",
    "HCC_Category_Count",
    "Repeated_Diagnosis_Count",
    "Recent_Encounter_Count",
    "Specialist_Encounter_Count",
    "Hospitalization_History",
    "Encounter_Type",
    "Claim_Frequency",
    "Disease_Description",
    "Diagnosis_Frequency",
    "Diagnosis_Recency_Days",
    "Provider_Count",
    "Claim_Count",
    "ICD10_Code",
    "ICD10_Code_List"
]

print("\nRequired input fields:")
for field in required_fields:
    print("-", field)
    # ============================================================
# STEP 5: CHECK INPUT DATA COMPLETENESS
# ============================================================

# Count missing values in all required input fields
missing_counts = df[required_fields].isna().sum()

print("\nMissing values in required fields:")
print(missing_counts)
# ============================================================
# STEP 6: CREATE ICD-10 → HCC MAPPING LOOKUP
# ============================================================

# Create a lookup table from the existing structured dataset.
#
# The key is ICD10_Code.
# The value is the HCC mapping status associated with that code.

icd10_mapping = (
    df[["ICD10_Code", "HCC_Mapping_Status", "HCC_Mapping_Reason"]]
    .drop_duplicates(subset=["ICD10_Code"])
    .set_index("ICD10_Code")
    .to_dict("index")
)

print("\nNumber of ICD-10 codes in mapping lookup:",
      len(icd10_mapping))
# ============================================================
# STEP 7: CHECK PATIENT INPUT COMPLETENESS
# ============================================================

def check_missing_fields(patient):

    missing_fields = []

    # Check every required field
    for field in required_fields:

        # Field doesn't exist
        if field not in patient:
            missing_fields.append(field)

        # Field exists but contains no value
        elif pd.isna(patient[field]) or str(patient[field]).strip() == "":
            missing_fields.append(field)

    return missing_fields
# ============================================================
# STEP 8: FINAL FLAGGED / UNFLAGGED RULE
# ============================================================

def predict_flag_status(patient):

    # --------------------------------------------------------
    # CHECK 1: DOCUMENTATION / INPUT COMPLETENESS
    # --------------------------------------------------------

    missing_fields = check_missing_fields(patient)

    # If any required input field is missing,
    # immediately send the patient for review.
    if missing_fields:

        return {
            "status": "FLAGGED",
            "reason": "Incomplete patient information",
            "missing_fields": missing_fields,
            "hcc_mapping_status": None,
            "hcc_mapping_reason": None
        }

    # --------------------------------------------------------
    # CHECK 2: HCC MAPPING
    # --------------------------------------------------------

    # Get the patient's ICD-10 code
    icd10_code = str(patient["ICD10_Code"]).strip()

    # Check whether this ICD-10 code exists in our mapping
    if icd10_code not in icd10_mapping:

        return {
            "status": "FLAGGED",
            "reason": "ICD-10 code not found in HCC mapping",
            "missing_fields": [],
            "hcc_mapping_status": None,
            "hcc_mapping_reason": "Unknown ICD-10 code"
        }

    # Get the mapping information
    mapping_info = icd10_mapping[icd10_code]

    mapping_status = mapping_info["HCC_Mapping_Status"]
    mapping_reason = mapping_info["HCC_Mapping_Reason"]

    # --------------------------------------------------------
    # FINAL DECISION
    # --------------------------------------------------------

    if mapping_status == "MAPPED":

        return {
            "status": "UNFLAGGED",
            "reason": "Required information complete and ICD-10 mapped to HCC",
            "missing_fields": [],
            "hcc_mapping_status": mapping_status,
            "hcc_mapping_reason": mapping_reason
        }

    else:

        return {
            "status": "FLAGGED",
            "reason": "HCC mapping requires review",
            "missing_fields": [],
            "hcc_mapping_status": mapping_status,
            "hcc_mapping_reason": mapping_reason
        }
    # ============================================================
# STEP 9: TEST AN EXISTING PATIENT
# ============================================================

# Take the first patient from the dataset
test_patient = df.iloc[0].to_dict()

# Run the rule-based prediction
result = predict_flag_status(test_patient)

# Display the result
print("\nExisting Patient Test:")
print(result)
# ============================================================
# STEP 10: TEST A MAPPED PATIENT
# ============================================================

# Select one patient whose ICD-10 code is successfully mapped
mapped_patient = (
    df[df["HCC_Mapping_Status"] == "MAPPED"]
    .iloc[0]
    .to_dict()
)

# Predict Flagged / Unflagged
mapped_result = predict_flag_status(mapped_patient)

print("\nMAPPED Patient:")
print(mapped_result)
# ============================================================
# STEP 11: TEST A PATIENT WITHOUT HCC MAPPING
# ============================================================

# Select one patient whose ICD-10 code has no payment HCC mapping
no_mapping_patient = (
    df[df["HCC_Mapping_Status"] == "NO_HCC_MAPPING"]
    .iloc[0]
    .to_dict()
)

# Predict Flagged / Unflagged
no_mapping_result = predict_flag_status(no_mapping_patient)

print("\nNO HCC MAPPING Patient:")
print(no_mapping_result)
# ============================================================
# STEP 12: TEST INCOMPLETE NEW PATIENT
# ============================================================

# Create a patient record with one required field missing.
new_incomplete_patient = {
    "Age": 70,
    "Sex": "M",
    "Year": 2026,
    "Number_of_Encounters": 5,
    "Number_of_Diagnoses": 3,
    "Chronic_Condition_Count": 2,
    "Unique_ICD10_Count": 3,
    "HCC_Category_Count": 1,
    "Repeated_Diagnosis_Count": 1,
    "Recent_Encounter_Count": 2,
    "Specialist_Encounter_Count": 1,
    "Hospitalization_History": 0,
    "Encounter_Type": "Outpatient",
    "Claim_Frequency": 4,

    # Disease_Description is intentionally missing

    "Diagnosis_Frequency": 3,
    "Diagnosis_Recency_Days": 30,
    "Provider_Count": 2,
    "Claim_Count": 5,
    "ICD10_Code": "M4631",
    "ICD10_Code_List": "M4631"
}

# Predict the status
incomplete_result = predict_flag_status(
    new_incomplete_patient
)

print("\nIncomplete New Patient:")
print(incomplete_result)
# ============================================================
# STEP 13: TEST COMPLETE NEW PATIENT
# ============================================================

# Add the missing disease description
new_complete_patient = new_incomplete_patient.copy()

new_complete_patient["Disease_Description"] = (
    "Bone/Joint/Muscle condition"
)

# Predict the status
complete_result = predict_flag_status(
    new_complete_patient
)

print("\nComplete New Patient:")
print(complete_result)