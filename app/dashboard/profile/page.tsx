import { redirect } from "next/navigation"

export default async function ProfilePage() {
  // Redirect to settings page since they're the same
  redirect("/dashboard/settings")
}
