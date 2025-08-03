"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { Article } from "@/types/article";

const API_BASE_URL = "http://localhost:3001";

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      next: {
        tags: ["articles"],
        revalidate: 300, // 5分間キャッシュ
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch articles");
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function refreshArticles() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/refresh`, {
      method: "POST",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh articles");
    }

    // キャッシュを無効化して再生成をトリガー
    revalidateTag("articles");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error refreshing articles:", error);
    throw new Error("記事の更新に失敗しました");
  }
}
