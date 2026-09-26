import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

/**
 * 목록·대시보드 화면의 페이지 제목 — 왼쪽 정렬 h1 + 설명.
 * 페이지·로딩·오류 화면이 같은 제목을 쓰도록 한 곳에서 그린다(폼·인증 화면은 카드 중앙 제목을 그대로 쓴다).
 */
export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
    </div>
  );
}
