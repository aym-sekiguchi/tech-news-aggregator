"use client";

import { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <article className="group bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2 flex-1">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors group-hover:text-blue-600"
            >
              {article.title}
            </a>
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
            <span className="bg-gray-100 px-2 py-1 rounded-full">{formatDate(article.pubDate)}</span>
          </div>
        </div>

        {article.description && (
          <p className="text-gray-600 text-sm leading-relaxed">{truncateText(article.description, 120)}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              {article.author}
            </span>
            <span>•</span>
            <span>{article.source}</span>
          </div>
          <div className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">続きを読む →</div>
        </div>
      </div>
    </article>
  );
}
