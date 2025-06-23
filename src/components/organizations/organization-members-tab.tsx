"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus, MoreHorizontal, Copy, Check } from "lucide-react"
import type { OrganizationMember } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import React from "react"

interface OrganizationMembersTabProps {
  organizationSlug: string
  members: (OrganizationMember & { profile: any })[]
  loading: boolean
  canManage: boolean
  currentUserRole: string | null
  onRefresh?: () => void
}

export function OrganizationMembersTab({
  organizationSlug,
  members,
  loading,
  canManage,
  currentUserRole,
  onRefresh,
}: OrganizationMembersTabProps) {
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/invite/organization/${organizationSlug}` : ""

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>People who have access to this organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Members ({members.length})</CardTitle>
          <CardDescription>People who have access to this organization</CardDescription>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
          {canManage && (
            <>
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite to Organization</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Share this link to invite someone to your organization:</div>
                      <div className="flex items-center gap-2 bg-muted rounded px-2 py-1 max-w-full overflow-x-auto">
                        <span className="text-xs select-all break-all whitespace-pre-wrap">{inviteLink}</span>
                        <Button size="icon" variant="outline" onClick={handleCopy}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <DialogFooter className="flex w-full justify-end">
                      <Button variant="secondary" onClick={() => setInviteOpen(false)}>Close</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {member.profile?.full_name?.charAt(0) || member.profile?.email?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.profile?.full_name || member.profile?.email}</p>
                  <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {member.role}
                </Badge>
                {canManage && member.role !== "owner" && (
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
