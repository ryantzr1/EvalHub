// // src/app/api/addEvaluation/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "../../../supabaseClient.js";

// export async function POST(req: NextRequest) {
//   const { userId, apiEndpoint, temperature, metrics } = await req.json();

//   try {
//     console.log("Received request:", { userId, apiEndpoint, temperature, metrics });

//     // Check if user exists
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("id", userId);

//     if (userError || !userData.length) {
//       console.error("User Check Error:", userError);
//       throw new Error("User does not exist");
//     }

//     console.log("User exists:", userData);

//     // Check if evaluation already exists
//     const { data: existingEvaluationData, error: existingEvaluationError } = await supabase
//       .from("evaluations")
//       .select("id")
//       .eq("user_id", userId)
//       .eq("api_endpoint", apiEndpoint)
//       .eq("temperature", temperature);

//     let evaluationId;

//     if (existingEvaluationError) {
//       console.error("Evaluation Check Error:", existingEvaluationError);
//       throw existingEvaluationError;
//     }

//     if (existingEvaluationData.length > 0) {
//       // Evaluation exists, use the existing evaluation ID
//       evaluationId = existingEvaluationData[0].id;
//       console.log("Existing evaluation found:", evaluationId);
//     } else {
//       // Insert new evaluation
//       const { data: evaluationData, error: evaluationError } = await supabase
//         .from("evaluations")
//         .insert([{ user_id: userId, api_endpoint: apiEndpoint, temperature }])
//         .select();

//       if (evaluationError) {
//         console.error("Evaluation Insert Error:", evaluationError);
//         throw evaluationError;
//       }

//       evaluationId = evaluationData[0].id;
//       console.log("Evaluation inserted successfully:", evaluationData);
//     }

//     // Fetch existing metrics for this evaluation
//     const { data: existingMetrics, error: fetchMetricsError } = await supabase
//       .from("evaluation_metrics")
//       .select("metric_id")
//       .eq("evaluation_id", evaluationId);

//     if (fetchMetricsError) {
//       console.error("Fetch Existing Metrics Error:", fetchMetricsError);
//       throw fetchMetricsError;
//     }

//     // Filter out metrics that are already associated with this evaluation
//     const existingMetricIds = existingMetrics.map(metric => metric.metric_id);
//     const newMetrics = metrics.filter((metric: any) => !existingMetricIds.includes(metric));

//     const metricInserts = newMetrics.map((metric: any) => ({
//       evaluation_id: evaluationId,
//       metric_id: metric
//     }));

//     console.log("Metrics to be inserted:", metricInserts);

//     if (metricInserts.length > 0) {
//       const { error: metricsError } = await supabase
//         .from("evaluation_metrics")
//         .insert(metricInserts);

//       if (metricsError) {
//         console.error("Metrics Insert Error:", metricsError);
//         throw metricsError;
//       }

//       console.log("Metrics inserted successfully");
//     } else {
//       console.log("No new metrics to insert");
//     }

//     return NextResponse.json({ evaluationId });
//   } catch (error) {
//     console.error("Error in addEvaluation API:", error);
//     return NextResponse.json({ message: error }, { status: 500 });
//   }
// }
