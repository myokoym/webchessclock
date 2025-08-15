# webchessclock Project Configuration

## Project Context
このファイルはwebchessclockプロジェクト固有の設定と仕様追跡を管理します。

## Active Specifications

### Current Specs
- `container-deployment-strategy`: webchessclockプロジェクトに適したコンテナ戦略とデプロイ戦略の策定
  - Status: tasks-generated
  - Created: 2025-08-15
  - Requirements: ✅ 承認済み
  - Design: ✅ 承認済み
  - Tasks: ✅ 生成済み（20タスク）
  - Next: 実装開始可能

## Project-Specific Guidelines

### Shell Command Format
- **一時的な実行コマンド**: `&&`でつなげて1行で提供
- **コメントを含めない**: zshで`#`がコメントとして認識されない問題を回避
- **例**: `docker compose down -v && docker rmi image-name && npm run dev`
- **理由**: ユーザーがzshを使用しており、コピペで一括実行するため

### Technology Stack
- Frontend: Nuxt.js 2.x (Universal Mode)
- Backend: Express.js + Socket.io
- Database: Redis
- Package Manager: npm

### Development Commands
```bash
npm run dev    # 開発サーバー起動
npm run build  # プロダクションビルド
npm run start  # プロダクション起動
```

### Important Notes
- Socket.ioを使用したリアルタイム通信が必須
- Redisによる状態永続化が必要
- マルチプレイヤー対応（最大100人）を考慮

## Git Commit Rules

### 絶対禁止事項
- **無関係な変更を混在させない**: 異なる目的の変更は必ず別々のコミットにする
- **git commit --amend を慎重に使用**: 
  - amendする前に必ず `git status` で変更ファイルを確認
  - `git diff --cached` でステージされた変更内容を確認
  - 意図しないファイルが含まれていないことを確認
- **個人情報の使用禁止**:
  - ブログ投稿者名などには実名を使用しない
  - GitHubユーザー名やハンドルネームを使用する

### 必須事項
- **コミット前の確認**: 
  - `git status` で変更ファイルの確認
  - `git diff --cached` でステージング内容の確認
- **コミットの分離**:
  - 機能追加、バグ修正、ドキュメント更新は別コミット
  - 関連性のない変更は絶対に同じコミットに含めない