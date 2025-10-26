#!/bin/bash
set -e

# 권한 문제 해결: root로 디렉토리 생성 및 권한 설정
echo "Setting up MongoDB data directories..."
mkdir -p /data/db /data/configdb
chown -R mongodb:mongodb /data/db /data/configdb
chmod -R 755 /data/db /data/configdb

# MongoDB 공식 entrypoint 실행
exec docker-entrypoint.sh "$@"

