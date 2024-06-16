import json
from datasets import load_dataset # type: ignore

def load_gsm8k_dataset():
    try:
        dataset = load_dataset("openai/gsm8k", "main")
        data = {
            "train": [entry for entry in dataset["train"]],
            "test": [entry for entry in dataset["test"]]
        }
        with open('src/utils/gsm8k_dataset.json', 'w') as f:
            json.dump(data, f)
        print("Dataset loaded and saved successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    load_gsm8k_dataset()
