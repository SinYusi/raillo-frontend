/**
 * 로그인 뒤 돌아갈 경로 — 같은 사이트 안 경로만 허용한다.
 * `//evil.com`·`/\evil.com`(브라우저가 외부 주소로 해석)이나 절대 URL로 보내는 열린 리다이렉트를 막고,
 * 로그인 화면 자신으로 돌아가는 값은 반복을 피하려고 기본 경로로 바꾼다.
 */
export function getSafeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  const pathname = value.split(/[?#]/)[0];
  if (pathname === "/login" || pathname.startsWith("/login/")) return fallback;
  return value;
}

/** 현재 주소의 `redirectTo`를 검사해 돌아갈 경로를 돌려준다 */
export function getRedirectPathFromLocation(fallback = "/"): string {
  return getSafeRedirectPath(new URLSearchParams(window.location.search).get("redirectTo"), fallback);
}
