# Project Structure

## Root Directory Organization

```
webchessclock/
├── .kiro/                # Kiro spec-driven development files
│   └── steering/         # Project steering documents
├── assets/               # 非コンパイルアセット（Webpack処理対象）
├── components/           # Vue.jsコンポーネント
├── layouts/              # アプリケーションレイアウト
├── middleware/           # カスタムミドルウェア
├── pages/                # ルーティング用ビューとページ
├── plugins/              # Vue.jsプラグイン（ルート Vue.js インスタンス前に実行）
├── server/               # サーバーサイドコード
├── static/               # 静的ファイル（直接サーブ）
├── store/                # Vuexストアファイル
├── nuxt.config.js        # Nuxt.js設定ファイル
├── package.json          # プロジェクト依存関係とスクリプト
├── tsconfig.json         # TypeScript設定
├── Procfile              # Herokuデプロイメント設定
└── README.md             # プロジェクトドキュメント
```

## Subdirectory Structures

### `/components` - UIコンポーネント
```
components/
├── Clock.vue             # メインの対局時計コンポーネント
├── InputSpinner.vue      # 数値入力用スピナーコンポーネント
├── Usage.vue            # 使い方説明コンポーネント
└── README.md            # コンポーネント説明
```

**役割**: 再利用可能なVue.jsコンポーネントを格納
- `Clock.vue`: 時計表示、プレイヤー切り替え、設定管理
- `InputSpinner.vue`: 時間設定用の数値入力UI
- `Usage.vue`: アプリケーションの使用方法表示

### `/pages` - ルーティングページ
```
pages/
├── index.vue            # ホームページ（ルーム作成）
├── rooms/
│   └── _id.vue         # 動的ルートページ（個別ルーム）
└── README.md
```

**役割**: Nuxt.jsの自動ルーティング用ページコンポーネント
- ファイル構造がそのままURLルートにマッピング
- `_id.vue`: 動的パラメータによるルーム別ページ

### `/store` - 状態管理
```
store/
├── index.js             # Vuexストアのルート設定
├── clock.js             # 時計関連の状態管理モジュール
├── room.js              # ルーム関連の状態管理モジュール
└── README.md
```

**役割**: Vuexによる集中状態管理
- モジュール形式でドメイン別に分割
- Socket.ioとの同期処理を含む

### `/server` - バックエンドコード
```
server/
└── index.js             # Express + Socket.io サーバー実装
```

**役割**: 
- Nuxt.jsのSSRサーバー統合
- Socket.ioによるWebSocket通信処理
- Redis接続とデータ永続化

### `/static` - 静的アセット
```
static/
├── favicon.ico          # ファビコン
├── apple-touch-icon.png # iOSホーム画面アイコン
├── robots.txt           # SEO用クローラー設定
└── README.md
```

**役割**: Webpackを通さず直接配信される静的ファイル

### `/layouts` - レイアウトテンプレート
```
layouts/
├── default.vue          # デフォルトレイアウト
└── README.md
```

**役割**: ページ共通のレイアウト定義

## Code Organization Patterns

### Component Structure
```vue
<template>
  <!-- HTMLテンプレート -->
</template>

<script>
// JavaScriptロジック
export default {
  name: 'ComponentName',
  props: {},
  data() {},
  computed: {},
  methods: {},
  mounted() {}
}
</script>

<style scoped>
/* スコープ付きCSS */
</style>
```

### Store Module Pattern
```javascript
// state
export const state = () => ({
  // 初期状態
})

// mutations
export const mutations = {
  // 同期的な状態変更
}

// actions
export const actions = {
  // 非同期処理とコミット
}

// getters
export const getters = {
  // 算出プロパティ
}
```

### Socket.io Event Pattern
```javascript
// クライアント側（コンポーネント内）
this.$socket.emit('eventName', data)
this.$socket.on('eventName', (data) => {})

// サーバー側（server/index.js）
socket.on('eventName', (data) => {})
io.to(roomId).emit('eventName', data)
```

## File Naming Conventions

### Vue Components
- **PascalCase**: `ComponentName.vue`
- 単一責任の原則に従った命名

### JavaScript Files
- **camelCase**: `fileName.js`
- モジュール/機能を表す名前

### Pages
- **kebab-case**: `page-name.vue`
- URLパスに対応した命名
- 動的ルート: `_parameter.vue`

### Static Assets
- **kebab-case**: `file-name.ext`
- 小文字とハイフン使用

## Import Organization

### 優先順位
1. Node.js組み込みモジュール
2. 外部依存関係（node_modules）
3. Nuxt.js/Vue.js特殊インポート
4. プロジェクト内部モジュール
5. 相対パスインポート

### エイリアス
- `~`: プロジェクトルート
- `@`: プロジェクトルート（同じ）
- `~/components`: コンポーネントディレクトリ
- `~/store`: ストアディレクトリ

## Key Architectural Principles

### 1. Separation of Concerns
- **View層**: Vue.jsコンポーネント（表示ロジック）
- **State層**: Vuexストア（状態管理）
- **Server層**: Express + Socket.io（通信とビジネスロジック）
- **Persistence層**: Redis（データ永続化）

### 2. Real-time Synchronization
- クライアント→サーバー: Socket.io emit
- サーバー→クライアント: Socket.io broadcast
- 状態の信頼できる唯一の情報源: Redisサーバー

### 3. Component Composition
- 小さく焦点を絞ったコンポーネント
- propsによるデータフロー
- イベントによる親への通信

### 4. Progressive Enhancement
- SSRによる初期表示の高速化
- クライアントサイドでのインタラクティブ機能追加
- WebSocket接続失敗時のグレースフルデグレード

### 5. Responsive Design First
- モバイルファーストのUI設計
- Bootstrap-Vueによる一貫したレスポンシブ対応
- タッチ操作を考慮したインタラクション設計