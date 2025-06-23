import { ProjectEditPage } from "@/components/projects/project-edit-page"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectEditPage projectId={id} />
}
