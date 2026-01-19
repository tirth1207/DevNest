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

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Background Elements - Subtle */}
      <div className="fixed inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10 opacity-30" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DN</span>
              </div>
              <span className="font-bold text-xl text-foreground">DevNest</span>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Features
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Pricing
              </Button>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

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
