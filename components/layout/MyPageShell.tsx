import type { ReactNode } from "react"
import { MyPageNav, MyPageSummary, type MyPageMemberSummary } from "@/components/layout/MyPageSidebar"

interface MyPageShellProps {
  memberInfo?: MyPageMemberSummary
  isLoading?: boolean
  /** 본문 위 전체 폭 영역 — 예: PageHeader */
  header?: ReactNode
  children: ReactNode
}

/**
 * 마이페이지 화면 골격.
 * 데스크톱: 왼쪽 열에 회원 요약·메뉴, 오른쪽에 본문.
 * 모바일: 회원 요약 → 본문 → 메뉴 — 본문이 첫 화면에 오도록 메뉴를 아래로 내리고, 문서 순서도 같게 둬 Tab 순서와 보이는 순서를 맞춘다.
 */
export default function MyPageShell({ memberInfo, isLoading = false, header, children }: MyPageShellProps) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {header}
          {/* 두 번째 행(1fr)이 본문 높이를 받아 요약 아래에 빈틈이 생기지 않게 한다 */}
          <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:items-start">
            <MyPageSummary memberInfo={memberInfo} isLoading={isLoading} className="lg:col-start-1 lg:row-start-1" />
            <div className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2">{children}</div>
            <MyPageNav className="lg:col-start-1 lg:row-start-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
