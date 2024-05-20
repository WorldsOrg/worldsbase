import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    const pathname = request.nextUrl.pathname.slice(4);
    return NextResponse.rewrite(new URL(`${process.env.API_PATH}${pathname}`, request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/api/:path*"],
};
