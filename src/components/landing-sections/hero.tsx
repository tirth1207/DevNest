"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { ArrowRight, Github, Sparkles, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroSection() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSignIn = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: typeof window !== 'undefined' 
                    ? `${window.location.origin}/dashboard`
                    : `https://devnest-12.vercel.app/dashboard`,
            },
        })
        if (error) {
            console.error("Sign in error:", error)
        }
    }

    return (
        <section className="relative w-full max-w-6xl mx-auto px-6 pt-32 pb-40 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className={`max-w-4xl space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in">
                    <Sparkles className="w-4 h-4" />
                    <span>Now with AI-powered insights</span>
                </div>

                {/* Large, calm headline - two line structure */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] animate-slide-up">
                    Project management
                    <br />
                    <span className="gradient-text">for developer teams</span>
                </h1>

                {/* Clear product descriptor - not poetic */}
                <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl leading-relaxed animate-slide-up delay-100">
                    GitHub-integrated workspace for organizing projects, tracking tasks, and shipping features faster than ever.
                </p>

                {/* Subtext - one short paragraph */}
                <p className="text-base text-muted-foreground max-w-xl leading-relaxed animate-slide-up delay-200">
                    Connect your repositories, manage sprints, and collaborate without leaving your development environment.
                </p>

                {/* CTA group */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up delay-300">
                    <Button
                        onClick={handleSignIn}
                        size="lg"
                        className="text-base px-8 h-14 gap-3 group hover:scale-105 transition-transform"
                    >
                        <Github className="w-5 h-5" />
                        Sign in with GitHub
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="text-base px-8 h-14 group hover:scale-105 transition-transform"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Watch Demo
                    </Button>
                </div>

                {/* Single credibility badge - GitHub-style trust */}
                <div className="inline-flex items-center gap-3 text-sm text-muted-foreground pt-8 animate-fade-in delay-500">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-background flex items-center justify-center text-xs font-medium text-white shadow-lg">
                            DT
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 border-2 border-background flex items-center justify-center text-xs font-medium text-white shadow-lg">
                            SC
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-background flex items-center justify-center text-xs font-medium text-white shadow-lg">
                            JM
                        </div>
                    </div>
                    <span>Used by <span className="font-semibold text-foreground">10,000+</span> developers at startups and enterprises</span>
                </div>
            </div>
        </section>
    )
}
