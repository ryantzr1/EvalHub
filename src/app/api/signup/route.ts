// src/app/api/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../supabaseClient";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Sign-up Error:", signUpError);
      throw signUpError;
    }

    console.log("Sign-up successful:", signUpData);

    // Insert user into public.users table
    const { user } = signUpData;
    const { error: userInsertError } = await supabase
      .from("public.users")
      .insert([{ id: user.id, email: user.email }]);

    if (userInsertError) {
      console.error("User Insert Error:", userInsertError);
      throw userInsertError;
    }

    console.log("User inserted successfully");
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in signup API:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
