"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full border-t bg-card/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Product */}
                    <div className="space-y-4">
                        <div className="text-sm font-semibold text-foreground">Product</div>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Changelog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Roadmap
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <div className="text-sm font-semibold text-foreground">Company</div>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="space-y-4">
                        <div className="text-sm font-semibold text-foreground">Resources</div>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    API
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <div className="text-sm font-semibold text-foreground">Legal</div>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Security
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded flex items-center justify-center shadow-lg">
                                <span className="text-white text-xs font-bold">DN</span>
                            </div>
                            <span className="text-sm font-semibold text-foreground">DevNest</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors" aria-label="GitHub">
                                <Github className="h-4 w-4" />
                            </a>
                            <a href="#" className="hover:text-foreground transition-colors" aria-label="Twitter">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="hover:text-foreground transition-colors" aria-label="LinkedIn">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        © {currentYear} DevNest. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    )
}
