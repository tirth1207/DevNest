"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { ArrowRight, Github, Calendar, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

export function FinalCTASection() {
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
        <section className="relative w-full max-w-5xl mx-auto px-6 py-32 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            </div>

            <Card className={`border-2 bg-card/80 backdrop-blur-sm transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <CardContent className="p-12 md:p-16">
                    <div className="space-y-12">
                        <div className="space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                                <Sparkles className="w-4 h-4" />
                                <span>Ready to get started?</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                                Start shipping faster
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Free for teams up to 10. No credit card required. Get started in seconds.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
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
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule Demo
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-8 border-t text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
