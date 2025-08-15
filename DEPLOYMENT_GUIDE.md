# デプロイメントガイド

## 概要

webchessclockアプリケーションを本番環境にデプロイするための完全ガイドです。
$0〜$10/月の低コスト運用を実現する設定になっています。

## 必要なサービスのアカウント登録

### 1. Fly.io（アプリケーションホスティング）

**無料枠:** 
- 3つのshared-cpu-1x VMインスタンス（256MB RAM）
- 160GB転送量/月
- $0から開始可能

**登録手順:**
1. [Fly.io](https://fly.io) にアクセス
2. "Sign Up"をクリック
3. GitHubアカウントまたはメールで登録
4. クレジットカード登録（無料枠内なら課金なし）
5. CLIツールをインストール：
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (WSL2推奨)
   curl -L https://fly.io/install.sh | sh
   ```

6. ログイン：
   ```bash
   flyctl auth login
   ```

### 2. Upstash Redis（オプション - データ永続化）

**無料枠:**
- 10,000コマンド/日
- 256MB ストレージ
- 永久無料

**登録手順:**
1. [Upstash](https://upstash.com) にアクセス
2. GitHubアカウントで登録
3. "Create Database"をクリック
4. リージョンを選択（東京推奨）
5. 接続情報を取得：
   - REDIS_URL: `https://xxx.upstash.io`
   - UPSTASH_REDIS_REST_TOKEN: 表示されるトークン

### 3. GitHub（CI/CD）

**必要な設定:**
1. リポジトリの`Settings > Secrets and variables > Actions`
2. 以下のシークレットを追加：
   - `FLY_API_TOKEN`: `flyctl auth token`で取得
   - `UPSTASH_REDIS_URL`: Upstashから取得（オプション）
   - `UPSTASH_REDIS_REST_TOKEN`: Upstashから取得（オプション）

## ローカルでのデプロイ準備

### 1. 環境変数の設定

```bash
# .env.production を作成
cp .env.example .env.production

# 編集
vim .env.production
```

必要な環境変数：
```env
NODE_ENV=production
REDIS_URL=https://your-upstash-url.upstash.io  # またはメモリフォールバック使用
UPSTASH_REDIS_REST_TOKEN=your-token-here       # Upstash使用時のみ
```

### 2. Fly.ioアプリケーションの作成

```bash
# 初回のみ実行
fly launch --copy-config --name your-app-name

# 質問への回答：
# - Region: nrt (Tokyo)を推奨
# - Deploy now?: No（設定後にデプロイ）
```

### 3. シークレットの設定

```bash
# Redisを使用する場合
fly secrets set REDIS_URL="https://your-upstash-url.upstash.io"
fly secrets set UPSTASH_REDIS_REST_TOKEN="your-token-here"

# メモリフォールバックのみ使用する場合（$0運用）
# 何も設定しない（自動的にメモリフォールバック）
```

## デプロイ実行

### 手動デプロイ

```bash
# デプロイ実行
npm run deploy:fly

# または
fly deploy
```

### 自動デプロイ（GitHub Actions）

1. mainブランチにプッシュすると自動デプロイ
2. GitHub Actionsタブで進捗確認
3. デプロイ成功後、自動的にヘルスチェック

## デプロイ後の確認

### アプリケーションURL

```bash
# URLを確認
fly info

# ブラウザで開く
fly open
```

デフォルトURL: `https://your-app-name.fly.dev`

### ヘルスチェック

```bash
# ヘルスチェックエンドポイント
curl https://your-app-name.fly.dev/api/health

# ログ確認
fly logs

# ステータス確認
fly status
```

### モニタリング

```bash
# リアルタイムログ
fly logs -f

# メトリクス確認
fly dashboard
```

## コスト管理

### 無料枠の最大活用

1. **Fly.io**
   - shared-cpu-1x（256MB）を使用
   - 1インスタンスのみ起動
   - auto_stop_machines = true（アイドル時停止）

2. **Upstash Redis**
   - 10,000コマンド/日以内に収める
   - TTL設定で古いデータ自動削除

3. **完全無料（$0）運用**
   - Redisを使わずメモリフォールバック
   - データは再起動で消える（問題ない用途向け）

### コスト監視

```bash
# Fly.io使用量確認
fly billing

# Upstashダッシュボードで確認
# https://console.upstash.com
```

## トラブルシューティング

### デプロイが失敗する

```bash
# ログ確認
fly logs --app your-app-name

# 手動でビルドテスト
docker build -t test .

# 設定確認
fly config validate
```

### アプリが起動しない

```bash
# ヘルスチェック確認
fly checks list

# SSHで接続
fly ssh console

# 環境変数確認
fly ssh console -C "printenv"
```

### Redisに接続できない

1. メモリフォールバックが自動的に動作
2. Upstash URLとトークンを確認
3. `fly secrets list`で設定確認

## 本番運用のベストプラクティス

### 1. 監視設定

- UptimeRobot（無料）でダウンタイム監視
- Fly.ioのヘルスチェック設定
- エラーログの定期確認

### 2. バックアップ

- GitHubにコード保存
- Redisデータは24時間で自動削除設定
- 重要データは別途バックアップ

### 3. スケーリング

```bash
# インスタンス数を増やす（有料）
fly scale count 2

# メモリを増やす（有料）
fly scale memory 512
```

### 4. カスタムドメイン（オプション）

```bash
# ドメイン追加
fly certs add yourdomain.com

# DNS設定をFly.ioのIPに向ける
fly ips list
```

## サポート

- Fly.io Documentation: https://fly.io/docs
- Upstash Documentation: https://docs.upstash.com
- GitHub Issues: プロジェクトのIssuesページ

## 次のステップ

1. ✅ Fly.ioアカウント作成
2. ✅ flyctlインストール
3. ✅ `fly launch`でアプリ作成
4. ✅ `fly deploy`でデプロイ
5. ✅ ヘルスチェック確認
6. 🎉 本番運用開始！