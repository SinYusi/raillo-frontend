"use client";

import { Button } from "@/components/ui/button";
import { Train, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { TrainCard } from "./train-card";
import type { TrainSchedule, SeatType } from "@/types/trainType";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";

interface TrainListProps {
  displayedTrains: TrainSchedule[];
  selectedTrain: TrainSchedule | null;
  loadingMore: boolean;
  hasMoreTrains: boolean;
  /** trigger: 닫은 뒤 포커스를 돌려줄 버튼 (Safari는 클릭해도 버튼에 포커스를 주지 않아 activeElement로 추정하지 않는다) */
  onSeatSelection: (train: TrainSchedule, seatType: SeatType, trigger: HTMLElement) => void;
  onLoadMore: () => void;
}

export function TrainList({
  displayedTrains,
  selectedTrain,
  loadingMore,
  hasMoreTrains,
  onSeatSelection,
  onLoadMore,
}: TrainListProps) {
  const router = useRouter();

  if (displayedTrains.length === 0) {
    return (
      <EmptyState
        icon={Train}
        title="검색 결과가 없습니다"
        description="선택하신 조건에 맞는 열차가 없습니다."
        action={
          <Button onClick={() => router.push("/")} variant="outline">
            다시 검색하기
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3 lg:space-y-4">
      {displayedTrains.map((train) => (
        <TrainCard
          key={train.trainScheduleId}
          train={train}
          isSelected={selectedTrain?.trainScheduleId === train.trainScheduleId}
          onSeatSelection={onSeatSelection}
        />
      ))}

      {/* Load More Button */}
      {hasMoreTrains && (
        <div className="text-center py-6">
          <Button
            onClick={onLoadMore}
            disabled={loadingMore}
            variant="outline"
            size="lg"
            className="px-8"
          >
            {loadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                로딩 중...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                더보기
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
