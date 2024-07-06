import fetch from "node-fetch";

const MODEL_COSTS_URL =
  "https://raw.githubusercontent.com/ryantzr1/EvalHub/main/src/lib/model_prices.json";

export async function GET(request) {
  try {
    const response = await fetch(MODEL_COSTS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const modelPrices = await response.json();
    return new Response(JSON.stringify(modelPrices), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow CORS
      },
    });
  } catch (error) {
    console.error("Error fetching model prices:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load model prices." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Allow CORS
        },
      }
    );
  }
}
