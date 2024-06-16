// src/app/api/signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error during sign-in:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Ensure user is in users table
    const { user } = data;
    const { error: userInsertError } = await supabase
      .from("users")
      .upsert([{ id: user.id, email: user.email }], { onConflict: ['id'] });

    if (userInsertError) {
      console.error("User Insert Error:", userInsertError);
      return NextResponse.json({ message: userInsertError.message }, { status: 500 });
    }

    console.log("Sign-in successful:", data);
    return NextResponse.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error("Error in signin API:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
