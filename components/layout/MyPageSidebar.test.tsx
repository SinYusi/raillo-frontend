import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { MyPageNav, MyPageSummary } from "./MyPageSidebar"

describe("MyPageSummary 회원 요약", () => {
  it("이름과 회원번호를 보여 준다", () => {
    render(<MyPageSummary memberInfo={{ name: "홍길동", memberId: "M20260911001" }} />)
    expect(screen.getByText("홍길동 회원님")).toBeInTheDocument()
    expect(screen.getByText("회원번호 M20260911001")).toBeInTheDocument()
  })

  it("이름이 없으면(조회 실패 등) '회원 회원님' 대신 '회원님'으로 표시하고 회원번호 줄은 없다", () => {
    render(<MyPageSummary />)
    expect(screen.getByText("회원님")).toBeInTheDocument()
    expect(screen.queryByText(/회원 회원님/)).not.toBeInTheDocument()
    expect(screen.queryByText(/회원번호/)).not.toBeInTheDocument()
  })

  it("조회 중이면 이름 대신 로딩 안내를 보여 준다", () => {
    render(<MyPageSummary isLoading />)
    expect(screen.getByRole("status")).toHaveTextContent("회원 정보를 불러오는 중")
    expect(screen.queryByText(/회원님/)).not.toBeInTheDocument()
  })
})

describe("MyPageNav 메뉴", () => {
  it("이름이 붙은 nav이고, 펼치면 하위 메뉴 링크가 나타난다", async () => {
    const user = userEvent.setup()
    render(<MyPageNav />)

    expect(screen.getByRole("navigation", { name: "마이페이지 메뉴" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "비밀번호 변경" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "회원정보관리" }))
    expect(screen.getByRole("link", { name: "비밀번호 변경" })).toHaveAttribute("href", "/mypage/password/change")
  })
})
