// src/components/component.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { taskCategories } from "@/data/taskCategories"; // Adjust the import path as needed


export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<any[]>([]);
  const [evaluationResults, setEvaluationResults] = useState<any[]>([]);
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [temperature, setTemperature] = useState(0.0);
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get("/api/getMetrics");
        setMetrics(response.data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
    fetchMetrics();
  }, []);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("supabase_session") || "null");
    if (session) {
      setUser(session.user);
      const fetchEvaluations = async () => {
        try {
          const response = await axios.get(`/api/getEvaluations`, {
            params: { userId: session.user.id },
          });
          setEvaluationResults(response.data);
        } catch (error) {
          console.error("Error fetching evaluations:", error);
        }
      };
      fetchEvaluations();

      const storedMetrics = JSON.parse(localStorage.getItem("selectedMetrics") || "null");
      if (storedMetrics) {
        setSelectedMetrics(storedMetrics);
      }
    }
  }, []);

  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || taskCategories[category].map(task => task.toLowerCase()).includes(metric.name.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [metrics, searchTerm, category]);

  const handleMetricSelect = (metric: any) => {
    const updatedMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter((m) => m.id !== metric.id)
      : [...selectedMetrics, metric];

    setSelectedMetrics(updatedMetrics);
    localStorage.setItem("selectedMetrics", JSON.stringify(updatedMetrics));
  };

  const handleRunEvaluation = async () => {
    const session = JSON.parse(localStorage.getItem("supabase_session") || "null");
    if (!session) {
      const evaluationDetails = {
        apiEndpoint,
        temperature,
        metrics: selectedMetrics.map((metric) => metric.id),
      };
      localStorage.setItem("pending_evaluation", JSON.stringify(evaluationDetails));
      router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    try {
      const response = await axios.post("/api/addEvaluation", {
        userId: session.user.id,
        apiEndpoint,
        temperature,
        metrics: selectedMetrics.map((metric) => metric.id),
      });

      const updatedEvaluations = await axios.get(`/api/getEvaluations`, {
        params: { userId: session.user.id },
      });
      setEvaluationResults(updatedEvaluations.data);
    } catch (error) {
      console.error("Error running evaluation:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="mb-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">EvalHub</h1>
          <p className="text-xl mb-4">Discover and Benchmark Evaluation Metrics</p>
        </div>
      </header>
      {user && <h2 className="text-2xl font-bold mb-4">Welcome, {user.email}</h2>}
      <div className="mb-8">
        <Input
          type="search"
          placeholder="Search metrics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
        />
      </div>
      <div className="mb-8">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
        >
          <option value="all">All Categories</option>
          {Object.keys(taskCategories).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-8">
        <Input
          type="url"
          placeholder="API Endpoint"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
        />
      </div>
      <div className="mb-8">
        <Input
          type="number"
          placeholder="Temperature"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">{metric.name}</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{metric.description}</p>
              <Button
                variant="outline"
                onClick={() => handleMetricSelect(metric)}
                className="w-full"
              >
                {selectedMetrics.includes(metric) ? "Deselect" : "Select"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Selected Metrics</h2>
        {selectedMetrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {selectedMetrics.map((metric) => (
              <Card
                key={metric.id}
                className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">{metric.name}</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{metric.description}</p>
                  <Button variant="outline" onClick={() => handleMetricSelect(metric)} className="w-full">
                    Deselect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No metrics selected yet.</p>
        )}
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={handleRunEvaluation}>Run Evaluation</Button>
      </div>
      {evaluationResults && evaluationResults.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Evaluation Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {evaluationResults.map((evaluation) => (
              <Card
                key={evaluation.id}
                className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden"
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium">Evaluation ID: {evaluation.id}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">API Endpoint: {evaluation.api_endpoint}</p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Temperature: {evaluation.temperature}</p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Status: {evaluation.status}</p>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Metrics:&nbsp;
                    {evaluation.metrics && evaluation.metrics.map((metric: { metrics: { name: any; }; }) => metric.metrics.name).join(', ')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 EvalHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
