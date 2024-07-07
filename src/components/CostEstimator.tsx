"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ModelOptions = string[];

interface EstimateCostResponse {
  model: string;
  total_token_count: number;
  total_cost: number;
}

export default function CostEstimator() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetUrl, setDatasetUrl] = useState<string>("");
  const [model, setModel] = useState<string>("gpt-3.5-turbo");
  const [result, setResult] = useState<EstimateCostResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [modelOptions, setModelOptions] = useState<ModelOptions>([]);

  useEffect(() => {
    const fetchModelOptions = async () => {
      try {
        const response = await axios.get("/api/modelPrices");
        setModelOptions(Object.keys(response.data));
      } catch (error) {
        console.error("Error fetching model options:", error);
        setModelOptions([]);
      }
    };

    fetchModelOptions();
  }, []);

  const fetchDatasetRows = async (url: string): Promise<string[]> => {
    try {
      const response = await axios.get(url);
      return response.data.rows.map((item: any) => item.row.text);
    } catch (error) {
      throw new Error("Error fetching dataset rows: " + error.message);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setDatasetUrl(""); // Clear dataset URL if a file is selected
    }
  };

  const handleDatasetUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDatasetUrl(e.target.value);
    setFile(null); // Clear file if a dataset URL is entered
  };

  const handleModelChange = (value: string) => {
    setModel(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    } else if (datasetUrl) {
      try {
        const dataset = await fetchDatasetRows(datasetUrl);
        formData.append("huggingface_dataset", JSON.stringify(dataset));
      } catch (error) {
        setError("Error loading Hugging Face dataset: " + error.message);
        setLoading(false);
        return;
      }
    } else {
      setError("Please upload a file or enter a Hugging Face dataset URL.");
      setLoading(false);
      return;
    }
    formData.append("model", model);

    try {
      const response = await axios.post("/api/estimateCost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
    } catch (error: any) {
      setError(
        error.response?.data?.error ||
        "An error occurred while estimating the cost."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Upload Dataset File
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label
            htmlFor="datasetUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Enter Hugging Face Dataset URL
          </label>
          <input
            type="text"
            id="datasetUrl"
            value={datasetUrl}
            onChange={handleDatasetUrlChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="e.g., https://datasets-server.huggingface.co/rows?dataset=truthfulqa%2Ftruthful_qa&config=generation&split=validation&offset=0"
          />
        </div>
        <div>
          <label
            htmlFor="model"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Select Model
          </label>
          <Select onValueChange={handleModelChange} value={model}>
            <SelectTrigger className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 flex items-center justify-between px-4 py-2 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {model}
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? "Estimating..." : "Estimate Cost"}
        </button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {result && (
        <div className="mt-4 p-4 bg-green-100 rounded-md">
          <h3 className="font-semibold text-green-800">Estimation Result:</h3>
          <p>Model: {result.model}</p>
          <p>Total Tokens: {result.total_token_count}</p>
          <p>
            Estimated Cost: $
            {result.total_cost ? result.total_cost.toFixed(6) : "N/A"}
          </p>
        </div>
      )}
    </div>
  );
}
