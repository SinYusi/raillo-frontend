import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { SeatInfo, TrainSchedule } from "@/types/trainType"
import { TrainCard } from "./train-card"

const seat = (fare: number, canReserve: boolean): SeatInfo => ({
  availableSeats: canReserve ? 10 : 0,
  totalSeats: 40,
  fare,
  status: canReserve ? "AVAILABLE" : "SOLD_OUT",
  canReserve,
  displayText: canReserve ? "예약가능" : "매진",
})

const train = (standard: SeatInfo, firstClass: SeatInfo | null): TrainSchedule => ({
  trainScheduleId: 1,
  trainNumber: "203",
  trainName: "KTX-산천",
  departureStationName: "서울",
  arrivalStationName: "부산",
  departureTime: "09:30:00",
  arrivalTime: "12:15:00",
  travelTime: "PT2H45M",
  standardSeat: standard,
  firstClassSeat: firstClass,
  standing: null,
  formattedTravelTime: "2시간 45분",
  expressTrain: true,
})

describe("TrainCard 등급 칸", () => {
  it("예약 가능한 등급만 '선택' 버튼이고, 누르면 등급과 버튼을 넘긴다", async () => {
    const onSeatSelection = vi.fn()
    render(<TrainCard train={train(seat(59800, true), seat(83700, false))} isSelected={false} onSeatSelection={onSeatSelection} />)

    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(1)
    await userEvent.click(buttons[0])
    expect(onSeatSelection).toHaveBeenCalledWith(expect.objectContaining({ trainNumber: "203" }), "standardSeat", buttons[0])
  })

  it("매진 등급은 버튼이 아닌 '매진' 표시로 보여 준다", () => {
    render(<TrainCard train={train(seat(59800, true), seat(83700, false))} isSelected={false} onSeatSelection={vi.fn()} />)
    expect(screen.getByText("매진")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "매진" })).not.toBeInTheDocument()
  })

  it("특실이 없는 열차는 '운행 안 함'으로 보여 준다", () => {
    render(<TrainCard train={train(seat(42600, false), null)} isSelected={false} onSeatSelection={vi.fn()} />)
    expect(screen.getByText("운행 안 함")).toBeInTheDocument()
    expect(screen.getByText("매진")).toBeInTheDocument()
    expect(screen.queryAllByRole("button")).toHaveLength(0)
  })
})
