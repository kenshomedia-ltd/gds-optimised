import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authCookie = req.cookies.get("_token")?.value;
  const pathname = req.nextUrl.pathname;

  const segments = pathname.split("/").filter(Boolean); // removes empty strings
  const dashboardIndex = segments.indexOf("dashboard");
  const authenticationIndex = segments.indexOf("authentication");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "/";

  // If logged in and trying to access authentication pages → redirect to dashboard
  if (authCookie && (authenticationIndex === 0 || authenticationIndex === 1)) {
    return NextResponse.redirect(new URL(`${baseUrl}dashboard/`, req.url));
  }

  // If NOT logged in and trying to access dashboard → redirect to login
  if (!authCookie && (dashboardIndex === 0 || dashboardIndex === 1)) {
    return NextResponse.redirect(
      new URL(`${baseUrl}authentication/login/`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/authentication/:path*"],
};
