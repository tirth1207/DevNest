import { ProjectEditPage } from "@/components/projects/project-edit-page"

interface ProjectEditPageProps {
  params: {
    id: string
  }
}

export default function ProjectEdit({ params }: ProjectEditPageProps) {
  return <ProjectEditPage projectId={params.id} />
}
