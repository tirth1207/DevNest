import { ProjectDetailPage } from "@/components/projects/project-detail-page"
import { ErrorBoundary } from "@/components/error-boundary"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <ErrorBoundary>
      <ProjectDetailPage projectId={id} />
    </ErrorBoundary>
  )
}
 