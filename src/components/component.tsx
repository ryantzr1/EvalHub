"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFetchMetrics } from "@/components/hooks/useFetchMetrics";
import { useFetchCategories } from "@/components/hooks/useFetchCategories";
import MetricList from "@/components/hooks/MetricList";
import BenchmarkForm from "@/components/hooks/BenchmarkForm";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Custom TooltipWrapper component
const TooltipWrapper = ({ content, children }: { content: string, children: React.ReactNode }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent>{content}</TooltipContent>
  </Tooltip>
);

interface Metric {
  id: string;
  name: string;
  description: string;
  category_id: number;
  use_case: string;
  paper_link: string;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
}

interface FetchMetricsResult {
  metrics: Metric[];
  fetchMetrics: () => Promise<void>;
  isLoading: boolean;
}

export default function EvalHubDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [useCase, setUseCase] = useState("all");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [citationCounts, setCitationCounts] = useState<{ [key: string]: number }>({});
  const { metrics, fetchMetrics, isLoading }: FetchMetricsResult = useFetchMetrics();
  const categories: Category[] = useFetchCategories();
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);


  useEffect(() => {
    const text = "Discover Evaluation Benchmarks for your models.";
    let i = 0;
    let typingSpeed = 70; // Slightly slower typing speed
    let cursorBlinkSpeed = 530; // Blinking speed for cursor

    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setTypedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, typingSpeed);

    const cursorEffect = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, cursorBlinkSpeed);

    return () => {
      clearInterval(typingEffect);
      clearInterval(cursorEffect);
    };
  }, []);


  useEffect(() => {
    const filteredUseCases = [...new Set(metrics
      .filter(metric => category === "all" || metric.category_id === parseInt(category, 10))
      .map(metric => metric.use_case)
      .filter(Boolean)
    )];
    setUseCases(filteredUseCases);
    setUseCase("all");
    setPage(1);
  }, [category, metrics]);

  useEffect(() => {
    const fetchCitationCounts = async () => {
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

    fetchCitationCounts();
  }, [metrics]);

  const isFiltering = searchTerm !== "" || category !== "all" || useCase !== "all";

  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      const matchesSearch = metric.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === "all" || metric.category_id === parseInt(category, 10);
      const matchesUseCase = useCase === "all" || (metric.use_case && metric.use_case.toLowerCase() === useCase.toLowerCase());
      return matchesSearch && matchesCategory && matchesUseCase;
    });
  }, [metrics, searchTerm, category, useCase]);

  const paginatedMetrics = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredMetrics.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMetrics, page]);

  const newestMetrics = useMemo(() => {
    return metrics.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).slice(0, 4);
  }, [metrics]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategory("all");
    setUseCase("all");
    setPage(1);
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 md:px-6 py-12">
        <header className="mb-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text dark:from-blue-400 dark:to-blue-200">
                EvalHub
              </span>{" "}
              🚀
            </h1>
            <p className="text-xl mb-4 text-gray-600 dark:text-gray-500">
              {typedText}
            </p>
            <p className="text-md mb-4 text-gray-600 dark:text-gray-400">
              Explore various evaluation metrics here, then head over to the
              <a href="https://github.com/EleutherAI/lm-evaluation-harness/tree/main" target="_blank" rel="noopener noreferrer" className="text-blue-500"> lm-evaluation-harness</a> repository by EleutherAI to evaluate your models.
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
          <TooltipWrapper content="Search for metrics by name">
            <Input
              type="search"
              placeholder="🔍 Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </TooltipWrapper>
          <TooltipWrapper content="Filter metrics by category">
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="w-full md:w-1/3 block rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 flex items-center justify-between px-4 py-2 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipWrapper>
          <TooltipWrapper content="Filter metrics by use case">
            <Select onValueChange={setUseCase} value={useCase}>
              <SelectTrigger className="w-full md:w-1/3 block rounded-md border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 flex items-center justify-between px-4 py-2 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <SelectValue placeholder="All Use Cases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Use Cases</SelectItem>
                {useCases.map((uc) => (
                  <SelectItem key={uc} value={uc}>
                    {uc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipWrapper>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Clear Filters
          </Button>
        </div>

        <AnimatePresence>
          {!isFiltering && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-12 overflow-hidden"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">Newly Added Benchmarks</h2>
              <MetricList metrics={newestMetrics} citationCounts={citationCounts} />
            </motion.section>
          )}
        </AnimatePresence>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">
            {isFiltering ? "Filtered Results" : "All Benchmarks"}
          </h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <MetricList metrics={paginatedMetrics} citationCounts={citationCounts} />
              <div className="mt-4 flex justify-between items-center">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Previous
                </Button>
                <span className="text-gray-700 dark:text-gray-300">Page {page} of {Math.ceil(filteredMetrics.length / itemsPerPage)}</span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(filteredMetrics.length / itemsPerPage)}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </section>

        <footer className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 EvalHub</p>
        </footer>
        <div className="fixed bottom-8 right-8">
          <BenchmarkForm categories={categories} fetchMetrics={fetchMetrics} />
        </div>
      </div>
    </TooltipProvider>
  );
}