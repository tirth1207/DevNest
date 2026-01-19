"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { ArrowRight, Github } from "lucide-react"

export function FinalCTASection() {
    const handleSignIn = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: `https://dev-nest-6t4w.vercel.app/dashboard`,
            },
        })
        if (error) {
            console.error("Sign in error:", error)
        }
    }

    return (
        <section className="w-full max-w-5xl mx-auto px-6 py-32">
            <div className="border-t pt-20 space-y-12">
                <div className="space-y-6 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                        Start shipping faster
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Free for teams up to 10. No credit card required.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={handleSignIn}
                        size="lg"
                        className="text-base px-8 h-14 gap-3"
                    >
                        <Github className="w-5 h-5" />
                        Sign in with GitHub
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="text-base px-8 h-14"
                    >
                        Schedule Demo
                    </Button>
                </div>
            </div>
        </section>
    )
}
