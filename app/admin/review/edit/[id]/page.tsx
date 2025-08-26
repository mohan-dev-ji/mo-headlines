import { ArticleEditPage } from "@/components/admin/review/ArticleEditPage"

export default function ReviewEditPage({ params }: { params: Promise<{ id: string }> }) {
  return <ArticleEditPage params={params} />
}