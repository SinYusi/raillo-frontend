"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronDown,
  Settings,
  Ticket,
  User,
} from "lucide-react"

export interface MyPageMemberSummary {
  name: string
  memberId?: string
}

interface MyPageSummaryProps {
  memberInfo?: MyPageMemberSummary
  /** 회원 정보를 불러오는 중이면 이름 자리에 스켈레톤을 보여 줌 */
  isLoading?: boolean
  className?: string
}

/** 마이페이지 회원 요약 — 이름·회원번호 */
export function MyPageSummary({ memberInfo, isLoading = false, className }: MyPageSummaryProps) {
  // 이름을 못 받았을 때(조회 실패 등) "회원 회원님"이 되지 않게 이름 없이 표시
  const greeting = memberInfo?.name ? `${memberInfo.name} 회원님` : "회원님"

  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-3 p-5">
        <div
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-lg font-bold text-secondary-foreground"
        >
          {memberInfo?.name && !isLoading ? memberInfo.name.charAt(0) : <User className="h-5 w-5" />}
        </div>
        {isLoading ? (
          <div role="status" className="space-y-2">
            <span className="sr-only">회원 정보를 불러오는 중</span>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        ) : (
          <div className="min-w-0">
            <p className="text-lg font-bold text-foreground">{greeting}</p>
            {memberInfo?.memberId && (
              <p className="text-sm text-muted-foreground tabular-nums">회원번호 {memberInfo.memberId}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/** 마이페이지 메뉴 — 승차권 정보·회원정보관리는 펼쳐서 고른다 */
export function MyPageNav({ className }: { className?: string }) {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    memberInfoManagement: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className={className}>
      {/* 모바일에서는 본문 아래에 오므로 제목을 보이고, 데스크톱 왼쪽 열에서는 숨긴다 */}
      <h2 id="mypage-menu-heading" className="mb-3 text-lg font-bold text-foreground lg:sr-only">
        마이페이지 메뉴
      </h2>
      <Card>
        <CardContent className="p-0">
          <nav aria-labelledby="mypage-menu-heading" className="space-y-1">
            {/* 마이페이지 */}
            <Link
              href="/mypage"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-muted transition-colors"
            >
              <User className="h-5 w-5 text-muted-foreground" />
              <span>마이페이지</span>
            </Link>

            {/* 승차권 정보 */}
            <Collapsible open={openSections.ticketInfo} onOpenChange={() => toggleSection("ticketInfo")}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted transition-colors">
                <div className="flex items-center space-x-3">
                  <Ticket className="h-5 w-5 text-muted-foreground" />
                  <span>승차권 정보</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    openSections.ticketInfo ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-muted">
                <Link
                  href="/ticket/purchased"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>승차권 확인</span>
                </Link>
                <Link
                  href="/ticket/reservations"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>예약승차권 조회/취소</span>
                </Link>
                <Link
                  href="/ticket/history"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>승차권 구입이력</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* 회원정보관리 */}
            <Collapsible
              open={openSections.memberInfoManagement}
              onOpenChange={() => toggleSection("memberInfoManagement")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>회원정보관리</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    openSections.memberInfoManagement ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-muted">
                <Link
                  href="/mypage/password/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>비밀번호 변경</span>
                </Link>
                <Link
                  href="/mypage/email/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>이메일 변경</span>
                </Link>
                <Link
                  href="/mypage/phone/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>휴대폰 번호 변경</span>
                </Link>
                <Link
                  href="/mypage/withdraw"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <span>회원탈퇴</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}
