import { NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient.js";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from("metrics")
      .select("*")
      .eq("ready", true);

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
