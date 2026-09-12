#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="${1:-$PWD/codex-orbit}"
mkdir -p "$PROJECT_DIR"
cp -f package.json .env.example README.md one-liner.html "$PROJECT_DIR/"
mkdir -p "$PROJECT_DIR/src/providers" "$PROJECT_DIR/public" "$PROJECT_DIR/test"
cp -f src/server.js src/orchestrator.js "$PROJECT_DIR/src/"
cp -f src/providers/codex.js "$PROJECT_DIR/src/providers/"
cp -f public/index.html "$PROJECT_DIR/public/"
cp -f test/orchestrator.test.js "$PROJECT_DIR/test/"
cd "$PROJECT_DIR"
command -v node >/dev/null || { echo 'Node.js 20 이상이 필요합니다.'; exit 1; }
node --version
npm install --no-audit --no-fund
echo "설치 완료: $PROJECT_DIR"
echo "실행: cd $PROJECT_DIR && npm start"
