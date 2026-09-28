import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** 다음 동작 버튼·링크 */
  action?: ReactNode;
  /** 제목 수준 — 페이지 제목(h1) 바로 아래에 놓이면 2, 구역 제목(h2) 아래면 3(기본) */
  headingLevel?: 2 | 3;
  className?: string;
}

/** 빈 목록 상태 — 아이콘 타일 · 제목 · 설명 · 동작 (목업 상태 문서) */
export function EmptyState({ icon: Icon, title, description, action, headingLevel = 3, className }: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <Card className={className}>
      <CardContent className="px-6 py-11 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-card border bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <Heading className="mb-1.5 text-lg font-bold text-foreground">{title}</Heading>
        {description && <p className={cn("text-sm text-muted-foreground", action && "mb-5")}>{description}</p>}
        {action}
      </CardContent>
    </Card>
  );
}
