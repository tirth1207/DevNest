import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { SkipNav } from "@/components/accessibility/skip-nav"
import { ErrorBoundary } from "@/components/ui/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevFlow - Developer Project Manager",
  description: "The all-in-one platform for developer teams to manage projects, collaborate, and ship faster.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipNav />
        <ErrorBoundary>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
