---
title: "Fly.ioでのWebアプリのDockerデプロイ: 完全ガイド"
date: 2025-08-15
author: myokoym
tags: [docker, fly.io, deployment, devops, redis]
category: infrastructure
description: "Nuxt.jsアプリケーションをDockerでコンテナ化してFly.ioにデプロイし、月額$0-10でコスト最適化する方法を学ぶ"
---

# Fly.ioでのWebアプリのDockerデプロイ: 完全ガイド

[English](docker-deployment-fly.md) | [日本語](docker-deployment-fly.ja.md)

## TL;DR

Nuxt.js + Socket.ioアプリケーションをDockerコンテナ化してFly.ioに正常にデプロイし、Upstash Redisを使用してトラフィックが少ない場合は月額$0で運用を達成。Node.js 18の互換性問題も解決しました。

## はじめに

このガイドでは、webchessclockアプリケーションをFly.ioにデプロイした体験を共有します。Node.js互換性問題、Dockerパーミッション問題、コスト最適化戦略などの一般的な課題の解決策も含まれています。

## メインコンテンツ

### 課題: Node.js 18互換性問題

Nuxt.js 2.xアプリケーションがWebpack 4に影響するOpenSSL 3.0の変更により、Node.js 18で互換性問題に直面しました。初期エラー:

```bash
Error: error:0308010C:digital envelope routines::unsupported
```

**解決策**: Nuxtを2.18.1に更新し、OpenSSLレガシープロバイダーを追加:

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS=--openssl-legacy-provider nuxt"
  }
}
```

### Dockerマルチステージビルド

最小サイズ（91MB）でAlpine Linuxを使用した最適化されたDockerfileを作成:

```dockerfile
# ステージ1: 依存関係
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# ステージ2: ビルド
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm run build

# ステージ3: 実行環境
FROM node:18-alpine AS runtime
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxtjs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.nuxt ./.nuxt
COPY --from=builder /app/static ./static
COPY --from=builder /app/server ./server
USER nuxtjs
EXPOSE 3000
CMD ["npm", "start"]
```

### Fly.ioデプロイ設定

```toml
app = "webchessclock"
primary_region = "nrt"

[env]
  NODE_ENV = "production"
  NUXT_HOST = "0.0.0.0"
  NUXT_PORT = "3000"
  NODE_OPTIONS = "--openssl-legacy-provider"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

### Upstash Redisでのコスト最適化

複数のバックエンドをサポートするRedisラッパーを実装:

```javascript
class RedisClient {
  constructor() {
    if (process.env.REDIS_URL?.includes('upstash')) {
      this.isUpstash = true;
      this.client = new Redis(process.env.REDIS_URL);
    } else if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL);
    } else {
      this.useMemoryFallback();
    }
  }

  useMemoryFallback() {
    console.warn('メモリ内ストレージフォールバックを使用');
    this.memoryStore = new Map();
    this.usingMemory = true;
  }
}
```

## 結果・発見

- **デプロイ成功**: アプリケーションが https://webchessclock.fly.dev/ で稼働
- **パフォーマンス**: 負荷時〜100msの応答時間、200MBのメモリ使用量
- **コスト**: 低トラフィック（1日10,000 Redisコマンド未満）で月額$0
- **Dockerイメージ**: 最終サイズ91MB
- **コールドスタート**: 3秒未満

## まとめ

主要なポイント:
1. **Node.js 18互換性**: Webpack 4にはOpenSSLレガシープロバイダーを使用
2. **Docker最適化**: Alpine Linuxを使用したマルチステージビルド
3. **コスト効率**: Fly.io無料ティア + Upstash Redisサーバーレス
4. **パーミッション問題**: Dockerでユーザーパーミッションを適切に処理

## 参考文献

- [Fly.ioドキュメント](https://fly.io/docs/)
- [Upstash Redis](https://upstash.com/)
- [Node.js OpenSSL 3.0 互換性](https://nodejs.org/en/blog/release/v17.0.0#openssl-3-0)
- [Docker マルチステージビルド](https://docs.docker.com/build/building/multi-stage/)