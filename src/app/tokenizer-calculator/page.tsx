import React from "react";
import Layout from "@/components/Layout";
import CostEstimator from "@/components/CostEstimator";

export default function TokenizerCalculatorPage() {
    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
                <h1 className="text-4xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
                    Eval Tokenizer Cost Calculator
                </h1>
                <p className="text-lg text-center text-gray-600 ">
                    Estimate the cost of processing your dataset with various AI models.
                </p>
                <div className="bg-white rounded-lg p-8">
                    <CostEstimator />
                </div>
            </div>
        </Layout>
    );
}