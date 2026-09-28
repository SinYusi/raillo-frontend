import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { TicketResponse } from "@/types/bookingType"
import BookingHistoryCard from "./BookingHistoryCard"

const booking: TicketResponse["result"][number] = {
  bookingId: 1,
  bookingCode: "R20260927-0001",
  trainNumber: "101",
  trainName: "KTX",
  departureStationName: "서울",
  arrivalStationName: "부산",
  departureTime: "09:00:00",
  arrivalTime: "11:38:00",
  operationDate: "2026-09-27",
  tickets: [
    { ticketId: 9001, ticketNumber: "T-9001", status: "ISSUED", passengerType: "ADULT", carNumber: 3, carType: "STANDARD", seatNumber: "5A" },
  ],
}

describe("BookingHistoryCard 제목 수준", () => {
  it("'승차권 목록'은 페이지 제목(h1) 바로 아래 수준인 h2다 — 제목 수준을 건너뛰지 않는다", () => {
    render(<BookingHistoryCard booking={booking} />)
    expect(screen.getByRole("heading", { level: 2, name: "승차권 목록" })).toBeInTheDocument()
  })
})
