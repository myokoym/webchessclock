# Technology Stack

## Architecture
**アーキテクチャタイプ**: SSR (Server-Side Rendering) + WebSocket リアルタイム通信

**システム構成**:
- Nuxt.js Universal Mode によるSSR/SPA ハイブリッド
- Express.js サーバーでNuxtとSocket.ioを統合
- Redisによるセッション状態の永続化
- WebSocketによるリアルタイム双方向通信

## Frontend

### Core Framework
- **Nuxt.js 2.x**: Vue.jsベースのフルスタックフレームワーク (Universal Mode)
- **Vue.js 2.x**: リアクティブUIフレームワーク
- **Bootstrap-Vue 2.x**: UIコンポーネントライブラリ

### State Management
- **Vuex**: Nuxt.js統合のステート管理（store/モジュール形式）

### Networking
- **Socket.io-client 2.x**: WebSocketクライアント実装

### Build Tools
- **TypeScript**: 型安全性のサポート（@nuxt/typescript-build）
- **Webpack**: Nuxt.js内蔵のバンドラー

### Utilities
- **Moment.js**: 時間計算とフォーマット処理
- **vue-clipboard2**: クリップボードへのコピー機能

## Backend

### Runtime & Server
- **Node.js**: JavaScript実行環境
- **Express.js 4.x**: HTTPサーバーフレームワーク

### Real-time Communication
- **Socket.io 2.x**: WebSocketサーバー実装
  - ルーム機能による独立したセッション管理
  - イベントベースの通信プロトコル

### Data Persistence
- **Redis (ioredis 4.x)**: インメモリデータストア
  - ルーム状態の永続化
  - HashMapによる効率的なデータ構造

### Utilities
- **crypto-random-string**: ルームID生成
- **consola**: 開発用ロギング

## Development Environment

### Prerequisites
- Node.js (推奨: 14.x以上)
- Redis サーバー（ローカルまたはREDIS_URL環境変数）
- npm または yarn

### Development Tools
- **nodemon**: サーバーの自動再起動
- **cross-env**: クロスプラットフォーム環境変数設定

## Common Commands

```bash
# 開発環境の起動（ホットリロード付き）
npm run dev

# プロダクションビルド
npm run build

# プロダクション環境の起動
npm run start

# 静的サイト生成
npm run generate

# 依存関係のインストール
npm install
```

## Environment Variables

### Required Variables
- **REDIS_URL**: Redis接続URL（本番環境）
  - 形式: `redis://[username:password@]host[:port][/db-number]`
  - デフォルト: ローカルRedis（localhost:6379）

### Optional Variables
- **NODE_ENV**: 実行環境
  - `development`: 開発環境（ホットリロード有効）
  - `production`: 本番環境（最適化ビルド）

- **HOST**: サーバーホスト
  - デフォルト: localhost

- **PORT**: サーバーポート
  - デフォルト: 3000

## Port Configuration

### Default Ports
- **3000**: Webアプリケーション（HTTP + WebSocket）
- **6379**: Redis（デフォルト設定時）

### Development Ports
開発時は以下のポートが使用されます：
- **3000**: Nuxt.js開発サーバー
- **24678**: Nuxt.js HMR (Hot Module Replacement)

## Deployment Considerations

### Heroku Deployment
- `Procfile` による起動コマンド定義対応
- 環境変数によるRedis URL設定
- 動的ポート割り当て対応

### Production Optimizations
- Nuxt.jsのプロダクションビルドによる最適化
- Socket.io の本番モード設定
- Redis接続プーリング

## Security Considerations
- XSS保護: Vue.jsの自動エスケープ
- CSP: Nuxt.jsのデフォルト設定
- WebSocket: Socket.ioの組み込みセキュリティ機能