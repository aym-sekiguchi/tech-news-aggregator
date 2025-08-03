import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // キャッシュ戦略の最適化
  async headers() {
    return [
      {
        // API routes のキャッシュ制御
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // 静的アセットのキャッシュ最適化
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // HTMLページのキャッシュ制御
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=600",
          },
        ],
      },
    ];
  },

  // 実験的機能でパフォーマンス向上
  experimental: {
    serverComponentsExternalPackages: ["axios"], // Server Componentsで外部パッケージを使用
    optimizePackageImports: ["@/components", "@/lib"], // パッケージインポートの最適化
  },

  // 画像最適化
  images: {
    domains: ["dev.to"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 300, // 5分間のキャッシュ
  },

  // コンパイル最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // パフォーマンス最適化
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
};

export default nextConfig;
