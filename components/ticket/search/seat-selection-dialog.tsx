"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type {
  CarInfo,
  SeatDetail,
  TrainSchedule,
  SeatType,
} from "@/types/trainType";
import {
  TrainSeatGrid,
  type SeatGridItem,
} from "@/components/ticket/search/TrainSeatGrid";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { restoreFocus, type ReturnFocusRef } from "./overlay-focus";
import { matchesSeatType, pickSeatCar } from "./seat-car";

interface SeatSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrain: TrainSchedule | null;
  selectedSeatType: SeatType;
  /** 이미 적용된 좌석 — 열 때 고르는 중인 좌석의 시작값 */
  appliedSeats: string[];
  /** 이미 적용된 호차 번호 — 열 때 이 호차를 복원한다. 적용된 좌석이 없으면 null */
  appliedCar: number | null;
  onApply: (selectedSeats: string[], selectedCar: number) => void;
  /** 고를 수 있는 좌석 수 (총 승객 수) */
  maxSeats: number;
  // 새로운 props 추가
  carList: CarInfo[];
  seatList: SeatDetail[];
  loadingCars: boolean;
  loadingSeats: boolean;
  onCarSelect: (carId: string) => void;
  // 좌석 정보 새로고침 함수 추가
  onRefreshSeats: () => void;
  /** 닫힌 뒤 포커스를 돌려줄 요소 (열차 카드의 선택 버튼) */
  returnFocusRef: ReturnFocusRef;
}

export function SeatSelectionDialog({
  isOpen,
  onClose,
  selectedTrain,
  selectedSeatType,
  appliedSeats,
  appliedCar,
  onApply,
  maxSeats,
  carList,
  seatList,
  loadingCars,
  loadingSeats,
  onCarSelect,
  onRefreshSeats,
  returnFocusRef,
}: SeatSelectionDialogProps) {
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  // 고르는 중인 좌석은 다이얼로그가 가진다 — 좌석을 누를 때 페이지(열차 목록)가 다시 렌더되지 않도록.
  // 열릴 때마다 적용된 좌석으로 시작하고, 선택적용을 눌러야 페이지에 반영된다.
  const [selectedSeats, setSelectedSeats] = useState<string[]>(appliedSeats);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setSelectedSeats(appliedSeats);
  }
  const onCarSelectRef = useRef(onCarSelect);

  // onCarSelect 함수를 ref에 저장
  useEffect(() => {
    onCarSelectRef.current = onCarSelect;
  }, [onCarSelect]);

  useEffect(() => {
    if (!isOpen) {
      setSelectionError(null);
    }
  }, [isOpen]);

  // 열릴 때 호차 선택 — 적용된 호차가 있으면 복원하고, 없으면 좌석 등급에 맞는 첫 호차
  useEffect(() => {
    if (!isOpen) return;
    // 적용된 호차가 목록에 없거나 좌석 등급이 다르면 첫 호차로 되돌린다
    const car = pickSeatCar(carList, selectedSeatType, appliedCar);
    if (!car) return;

    setSelectedCar(car);
    // selectedCar가 설정되면 아래 effect가 onCarSelect를 호출하므로 여기서 좌석을 다시 받지 않는다
  }, [isOpen, carList, selectedSeatType, appliedCar]);

  // selectedCar가 변경될 때만 onCarSelect 호출 (중복 방지)
  const lastSelectedCarId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedCar && isOpen) {
      const carId = selectedCar.id.toString();

      // 같은 객차가 이미 선택된 경우 중복 호출 방지
      if (lastSelectedCarId.current === carId) {
        return;
      }

      lastSelectedCarId.current = carId;
      onCarSelectRef.current(carId);
    }
  }, [selectedCar, isOpen]);

  // 객차 변경 핸들러
  const handleCarChange = (carId: string) => {
    const car = carList.find((c) => c.id.toString() === carId);
    if (car) {
      setSelectedCar(car);
      setSelectionError(null);
      // 객차 변경 시 선택된 좌석 초기화
      setSelectedSeats([]);
    }
  };

  // 좌석 타입에 따른 객차 필터링
  const getFilteredCars = () => carList.filter((car) => matchesSeatType(car, selectedSeatType));

  // 좌석 배열 생성 (API 데이터 기반)
  const generateSeatGrid = (): SeatGridItem[] => {
    if (!seatList.length) return [];

    const seats: SeatGridItem[] = [];
    for (const seat of seatList) {
      const match = seat.seatNumber.match(/^(\d+)([A-Z])$/);
      if (match) {
        const [, row, col] = match;
        seats.push({
          ...seat,
          row: parseInt(row),
          column: col,
          isWindow: seat.seatType === "WINDOW",
        });
      }
    }

    return seats.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.column.localeCompare(b.column);
    });
  };

  const seatGrid = generateSeatGrid();
  const filteredCars = getFilteredCars();

  // 좌석 채움은 상태 전용 — 방향은 좌석 안 등받이 막대(TrainSeatGrid)로 표시한다
  const getSeatButtonStyle = (
    seat: SeatDetail & { isWindow: boolean },
    isSelected: boolean,
  ): string => {
    if (!seat.isAvailable) {
      return "seat-hatch bg-muted border-border text-muted-foreground cursor-not-allowed";
    }
    if (isSelected) {
      return "bg-primary text-primary-foreground border-primary-active shadow-lg";
    }
    return "bg-card border-input text-foreground hover:bg-muted";
  };

  const handleSeatSelectionClick = (
    seat: SeatDetail,
    seatNumber: string,
    isSelected: boolean,
  ) => {
    if (!seat.isAvailable) return;

    if (!isSelected && selectedSeats.length >= maxSeats) {
      setSelectionError(
        `승객 수는 ${maxSeats}명입니다. 좌석은 최대 ${maxSeats}개까지 선택할 수 있습니다.`,
      );
      return;
    }

    setSelectionError(null);
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber],
    );
  };

  if (!selectedTrain) return null;

  return (
    // Dialog(Radix): role="dialog"·aria-modal, 포커스 트랩, Esc 닫기, 닫힌 뒤 포커스 복귀, 우측 상단 닫기 버튼 제공
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="block w-[calc(100%-2rem)] max-w-7xl max-h-[95vh] gap-0 overflow-hidden p-0 shadow-elev-lg [&>button:last-child]:right-6 [&>button:last-child]:top-7"
        // 바깥 클릭으로는 닫지 않음(기존 동작) — 고르던 좌석이 실수로 초기화되지 않도록
        onInteractOutside={(event) => event.preventDefault()}
        // 트리거 없이 상태로 여닫는 모달 — 페이지가 기억한 열차 카드의 선택 버튼으로 포커스 복귀
        // (예매 패널 안의 버튼은 전환 뒤 사라지므로 복귀 대상으로 쓰지 않는다)
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus(returnFocusRef.current);
        }}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-6 pr-16 border-b bg-card">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full" aria-hidden="true"></div>
            <DialogTitle className="text-xl font-bold text-foreground">
              좌석선택 - {selectedTrain.trainName} {selectedTrain.trainNumber}
            </DialogTitle>
            {selectedCar && (
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {selectedCar.carNumber}호차 (
                {selectedCar.carType === "FIRST_CLASS" ? "특실" : "일반실"})
              </span>
            )}
          </div>
        </div>

        {/* Car Selection */}
        <div className="p-4 border-b bg-muted">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-foreground">
                호차 선택:
              </span>
              {loadingCars ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-muted-foreground">
                    객차 정보 로딩 중...
                  </span>
                </div>
              ) : (
                <Select
                  value={selectedCar?.id.toString() || ""}
                  onValueChange={handleCarChange}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="객차를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {filteredCars.map((car) => (
                      <SelectItem key={car.id} value={car.id.toString()}>
                        {car.carNumber}호차 ({car.remainingSeats}/
                        {car.totalSeats}석)
                        {car.carType === "FIRST_CLASS" ? " 특실" : " 일반실"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Seat Legend — 상태(채움)와 방향(등받이 막대)을 따로 묶는다 */}
        <div className="p-4 border-b bg-card">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center gap-5" aria-label="좌석 상태">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded border-2 bg-card border-input" aria-hidden="true"></div>
                <span className="text-foreground">선택 가능</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded border-2 bg-primary border-primary-active" aria-hidden="true"></div>
                <span className="text-foreground">선택됨</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded border-2 seat-hatch bg-muted border-border" aria-hidden="true"></div>
                <span className="text-foreground">매진</span>
              </div>
            </div>
            <div className="flex items-center gap-5 sm:border-l sm:pl-8" aria-label="좌석 방향">
              <div className="flex items-center space-x-2">
                <div className="relative w-5 h-5 rounded border-2 bg-card border-input" aria-hidden="true">
                  <span className="absolute inset-y-0.5 left-0.5 w-[3px] rounded-full bg-muted-foreground"></span>
                </div>
                <span className="text-foreground">
                  순방향 <span className="text-muted-foreground">(등받이가 진행 반대쪽)</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative w-5 h-5 rounded border-2 bg-card border-input" aria-hidden="true">
                  <span className="absolute inset-y-0.5 right-0.5 w-[3px] rounded-full bg-muted-foreground"></span>
                </div>
                <span className="text-foreground">역방향</span>
              </div>
            </div>
          </div>
        </div>

        {/* Train Seat Map */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          {loadingSeats ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="md" />
                <span className="text-muted-foreground">좌석 정보 로딩 중...</span>
              </div>
            </div>
          ) : seatGrid.length > 0 ? (
            <>
            {/* 배치도는 최소 폭이 있어 좁은 화면에서는 가로로 스크롤된다 */}
            <p className="mb-3 text-xs text-muted-foreground lg:hidden">
              배치도가 화면보다 넓으면 좌우로 밀어서 볼 수 있습니다
            </p>
            <TrainSeatGrid
              seatGrid={seatGrid}
              selectedSeats={selectedSeats}
              selectedTrain={selectedTrain}
              selectedCar={selectedCar}
              selectedSeatType={selectedSeatType}
              onSeatSelectionClick={handleSeatSelectionClick}
              getSeatButtonStyle={getSeatButtonStyle}
            />
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-muted-foreground text-6xl mb-4">🚂</div>
                <p className="text-muted-foreground">좌석 정보를 불러올 수 없습니다.</p>
                <p className="text-sm text-muted-foreground">객차를 선택해주세요.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="p-6 border-t bg-muted">
          {selectionError && (
            <p role="alert" className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
              {selectionError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              선택된 좌석:{" "}
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "없음"}
            </div>
            <Button
              onClick={() =>
                onApply(
                  selectedSeats,
                  selectedCar ? parseInt(selectedCar.carNumber) : 1,
                )
              }
              disabled={selectedSeats.length !== maxSeats}
              className="px-8 py-2 rounded-lg font-medium"
            >
              선택적용 ({selectedSeats.length}명 좌석 선택/총 {maxSeats}명)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
