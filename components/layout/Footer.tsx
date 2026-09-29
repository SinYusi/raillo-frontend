import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-footer text-footer-foreground py-8 mt-auto dark:border-t dark:border-footer-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">고객센터</h3>
            <p className="text-sm text-footer-muted">1544-7788</p>
            <p className="text-sm text-footer-muted">평일 05:30~23:30</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2 text-sm text-footer-muted">
              <li>
                <Link href="#" className="hover:text-footer-foreground">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-footer-foreground">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-footer-foreground">
                  사이트맵
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">RAILLO 소개</h3>
            <p className="text-sm text-footer-muted">
              한국철도공사는 국민의 안전하고 편리한 철도여행을 위해 최선을 다하고 있습니다.
            </p>
          </div>
        </div>
        <div className="border-t border-footer-border mt-8 pt-8 text-center text-sm text-footer-subtle">
          <p>Raillo Project</p>
        </div>
      </div>
    </footer>
  )
} 
