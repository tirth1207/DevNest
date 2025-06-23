import { ProjectDetailPage } from "@/components/projects/project-detail-page"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return <ProjectDetailPage projectId={params.id} />
}
 