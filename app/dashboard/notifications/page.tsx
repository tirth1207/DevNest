import { createClient } from "@/lib/supabase/server"
import { Bell, CheckCircle, MessageSquare, UserPlus, GitCommit } from "lucide-react"
import { NotificationCenter } from "@/components/notifications/notification-center"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return CheckCircle
      case "comment_mention":
        return MessageSquare
      case "project_invitation":
        return UserPlus
      case "github_commit":
        return GitCommit
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "text-blue-600"
      case "comment_mention":
        return "text-green-600"
      case "project_invitation":
        return "text-purple-600"
      case "github_commit":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return <NotificationCenter userId={user?.id!} initialNotifications={notifications || []} />
}
