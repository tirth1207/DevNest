"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"
import { useEffect, useState } from "react"

export function TestimonialsSection() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const testimonials = [
        {
            quote: "DevNest reduced our sprint planning time by 40%. Everything syncs with GitHub automatically.",
            author: "Sarah Chen",
            role: "Engineering Lead",
            company: "Stripe",
            avatar: "SC"
        },
        {
            quote: "Finally, a project tool that developers actually use. No training required.",
            author: "Marcus Kim",
            role: "CTO",
            company: "Vercel",
            avatar: "MK"
        },
        {
            quote: "We switched from Linear. DevNest handles our 50-person eng org without breaking a sweat.",
            author: "Emily Torres",
            role: "VP Engineering",
            company: "Figma",
            avatar: "ET"
        }
    ]

    return (
        <section className="w-full max-w-6xl mx-auto px-6 py-32">
            <div className={`mb-20 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Used by engineering teams
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    Join thousands of developers who ship faster with DevNest.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                    <Card 
                        key={index} 
                        className={`group border bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Quote className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-foreground leading-relaxed text-base">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-4 pt-4 border-t">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold shadow-lg">
                                        {testimonial.avatar}
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-semibold text-foreground">{testimonial.author}</div>
                                        <div className="text-muted-foreground">
                                            {testimonial.role}, {testimonial.company}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
