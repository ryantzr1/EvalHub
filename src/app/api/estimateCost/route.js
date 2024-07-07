import { NextResponse } from "next/server";

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

async function countTokensFromDataset(dataset, model) {
  console.log(dataset);
  const TOKENIZER_URL = "http://128.199.190.235:4321/api/tokenize-dataset";

  try {
    console.log(`Sending request to tokenizer API at ${TOKENIZER_URL}`);
    const response = await fetch(TOKENIZER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dataset, model }),
    });

    if (!response.ok) {
      console.error(`Error from tokenizer API: ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `Received response from tokenizer API: ${JSON.stringify(data)}`
    );
    return data.total_token_count;
  } catch (error) {
    console.error("Error in countTokensFromDataset:", error);
    throw error;
  }
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
    const body = await request.json();
    const dataset = body.dataset;
    const model = body.model;

    if (!dataset || !model) {
      console.error("Dataset or model not provided");
      return NextResponse.json(
        { error: "Dataset or model not provided" },
        { status: 400 }
      );
    }

    let modelCosts;
    try {
      modelCosts = await getModelCosts();
    } catch (error) {
      console.error("Error fetching model costs:", error);
      return NextResponse.json(
        { error: "Error fetching model costs: " + error.message },
        { status: 500 }
      );
    }

    if (!modelCosts[model]) {
      console.error("Invalid model specified:", model);
      return NextResponse.json(
        { error: "Invalid model specified" },
        { status: 400 }
      );
    }

    const totalTokens = await countTokensFromDataset(dataset, model);
    const totalCost = totalTokens * modelCosts[model].input_cost_per_token;

    const response = NextResponse.json({
      model,
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
