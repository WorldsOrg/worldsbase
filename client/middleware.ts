import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.rewrite(new URL(process.env.API_PATH as string, request.url));
  }

  if (request.nextUrl.pathname.startsWith("/composerapi")) {
    return NextResponse.rewrite(new URL(process.env.COMPOSER_API_PATH as string, request.url));
  }

  if (request.nextUrl.pathname.startsWith("/chainapi")) {
    return NextResponse.rewrite(new URL(process.env.CHAIN_API_PATH as string, request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/api/:path*", "/composerapi/:path*", "/chainapi/:path*"],
};
