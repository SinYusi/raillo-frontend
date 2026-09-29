"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Mail, Smartphone } from "lucide-react";
import { useGetMemberInfo } from "@/hooks/useUser";
import MyPageShell from "@/components/layout/MyPageShell";
import { PageHeader } from "@/components/common/PageHeader";
import AuthGuard from "@/components/auth/AuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

function MyPageContent() {
  const { data: memberInfo = null, isLoading: loading } = useGetMemberInfo();

  // 회원 정보가 없을 때 기본값 사용
  const displayName = memberInfo?.name || "회원";
  const displayMemberId = memberInfo?.memberId || "로딩 중...";
  const displayEmail = memberInfo?.email || "인증 필요";
  const displayPhone = memberInfo?.phoneNumber || "인증 필요";

  return (
    <MyPageShell
      memberInfo={memberInfo || undefined}
      isLoading={loading}
      header={<PageHeader title="마이페이지" description="회원 정보와 승차권을 한곳에서 관리합니다" />}
    >
      <h2 className="mb-4 text-xl font-bold text-foreground">
        나의 기본정보
      </h2>

      {loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-muted-foreground">회원 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              {/* 회원명 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-border">
                <div className="font-medium text-foreground">회원명</div>
                <div className="md:col-span-2">
                  <span className="text-lg">{displayName}</span>
                </div>
              </div>

              {/* 멤버십 번호 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-border">
                <div className="font-medium text-foreground">멤버십 번호</div>
                <div className="md:col-span-2">
                  <span className="text-lg">{displayMemberId}</span>
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-border">
                <div className="font-medium text-foreground">비밀번호</div>
                <div className="md:col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-sm rounded-full"
                    asChild
                  >
                    <Link href="/mypage/password/change">
                      <Lock className="h-4 w-4 mr-2" />
                      비밀번호 변경
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 이메일 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-border">
                <div className="font-medium text-foreground">이메일</div>
                <div className="md:col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-sm rounded-full"
                    asChild
                  >
                    <Link href="/mypage/email/change">
                      <Mail className="h-4 w-4 mr-2" />
                      이메일 변경
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 휴대폰 번호 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5">
                <div className="font-medium text-foreground">휴대폰 번호</div>
                <div className="md:col-span-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 text-sm rounded-full"
                    asChild
                  >
                    <Link href="/mypage/phone/change">
                      <Smartphone className="h-4 w-4 mr-2" />
                      휴대폰 번호 변경
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </MyPageShell>
  );
}

export default function MyPage() {
  return (
    <AuthGuard>
      <MyPageContent />
    </AuthGuard>
  );
}
