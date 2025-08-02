import fastify from "fastify";
import path from "path";
import fs from "fs/promises";
import cors from "@fastify/cors";
import { fileURLToPath } from "url";
import Parser from "rss-parser";

// ES6モジュールで __dirname を使用するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// RSS パーサーのシングルトンインスタンス
const parser = new Parser();

// Fastify インスタンスを作成
const app = fastify({ logger: true });

// CORS プラグインを登録
app.register(cors, {
  origin: ["http://localhost:3000"], // フロントエンドのURL
});

// データディレクトリのパス
const DATA_DIR = path.join(__dirname, "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

// データディレクトリを作成
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 記事データを読み込む
async function loadArticles() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ARTICLES_FILE, "utf8");
    const parsedData = JSON.parse(data);

    // 古い形式（配列）の場合は新しい形式に変換
    if (Array.isArray(parsedData)) {
      return {
        articles: parsedData,
        lastUpdated: null,
      };
    }

    return parsedData;
  } catch (error) {
    // ファイルが存在しない場合は空のデータを返す
    return {
      articles: [],
      lastUpdated: null,
    };
  }
}

// 記事データを保存する
async function saveArticles(articles, lastUpdated = new Date().toISOString()) {
  await ensureDataDir();
  const data = {
    articles,
    lastUpdated,
  };
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(data, null, 2));
}

// RSS フィードを取得して解析する
async function fetchRSSFeed() {
  try {
    const feed = await parser.parseURL("https://dev.to/feed");

    const articles = feed.items.map((item) => ({
      id: item.guid || item.link,
      title: item.title,
      link: item.link,
      description: item.contentSnippet || item.content,
      pubDate: item.pubDate,
      author: item.creator || item["dc:creator"] || "Unknown",
      source: "Dev.to",
    }));

    return articles;
  } catch (error) {
    app.log.error("RSS フィード取得エラー:", error);
    throw error;
  }
}

// ルート定義
app.get("/", async (request, reply) => {
  return { message: "Tech News Aggregator API" };
});

// 記事一覧取得
app.get("/api/articles", async (request, reply) => {
  try {
    const data = await loadArticles();
    return {
      articles: data.articles,
      total: data.articles.length,
      lastUpdated: data.lastUpdated,
    };
  } catch (error) {
    app.log.error("記事取得エラー:", error);
    reply.status(500).send({ error: "記事の取得に失敗しました" });
  }
});

// 記事手動更新
app.post("/api/articles/refresh", async (request, reply) => {
  try {
    app.log.info("RSS フィード更新を開始...");
    const newArticles = await fetchRSSFeed();

    // 既存の記事を読み込み
    const existingData = await loadArticles();
    const existingArticles = existingData.articles;

    // 重複チェック（IDベース）
    const existingIds = new Set(existingArticles.map((article) => article.id));
    const uniqueNewArticles = newArticles.filter((article) => !existingIds.has(article.id));

    // 新しい記事を先頭に追加
    const updatedArticles = [...uniqueNewArticles, ...existingArticles];

    // 最新50件に制限
    const limitedArticles = updatedArticles.slice(0, 50);

    // 実際に新しい記事がある場合のみ更新時刻を更新
    const updateTime = uniqueNewArticles.length > 0 ? new Date().toISOString() : existingData.lastUpdated;
    await saveArticles(limitedArticles, updateTime);

    app.log.info(`${uniqueNewArticles.length} 件の新しい記事を追加しました`);

    return {
      message: "記事を更新しました",
      newArticlesCount: uniqueNewArticles.length,
      totalArticles: limitedArticles.length,
      updatedAt: updateTime,
    };
  } catch (error) {
    app.log.error("記事更新エラー:", error);
    reply.status(500).send({ error: "記事の更新に失敗しました" });
  }
});

// サーバー起動
const start = async () => {
  try {
    await app.listen({ port: 3001, host: "0.0.0.0" });
    app.log.info("サーバーが http://localhost:3001 で起動しました");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
