"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, ExternalLink, Copy, Check, GitBranch, GitCommit, Calendar, User, List, Network, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface Commit {
    sha: string
    author?: {
        login: string
        avatar_url: string
    }
    commit: {
        message: string
        author?: {
            name: string
            email: string
            date: string
        }
        verification?: {
            verified: boolean
            reason: string
        }
    }
    html_url: string
    parents?: Array<{ sha: string }>
}

interface Branch {
    name: string
    commit: {
        sha: string
    }
}

interface ProjectCommitsTabProps {
    commits?: Commit[]
    repoUrl?: string
}

export function ProjectCommitsTab({ commits: initialCommits, repoUrl }: ProjectCommitsTabProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"list" | "tree">("tree")
    const [branches, setBranches] = useState<Branch[]>([])
    const [selectedBranch, setSelectedBranch] = useState<string>("main")
    const [branchesLoading, setBranchesLoading] = useState(false)
    const [commits, setCommits] = useState<Commit[]>(initialCommits || [])
    const [commitsLoading, setCommitsLoading] = useState(false)
    const [commitsError, setCommitsError] = useState<string | null>(null)

    // Fetch commits for selected branch
    useEffect(() => {
        const fetchCommits = async () => {
            if (!repoUrl) return

            setCommitsLoading(true)
            setCommitsError(null)
            try {
                const github = repoUrl.replace("https://github.com/", "").replace(/\/$/, "")
                // Use authenticated API route to support private repositories
                const url = `/api/github/commits?repo=${encodeURIComponent(github)}&per_page=30${selectedBranch ? `&branch=${encodeURIComponent(selectedBranch)}` : ""}`
                const res = await fetch(url)
                if (res.ok) {
                    const data = await res.json()
                    setCommits(data)
                } else {
                    const errorData = await res.json().catch(() => ({ error: res.statusText }))
                    setCommitsError(errorData.error || `Failed to fetch commits: ${res.statusText}`)
                }
            } catch (error: any) {
                setCommitsError(error.message || "Failed to fetch commits")
            } finally {
                setCommitsLoading(false)
            }
        }
        fetchCommits()
    }, [repoUrl, selectedBranch])

    // Fetch branches if repoUrl is provided
    useEffect(() => {
        const fetchBranches = async () => {
            if (!repoUrl) return

            setBranchesLoading(true)
            try {
                const github = repoUrl.replace("https://github.com/", "").replace(/\/$/, "")
                // Use authenticated API route to support private repositories
                const res = await fetch(`/api/github/branches?repo=${encodeURIComponent(github)}`)

                if (res.status === 404) {
                    // Route not found - API route might not be available
                    console.error("API route not found. Make sure the dev server has been restarted.")
                    return
                }

                if (res.ok) {
                    const data = await res.json()
                    setBranches(data)
                    if (data.length > 0 && !data.find((b: Branch) => b.name === selectedBranch)) {
                        setSelectedBranch(data[0].name)
                    }
                } else {
                    const errorData = await res.json().catch(() => ({ error: res.statusText }))
                    console.error("Failed to fetch branches:", errorData.error || res.statusText)
                }
            } catch (error: any) {
                console.error("Failed to fetch branches:", error.message || error)
            } finally {
                setBranchesLoading(false)
            }
        }
        fetchBranches()
    }, [repoUrl])

    const handleCopy = (sha: string) => {
        navigator.clipboard.writeText(sha)
        setCopiedId(sha)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const BRANCH_COLORS = [
        "#3b82f6", // blue-500
        "#f59e0b", // amber-500
        "#ec4899", // pink-500
        "#10b981", // emerald-500
        "#8b5cf6", // violet-500
        "#6366f1", // indigo-500
        "#f43f5e", // rose-500
    ]

    // Advanced commit tree structure with lane visualization
    const commitTree = useMemo(() => {
        if (!commits || commits.length === 0) return []

        const nodes = commits.map((c, i) => ({
            ...c,
            index: i,
            lane: 0,
            color: BRANCH_COLORS[0],
            isMerge: !!(c.parents && c.parents.length > 1),
            nextLanes: [] as number[], // Lanes that continue to the next row
            connections: [] as { fromLane: number; toLane: number; color: string }[]
        }))

        let activeLanes: (string | null)[] = []

        // Lane assignment logic
        const renderedNodes = nodes.map((node) => {
            // Find which lane this commit belongs to
            let currentLane = activeLanes.indexOf(node.sha)

            if (currentLane === -1) {
                // If not found, find the first null lane or add new
                currentLane = activeLanes.indexOf(null)
                if (currentLane === -1) {
                    currentLane = activeLanes.length
                    activeLanes.push(node.sha)
                } else {
                    activeLanes[currentLane] = node.sha
                }
            }

            node.lane = currentLane
            node.color = BRANCH_COLORS[currentLane % BRANCH_COLORS.length]

            // Prepare for next row
            const nextLanesState = [...activeLanes]
            const connections: { fromLane: number; toLane: number; color: string }[] = []

            // If it's a merge, it has multiple parents
            if (node.parents && node.parents.length > 0) {
                // First parent stays in the same lane
                nextLanesState[currentLane] = node.parents[0].sha
                connections.push({ fromLane: currentLane, toLane: currentLane, color: node.color })

                // Other parents move to new lanes or existing ones
                for (let pIdx = 1; pIdx < node.parents.length; pIdx++) {
                    const pSha = node.parents[pIdx].sha
                    let pLane = nextLanesState.indexOf(pSha)
                    if (pLane === -1) {
                        pLane = nextLanesState.indexOf(null)
                        if (pLane === -1) {
                            pLane = nextLanesState.length
                            nextLanesState.push(pSha)
                        } else {
                            nextLanesState[pLane] = pSha
                        }
                    }
                    connections.push({
                        fromLane: currentLane,
                        toLane: pLane,
                        color: BRANCH_COLORS[pLane % BRANCH_COLORS.length]
                    })
                }
            } else {
                // Root commit - terminates this lane
                nextLanesState[currentLane] = null
            }

            // Map SHAs to lane indices for visualization in current row
            node.nextLanes = nextLanesState.map((sha, idx) => sha ? idx : -1).filter(idx => idx !== -1)
            node.connections = connections

            // Update active lanes for the next commit in the loop
            activeLanes = nextLanesState

            return node
        })

        return renderedNodes
    }, [commits])

    if (!repoUrl) {
        return (
            <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-8 text-center">
                    <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-2">No GitHub repository connected</p>
                    <p className="text-sm text-muted-foreground">Connect a GitHub repository to see commits here</p>
                </CardContent>
            </Card>
        )
    }

    if (commitsLoading) {
        return (
            <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-8 text-center">
                    <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Loading commits...</p>
                </CardContent>
            </Card>
        )
    }

    if (commitsError) {
        return (
            <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-8 text-center">
                    <Github className="h-12 w-12 text-destructive mx-auto mb-4 opacity-50" />
                    <p className="text-destructive mb-2">Error loading commits</p>
                    <p className="text-sm text-muted-foreground">{commitsError}</p>
                </CardContent>
            </Card>
        )
    }

    if (!commits || commits.length === 0) {
        return (
            <Card className="border-border/50 shadow-sm">
                <CardContent className="pt-8 text-center">
                    <Github className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-2">No commits found</p>
                    <p className="text-sm text-muted-foreground">
                        {selectedBranch ? `No commits found for branch "${selectedBranch}"` : "This repository has no commits yet"}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Github className="h-5 w-5" />
                                Commits ({commits.length})
                            </CardTitle>
                            <CardDescription className="mt-1">
                                GitHub commit history and branch visualization
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {branchesLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span>Loading branches...</span>
                                </div>
                            )}
                            {!branchesLoading && branches.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                                    <select
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground hover:bg-muted transition-colors"
                                    >
                                        {branches.map((branch) => (
                                            <option key={branch.name} value={branch.name}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "tree")}>
                                <TabsList>
                                    <TabsTrigger value="tree" className="gap-2">
                                        <Network className="h-4 w-4" />
                                        Tree
                                    </TabsTrigger>
                                    <TabsTrigger value="list" className="gap-2">
                                        <List className="h-4 w-4" />
                                        List
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {viewMode === "tree" ? (
                        <div className="space-y-4">
                            {commitTree.length === 0 ? (
                                <div className="text-center py-12">
                                    <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">No commits available for tree view</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Tree View */}
                                    <div className="space-y-3">
                                        {commitTree.map((commit, index) => {
                                            const message = commit.commit.message.split("\n")[0]
                                            const shortSha = commit.sha.substring(0, 7)
                                            const author = commit.commit.author?.name || commit.author?.login || "Unknown"
                                            const date = commit.commit.author?.date
                                                ? formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })
                                                : ""
                                            const hasChildren = commit.children.length > 0
                                            const hasParent = commit.parents && commit.parents.length > 0
                                            const isLast = index === commitTree.length - 1
                                            const nextCommit = commitTree[index + 1]
                                            const isBranchPoint = hasChildren && commit.children.length > 1

                                            return (
                                                <div
                                                    key={commit.sha}
                                                    className="relative group"
                                                >
                                                    {/* Vertical Line - connects commits */}
                                                    {!isLast && (
                                                        <div
                                                            className="absolute left-[19px] top-[48px] bottom-[-12px] w-0.5 bg-gradient-to-b from-primary/40 to-primary/20"
                                                            style={{ zIndex: 1 }}
                                                        />
                                                    )}

                                                    {/* Branch Lines for merges */}
                                                    {isBranchPoint && (
                                                        <div className="absolute left-[19px] top-[48px] w-8 h-0.5 bg-primary/40" style={{ zIndex: 2 }} />
                                                    )}

                                                    {/* Commit Node */}
                                                    <div className={cn(
                                                        "relative flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all duration-200 hover:shadow-md",
                                                        commit.isMerge && "border-primary/50 bg-primary/5",
                                                        "ml-0"
                                                    )}>
                                                        <div className="flex-shrink-0 relative z-10">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-full flex items-center justify-center text-white font-mono text-xs font-bold shadow-lg transition-all",
                                                                commit.isMerge
                                                                    ? "bg-gradient-to-br from-violet-500 to-violet-600 ring-2 ring-violet-300/50"
                                                                    : "bg-gradient-to-br from-primary to-primary/60"
                                                            )}>
                                                                {commit.isMerge ? (
                                                                    <GitBranch className="h-5 w-5" />
                                                                ) : (
                                                                    <GitCommit className="h-5 w-5" />
                                                                )}
                                                            </div>
                                                            {/* Branch indicator dot */}
                                                            {commit.branch > 0 && (
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 space-y-2">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <a
                                                                        href={commit.html_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-primary hover:underline font-medium block truncate"
                                                                    >
                                                                        {message}
                                                                    </a>
                                                                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                                                                        {commit.author && (
                                                                            <div className="flex items-center gap-2">
                                                                                <Avatar className="h-5 w-5">
                                                                                    <AvatarImage src={commit.author.avatar_url} />
                                                                                    <AvatarFallback className="text-xs">
                                                                                        {author.charAt(0).toUpperCase()}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <span>{author}</span>
                                                                            </div>
                                                                        )}
                                                                        {!commit.author && <span>{author}</span>}
                                                                        {commit.commit.verification?.verified && (
                                                                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 gap-1 font-medium">
                                                                                <Check className="h-3 w-3" />
                                                                                Verified
                                                                            </Badge>
                                                                        )}
                                                                        {date && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <div className="flex items-center gap-1">
                                                                                    <Calendar className="h-3 w-3" />
                                                                                    <span>{date}</span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <Badge variant="secondary" className="font-mono text-xs">
                                                                        {shortSha}
                                                                    </Badge>
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
                                                            {commit.children.length > 0 && (
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                                                    <GitBranch className="h-3 w-3" />
                                                                    <span>{commit.children.length} merge{commit.children.length > 1 ? "s" : ""}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-0 divide-y divide-border/50">
                            {commits.map((commit) => {
                                const message = commit.commit.message.split("\n")[0]
                                const shortSha = commit.sha.substring(0, 7)
                                const author = commit.commit.author?.name || commit.author?.login || "Unknown"
                                const date = commit.commit.author?.date
                                    ? formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })
                                    : ""

                                return (
                                    <div key={commit.sha} className="px-0 py-4 first:pt-0 last:pb-0 hover:bg-muted/30 transition-colors">
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <a
                                                        href={commit.html_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline font-medium block truncate"
                                                    >
                                                        {message}
                                                    </a>
                                                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                                                        {commit.author && (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-5 w-5">
                                                                    <AvatarImage src={commit.author.avatar_url} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {author.charAt(0).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span>{author}</span>
                                                            </div>
                                                        )}
                                                        {!commit.author && <span>{author}</span>}
                                                        {commit.commit.verification?.verified && (
                                                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 gap-1 font-medium">
                                                                <Check className="h-3 w-3" />
                                                                Verified
                                                            </Badge>
                                                        )}
                                                        {date && (
                                                            <>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>{date}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Badge variant="secondary" className="font-mono text-xs">
                                                        {shortSha}
                                                    </Badge>
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
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
