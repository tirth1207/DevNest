"use client"

import { DialogTrigger } from "@/components/ui/dialog"
import React, { useState } from "react"
import { useOrganizations } from "@/hooks/use-organizations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  FolderOpen,
  Settings,
  Trash2,
  ExternalLink,
  Crown,
  Shield,
  Eye,
  UserCheck,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Organization } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

interface CreateOrgFormData {
  name: string
  slug: string
  description: string
}

export default function OrganizationsPage() {
  const { organizations, loading, createOrganization, updateOrganization, deleteOrganization } = useOrganizations()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const [userId, setUserId] = useState<string>("")
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id)
    })
  }, [])

  const [formData, setFormData] = useState<CreateOrgFormData>({
    name: "",
    slug: "",
    description: "",
  })

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }))
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required",
        variant: "destructive",
      })
      return
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Organization slug is required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const newOrg = await createOrganization({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        settings: { visibility: "private", allow_member_invites: false },
        owner_id: userId,
      })

      if (newOrg) {
        toast({
          title: "Success",
          description: "Organization created successfully",
        })
        setIsCreateDialogOpen(false)
        setFormData({ name: "", slug: "", description: "" })
        router.push(`/organizations/${newOrg.slug}`)
      } else {
        throw new Error("Failed to create organization")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create organization",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteOrganization = async () => {
    if (!selectedOrg) return

    setIsDeleting(true)
    try {
      const success = await deleteOrganization(selectedOrg.id)
      if (success) {
        toast({
          title: "Success",
          description: "Organization deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setSelectedOrg(null)
      } else {
        throw new Error("Failed to delete organization")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete organization",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />
      case "admin":
        return <Shield className="h-3 w-3" />
      case "member":
        return <UserCheck className="h-3 w-3" />
      case "viewer":
        return <Eye className="h-3 w-3" />
      default:
        return <UserCheck className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "member":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "viewer":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Search Skeleton */}
        <Skeleton className="h-10 w-full max-w-md" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Building2 className="mr-3 h-10 w-10" />
                Organizations
              </h1>
              <p className="text-indigo-100 text-lg">Manage your organizations and collaborate with your team</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 border-white/30 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreateOrganization}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-indigo-600" />
                      Create Organization
                    </DialogTitle>
                    <DialogDescription>Create a new organization to collaborate with your team.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Organization Name</Label>
                      <Input
                        id="name"
                        placeholder="Acme Inc"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        placeholder="acme-inc"
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        required
                      />
                      <p className="text-xs text-muted-foreground">This will be used in URLs: /org/{formData.slug}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your organization"
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Creating..." : "Create Organization"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-0 shadow-lg bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Organizations Grid */}
      {filteredOrganizations.length === 0 ? (
        <div className="text-center py-16">
          <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-slate-900">
            {searchQuery ? "No organizations found" : "No organizations yet"}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Create your first organization to get started and collaborate with your team"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <Card
              key={org.id}
              className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                        <AvatarImage src={org.avatar_url || undefined} alt={org.name} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                          {org.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                        {org.name}
                      </CardTitle>
                      <CardDescription className="font-medium">@{org.slug}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/organizations/${org.slug}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Organization
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/organizations/${org.slug}/settings`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedOrg(org)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-slate-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {org.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-slate-500">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Members</span>
                    </div>
                    <div className="flex items-center text-slate-500">
                      <FolderOpen className="h-4 w-4 mr-1" />
                      <span>Projects</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getRoleColor("owner")}`}>
                    {getRoleIcon("owner")}
                    <span className="ml-1">Owner</span>
                  </Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Link href={`/dashboard/organizations/${org.slug}`}>
                    View Organization
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization{" "}
              <strong>{selectedOrg?.name}</strong> and all of its data, including projects, tasks, and member
              information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
