import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { NewPageForm } from "@/components/docs/new-page-form"

interface NewPagePageProps {
  params: {
    id: string
  }
}

export default async function NewPagePage({ params }: NewPagePageProps) {
  const supabase = await createClient()

  const { data: project } = await supabase.from("projects").select("*").eq("id", params.id).single()

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
        <p className="text-muted-foreground">Add documentation to {project.name}</p>
      </div>

      <NewPageForm projectId={params.id} />
    </div>
  )
}
