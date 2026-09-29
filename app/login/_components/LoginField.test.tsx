import { StrictMode } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { login } from "@/lib/api/authentication"
import { LOCAL_STORAGE_KEYS, SESSION_STORAGE_KEYS } from "@/constants/storageKeys"
import LoginField from "./LoginField"

vi.mock("@/lib/api/authentication", () => ({ login: vi.fn() }))
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast: vi.fn() }) }))

const memberNumberInput = () => screen.getByLabelText(/회원번호/) as HTMLInputElement

const renderLogin = () =>
  render(
    <StrictMode>
      <LoginField />
    </StrictMode>,
  )

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

describe("로그인 회원번호 자동 입력", () => {
  it("회원번호 찾기에서 넘어오면 찾은 회원번호로 칸을 채우고 저장소에서 지운다", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, "M20260926001")

    renderLogin()

    expect(memberNumberInput().value).toBe("M20260926001")
    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER)).toBeNull()
  })

  it("회원가입 완료에서 넘어오면 기존처럼 가입한 회원번호로 채운다", () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER, "M20260926002")

    renderLogin()

    expect(memberNumberInput().value).toBe("M20260926002")
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER)).toBeNull()
  })

  it("둘 다 있으면 방금 찾은 회원번호를 쓰고 둘 다 지운다", () => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER, "M20260926001")
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER, "M20260926002")

    renderLogin()

    expect(memberNumberInput().value).toBe("M20260926001")
    expect(sessionStorage.getItem(SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER)).toBeNull()
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.SIGNUP_MEMBER_NUMBER)).toBeNull()
  })

  it("넘겨받은 회원번호가 없으면 비워 둔다", () => {
    renderLogin()

    expect(memberNumberInput().value).toBe("")
  })
})

describe("로그인 성공 후 이동", () => {
  const originalLocation = window.location
  const navigation = { href: "", search: "" }

  beforeEach(() => {
    navigation.href = ""
    vi.mocked(login).mockResolvedValue({ accessToken: "token", accessTokenExpiresIn: 3600 } as Awaited<ReturnType<typeof login>>)
    // jsdom은 주소 이동을 하지 않으므로 이동할 주소만 기록한다
    Object.defineProperty(window, "location", { configurable: true, value: navigation })
  })

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation })
  })

  const submit = async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(memberNumberInput(), "M20260926001")
    await user.type(screen.getByLabelText(/^비밀번호/, { selector: "input" }), "password1!")
    await user.click(screen.getByRole("button", { name: "로그인" }))
  }

  it("로그인이 필요해 넘어왔으면 원래 가려던 화면으로 간다", async () => {
    navigation.search = "?redirectTo=%2Fticket%2Fhistory"
    await submit()
    await waitFor(() => expect(navigation.href).toBe("/ticket/history"))
  })

  it("돌아갈 경로가 없거나 외부 주소면 홈으로 간다", async () => {
    navigation.search = "?redirectTo=%2F%2Fevil.example"
    await submit()
    await waitFor(() => expect(navigation.href).toBe("/"))
  })
})
