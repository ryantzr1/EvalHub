import { NextResponse } from "next/server";
// @ts-expect-error
import wasm from "tiktoken/lite/tiktoken_bg.wasm?module";
import model from "tiktoken/encoders/cl100k_base.json";
import { init, Tiktoken } from "tiktoken/lite/init";

export const config = { runtime: "edge" };

// Function to fetch model costs
async function fetchModelCosts() {
  const MODEL_COSTS_URL =
    "https://raw.githubusercontent.com/ryantzr1/EvalHub/main/src/lib/model_prices.json";

  const response = await fetch(MODEL_COSTS_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
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

function setCorsHeaders(response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function GET(request) {
  const response = NextResponse.json(
    { message: "GET request received" },
    { status: 200 }
  );
  return setCorsHeaders(response);
}

export async function POST(request) {
  try {
    // Initialize tiktoken with WASM
    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      model.bpe_ranks,
      model.special_tokens,
      model.pat_str
    );

    const formData = await request.formData();
    const file = formData.get("file");
    const huggingfaceDataset = formData.get("huggingface_dataset");
    const modelName = formData.get("model") || "gpt-4";

    let dataset;
    if (file) {
      const fileContent = await file.text();
      dataset = fileContent.split("\n");
    } else if (huggingfaceDataset) {
      try {
        dataset = JSON.parse(huggingfaceDataset);
      } catch (error) {
        return NextResponse.json(
          { error: "Error parsing Hugging Face dataset: " + error.message },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "No file or dataset provided" },
        { status: 400 }
      );
    }

    let modelCosts;
    try {
      modelCosts = await getModelCosts();
    } catch (error) {
      return NextResponse.json(
        { error: "Error fetching model costs: " + error.message },
        { status: 500 }
      );
    }

    if (!modelCosts[modelName]) {
      return NextResponse.json(
        { error: "Invalid model specified" },
        { status: 400 }
      );
    }

    let totalTokens = 0;
    for (const text of dataset) {
      totalTokens += encoding.encode(text).length;
    }

    const totalCost = totalTokens * modelCosts[modelName].input_cost_per_token;

    // Free the encoding when done
    encoding.free();

    const response = NextResponse.json({
      model: modelName,
      total_token_count: totalTokens,
      total_cost: totalCost,
    });
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error in POST handler:", error);
    const errorResponse = NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse);
  }
}

export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}
