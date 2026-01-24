"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { HeroSection } from "@/components/landing-sections/hero"
import { FeaturesSection } from "@/components/landing-sections/features"
import { HowItWorksSection } from "@/components/landing-sections/how-it-works"
import { TrustSignalsSection } from "@/components/landing-sections/trust-signals"
import { TestimonialsSection } from "@/components/landing-sections/testimonials"
import { FinalCTASection } from "@/components/landing-sections/final-cta"
import { Footer } from "@/components/landing-sections/footer"
import { ModeToggle } from "@/components/mode-toggle"
import { Github, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/dashboard`
          : `https://dev-nest-6t4w.vercel.app/dashboard`,
      },
    })
    if (error) {
      console.error("Sign in error:", error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Background Elements - Subtle */}
      <div className="fixed inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10 opacity-30 dark:opacity-20" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-sm">DN</span>
              </div>
              <span className="font-bold text-xl text-foreground">DevNest</span>
            </Link>
            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex" 
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Features
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex"
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Pricing
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignIn} className="gap-2">
                <Github className="h-4 w-4" />
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <div id="features">
        <FeaturesSection />
      </div>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Trust Signals Section */}
      <TrustSignalsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Final CTA Section */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </main>
  )
}
