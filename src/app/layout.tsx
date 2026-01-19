import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dev-nest-6t4w.vercel.app'),
  title: {
    default: 'DevNest - Build. Collaborate. Ship Faster.',
    template: '%s | DevNest'
  },
  description: 'The modern workspace where teams build amazing products together. Manage projects, track progress, and collaborate seamlessly—all in one beautiful platform.',
  keywords: ['project management', 'team collaboration', 'task tracking', 'GitHub integration', 'SaaS', 'productivity'],
  authors: [{ name: 'DevNest' }],
  creator: 'DevNest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dev-nest-6t4w.vercel.app',
    title: 'DevNest - Build. Collaborate. Ship Faster.',
    description: 'The modern workspace where teams build amazing products together. Manage projects, track progress, and collaborate seamlessly.',
    siteName: 'DevNest',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevNest - Build. Collaborate. Ship Faster.',
    description: 'The modern workspace where teams build amazing products together.',
    creator: '@devnest',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
