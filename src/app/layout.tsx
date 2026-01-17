import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "謎解きイベント記録",
  description: "謎解き記録の閲覧用アプリケーション",
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icon.png',
      }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '謎解きイベント記録',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
