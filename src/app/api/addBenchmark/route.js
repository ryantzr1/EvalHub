import { NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient.js";

export const revalidate = 0;
export async function POST(request) {
  try {
    const {
      name,
      description,
      category,
      use_case,
      github_link,
      paper_link,
      dataset_link,
    } = await request.json();
    const { data, error } = await supabase.from("metrics").insert([
      {
        name,
        description,
        category_id: category,
        use_case,
        github_link,
        paper_link,
        dataset_link,
        ready: true,
      },
    ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Benchmark added successfully!",
      data,
    });
  } catch (error) {
    console.error("Error adding benchmark:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
