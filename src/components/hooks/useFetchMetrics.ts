import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Metric {
  [x: string]: string | number | Date;
  id: string;
  name: string;
  description: string;
  category_id: number;
  use_case: string;
  paper_link: string;
}

export const useFetchMetrics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add isLoading state

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get("/api/getMetrics");
      setMetrics(response.data);
      setIsLoading(false); // Set isLoading to false after data is fetched
    } catch (error) {
      console.error("Error fetching metrics:", error);
      setIsLoading(false); // Set isLoading to false in case of error
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(fetchMetrics, 86400000); // Fetch data every day

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [fetchMetrics]);

  return { metrics, fetchMetrics, isLoading }; // Return isLoading in the object
};
