import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("has_session");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    // 로그인 뒤 원래 가려던 화면으로 돌아오도록 경로(쿼리 포함)를 넘긴다
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/mypage/:path*",
    "/ticket/reservations",
    "/ticket/purchased",
  ],
};
