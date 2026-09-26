import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { PassengerCounts } from "@/types/passengerType"
import { SearchForm, summarizePassengers } from "./search-form"

// 선택 컴포넌트는 조회 요청·팝오버를 쓰므로 이름만 남긴다 — 이 테스트는 요약·펼치기만 본다
vi.mock("@/components/ticket/search/station-selector", () => ({ StationSelector: () => <span>역 선택</span> }))
vi.mock("@/components/ticket/search/date-time-selector", () => ({ DateTimeSelector: () => <span>날짜 선택</span> }))
vi.mock("@/components/ticket/search/passenger-selector", () => ({ PassengerSelector: () => <span>인원 선택</span> }))

const counts = (partial: Partial<PassengerCounts>): PassengerCounts => ({
  adult: 0, child: 0, infant: 0, senior: 0, severelydisabled: 0, mildlydisabled: 0, veteran: 0, ...partial,
})

const renderForm = (searchConditionsChanged = false) =>
  render(
    <SearchForm
      departureStation="서울"
      arrivalStation="부산"
      date={new Date(2026, 8, 27, 9)}
      passengerCounts={counts({ adult: 1 })}
      searchConditionsChanged={searchConditionsChanged}
      onDepartureStationChange={vi.fn()}
      onArrivalStationChange={vi.fn()}
      onDateChange={vi.fn()}
      onPassengerChange={vi.fn()}
      onSearch={vi.fn()}
    />,
  )

describe("summarizePassengers", () => {
  it("한 종류면 종류와 인원, 여러 종류면 총 인원", () => {
    expect(summarizePassengers(counts({ adult: 2 }))).toBe("어른 2명")
    expect(summarizePassengers(counts({ child: 1 }))).toBe("어린이 1명")
    expect(summarizePassengers(counts({ adult: 1, child: 2 }))).toBe("총 3명")
  })
})

describe("SearchForm 모바일 요약", () => {
  it("구간·날짜·인원을 한 줄로 요약하고 '변경'으로 조건 영역을 펼친다", async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.getByText("서울 → 부산")).toBeInTheDocument()
    expect(screen.getByText("9/27(일) 09시 이후 · 어른 1명")).toBeInTheDocument()

    const toggle = screen.getByRole("button", { name: "변경" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    const region = document.getElementById(toggle.getAttribute("aria-controls") ?? "")
    expect(region).toHaveClass("hidden")

    await user.click(toggle)
    expect(screen.getByRole("button", { name: "접기" })).toHaveAttribute("aria-expanded", "true")
    expect(region).not.toHaveClass("hidden")
  })

  it("적용하지 않은 변경이 있으면 펼친 채로 두고 접기 버튼 대신 '검색 조건 적용'만 보인다", () => {
    renderForm(true)

    expect(screen.queryByRole("button", { name: /변경|접기/ })).not.toBeInTheDocument()
    const apply = screen.getByRole("button", { name: "검색 조건 적용" })
    expect(apply.closest("[id]")).not.toHaveClass("hidden")
  })
})
