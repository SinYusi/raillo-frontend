import { fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import HomePage from "./page"

const navigation = vi.hoisted(() => ({ router: { push: vi.fn() } }))

vi.mock("next/navigation", () => ({
  useRouter: () => navigation.router,
}))

vi.mock("@/lib/utils/searchHistory", () => ({ saveSearchHistory: vi.fn() }))

// 역 선택은 버튼 하나로 대신한다 — 누르면 label에 맞는 역이 골라진다
vi.mock("@/components/ticket/search/station-selector", () => ({
  StationSelector: ({ label, onValueChange }: { label: string; onValueChange: (station: string) => void }) => (
    <button type="button" onClick={() => onValueChange(label === "출발역" ? "서울" : "부산")}>
      {label} 고르기
    </button>
  ),
}))

const renderHome = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <HomePage />
    </QueryClientProvider>,
  )

describe("HomePage", () => {
  beforeEach(() => {
    navigation.router.push.mockClear()
  })

  it("첫 화면에서 인원을 고르지 않아도 조회 버튼이 활성이고, 어른 1명으로 조회한다", () => {
    renderHome()

    const searchButton = screen.getByRole("button", { name: "열차 조회하기" })
    expect(searchButton).toBeEnabled()

    fireEvent.click(screen.getByRole("button", { name: "출발역 고르기" }))
    fireEvent.click(screen.getByRole("button", { name: "도착역 고르기" }))
    fireEvent.click(searchButton)

    expect(navigation.router.push).toHaveBeenCalledTimes(1)
    const query = new URLSearchParams(navigation.router.push.mock.calls[0][0].split("?")[1])
    expect(query.get("adult")).toBe("1")
    expect(query.get("child")).toBeNull()
  })

  it("바로가기는 헤더와 겹치지 않는 화면으로만 이동하고 홈 자신으로 가지 않는다", () => {
    renderHome()

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"))
    expect(hrefs).toEqual(["/guest-ticket/search", "/ticket/history", "/signup"])
    expect(screen.getByRole("link", { name: /비회원 승차권 확인/ })).toBeInTheDocument()
  })
})
