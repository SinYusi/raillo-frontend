import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTrainTypeColor } from "@/lib/utils/ticketUtils";

interface TrainTypeBadgeProps extends Omit<BadgeProps, "children"> {
  /** 열차 등급 이름(KTX·ITX-새마을 등) — 표시 문구이자 색상 결정 기준 */
  trainName: string;
}

/** 열차 등급 뱃지 — 등급별 채움색은 getTrainTypeColor가 결정 */
export function TrainTypeBadge({ trainName, className, ...props }: TrainTypeBadgeProps) {
  return (
    <Badge className={cn(getTrainTypeColor(trainName), "px-3 py-1 whitespace-nowrap shrink-0", className)} {...props}>
      {trainName}
    </Badge>
  );
}
