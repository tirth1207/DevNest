"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { useRouter } from "next/navigation"

export function AuthButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("Error signing in:", error)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleSignIn} className="flex items-center gap-2">
        <Github className="h-4 w-4" />
        Sign in with GitHub
      </Button>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  )
}
