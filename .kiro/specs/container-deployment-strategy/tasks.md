# Implementation Plan

## 開発環境ドキュメントとコマンド体系

- [ ] 1. 開発環境ドキュメントとコマンド体系の整備
  - README.mdへの開発環境セットアップ手順の記載
  - Makefile または package.json scripts による統一コマンド体系の構築
  - .env.example ファイルの作成と環境変数の説明
  - ローカル開発、Docker開発、本番相当環境の起動方法明記
  - よく使うコマンドの整理（dev, dev:docker, build, deploy:fly など）
  - _Requirements: 1.3, 4.1_

## Docker コンテナ化

- [ ] 2. Dockerfileの作成とマルチステージビルド設定
  - Node.js 18-alpineをベースイメージとして使用
  - マルチステージビルドで依存関係、ビルド、実行環境を分離
  - 非rootユーザー（nodejs:1001）での実行設定
  - 最小限の実行環境構成（.nuxt、node_modules、server、static のみ）
  - _Requirements: 1.1, 1.2, 1.6_

- [ ] 3. Docker Compose開発環境設定
  - docker-compose.ymlファイルの作成
  - ローカル開発用のボリュームマウント設定
  - 環境変数の.envファイル対応
  - ホットリロード用のポート設定（3000, 24678）
  - _Requirements: 1.3, 1.4_

- [ ] 4. .dockerignoreファイルの作成とビルド最適化
  - 不要なファイルの除外設定
  - node_modulesキャッシュの最適化
  - ビルドサイズ削減のための設定
  - _Requirements: 1.5_

## Fly.io デプロイメント設定

- [ ] 5. fly.toml設定ファイルの作成
  - アプリケーション基本設定（名前、リージョン）
  - 256MB RAMの最小インスタンス設定
  - HTTPSとWebSocketのポート設定
  - ヘルスチェックエンドポイント（/health）の設定
  - _Requirements: 2.1, 2.2, 6.1_

- [ ] 6. Fly.io環境変数とシークレット設定
  - fly secrets setコマンド用のスクリプト作成
  - REDIS_URL、NODE_ENV、PORT、HOSTの設定
  - Upstash Redis接続情報の設定
  - _Requirements: 2.3, 4.1, 4.2, 4.4_

## Redis接続とフォールバック実装

- [ ] 7. Upstash Redis接続モジュールの実装
  - server/lib/redis.jsの作成
  - Upstash Redis REST API接続の実装
  - 接続エラー時のリトライロジック
  - 24時間TTL自動設定の実装
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8. インメモリフォールバック機能の実装
  - server/lib/memoryStore.jsの作成
  - Redis接続失敗時のインメモリストレージ実装
  - ルームデータの一時保存ロジック
  - _Requirements: 7.5, 7.6_

- [ ] 9. 既存server/index.jsのRedis接続更新
  - ioredisからUpstash Redis対応への変更
  - フォールバック機能の統合
  - エラーハンドリングの改善
  - _Requirements: 7.4, 8.1_

## ヘルスチェックとモニタリング

- [ ] 10. ヘルスチェックエンドポイントの実装
  - server/routes/health.jsの作成
  - /healthエンドポイントの実装
  - Redis接続状態の確認
  - メモリ使用量とプロセス情報の返却
  - _Requirements: 5.1, 5.3_

- [ ] 11. ログ出力の構造化
  - server/lib/logger.jsの作成
  - JSON形式でのログ出力実装
  - エラー、警告、情報レベルの設定
  - stdout/stderrへの適切な出力
  - _Requirements: 5.2, 5.4_

## セキュリティ強化

- [ ] 12. セキュリティヘッダーとバリデーションの実装
  - helmetミドルウェアの導入と設定
  - 入力バリデーション関数の作成
  - CSPヘッダーの設定
  - WebSocket接続のレート制限実装
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 13. 環境変数によるシークレット管理
  - .env.exampleファイルの作成
  - 環境変数読み込みロジックの実装
  - 機密情報のマスキング処理
  - _Requirements: 8.2, 4.3_

## CI/CD パイプライン

- [ ] 14. GitHub Actionsワークフローの作成
  - .github/workflows/deploy.ymlの作成
  - mainブランチプッシュトリガーの設定
  - Node.js環境のセットアップ
  - 軽量テストの実行設定
  - _Requirements: 3.1, 3.3_

- [ ] 15. Fly.ioへの自動デプロイ設定
  - flyctl-actionsの設定
  - FLY_API_TOKENシークレットの使用
  - デプロイ成功/失敗の通知設定
  - ロールバック処理の実装
  - _Requirements: 3.2, 3.4, 3.5, 3.6_

## コスト監視と最適化

- [ ] 16. コスト監視モジュールの実装
  - server/lib/costMonitor.jsの作成
  - Redis使用量カウンターの実装
  - 月額コスト推定ロジック
  - $8到達時のアラート機能
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 17. 静的アセット最適化設定
  - 静的ファイルのキャッシュヘッダー設定
  - Cloudflare CDN用のメタタグ追加
  - ブラウザキャッシュの最大活用設定
  - _Requirements: 9.3, 9.4_

- [ ] 18. アイドル時リソース解放機能
  - 30分アイドル検知ロジックの実装
  - メモリ解放処理の実装
  - WebSocket接続のクリーンアップ
  - _Requirements: 6.3, 6.6, 9.4_

## テストと検証

- [ ] 19. ユニットテストの作成
  - test/unit/redis.test.jsの作成
  - test/unit/health.test.jsの作成
  - test/unit/costMonitor.test.jsの作成
  - Jestによるテスト実行設定
  - _Requirements: 3.3_

- [ ] 20. 統合テストの実装
  - test/integration/websocket.test.jsの作成
  - Socket.io接続テスト
  - Redis接続とフォールバックテスト
  - 10同時接続での負荷テスト
  - _Requirements: 6.2_

- [ ] 21. ローカル動作確認スクリプトの作成
  - scripts/local-test.shの作成
  - Dockerコンテナの起動確認
  - 環境変数の検証
  - ヘルスチェックの動作確認
  - _Requirements: All requirements need E2E validation_