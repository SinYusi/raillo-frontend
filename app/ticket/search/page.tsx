"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { TRAIN_SEARCH_QUERY_KEY, useTrainSearch } from "@/hooks/useTrainSearch";
import { useSearchConditions } from "@/hooks/useSearchConditions";
import { useSeatInventory } from "@/hooks/useSeatInventory";
import { useCreatePendingBooking } from "@/hooks/useCreatePendingBooking";
import { useToast } from "@/hooks/useToast";
import { handleError } from "@/lib/utils/errorHandler";
import { toSeatIds } from "@/lib/utils/pendingBooking";
import { saveSearchHistory } from "@/lib/utils/searchHistory";
import { BookingPanel } from "@/components/ticket/search/booking-panel";
import { SearchForm } from "@/components/ticket/search/search-form";
import { TrainList } from "@/components/ticket/search/train-list";
import { TrainListSkeleton } from "@/components/ticket/search/TrainListSkeleton";
import { UsageInfo } from "@/components/common/usage-info";
import type { TrainSchedule, SeatType, TrainSearchRequest } from "@/types/trainType";

// 좌석 선택 다이얼로그는 호차 선택(Radix Select)까지 포함해 무겁고 예매 패널에서만 열리므로 필요할 때 받는다
const SeatSelectionDialog = dynamic(
  () =>
    import("@/components/ticket/search/seat-selection-dialog").then(
      (mod) => mod.SeatSelectionDialog,
    ),
  { ssr: false },
);

// 조회 결과·선택한 열차·오버레이 상태를 가지고 조건·좌석 조회·예약 생성 훅을 조합한다
function TrainSearchPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const conditions = useSearchConditions();
  const { departureStation, arrivalStation, dateStr, date, passengerCounts, totalPassengers } = conditions;

  // 조회 버튼으로 확정한 검색 조건 — URL은 폼을 바꿀 때마다 갱신되므로 조회 키로 쓰지 않는다
  const [searchRequest, setSearchRequest] = useState<TrainSearchRequest | null>(
    () => (conditions.hasConditions ? conditions.buildSearchRequest() : null),
  );
  const {
    data: searchData,
    error: searchError,
    errorUpdatedAt,
    isPending: searchPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useTrainSearch(searchRequest);
  const displayedTrains = useMemo(
    () => searchData?.pages.flatMap((page) => page.content) ?? [],
    [searchData],
  );
  const loading = searchRequest !== null && searchPending;

  // 선택한 열차와 오버레이(예매 패널·좌석 선택)
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>("standardSeat");
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  // 예매 패널을 처음 열 때 좌석 선택 다이얼로그를 마운트해 미리 받아 둔다 (닫힌 뒤에도 유지)
  const [seatDialogMounted, setSeatDialogMounted] = useState(false);
  // 선택적용으로 확정된 좌석과 호차
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedCar, setSelectedCar] = useState(1);

  const inventory = useSeatInventory({
    departureStation,
    arrivalStation,
    passengerCount: totalPassengers,
  });
  const { carList, seatList, loadingCars, loadingSeats, fetchCars, fetchSeats } = inventory;

  // 첫 진입 처리(검색 기록·역 오류 알림)를 한 번만 하기 위한 플래그
  const didInitSearch = useRef(false);
  // 이 화면에 들어온 시각 — 재방문 때 캐시에 남아 있던 이전 오류는 다시 알리지 않는다
  const mountedAtRef = useRef(Date.now());
  // 예매 패널·좌석 선택 다이얼로그를 닫은 뒤 포커스를 돌려줄 요소
  const overlayReturnFocusRef = useRef<HTMLElement | null>(null);

  const notifyStationNotFound = () => {
    toast({
      title: "오류",
      description: "역 정보를 찾을 수 없습니다.",
      variant: "destructive",
    });
  };

  // 조회 버튼: 현재 URL 조건을 확정하고 0페이지부터 다시 받는다
  const submitSearch = () => {
    saveSearchHistory(departureStation, arrivalStation);
    const request = conditions.buildSearchRequest();
    if (!request) {
      notifyStationNotFound();
      return;
    }
    // 같은 조건이어도 쌓인 페이지를 버리고 새로 조회한다 (진행 중이던 요청은 취소됨)
    queryClient.removeQueries({
      queryKey: [...TRAIN_SEARCH_QUERY_KEY, request],
      exact: true,
    });
    setSearchRequest(request);
  };

  // 첫 진입: URL 조건이 있으면 검색 기록을 남기고, 역을 찾지 못했으면 알린다
  useEffect(() => {
    if (didInitSearch.current) return;
    didInitSearch.current = true;
    if (!conditions.hasConditions) return;
    saveSearchHistory(departureStation, arrivalStation);
    if (!searchRequest) notifyStationNotFound();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 조회·더보기 실패 알림 — 이 화면에 들어온 뒤 생긴 오류만
  useEffect(() => {
    if (!searchError || errorUpdatedAt < mountedAtRef.current) return;
    toast({
      title: "오류",
      description: handleError(
        searchError,
        isFetchNextPageError
          ? "열차 목록을 불러오는 데 실패했습니다."
          : "열차 검색에 실패했습니다.",
      ),
      variant: "destructive",
    });
  }, [searchError, errorUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateSearch = () => {
    if (!dateStr) {
      toast({
        title: "입력 오류",
        description: "출발일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      toast({
        title: "입력 오류",
        description: "가는 날짜는 오늘 이후여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    conditions.markSearched();
    submitSearch();
  };

  const handleSeatSelection = (
    train: TrainSchedule,
    seatType: SeatType,
    trigger: HTMLElement,
  ) => {
    // 오버레이(예매 패널·좌석 선택)를 닫은 뒤 돌아갈 대상 = 지금 누른 열차 카드의 선택 버튼
    overlayReturnFocusRef.current = trigger;
    const seatInfo = train[seatType];
    if (!seatInfo?.canReserve) {
      toast({
        title: "알림",
        description: "선택하신 좌석은 매진되었습니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedTrain(train);
    setSelectedSeatType(seatType);

    if (train.trainScheduleId) {
      fetchCars(train.trainScheduleId);
    }

    setSeatDialogMounted(true);
    setShowBookingPanel(true);
  };

  // 열차 카드(memo)에 넘기는 선택 핸들러는 참조를 고정한다 — 최신 핸들러는 ref로 호출
  const handleSeatSelectionRef = useRef(handleSeatSelection);
  useEffect(() => {
    handleSeatSelectionRef.current = handleSeatSelection;
  });
  const onSeatSelection = useCallback(
    (train: TrainSchedule, seatType: SeatType, trigger: HTMLElement) =>
      handleSeatSelectionRef.current(train, seatType, trigger),
    [],
  );

  const handleLoadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    // 이미 받는 중이면 새 요청을 만들지 않는다 — 비활성화가 렌더되기 전의 연속 클릭 포함
    void fetchNextPage({ cancelRefetch: false });
  };

  const closeBookingPanel = () => {
    setShowBookingPanel(false);
    setSelectedTrain(null);
    setSelectedSeats([]);
    setSelectedCar(1);
    inventory.reset();
  };

  const createBooking = useCreatePendingBooking(closeBookingPanel);

  const handleBooking = async () => {
    if (!selectedTrain) return;
    await createBooking({
      train: selectedTrain,
      departureStation,
      arrivalStation,
      passengerCounts,
      seatIds: toSeatIds(selectedSeats, seatList),
    });
  };

  const handleSeatSelectionApply = (seats: string[], car: number) => {
    if (seats.length !== totalPassengers) {
      toast({
        title: "알림",
        description: `${totalPassengers}개의 좌석을 선택해주세요.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedSeats(seats);
    setSelectedCar(car);
    setShowSeatSelection(false);
    setShowBookingPanel(true);
  };

  // 좌석 정보 새로고침 함수
  const handleRefreshSeats = () => {
    if (selectedTrain && selectedTrain.trainScheduleId) {
      const currentCar = carList.find(
        (car) => parseInt(car.carNumber) === selectedCar,
      );
      if (currentCar) {
        fetchSeats(currentCar.id.toString(), selectedTrain.trainScheduleId);
      }
    }
  };

  if (loading) {
    return <TrainListSkeleton />;
  }

  return (
    // 로딩 스켈레톤과 같은 최소 높이 — 결과 수(빈 결과 포함)에 따라 푸터 위치가 바뀌지 않게 한다
    <div className="container mx-auto min-h-screen px-4 py-4 md:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Search Form */}
        <SearchForm
          departureStation={departureStation}
          arrivalStation={arrivalStation}
          date={date}
          passengerCounts={passengerCounts}
          searchConditionsChanged={conditions.conditionsChanged}
          onDepartureStationChange={conditions.changeDepartureStation}
          onArrivalStationChange={conditions.changeArrivalStation}
          onDateChange={conditions.changeDate}
          onPassengerChange={conditions.changePassengers}
          onSearch={handleUpdateSearch}
          onBothStationsChange={conditions.changeStations}
        />

        {/* Train List */}
        <div className="space-y-3 lg:space-y-4">
          {/* 할인 안내 전문은 아래 이용 안내 한 곳에만 — 제목 줄은 짧게 둬 모바일에서도 한 줄 */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-bold text-foreground">검색 결과</h2>
            <p className="text-sm text-muted-foreground">요금은 어른 기준 · 할인은 아래 이용 안내 참고</p>
          </div>

          <TrainList
            displayedTrains={displayedTrains}
            selectedTrain={selectedTrain}
            loadingMore={isFetchingNextPage}
            // 더보기가 실패해도 버튼을 남긴다 — 다시 누르면 같은 페이지를 다시 요청한다
            hasMoreTrains={Boolean(hasNextPage)}
            onSeatSelection={onSeatSelection}
            onLoadMore={handleLoadMore}
          />
        </div>

        {/* Usage Info */}
        <UsageInfo />
      </div>

      {/* Seat Selection Dialog */}
      {seatDialogMounted && (
        <SeatSelectionDialog
          isOpen={showSeatSelection}
          onClose={() => {
            setShowSeatSelection(false);
            setSelectedSeats([]);
          }}
          selectedTrain={selectedTrain}
          selectedSeatType={selectedSeatType}
          appliedSeats={selectedSeats}
          // 적용한 좌석이 있을 때만 그 호차를 복원한다 — 없으면 첫 적합 호차
          appliedCar={selectedSeats.length > 0 ? selectedCar : null}
          onApply={handleSeatSelectionApply}
          maxSeats={totalPassengers}
          carList={carList}
          seatList={seatList}
          loadingCars={loadingCars}
          loadingSeats={loadingSeats}
          onCarSelect={(carId: string) => {
            if (selectedTrain && selectedTrain.trainScheduleId) {
              fetchSeats(carId, selectedTrain.trainScheduleId);
            }
          }}
          onRefreshSeats={handleRefreshSeats}
          returnFocusRef={overlayReturnFocusRef}
        />
      )}

      {/* Booking Panel */}
      <BookingPanel
        isOpen={showBookingPanel}
        onClose={closeBookingPanel}
        selectedTrain={selectedTrain}
        selectedSeatType={selectedSeatType}
        selectedSeats={selectedSeats}
        selectedCar={selectedCar}
        onSeatSelection={() => {
          setShowBookingPanel(false);
          setTimeout(() => {
            setShowSeatSelection(true);
          }, 100);
        }}
        onBooking={handleBooking}
        carList={carList}
        loadingCars={loadingCars}
        onRefreshSeats={handleRefreshSeats}
        returnFocusRef={overlayReturnFocusRef}
      />
    </div>
  );
}

export default function TrainSearchPageWrapper() {
  return (
    <Suspense
      fallback={<TrainListSkeleton />}
    >
      <TrainSearchPage />
    </Suspense>
  );
}
