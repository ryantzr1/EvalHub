// src/app/api/getCategories/route.js
import { NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient";

export async function GET(request) {
  try {
    // Fetch categories from the database
    const { data, error } = await supabase.from("categories").select("*");

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
