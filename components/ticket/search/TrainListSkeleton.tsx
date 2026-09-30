import LoadingSpinner from "@/components/common/LoadingSpinner";
import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { Card } from "@/components/ui/card";

/** 열차 조회 로딩 — 인라인 스피너 안내 + 열차 카드 스켈레톤 (목업 상태 문서) */
export function TrainListSkeleton() {
  return (
    // 결과 화면과 같이 최소 화면 높이 — 로딩 중에도 푸터가 화면 밖에 있어 결과가 들어와도 밀려나지 않는다
    <div className="container mx-auto min-h-screen px-4 py-4 md:py-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className="flex items-center justify-center gap-3 p-5 text-sm font-medium text-muted-foreground">
          <LoadingSpinner size="sm" />
          열차를 조회하는 중…
        </Card>
        <CardListSkeleton label="열차를 조회하는 중" />
      </div>
    </div>
  );
}
