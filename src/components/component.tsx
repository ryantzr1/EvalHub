"use client";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";

export default function Component() {
  const [searchTerm, setSearchTerm] = useState("");
  const [metrics, setMetrics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState("all");
  const [useCase, setUseCase] = useState("all");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [newBenchmark, setNewBenchmark] = useState({
    name: "",
    description: "",
    category: "",
    use_case: "",
    github_link: "",
    paper_link: "",
    dataset_link: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [addNewCategory, setAddNewCategory] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get("/api/getMetrics");
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/getCategories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchCategories();

    const interval = setInterval(() => {
      fetchMetrics();
      fetchCategories();
    }, 86400000); // Fetch data every day

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("supabase_session") || "null");
    if (session) {
      setUser(session.user);
    }
  }, []);

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

  const handleBenchmarkSubmit = async (e) => {
    e.preventDefault();
    try {
      let categoryId = newBenchmark.category;
      if (addNewCategory) {
        const response = await axios.post("/api/addCategory", { name: newCategory });
        categoryId = response.data.id;
        fetchCategories(); // Refresh categories after adding new one
      }

      await axios.post("/api/addBenchmark", { ...newBenchmark, category: categoryId });
      setNewBenchmark({
        name: "",
        description: "",
        category: "",
        use_case: "",
        github_link: "",
        paper_link: "",
        dataset_link: "",
      });
      setNewCategory("");
      setAddNewCategory(false);
      fetchMetrics();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding benchmark:", error);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col justify-between"
          >
            <CardContent className="p-4 flex-grow">
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
            </CardContent>
            <div className="p-4">
              <Button
                variant="outline"
                onClick={() => window.open(metric.dataset_link, '_blank')}
                className="w-full mt-2"
              >
                View Dataset
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <footer className="mt-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 EvalHub</p>
      </footer>

      {/* Button to Open Dialog */}
      <div className="fixed bottom-8 right-8">
        <Button
          className="bg-blue-700 text-white rounded-full text-lg p-6 shadow-lg"
          onClick={() => setIsDialogOpen(true)}
        >
          Submit New Benchmark
        </Button>
      </div>

      {/* Dialog for Benchmark Submission */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a New Eval Benchmark</DialogTitle>
            <DialogDescription>Fill out the form below to submit a new eval benchmark.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBenchmarkSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Benchmark Name"
              value={newBenchmark.name}
              onChange={(e) => setNewBenchmark({ ...newBenchmark, name: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="text"
              placeholder="Description"
              value={newBenchmark.description}
              onChange={(e) => setNewBenchmark({ ...newBenchmark, description: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="addNewCategory"
                checked={addNewCategory}
                onChange={() => setAddNewCategory(!addNewCategory)}
                className="mr-2"
              />
              <label htmlFor="addNewCategory" className="text-gray-700 dark:text-gray-300">Add new category</label>
            </div>
            {addNewCategory ? (
              <Input
                type="text"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              />
            ) : (
              <select
                value={newBenchmark.category}
                onChange={(e) => setNewBenchmark({ ...newBenchmark, category: e.target.value })}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-200 dark:bg-gray-800"
                required
              >
                <option value="" className="dark:text-gray-200 dark:bg-gray-800">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="dark:text-gray-200 dark:bg-gray-800">
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            <Input
              type="text"
              placeholder="Use Case"
              value={newBenchmark.use_case}
              onChange={(e) => setNewBenchmark({ ...newBenchmark, use_case: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="url"
              placeholder="GitHub Link"
              value={newBenchmark.github_link}
              onChange={(e) => setNewBenchmark({ ...newBenchmark, github_link: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="url"
              placeholder="Paper Link"
              value={newBenchmark.paper_link}
              onChange={(e) => setNewBenchmark({ ...newBenchmark, paper_link: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="url"
              placeholder="HuggingFace Dataset Link"
              value={newBenchmark.dataset_link}
              onChange={(e) => setNewBenchmark({ ...newBenchmark, dataset_link: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <DialogFooter>
              <Button type="submit" className="w-full bg-blue-600 text-white rounded-md px-4 py-2">
                Submit Benchmark
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
