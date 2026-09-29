import { describe, expect, it } from "vitest"
import { getSafeRedirectPath } from "./safeRedirect"

describe("getSafeRedirectPath", () => {
  it("같은 사이트 경로는 쿼리·해시까지 돌려준다(브라우저와 같은 규칙으로 정규화)", () => {
    expect(getSafeRedirectPath("/ticket/history")).toBe("/ticket/history")
    expect(getSafeRedirectPath("/ticket/history?tab=all#top")).toBe("/ticket/history?tab=all#top")
    expect(getSafeRedirectPath("/ticket/search?departure=서울&adult=1")).toBe(
      `/ticket/search?departure=${encodeURIComponent("서울")}&adult=1`,
    )
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

  it("탭·줄바꿈이 섞여 브라우저가 외부 주소로 해석하는 값도 거부한다", () => {
    expect(getSafeRedirectPath("/\t/evil.example")).toBe("/")
    expect(getSafeRedirectPath("/\n/evil.example")).toBe("/")
    expect(getSafeRedirectPath("/\r\n/evil.example")).toBe("/")
  })

  it("잘못된 퍼센트 인코딩은 기본 경로", () => {
    expect(getSafeRedirectPath("/%E0%A4%A")).toBe("/")
  })

  it("로그인 화면 자신으로 돌아가는 값은 기본 경로로 바꾼다", () => {
    expect(getSafeRedirectPath("/login")).toBe("/")
    expect(getSafeRedirectPath("/login?redirectTo=%2F")).toBe("/")
    expect(getSafeRedirectPath("/login/")).toBe("/")
  })

  it("대소문자·퍼센트 인코딩을 바꾼 로그인 화면 경로도 걸러낸다", () => {
    expect(getSafeRedirectPath("/Login")).toBe("/")
    expect(getSafeRedirectPath("/%6Cogin")).toBe("/")
  })
})
