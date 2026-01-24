"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FolderKanban, CheckSquare, Users, BarChart3, Zap, Shield } from "lucide-react"
import { useEffect, useState } from "react"

export function FeaturesSection() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const features = [
        {
            icon: FolderKanban,
            title: "GitHub-connected projects",
            description: "Link repositories and sync issues automatically. Stay in sync with your codebase.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: CheckSquare,
            title: "Task management that scales",
            description: "Kanban boards and dependencies for engineering teams of any size.",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: Users,
            title: "Role-based permissions",
            description: "Control access across organizations and projects with fine-grained controls.",
            gradient: "from-green-500 to-emerald-500"
        },
        {
            icon: BarChart3,
            title: "Team velocity insights",
            description: "Track sprint progress and completion rates with beautiful analytics.",
            gradient: "from-orange-500 to-red-500"
        },
        {
            icon: Zap,
            title: "Real-time collaboration",
            description: "See updates instantly without refreshing. Work together seamlessly.",
            gradient: "from-yellow-500 to-amber-500"
        },
        {
            icon: Shield,
            title: "Enterprise security",
            description: "SSO, audit logs, and SOC 2 compliance. Your data is safe with us.",
            gradient: "from-indigo-500 to-blue-500"
        }
    ]

    return (
        <section className="w-full max-w-6xl mx-auto px-6 py-32">
            <div className={`mb-20 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Everything you need
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    Tools that integrate with your existing workflow. Built for developers, by developers.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Card 
                        key={index} 
                        className={`group border bg-card/50 hover:bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <CardContent className="p-8">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-semibold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
