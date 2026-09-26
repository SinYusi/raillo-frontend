"use client"

import type { CarInfo, SeatDetail, TrainSchedule, SeatType } from "@/types/trainType"

interface SeatGridItem extends SeatDetail {
  row: number
  column: string
  isWindow: boolean
}

interface TrainSeatGridProps {
  seatGrid: SeatGridItem[]
  selectedSeats: string[]
  selectedTrain: TrainSchedule
  selectedCar: CarInfo | null
  selectedSeatType: SeatType
  onSeatSelectionClick: (seat: SeatDetail, seatNumber: string, isSelected: boolean) => void
  getSeatButtonStyle: (seat: SeatDetail & { isWindow: boolean }, isSelected: boolean) => string
}

export function TrainSeatGrid({
  seatGrid,
  selectedSeats,
  selectedTrain,
  selectedCar,
  selectedSeatType,
  onSeatSelectionClick,
  getSeatButtonStyle,
}: TrainSeatGridProps) {
  const rows = Math.max(...seatGrid.map((s) => s.row))
  const isReserved = selectedCar?.carType === "FIRST_CLASS"

  const renderSeatRow = (columnLetter: string) => (
    <div className="flex space-x-2">
      {Array.from({ length: rows }, (_, rowIndex) => {
        const row = rowIndex + 1
        const seatNumber = `${row}${columnLetter}`
        const seat = seatGrid.find((s) => s.seatNumber === seatNumber)
        const isSelected = selectedSeats.includes(seatNumber)

        if (!seat) return <div key={row} className="w-10 h-10"></div>

        return (
          <button
            key={row}
            onClick={() => onSeatSelectionClick(seat, seatNumber, isSelected)}
            disabled={!seat.isAvailable}
            aria-pressed={isSelected}
            aria-label={`${seatNumber} ${seat.seatType === "WINDOW" ? "창가" : "통로"} ${seat.seatDirection === "FORWARD" ? "순방향" : seat.seatDirection === "BACKWARD" ? "역방향" : ""}${seat.isAvailable ? "" : " 매진"}`.replace(/\s+/g, " ").trim()}
            className={`
              relative w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
              ${getSeatButtonStyle(seat, isSelected)}
            `}
            title={`${seatNumber} (${seat.seatType === "WINDOW" ? "창가" : "통로"}) ${seat.remarks || ""}`}
          >
            {/* 등받이 막대 — 진행 방향(→)을 보고 앉는 순방향은 왼쪽, 역방향은 오른쪽. 방향은 aria-label에도 있음 */}
            <span
              aria-hidden="true"
              className={`absolute inset-y-1.5 w-1 rounded-full ${seat.seatDirection === "FORWARD" ? "left-1" : "right-1"} ${
                isSelected ? "bg-primary-foreground/90" : seat.isAvailable ? "bg-muted-foreground" : "bg-muted-foreground/40"
              }`}
            ></span>
            {seatNumber}
          </button>
        )
      })}
    </div>
  )

  const renderAisle = () => (
    <div className="flex justify-between items-center px-2 py-1">
      <span className="font-semibold text-primary text-sm">
        {selectedTrain.departureStationName || "출발역"}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-secondary px-3 py-0.5 text-xs font-semibold text-secondary-foreground">
        진행 방향 <span aria-hidden="true">→</span>
      </span>
      <span className="font-semibold text-primary text-sm">
        {selectedTrain.arrivalStationName || "도착역"}
      </span>
    </div>
  )

  return (
    <div className="border rounded-lg p-6 bg-card min-w-[800px]">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-6">
          {/* Left Restrooms */}
          <div className="flex flex-col space-y-3">
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center border-2 border-border">
              <span className="text-lg">🚻</span>
            </div>
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center border-2 border-border">
              <span className="text-lg">🚻</span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="flex flex-col space-y-2">
            {/* Top Seats */}
            <div className="flex flex-col space-y-2">
              {renderSeatRow("A")}
              {isReserved && renderAisle()}
              {renderSeatRow("B")}
            </div>

            {/* Aisle (일반실: B-C 사이) */}
            {!isReserved && renderAisle()}

            {/* Bottom Seats */}
            <div className="flex flex-col space-y-2">
              {!isReserved && renderSeatRow("C")}
              {renderSeatRow(isReserved ? "C" : "D")}
            </div>
          </div>

          {/* Right Restrooms */}
          <div className="flex flex-col space-y-3">
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center border-2 border-border">
              <span className="text-lg">🚻</span>
            </div>
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center border-2 border-border">
              <span className="text-lg">🚻</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { SeatGridItem }
