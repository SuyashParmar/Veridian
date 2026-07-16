import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

class CounterfactualEngine:
    def __init__(self, model, engineer):
        self.model = model
        self.engineer = engineer

    def find_path_to_approval(self, raw_input: dict, steps: int = 10):
        """
        Heuristically finds what changes would lead to approval.
        Focuses on: loan_amnt, person_income, person_emp_length.
        """
        base_df = pd.DataFrame([raw_input])
        base_prob = self.model.predict_proba(self.engineer.process_pipeline(base_df))[:, 1][0]
        
        if base_prob <= 0.5:
            return {"message": "Already approved", "suggestion": None}

        recommendations = []
        
        # 1. Strategy: Reduce Loan Amount
        loan_step = raw_input['loan_amnt'] / steps
        modified_list_1 = []
        for i in range(1, steps + 1):
            modified = raw_input.copy()
            modified['loan_amnt'] = max(0, raw_input['loan_amnt'] - (loan_step * i))
            modified_list_1.append(modified)

        if modified_list_1:
            df_batch_1 = pd.DataFrame(modified_list_1)
            proc_batch_1 = self.engineer.process_pipeline(df_batch_1)
            probs_1 = self.model.predict_proba(proc_batch_1)[:, 1]
            for i, prob in enumerate(probs_1):
                if prob <= 0.5:
                    recommendations.append({
                        "feature": "Loan Amount",
                        "current": raw_input['loan_amnt'],
                        "suggested": modified_list_1[i]['loan_amnt'],
                        "improvement": f"Reduce loan by ${raw_input['loan_amnt'] - modified_list_1[i]['loan_amnt']:,.0f}",
                        "new_prob": float(prob)
                    })
                    break

        # 2. Strategy: Increase Income
        income_step = raw_input['person_income'] * 0.1 # 10% steps
        modified_list_2 = []
        for i in range(1, steps + 1):
            modified = raw_input.copy()
            modified['person_income'] = raw_input['person_income'] + (income_step * i)
            modified_list_2.append(modified)

        if modified_list_2:
            df_batch_2 = pd.DataFrame(modified_list_2)
            proc_batch_2 = self.engineer.process_pipeline(df_batch_2)
            probs_2 = self.model.predict_proba(proc_batch_2)[:, 1]
            for i, prob in enumerate(probs_2):
                if prob <= 0.5:
                    recommendations.append({
                        "feature": "Annual Income",
                        "current": raw_input['person_income'],
                        "suggested": modified_list_2[i]['person_income'],
                        "improvement": f"Increase income to ${modified_list_2[i]['person_income']:,.0f}",
                        "new_prob": float(prob)
                    })
                    break

        return {
            "current_prob": float(base_prob),
            "recommendations": recommendations,
            "can_be_approved": len(recommendations) > 0
        }

