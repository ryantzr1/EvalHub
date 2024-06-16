import json
import re
import evaluate

def extract_final_answer(text):
    # Try strict match regex pattern first
    strict_match = re.search(r'Final Answer: #### (\-?[0-9\.,]+)', text)
    if strict_match:
        return strict_match.group(1).replace(',', '')  # Remove commas from the strict match
    
    # If strict match fails, apply the flexible extract regex pattern
    flexible_matches = re.findall(r'-?\d+(?:,\d{3})*(?:\.\d+)?', text)
    if flexible_matches:
        return flexible_matches[-1].replace(',', '')  # Return the last matched number and remove commas
    
    # If both patterns fail, return an empty string
    return ""

def evaluate_gsm8k_results():
    try:
        # Load the model outputs and expected outputs from the JSON file
        with open('src/utils/gsm8k_model_outputs.json', 'r') as f:
            data = json.load(f)
        
        # Initialize the evaluator
        exact_match = evaluate.load("exact_match")
        
        results = []
        correct_count = 0
        
        for entry in data:
            question = entry["input"]
            expected_answer = entry["expected_output"]
            model_output = entry["model_output"]
            
            # Extract the final numerical answer from the expected and model outputs
            expected_answer_final = extract_final_answer(expected_answer)
            model_output_final = extract_final_answer(model_output)
            
            # Log the extracted answers for debugging
            print(f"Question: {question}")
            print(f"Expected Answer: {expected_answer}")
            print(f"Expected Answer (final): {expected_answer_final}")
            print(f"Model Output: {model_output}")
            print(f"Model Output (final): {model_output_final}")
            
            # Ensure that the extracted answers are not None
            if expected_answer_final is None:
                expected_answer_final = ""
            if model_output_final is None:
                model_output_final = ""
            
            # Compute the exact match score
            score = exact_match.compute(predictions=[model_output_final], references=[expected_answer_final])
            
            # Check if the model's output matches the expected answer
            if score["exact_match"] == 1.0:
                correct_count += 1
            
            results.append({
                "input": question,
                "expected_output": expected_answer,
                "model_output": model_output,
                "score": score["exact_match"]
            })
        
        # Save the results with scores to a new JSON file
        with open('src/utils/gsm8k_results_with_scores.json', 'w') as f:
            json.dump(results, f)
        
        print("Results evaluated and saved successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    evaluate_gsm8k_results()
