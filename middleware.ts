import { createMiddlewareSupabase } from "@lib/supabase/middleware.supabase";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_BASE_PATH = "/admin";
const ADMIN_PUBLIC_PATHS = new Set(["/admin/signin"]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_BASE_PATH)) {
    return NextResponse.next();
  }

  if (ADMIN_PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareSupabase(request, response);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/admin/signin";
  redirectUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
