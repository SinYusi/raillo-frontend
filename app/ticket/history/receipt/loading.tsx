import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { PageHeader } from "@/components/common/PageHeader";

// 라우트 전환 중 — 영수증 페이지 데이터 로딩과 같은 스켈레톤
// (없으면 상위 예매 내역 loading.tsx가 대신 보여 제목·카드 수가 달라진다)
export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <PageHeader title="영수증 상세" description="승차권 영수증 정보를 확인할 수 있습니다" className="mb-0" />
          <CardListSkeleton label="영수증 상세를 불러오는 중" count={2} />
        </div>
      </div>
    </div>
  );
}
