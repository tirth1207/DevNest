import { OrganizationDetailPage } from "@/components/organizations/organization-detail-page"

interface OrganizationPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { slug } = await params
  return <OrganizationDetailPage slug={slug} />
}
