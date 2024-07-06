import path from "path";
import { promises as fs } from "fs";

export async function GET(request) {
  const filePath = path.resolve("src/lib/model_prices.json");

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const modelPrices = JSON.parse(fileContent);
    return new Response(JSON.stringify(modelPrices), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error reading model prices file:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load model prices." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
