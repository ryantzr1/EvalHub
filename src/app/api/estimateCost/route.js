import { NextResponse } from "next/server";
import tiktoken from "tiktoken";
import fetch from "node-fetch";

// Function to fetch model costs
async function fetchModelCosts() {
  try {
    const MODEL_COSTS_URL =
      "https://raw.githubusercontent.com/ryantzr1/EvalHub/main/src/lib/model_prices.json";

    const response = await fetch(MODEL_COSTS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching model costs:", error);
    throw new Error("Failed to load model costs.");
  }
}

// Use a simple in-memory cache to avoid fetching the costs for every request
let cachedModelCosts = null;
let lastFetchTime = 0;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

async function getModelCosts() {
  const now = Date.now();
  if (!cachedModelCosts || now - lastFetchTime > CACHE_TTL) {
    cachedModelCosts = await fetchModelCosts();
    lastFetchTime = now;
  }
  return cachedModelCosts;
}

const setCorsHeaders = (response) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

export async function GET(request) {
  const response = NextResponse.json(
    { message: "GET request received" },
    { status: 200 }
  );
  return setCorsHeaders(response);
}

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const huggingfaceDataset = formData.get("huggingface_dataset");
  const model = formData.get("model") || "gpt-4";

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
      const errorResponse = NextResponse.json(
        { error: "Error loading Hugging Face dataset: " + error.message },
        { status: 400 }
      );
      return setCorsHeaders(errorResponse);
    }
  } else {
    const errorResponse = NextResponse.json(
      { error: "No file or dataset provided" },
      { status: 400 }
    );
    return setCorsHeaders(errorResponse);
  }

  let modelCosts;
  try {
    modelCosts = await getModelCosts();
  } catch (error) {
    const errorResponse = NextResponse.json(
      { error: "Error fetching model costs: " + error.message },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }

  if (!modelCosts[model]) {
    const errorResponse = NextResponse.json(
      { error: "Invalid model specified" },
      { status: 400 }
    );
    return setCorsHeaders(errorResponse);
  }

  const encoder = tiktoken.encoding_for_model(model);

  let totalTokens = 0;
  for (const text of dataset) {
    totalTokens += encoder.encode(text).length;
  }

  const totalCost = totalTokens * modelCosts[model].input_cost_per_token;

  const successResponse = NextResponse.json({
    model,
    total_token_count: totalTokens,
    total_cost: totalCost,
  });
  return setCorsHeaders(successResponse);
}
