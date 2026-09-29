"use client";

import { Card } from "@/components/ui/card";
import LoginHeader from "./_components/LoginHeader";
import LoginField from "./_components/LoginField";
import LoginHelpLinks from "./_components/LoginHelpLinks";
import { CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getRedirectPathFromLocation } from "@/lib/utils/safeRedirect";

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인된 상태면 가려던 화면(없으면 홈)으로 보낸다
    if (isAuthenticated) {
      router.push(getRedirectPathFromLocation());
    }
  }, [isAuthenticated, router]);

  return (
    <div className="py-10 flex justify-center items-center w-full">
      <Card className="shadow-elev-md w-full max-w-md">
        <LoginHeader />
        <CardContent>
          {/* 회원번호 로그인 */}
          <LoginField />
          {/* 찾기 및 회원가입 링크 */}
          <LoginHelpLinks />
          {/* 추가 안내 */}
          <div className="text-center text-xs text-muted-foreground mt-6">
            <p>
              로그인 시 RAILLO의 이용약관 및 개인정보처리방침에 동의하게 됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
