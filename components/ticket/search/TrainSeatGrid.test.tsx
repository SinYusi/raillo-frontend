import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CarInfo, SeatDetail, SeatInfo, TrainSchedule } from "@/types/trainType"
import { TrainSeatGrid, type SeatGridItem } from "./TrainSeatGrid"

const seatInfo: SeatInfo = { availableSeats: 10, totalSeats: 40, fare: 59800, status: "AVAILABLE", canReserve: true, displayText: "일반실" }
const train: TrainSchedule = {
  trainScheduleId: 1, trainNumber: "101", trainName: "KTX", departureStationName: "서울", arrivalStationName: "부산",
  departureTime: "09:00:00", arrivalTime: "11:38:00", travelTime: "PT2H38M", standardSeat: seatInfo, firstClassSeat: null,
  standing: null, formattedTravelTime: "2시간 38분", expressTrain: true,
}
const car: CarInfo = { id: 12, carNumber: "2", carType: "STANDARD", totalSeats: 40, remainingSeats: 25, seatArrangement: "2+2" }

const item = (seatNumber: string, direction: SeatDetail["seatDirection"], isAvailable = true): SeatGridItem => ({
  seatId: seatNumber.charCodeAt(1) * 10 + Number(seatNumber[0]),
  seatNumber, isAvailable, seatDirection: direction,
  seatType: /[AD]$/.test(seatNumber) ? "WINDOW" : "AISLE", remarks: "",
  row: Number(seatNumber[0]), column: seatNumber[1], isWindow: /[AD]$/.test(seatNumber),
})
const grid = [item("1A", "FORWARD"), item("1B", "FORWARD", false), item("1C", "BACKWARD"), item("1D", "BACKWARD")]

const renderGrid = (selectedSeats: string[] = []) =>
  render(
    <TrainSeatGrid
      seatGrid={grid}
      selectedSeats={selectedSeats}
      selectedTrain={train}
      selectedCar={car}
      selectedSeatType="standardSeat"
      onSeatSelectionClick={vi.fn()}
      getSeatButtonStyle={() => ""}
    />,
  )

// 좌석 버튼 안의 등받이 막대(장식 요소)
const backrest = (seatNumber: string) =>
  screen.getByRole("button", { name: new RegExp(`^${seatNumber} `) }).querySelector('span[aria-hidden="true"]') as HTMLElement

describe("TrainSeatGrid 등받이 막대", () => {
  it("순방향은 왼쪽, 역방향은 오른쪽에 등받이 막대를 그린다", () => {
    renderGrid()
    expect(backrest("1A").className).toMatch(/\bleft-1\b/)
    expect(backrest("1C").className).toMatch(/\bright-1\b/)
  })

  it("매진 좌석도 방향 막대를 흐리게 남긴다", () => {
    renderGrid()
    expect(backrest("1B").className).toMatch(/\bleft-1\b/)
    expect(backrest("1B").className).toContain("bg-muted-foreground/40")
  })

  it("좌석 이름에는 창가·통로·방향·매진이 그대로 들어간다", () => {
    renderGrid(["1A"])
    expect(screen.getByRole("button", { name: "1A 창가 순방향" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "1B 통로 순방향 매진" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "1C 통로 역방향" })).toBeInTheDocument()
  })

  it("진행 방향을 글자로 보여 준다", () => {
    renderGrid()
    expect(screen.getByText("진행 방향")).toBeInTheDocument()
  })
})
