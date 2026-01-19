"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { ArrowRight, Github } from "lucide-react"

export function HeroSection() {
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
        <section className="w-full max-w-6xl mx-auto px-6 pt-32 pb-40">
            <div className="max-w-4xl space-y-8">
                {/* Large, calm headline - two line structure */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
                    Project management
                    <br />
                    for developer teams
                </h1>

                {/* Clear product descriptor - not poetic */}
                <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed">
                    GitHub-integrated workspace for organizing projects, tracking tasks, and shipping features.
                </p>

                {/* Subtext - one short paragraph */}
                <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
                    Connect your repositories, manage sprints, and collaborate without leaving your development environment.
                </p>

                {/* CTA group */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
                        Watch Demo
                    </Button>
                </div>

                {/* Single credibility badge - GitHub-style trust */}
                <div className="inline-flex items-center gap-3 text-sm text-muted-foreground pt-8">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium">
                            DT
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium">
                            SC
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium">
                            JM
                        </div>
                    </div>
                    <span>Used by 10,000+ developers at startups and enterprises</span>
                </div>
            </div>
        </section>
    )
}
