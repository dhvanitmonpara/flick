import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // If there's an error from Google, redirect to auth-success with error
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth-success?error=${encodeURIComponent(error)}`, request.url),
    );
  }

  // Redirect to the API server's better-auth callback with the same query params
  const apiUrl = new URL(
    `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/callback/google`,
  );

  if (code) apiUrl.searchParams.set("code", code);
  if (state) apiUrl.searchParams.set("state", state);

  // Add the final redirect URL after successful auth
  apiUrl.searchParams.set(
    "callbackURL",
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth-success`,
  );

  return NextResponse.redirect(apiUrl);
}
