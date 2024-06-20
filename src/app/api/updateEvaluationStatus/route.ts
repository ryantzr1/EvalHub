// // src/pages/api/updateEvaluationStats/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "../../../supabaseClient.js";

// export async function POST(req: NextRequest) {
//   const { evaluationId, status, result } = await req.json();

//   try {
//     const { data, error } = await supabase
//       .from("evaluations")
//       .update({ status, result })
//       .eq("id", evaluationId)
//       .select();

//     if (error) {
//       console.error("Error updating evaluation status:", error);
//       throw error;
//     }

//     return NextResponse.json(data);
//   } catch (error) {
//     return NextResponse.json({ message: (error as Error).message }, { status: 500 });
//   }
// }
