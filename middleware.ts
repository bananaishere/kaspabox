import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname

  // If the pathname doesn't end with a slash and doesn't have a file extension
  // and doesn't include an underscore (for Next.js special files)
  if (!pathname.endsWith("/") && !pathname.includes(".") && !pathname.includes("_next") && !pathname.includes("api")) {
    // Create a new URL with a trailing slash
    const url = new URL(`${pathname}/`, request.url)

    // Redirect to the URL with a trailing slash
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files (images, etc.)
    // - _next (Next.js internals)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

