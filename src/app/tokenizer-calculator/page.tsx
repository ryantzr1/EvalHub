import Layout from "@/components/Layout"
import CostEstimator from "@/components/CostEstimator"

export default function TokenizerCalculatorPage() {
    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
                <h1 className="text-4xl font-bold  mb-2 text-center text-blue-600 dark:text-blue-400">Eval Tokenizer Cost Calculator</h1>
                <CostEstimator />
            </div>
        </Layout>
    )
}