---
title: "Socket.ioの入力検証実装：セキュリティ強化"
date: 2025-08-15
author: webchessclock-dev
tags: [security, socket.io, input-validation, redis]
category: security
lang: ja
description: "Socket.ioハンドラーの重大な入力検証脆弱性を修正し、Redisキーインジェクションとクロスルームデータ汚染を防止した方法"
---

[English](security-fixes-socketio-validation.md) | [日本語](security-fixes-socketio-validation.ja.md)

# Socket.ioの入力検証実装：セキュリティ強化

## TL;DR

Socket.ioイベントハンドラーに重大な入力検証の脆弱性を発見し修正しました。これらの脆弱性は、攻撃者がRedisキーを汚染したり、他のゲームセッションに干渉したりすることを可能にする恐れがありました。修正には厳格な入力検証、一貫したキープレフィックス、データフィールドのサイズ制限が含まれます。

## はじめに

webchessclockアプリケーションのセキュリティレビュー中に、Socket.ioハンドラーの入力検証が不十分であることに関連するいくつかの脆弱性を特定しました。これらの脆弱性により、悪意のあるユーザーが以下のような攻撃を行う可能性がありました：

- 任意のRedisキーの注入
- 他のプレイヤーのゲームセッションへの干渉
- 過度なサーバーリソースの消費
- アプリケーションの不安定化

この記事では、発見された脆弱性、実装した修正、そして得られた教訓について詳しく説明します。

## 脆弱性の詳細

### 1. 未検証のルームID

元のコードは、検証なしに任意の文字列をルームIDとして受け入れていました：

```javascript
// 脆弱なコード
socket.on("enterRoom", (id) => {
  roomId = id  // 検証なし！
  socket.join(roomId)
  redis.hmget(roomId, keys).then((result) => {
    // 結果を処理
  })
})
```

**攻撃ベクトル**: 攻撃者は以下のような悪意のあるルームIDを送信できました：
- `"../../admin/config"` - パストラバーサル攻撃の試み
- `"*"` - Redisワイルドカード
- `"victim-room-123"` - クロスルーム干渉

### 2. Redisキーの直接使用

ルームIDがプレフィックスなしでRedisキーとして直接使用されていました：

```javascript
// 脆弱なコード
redis.hmget(roomId, keys)  // 直接使用
redis.hsetBatch(roomId, fieldsToUpdate)
```

これにより、他のアプリケーションデータやシステムキーとのキー衝突の可能性がありました。

### 3. フィールド値のサイズ制限なし

アプリケーションは任意のサイズのフィールド値を受け入れていました：

```javascript
// 脆弱なコード
for (const field of validFields) {
  if (field in params) {
    fieldsToUpdate[field] = params[field]  // サイズチェックなし！
  }
}
```

**攻撃ベクトル**: 大量のデータペイロードによるメモリ枯渇攻撃。

## 解決策

### 1. 入力検証関数

3つの検証ヘルパー関数を実装しました：

```javascript
function validateRoomId(roomId) {
  // 英数字、ハイフン、アンダースコアのみ、1-50文字
  if (!roomId || typeof roomId !== 'string') {
    return false;
  }
  return /^[a-zA-Z0-9_-]{1,50}$/.test(roomId);
}

function validateFieldValue(value) {
  // 過度に大きな値を防ぐ
  if (typeof value === 'string' && value.length > 10000) {
    return false;
  }
  if (typeof value === 'object' && JSON.stringify(value).length > 10000) {
    return false;
  }
  return true;
}

function getRoomKey(roomId) {
  // キー衝突を防ぐための一貫したプレフィックスを追加
  return `room:${roomId}`;
}
```

### 2. イベントハンドラーでの検証

すべてのSocket.ioハンドラーが処理前に入力を検証するようになりました：

```javascript
socket.on("enterRoom", (id) => {
  // ルームIDを検証
  if (!validateRoomId(id)) {
    socket.emit("error", { message: "Invalid room ID format" });
    return;
  }
  roomId = id
  socket.join(roomId)
  // Redisにプレフィックス付きキーを使用
  redis.hmget(getRoomKey(roomId), keys).then((result) => {
    // 結果を処理
  })
})
```

### 3. パラメータオブジェクトの検証

`send`イベントハンドラーがパラメータオブジェクト全体を検証するようになりました：

```javascript
socket.on("send", (params) => {
  // パラメータオブジェクトを検証
  if (!params || typeof params !== 'object') {
    socket.emit("error", { message: "Invalid parameters" });
    return;
  }
  
  // 必要に応じてルームIDを検証
  if (!roomId) {
    if (!validateRoomId(params.roomId)) {
      socket.emit("error", { message: "Invalid room ID format" });
      return;
    }
    roomId = params.roomId
    socket.join(roomId)
  }
  
  // 各フィールド値を検証
  for (const field of validFields) {
    if (field in params) {
      if (!validateFieldValue(params[field])) {
        console.warn(`Field ${field} value too large, skipping`);
        continue;
      }
      fieldsToUpdate[field] = params[field]
    }
  }
})
```

## 修正のテスト

修正が正しく動作することを確認するために、Dockerベースのテスト環境を作成しました：

```yaml
# compose.yaml - テストサービス
test:
  build:
    context: .
    dockerfile: Dockerfile.dev
  environment:
    - NODE_ENV=test
  volumes:
    - .:/app:cached
    - /app/node_modules
    - /app/.nuxt
  command: ["npm", "run", "build"]
```

`package.json`の新しいテストコマンド：
```json
{
  "scripts": {
    "test": "docker compose run --rm test",
    "test:build": "docker compose run --rm test npm run build",
    "test:redis": "docker compose run --rm test node scripts/test-redis.js"
  }
}
```

## 適用されたセキュリティベストプラクティス

1. **ホワイトリスト入力検証**: 悪いパターンをブロックするのではなく、既知の良いパターンのみを許可
2. **多層防御**: 複数の検証レイヤー（型チェック、形式検証、サイズ制限）
3. **安全な失敗**: 無効な入力に対してエラーを返し、処理を停止
4. **一貫したキー名前空間**: プレフィックスを使用してキー衝突を防止
5. **リソース制限**: メモリ枯渇攻撃を防止

## 得られた教訓

1. **ユーザー入力を決して信用しない**: クライアントからのすべての入力を常に検証・サニタイズする
2. **一貫したキーパターンを使用**: Redisキーを名前空間化して衝突を防ぐ
3. **サイズ制限を実装**: リソース枯渇攻撃を防ぐ
4. **分離された環境でテスト**: Dockerは一貫したテストを保証するのに役立つ
5. **定期的なセキュリティレビュー**: プロアクティブなレビューは悪用される前に問題を発見

## まとめ

入力検証は、リアルタイムアプリケーションでしばしば見落とされがちな重要なセキュリティ制御です。Socket.ioハンドラーに適切な検証を実装することで、アプリケーションのセキュリティ態勢を大幅に改善しました。この修正により、Redisキーインジェクション、クロスルームデータ汚染、リソース枯渇攻撃を防ぐことができます。

覚えておいてください：セキュリティは一度きりの努力ではなく、継続的なプロセスです。安全なアプリケーションを維持するには、定期的なレビューと更新が不可欠です。

## 参考資料

- [OWASP入力検証チートシート](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Socket.ioセキュリティベストプラクティス](https://socket.io/docs/v4/security/)
- [Redisセキュリティ](https://redis.io/docs/management/security/)
- [Node.jsセキュリティベストプラクティス](https://nodejs.org/en/docs/guides/security/)