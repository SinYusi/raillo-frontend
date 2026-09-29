// @vitest-environment node
import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { middleware } from "./middleware"

describe("middleware 로그인 확인", () => {
  it("세션이 없으면 로그인 화면으로 보내며 원래 경로(쿼리 포함)를 redirectTo로 넘긴다", () => {
    const res = middleware(new NextRequest("http://localhost:3000/ticket/reservations?tab=all"))
    const location = new URL(res.headers.get("location") ?? "")
    expect(location.pathname).toBe("/login")
    expect(location.searchParams.get("redirectTo")).toBe("/ticket/reservations?tab=all")
  })

  it("세션이 있으면 그대로 통과한다", () => {
    const req = new NextRequest("http://localhost:3000/mypage", { headers: { cookie: "has_session=1" } })
    expect(middleware(req).headers.get("location")).toBeNull()
  })
})
