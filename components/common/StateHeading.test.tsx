import { render, screen } from "@testing-library/react"
import { Inbox } from "lucide-react"
import { describe, expect, it } from "vitest"
import { EmptyState } from "./EmptyState"
import { ErrorState } from "./ErrorState"

describe("EmptyState·ErrorState 제목 수준", () => {
  it("기본은 h3 — 구역 제목(h2) 아래에 놓이는 경우", () => {
    render(
      <>
        <EmptyState icon={Inbox} title="비어 있음" />
        <ErrorState title="오류" />
      </>,
    )
    expect(screen.getByRole("heading", { level: 3, name: "비어 있음" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "오류" })).toBeInTheDocument()
  })

  it("페이지 제목 바로 아래면 headingLevel={2}로 h2", () => {
    render(
      <>
        <EmptyState icon={Inbox} title="비어 있음" headingLevel={2} />
        <ErrorState title="오류" headingLevel={2} />
      </>,
    )
    expect(screen.getByRole("heading", { level: 2, name: "비어 있음" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "오류" })).toBeInTheDocument()
  })
})
