"use client";

import { useRef, useState, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import MyPageShell from "@/components/layout/MyPageShell";
import { EmailVerificationStep } from "@/components/mypage/EmailVerificationStep";
import { VERIFICATION_TTL_MS } from "@/constants/validation";
import { useGetMemberInfo } from "@/hooks/useUser";
import { useToast } from "@/hooks/useToast";
import {
  formatRemaining,
  useVerificationTimer,
} from "@/hooks/useVerificationTimer";

interface VerifiedChangeFlowProps {
  /** 화면 제목 (예: 비밀번호 변경) */
  title: string;
  /** 2단계 이름 (예: 새 비밀번호) */
  changeStepLabel: string;
  /** 2단계 내용 — 인증 전에는 렌더되지 않는다 */
  children: ReactNode;
}

/** 남은 시간을 소리로 알리는 구간 — 매초 읽히면 방해가 된다 */
const ANNOUNCE_UNDER_SECONDS = 60;

/**
 * 회원정보 변경 흐름 — 1단계 이메일 인증 → 2단계 변경.
 * 인증 상태는 이 화면에만 있고 저장소에 남기지 않는다(떠나거나 새로고침하면 1단계부터).
 * 인증 후 VERIFICATION_TTL_MS가 지나면 2단계를 닫아 입력값을 버리고 1단계로 되돌린다.
 */
export function VerifiedChangeFlow({
  title,
  changeStepLabel,
  children,
}: VerifiedChangeFlowProps) {
  const { toast } = useToast();
  const { data: memberInfo = null, isLoading } = useGetMemberInfo();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleExpire = () => {
    setExpiresAt(null);
    toast({
      title: "인증 시간 만료",
      description: "인증 시간이 만료되었습니다. 다시 인증해주세요.",
      variant: "destructive",
    });
    headingRef.current?.focus();
  };

  const remainingMs = useVerificationTimer(expiresAt, handleExpire);
  const verified = expiresAt !== null;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return (
    <MyPageShell memberInfo={memberInfo || undefined} isLoading={isLoading}>
      <Card>
        <CardContent className="p-8">
          <div className="mb-8">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-bold text-foreground mb-3 outline-none"
            >
              {title}
            </h1>
            <div className="flex items-center justify-between gap-4 text-sm">
              <ol className="flex items-center gap-2 text-muted-foreground">
                <li aria-current={verified ? undefined : "step"} className={verified ? "" : "font-semibold text-foreground"}>
                  1 이메일 인증
                </li>
                <li aria-hidden="true">·</li>
                <li aria-current={verified ? "step" : undefined} className={verified ? "font-semibold text-foreground" : ""}>
                  2 {changeStepLabel}
                </li>
              </ol>
              {verified && (
                // 시계는 조용히 표시하고, 1분 남았을 때만 알린다
                <p className="text-muted-foreground tabular-nums">
                  인증 유효 시간 <span aria-hidden="true">{formatRemaining(remainingMs)}</span>
                  <span className="sr-only" aria-live="polite">
                    {remainingSeconds > 0 && remainingSeconds <= ANNOUNCE_UNDER_SECONDS
                      ? "인증 유효 시간이 1분 남았습니다."
                      : ""}
                  </span>
                </p>
              )}
            </div>
          </div>

          {verified ? (
            children
          ) : (
            <EmailVerificationStep
              onVerified={() => setExpiresAt(Date.now() + VERIFICATION_TTL_MS)}
            />
          )}
        </CardContent>
      </Card>
    </MyPageShell>
  );
}
