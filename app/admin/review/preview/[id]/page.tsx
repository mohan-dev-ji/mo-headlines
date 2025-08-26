import { ArticlePreviewPage } from "@/components/admin/review/ArticlePreviewPage"

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  return <ArticlePreviewPage params={params} />
}