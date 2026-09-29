import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import MyPageShell from "./MyPageShell"

describe("MyPageShell", () => {
  it("문서 순서가 회원 요약 → 본문 → 메뉴다(모바일에서 본문이 메뉴보다 먼저, Tab 순서도 같게)", () => {
    render(
      <MyPageShell memberInfo={{ name: "홍길동", memberId: "M1" }} header={<h1>마이페이지</h1>}>
        <h2>나의 기본정보</h2>
      </MyPageShell>,
    )

    const heading = screen.getByRole("heading", { level: 1, name: "마이페이지" })
    const summary = screen.getByText("홍길동 회원님")
    const content = screen.getByRole("heading", { name: "나의 기본정보" })
    const nav = screen.getByRole("navigation", { name: "마이페이지 메뉴" })

    const follows = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(follows(heading, summary)).toBe(true)
    expect(follows(summary, content)).toBe(true)
    expect(follows(content, nav)).toBe(true)
  })
})
