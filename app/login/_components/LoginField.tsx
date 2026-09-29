"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/api/authentication";
import { handleError } from "@/lib/utils/errorHandler";
import { getRedirectPathFromLocation } from "@/lib/utils/safeRedirect";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/useToast";
import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/constants/storageKeys";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const loginSchema = z.object({
  memberNumber: z.string().min(1, "회원번호를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginField = () => {
  const [showPassword, setShowPassword] = useState(false);
  const setTokens = useAuthStore((state) => state.setTokens);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { memberNumber: "", password: "" },
  });

  // 넘겨받은 회원번호로 칸을 채운다 — 회원번호 찾기 결과(sessionStorage)가 가입 완료(localStorage)보다 최근 의도라 먼저 본다
  useEffect(() => {
    const foundMemberNo = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER,
    );
    const signupMemberNo = localStorage.getItem(
      LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER,
    );
    const memberNo = foundMemberNo ?? signupMemberNo;
    if (memberNo) setValue("memberNumber", memberNo);

    if (foundMemberNo) {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER);
    }
    if (signupMemberNo) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login({
        memberNo: data.memberNumber,
        password: data.password,
      });
      const expiresIn = Date.now() + result.accessTokenExpiresIn * 1000;
      setTokens(result.accessToken, expiresIn);
      // 로그인이 필요해 넘어온 경우 원래 가려던 화면으로 돌아간다(같은 사이트 경로만)
      window.location.href = getRedirectPathFromLocation();
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(error, "로그인에 실패했습니다."),
        variant: "destructive",
      });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label
          htmlFor="memberNumber"
          className="text-sm font-medium text-foreground"
        >
          회원번호
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="memberNumber"
            type="text"
            placeholder="회원번호를 입력하세요"
            {...register("memberNumber")}
            className={`pl-10 ${errors.memberNumber ? "border-red-500 dark:border-red-400" : ""}`}
            disabled={isSubmitting}
            aria-invalid={!!errors.memberNumber}
            aria-describedby={errors.memberNumber ? "memberNumber-error" : undefined}
            autoFocus
          />
        </div>
        {errors.memberNumber && (
          <p id="memberNumber-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.memberNumber.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          비밀번호
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            {...register("password")}
            className={`pl-10 pr-10 ${errors.password ? "border-red-500 dark:border-red-400" : ""}`}
            disabled={isSubmitting}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full font-semibold py-3"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            로그인 중...
          </div>
        ) : (
          "로그인"
        )}
      </Button>
    </form>
  );
};

export default LoginField;
