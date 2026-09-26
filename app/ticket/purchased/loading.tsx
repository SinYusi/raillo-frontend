import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

// 라우트 전환 중 — 페이지 데이터 로딩과 같은 목록 스켈레톤
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="승차권 확인" description="발권한 승차권의 운행·좌석 정보를 확인할 수 있습니다" />
          <CardListSkeleton label="승차권을 불러오는 중" />
        </div>
      </div>
    </div>
  );
}
