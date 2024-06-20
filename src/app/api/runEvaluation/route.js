import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import axios from "axios";

const execPromise = promisify(exec);

export async function POST(request) {
  const { apiEndpoint, temperature, metrics } = await request.json();

  try {
    console.log("Starting dataset loading process...");

    // Run the Python script to load the dataset
    const scriptPath = path.resolve("src/utils/load_gsm8k_dataset.py");
    const { stdout, stderr } = await execPromise(`python3 ${scriptPath}`);
    console.log("Python script stdout:", stdout);
    console.error("Python script stderr:", stderr);

    console.log("Dataset loaded successfully");

    // Read the dataset from the generated JSON file
    const dataPath = path.resolve("src/utils/gsm8k_dataset.json");
    const datasetRaw = await fs.readFile(dataPath, "utf-8");
    const dataset = JSON.parse(datasetRaw);

    const results = [];
    const testDataset = dataset["test"].slice(0, 10); // Use the first 10 rows for testing

    for (const data of testDataset) {
      const response = await axios.post(
        apiEndpoint,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant. Always provide the final numerical answer in the format 'Final Answer: #### <number>'.",
            },
            { role: "user", content: `Question: ${data.question}\nAnswer:` },
          ],
          temperature: parseFloat(temperature),
          max_tokens: 1000,
          stop: ["Question:", "</s>"],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const model_output = response.data.choices[0].message.content.trim();
      console.log(model_output);
      results.push({
        input: data.question,
        expected_output: data.answer,
        model_output,
      });
    }

    // Save the model outputs to a JSON file
    const modelOutputsPath = path.resolve("src/utils/gsm8k_model_outputs.json");
    await fs.writeFile(modelOutputsPath, JSON.stringify(results), "utf-8");

    // Run the Python script to evaluate the results
    const evalScriptPath = path.resolve("src/utils/evaluate_gsm8k_results.py");
    const { stdout: evalStdout, stderr: evalStderr } = await execPromise(
      `python3 ${evalScriptPath} ${modelOutputsPath} ${temperature}`
    );
    console.log("Evaluation script stdout:", evalStdout);
    console.error("Evaluation script stderr:", evalStderr);

    // Read the evaluation results from the generated JSON file
    const evalDataPath = path.resolve(
      "src/utils/gsm8k_results_with_scores.json"
    );
    const evalResultsRaw = await fs.readFile(evalDataPath, "utf-8");
    const evalResults = JSON.parse(evalResultsRaw);

    // Calculate total score
    const totalQuestions = evalResults.length;
    const correctAnswers = evalResults.filter(
      (result) => result.score === 1.0
    ).length;
    const totalAccuracy = (correctAnswers / totalQuestions) * 100;

    return NextResponse.json({ result: evalResults, totalAccuracy });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
