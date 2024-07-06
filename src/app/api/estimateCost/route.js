import { NextResponse } from "next/server";
import tiktoken from "tiktoken";

export const revalidate = 0;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const huggingfaceDataset = formData.get("huggingface_dataset");
    const model = formData.get("model") || "gpt-3.5-turbo";

    let dataset;
    if (file) {
      const fileContent = await file.text();
      dataset = fileContent.split("\n").filter((line) => line.trim() !== ""); // Ensure no empty lines
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

    // Fetch model costs
    let modelCosts;
    try {
      const MODEL_COSTS_URL =
        "https://raw.githubusercontent.com/ryantzr1/EvalHub/main/src/lib/model_prices.json";
      const response = await fetch(MODEL_COSTS_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      modelCosts = await response.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Error fetching model costs: " + error.message },
        { status: 500 }
      );
    }

    if (!modelCosts[model]) {
      return NextResponse.json(
        { error: "Invalid model specified" },
        { status: 400 }
      );
    }

    const encoder = tiktoken.encoding_for_model(model);

    let totalTokens = 0;
    for (const text of dataset) {
      totalTokens += encoder.encode(text).length;
    }

    const totalCost = totalTokens * modelCosts[model].input_cost_per_token;

    const response = NextResponse.json({
      model,
      total_token_count: totalTokens,
      total_cost: totalCost,
    });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return response;
  } catch (error) {
    console.error("Error in POST handler:", error);
    const errorResponse = NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
    );
    errorResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return errorResponse;
  }
}

export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
