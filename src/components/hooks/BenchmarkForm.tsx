"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import axios from "axios";

interface BenchmarkFormProps {
  categories: { id: number; name: string }[];
  fetchMetrics: () => void;
}

const BenchmarkForm: React.FC<BenchmarkFormProps> = ({ categories, fetchMetrics }) => {

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

  const handleBenchmarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let categoryId = newBenchmark.category;
      if (addNewCategory) {
        const response = await axios.post("/api/addCategory", {
          name: newCategory,
        });
        categoryId = response.data.id;
      }

      await axios.post("/api/addBenchmark", {
        ...newBenchmark,
        category: categoryId,
      });
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
      setIsDialogOpen(false);
      fetchMetrics(); // Refresh the metrics after adding a new benchmark
    } catch (error) {
      console.error("Error adding benchmark:", error);
    }
  };

  return (
    <>
      <Button
        className="bg-blue-700 text-white rounded-full text-lg p-6 shadow-lg"
        onClick={() => setIsDialogOpen(true)}
      >
        Submit New Benchmark
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit a New Eval Benchmark</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit a new eval benchmark.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBenchmarkSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Benchmark Name"
              value={newBenchmark.name}
              onChange={(e) =>
                setNewBenchmark({ ...newBenchmark, name: e.target.value })
              }
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="text"
              placeholder="Description"
              value={newBenchmark.description}
              onChange={(e) =>
                setNewBenchmark({
                  ...newBenchmark,
                  description: e.target.value,
                })
              }
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
              <label
                htmlFor="addNewCategory"
                className="text-gray-700 dark:text-gray-300"
              >
                Add new category
              </label>
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
                onChange={(e) =>
                  setNewBenchmark({ ...newBenchmark, category: e.target.value })
                }
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-gray-200 dark:bg-gray-800"
                required
              >
                <option
                  value=""
                  className="dark:text-gray-200 dark:bg-gray-800"
                >
                  Select Category
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="dark:text-gray-200 dark:bg-gray-800"
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            <Input
              type="text"
              placeholder="Use Case"
              value={newBenchmark.use_case}
              onChange={(e) =>
                setNewBenchmark({ ...newBenchmark, use_case: e.target.value })
              }
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="url"
              placeholder="GitHub Link"
              value={newBenchmark.github_link}
              onChange={(e) =>
                setNewBenchmark({
                  ...newBenchmark,
                  github_link: e.target.value,
                })
              }
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="url"
              placeholder="Paper Link"
              value={newBenchmark.paper_link}
              onChange={(e) =>
                setNewBenchmark({ ...newBenchmark, paper_link: e.target.value })
              }
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <Input
              type="url"
              placeholder="HuggingFace Dataset Link"
              value={newBenchmark.dataset_link}
              onChange={(e) =>
                setNewBenchmark({
                  ...newBenchmark,
                  dataset_link: e.target.value,
                })
              }
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-md px-4 py-2"
              >
                Submit Benchmark
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BenchmarkForm;
