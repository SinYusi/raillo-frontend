import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageHeader } from "./PageHeader"

describe("PageHeader", () => {
  it("페이지 제목을 h1으로, 설명을 그 아래에 그린다", () => {
    render(<PageHeader title="예약승차권 조회" description="예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다" />)
    expect(screen.getByRole("heading", { level: 1, name: "예약승차권 조회" })).toBeInTheDocument()
    expect(screen.getByText("예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다")).toBeInTheDocument()
  })

  it("설명이 없으면 제목만 그린다", () => {
    const { container } = render(<PageHeader title="승차권 확인" />)
    expect(container.querySelector("p")).toBeNull()
  })
})
