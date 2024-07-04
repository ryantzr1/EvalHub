"use client";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useFetchMetrics } from "@/components/hooks/useFetchMetrics";
import { useFetchCategories } from "@/components/hooks/useFetchCategories";
import MetricList from "@/components/hooks/MetricList";
import BenchmarkForm from "@/components/hooks/BenchmarkForm";
import axios from "axios";

interface Metric {
  id: string;
  name: string;
  description: string;
  category_id: number;
  use_case: string;
  paper_link: string;
}

interface Category {
  id: number;
  name: string;
}

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [useCase, setUseCase] = useState("all");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [citationCounts, setCitationCounts] = useState<{ [key: string]: number }>({});
  const { metrics, fetchMetrics } = useFetchMetrics();
  const categories: Category[] = useFetchCategories();

  const fetchCitationCounts = async (metrics: Metric[]) => {
    const newCitationCounts: { [key: string]: number } = {};
    for (const metric of metrics) {
      if (metric.paper_link) {
        try {
          const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/URL:${metric.paper_link}?fields=citationCount`);
          newCitationCounts[metric.id] = response.data.citationCount || 0;
        } catch (error) {
          console.error(`Error fetching citation count for ${metric.name}:`, error);
          newCitationCounts[metric.id] = 0;
        }
      }
    }
    setCitationCounts(newCitationCounts);
  };

  useEffect(() => {
    fetchCitationCounts(metrics);
  }, [metrics]);

  useEffect(() => {
    const filteredUseCases = [...new Set(metrics
      .filter(metric => category === "all" || metric.category_id === parseInt(category, 10))
      .map(metric => metric.use_case)
      .filter(Boolean)
    )];
    setUseCases(filteredUseCases);
    setUseCase("all"); // Reset use case to "All Use Cases" when category changes
  }, [category, metrics]);

  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || metric.category_id === parseInt(category, 10);
      const matchesUseCase = useCase === "all" || (metric.use_case && metric.use_case.toLowerCase() === useCase.toLowerCase());
      return matchesSearch && matchesCategory && matchesUseCase;
    });
  }, [metrics, searchTerm, category, useCase]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="mb-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">EvalHub 🚀</h1>
          <p className="text-xl mb-4 text-gray-700 dark:text-gray-300">
            Discover Evaluation Benchmarks for your models.
          </p>
          <p className="text-md mb-4 text-gray-600 dark:text-gray-400">
            Explore various evaluation metrics here and then head over to the
            <a href="https://github.com/EleutherAI/lm-evaluation-harness/tree/main" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300"> lm-evaluation-harness</a> repository by EleutherAI to evaluate your models.
          </p>
        </div>
      </header>
      <div className="mb-8">
        <Input
          type="search"
          placeholder="🔍 Search metrics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>
      <div className="mb-8">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-200 dark:bg-gray-800"
        >
          <option value="all" className="dark:text-gray-200 dark:bg-gray-800">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} className="dark:text-gray-200 dark:bg-gray-800">
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-8">
        <select
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-200 dark:bg-gray-800"
        >
          <option value="all" className="dark:text-gray-200 dark:bg-gray-800">All Use Cases</option>
          {useCases.map((uc) => (
            <option key={uc} value={uc} className="dark:text-gray-200 dark:bg-gray-800">
              {uc}
            </option>
          ))}
        </select>
      </div>
      <MetricList metrics={filteredMetrics} citationCounts={citationCounts} />
      <footer className="mt-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 EvalHub</p>
      </footer>
      <div className="fixed bottom-8 right-8">
        <BenchmarkForm categories={categories} fetchMetrics={fetchMetrics} />
      </div>
    </div>
  );
}