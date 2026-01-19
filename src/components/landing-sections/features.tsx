import { Card, CardContent } from "@/components/ui/card"
import { FolderKanban, CheckSquare, Users, BarChart3, Zap, Shield } from "lucide-react"

export function FeaturesSection() {
    const features = [
        {
            icon: FolderKanban,
            title: "GitHub-connected projects",
            description: "Link repositories and sync issues automatically."
        },
        {
            icon: CheckSquare,
            title: "Task management that scales",
            description: "Kanban boards and dependencies for engineering teams."
        },
        {
            icon: Users,
            title: "Role-based permissions",
            description: "Control access across organizations and projects."
        },
        {
            icon: BarChart3,
            title: "Team velocity insights",
            description: "Track sprint progress and completion rates."
        },
        {
            icon: Zap,
            title: "Real-time collaboration",
            description: "See updates instantly without refreshing."
        },
        {
            icon: Shield,
            title: "Enterprise security",
            description: "SSO, audit logs, and SOC 2 compliance."
        }
    ]

    return (
        <section className="w-full max-w-6xl mx-auto px-6 py-32">
            <div className="mb-20">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Everything you need
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    Tools that integrate with your existing workflow.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Card key={index} className="border bg-card/50 hover:bg-card transition-colors">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-xl mb-3 text-foreground">
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
