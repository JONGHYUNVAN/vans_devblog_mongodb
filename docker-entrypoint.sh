#!/bin/bash
set -e

# MongoDB 데이터 디렉토리 생성 (권한 변경 없이)
echo "Setting up MongoDB data directories..."
mkdir -p /data/db /data/configdb

# Journal을 tmpfs에 생성 (권한 문제 회피)
mkdir -p /tmp/mongodb-journal
chown -R mongodb:mongodb /tmp/mongodb-journal || true

# MongoDB 공식 entrypoint 실행
exec docker-entrypoint.sh "$@"

