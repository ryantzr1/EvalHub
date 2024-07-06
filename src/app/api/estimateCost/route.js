import { NextResponse } from "next/server";
import tiktoken from "tiktoken";
import fetch from "node-fetch";
import path from "path";
import { promises as fs } from "fs";

// Function to fetch model costs from the JSON file
const fetchModelCosts = async () => {
  const filePath = path.resolve("src/lib/model_prices.json");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading model prices file:", error);
    throw new Error("Failed to load model prices.");
  }
};

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const huggingfaceDataset = formData.get("huggingface_dataset");
  const model = formData.get("model") || "gpt-3.5-turbo";

  let dataset;
  if (file) {
    const fileContent = await file.text();
    dataset = fileContent.split("\n");
  } else if (huggingfaceDataset) {
    try {
      const response = await fetch(huggingfaceDataset);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      dataset = jsonData.map((item) => item.text);
    } catch (error) {
      return NextResponse.json(
        { error: "Error loading Hugging Face dataset: " + error.message },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "No file or dataset provided" },
      { status: 400 }
    );
  }

  // Fetch real-time model costs
  let modelCosts;
  try {
    modelCosts = await fetchModelCosts();
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching model costs: " + error.message },
      { status: 500 }
    );
  }

  const encoder = tiktoken.encoding_for_model(model);

  let totalTokens = 0;
  for (const text of dataset) {
    totalTokens += encoder.encode(text).length;
  }

  const modelCost = modelCosts[model];
  const totalCost = modelCost
    ? totalTokens * modelCost.input_cost_per_token
    : 0;

  return NextResponse.json({
    model,
    total_token_count: totalTokens,
    total_cost: totalCost,
  });
}
