"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ExternalLink, Copy, Check } from "lucide-react"
import Link from "next/link"

interface Commit {
    sha: string
    commit: {
        message: string
        author?: {
            name: string
            email: string
            date: string
        }
    }
    author?: {
        login: string
        avatar_url: string
    }
    html_url: string
}

interface ProjectCommitsTabProps {
    commits: Commit[]
}

export function ProjectCommitsTab({ commits }: ProjectCommitsTabProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const handleCopy = (sha: string) => {
        navigator.clipboard.writeText(sha)
        setCopiedId(sha)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (!commits || commits.length === 0) {
        return (
            <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-8 text-center">
                    <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-2">No commits found</p>
                    <p className="text-sm text-muted-foreground">Connect a GitHub repository to see commits here</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        Recent Commits ({commits.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 divide-y divide-border/50">
                    {commits.map((commit) => {
                        const message = commit.commit.message.split("\n")[0]
                        const shortSha = commit.sha.substring(0, 7)
                        const author = commit.commit.author?.name || "Unknown"
                        const date = commit.commit.author?.date ? new Date(commit.commit.author.date).toLocaleDateString() : ""

                        return (
                            <div key={commit.sha} className="px-0 py-4 first:pt-0 last:pb-0">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={commit.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline font-medium block truncate"
                                            >
                                                {message}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                <span>{author}</span>
                                                <span>•</span>
                                                <span>{date}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(commit.sha)}
                                                className="h-8 w-8 p-0"
                                                title={commit.sha}
                                            >
                                                {copiedId === commit.sha ? (
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <a
                                                href={commit.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                title="View on GitHub"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {shortSha}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
