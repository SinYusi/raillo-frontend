// 경로 해석용 임의 기준 주소 — 값을 이 주소 기준으로 풀었을 때 출처가 바뀌면 외부 주소다
const BASE_ORIGIN = "http://raillo.local";

/**
 * 로그인 뒤 돌아갈 경로 — 같은 사이트 안 경로만 허용한다.
 * 문자열로 검사하지 않고 브라우저와 같은 규칙(URL)으로 먼저 풀어 본다: `//evil.com`·`/\evil.com`·
 * 탭·줄바꿈이 섞인 `/\t/evil.com`처럼 브라우저가 외부 주소로 해석하는 값을 모두 거른다(열린 리다이렉트 방지).
 * 로그인 화면 자신은 대소문자·퍼센트 인코딩(`/Login`·`/%6Cogin`)과 관계없이 기본 경로로 바꿔 반복을 피한다.
 * 돌려주는 값은 입력 그대로가 아니라 풀어 낸 경로·쿼리·해시다.
 */
export function getSafeRedirectPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/")) return fallback;

  let url: URL;
  try {
    url = new URL(value, BASE_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE_ORIGIN) return fallback;

  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname).toLowerCase();
  } catch {
    return fallback;
  }
  if (pathname === "/login" || pathname.startsWith("/login/")) return fallback;

  return url.pathname + url.search + url.hash;
}

/** 현재 주소의 `redirectTo`를 검사해 돌아갈 경로를 돌려준다 */
export function getRedirectPathFromLocation(fallback = "/"): string {
  return getSafeRedirectPath(new URLSearchParams(window.location.search).get("redirectTo"), fallback);
}
