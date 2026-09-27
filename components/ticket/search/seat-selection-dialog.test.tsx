import { act, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { CarInfo, SeatDetail, SeatInfo, TrainSchedule } from "@/types/trainType"
import { SeatSelectionDialog } from "./seat-selection-dialog"

const seatInfo: SeatInfo = {
  availableSeats: 10,
  totalSeats: 40,
  fare: 59800,
  status: "AVAILABLE",
  canReserve: true,
  displayText: "일반실",
}

const train: TrainSchedule = {
  trainScheduleId: 1,
  trainNumber: "001",
  trainName: "KTX",
  departureStationName: "서울",
  arrivalStationName: "부산",
  departureTime: "05:13:00",
  arrivalTime: "07:50:00",
  travelTime: "PT2H37M",
  standardSeat: seatInfo,
  firstClassSeat: seatInfo,
  standing: null,
  formattedTravelTime: "2시간 37분",
  expressTrain: true,
}

const cars: CarInfo[] = [
  { id: 13, carNumber: "3", carType: "STANDARD", totalSeats: 40, remainingSeats: 31, seatArrangement: "2+2" },
]

const seat = (seatNumber: string, isAvailable = true): SeatDetail => ({
  seatId: seatNumber.charCodeAt(1) * 10 + Number(seatNumber[0]),
  seatNumber,
  isAvailable,
  seatDirection: "FORWARD",
  seatType: seatNumber.endsWith("A") || seatNumber.endsWith("D") ? "WINDOW" : "AISLE",
  remarks: "",
})
const seats = ["1A", "1B", "1C", "1D"].map((n) => seat(n))

const renderDialog = (props: { isOpen?: boolean; appliedSeats?: string[]; appliedCar?: number | null; maxSeats?: number; onApply?: (s: string[], car: number) => void } = {}) => {
  const onApply = props.onApply ?? vi.fn()
  const element = (overrides: { isOpen?: boolean; appliedSeats?: string[] } = {}) => (
    <SeatSelectionDialog
      isOpen={overrides.isOpen ?? props.isOpen ?? true}
      onClose={vi.fn()}
      selectedTrain={train}
      selectedSeatType="standardSeat"
      appliedSeats={overrides.appliedSeats ?? props.appliedSeats ?? []}
      appliedCar={props.appliedCar ?? null}
      onApply={onApply}
      maxSeats={props.maxSeats ?? 2}
      carList={cars}
      seatList={seats}
      loadingCars={false}
      loadingSeats={false}
      onCarSelect={vi.fn()}
      onRefreshSeats={vi.fn()}
      returnFocusRef={{ current: null }}
    />
  )
  const view = render(element())
  return { ...view, onApply, rerenderWith: (o: { isOpen?: boolean; appliedSeats?: string[] }) => view.rerender(element(o)) }
}

const seatButton = (seatNumber: string) => screen.getByRole("button", { name: new RegExp(`^${seatNumber} `) })

describe("SeatSelectionDialog 좌석 선택", () => {
  it("고르는 좌석은 선택적용을 누를 때만 좌석·호차와 함께 넘긴다", () => {
    const { onApply } = renderDialog({ maxSeats: 2 })

    act(() => seatButton("1A").click())
    act(() => seatButton("1B").click())
    expect(seatButton("1A")).toHaveAttribute("aria-pressed", "true")
    expect(onApply).not.toHaveBeenCalled()

    act(() => screen.getByRole("button", { name: /선택적용/ }).click())
    expect(onApply).toHaveBeenCalledWith(["1A", "1B"], 3)
  })

  it("다시 누르면 선택을 해제한다", () => {
    renderDialog({ maxSeats: 2 })

    act(() => seatButton("1A").click())
    act(() => seatButton("1A").click())

    expect(seatButton("1A")).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByRole("button", { name: /선택적용/ })).toBeDisabled()
  })

  it("승객 수보다 많이 고르면 안내하고 선택하지 않는다", () => {
    renderDialog({ maxSeats: 1 })

    act(() => seatButton("1A").click())
    act(() => seatButton("1B").click())

    expect(screen.getByRole("alert")).toHaveTextContent("좌석은 최대 1개까지")
    expect(seatButton("1B")).toHaveAttribute("aria-pressed", "false")
  })

  it("열 때마다 적용된 좌석으로 시작한다", () => {
    const { rerenderWith } = renderDialog({ appliedSeats: ["1B"] })
    expect(seatButton("1B")).toHaveAttribute("aria-pressed", "true")

    // 고르다가 닫고, 다른 좌석이 적용된 상태로 다시 연다
    act(() => seatButton("1C").click())
    rerenderWith({ isOpen: false, appliedSeats: ["1D"] })
    rerenderWith({ isOpen: true, appliedSeats: ["1D"] })

    expect(seatButton("1D")).toHaveAttribute("aria-pressed", "true")
    expect(seatButton("1B")).toHaveAttribute("aria-pressed", "false")
    expect(seatButton("1C")).toHaveAttribute("aria-pressed", "false")
  })
})

describe("SeatSelectionDialog 적용된 호차 복원", () => {
  // 같은 좌석 번호가 있는 일반실 2칸 + 특실 1칸
  const twoCars: CarInfo[] = [
    { id: 13, carNumber: "3", carType: "STANDARD", totalSeats: 40, remainingSeats: 31, seatArrangement: "2+2" },
    { id: 14, carNumber: "4", carType: "STANDARD", totalSeats: 40, remainingSeats: 20, seatArrangement: "2+2" },
    { id: 11, carNumber: "1", carType: "FIRST_CLASS", totalSeats: 20, remainingSeats: 9, seatArrangement: "2+1" },
  ]

  const renderWithCars = (appliedCar: number | null, appliedSeats: string[] = ["1A"]) => {
    const onApply = vi.fn()
    render(
      <SeatSelectionDialog
        isOpen
        onClose={vi.fn()}
        selectedTrain={train}
        selectedSeatType="standardSeat"
        appliedSeats={appliedSeats}
        appliedCar={appliedCar}
        onApply={onApply}
        maxSeats={1}
        carList={twoCars}
        seatList={seats}
        loadingCars={false}
        loadingSeats={false}
        onCarSelect={vi.fn()}
        onRefreshSeats={vi.fn()}
        returnFocusRef={{ current: null }}
      />,
    )
    return { onApply }
  }

  it("적용된 호차로 다시 열면 그 호차가 선택되고 적용 시 같은 호차를 넘긴다", () => {
    const { onApply } = renderWithCars(4)

    expect(screen.getByText(/4호차 \(일반실\)/)).toBeInTheDocument()
    act(() => screen.getByRole("button", { name: /선택적용/ }).click())
    expect(onApply).toHaveBeenCalledWith(["1A"], 4)
  })

  it("적용된 좌석이 없으면 좌석 등급에 맞는 첫 호차를 선택한다", () => {
    const { onApply } = renderWithCars(null, [])

    expect(screen.getByText(/3호차 \(일반실\)/)).toBeInTheDocument()
    act(() => seatButton("1A").click())
    act(() => screen.getByRole("button", { name: /선택적용/ }).click())
    expect(onApply).toHaveBeenCalledWith(["1A"], 3)
  })

  it("적용된 호차가 목록에 없으면 첫 호차로 되돌린다", () => {
    const { onApply } = renderWithCars(9)

    expect(screen.getByText(/3호차 \(일반실\)/)).toBeInTheDocument()
    act(() => screen.getByRole("button", { name: /선택적용/ }).click())
    expect(onApply).toHaveBeenCalledWith(["1A"], 3)
  })

  it("좌석 등급이 다른 호차는 복원하지 않는다", () => {
    const { onApply } = renderWithCars(1)

    expect(screen.getByText(/3호차 \(일반실\)/)).toBeInTheDocument()
    act(() => screen.getByRole("button", { name: /선택적용/ }).click())
    expect(onApply).toHaveBeenCalledWith(["1A"], 3)
  })
})

describe("SeatSelectionDialog 범례", () => {
  it("상태와 방향 범례를 이름 있는 그룹으로 전달한다", () => {
    renderDialog()

    const status = screen.getByRole("group", { name: "좌석 상태" })
    expect(within(status).getByText("선택 가능")).toBeInTheDocument()
    expect(within(status).getByText("매진")).toBeInTheDocument()
    const direction = screen.getByRole("group", { name: "좌석 방향" })
    expect(within(direction).getByText("역방향")).toBeInTheDocument()
  })
})
