// src/pages/api/addCategory.js
import { NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient.js";

export const revalidate = 0;

export async function POST(request) {
  try {
    const { name } = await request.json();
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name }])
      .select(); // Using select() to retrieve the inserted data

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Failed to insert category");
    }

    return NextResponse.json({
      message: "Category added successfully!",
      id: data[0].id, // Accessing the first element of the array
    });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
