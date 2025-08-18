import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  console.log("middleware running on:", url.pathname);
  console.log("token:", token);

  // ✅ If no token
  if (!token) {
    // Protect private routes
    if (
      url.pathname.startsWith("/my-feed") ||
      url.pathname.startsWith("/global-feed") ||
      url.pathname === "/"
    ) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
  }

  // ✅ If token exists but inactive
  if (token.isActive === false) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // ✅ If logged in and accessing auth pages → push to feed
  if (
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up") ||
    url.pathname.startsWith("/verify") ||
    url.pathname === "/"
  ) {
    return NextResponse.redirect(new URL("/my-feed", request.url));
  }

  return NextResponse.next();
}

// ✅ Middleware matcher
export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/my-feed",
    "/global-feed",
  ],
};

