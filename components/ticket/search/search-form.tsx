"use client"

import { useId, useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"
import { DateTimeSelector } from "@/components/ticket/search/date-time-selector"
import { PassengerSelector } from "@/components/ticket/search/passenger-selector"
import { StationSelector } from "@/components/ticket/search/station-selector"
import type { PassengerCounts } from "@/types/passengerType"

const PASSENGER_LABELS: Record<keyof PassengerCounts, string> = {
  adult: "어른",
  child: "어린이",
  infant: "유아",
  senior: "경로",
  severelydisabled: "중증장애인",
  mildlydisabled: "경증장애인",
  veteran: "국가유공자",
}

/** 요약 줄의 인원 — 한 종류면 "어른 1명", 여러 종류면 "총 3명" */
export function summarizePassengers(counts: PassengerCounts): string {
  const picked = (Object.keys(PASSENGER_LABELS) as (keyof PassengerCounts)[]).filter((key) => counts[key] > 0)
  if (picked.length === 1) return `${PASSENGER_LABELS[picked[0]]} ${counts[picked[0]]}명`
  const total = picked.reduce((sum, key) => sum + counts[key], 0)
  return total > 0 ? `총 ${total}명` : "인원 선택 필요"
}

interface SearchFormProps {
  departureStation: string
  arrivalStation: string
  date: Date | undefined
  passengerCounts: PassengerCounts
  searchConditionsChanged: boolean
  onDepartureStationChange: (station: string) => void
  onArrivalStationChange: (station: string) => void
  onDateChange: (date: Date) => void
  onPassengerChange: (passengers: PassengerCounts) => void
  onSearch: () => void
  onBothStationsChange?: (departure: string, arrival: string) => void
}

export function SearchForm({
  departureStation,
  arrivalStation,
  date,
  passengerCounts,
  searchConditionsChanged,
  onDepartureStationChange,
  onArrivalStationChange,
  onDateChange,
  onPassengerChange,
  onSearch,
  onBothStationsChange,
}: SearchFormProps) {
  // 모바일(md 미만)에서는 이미 정한 조건을 한 줄로 접어 결과가 첫 화면에 오게 한다. 데스크톱은 항상 펼침
  const [expanded, setExpanded] = useState(false)
  // 바꾼 조건을 아직 적용하지 않았으면 "검색 조건 적용" 버튼이 보이도록 펼친 채로 둔다
  const open = expanded || searchConditionsChanged
  const formId = useId()
  const route = departureStation && arrivalStation ? `${departureStation} → ${arrivalStation}` : "구간 선택 필요"
  const when = date ? `${format(date, "M/d(EEE) HH시", { locale: ko })} 이후` : "날짜 선택 필요"

  return (
    <Card className="mb-4 md:mb-6 shadow-elev-md">
      <CardContent className="px-4 py-3 md:p-6">
        <div className="flex items-center gap-3 md:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-foreground">{route}</p>
            <p className="truncate text-sm text-muted-foreground tabular-nums">
              {when} · {summarizePassengers(passengerCounts)}
            </p>
          </div>
          {/* 적용 전 변경이 있으면 펼친 채 고정 — 접기 버튼 대신 아래 "검색 조건 적용"으로 마무리 */}
          {!searchConditionsChanged && (
            <Button
              type="button"
              variant="outline"
              aria-expanded={open}
              aria-controls={formId}
              onClick={() => setExpanded((prev) => !prev)}
            >
              {open ? "접기" : "변경"}
            </Button>
          )}
        </div>

        <div
          id={formId}
          className={`${open ? "flex mt-4" : "hidden"} md:mt-0 md:flex flex-col md:flex-row md:items-center md:justify-between gap-4`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* 출발역 선택 */}
            <div className="flex items-center">
              <StationSelector
                value={departureStation}
                onValueChange={onDepartureStationChange}
                placeholder="출발역 선택"
                label=""
                otherStation={arrivalStation}
                onBothStationsChange={onBothStationsChange || ((departure, arrival) => {
                  onDepartureStationChange(departure)
                  onArrivalStationChange(arrival)
                })}
              />
            </div>

            <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground" aria-hidden="true" />

            {/* 도착역 선택 */}
            <div className="flex items-center">
              <StationSelector
                value={arrivalStation}
                onValueChange={onArrivalStationChange}
                placeholder="도착역 선택"
                label=""
                otherStation={departureStation}
                onBothStationsChange={onBothStationsChange || ((departure, arrival) => {
                  onDepartureStationChange(departure)
                  onArrivalStationChange(arrival)
                })}
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block h-6" />

            {/* Date Selection */}
            <div className="flex items-center space-x-2">
              <DateTimeSelector
                value={date}
                onValueChange={onDateChange}
                placeholder="날짜 선택"
                label=""
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block h-6" />

            {/* Passenger Selection */}
            <div className="flex items-center">
              <PassengerSelector
                value={passengerCounts}
                onValueChange={onPassengerChange}
                placeholder="인원 선택"
                label=""
                simple={false}
              />
            </div>
          </div>

          <Button
            onClick={onSearch}
            disabled={Object.values(passengerCounts).reduce((sum, c) => sum + c, 0) === 0}
            variant={searchConditionsChanged ? "default" : "outline"}
          >
            {searchConditionsChanged ? "검색 조건 적용" : "검색하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
