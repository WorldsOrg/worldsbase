import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  if (request.nextUrl.pathname.startsWith("/api")) {
    const pathname = request.nextUrl.pathname.slice(4);
    return NextResponse.rewrite(new URL(`${process.env.API_PATH}${pathname}`, request.url));
  }

  if (request.nextUrl.pathname.startsWith("/composerapi")) {
    const pathname = request.nextUrl.pathname.slice(12);
    return NextResponse.rewrite(new URL(`${process.env.COMPOSER_API_PATH}${pathname}`, request.url));
  }

  if (request.nextUrl.pathname.startsWith("/chainapi")) {
    const pathname = request.nextUrl.pathname.slice(9);
    return NextResponse.rewrite(new URL(`${process.env.CHAIN_API_PATH}${pathname}`, request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/api/:path*", "/composerapi/:path*", "/chainapi/:path*"],
};
