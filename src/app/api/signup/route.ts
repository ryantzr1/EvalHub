// // src/app/api/signup/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "../../../supabaseClient.js";

// export async function POST(req: NextRequest) {
//   const { email, password } = await req.json();

//   try {
//     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (signUpError) {
//       console.error("Sign-up Error:", signUpError);
//       throw signUpError;
//     }

//     console.log("Sign-up successful:", signUpData);

//     // Insert user into public.users table
//     const { user } = signUpData;
//       if (user) {
//         await supabase.from("public.users").insert([{ id: user.id, email: user.email }]);
//       } else {
//         throw new Error("User is null");
//       }

//       if (Error instanceof Error) {
//         console.error("Error in signup API:", Error);
//         return NextResponse.json({ message: Error.message }, { status: 500 });
//       } else {
//         throw new Error("Unknown error");
//       }
//   } catch (error) {
//     console.error("Error in signup API:", error);
//     return NextResponse.json({ message: (error as Error).message }, { status: 500 });
//   }
// }
