"use client";

import { useState, useTransition, useOptimistic } from "react";

import { Article } from "@/types/article";
import { refreshArticles } from "@/lib/actions";
import ArticleCard from "./ArticleCard";

interface ArticleListProps {
  initialArticles: Article[];
}

export default function ArticleList({ initialArticles }: ArticleListProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic Updates for better UX
  const [optimisticArticles] = useOptimistic(initialArticles, (state, newArticles: Article[]) => newArticles);

  const handleRefresh = async () => {
    setError(null);

    startTransition(async () => {
      try {
        await refreshArticles();
        // Server Action が revalidatePath を呼ぶので、ページが自動更新される
      } catch (err) {
        setError(err instanceof Error ? err.message : "記事の更新に失敗しました");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tech News Aggregator
            </h1>
            <p className="text-gray-600 mt-2">最新の技術記事をチェック</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <div
                className={`w-2 h-2 rounded-full ${isPending ? "bg-yellow-500" : "bg-green-500"} animate-pulse`}
              ></div>
              <span>{optimisticArticles.length} 件の記事</span>
              {isPending && <span className="text-yellow-600">更新中...</span>}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                更新中...
              </div>
            ) : (
              "記事を更新"
            )}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            {error}
          </div>
        </div>
      )}

      {/* 記事リスト */}
      {optimisticArticles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <p className="text-gray-600 text-lg font-medium">記事がありません</p>
          <p className="text-gray-500 mt-2">「記事を更新」ボタンを押して最新の記事を取得してください</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {optimisticArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
