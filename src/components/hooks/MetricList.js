import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";

const MetricList = ({ metrics, citationCounts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card
          key={metric.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col justify-between"
        >
          <CardContent className="p-4 flex-grow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-purple-700 dark:text-purple-400">
                {metric.name}
              </h3>
              <div className="flex items-center bg-purple-100 dark:bg-purple-900 px-2 py-1">
                <Quote
                  size={16}
                  className="text-purple-600 dark:text-purple-400 mr-1"
                />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {citationCounts[metric.id] || 0}
                </span>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-300 mb-4">
              {metric.description}
            </p>
            <p className="text-gray-500 dark:text-gray-300 mb-4">
              <strong>📄 Paper:</strong>{" "}
              <a
                href={metric.paper_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 dark:text-blue-300"
              >
                {metric.paper_link}
              </a>
            </p>
            <p className="text-gray-500 dark:text-gray-300 mb-4">
              <strong>💻 GitHub Code:</strong>{" "}
              <a
                href={metric.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 dark:text-blue-300"
              >
                {metric.github_link}
              </a>
            </p>
          </CardContent>
          <div className="p-4">
            <Button
              variant="outline"
              onClick={() => window.open(metric.dataset_link, "_blank")}
              className="w-full mt-2"
            >
              View Dataset
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MetricList;
