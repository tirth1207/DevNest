export function HowItWorksSection() {
    const steps = [
        {
            number: "1",
            title: "Connect GitHub",
            description: "Link your repositories in seconds."
        },
        {
            number: "2",
            title: "Create Projects",
            description: "Organize work around your codebase."
        },
        {
            number: "3",
            title: "Track Progress",
            description: "See what's shipping, what's blocked."
        },
        {
            number: "4",
            title: "Ship Faster",
            description: "Stay aligned, reduce meetings."
        }
    ]

    return (
        <section className="w-full max-w-5xl mx-auto px-6 py-32">
            <div className="space-y-20">
                {/* Section Header */}
                <div className="space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                        How it works
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                        Four steps. No complexity.
                    </p>
                </div>

                {/* Horizontal Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="space-y-4">
                            <div className="flex items-baseline gap-4">
                                <span className="text-5xl font-bold text-muted-foreground/30">{step.number}</span>
                                <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
