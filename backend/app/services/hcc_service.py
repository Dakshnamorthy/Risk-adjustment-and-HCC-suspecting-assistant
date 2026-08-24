"""
HCC Service for mapping ICD-10 codes to HCC codes using the hccinfhir package.
"""
import re
import logging
from typing import Dict, Optional, Tuple

logger = logging.getLogger(__name__)

try:
    import hccinfhir
    HCCINFHIR_AVAILABLE = True
except ImportError as e:
    logger.warning(f"hccinfhir package not available: {e}")
    HCCINFHIR_AVAILABLE = False


class HCCService:
    """Service for mapping ICD-10 codes to HCC codes using hccinfhir."""
    
    def __init__(self):
        self.available = HCCINFHIR_AVAILABLE
        self._mapper = None
        if self.available and hasattr(hccinfhir, 'HCCInFHIR'):
            try:
                self._mapper = hccinfhir.HCCInFHIR()
            except Exception as e:
                logger.warning(f"Failed to initialize HCCInFHIR mapper: {e}")
    
    def normalize_icd10_code(self, icd10_code: str) -> str:
        """
        Normalize ICD-10 code format for hccinfhir compatibility.
        Remove dots, spaces, and ensure uppercase.
        """
        if not icd10_code:
            return ""
        
        # Remove dots, spaces, and convert to uppercase
        normalized = re.sub(r'[.\s]', '', str(icd10_code).strip().upper())
        return normalized
    
    def map_icd10_to_hcc(self, icd10_code: str, age: int = None, sex: str = None) -> Dict[str, Optional[str]]:
        """
        Map a single ICD-10 code to HCC using hccinfhir.

        Args:
            icd10_code: The ICD-10 code to map
            age: Patient age (optional, default 65)
            sex: Patient sex (optional, default M)

        Returns:
            Dictionary with:
            - hcc_code: The HCC code if mapped, None if unmapped
            - hcc_mapping_status: "MAPPED" or "UNMAPPED"
        """
        if not self.available:
            logger.warning("hccinfhir not available, cannot map ICD-10 to HCC")
            return {"hcc_code": None, "hcc_mapping_status": "UNMAPPED"}

        if not icd10_code:
            return {"hcc_code": None, "hcc_mapping_status": "UNMAPPED"}

        try:
            # Normalize the ICD-10 code
            normalized_code = self.normalize_icd10_code(icd10_code)

            if not normalized_code:
                return {"hcc_code": None, "hcc_mapping_status": "UNMAPPED"}

            # Primary Method: Use hccinfhir.HCCInFHIR().calculate_from_diagnosis
            if self._mapper is not None:
                try:
                    safe_age = int(age) if age is not None and str(age).isdigit() else 65
                    safe_sex = str(sex).strip().upper() if sex and str(sex).strip().upper() in ["M", "F"] else "M"
                    res = self._mapper.calculate_from_diagnosis([normalized_code], age=safe_age, sex=safe_sex)
                    if res and hasattr(res, 'hcc_list') and res.hcc_list:
                        raw_hcc = str(res.hcc_list[0]).strip()
                        hcc_code = f"HCC{raw_hcc}" if not raw_hcc.startswith("HCC") else raw_hcc
                        return {"hcc_code": hcc_code, "hcc_mapping_status": "MAPPED"}
                except Exception as ex:
                    logger.debug(f"HCCInFHIR calculate_from_diagnosis failed for {normalized_code}: {ex}")

            # Fallback Method 1: Direct function call with demographics
            if hasattr(hccinfhir, 'map_icd10_to_hcc'):
                try:
                    if age is not None and sex is not None:
                        hcc_result = hccinfhir.map_icd10_to_hcc(normalized_code, age=age, sex=sex)
                    else:
                        hcc_result = hccinfhir.map_icd10_to_hcc(normalized_code)
                except TypeError:
                    hcc_result = hccinfhir.map_icd10_to_hcc(normalized_code)

                if hcc_result:
                    hcc_code = str(hcc_result).strip()
                    if hcc_code and hcc_code != 'None':
                        hcc_code = f"HCC{hcc_code}" if not hcc_code.startswith("HCC") else hcc_code
                        return {"hcc_code": hcc_code, "hcc_mapping_status": "MAPPED"}

            return {"hcc_code": None, "hcc_mapping_status": "UNMAPPED"}

        except Exception as e:
            logger.error(f"Error mapping ICD-10 code {icd10_code} to HCC: {e}")
            return {"hcc_code": None, "hcc_mapping_status": "UNMAPPED"}
    
    def batch_map_icd10_to_hcc(self, icd10_codes: list, ages: list = None, sexes: list = None) -> Dict[str, Dict[str, Optional[str]]]:
            """
            Map multiple ICD-10 codes to HCC codes.

            Args:
                icd10_codes: List of ICD-10 codes to map
                ages: Optional list of ages corresponding to each ICD-10 code
                sexes: Optional list of sexes corresponding to each ICD-10 code

            Returns:
                Dictionary mapping original ICD-10 codes to result dictionaries
            """
            results = {}

            for i, icd10_code in enumerate(icd10_codes):
                age = ages[i] if ages and i < len(ages) else None
                sex = sexes[i] if sexes and i < len(sexes) else None

                result = self.map_icd10_to_hcc(icd10_code, age=age, sex=sex)
                results[icd10_code] = result

            return results


# Create a singleton instance
hcc_service = HCCService()