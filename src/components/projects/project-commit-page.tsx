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
    const [selectedCommitCount, setSelectedCommitCount] = useState<number | "all">(30)
    const [branchesLoading, setBranchesLoading] = useState(false)
    const [commits, setCommits] = useState<Commit[]>(initialCommits || [])
    const [commitsLoading, setCommitsLoading] = useState(false)
    const [commitsError, setCommitsError] = useState<string | null>(null)

    // Fetch commits for selected branch and count
    useEffect(() => {
        const fetchCommits = async () => {
            if (!repoUrl) return

            setCommitsLoading(true)
            setCommitsError(null)
            try {
                const github = repoUrl.replace("https://github.com/", "").replace(/\/$/, "")
                const perPage = selectedCommitCount === "all" ? 100 : selectedCommitCount
                // Use authenticated API route to support private repositories
                const url = `/api/github/commits?repo=${encodeURIComponent(github)}&per_page=${perPage}${selectedBranch ? `&branch=${encodeURIComponent(selectedBranch)}` : ""}`
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
    }, [repoUrl, selectedBranch, selectedCommitCount])

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
        "#3b82f6", // blue-500 (Primary)
        "#f59e0b", // amber-500
        "#ec4899", // pink-500
        "#10b981", // emerald-500
        "#8b5cf6", // violet-500
        "#06b6d4", // cyan-500
        "#f43f5e", // rose-500
    ]

    // Advanced commit tree structure
    // ### 1. Git Graph Visualization
    // I've added a custom SVG-based Git Graph to the **Commits** tab, matching the design in your provided image.
    // - **S-Curve Branching**: Uses Cubic Bezier curves to show branches "blooming" out from the main line and merging back in smoothly.
    // - **Dynamic Lanes**: Automatically assigns colors and vertical lanes to different branches.
    // - **Interactive Nodes**: Each commit node represents a point in history with tooltips and copyable SHAs.
    const commitTree = useMemo(() => {
        if (!commits || commits.length === 0) return []

        // Initial pass to identify nodes
        const nodes = commits.map((c, i) => ({
            ...c,
            lane: 0,
            color: BRANCH_COLORS[0],
            isMerge: !!(c.parents && c.parents.length > 1),
            nextLanes: [] as number[], // Lane indices that continue to the next row
            connections: [] as { fromLane: number; toLane: number; color: string; isMerge: boolean }[]
        }))

        // activeLanes tracks what SHA is currently in which lane index
        let activeLanes: (string | null)[] = []

        // Try to pre-seed lane 0 with the head of the selected branch
        if (nodes.length > 0) {
            activeLanes[0] = nodes[0].sha
        }

        const renderedNodes = nodes.map((node, index) => {
            // 1. Determine this commit's lane
            let currentLane = activeLanes.indexOf(node.sha)

            // If this SHA isn't in a lane yet, it's either the first or a "lost" parent
            if (currentLane === -1) {
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

            // 2. Determine connections to parents for the NEXT row
            const connections: typeof node.connections = []
            const nextLanesState = [...activeLanes]

            // This commit is "processed", so it leaves the lane it was in
            nextLanesState[currentLane] = null

            if (node.parents && node.parents.length > 0) {
                // First parent usually continues the current lane
                const firstParentSha = node.parents[0].sha

                // If the first parent is already in another lane (unlikely in simple git history but possible)
                // or if we can take this lane:
                let firstParentLane = nextLanesState.indexOf(firstParentSha)
                if (firstParentLane === -1) {
                    nextLanesState[currentLane] = firstParentSha
                    firstParentLane = currentLane
                }

                connections.push({
                    fromLane: currentLane,
                    toLane: firstParentLane,
                    color: node.color,
                    isMerge: false
                })

                // Additional parents (merges)
                for (let i = 1; i < node.parents.length; i++) {
                    const parentSha = node.parents[i].sha
                    let parentLane = nextLanesState.indexOf(parentSha)

                    if (parentLane === -1) {
                        // Find a new lane for this secondary parent
                        parentLane = nextLanesState.indexOf(null)
                        if (parentLane === -1) {
                            parentLane = nextLanesState.length
                            nextLanesState.push(parentSha)
                        } else {
                            nextLanesState[parentLane] = parentSha
                        }
                    }

                    connections.push({
                        fromLane: currentLane,
                        toLane: parentLane,
                        color: BRANCH_COLORS[parentLane % BRANCH_COLORS.length],
                        isMerge: true
                    })
                }
            }

            // 3. Store state for rendering
            // Map the nextLanesState (SHAs) to indices for the UI to draw lines
            node.nextLanes = nextLanesState
                .map((sha, idx) => sha ? idx : -1)
                .filter(idx => idx !== -1)

            node.connections = connections

            // Update activeLanes for the iteration of the node BELOW this one
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
                            <div className="flex items-center gap-2">
                                <GitCommit className="h-4 w-4 text-muted-foreground" />
                                <select
                                    value={selectedCommitCount.toString()}
                                    onChange={(e) => setSelectedCommitCount(e.target.value === "all" ? "all" : Number(e.target.value))}
                                    className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground hover:bg-muted transition-colors"
                                >
                                    <option value="10">10 commits</option>
                                    <option value="30">30 commits</option>
                                    <option value="50">50 commits</option>
                                    <option value="all">All commits</option>
                                </select>
                            </div>
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
                        <div className="space-y-0 overflow-x-auto pb-4">
                            {commitTree.length === 0 ? (
                                <div className="text-center py-12">
                                    <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-muted-foreground">No commits available for tree view</p>
                                </div>
                            ) : (
                                <div className="min-w-[500px]">
                                    {commitTree.map((commit, index) => {
                                        const message = commit.commit.message.split("\n")[0]
                                        const shortSha = commit.sha.substring(0, 7)
                                        const author = commit.commit.author?.name || commit.author?.login || "Unknown"
                                        const date = commit.commit.author?.date
                                            ? formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })
                                            : ""

                                        const laneWidth = 24
                                        const rowHeight = 64
                                        const nodeRadius = 5
                                        const maxLane = Math.max(commit.lane, ...commit.nextLanes, ...commit.connections.map(c => c.toLane), 2)
                                        const graphWidth = (maxLane + 1) * laneWidth

                                        return (
                                            <div key={commit.sha} className="flex group min-h-[64px] border-b border-border/5 hover:bg-muted/30 transition-colors">
                                                {/* Graph Section */}
                                                <div className="relative flex-shrink-0" style={{ width: graphWidth + 20 }}>
                                                    <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                                                        {/* Continuing lines (lanes that don't belong to this commit) */}
                                                        {commit.nextLanes.map(lIdx => {
                                                            if (lIdx === commit.lane) return null
                                                            return (
                                                                <line
                                                                    key={`cont-${lIdx}`}
                                                                    x1={lIdx * laneWidth + 15}
                                                                    y1={0}
                                                                    x2={lIdx * laneWidth + 15}
                                                                    y2={rowHeight}
                                                                    stroke={BRANCH_COLORS[lIdx % BRANCH_COLORS.length]}
                                                                    strokeWidth="2"
                                                                    strokeOpacity="0.3"
                                                                />
                                                            )
                                                        })}

                                                        {/* Connections from this commit to parents (below) */}
                                                        {commit.connections.map((conn, cIdx) => {
                                                            const startX = commit.lane * laneWidth + 15
                                                            const endX = conn.toLane * laneWidth + 15

                                                            if (startX === endX) {
                                                                return (
                                                                    <line
                                                                        key={`conn-${cIdx}`}
                                                                        x1={startX}
                                                                        y1={rowHeight / 2}
                                                                        x2={endX}
                                                                        y2={rowHeight}
                                                                        stroke={conn.color}
                                                                        strokeWidth="2.5"
                                                                        strokeLinecap="round"
                                                                    />
                                                                )
                                                            } else {
                                                                // S-Curve (Cubic Bezier) for smoother branch entry/exit
                                                                // Moving from child center to parent top
                                                                const cp1Y = rowHeight * 0.7
                                                                const cp2Y = rowHeight * 0.8
                                                                return (
                                                                    <path
                                                                        key={`conn-${cIdx}`}
                                                                        d={`M ${startX} ${rowHeight / 2} C ${startX} ${cp1Y}, ${endX} ${cp2Y}, ${endX} ${rowHeight}`}
                                                                        fill="none"
                                                                        stroke={conn.color}
                                                                        strokeWidth="2.5"
                                                                        strokeLinecap="round"
                                                                    />
                                                                )
                                                            }
                                                        })}

                                                        {/* Connection from above to this commit */}
                                                        {index > 0 && (
                                                            <line
                                                                x1={commit.lane * laneWidth + 15}
                                                                y1={0}
                                                                x2={commit.lane * laneWidth + 15}
                                                                y2={rowHeight / 2}
                                                                stroke={commit.color}
                                                                strokeWidth="2.5"
                                                            />
                                                        )}

                                                        {/* Commit Node */}
                                                        <circle
                                                            cx={commit.lane * laneWidth + 15}
                                                            cy={rowHeight / 2}
                                                            r={nodeRadius}
                                                            fill={commit.color}
                                                            stroke="#fff"
                                                            strokeWidth="2"
                                                        />
                                                        {commit.isMerge && (
                                                            <circle
                                                                cx={commit.lane * laneWidth + 15}
                                                                cy={rowHeight / 2}
                                                                r={nodeRadius - 2}
                                                                fill="#fff"
                                                            />
                                                        )}
                                                    </svg>
                                                </div>

                                                {/* Commit Info Section */}
                                                <div className="flex-1 py-3 pl-4 min-w-0 pr-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <a
                                                                    href={commit.html_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-foreground hover:text-primary font-medium truncate transition-colors decoration-primary/30 underline-offset-4 hover:underline"
                                                                >
                                                                    {message}
                                                                </a>
                                                                {commit.commit.verification?.verified && (
                                                                    <Badge variant="outline" className="h-4 px-1 text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 font-medium whitespace-nowrap">
                                                                        <Check className="h-2.5 w-2.5" />
                                                                        Verified
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <span className="font-semibold text-foreground/70">{author}</span>
                                                                <span className="opacity-40">•</span>
                                                                <span>{date}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground font-mono">
                                                                {shortSha}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopy(commit.sha)}
                                                                className="h-7 w-7 p-0 hover:bg-muted"
                                                            >
                                                                {copiedId === commit.sha ? (
                                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                                ) : (
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
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
