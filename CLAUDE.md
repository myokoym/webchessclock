# webchessclock Project Configuration

## Project Context
このファイルはwebchessclockプロジェクト固有の設定と仕様追跡を管理します。

## Active Specifications

### Current Specs
- `container-deployment-strategy`: webchessclockプロジェクトに適したコンテナ戦略とデプロイ戦略の策定
  - Status: initialized
  - Created: 2025-08-15
  - Next: `/kiro:spec-requirements container-deployment-strategy`

## Project-Specific Guidelines

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