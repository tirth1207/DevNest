export function TrustSignalsSection() {
    const metrics = [
        { label: "Uptime", value: "99.9%" },
        { label: "Response time", value: "<100ms" },
        { label: "Teams", value: "10,000+" },
        { label: "SOC 2", value: "Type II" }
    ]

    return (
        <section className="w-full max-w-5xl mx-auto px-6 py-32">
            <div className="space-y-16">
                {/* Metrics Grid - Dashboard style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {metrics.map((metric, index) => (
                        <div key={index} className="p-8 rounded-lg border bg-card/50 space-y-3">
                            <div className="text-sm text-muted-foreground font-medium">{metric.label}</div>
                            <div className="text-3xl font-bold text-foreground">{metric.value}</div>
                        </div>
                    ))}
                </div>

                {/* Trust Statement */}
                <div className="space-y-6 pt-8">
                    <h2 className="text-3xl font-semibold text-foreground">
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
