import { describe, expect, it } from "vitest"
import { getSafeRedirectPath } from "./safeRedirect"

describe("getSafeRedirectPath", () => {
  it("같은 사이트 경로는 쿼리까지 그대로 돌려준다", () => {
    expect(getSafeRedirectPath("/ticket/history")).toBe("/ticket/history")
    expect(getSafeRedirectPath("/ticket/search?departure=서울&adult=1")).toBe("/ticket/search?departure=서울&adult=1")
  })

  it("값이 없으면 기본 경로", () => {
    expect(getSafeRedirectPath(null)).toBe("/")
    expect(getSafeRedirectPath("")).toBe("/")
    expect(getSafeRedirectPath(undefined, "/mypage")).toBe("/mypage")
  })

  it("외부 주소로 해석되는 값은 거부한다", () => {
    expect(getSafeRedirectPath("https://evil.example")).toBe("/")
    expect(getSafeRedirectPath("//evil.example")).toBe("/")
    expect(getSafeRedirectPath("/\\evil.example")).toBe("/")
    expect(getSafeRedirectPath("javascript:alert(1)")).toBe("/")
  })

  it("로그인 화면 자신으로 돌아가는 값은 기본 경로로 바꾼다", () => {
    expect(getSafeRedirectPath("/login")).toBe("/")
    expect(getSafeRedirectPath("/login?redirectTo=%2F")).toBe("/")
  })
})
