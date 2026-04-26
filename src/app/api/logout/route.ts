import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return NextResponse.json(
      {
        message: "Logged out successfully",
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        success: false,
      },
      { status: 500 },
    );
  }
}
