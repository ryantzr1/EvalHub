// src/pages/api/getEvaluations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient.js";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("evaluations")
      .select(`
        id,
        api_endpoint,
        temperature,
        status,
        created_at,
        metrics: evaluation_metrics (
          metrics (
            id,
            name
          )
        )
      `)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
