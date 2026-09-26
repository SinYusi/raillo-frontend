"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import type { TrainSchedule, SeatType, SeatInfo } from "@/types/trainType"
import { TrainTypeBadge } from "@/components/ticket/TrainTypeBadge";
import { formatPrice } from "@/lib/utils/format"

interface TrainCardProps {
  train: TrainSchedule
  isSelected: boolean
  /** trigger: 닫은 뒤 포커스를 돌려줄 버튼 (Safari는 클릭해도 버튼에 포커스를 주지 않아 activeElement로 추정하지 않는다) */
  onSeatSelection: (train: TrainSchedule, seatType: SeatType, trigger: HTMLElement) => void
}

interface SeatOptionProps {
  label: string
  /** null: 이 열차에 해당 등급이 없음 */
  seat: SeatInfo | null
  onSelect: (trigger: HTMLElement) => void
}

// 등급 한 칸 — 파랑은 누를 수 있는 '선택' 버튼에만 쓰고, 고를 수 없는 등급은 버튼 대신 상태만 보여 준다
function SeatOption({ label, seat, onSelect }: SeatOptionProps) {
  const canReserve = seat?.canReserve ?? false
  return (
    <div className="rounded-lg border bg-muted p-2.5 lg:p-3">
      {/* 모바일은 등급·가격을 한 줄로(카드 높이 절약), lg 이상은 세로로 */}
      <div className="flex items-baseline justify-between gap-2 mb-2 lg:block">
        <div className="text-sm font-medium lg:mb-1">{label}</div>
        <div className={`text-base lg:text-lg font-bold tabular-nums ${canReserve ? "text-foreground" : "text-muted-foreground"}`}>
          {seat ? formatPrice(seat.fare) : "-"}
        </div>
      </div>
      {canReserve ? (
        <Button size="sm" className="w-full" onClick={(event) => onSelect(event.currentTarget)}>
          선택
        </Button>
      ) : (
        // 조작 요소가 아니므로 버튼으로 그리지 않는다 — 높이는 버튼(h-9)과 맞춰 카드 정렬 유지
        <div className="flex h-9 items-center justify-center rounded-control border border-dashed border-muted-foreground/30 text-sm font-medium text-muted-foreground">
          {seat ? "매진" : "운행 안 함"}
        </div>
      )}
    </div>
  )
}

// 목록이 다시 렌더돼도 이 열차의 props(열차·선택 여부·고정된 핸들러)가 같으면 건너뛴다
export const TrainCard = memo(function TrainCard({
  train,
  isSelected,
  onSeatSelection,
}: TrainCardProps) {
  return (
    <Card
      className={`shadow-elev-sm transition-all duration-200 hover:shadow-elev-md ${
        isSelected ? "border-primary ring-[3px] ring-secondary" : ""
      }`}
    >
      {/* 모바일: 번호·소요시간 한 줄 → 시간 → 등급 2열로 촘촘하게. 역 이름 줄은 검색 조건과 같아 lg 이상에서만 */}
      <CardContent className="px-4 py-3.5 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
          {/* Train Info */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 lg:mb-2">
              <TrainTypeBadge trainName={train.trainName} />
              <span className="font-semibold text-lg">{train.trainNumber}</span>
              <span className="ml-auto text-sm text-muted-foreground tabular-nums lg:hidden">{train.formattedTravelTime}</span>
            </div>
            <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{train.departureStationName}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{train.arrivalStationName}</span>
            </div>
          </div>

          {/* Time Info */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-2 lg:mb-1 text-foreground">
              <span className="text-xl lg:text-2xl font-bold tracking-tight tabular-nums">{train.departureTime.substring(0, 5)}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl lg:text-2xl font-bold tracking-tight tabular-nums">{train.arrivalTime.substring(0, 5)}</span>
            </div>
            <div className="hidden lg:block text-sm text-muted-foreground">{train.formattedTravelTime}</div>
          </div>

          {/* Seat Options */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-2 lg:max-w-[340px] lg:ml-auto">
              <SeatOption
                label="일반실"
                seat={train.standardSeat}
                onSelect={(trigger) => onSeatSelection(train, "standardSeat", trigger)}
              />
              <SeatOption
                label="특실"
                seat={train.firstClassSeat}
                onSelect={(trigger) => onSeatSelection(train, "firstClassSeat", trigger)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
