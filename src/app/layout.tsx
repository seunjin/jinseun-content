import type { Metadata } from "next";
import "./globals.css";
import NextQueryClientProvider from "@providers/QueryClient.provider";
import ClientDialogRenderer from "@ui/components/dialogs/ClientDialogRenderer";
import { Toaster } from "@ui/shadcn/components";
import { Analytics } from "@vercel/analytics/next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteTitle = "Jinseun Dev Blog";
const siteDescription =
  "새로운 기술을 탐구하고 직접 구현해보는 과정, 문제 해결 경험, 프로젝트 회고, 그리고 나만의 개발 철학을 정리합니다.";
const authorName = "Jinseun";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-default.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteTitle,
    url: siteUrl,
    description: siteDescription,
    author: {
      "@type": "Person",
      name: authorName,
    },
  };

  return (
    <html
      lang="ko"
      className=""
      // ThemeProvider사용 시 true
      // suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard/dist/web/static/pretendard.css"
        />
        <meta name="copyright" content="2025 Jin seun. All Rights Reserved." />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
        </script>
      </head>
      <body className="antialiased">
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        ></ThemeProvider> */}
        <NextQueryClientProvider>
          {children}
          <ClientDialogRenderer />
        </NextQueryClientProvider>
        <Toaster expand position={`top-center`} />
        <Analytics />
      </body>
    </html>
  );
}
