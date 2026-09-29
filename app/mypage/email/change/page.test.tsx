import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { sendMemberEmailVerification, verifyMemberEmail } from "@/lib/api/authentication"
import EmailChangePage from "./page"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast: vi.fn() }) }))
vi.mock("@/lib/api/authentication", () => ({
  sendMemberEmailVerification: vi.fn(),
  verifyMemberEmail: vi.fn(),
}))
vi.mock("@/lib/api/authMembers", () => ({ sendEmailVerificationCode: vi.fn(), updateEmail: vi.fn() }))
vi.mock("@/hooks/useUser", () => ({ useGetMemberInfo: () => ({ data: null, isLoading: false }) }))
vi.mock("@/components/layout/MyPageShell", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }))
vi.mock("@/components/auth/AuthGuard", () => ({ default: ({ children }: { children: ReactNode }) => <>{children}</> }))

const sendMock = vi.mocked(sendMemberEmailVerification)
const verifyMock = vi.mocked(verifyMemberEmail)

beforeEach(() => {
  sendMock.mockResolvedValue({ email: "rail@example.com" })
  verifyMock.mockResolvedValue({ isVerified: true })
})

describe("이메일 변경 화면", () => {
  it("인증 전에는 변경 폼을 그리지 않는다", () => {
    render(<EmailChangePage />)

    expect(screen.getByRole("button", { name: "인증코드 발송" })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/새 이메일/)).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "이메일 변경" })).toBeInTheDocument()
  })

  it("인증을 마치면 라벨로 입력을 찾을 수 있다", async () => {
    const user = userEvent.setup()
    render(<EmailChangePage />)

    await user.click(screen.getByRole("button", { name: "인증코드 발송" }))
    await user.type(await screen.findByLabelText(/인증코드/), "123456")
    await user.click(screen.getByRole("button", { name: "인증 확인" }))

    expect(await screen.findByLabelText("새 이메일 주소")).toBeInTheDocument()
  })

})
