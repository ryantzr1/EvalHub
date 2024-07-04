import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Metric {
  id: string;
  name: string;
  description: string;
  category_id: number;
  use_case: string;
  paper_link: string;
}

export const useFetchMetrics = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get("/api/getMetrics");
      console.log(response.data);
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(fetchMetrics, 86400000); // Fetch data every day

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [fetchMetrics]);

  return { metrics, fetchMetrics };
};