import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const cookies = request.cookies.getAll();
  const isLoggedIn = cookies.some(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  );

  if (!isLoggedIn && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (isLoggedIn && (path === "/auth/login" || path === "/auth/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
