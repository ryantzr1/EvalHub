import { NextResponse } from "next/server";

export const revalidate = 0;

export async function POST(request) {
  try {
    return NextResponse.json({ message: "Hello, world!" });
  } catch (error) {
    console.error("Error in POST handler:", error);
    const errorResponse = NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
    );
    errorResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return errorResponse;
  }
}

export async function OPTIONS(request) {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}
