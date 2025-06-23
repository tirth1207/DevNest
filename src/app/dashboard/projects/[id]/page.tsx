import { ProjectDetailPage } from "@/components/projects/project-detail-page"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectDetailPage projectId={id} />
}
 