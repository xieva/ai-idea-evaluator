import type { ReactNode } from "react";

export const metadata = {
  title: "AI 사업 아이디어 평가",
  description: "AI가 사업 아이디어를 냉정하게 평가합니다."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
