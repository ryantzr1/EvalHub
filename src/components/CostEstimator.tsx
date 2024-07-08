"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Link } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setDatasetUrl("");
    }
  };

  const handleDatasetUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatasetUrl(e.target.value);
    setFile(null);
  };

  const handleModelChange = (value: string) => {
    setModel(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    let dataset: any[] = [];
    if (file) {
      try {
        const fileContent = await file.text();
        try {
          dataset = JSON.parse(fileContent);
        } catch (jsonError) {
          dataset = fileContent.split('\n').filter(line => line.trim() !== '').map(line => ({ row: { text: line } }));
        }
      } catch (e) {
        setError("Error reading file.");
        setLoading(false);
        return;
      }
    } else if (datasetUrl) {
      try {
        const response = await axios.get(datasetUrl);
        dataset = response.data.rows;
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
    const payload = { dataset, model };

    try {
      const response = await axios.post("/api/estimateCost", payload, {
        headers: { "Content-Type": "application/json" },
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Upload Dataset File</Label>
            <div className="flex it ems-center space-x-2">
              <Input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="flex-grow"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datasetUrl">Hugging Face Dataset URL</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                id="datasetUrl"
                value={datasetUrl}
                onChange={handleDatasetUrlChange}
                placeholder="e.g., https://datasets-server.huggingface.co/rows?dataset=ucinlp%2Fdrop&config=default&split=train&offset=0&length=100"
                className="flex-grow"
              />
              <Button type="button" variant="outline" size="icon">
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Select Model</Label>
            <Select onValueChange={handleModelChange} value={model}>
              <SelectTrigger id="model" className="w-full">
                <SelectValue placeholder="Select a model" />
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Estimating...
              </>
            ) : (
              "Estimate Cost"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch">
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {result && (
          <Alert variant="default" className="mt-4">
            <AlertTitle>Estimation Result</AlertTitle>
            <AlertDescription>
              <p>Model: {result.model}</p>
              <p>Total Tokens: {result.total_token_count.toLocaleString()}</p>
              <p>
                Estimated Cost: $
                {result.total_cost ? result.total_cost.toFixed(6) : "N/A"}
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}