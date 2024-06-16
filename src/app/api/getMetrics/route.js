import { NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient.js";

export async function GET(request) {
  try {
    // Fetch metrics from the database
    const { data, error } = await supabase.from("metrics").select("*");

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
