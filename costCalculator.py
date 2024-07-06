# import tiktoken
# from typing import Dict, List, Tuple

# class TokenizerCostEstimator:
#     def __init__(self):
#         self.model_costs = {
#             "gpt-3.5-turbo": 0.002 / 1000,  # $0.002 per 1K tokens
#             "gpt-4": 0.06 / 1000,  # $0.06 per 1K tokens
#             "text-davinci-002": 0.02 / 1000,  # $0.02 per 1K tokens
#         }
#         self.encoders = {
#             "gpt-3.5-turbo": tiktoken.encoding_for_model("gpt-3.5-turbo"),
#             "gpt-4": tiktoken.encoding_for_model("gpt-4"),
#             "text-davinci-002": tiktoken.encoding_for_model("text-davinci-002"),
#         }

#     def estimate_cost(self, text: str, model: str) -> Dict[str, float]:
#         if model not in self.encoders:
#             raise ValueError(f"Model {model} not supported")

#         encoder = self.encoders[model]
#         tokens = encoder.encode(text)
#         token_count = len(tokens)
#         cost = token_count * self.model_costs[model]

#         return {
#             "model": model,
#             "token_count": token_count,
#             "cost": round(cost, 6)
#         }

#     def compare_costs(self, text: str) -> List[Dict[str, float]]:
#         return [self.estimate_cost(text, model) for model in self.model_costs.keys()]

#     def estimate_dataset_cost(self, dataset: List[str], model: str) -> Dict[str, float]:
#         total_tokens = sum(len(self.encoders[model].encode(text)) for text in dataset)
#         total_cost = total_tokens * self.model_costs[model]

#         return {
#             "model": model,
#             "total_token_count": total_tokens,
#             "total_cost": round(total_cost, 6)
#         }

#     def find_optimal_chunking(self, text: str, model: str, max_tokens: int) -> Tuple[List[str], float]:
#         encoder = self.encoders[model]
#         tokens = encoder.encode(text)
#         chunks = []
#         current_chunk = []
#         current_chunk_tokens = 0

#         for token in tokens:
#             if current_chunk_tokens + 1 > max_tokens:
#                 chunks.append(encoder.decode(current_chunk))
#                 current_chunk = []
#                 current_chunk_tokens = 0
#             current_chunk.append(token)
#             current_chunk_tokens += 1

#         if current_chunk:
#             chunks.append(encoder.decode(current_chunk))

#         total_cost = len(tokens) * self.model_costs[model]
#         return chunks, round(total_cost, 6)

# # Usage example
# estimator = TokenizerCostEstimator()

# # Estimate cost for a single text
# text = "This is a sample text for tokenization cost estimation."
# # print(estimator.estimate_cost(text, "gpt-3.5-turbo"))

# # Compare costs across models
# # print(estimator.compare_costs(text))

# # Estimate cost for a dataset
# dataset = [
#     "This is the first document in our dataset.",
#     "Here's another document with different content.",
#     "And a third one to make our dataset more diverse."
# ]
# print(estimator.estimate_dataset_cost(dataset, "gpt-4"))

# # Find optimal chunking
# # long_text = "This is a very long text that needs to be broken into smaller chunks..." * 100
# # chunks, cost = estimator.find_optimal_chunking(long_text, "gpt-3.5-turbo", 1000)
# # print(f"Number of chunks: {len(chunks)}, Total cost: ${cost}")