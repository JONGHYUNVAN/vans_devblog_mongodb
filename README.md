# VNAS DevBlog MongoDB 8.0

Cloudtype.io에 MongoDB 8.0 최신 버전을 배포하기 위한 프로젝트입니다.

## 📋 목차

- [개요](#개요)
- [사전 요구사항](#사전-요구사항)
- [배포 방법](#배포-방법)
- [연결 정보](#연결-정보)
- [데이터베이스 구조](#데이터베이스-구조)
- [주의사항](#주의사항)

## 개요

Cloudtype의 기본 MongoDB 템플릿은 구버전만 제공하므로, Dockerfile을 사용하여 MongoDB 8.0을 직접 배포합니다.

### 주요 특징

- MongoDB 8.0 최신 안정 버전
- 자동 데이터베이스 초기화
- 스키마 검증 적용
- 인덱스 자동 생성
- 헬스체크 기능 포함

## 사전 요구사항

- [Cloudtype](https://cloudtype.io) 계정
- GitHub 계정
- Git 설치

## 배포 방법

### 1단계: GitHub 저장소 생성 및 푸시

```bash
# 저장소 초기화
git init

# 파일 추가
git add .

# 커밋
git commit -m "MongoDB 8.0 배포 설정"

# 원격 저장소 연결 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/your-username/vnas-devblog-mongodb.git

# 푸시
git push -u origin main
```

### 2단계: Cloudtype에서 배포

1. **Cloudtype 대시보드 접속**
   - https://cloudtype.io 로그인

2. **새 서비스 생성**
   - `+` 버튼 클릭 또는 `Ctrl + K`
   - "GitHub 저장소 배포하기" 선택

3. **저장소 선택**
   - GitHub 연동 (최초 1회)
   - `vnas-devblog-mongodb` 저장소 선택

4. **배포 설정**
   - **서비스명**: `devblog-mongodb`
   - **배포 방식**: Dockerfile (자동 감지됨)
   - **포트**: `27017`

5. **리소스 설정**
   - **CPU**: 0.5~1 코어
   - **메모리**: 512MB~1GB
   - **디스크**: 2GB 이상 권장

6. **환경 변수 설정** (중요!)
   ```
   MONGO_INITDB_ROOT_USERNAME=admin
   MONGO_INITDB_ROOT_PASSWORD=[안전한-비밀번호-입력]
   MONGO_INITDB_DATABASE=devblog
   ```

7. **볼륨 마운트 설정** (필수!)
   - `/data/db` → 영구 디스크에 마운트
   - `/data/configdb` → 영구 디스크에 마운트
   - ⚠️ 이 설정이 없으면 재배포 시 데이터 손실됨!

8. **배포 실행**
   - "배포하기" 버튼 클릭
   - 빌드 및 배포 진행 (3~5분 소요)

### 3단계: 배포 확인

1. **서비스 상태 확인**
   - 서비스 상세 페이지에서 "실행 중" 상태 확인
   - 로그 탭에서 에러 없는지 확인

2. **헬스체크 확인**
   - 헬스체크가 통과하는지 확인 (자동)

## 연결 정보

### 내부 연결 (Cloudtype 프로젝트 내 다른 서비스)

```
mongodb://admin:[password]@devblog-mongodb:27017/devblog?authSource=admin
```

### 외부 연결 (MongoDB Compass 등)

1. **TCP 외부 접속 활성화**
   - 설정 탭 → TCP 외부 접속 허용 활성화

2. **연결 문자열**
   ```
   mongodb://admin:[password]@[외부-호스트]:[포트]/devblog?authSource=admin
   ```

3. **MongoDB Compass 연결**
   - 위 연결 문자열 입력하여 연결

### 애플리케이션에서 연결 예시

#### Node.js (Mongoose)
```javascript
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb://admin:password@devblog-mongodb:27017/devblog?authSource=admin';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));
```

#### Python (PyMongo)
```python
from pymongo import MongoClient
import os

MONGODB_URI = os.getenv('MONGODB_URI', 
  'mongodb://admin:password@devblog-mongodb:27017/devblog?authSource=admin')

client = MongoClient(MONGODB_URI)
db = client.devblog
```

#### Go
```go
import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

uri := os.Getenv("MONGODB_URI")
if uri == "" {
    uri = "mongodb://admin:password@devblog-mongodb:27017/devblog?authSource=admin"
}

client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
```

## 데이터베이스 구조

### 컬렉션

- **posts**: 블로그 게시글
- **users**: 사용자 정보
- **comments**: 댓글
- **categories**: 카테고리

### posts 스키마

```javascript
{
  title: String (필수),
  content: String (필수),
  author: String (필수),
  tags: [String],
  published: Boolean,
  createdAt: Date (필수),
  updatedAt: Date
}
```

### users 스키마

```javascript
{
  username: String (필수, 고유),
  email: String (필수, 고유),
  role: Enum['admin', 'editor', 'viewer'],
  createdAt: Date (필수)
}
```

### 인덱스

- posts: 전문 검색, 생성일 역순, 작성자, 태그
- users: 사용자명, 이메일 (고유)
- comments: 게시글ID + 생성일
- categories: 이름 (고유)

## 주의사항

### ⚠️ 데이터 영속성

Cloudtype의 데이터베이스는 매니지드 서비스가 아니므로:

- **반드시 영구 디스크 마운트 필요** (`/data/db`, `/data/configdb`)
- 정기적인 수동 백업 권장
- 재배포 전 데이터 백업 필수

### 💾 백업 방법

#### mongodump로 백업
```bash
# Cloudtype 터미널 또는 외부에서 실행
mongodump --uri="mongodb://admin:password@host:port/devblog?authSource=admin" --out=/backup
```

#### mongorestore로 복구
```bash
mongorestore --uri="mongodb://admin:password@host:port/devblog?authSource=admin" /backup/devblog
```

### 🔒 보안

- **비밀번호 관리**: 강력한 비밀번호 사용
- **외부 접속**: 개발 중에만 활성화, 프로덕션에서는 비활성화 권장
- **방화벽**: 필요한 IP만 허용

### 📊 리소스 모니터링

- Cloudtype 대시보드에서 CPU/메모리 사용률 확인
- 부하가 높으면 리소스 증설
- 디스크 용량 정기 확인

## 프로덕션 배포 시 권장사항

프로덕션 환경에서는 다음을 고려하세요:

1. **MongoDB Atlas 사용 권장**
   - 자동 백업
   - 고가용성 (Replica Set)
   - 자동 스케일링
   - 무료 티어: 512MB

2. **대안 서비스**
   - AWS DocumentDB
   - Azure Cosmos DB
   - Google Cloud Firestore

## 문제 해결

### 연결 실패
- 환경 변수 확인
- 서비스 실행 상태 확인
- 로그에서 에러 메시지 확인

### 데이터 손실
- 볼륨 마운트 설정 확인
- 백업 복구 실행

### 성능 저하
- 리소스 사용률 확인
- 인덱스 최적화
- 쿼리 최적화

## 참고 자료

- [MongoDB 8.0 공식 문서](https://www.mongodb.com/docs/manual/)
- [Cloudtype 문서](https://docs.cloudtype.io)
- [Docker Hub - MongoDB](https://hub.docker.com/_/mongo)

## 라이선스

MIT License

## 문의

이슈가 있으면 GitHub Issues를 통해 문의해주세요.

