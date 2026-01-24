"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, Users, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"

export function TrustSignalsSection() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const metrics = [
        { 
            label: "Uptime", 
            value: "99.9%", 
            icon: CheckCircle2,
            gradient: "from-green-500 to-emerald-500",
            description: "Guaranteed SLA"
        },
        { 
            label: "Response time", 
            value: "<100ms", 
            icon: Zap,
            gradient: "from-yellow-500 to-amber-500",
            description: "Average latency"
        },
        { 
            label: "Teams", 
            value: "10,000+", 
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
            description: "Active organizations"
        },
        { 
            label: "SOC 2", 
            value: "Type II", 
            icon: Shield,
            gradient: "from-purple-500 to-pink-500",
            description: "Certified secure"
        }
    ]

    return (
        <section className="w-full max-w-5xl mx-auto px-6 py-32">
            <div className="space-y-16">
                {/* Metrics Grid - Dashboard style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon
                        return (
                            <Card 
                                key={index} 
                                className={`group border bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground font-medium mb-1">{metric.label}</div>
                                            <div className="text-3xl font-bold text-foreground mb-1">{metric.value}</div>
                                            <div className="text-xs text-muted-foreground">{metric.description}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Trust Statement */}
                <div className={`space-y-6 pt-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
                    <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
                        Built for production
                    </h2>
                    <p className="text-muted-foreground leading-relaxed max-w-2xl text-lg">
                        Enterprise-grade infrastructure. SSO, audit logs, and role-based access control.
                        Hosted on AWS with automatic backups and 24/7 monitoring.
                    </p>
                </div>
            </div>
        </section>
    )
}
