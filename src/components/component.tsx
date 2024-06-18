"use client";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { taskCategories } from "@/data/taskCategories";

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState("all");

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
    }
  }, []);

  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || taskCategories[category].map(task => task.toLowerCase()).includes(metric.name.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [metrics, searchTerm, category]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="mb-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400">EvalHub 🚀</h1>
          <p className="text-xl mb-4 text-gray-700 dark:text-gray-300">
            Discover and Review Evaluation Metrics for your models.
          </p>
          <p className="text-md mb-4 text-gray-600 dark:text-gray-400">
            Explore various evaluation metrics here and then head over to the
            <a href="https://github.com/EleutherAI/lm-evaluation-harness/tree/main" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300"> lm-evaluation-harness</a> repository by EleutherAI to evaluate your models.
          </p>
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">*Disclaimer: This platform is a work in progress. <a href="https://github.com/ryantzr1/EvalHub" target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300">Contributions are welcome here</a>.</p>
          </div>
        </div>
      </header>
      {user && <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Welcome, {user.email} 🎉</h2>}
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
          {Object.keys(taskCategories).map((cat) => (
            <option key={cat} value={cat} className="dark:text-gray-200 dark:bg-gray-800">
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
            onClick={() => setExpandedMetric(expandedMetric === metric.id ? null : metric.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-purple-700 dark:text-purple-400">{metric.name}</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-300 mb-4">{metric.description}</p>
              <p className="text-gray-500 dark:text-gray-300 mb-4">
                <strong>📄 Paper:</strong> <a href={metric.paper_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300">{metric.paper_link}</a>
              </p>
              <p className="text-gray-500 dark:text-gray-300 mb-4">
                <strong>💻 GitHub Code:</strong> <a href={metric.github_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300">{metric.github_link}</a>
              </p>

              {expandedMetric === metric.id && (
                <div className="mt-4">
                  <h4 className="text-lg font-medium mb-2 text-purple-700 dark:text-purple-400">Reviews</h4>
                  <div className="text-gray-500 dark:text-gray-300 mb-2">Reviews system coming soon!</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>


      <footer className="mt-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 EvalHub</p>
      </footer>
    </div>
  );
}
