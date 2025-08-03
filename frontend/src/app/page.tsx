import { Suspense } from "react";
import { getArticles } from "@/lib/actions";
import ArticleList from "@/components/ArticleList";
import LoadingSkeleton from "@/components/LoadingSkeleton";

// ページレベルでのキャッシュ設定
export const revalidate = 300; // 5分間のISR
export const dynamic = "auto"; // Next.jsが自動的に最適な戦略を選択

// ページメタデータ
export async function generateMetadata() {
  const articles = await getArticles();
  const articleCount = articles.length;

  return {
    title: `Tech News Aggregator - ${articleCount}件の記事`,
    description: `Dev.toから取得した最新の技術記事${articleCount}件を表示`,
  };
}

export default async function Home() {
  // サーバーサイドで記事を取得
  const initialArticles = await getArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSkeleton />}>
        <ArticleList initialArticles={initialArticles} />
      </Suspense>
    </div>
  );
}
