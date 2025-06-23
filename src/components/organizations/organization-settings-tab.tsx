"use client"

import { useState } from "react"
import type { Organization } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Trash2,
  AlertTriangle,
  Save,
  Settings,
  Globe,
  Lock,
  Users,
  Link,
  Copy,
  Check,
  Eye,
  Shield,
  UserPlus,
} from "lucide-react"
import { OrganizationsService } from "@/lib/database/organizations"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface OrganizationSettingsTabProps {
  organization: Organization
  onUpdate: (updates: Partial<Organization>) => Promise<void>
  userRole: string | null
}

export function OrganizationSettingsTab({ organization, onUpdate, userRole }: OrganizationSettingsTabProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDangerZone, setShowDangerZone] = useState(false)

  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Organization name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Organization name must be at least 2 characters"
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = "Website must be a valid URL starting with http:// or https://"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Only include fields that exist in the database
      const updateData: Partial<Organization> = {
        name: formData.name,
        description: formData.description,
      }

      await onUpdate(updateData)
      toast({
        title: "Settings updated",
        description: "Organization settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error updating organization:", error)
      toast({
        title: "Error",
        description: "Failed to update organization settings. Some fields may not be available yet.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteOrganization = async () => {
    try {
      setIsDeleting(true)
      const success = await OrganizationsService.deleteOrganization(organization.id)
      if (success) {
        toast({
          title: "Organization deleted",
          description: "The organization has been permanently deleted.",
        })
        router.push("/organizations")
      } else {
        throw new Error("Failed to delete organization")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/invite/organization/${organization.slug}`
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "Organization invite link copied to clipboard.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const canEdit = userRole === "owner" || userRole === "admin"
  const canDelete = userRole === "owner"
  const canManageMembers = userRole === "owner" || userRole === "admin"

  const hasChanges =
    formData.name !== organization.name ||
    formData.description !== (organization.description || "")

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Update your organization's basic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSaving}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={500}
                disabled={isSaving}
              />
              <p className="text-sm text-muted-foreground text-right">{formData.description.length}/500 characters</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Read-only information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Organization ID</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{organization.id}</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Slug</span>
              <Badge variant="outline">@{organization.slug}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your Role</span>
              <Badge variant="outline" className="capitalize">
                {userRole}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Created</span>
              <span>{organization.created_at ? new Date(organization.created_at).toLocaleString() : "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
