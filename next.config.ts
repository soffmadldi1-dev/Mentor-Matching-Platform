import type { NextConfig } from "next";

// cacheComponents는 사용하지 않는다(CLAUDE.md 13장). 로그인 상태에 따라 달라지는 동적 화면이 대부분이다.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
