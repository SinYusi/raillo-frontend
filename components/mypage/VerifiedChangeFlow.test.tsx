import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { sendMemberEmailVerification, verifyMemberEmail } from "@/lib/api/authentication"
import { VERIFICATION_TTL_MS } from "@/constants/validation"
import { VerifiedChangeFlow } from "./VerifiedChangeFlow"

vi.mock("@/lib/api/authentication", () => ({
  sendMemberEmailVerification: vi.fn(),
  verifyMemberEmail: vi.fn(),
}))

const toast = vi.hoisted(() => vi.fn())
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast }) }))

// 회원 정보 조회·사이드바는 이 흐름과 무관
vi.mock("@/hooks/useUser", () => ({ useGetMemberInfo: () => ({ data: null, isLoading: false }) }))
vi.mock("@/components/layout/MyPageShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }))

const sendMock = vi.mocked(sendMemberEmailVerification)
const verifyMock = vi.mocked(verifyMemberEmail)

const renderFlow = () =>
  render(
    <VerifiedChangeFlow title="비밀번호 변경" changeStepLabel="새 비밀번호">
      <label>
        새 비밀번호
        <input aria-label="새 비밀번호" />
      </label>
    </VerifiedChangeFlow>,
  )

/** 1단계를 통과해 2단계로 넘어간다 */
const passVerification = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "인증코드 발송" }))
  await screen.findByLabelText(/인증코드/)
  await user.type(screen.getByLabelText(/인증코드/), "123456")
  await user.click(screen.getByRole("button", { name: "인증 확인" }))
  await screen.findByLabelText("새 비밀번호")
}

beforeEach(() => {
  vi.clearAllMocks()
  sendMock.mockResolvedValue({ email: "rail@example.com" })
  verifyMock.mockResolvedValue({ isVerified: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe("VerifiedChangeFlow", () => {
  it("처음에는 인증 단계만 보이고 변경 내용은 그리지 않는다", () => {
    renderFlow()

    expect(screen.getByRole("button", { name: "인증코드 발송" })).toBeInTheDocument()
    expect(screen.queryByLabelText("새 비밀번호")).not.toBeInTheDocument()
  })

  it("인증에 성공하면 변경 단계를 보여 주고 남은 시간을 표시한다", async () => {
    const user = userEvent.setup()
    renderFlow()

    await passVerification(user)

    expect(verifyMock).toHaveBeenCalledWith("rail@example.com", "123456")
    expect(screen.getByText("5:00")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "인증코드 발송" })).not.toBeInTheDocument()
  })

  it("인증에 실패하면 변경 단계로 넘어가지 않는다", async () => {
    verifyMock.mockResolvedValueOnce({ isVerified: false })
    const user = userEvent.setup()
    renderFlow()

    await user.click(screen.getByRole("button", { name: "인증코드 발송" }))
    await screen.findByLabelText(/인증코드/)
    await user.type(screen.getByLabelText(/인증코드/), "000000")
    await user.click(screen.getByRole("button", { name: "인증 확인" }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: "인증코드가 올바르지 않습니다. 다시 확인해주세요." }),
      ),
    )
    expect(screen.queryByLabelText("새 비밀번호")).not.toBeInTheDocument()
  })

  it("인증 유효 시간이 지나면 변경 단계를 닫고 다시 인증을 요구한다", async () => {
    // 타이머를 먼저 가짜로 바꿔야 흐름이 만든 interval도 함께 제어된다
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderFlow()
    await passVerification(user)

    // 입력해 둔 값이 있어도 만료되면 단계가 사라지며 함께 버려진다
    await user.type(screen.getByLabelText("새 비밀번호"), "new-password-1234")

    act(() => {
      vi.advanceTimersByTime(VERIFICATION_TTL_MS + 1000)
    })

    expect(screen.queryByLabelText("새 비밀번호")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "인증코드 발송" })).toBeInTheDocument()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: "인증 시간이 만료되었습니다. 다시 인증해주세요." }),
    )
  })

  it("탭을 비운 사이 만료됐으면 돌아올 때 알아차린다", async () => {
    const user = userEvent.setup()
    renderFlow()
    await passVerification(user)

    // 타이머가 멈춘 상태를 흉내 낸다 — 시계만 넘기고 interval은 돌리지 않는다
    vi.useFakeTimers()
    act(() => {
      vi.setSystemTime(Date.now() + VERIFICATION_TTL_MS + 1000)
      document.dispatchEvent(new Event("visibilitychange"))
    })

    expect(screen.queryByLabelText("새 비밀번호")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "인증코드 발송" })).toBeInTheDocument()
  })

  it("남은 시간이 1분 아래로 내려가면 알림 문구가 나온다 (60초 렌더를 건너뛰어도)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderFlow()
    await passVerification(user)

    const notice = "인증 유효 시간이 1분 남았습니다."
    expect(screen.queryByText(notice)).not.toBeInTheDocument()

    // 61초 남은 시점 — 아직 알리지 않는다
    act(() => {
      vi.advanceTimersByTime(VERIFICATION_TTL_MS - 61_000)
    })
    expect(screen.queryByText(notice)).not.toBeInTheDocument()

    // 정확히 60초인 렌더 없이 59초로 건너뛰어도 문구가 나온다
    act(() => {
      vi.advanceTimersByTime(2_000)
    })
    expect(screen.getByText(notice)).toBeInTheDocument()
  })

})
