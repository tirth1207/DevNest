"use client"

import { useEffect, useState } from "react"
import { Github, FolderPlus, TrendingUp, Rocket } from "lucide-react"

export function HowItWorksSection() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const steps = [
        {
            number: "1",
            title: "Connect GitHub",
            description: "Link your repositories in seconds with one-click integration.",
            icon: Github,
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            number: "2",
            title: "Create Projects",
            description: "Organize work around your codebase with smart project templates.",
            icon: FolderPlus,
            gradient: "from-purple-500 to-pink-500"
        },
        {
            number: "3",
            title: "Track Progress",
            description: "See what's shipping, what's blocked, and what's next in real-time.",
            icon: TrendingUp,
            gradient: "from-green-500 to-emerald-500"
        },
        {
            number: "4",
            title: "Ship Faster",
            description: "Stay aligned, reduce meetings, and deliver features faster than ever.",
            icon: Rocket,
            gradient: "from-orange-500 to-red-500"
        }
    ]

    return (
        <section className="w-full max-w-5xl mx-auto px-6 py-32">
            <div className="space-y-20">
                {/* Section Header */}
                <div className={`space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                        How it works
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        Four steps. No complexity. Just results.
                    </p>
                </div>

                {/* Horizontal Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <div 
                                key={index} 
                                className={`group relative space-y-4 p-6 rounded-xl border bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="text-3xl font-bold text-muted-foreground/30">{step.number}</span>
                                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed text-sm">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
