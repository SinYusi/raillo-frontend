import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

// 라우트 전환 중 — 페이지 데이터 로딩과 같은 목록 스켈레톤
export default function Loading() {
  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="예약승차권 조회" description="예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다" />
          <CardListSkeleton label="예약 목록을 불러오는 중" />
        </div>
      </div>
    </div>
  );
}
