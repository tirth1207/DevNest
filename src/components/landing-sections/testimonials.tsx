export function TestimonialsSection() {
    const testimonials = [
        {
            quote: "DevNest reduced our sprint planning time by 40%. Everything syncs with GitHub automatically.",
            author: "Sarah Chen",
            role: "Engineering Lead",
            company: "Stripe"
        },
        {
            quote: "Finally, a project tool that developers actually use. No training required.",
            author: "Marcus Kim",
            role: "CTO",
            company: "Vercel"
        },
        {
            quote: "We switched from Linear. DevNest handles our 50-person eng org without breaking a sweat.",
            author: "Emily Torres",
            role: "VP Engineering",
            company: "Figma"
        }
    ]

    return (
        <section className="w-full max-w-6xl mx-auto px-6 py-32">
            <div className="mb-20">
                <h2 className="text-4xl font-bold text-foreground mb-6">
                    Used by engineering teams
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="space-y-6">
                        <p className="text-foreground leading-relaxed text-lg">
                            "{testimonial.quote}"
                        </p>
                        <div className="text-sm">
                            <div className="font-semibold text-foreground">{testimonial.author}</div>
                            <div className="text-muted-foreground">
                                {testimonial.role}, {testimonial.company}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
