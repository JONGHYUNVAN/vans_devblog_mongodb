# MongoDB 8.0 최신 안정 버전
FROM mongo:8.0

# 메타데이터
LABEL maintainer="VNAS DevBlog"
LABEL description="MongoDB 8.0 for Cloudtype.io deployment"

# 환경 변수 설정 (Cloudtype에서 덮어쓸 수 있음)
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=changeme
ENV MONGO_INITDB_DATABASE=devblog

# 초기화 스크립트 복사
COPY init-mongo.js /docker-entrypoint-initdb.d/

# MongoDB 데이터 디렉토리 생성 및 권한 설정
RUN mkdir -p /data/db /data/configdb && \
    chown -R mongodb:mongodb /data/db /data/configdb && \
    chmod -R 755 /data/db /data/configdb

# MongoDB 데이터 디렉토리 볼륨 설정
# Cloudtype에서 영구 디스크로 마운트해야 함
VOLUME /data/db
VOLUME /data/configdb

# MongoDB 포트 노출
EXPOSE 27017

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD mongosh --eval "db.adminCommand('ping')" || exit 1

# MongoDB 실행 (모든 IP에서 접속 허용)
# 낮은 메모리 환경을 위한 설정
CMD ["mongod", "--bind_ip_all", "--wiredTigerCacheSizeGB", "0.25"]

