#!/bin/bash
set -e

echo "Setting up MongoDB directories..."

# /tmp는 일반적으로 쓰기 가능하므로 여기에 데이터 저장
mkdir -p /tmp/mongodb-data /tmp/mongodb-configdb
chown -R mongodb:mongodb /tmp/mongodb-data /tmp/mongodb-configdb 2>/dev/null || true

# 심볼릭 링크 생성 시도 (실패해도 계속 진행)
ln -sf /tmp/mongodb-data /data/db 2>/dev/null || true
ln -sf /tmp/mongodb-configdb /data/configdb 2>/dev/null || true

# MongoDB 공식 entrypoint 실행
exec docker-entrypoint.sh "$@"

